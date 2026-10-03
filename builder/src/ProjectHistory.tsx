import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import type { Project } from '../shared/types';
import type { DraftRecord, RevisionSummary } from '../shared/storage';

function Overlay({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const restoreFrame = useRef<number | undefined>(undefined);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    if (restoreFrame.current !== undefined) cancelAnimationFrame(restoreFrame.current);
    returnFocus.current ??= document.activeElement as HTMLElement | null;
    const surface = ref.current; surface?.querySelector<HTMLElement>('button,input')?.focus();
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeRef.current(); }
      if (event.key !== 'Tab' || !surface) return;
      const controls = [...surface.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(node => node.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (!first) { event.preventDefault(); surface.focus(); return; }
      if (!surface.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handle, true);
    return () => {
      document.removeEventListener('keydown', handle, true);
      restoreFrame.current = requestAnimationFrame(() => {
        if (!surface?.isConnected && returnFocus.current?.isConnected) returnFocus.current.focus();
      });
    };
  }, []);
  return <div className="history-backdrop"><section ref={ref} className="history-panel" role="dialog" aria-modal="true" aria-labelledby="history-title" tabIndex={-1}>
    <div className="history-heading"><div><span className="eyebrow">WORKSPACE</span><h2 id="history-title">{title}</h2></div><button className="icon-button" aria-label="关闭面板" onClick={onClose}><X size={18}/></button></div>{children}
  </section></div>;
}

export function ProjectHistory({ projectId, onClose, onSave, onRestore }: { projectId: string; onClose: () => void; onSave: (label: string) => Promise<void>; onRestore: (project: Project, revision: number) => Promise<void> }) {
  const [revisions, setRevisions] = useState<RevisionSummary[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const load = async (before?: number) => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/revisions${before ? `?before=${before}` : ''}`);
      const value = await response.json(); if (!response.ok) throw new Error(value.error ?? '历史读取失败');
      setRevisions(current => before ? [...current, ...value.revisions] : value.revisions); setHasMore(value.hasMore);
    } catch (error) { setError(error instanceof Error ? error.message : '读取失败'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [projectId]);
  const save = async () => { setLoading(true); setError(''); try { await onSave(label.trim()); setLabel(''); await load(); } catch (error) { setError(error instanceof Error ? error.message : '保存失败'); } finally { setLoading(false); } };
  const restore = async (id: number) => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/revisions/${id}`);
      const value = await response.json(); if (!response.ok) throw new Error(value.error ?? '版本读取失败');
      await onRestore(value.revision.project, id); await load();
    } catch (error) { setError(error instanceof Error ? error.message : '恢复失败'); }
    finally { setLoading(false); }
  };
  return <Overlay title="版本历史" onClose={onClose}>
    <p className="history-description">保存一个节点，随时回到当时的设计。恢复前会保存当前修改。</p>
    <form className="checkpoint-form" onSubmit={event => { event.preventDefault(); void save(); }}><label>版本名称<input aria-label="版本名称" maxLength={100} value={label} onChange={event => setLabel(event.target.value)} placeholder="例如：登录页完成" /></label><button className="button button-primary" disabled={loading}><Save size={15}/>保存检查点</button></form>
    {error && <p className="sync-error" role="alert">{error}</p>}
    <div className="revision-list" aria-busy={loading}>{revisions.map(revision => <article key={revision.id}><div><strong>{revision.label || ({ auto: '自动保存', manual: '手动检查点', restore: '恢复版本' }[revision.kind])}</strong><span>版本 {revision.saveVersion} · {new Date(revision.createdAt).toLocaleString('zh-CN')}</span></div><button className="button button-subtle" disabled={loading} onClick={() => void restore(revision.id)}><RotateCcw size={14}/>恢复</button></article>)}{!revisions.length && <p>{loading ? '正在读取历史…' : '还没有保存版本。创建第一个检查点。'}</p>}</div>
    {hasMore && <button className="button button-subtle history-more" disabled={loading} onClick={() => void load(revisions.at(-1)?.id)}>加载更早的 30 个版本</button>}
  </Overlay>;
}

export function RecoveryPanel({ drafts, onClose, onRecover, onSaved }: { drafts: DraftRecord[]; onClose: () => void; onRecover: (draft: DraftRecord, asNew: boolean) => Promise<void>; onSaved: () => Promise<void> }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const act = async (operation: () => Promise<void>) => { setBusy(true); setError(''); try { await operation(); onClose(); } catch (error) { setError(error instanceof Error ? error.message : '恢复失败'); } finally { setBusy(false); } };
  return <Overlay title="恢复 SQLite 草稿" onClose={onClose}>
    <p className="history-description">这些内容已保存在本机工作区。过期草稿不会自动覆盖项目；可以另存为新项目。</p>
    {error && <p className="sync-error" role="alert">{error}</p>}
    <button className="button button-subtle" disabled={busy} onClick={() => void act(onSaved)}>使用当前项目已保存版本</button>
    <div className="recovery-list">{drafts.map(draft => <article key={draft.draftId}><strong>{draft.project.name}</strong><span>{new Date(draft.updatedAt).toLocaleString('zh-CN')} · 基准版本 {draft.baseVersion}</span><div><button className="button button-subtle" disabled={busy} onClick={() => void act(() => onRecover(draft, false))}>恢复草稿</button><button className="button button-primary" disabled={busy} onClick={() => void act(() => onRecover(draft, true))}>另存为新项目</button></div></article>)}{!drafts.length && <p>暂无其他会话草稿。当前修改会先同步到 SQLite，再载入版本。</p>}</div>
  </Overlay>;
}
