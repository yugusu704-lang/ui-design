import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { DatabaseSync, backup } from 'node:sqlite';
import path from 'node:path';
import type { DraftRecord, ProjectEnvelope, RevisionSummary, SaveKind, SaveReceipt } from '../shared/storage.ts';
import type { Project } from '../shared/types.ts';

const SCHEMA_VERSION = 1;
const REVISION_PAGE_SIZE = 30;

type SaveInput = {
  project: Project;
  clientId: string;
  baseVersion: number;
  kind: SaveKind;
  label?: string;
  requestId: string;
  draftId?: string;
  editSeq?: number;
};

type DraftInput = {
  draftId: string;
  project: Project;
  clientId: string;
  baseVersion: number;
  editSeq: number;
};

type ProjectRow = { id: string; document: string; updated_at: string; save_version: number };
type RequestRow = {
  request_id: string;
  client_id: string;
  project_id: string;
  request_hash: string;
  status: SaveReceipt['status'];
  document: string;
  save_version: number | null;
  updated_at: string | null;
  error: string | null;
};
type DraftRow = {
  draft_id: string;
  project_id: string;
  client_id: string;
  base_version: number;
  edit_seq: number;
  document: string;
  updated_at: string;
  archived: number;
  saved_version: number | null;
};

export class StorageConflictError extends Error {
  constructor(message: string) { super(message); this.name = 'StorageConflictError'; }
}

export class SqliteStorage {
  readonly database: DatabaseSync;
  readonly workspaceId: string;
  private readonly queueTails = new Map<string, Promise<void>>();

  private constructor(database: DatabaseSync, workspaceId: string) {
    this.database = database;
    this.workspaceId = workspaceId;
  }

  static async open(dataDir: string, workspacePath: string): Promise<SqliteStorage> {
    await mkdir(dataDir, { recursive: true });
    const filename = path.join(dataDir, 'projects.sqlite');
    const hadDatabase = existsSync(filename);
    const database = new DatabaseSync(filename);
    try {
      database.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL; PRAGMA busy_timeout = 5000;');
      const storage = new SqliteStorage(database, createHash('sha256').update(path.resolve(workspacePath)).digest('hex'));
      await storage.migrate(hadDatabase, filename);
      return storage;
    } catch (error) {
      database.close();
      throw error;
    }
  }

  close(): void { this.database.close(); }

