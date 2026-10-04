import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { Project } from '../shared/types';

type Theme = Project['theme'];
type Source = 'blank' | 'example';
type Action = 'create' | 'switch' | 'copy' | null;

export interface ProjectManagerProps {
  current: Project;
  disabled?: boolean;
  onList: () => Promise<Project[]>;
  onCreate: (name: string, theme: Theme, source: Source) => Promise<void>;
  onSwitch: (id: string) => Promise<void>;
  onCopy: (name: string) => Promise<void>;
  onClose: () => void;
}

const themeNames: Record<Theme, string> = {
  nordic: '北欧清简',
  editorial: '纸感编辑',
  dark: '夜间模式',
};

const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;
const copyNameFor = (name: string) => `${name.slice(0, 90)} · 副本`;

export function ProjectManager({ current, disabled = false, onList, onCreate, onSwitch, onCopy, onClose }: ProjectManagerProps) {
  const [view, setView] = useState<'create' | 'list'>('create');
  const [name, setName] = useState('');
  const [theme, setTheme] = useState<Theme>(current.theme);
  const [source, setSource] = useState<Source>('blank');
  const [copyName, setCopyName] = useState(() => copyNameFor(current.name));
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [busy, setBusy] = useState<Action>(null);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  const isBusyRef = useRef(false);
  const mountedRef = useRef(false);
  const onListRef = useRef(onList);
  closeRef.current = onClose;
  isBusyRef.current = busy !== null;
  onListRef.current = onList;

  const refreshProjects = async () => {
    setLoadingList(true);
    setError('');
    try {
      const result = await onListRef.current();
      if (mountedRef.current) setProjects(result);
    } catch (cause) {
      if (mountedRef.current) setError(errorMessage(cause, '读取项目失败，请稍后重试。'));
    } finally {
      if (mountedRef.current) setLoadingList(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => { void refreshProjects(); }, []);

  useEffect(() => {
    returnFocusRef.current ??= document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    nameRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (!isBusyRef.current) closeRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
      )].filter(item => !item.hasAttribute('hidden') && item.getAttribute('aria-hidden') !== 'true' && item.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      requestAnimationFrame(() => {
        if (!dialog?.isConnected && returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
      });
    };
  }, []);

  const perform = async (action: Exclude<Action, null>, operation: () => Promise<void>) => {
    if (disabled || isBusyRef.current) return;
    isBusyRef.current = true;
    setBusy(action);
    setError('');
    try {
      await operation();
      if (mountedRef.current) closeRef.current();
    } catch (cause) {
      if (mountedRef.current) setError(errorMessage(cause, '操作失败，请稍后重试。'));
    } finally {
      isBusyRef.current = false;
      if (mountedRef.current) setBusy(null);
    }
  };

  const createProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('请填写项目名称。');
      nameRef.current?.focus();
      return;
    }
    void perform('create', () => onCreate(trimmed, theme, source));
  };

  const switchProject = (projectId: string) => {
    if (projectId === current.id) return;
    void perform('switch', () => onSwitch(projectId));
  };

  const copyProject = () => {
    const trimmed = copyName.trim();
    if (!trimmed) {
      setError('请填写副本名称。');
      return;
    }
    void perform('copy', () => onCopy(trimmed));
  };

  const onDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.target instanceof HTMLElement && event.target.getAttribute('role') === 'tab' && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      const tabs = [...(dialogRef.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])];
      const currentIndex = tabs.indexOf(event.target);
      if (tabs.length && currentIndex !== -1) {
        event.preventDefault();
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        const nextTab = tabs[nextIndex]!;
        nextTab.focus();
        setView(nextTab.id === 'pm-tab-list' ? 'list' : 'create');
        setError('');
      }
    }
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement && event.target.type === 'search') {
      event.preventDefault();
    }
  };

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const listedProjects = projects.some(project => project.id === current.id)
    ? projects.map(project => project.id === current.id ? { ...project, name: current.name } : project)
    : [current, ...projects];
  const filteredProjects = listedProjects.filter(project => `${project.name} ${project.id}`.toLocaleLowerCase().includes(normalizedQuery));

  return <div className="pm-backdrop">
    <section ref={dialogRef} className="pm-dialog" role="dialog" aria-modal="true" aria-labelledby="pm-title" tabIndex={-1} onKeyDown={onDialogKeyDown}>
      <aside className="pm-aside" aria-label="当前项目">
        <div className="pm-brand"><span className="pm-brand-mark" aria-hidden="true">A</span><span>ATELIER <small>BUILDER</small></span></div>
        <div className="pm-current">
          <span className="pm-eyebrow">正在编辑</span>
          <div className="pm-current-name">{current.name}</div>
          <div className="pm-current-meta"><span className="pm-current-dot" />当前项目 <span aria-hidden="true">·</span> {themeNames[current.theme]}</div>
        </div>
        <div className="pm-aside-divider" />
        <div className="pm-copy-block">
          <span className="pm-eyebrow">另存一份</span>
          <p>保留当前设计，再从副本继续探索。</p>
          <label className="pm-label" htmlFor="pm-copy-name">副本名称</label>
          <input id="pm-copy-name" className="pm-input" value={copyName} maxLength={100} onChange={event => setCopyName(event.target.value)} />
          <button className="pm-button pm-button-secondary pm-copy-button" type="button" disabled={disabled || busy !== null} onClick={copyProject}>
            {busy === 'copy' ? '正在复制…' : '复制当前项目'}
          </button>
        </div>
        <div className="pm-aside-foot">设计保存在本地工作区</div>
      </aside>

      <div className="pm-content">
        <header className="pm-header">
          <div><span className="pm-eyebrow">项目空间</span><h1 id="pm-title">管理项目</h1></div>
          <button className="pm-close" type="button" aria-label="关闭项目管理" disabled={busy !== null} onClick={onClose}>×</button>
        </header>

        <div className="pm-tabs" role="tablist" aria-label="项目管理操作">
          <button className="pm-tab" type="button" role="tab" id="pm-tab-create" tabIndex={view === 'create' ? 0 : -1} aria-selected={view === 'create'} aria-controls="pm-panel-create" onClick={() => { setView('create'); setError(''); }}>新建项目</button>
          <button className="pm-tab" type="button" role="tab" id="pm-tab-list" tabIndex={view === 'list' ? 0 : -1} aria-selected={view === 'list'} aria-controls="pm-panel-list" onClick={() => { setView('list'); setError(''); }}>项目列表</button>
        </div>

        {error && <p className="pm-error" role="alert">{error}</p>}

        {view === 'create' ? <section className="pm-panel" role="tabpanel" id="pm-panel-create" aria-labelledby="pm-tab-create">
          <div className="pm-section-heading"><span className="pm-step">01</span><div><h2>从一个新项目开始</h2><p>先命名，再选一套适合的画布风格。</p></div></div>
          <form className="pm-form" onSubmit={createProject}>
            <label className="pm-field" htmlFor="pm-project-name"><span className="pm-label">项目名称</span><input ref={nameRef} id="pm-project-name" className="pm-input" value={name} onChange={event => setName(event.target.value)} maxLength={100} placeholder="例如：周末旅行计划" required /></label>
            <label className="pm-field" htmlFor="pm-project-theme"><span className="pm-label">画布风格</span><select id="pm-project-theme" className="pm-input pm-select" value={theme} onChange={event => setTheme(event.target.value as Theme)}><option value="nordic">北欧清简</option><option value="editorial">纸感编辑</option><option value="dark">夜间模式</option></select></label>
            <fieldset className="pm-source-fieldset"><legend className="pm-label">开始方式</legend><div className="pm-source-options">
              <label className={`pm-source-card${source === 'blank' ? ' is-selected' : ''}`}><input type="radio" name="pm-source" value="blank" checked={source === 'blank'} onChange={() => setSource('blank')} /><span className="pm-source-icon pm-blank-icon" aria-hidden="true"><i /></span><span className="pm-source-copy"><strong>空白画布</strong><small>从头搭建自己的设计</small></span><span className="pm-radio-mark" aria-hidden="true" /></label>
              <label className={`pm-source-card${source === 'example' ? ' is-selected' : ''}`}><input type="radio" name="pm-source" value="example" checked={source === 'example'} onChange={() => setSource('example')} /><span className="pm-source-icon pm-example-icon" aria-hidden="true"><i /><i /><i /></span><span className="pm-source-copy"><strong>示例项目</strong><small>载入示例页面与组件</small></span><span className="pm-radio-mark" aria-hidden="true" /></label>
            </div></fieldset>
            <div className="pm-form-footer"><span>稍后仍可调整主题与页面内容。</span><button className="pm-button pm-button-primary" type="submit" disabled={disabled || busy !== null}>{busy === 'create' ? '正在创建…' : '创建项目'}<span aria-hidden="true">↗</span></button></div>
          </form>
        </section> : <section className="pm-panel pm-list-panel" role="tabpanel" id="pm-panel-list" aria-labelledby="pm-tab-list">
          <div className="pm-section-heading"><span className="pm-step">02</span><div><h2>找到你的项目</h2><p>选择一个项目继续设计。</p></div></div>
          <div className="pm-list-tools"><label className="pm-search-wrap"><span className="pm-search-glyph" aria-hidden="true" /><input className="pm-input pm-search" type="search" aria-label="搜索项目" placeholder="搜索项目名称" value={query} onChange={event => setQuery(event.target.value)} /></label><button className="pm-refresh" type="button" disabled={loadingList || busy !== null} onClick={() => void refreshProjects()}>{loadingList ? '读取中…' : '刷新'}</button></div>
          <div className="pm-project-list" aria-busy={loadingList}>
            {filteredProjects.map(project => <article className={`pm-project-row${project.id === current.id ? ' is-current' : ''}`} key={project.id}>
              <span className={`pm-project-swatch pm-swatch-${project.theme}`} aria-hidden="true"><i /><i /><i /></span>
              <div className="pm-project-info"><strong>{project.name}</strong><span>{themeNames[project.theme]} <span aria-hidden="true">·</span> {project.pages.length} 个页面</span></div>
              {project.id === current.id ? <span className="pm-current-badge">当前项目</span> : <button className="pm-open-project" type="button" disabled={disabled || busy !== null} onClick={() => switchProject(project.id)}>{busy === 'switch' ? '正在切换…' : '打开'}<span aria-hidden="true">→</span></button>}
            </article>)}
            {!loadingList && filteredProjects.length === 0 && <div className="pm-empty"><span className="pm-empty-mark" aria-hidden="true">⌕</span><strong>{normalizedQuery ? '没有找到匹配项目' : '这里还没有其他项目'}</strong><p>{normalizedQuery ? '换个关键词再试试。' : '新建项目后，它会出现在这里。'}</p></div>}
            {loadingList && projects.length === 0 && <p className="pm-list-loading">正在读取项目…</p>}
          </div>
        </section>}
      </div>
    </section>
  </div>;
}
