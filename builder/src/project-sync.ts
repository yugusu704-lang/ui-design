import type { Project } from '../shared/types';
import { validateProject } from '../shared/model';
import type { DraftRecord, ProjectEnvelope, SaveKind, SaveReceipt } from '../shared/storage';

export interface SyncState {
  online: boolean; initialized: boolean; phase: 'loading' | 'memory' | 'draft' | 'saving' | 'saved' | 'offline' | 'conflict';
  saveVersion: number; memoryOnly: boolean; pendingCount: number; error?: string; savedAt?: string;
}
interface Options {
  fetch?: (url: string, init?: RequestInit) => Promise<Response>; clientId: string; auto?: boolean;
  onProject?: (project: Project) => void; onState?: (state: SyncState) => void; onRecovery?: (drafts: DraftRecord[]) => void;
}
interface Intent { project: Project; editSeq: number; kind: SaveKind; label?: string; synced: Promise<void>; resolve: () => void; reject: (reason: Error) => void; }
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
const snapshot = (project: Project) => canonical(project);
class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }

/** Content stays in memory until SQLite acknowledges it. No browser content cache. */
export class ProjectSync {
  private current: Project;
  private version = 0;
  private published = '';
  private seq = 0;
  private durableSeq = -1;
  private draftId = crypto.randomUUID();
  private draftBases = new Map<number, number>([[0, 0]]);
  private online = false;
  private initialized = false;
  private conflicted = false;
  private disposed = false;
  private savedAt?: string;
  private error?: string;
  private queue: Intent[] = [];
  private autoIntent?: Intent;
  private active?: { intent: Intent; body: Record<string, unknown> };
  private running = false;
  private draftChain = Promise.resolve();
  private draftTimer?: ReturnType<typeof setTimeout>;
  private autoTimer?: ReturnType<typeof setTimeout>;
  private reconnectTimer?: ReturnType<typeof setInterval>;
  private lastDraft = 0;
  private lastAuto = 0;
  private waiters = new Map<ReturnType<typeof setTimeout>, () => void>();
  private fetcher: NonNullable<Options['fetch']>;
  constructor(project: Project, private options: Options) { this.current = validateProject(project); this.fetcher = options.fetch ?? ((url, init) => fetch(url, init)); }
  get state(): SyncState {
    const pendingCount = this.queue.length + Number(Boolean(this.active)) + Number(Boolean(this.autoIntent));
    const phase = !this.initialized ? 'loading' : !this.online ? 'offline' : this.conflicted ? 'conflict' : pendingCount ? 'saving' : snapshot(this.current) === this.published ? 'saved' : this.seq <= this.durableSeq ? 'draft' : 'memory';
    return { online: this.online, initialized: this.initialized, phase, saveVersion: this.version, memoryOnly: this.seq > this.durableSeq, pendingCount, error: this.error, savedAt: this.savedAt };
  }
  private emit() { if (!this.disposed) this.options.onState?.(this.state); }
  private async api<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await this.fetcher(url, init); const value = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(typeof value.error === 'string' ? value.error : '本地服务请求失败', response.status);
    return value as T;
  }
  private write(method: string, body: unknown): RequestInit { return { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) }; }
  private pause(message: string) {
    this.conflicted = true; this.error = message; this.autoIntent?.resolve(); this.autoIntent = undefined;
    for (const intent of this.queue.splice(0)) intent.reject(new Error(message)); this.emit();
  }
  async start(): Promise<void> {
    try {
      await this.api('/api/health');
      const { requests } = await this.api<{ requests: SaveReceipt[] }>(`/api/save-requests?clientId=${encodeURIComponent(this.options.clientId)}&pending=true`);
      for (let receipt of requests) while (receipt.status === 'pending' && !this.disposed) {
        await this.delay(300); receipt = await this.api<SaveReceipt>(`/api/save-requests/${encodeURIComponent(receipt.requestId)}?clientId=${encodeURIComponent(this.options.clientId)}`);
      }
      const projects = await this.api<Project[]>('/api/projects');
      if (!this.seq && projects.length) {
        const envelope = await this.api<ProjectEnvelope>(`/api/projects/${encodeURIComponent(projects[0]!.id)}`);
        this.current = validateProject(envelope.project); this.version = envelope.saveVersion; this.published = snapshot(this.current); this.savedAt = envelope.updatedAt; this.durableSeq = 0;
        this.draftBases.set(0, this.version); if (!this.disposed) this.options.onProject?.(structuredClone(this.current));
      }
      this.online = true; await this.importLegacy(); await this.refreshRecovery();
    } catch (error) { this.online = false; this.error = error instanceof Error ? error.message : '服务断开'; }
    if (this.disposed) return;
    this.initialized = true; this.emit(); this.reconnectTimer = setInterval(() => { void this.reconnect(); }, 5000);
    if (!this.published && this.online) this.schedule();
  }
  private async importLegacy(): Promise<void> {
    let raw: string | null;
    try { raw = typeof localStorage === 'undefined' ? null : localStorage.getItem('atelier-builder-project-v1'); } catch { return; }
    if (!raw) return;
    let project: Project;
    try { project = validateProject(JSON.parse(raw)); } catch { this.error = '旧浏览器草稿格式无效，原副本已保留'; return; }
    const bytes = new TextEncoder().encode(`${this.options.clientId}:${snapshot(project)}`);
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(value => value.toString(16).padStart(2, '0')).join('');
    const legacyId = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    await this.api(`/api/drafts/${legacyId}`, this.write('PUT', { project, clientId: this.options.clientId, baseVersion: 0, editSeq: 1 }));
    try { if (localStorage.getItem('atelier-builder-project-v1') === raw) localStorage.removeItem('atelier-builder-project-v1'); } catch { /* SQL copy was confirmed. */ }
  }
  async refreshRecovery(): Promise<DraftRecord[]> {
    const { drafts } = await this.api<{ drafts: DraftRecord[] }>(`/api/drafts?clientId=${encodeURIComponent(this.options.clientId)}`);
    const recoverable = drafts.filter(item => !item.archived && item.draftId !== this.draftId && !(item.projectId === this.current.id && snapshot(item.project) === this.published));
    this.options.onRecovery?.(recoverable); return recoverable;
  }
  edit(project: Project): void {
    if (snapshot(project) === snapshot(this.current)) return;
    this.autoIntent?.resolve(); this.autoIntent = undefined;
    this.current = validateProject(project); this.seq++; this.draftBases.set(this.seq, this.version); this.emit(); this.schedule();
  }
  private schedule() {
    clearTimeout(this.draftTimer); clearTimeout(this.autoTimer);
    if (!this.initialized || this.disposed) return;
    this.draftTimer = setTimeout(() => { void this.flush().catch(() => {}); }, Math.max(500, 1000 - (Date.now() - this.lastDraft)));
    if (this.options.auto !== false && !this.conflicted) this.autoTimer = setTimeout(() => {
      if (snapshot(this.current) === this.published) return;
      const intent: Intent = { project: structuredClone(this.current), editSeq: this.seq, kind: 'auto', synced: this.flush(), resolve: () => {}, reject: () => {} };
      intent.synced.catch(() => {}); this.autoIntent = intent; this.emit(); void this.pump();
    }, Math.max(1500, 10_000 - (Date.now() - this.lastAuto)));
  }
  async flush(project = this.current, editSeq = this.seq, retry = false): Promise<void> {
    const frozen = structuredClone(project), baseVersion = this.draftBases.get(editSeq) ?? this.version, draftId = this.draftId;
    const operation = this.draftChain.catch(() => {}).then(async () => {
      let attempt = 0;
      while (!this.disposed) {
        try { await this.api(`/api/drafts/${draftId}`, this.write('PUT', { project: frozen, clientId: this.options.clientId, baseVersion, editSeq: editSeq + 1 })); break; }
        catch (error) {
          if (!retry || error instanceof ApiError && error.status < 500) throw error;
          this.online = false; this.error = '手动快照在内存中等待连接，关闭页面前请重连'; this.emit();
          await this.delay([2000, 5000, 15000, 30000][Math.min(attempt++, 3)]!);
        }
      }
      if (this.disposed) throw new Error('编辑器已关闭');
      if (draftId === this.draftId) this.durableSeq = Math.max(this.durableSeq, editSeq);
      this.lastDraft = Date.now(); this.online = true; this.emit();
    }).catch(error => { if (!(error instanceof ApiError && error.status === 409)) this.online = false; this.error = error.message; this.emit(); throw error; });
    this.draftChain = operation; return operation;
  }
  async manual(project = this.current, label?: string, kind: SaveKind = 'manual'): Promise<void> {
    this.edit(project);
    if (!this.initialized) throw new Error('正在连接本地工作区，请稍后保存');
    if (this.conflicted) throw new Error('版本冲突：请先恢复或另存项目');
    clearTimeout(this.autoTimer); this.autoIntent?.resolve(); this.autoIntent = undefined;
    const frozen = structuredClone(project), editSeq = this.seq; const synced = this.flush(frozen, editSeq, true); synced.catch(() => {});
    const result = new Promise<void>((resolve, reject) => { this.queue.push({ project: frozen, editSeq, kind, label, synced, resolve, reject }); });
    this.emit(); void this.pump(); return result;
  }
  private async pump(): Promise<void> {
    if (this.running || this.conflicted || this.disposed || !this.initialized) return;
    this.running = true;
    try {
      while (!this.disposed && !this.conflicted && (this.queue.length || this.autoIntent)) {
        const intent = this.queue.shift() ?? this.autoIntent!; if (intent === this.autoIntent) this.autoIntent = undefined;
        const body = { project: intent.project, clientId: this.options.clientId, baseVersion: this.version, kind: intent.kind, label: intent.label, requestId: crypto.randomUUID(), draftId: this.draftId, editSeq: intent.editSeq + 1 };
        this.active = { intent, body }; this.emit();
        try {
          await intent.synced; const receipt = await this.send(body);
          if (receipt.status !== 'completed' || receipt.saveVersion === undefined) throw new Error('保存尚未完成');
          this.version = receipt.saveVersion; this.savedAt = receipt.updatedAt; this.published = snapshot(intent.project); this.online = true; this.error = undefined;
          if (intent.kind === 'auto') this.lastAuto = Date.now(); intent.resolve();
        } catch (error) {
          intent.reject(error instanceof Error ? error : new Error('保存失败'));
          if (error instanceof ApiError && [409, 428].includes(error.status)) this.pause(error.message);
          else { this.online = false; this.error = error instanceof Error ? error.message : '服务断开'; }
        } finally { this.active = undefined; this.emit(); }
      }
    } finally { this.running = false; this.emit(); }
  }
  private async send(body: Record<string, unknown>): Promise<SaveReceipt> {
    const waits = [2000, 5000, 15000, 30000]; let attempt = 0;
    while (!this.disposed) {
      try {
        const receipt = await this.api<SaveReceipt>('/api/projects', this.write('POST', body));
        if (receipt.status === 'conflict') throw new ApiError(receipt.error ?? '版本冲突', 409);
        if (receipt.status === 'pending') { await this.delay(300); continue; } return receipt;
      } catch (error) {
        if (error instanceof ApiError && error.status < 500) throw error;
        this.online = false; this.error = '保存结果待确认，重连后使用相同请求编号重试'; this.emit(); await this.delay(waits[Math.min(attempt++, waits.length - 1)]!);
      }
    }
    throw new Error('编辑器已关闭');
  }
  private delay(ms: number): Promise<void> { return new Promise(resolve => { const timer = setTimeout(() => { this.waiters.delete(timer); resolve(); }, ms); this.waiters.set(timer, resolve); }); }
  async reconnect(): Promise<void> {
    if (this.online || this.disposed || !this.initialized) return;
    try {
      await this.api('/api/health'); if (this.active) return;
      const response = await this.fetcher(`/api/projects/${encodeURIComponent(this.current.id)}`);
      if (response.ok) { const envelope = await response.json() as ProjectEnvelope; if (envelope.saveVersion !== this.version) this.pause('其他会话已保存新版本，请选择恢复草稿、使用已保存版本或另存'); }
      else if (response.status !== 404) throw new Error('项目协调失败');
      this.online = true; await this.importLegacy(); await this.flush(); await this.refreshRecovery(); if (!this.conflicted) this.schedule(); this.emit();
    } catch { this.online = false; this.emit(); }
  }
  async useSaved(): Promise<Project> {
    const generation = await this.preserve(); const envelope = await this.api<ProjectEnvelope>(`/api/projects/${encodeURIComponent(this.current.id)}`);
    this.assertGeneration(generation);
    this.replace(envelope.project, envelope.saveVersion, envelope.updatedAt); return this.current;
  }
  async recover(draft: DraftRecord, asNew = false): Promise<Project> {
    const generation = await this.preserve(); let project = validateProject(draft.project); let version = draft.baseVersion;
    if (asNew) { project = { ...project, id: crypto.randomUUID(), name: `${project.name.slice(0, 90)} · 副本` }; version = 0; }
    let stale = false;
    if (!asNew) { const response = await this.fetcher(`/api/projects/${encodeURIComponent(project.id)}`); if (response.ok) { const envelope = await response.json() as ProjectEnvelope; stale = envelope.saveVersion !== version; } else if (response.status !== 404) throw new Error('草稿基准版本协调失败'); }
    this.assertGeneration(generation); this.replace(project, version); this.conflicted = stale; await this.flush(); this.schedule(); this.emit(); return this.current;
  }
  async copyCurrent(): Promise<Project> {
    await this.preserve(); this.replace({ ...this.current, id: crypto.randomUUID(), name: `${this.current.name.slice(0, 90)} · 副本` }, 0); await this.flush(); this.schedule(); return this.current;
  }
  private async preserve() { const generation = { seq: this.seq, draftId: this.draftId }; await this.flush(); this.assertIdle(); this.assertGeneration(generation); return generation; }
  private assertGeneration(generation: { seq: number; draftId: string }) { if (generation.seq !== this.seq || generation.draftId !== this.draftId) throw new Error('载入期间有新的修改，请等待草稿同步后重试'); }
  private replace(project: Project, version: number, updatedAt?: string) {
    clearTimeout(this.draftTimer); clearTimeout(this.autoTimer); this.autoIntent?.resolve(); this.autoIntent = undefined;
    this.current = validateProject(project); this.version = version; this.published = updatedAt ? snapshot(project) : ''; this.savedAt = updatedAt;
    this.seq = 0; this.durableSeq = updatedAt ? 0 : -1; this.draftId = crypto.randomUUID(); this.draftBases = new Map([[0, version]]); this.conflicted = false; this.error = undefined; this.options.onProject?.(structuredClone(this.current)); this.emit();
  }
  private assertIdle() { if (this.active || this.queue.length || this.autoIntent) throw new Error('请等待当前保存请求完成后再载入版本'); }
  dispose(): void {
    this.disposed = true; clearTimeout(this.draftTimer); clearTimeout(this.autoTimer); clearInterval(this.reconnectTimer);
    for (const [timer, resolve] of this.waiters) { clearTimeout(timer); resolve(); } this.waiters.clear(); for (const intent of this.queue.splice(0)) intent.reject(new Error('编辑器已关闭'));
  }
}