  private async migrate(hadDatabase: boolean, filename: string): Promise<void> {
    const version = Number((this.database.prepare('PRAGMA user_version').get() as { user_version: number }).user_version);
    if (version > SCHEMA_VERSION) throw new Error('数据库来自较新的应用版本，请更新编辑器后再打开。');
    if (hadDatabase && version < SCHEMA_VERSION) {
      const backupPath = `${filename}.pre-migration-${Date.now()}-${crypto.randomUUID()}.bak`;
      await backup(this.database, backupPath);
    }

    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.exec(`
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          document TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          save_version INTEGER NOT NULL DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS revisions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id TEXT NOT NULL,
          document TEXT NOT NULL,
          created_at TEXT NOT NULL,
          kind TEXT NOT NULL DEFAULT 'manual',
          label TEXT,
          save_version INTEGER NOT NULL DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS drafts (
          draft_id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          client_id TEXT NOT NULL,
          base_version INTEGER NOT NULL,
          edit_seq INTEGER NOT NULL,
          document TEXT NOT NULL,
          document_hash TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          archived INTEGER NOT NULL DEFAULT 0,
          saved_version INTEGER
        );
        CREATE TABLE IF NOT EXISTS save_requests (
          request_order INTEGER PRIMARY KEY AUTOINCREMENT,
          request_id TEXT NOT NULL UNIQUE,
          client_id TEXT NOT NULL,
          project_id TEXT NOT NULL,
          request_hash TEXT NOT NULL,
          base_version INTEGER NOT NULL,
          kind TEXT NOT NULL,
          label TEXT,
          document TEXT NOT NULL,
          draft_id TEXT,
          edit_seq INTEGER,
          status TEXT NOT NULL CHECK(status IN ('pending','completed','conflict')),
          save_version INTEGER,
          updated_at TEXT,
          error TEXT,
          received_at TEXT NOT NULL,
          processed_at TEXT
        );
        CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
        CREATE INDEX IF NOT EXISTS revisions_project_id ON revisions(project_id, id DESC);
        CREATE INDEX IF NOT EXISTS save_requests_project_queue ON save_requests(project_id, status, request_order);
        CREATE INDEX IF NOT EXISTS save_requests_client_order ON save_requests(client_id, request_order);
        CREATE INDEX IF NOT EXISTS drafts_client_project ON drafts(client_id, project_id, archived, updated_at DESC);
      `);

      const projectColumns = this.columns('projects');
      if (!projectColumns.has('save_version')) this.database.exec('ALTER TABLE projects ADD COLUMN save_version INTEGER NOT NULL DEFAULT 1');
      const revisionColumns = this.columns('revisions');
      const hadRevisionVersion = revisionColumns.has('save_version');
      if (!revisionColumns.has('kind')) this.database.exec("ALTER TABLE revisions ADD COLUMN kind TEXT NOT NULL DEFAULT 'manual'");
      if (!revisionColumns.has('label')) this.database.exec('ALTER TABLE revisions ADD COLUMN label TEXT');
      if (!hadRevisionVersion) this.database.exec('ALTER TABLE revisions ADD COLUMN save_version INTEGER NOT NULL DEFAULT 1');
      if (!hadRevisionVersion) {
        this.database.exec(`
          UPDATE revisions AS r SET save_version = (
            SELECT COUNT(*) FROM revisions prior WHERE prior.project_id = r.project_id AND prior.id <= r.id
          );
          UPDATE projects SET save_version = max(1, (
            SELECT COUNT(*) FROM revisions WHERE revisions.project_id = projects.id
          ));
        `);
      }
      this.database.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  private columns(table: string): Set<string> {
    return new Set((this.database.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map(column => column.name));
  }

  listProjects(): Project[] {
    const rows = this.database.prepare('SELECT document FROM projects ORDER BY updated_at DESC').all() as Array<{ document: string }>;
    return rows.map(row => JSON.parse(row.document) as Project);
  }

  getProject(projectId: string): ProjectEnvelope | undefined {
    const row = this.database.prepare('SELECT id, document, updated_at, save_version FROM projects WHERE id = ?').get(projectId) as ProjectRow | undefined;
    return row ? this.projectEnvelope(row) : undefined;
  }

  async save(input: SaveInput, processPending = true): Promise<SaveReceipt> {
    const document = JSON.stringify(input.project);
    const hash = canonicalHash({
      operation: 'project-save', project: input.project, clientId: input.clientId, baseVersion: input.baseVersion,
      kind: input.kind, label: input.label, document: input.project, draftId: input.draftId, editSeq: input.editSeq,
    });
    let shouldProcess = false;
    this.database.exec('BEGIN IMMEDIATE');
    try {
      this.database.prepare(`
        INSERT OR IGNORE INTO save_requests
          (request_id, client_id, project_id, request_hash, base_version, kind, label, document, draft_id, edit_seq, status, received_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `).run(input.requestId, input.clientId, input.project.id, hash, input.baseVersion, input.kind, input.label ?? null,
        document, input.draftId ?? null, input.editSeq ?? null, new Date().toISOString());
      const row = this.database.prepare('SELECT * FROM save_requests WHERE request_id = ?').get(input.requestId) as RequestRow | undefined;
      if (!row) throw new Error('Could not register save request.');
      if (row.client_id !== input.clientId || row.request_hash !== hash) throw new StorageConflictError('requestId 已用于其他保存请求。');
      shouldProcess = row.status === 'pending';
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }

    if (shouldProcess && processPending) await this.enqueueProject(input.project.id);
    const receipt = this.getSaveRequest(input.requestId, input.clientId);
    if (!receipt) throw new Error('Could not read save receipt.');
    return receipt;
  }

  private enqueueProject(projectId: string): Promise<void> {
    const previous = this.queueTails.get(projectId) ?? Promise.resolve();
    const next = previous.then(() => this.processProjectQueue(projectId));
    this.queueTails.set(projectId, next);
    return next.finally(() => { if (this.queueTails.get(projectId) === next) this.queueTails.delete(projectId); });
  }

  async recoverPending(): Promise<void> {
    const rows = this.database.prepare('SELECT project_id FROM save_requests WHERE status = \'pending\' GROUP BY project_id ORDER BY MIN(request_order)').all() as Array<{ project_id: string }>;
    for (const row of rows) await this.enqueueProject(row.project_id);
  }

  private async processProjectQueue(projectId: string): Promise<void> {
    while (this.processNext(projectId)) { /* Process in durable receive order. */ }
  }

  private processNext(projectId: string): boolean {
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const request = this.database.prepare(`SELECT * FROM save_requests WHERE project_id = ? AND status = 'pending' ORDER BY request_order LIMIT 1`).get(projectId) as (RequestRow & {
        request_order: number; base_version: number; kind: SaveKind; label: string | null; draft_id: string | null; edit_seq: number | null;
      }) | undefined;
      if (!request) { this.database.exec('COMMIT'); return false; }
      const current = this.database.prepare('SELECT id, document, updated_at, save_version FROM projects WHERE id = ?').get(projectId) as ProjectRow | undefined;
      const currentVersion = current?.save_version ?? 0;
      if (currentVersion !== request.base_version) {
        const message = `版本冲突：提交基于版本 ${request.base_version}，当前版本为 ${currentVersion}。`;
        this.database.prepare("UPDATE save_requests SET status = 'conflict', error = ?, processed_at = ? WHERE request_order = ? AND status = 'pending'")
          .run(message, new Date().toISOString(), request.request_order);
        this.database.exec('COMMIT');
        return true;
      }

      const project = JSON.parse(request.document) as Project;
      const now = new Date().toISOString();
      const existingProject = current ? JSON.parse(current.document) as Project : undefined;
      const isAutoNoop = request.kind === 'auto' && existingProject !== undefined
        && canonicalize(existingProject) === canonicalize(project);
      const saveVersion = isAutoNoop ? currentVersion : currentVersion + 1;
      const updatedAt = isAutoNoop ? current!.updated_at : now;
      if (!isAutoNoop) {
        this.database.prepare(`
          INSERT INTO projects(id, document, updated_at, save_version) VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET document=excluded.document, updated_at=excluded.updated_at, save_version=excluded.save_version
        `).run(project.id, request.document, updatedAt, saveVersion);
        this.database.prepare('INSERT INTO revisions(project_id, document, created_at, kind, label, save_version) VALUES (?, ?, ?, ?, ?, ?)')
          .run(project.id, request.document, now, request.kind, request.label, saveVersion);
      }
      this.database.prepare("UPDATE save_requests SET status = 'completed', save_version = ?, updated_at = ?, processed_at = ? WHERE request_order = ? AND status = 'pending'")
        .run(saveVersion, updatedAt, now, request.request_order);
      if (request.draft_id && request.edit_seq !== null) {
        const projectHash = canonicalHash(project);
        this.database.prepare(`
          UPDATE drafts SET saved_version = ?
          WHERE draft_id = ? AND project_id = ? AND client_id = ? AND edit_seq = ? AND document_hash = ?
        `).run(saveVersion, request.draft_id, project.id, request.client_id, request.edit_seq, projectHash);
      }
      this.database.exec('COMMIT');
      return true;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  upsertDraft(input: DraftInput): DraftRecord {
    const document = JSON.stringify(input.project);
    const hash = canonicalHash(input.project);
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const existing = this.database.prepare('SELECT * FROM drafts WHERE draft_id = ?').get(input.draftId) as DraftRow | undefined;
      if (existing) {
        if (existing.client_id !== input.clientId || existing.project_id !== input.project.id) throw new StorageConflictError('draftId 已属于其他客户端或项目。');
        if (input.editSeq < existing.edit_seq) throw new StorageConflictError('草稿序号已过期。');
        if (input.editSeq === existing.edit_seq) {
          const currentHash = (this.database.prepare('SELECT document_hash FROM drafts WHERE draft_id = ?').get(input.draftId) as { document_hash: string }).document_hash;
          if (hash !== currentHash || input.baseVersion !== existing.base_version) throw new StorageConflictError('相同草稿序号不能包含不同内容。');
          const draft = this.draftRecord(existing);
          this.database.exec('COMMIT');
          return draft;
        }
      }
      const now = new Date().toISOString();
      this.database.prepare(`
        INSERT INTO drafts(draft_id, project_id, client_id, base_version, edit_seq, document, document_hash, updated_at, archived, saved_version)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)
        ON CONFLICT(draft_id) DO UPDATE SET base_version=excluded.base_version, edit_seq=excluded.edit_seq,
          document=excluded.document, document_hash=excluded.document_hash, updated_at=excluded.updated_at, archived=0, saved_version=NULL
      `).run(input.draftId, input.project.id, input.clientId, input.baseVersion, input.editSeq, document, hash, now);
      const inserted = this.database.prepare('SELECT * FROM drafts WHERE draft_id = ?').get(input.draftId) as DraftRow;
      const draft = this.draftRecord(inserted);
      this.database.exec('COMMIT');
      return draft;
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  listDrafts(clientId: string, projectId?: string): DraftRecord[] {
    const rows = projectId
      ? this.database.prepare('SELECT * FROM drafts WHERE client_id = ? AND project_id = ? ORDER BY updated_at DESC, draft_id').all(clientId, projectId) as DraftRow[]
      : this.database.prepare('SELECT * FROM drafts WHERE client_id = ? ORDER BY updated_at DESC, draft_id').all(clientId) as DraftRow[];
    return rows.map(row => this.draftRecord(row));
  }

  archiveDraft(draftId: string, clientId: string): DraftRecord | undefined {
    const row = this.database.prepare('SELECT * FROM drafts WHERE draft_id = ?').get(draftId) as DraftRow | undefined;
    if (!row) return undefined;
    if (row.client_id !== clientId) throw new StorageConflictError('无权归档此草稿。');
    this.database.prepare('UPDATE drafts SET archived = 1 WHERE draft_id = ? AND client_id = ?').run(draftId, clientId);
    return this.draftRecord({ ...row, archived: 1 });
  }

  getSaveRequest(requestId: string, clientId?: string): SaveReceipt | undefined {
    const row = clientId
      ? this.database.prepare('SELECT * FROM save_requests WHERE request_id = ? AND client_id = ?').get(requestId, clientId) as RequestRow | undefined
      : this.database.prepare('SELECT * FROM save_requests WHERE request_id = ?').get(requestId) as RequestRow | undefined;
    return row ? this.receipt(row) : undefined;
  }

  listSaveRequests(clientId: string, pendingOnly: boolean): SaveReceipt[] {
    const rows = pendingOnly
      ? this.database.prepare("SELECT * FROM save_requests WHERE client_id = ? AND status = 'pending' ORDER BY request_order").all(clientId) as RequestRow[]
      : this.database.prepare('SELECT * FROM save_requests WHERE client_id = ? ORDER BY request_order').all(clientId) as RequestRow[];
    return rows.map(row => this.receipt(row));
  }

  listRevisions(projectId: string, before?: number): { revisions: RevisionSummary[]; hasMore: boolean } {
    const rows = before === undefined
      ? this.database.prepare('SELECT id, project_id, kind, label, created_at, save_version FROM revisions WHERE project_id = ? ORDER BY id DESC LIMIT ?').all(projectId, REVISION_PAGE_SIZE + 1) as Array<Record<string, unknown>>
      : this.database.prepare('SELECT id, project_id, kind, label, created_at, save_version FROM revisions WHERE project_id = ? AND id < ? ORDER BY id DESC LIMIT ?').all(projectId, before, REVISION_PAGE_SIZE + 1) as Array<Record<string, unknown>>;
    return { revisions: rows.slice(0, REVISION_PAGE_SIZE).map(row => this.revisionSummary(row)), hasMore: rows.length > REVISION_PAGE_SIZE };
  }

  getRevision(projectId: string, revisionId: number): (RevisionSummary & { project: Project }) | undefined {
    const row = this.database.prepare('SELECT id, project_id, document, kind, label, created_at, save_version FROM revisions WHERE project_id = ? AND id = ?').get(projectId, revisionId) as (Record<string, unknown> & { document: string }) | undefined;
    return row ? { ...this.revisionSummary(row), project: JSON.parse(row.document) as Project } : undefined;
  }

  private projectEnvelope(row: ProjectRow): ProjectEnvelope {
    return { project: JSON.parse(row.document) as Project, saveVersion: row.save_version, updatedAt: row.updated_at };
  }

  private draftRecord(row: DraftRow): DraftRecord {
    return {
      draftId: row.draft_id, projectId: row.project_id, clientId: row.client_id, baseVersion: row.base_version,
      editSeq: row.edit_seq, project: JSON.parse(row.document) as Project, updatedAt: row.updated_at,
      archived: Boolean(row.archived), ...(row.saved_version === null ? {} : { savedVersion: row.saved_version }),
    };
  }

  private receipt(row: RequestRow): SaveReceipt {
    return {
      requestId: row.request_id, clientId: row.client_id, projectId: row.project_id, status: row.status,
      ...(row.save_version === null ? {} : { saveVersion: row.save_version }),
      ...(row.updated_at === null ? {} : { updatedAt: row.updated_at }),
      ...(row.status === 'completed' ? { project: JSON.parse(row.document) as Project } : {}),
      ...(row.error === null ? {} : { error: row.error }),
    };
  }

  private revisionSummary(row: Record<string, unknown>): RevisionSummary {
    return {
      id: Number(row.id), projectId: String(row.project_id), kind: row.kind as SaveKind,
      ...(typeof row.label === 'string' ? { label: row.label } : {}),
      createdAt: String(row.created_at), saveVersion: Number(row.save_version),
    };
  }
}

function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object).sort().map(key => `${JSON.stringify(key)}:${canonicalize(object[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function canonicalHash(value: unknown): string {
  return createHash('sha256').update(canonicalize(value)).digest('hex');
}
