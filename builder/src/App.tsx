import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown, ArrowUp, Check, ChevronDown, ChevronRight, CircleHelp, Download, Eye,
  FilePlus2, FolderOpen, Frame, GripVertical, ImagePlus, Layers2, LayoutGrid, Pencil,
  LoaderCircle, MessageSquareText, MoreHorizontal, PanelLeftClose,
  PanelRightClose, Plus, Redo2, Save, Search, Settings2, Sparkles, Trash2,
  Undo2, X,
} from 'lucide-react';
import type { Action, BuilderNode, ComponentType, ModelConfig, Page, Project } from '../shared/types';
import { createNode, findNode, insertNode, moveNode, removeNode, seedProject, updateNode, validateProject } from '../shared/model';
import { Renderer } from './Renderer';
import { DevicePreview } from './DevicePreview';
import './editor.css';

type Panel = 'components' | 'pages' | 'settings' | null;
type Notice = { kind: 'success' | 'error' | 'info'; text: string };

const componentGroups: { title: string; note?: string; items: { type: ComponentType; label: string; hint: string }[] }[] = [
  { title: '布局', items: [
    { type: 'stack', label: '垂直容器', hint: '纵向排列内容' }, { type: 'row', label: '水平容器', hint: '横向排列内容' },
    { type: 'grid', label: '网格容器', hint: '多列内容布局' }, { type: 'card', label: '卡片', hint: '带底色的内容组' }, { type: 'divider', label: '分割线', hint: '轻量内容分隔' },
  ] },
  { title: '内容', items: [
    { type: 'text', label: '文本', hint: '标题、正文或说明' }, { type: 'image', label: '图片', hint: '本地选择一张图片' },
    { type: 'avatar', label: '头像', hint: '人物或图标占位' }, { type: 'badge', label: '标签', hint: '状态与分类标记' },
  ] },
  { title: '操作', items: [
    { type: 'button', label: '按钮', hint: '触发本地模拟动作' },
  ] },
  { title: '表单', items: [
    { type: 'input', label: '单行输入', hint: '文本输入框' },
    { type: 'textarea', label: '多行输入', hint: '较长内容输入框' }, { type: 'checkbox', label: '复选框', hint: '选择一个选项' },
    { type: 'switch', label: '开关', hint: '切换一个状态' }, { type: 'select', label: '下拉选择', hint: '从选项中选择' },
  ] },
  { title: '导航', items: [
    { type: 'navbar', label: '顶部导航', hint: '页面标题与返回操作' }, { type: 'tabs', label: '标签切换', hint: '切换内容分组' },
  ] },
  { title: '反馈与浮层', note: '提示与对话框可通过「操作」组件的动作属性配置。', items: [
    { type: 'empty', label: '空状态', hint: '没有内容时的提示' },
  ] },
  { title: '数据展示', items: [
    { type: 'progress', label: '进度条', hint: '目标完成进度' }, { type: 'stat', label: '数据概览', hint: '数字与变化趋势' },
  ] },
  { title: '业务组合', items: [
    { type: 'task', label: '任务条目', hint: '待办事项展示' }, { type: 'habit', label: '习惯打卡', hint: '习惯记录组件' },
  ] },
];

const typeLabels = Object.fromEntries(componentGroups.flatMap(group => group.items.map(item => [item.type, item.label]))) as Record<ComponentType, string>;
typeLabels.navbar = '顶部导航';
const primaryContent: Partial<Record<ComponentType, string>> = {
  text: 'text', avatar: 'text', badge: 'text', button: 'label', input: 'label', textarea: 'label',
  checkbox: 'label', switch: 'label', select: 'label', progress: 'label', stat: 'label',
  task: 'title', habit: 'title', empty: 'title', navbar: 'title', card: 'title',
};
const palettes: Record<Project['theme'], { label: string; description: string; swatches: string[] }> = {
  nordic: { label: '北欧清简', description: '明亮留白与柔和绿意', swatches: ['#f5f4ee', '#344f42', '#d9e5d8'] },
  editorial: { label: '纸感编辑', description: '温暖纸色与衬线标题', swatches: ['#f3efe6', '#3d3831', '#b86b4c'] },
  dark: { label: '夜间模式', description: '沉静深色与清晰层次', swatches: ['#202522', '#b7d2bd', '#343d37'] },
};
const cacheKey = 'atelier-builder-project-v1';

function newId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)}`;
}

function nodeLabel(node: BuilderNode) {
  const title = node.props.label || node.props.title || node.props.text || node.props.placeholder;
  return typeof title === 'string' && title.trim() ? title : typeLabels[node.type] ?? node.type;
}

function nodeIcon(type: ComponentType) {
  if (['stack', 'row', 'grid', 'card'].includes(type)) return <LayoutGrid size={15} />;
  if (type === 'image') return <ImagePlus size={15} />;
  if (['button', 'input', 'textarea', 'checkbox', 'switch', 'select'].includes(type)) return <Settings2 size={15} />;
  if (['navbar', 'tabs'].includes(type)) return <Layers2 size={15} />;
  return <Frame size={15} />;
}

function readCache(): Project | null {
  try {
    const saved = localStorage.getItem(cacheKey);
    return saved ? validateProject(JSON.parse(saved)) : null;
  } catch { return null; }
}

function flatten(nodes: BuilderNode[], depth = 0, expanded: Record<string, boolean> = {}): { node: BuilderNode; depth: number }[] {
  return nodes.flatMap(node => [{ node, depth }, ...(node.children && expanded[node.id] !== false ? flatten(node.children, depth + 1, expanded) : [])]);
}

function containsNode(root: BuilderNode, id: string): boolean {
  return root.id === id || Boolean(root.children?.some(child => containsNode(child, id)));
}

function clearPageReferences(nodes: BuilderNode[], pageId: string): BuilderNode[] {
  return nodes.map(node => ({
    ...node,
    ...(node.action?.type === 'navigate' && node.action.target === pageId ? { action: undefined } : {}),
    ...(node.action?.type === 'submit' && node.action.target === pageId ? { action: { ...node.action, target: undefined } } : {}),
    ...(node.children ? { children: clearPageReferences(node.children, pageId) } : {}),
  }));
}

export default function App() {
  const startupCache = useRef(readCache());
  const [project, setProject] = useState<Project>(() => startupCache.current ?? seedProject);
  const [history, setHistory] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);
  const [activePageId, setActivePageId] = useState(project.pages[0]?.id ?? '');
  const [renamingPageId, setRenamingPageId] = useState<string>();
  const [pageNameDraft, setPageNameDraft] = useState('');
  const [selectedId, setSelectedId] = useState<string>();
  const [panel, setPanel] = useState<Panel>('components');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<Notice>();
  const [busy, setBusy] = useState<'save' | 'export' | 'ai' | null>(null);
  const [savedAt, setSavedAt] = useState<number>();
  const [cacheAvailable, setCacheAvailable] = useState(true);
  const savedSnapshot = useRef<string | undefined>(undefined);
  const [draft, setDraft] = useState<Project>();
  const [draftPageId, setDraftPageId] = useState<string>();
  const [prompt, setPrompt] = useState('');
  const [aiScope, setAiScope] = useState<'project' | 'page' | 'node'>('page');
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState<ModelConfig>({ baseUrl: '', model: '', apiKey: '' });
  const [hasApiKey, setHasApiKey] = useState(false);
  const [configBusy, setConfigBusy] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [rightTab, setRightTab] = useState<'properties' | 'ai'>('properties');
  const [mobilePanel, setMobilePanel] = useState<'canvas' | 'left' | 'right'>('canvas');
  const fileRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const initialProject = useRef(project);
  const latestProject = useRef(project);
  latestProject.current = project;

  const activePage = project.pages.find(page => page.id === activePageId) ?? project.pages[0];
  const selectedNode = activePage && selectedId ? findNode(activePage.nodes, selectedId) : undefined;
  const tree = useMemo(() => flatten(activePage?.nodes ?? [], 0, expanded), [activePage?.nodes, expanded]);
  const filteredGroups = useMemo(() => componentGroups.map(group => ({
    ...group,
    items: group.items.filter(item => `${item.label} ${item.hint} ${item.type}`.toLowerCase().includes(query.toLowerCase())),
  })).filter(group => group.items.length), [query]);

  const showNotice = useCallback((text: string, kind: Notice['kind'] = 'success') => {
    setNotice({ text, kind });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setNotice(undefined), 3200);
  }, []);

  useEffect(() => {
    if (!project.pages.some(page => page.id === activePageId)) setActivePageId(project.pages[0]?.id ?? '');
    if (selectedId && !project.pages.some(page => findNode(page.nodes, selectedId))) setSelectedId(undefined);
  }, [project, activePageId, selectedId]);

  useEffect(() => {
    try { localStorage.setItem(cacheKey, JSON.stringify(project)); setCacheAvailable(true); }
    catch { setCacheAvailable(false); }
  }, [project]);

  useEffect(() => {
    let alive = true;
    fetch('/api/projects').then(async response => {
      if (!response.ok) throw new Error('项目读取失败');
      return response.json() as Promise<Project[]>;
    }).then(projects => {
      if (!alive || !projects.length) return;
      if (latestProject.current !== initialProject.current) return;
      const restored = startupCache.current ?? validateProject(projects[0]);
      if (projects.some(item => JSON.stringify(item) === JSON.stringify(restored))) savedSnapshot.current = JSON.stringify(restored);
      setProject(restored);
      setActivePageId(restored.pages[0]?.id ?? '');
    }).catch(() => { /* Keep the local draft available while the server is offline. */ });
    fetch('/api/config').then(response => response.ok ? response.json() : null).then(value => {
      if (!alive || !value) return;
      setConfig({ baseUrl: value.baseUrl ?? '', model: value.model ?? '', apiKey: '' });
      setHasApiKey(Boolean(value.hasKey));
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const commit = useCallback((next: Project) => {
    if (draft || busy === 'ai') return;
    setHistory(items => [...items.slice(-39), project]);
    setFuture([]);
    setProject(next);
  }, [project, draft, busy]);

  const patchPage = (patch: Partial<Page>) => {
    if (!activePage || draft || busy === 'ai') return;
    commit({ ...project, pages: project.pages.map(page => page.id === activePage.id ? { ...page, ...patch } : page) });
  };

  const updateSelected = (patch: Partial<BuilderNode>) => {
    if (!activePage || !selectedId || draft || busy === 'ai') return;
    patchPage({ nodes: updateNode(activePage.nodes, selectedId, patch) });
  };

  const addComponent = (type: ComponentType) => {
    if (!activePage || draft || busy === 'ai') return;
    const node = createNode(type);
    const canNest = selectedNode && ['stack', 'row', 'grid', 'card'].includes(selectedNode.type);
    patchPage({ nodes: insertNode(activePage.nodes, node, canNest ? selectedNode.id : undefined) });
    setSelectedId(node.id);
    setMode('edit');
    setMobilePanel('canvas');
    showNotice(`${typeLabels[type]}已添加`);
  };

  const addPage = () => {
    if (draft || busy === 'ai') return;
    const page: Page = { id: newId('page'), name: `新页面 ${project.pages.length + 1}`, nodes: [] };
    commit({ ...project, pages: [...project.pages, page] });
    setActivePageId(page.id);
    setSelectedId(undefined);
    setPanel('pages');
    showNotice('新页面已创建');
  };

  const removePage = (page: Page) => {
    if (project.pages.length <= 1) { showNotice('项目至少需要保留一个页面', 'info'); return; }
    if (draft || busy === 'ai') return;
    const pages = project.pages.filter(item => item.id !== page.id).map(item => ({ ...item, nodes: clearPageReferences(item.nodes, page.id) }));
    commit({ ...project, pages });
    if (activePageId === page.id) setActivePageId(pages[0].id);
    setSelectedId(undefined);
    showNotice(`已删除「${page.name}」`);
  };

  const finishRenamePage = (page: Page) => {
    const name = pageNameDraft.trim().slice(0, 100);
    if (name && name !== page.name) commit({ ...project, pages: project.pages.map(item => item.id === page.id ? { ...item, name } : item) });
    setRenamingPageId(undefined);
  };

  const undo = () => {
    if (draft || busy === 'ai') return;
    const previous = history.at(-1);
    if (!previous) return;
    setHistory(items => items.slice(0, -1));
    setFuture(items => [...items, project]);
    setProject(previous);
    showNotice('已撤销上一步', 'info');
  };
  const redo = () => {
    if (draft || busy === 'ai') return;
    const next = future.at(-1);
    if (!next) return;
    setFuture(items => items.slice(0, -1));
    setHistory(items => [...items, project]);
    setProject(next);
    showNotice('已恢复操作', 'info');
  };

  const saveProject = async () => {
    const snapshot = JSON.stringify(project);
    setBusy('save');
    try {
      const response = await fetch('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ project }) });
      if (!response.ok) throw new Error(await response.text() || '保存失败');
      setSavedAt(Date.now());
      savedSnapshot.current = snapshot;
      showNotice(JSON.stringify(latestProject.current) === snapshot ? '项目已保存到本地工作区' : '上一版本已保存，最新修改仍待保存', 'info');
    } catch (error) { showNotice(error instanceof Error ? `保存失败：${error.message}` : '保存失败，请检查本地服务', 'error'); }
    finally { setBusy(null); }
  };

  const exportProject = async () => {
    setBusy('export');
    try {
      const response = await fetch('/api/export', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ project }) });
      if (!response.ok) throw new Error(await response.text() || '导出失败');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${project.name.trim().replace(/[\\/:*?"<>|]/g, '-') || 'atelier-project'}.zip`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showNotice('源码包已开始下载');
    } catch (error) { showNotice(error instanceof Error ? `导出失败：${error.message}` : '导出失败，请稍后重试', 'error'); }
    finally { setBusy(null); }
  };

  const createDraft = async () => {
    if (!prompt.trim()) { showNotice('先写下你想调整的内容', 'info'); return; }
    if (aiScope === 'node' && !selectedId) { showNotice('先在画布或图层中选择组件', 'info'); return; }
    if (!config.baseUrl || !config.model || !hasApiKey) {
      showNotice('请先在设置中配置模型 API，再生成 AI 草稿', 'info');
      setConfigOpen(true);
      return;
    }
    const requestProject = project;
    const requestSnapshot = JSON.stringify(project);
    setBusy('ai');
    try {
      const scope: { pageId?: string; selectedNodeId?: string } = aiScope === 'page' ? { pageId: activePage?.id } : aiScope === 'node' ? { selectedNodeId: selectedId } : {};
      const response = await fetch('/api/ai/draft', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ project: requestProject, prompt: prompt.trim(), ...scope }) });
      if (!response.ok) throw new Error(await response.text() || '草稿生成失败');
      const result = await response.json() as { project: Project };
      const candidate = validateProject(result.project);
      if (JSON.stringify(latestProject.current) !== requestSnapshot) { showNotice('生成期间项目已更新，请重新生成以避免覆盖修改', 'error'); return; }
      if (!candidate.pages.length) throw new Error('模型返回了无效的页面结构');
      setDraft(candidate);
      setDraftPageId(candidate.pages.some(page => page.id === activePage?.id) ? activePage?.id : candidate.pages[0]?.id);
      showNotice('草稿已生成，检查后再应用', 'info');
    } catch (error) { showNotice(error instanceof Error ? `AI 草稿失败：${error.message}` : 'AI 草稿失败，请稍后重试', 'error'); }
    finally { setBusy(null); }
  };

  const openConfig = async () => {
    setConfigOpen(true);
    try {
      const response = await fetch('/api/config');
      if (!response.ok) return;
      const value = await response.json();
      setConfig({ baseUrl: value.baseUrl ?? '', model: value.model ?? '', apiKey: '' });
      setHasApiKey(Boolean(value.hasKey));
    } catch { showNotice('暂时无法连接本地设置服务', 'error'); }
  };

  const saveConfig = async () => {
    setConfigBusy(true);
    try {
      const payload: ModelConfig = { baseUrl: config.baseUrl.trim(), model: config.model.trim() };
      if (config.apiKey?.trim()) payload.apiKey = config.apiKey.trim();
      const response = await fetch('/api/config', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(await response.text() || '设置保存失败');
      const result = await response.json().catch(() => ({}));
      setHasApiKey(Boolean(result.hasKey ?? payload.apiKey ?? hasApiKey));
      setConfig(value => ({ ...value, apiKey: '' }));
      setConfigOpen(false);
      showNotice('模型设置已保存');
    } catch (error) { showNotice(error instanceof Error ? `设置保存失败：${error.message}` : '设置保存失败', 'error'); }
    finally { setConfigBusy(false); }
  };

  const chooseImage = () => fileRef.current?.click();
  const readImage = (file?: File) => {
    if (!file || !selectedNode || selectedNode.type !== 'image') return;
    if (!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)) { showNotice('支持 PNG、JPEG、WebP 和 GIF 图片', 'error'); return; }
    if (file.size > 1_400_000) { showNotice('请使用小于 1.4 MB 的图片，以保持项目轻巧', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => updateSelected({ props: { ...selectedNode.props, src: String(reader.result), alt: file.name } });
    reader.onerror = () => showNotice('图片读取失败，请换一张图片', 'error');
    reader.readAsDataURL(file);
  };

  const selectedAction = selectedNode?.action;
  const setAction = (patch: Partial<Action>) => updateSelected({ action: { type: selectedAction?.type ?? 'toast', ...selectedAction, ...patch } });

  return <main className="atelier-shell">
    <header className="topbar">
      <div className="brand-lockup"><span className="brand-mark">A</span><div><div className="brand-name">Atelier</div><div className="brand-caption">LOCAL BUILDER</div></div></div>
      <div className="project-title-wrap"><span className="topbar-rule" /><input className="project-title" aria-label="项目名称" maxLength={100} value={project.name} readOnly={Boolean(draft) || busy === 'ai'} onChange={event => commit({ ...project, name: event.target.value })} /><span className="local-chip"><span />本地项目</span></div>
      <div className="topbar-actions">
        <div className="history-actions">
          <button className="icon-button" title="撤销" aria-label="撤销" disabled={!history.length} onClick={undo}><Undo2 size={16} /></button>
          <button className="icon-button" title="重做" aria-label="重做" disabled={!future.length} onClick={redo}><Redo2 size={16} /></button>
        </div>
        <div className="mode-switch" role="tablist" aria-label="工作模式">
          <button role="tab" aria-selected={mode === 'edit'} className={mode === 'edit' ? 'active' : ''} onClick={() => setMode('edit')}><Layers2 size={14} />编辑</button>
          <button role="tab" aria-selected={mode === 'preview'} className={mode === 'preview' ? 'active' : ''} onClick={() => setMode('preview')}><Eye size={14} />预览</button>
        </div>
        <button className="icon-button settings-shortcut" title="模型设置" aria-label="模型设置" onClick={openConfig}><Settings2 size={17} /></button>
          <button className="button button-subtle save-button" aria-label="保存项目" onClick={saveProject} disabled={busy !== null}>{busy === 'save' ? <LoaderCircle className="spin" size={15} /> : <Save size={15} />}<span>{busy === 'save' ? '保存中' : '保存'}</span></button>
        <button className="button button-primary export-button" aria-label="导出源码" title="导出源码" onClick={exportProject} disabled={busy !== null}>{busy === 'export' ? <LoaderCircle className="spin" size={15} /> : <Download size={15} />}<span>导出源码</span></button>
      </div>
    </header>

    <div className="workspace">
      <aside className={`left-panel ${panel === 'pages' ? 'pages-mode' : ''} ${mobilePanel === 'left' ? 'mobile-visible' : ''}`}>
        <div className="left-panel-tabs">
          <button className={panel !== 'pages' ? 'selected' : ''} onClick={() => setPanel('components')}><Plus size={14} />组件</button>
          <button className={panel === 'pages' ? 'selected' : ''} onClick={() => setPanel('pages')}><FolderOpen size={14} />页面</button>
          <button className="collapse-button" title="收起左侧面板" onClick={() => setPanel(panel ? null : 'components')}><PanelLeftClose size={15} /></button>
          <button className="mobile-back" onClick={() => setMobilePanel('canvas')}>返回画布</button>
        </div>
        {panel === 'pages' ? <div className="pages-panel">
          <div className="panel-heading"><div><span className="eyebrow">PROJECT</span><h2>页面</h2></div><button className="icon-button small" title="新建页面" onClick={addPage}><FilePlus2 size={16} /></button></div>
          <p className="panel-description">组织你的移动端体验。</p>
          <div className="page-list">{project.pages.map((page, index) => <div key={page.id} className={`page-list-item ${page.id === activePageId ? 'active' : ''}`}>
            {renamingPageId === page.id ? <input className="page-name-edit" autoFocus value={pageNameDraft} maxLength={100} onClick={event => event.stopPropagation()} onChange={event => setPageNameDraft(event.target.value)} onBlur={() => finishRenamePage(page)} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') { setRenamingPageId(undefined); setPageNameDraft(page.name); } }} /> : <button className="page-select" onClick={() => { setActivePageId(page.id); setSelectedId(undefined); }}><span className="page-number">{String(index + 1).padStart(2, '0')}</span><span className="page-name">{page.name}</span><span className="page-count">{flatten(page.nodes).length}</span></button>}
            <button className="page-rename" title={`重命名${page.name}`} disabled={Boolean(draft) || busy === 'ai'} onClick={() => { setPageNameDraft(page.name); setRenamingPageId(page.id); }}><Pencil size={12} /></button>
            <button className="page-remove" title={`删除${page.name}`} onClick={() => removePage(page)}><Trash2 size={13} /></button>
          </div>)}</div>
          <button className="add-page-button" onClick={addPage}><Plus size={15} />添加页面</button>
          <div className="page-panel-note"><CircleHelp size={15} /><span>页面跳转由组件的「动作」属性控制。演示数据会在预览中模拟。</span></div>
        </div> : panel === 'components' ? <>
          <div className="panel-heading"><div><span className="eyebrow">BUILD</span><h2>组件库</h2></div><span className="component-count">{componentGroups.reduce((n, group) => n + group.items.length, 0)} 个</span></div>
          <div className="search-field"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索组件" aria-label="搜索组件" /></div>
          <div className="component-groups">{filteredGroups.length ? filteredGroups.map(group => <section className="component-group" key={group.title}>
            <h3>{group.title}</h3>{group.note && <p className="component-group-note">{group.note}</p>}<div className="component-grid">{group.items.map(item => <button key={item.type} className="component-tile" onClick={() => addComponent(item.type)} title={`添加${item.label}`} disabled={Boolean(draft)}><span className={`component-glyph glyph-${item.type}`}>{nodeIcon(item.type)}</span><span>{item.label}</span><Plus className="tile-plus" size={13} /></button>)}</div>
          </section>) : <div className="empty-search"><Search size={20} /><span>没有找到相关组件</span><button onClick={() => setQuery('')}>清空搜索</button></div>}</div>
          <div className="panel-footer"><span className="footer-mark">A</span><span>组件保持简单，组合由你决定。</span><MoreHorizontal size={16} /></div>
        </> : <div className="left-collapsed"><button onClick={() => setPanel('components')}><Plus size={16} /><span>组件</span></button><button onClick={() => setPanel('pages')}><FolderOpen size={16} /><span>页面</span></button></div>}
      </aside>

      <section className={`canvas-area ${mobilePanel === 'canvas' ? 'mobile-visible' : ''}`}>
        <div className="canvas-toolbar">
          <button className="mobile-panel-trigger" onClick={() => setMobilePanel('left')}><Plus size={14} />组件</button><div className="breadcrumb"><span>页面</span><ChevronRight size={14} /><strong>{activePage?.name ?? '未命名页面'}</strong><ChevronDown size={13} /></div>
            <div className="canvas-meta"><select className="theme-select" aria-label="演示主题" value={project.theme} disabled={Boolean(draft)} onChange={event => commit({ ...project, theme: event.target.value as Project['theme'] })}>{Object.entries(palettes).map(([key, palette]) => <option value={key} key={key}>{palette.label}</option>)}</select></div>
          <button className="mobile-panel-trigger inspector-trigger" onClick={() => setMobilePanel('right')}><Settings2 size={14} />属性</button>
        </div>
        <div className="canvas-stage">
          <DevicePreview theme={(draft ?? project).theme} draft={Boolean(draft)} status={draft ? '草稿预览中' : mode === 'edit' ? '编辑模式' : '交互预览'}>
            {(draft ? draft.pages.find(page => page.id === draftPageId) : activePage) ? <Renderer project={draft ?? project} pageId={(draft ? draft.pages.find(page => page.id === draftPageId) : activePage)!.id} editing={Boolean(!draft && mode === 'edit')} selectedNodeId={draft ? undefined : selectedId} onSelect={id => !draft && mode === 'edit' && setSelectedId(id)} onNavigate={id => { if (draft) { if (draft.pages.some(page => page.id === id)) setDraftPageId(id); } else { setActivePageId(id); setSelectedId(undefined); } }} /> : <div className="canvas-empty"><div className="canvas-empty-icon"><Frame size={22} /></div><h2>从一张空白画布开始</h2><p>添加组件，逐步搭建你的页面。</p><button className="button button-primary" onClick={() => setPanel('components')}><Plus size={15} />添加第一个组件</button></div>}
            {draft && <div className="draft-ribbon"><Sparkles size={13} />AI 草稿预览</div>}
            {draft && <div className="draft-actions">{draft.pages.length > 1 && <select aria-label="预览草稿页面" value={draftPageId} onChange={event => setDraftPageId(event.target.value)}>{draft.pages.map(page => <option value={page.id} key={page.id}>{page.name}</option>)}</select>}<button className="button button-subtle" onClick={() => { setDraft(undefined); setDraftPageId(undefined); showNotice('已放弃 AI 草稿', 'info'); }}>放弃草稿</button><button className="button button-primary" onClick={() => { setHistory(items => [...items.slice(-39), project]); setFuture([]); setProject(draft); setActivePageId(draft.pages.some(page => page.id === draftPageId) ? draftPageId! : draft.pages[0].id); setSelectedId(undefined); setDraft(undefined); setDraftPageId(undefined); setPrompt(''); showNotice('AI 草稿已应用，可随时撤销'); }}><Check size={14} />应用修改</button></div>}
          </DevicePreview>
        </div>
        <div className="canvas-bottom"><span>页面结构</span><span className="structure-count">{flatten(activePage?.nodes ?? []).length} 个组件</span>{selectedNode && <><span className="canvas-divider" /><span className="selection-path">{typeLabels[selectedNode.type]} <ChevronRight size={12} /> {nodeLabel(selectedNode)}</span></>}</div>
      </section>

      <aside className={`right-panel ${mobilePanel === 'right' ? 'mobile-visible' : ''}`}>
        <div className="right-tabs"><button className={`right-tab ${rightTab === 'properties' ? 'active' : ''}`} onClick={() => setRightTab('properties')}><Settings2 size={15} />属性</button><button className={`right-tab ${rightTab === 'ai' ? 'active' : ''}`} onClick={() => { setRightTab('ai'); window.setTimeout(() => document.getElementById('ai-prompt')?.focus(), 0); }}><Sparkles size={15} />AI 助手</button><button className="mobile-back" onClick={() => setMobilePanel('canvas')}>返回画布</button></div>
        <div className={`right-content ${rightTab === 'ai' ? 'ai-focus' : ''}`}>
          <section className="inspector-section tree-section">
            <div className="section-title-row"><div><span className="eyebrow">STRUCTURE</span><h2>图层</h2></div><span className="section-count">{tree.length}</span></div>
            {!activePage?.nodes.length ? <div className="tree-empty"><Layers2 size={17} /><span>页面还是空的</span><button onClick={() => setPanel('components')}>添加组件</button></div> : <div className="layer-tree">{tree.map(({ node, depth }) => <div key={node.id} className={`layer-row ${node.id === selectedId ? 'selected' : ''}`} style={{ paddingLeft: 8 + depth * 16 }}>
              {node.children?.length ? <button className="tree-disclosure" onClick={() => setExpanded(value => ({ ...value, [node.id]: value[node.id] === false }))}>{expanded[node.id] === false ? <ChevronRight size={13} /> : <ChevronDown size={13} />}</button> : <span className="tree-spacer" />}
              <button className="layer-select" onClick={() => { setSelectedId(node.id); setMode('edit'); }}><span className="layer-icon">{nodeIcon(node.type)}</span><span className="layer-name">{nodeLabel(node)}</span><span className="layer-type">{node.type}</span></button>
              {node.id === selectedId && <span className="layer-selected-dot" />}
            </div>)}</div>}
          </section>
          <section className="inspector-section properties-section">
            <div className="section-title-row"><div><span className="eyebrow">PROPERTIES</span><h2>{selectedNode ? nodeLabel(selectedNode) : '属性面板'}</h2></div>{selectedNode && <button className="icon-button small" title="删除组件" onClick={() => { patchPage({ nodes: removeNode(activePage!.nodes, selectedNode.id) }); setSelectedId(undefined); showNotice('组件已删除', 'info'); }}><Trash2 size={15} /></button>}</div>
            {!selectedNode ? <div className="inspector-empty"><div className="empty-spark"><Settings2 size={18} /></div><strong>选择一个组件</strong><p>在画布或图层中选择组件后，可在这里编辑内容、样式和交互。</p><button onClick={() => setPanel('components')}><Plus size={14} />添加组件</button></div> : <>
              <div className="property-group"><h3>内容</h3>
                {(['text', 'title', 'label', 'placeholder', 'value', 'description', 'caption', 'subtitle', 'items', 'alt', 'tag', 'days'] as const).map(key => {
                  const value = selectedNode.props[key];
                  if (value === undefined && primaryContent[selectedNode.type] !== key) return null;
                  const multiline = ['text', 'description', 'subtitle'].includes(key);
                  const onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateSelected({ props: { ...selectedNode.props, [key]: typeof value === 'number' ? Number(event.target.value) : event.target.value } });
                  return <label className={`field-row${multiline ? ' multiline-field' : ''}`} key={key}><span>{({ text: '文案', title: '标题', label: '标签', placeholder: '占位提示', value: '显示值', description: '说明', caption: '辅助文案', subtitle: '副标题', items: '选项', alt: '图片说明', tag: '分类', days: '连续天数' } as const)[key]}</span>{multiline ? <textarea value={String(value ?? '')} onChange={onChange} placeholder="输入内容" rows={2} /> : <input type={typeof value === 'number' ? 'number' : 'text'} value={String(value ?? '')} onChange={onChange} placeholder="输入内容" />}</label>;
                })}
                {selectedNode.type === 'image' && <div className="image-property"><label className="field-row"><span>图片地址</span><input value={String(selectedNode.props.src ?? '')} onChange={event => updateSelected({ props: { ...selectedNode.props, src: event.target.value } })} placeholder="粘贴图片链接" /></label><button className="button button-subtle image-pick" onClick={chooseImage}><ImagePlus size={14} />从本地选择</button><input ref={fileRef} type="file" accept="image/*" hidden onChange={event => readImage(event.target.files?.[0])} /></div>}
                {['select', 'tabs'].includes(selectedNode.type) && selectedNode.props.items === undefined && <label className="field-row"><span>选项</span><input value={String(selectedNode.props.options ?? '')} onChange={event => updateSelected({ props: { ...selectedNode.props, options: event.target.value } })} placeholder="用逗号分隔" /></label>}
                {['checkbox', 'switch', 'task', 'habit'].includes(selectedNode.type) && <label className="field-row toggle-property"><span>初始状态</span><input type="checkbox" checked={Boolean(selectedNode.props.checked ?? false)} onChange={event => updateSelected({ props: { ...selectedNode.props, checked: event.target.checked } })} /><span>{selectedNode.props.checked ? '开启' : '关闭'}</span></label>}
                {['input', 'textarea'].includes(selectedNode.type) && <label className="field-row toggle-property"><span>必填字段</span><input type="checkbox" checked={Boolean(selectedNode.props.required ?? false)} onChange={event => updateSelected({ props: { ...selectedNode.props, required: event.target.checked } })} /><span>{selectedNode.props.required ? '是' : '否'}</span></label>}
                {selectedNode.type === 'navbar' && <label className="field-row toggle-property"><span>显示返回键</span><input type="checkbox" checked={Boolean(selectedNode.props.back ?? false)} onChange={event => updateSelected({ props: { ...selectedNode.props, back: event.target.checked } })} /><span>{selectedNode.props.back ? '显示' : '隐藏'}</span></label>}
              </div>
              <div className="property-group"><div className="property-heading"><h3>布局与样式</h3><button className="text-button" onClick={() => updateSelected({ style: {} })}>恢复主题样式</button></div>
                <label className="field-row"><span>宽度</span><select value={String(selectedNode.style.width ?? 'auto')} onChange={event => updateSelected({ style: { ...selectedNode.style, width: event.target.value } })}><option value="auto">自动</option><option value="100%">填满</option><option value="50%">一半</option><option value="fit-content">适应内容</option></select></label>
                <div className="field-row"><span>内边距</span><div className="segmented">{(['0', '8', '12', '16', '24'] as const).map(value => <button key={value} className={String(selectedNode.style.padding ?? '') === value ? 'active' : ''} onClick={() => updateSelected({ style: { ...selectedNode.style, padding: Number(value) } })}>{value}</button>)}</div></div>
                <div className="field-row"><span>圆角</span><div className="segmented">{(['0', '8', '12', '20'] as const).map(value => <button key={value} className={String(selectedNode.style.borderRadius ?? '') === value ? 'active' : ''} onClick={() => updateSelected({ style: { ...selectedNode.style, borderRadius: Number(value) } })}>{value}</button>)}</div></div>
                {['stack', 'row', 'grid'].includes(selectedNode.type) && <div className="field-row"><span>元素间距</span><div className="range-field"><input type="range" min="0" max="32" step="4" value={Number(selectedNode.style.gap ?? 12)} onChange={event => updateSelected({ style: { ...selectedNode.style, gap: Number(event.target.value) } })} /><output>{selectedNode.style.gap ?? 12}</output></div></div>}
                {selectedNode.type === 'row' && <><label className="field-row"><span>垂直对齐</span><select value={String(selectedNode.style.alignItems ?? 'center')} onChange={event => updateSelected({ style: { ...selectedNode.style, alignItems: event.target.value } })}><option value="flex-start">顶部</option><option value="center">居中</option><option value="flex-end">底部</option><option value="stretch">拉伸</option></select></label><label className="field-row"><span>水平分布</span><select value={String(selectedNode.style.justifyContent ?? 'flex-start')} onChange={event => updateSelected({ style: { ...selectedNode.style, justifyContent: event.target.value } })}><option value="flex-start">靠左</option><option value="center">居中</option><option value="space-between">两端</option><option value="space-around">均匀</option></select></label></>}
                {selectedNode.type === 'grid' && <label className="field-row"><span>网格列数</span><select value={String(selectedNode.style.gridTemplateColumns ?? '1fr 1fr')} onChange={event => updateSelected({ style: { ...selectedNode.style, gridTemplateColumns: event.target.value } })}><option value="1fr 1fr">2 列</option><option value="1fr 1fr 1fr">3 列</option><option value="1fr 1fr 1fr 1fr">4 列</option></select></label>}
                <label className="field-row"><span>字号</span><select value={String(selectedNode.style.fontSize ?? '')} onChange={event => { const style = { ...selectedNode.style }; if (event.target.value) style.fontSize = Number(event.target.value); else delete style.fontSize; updateSelected({ style }); }}><option value="">跟随主题</option><option value="12">12 · 辅助</option><option value="14">14 · 小字</option><option value="16">16 · 正文</option><option value="20">20 · 小标题</option><option value="24">24 · 标题</option><option value="30">30 · 大标题</option></select></label>
                {['text', 'button', 'badge'].includes(selectedNode.type) && <label className="field-row"><span>样式</span><select value={String(selectedNode.props.variant ?? 'default')} onChange={event => updateSelected({ props: { ...selectedNode.props, variant: event.target.value } })}><option value="default">默认</option><option value="heading">标题</option><option value="subheading">副标题</option><option value="body">正文</option><option value="muted">弱化</option><option value="primary">强调</option><option value="secondary">次要</option><option value="ghost">轻量</option><option value="eyebrow">眉题</option></select></label>}
                <div className="field-row color-row"><span>文字颜色</span><label className="color-control"><input type="color" value={String(selectedNode.style.color ?? '#39362f')} onChange={event => updateSelected({ style: { ...selectedNode.style, color: event.target.value } })} /><code>{String(selectedNode.style.color ?? '默认')}</code></label></div>
                <div className="field-row color-row"><span>背景颜色</span><label className="color-control"><input type="color" value={String(selectedNode.style.background ?? '#faf8f4')} onChange={event => updateSelected({ style: { ...selectedNode.style, background: event.target.value } })} /><code>{String(selectedNode.style.background ?? '默认')}</code></label></div>
              </div>
              <div className="property-group"><div className="property-heading-actions"><h3>动作</h3><span className="mock-badge">本地模拟</span></div>
                <label className="field-row"><span>触发行为</span><select value={selectedAction?.type ?? 'none'} onChange={event => { const type = event.target.value; if (type === 'none') updateSelected({ action: undefined }); else if (type === 'navigate') { const target = project.pages.find(page => page.id !== activePage?.id); if (!target) { showNotice('请先创建另一个页面，再设置跳转', 'info'); return; } setAction({ type, target: target.id }); } else setAction({ type: type as Action['type'], target: undefined }); }}><option value="none">无</option><option value="toast">提示消息</option><option value="navigate">跳转页面</option><option value="toggle">切换状态</option><option value="submit">提交表单</option><option value="dialog">打开对话框</option></select></label>
                {selectedAction?.type === 'navigate' ? <label className="field-row"><span>目标页面</span><select value={selectedAction.target ?? ''} onChange={event => setAction({ target: event.target.value })}>{project.pages.filter(page => page.id !== activePage?.id).map(page => <option value={page.id} key={page.id}>{page.name}</option>)}</select></label> : selectedAction && <label className="field-row"><span>{selectedAction.type === 'toggle' ? '状态名称' : '提示内容'}</span><input value={selectedAction.message ?? ''} onChange={event => setAction({ message: event.target.value })} placeholder="操作完成" /></label>}
              </div>
              <div className="node-tools"><span>图层排序</span><button title="上移一层" aria-label="上移一层" onClick={() => patchPage({ nodes: moveNode(activePage!.nodes, selectedNode.id, -1) })}><ArrowUp size={14} /></button><button title="下移一层" aria-label="下移一层" onClick={() => patchPage({ nodes: moveNode(activePage!.nodes, selectedNode.id, 1) })}><ArrowDown size={14} /></button><button title="嵌套到上方容器" onClick={() => { const index = tree.findIndex(item => item.node.id === selectedNode.id); const parent = tree.slice(0, index).reverse().find(item => ['stack', 'row', 'grid', 'card'].includes(item.node.type) && !containsNode(selectedNode, item.node.id))?.node; if (parent) { const withoutNode = removeNode(activePage!.nodes, selectedNode.id); patchPage({ nodes: insertNode(withoutNode, selectedNode, parent.id) }); showNotice(`已移入「${nodeLabel(parent)}」`); } else showNotice('上方没有可用的布局容器', 'info'); }}><GripVertical size={14} />移入容器</button></div>
            </>}
          </section>
          <section className="ai-card">
            <div className="ai-card-heading"><span className="ai-icon"><Sparkles size={15} /></span><div><strong>AI 助手</strong><span>描述你想怎么调整</span></div><button className="icon-button small" title="配置模型 API" onClick={openConfig}><Settings2 size={15} /></button></div>
            <label className="ai-scope"><span>修改范围</span><select value={aiScope} onChange={event => setAiScope(event.target.value as typeof aiScope)} disabled={busy === 'ai' || Boolean(draft)}><option value="project">整个项目</option><option value="page">当前页面</option><option value="node" disabled={!selectedId}>选中组件</option></select></label>
            <textarea id="ai-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder={hasApiKey ? '例如：让首页更简洁，突出今日习惯' : '先配置兼容 OpenAI Chat Completions 的模型 API'} disabled={!hasApiKey || busy === 'ai' || Boolean(draft)} />
            <div className="ai-card-footer"><span className={hasApiKey ? 'api-ready' : ''}><span />{hasApiKey ? `已连接 · ${config.model || '自定义模型'}` : '尚未配置模型 API'}</span><button className="button button-primary ai-submit" disabled={!hasApiKey || busy !== null || !prompt.trim()} onClick={createDraft}>{busy === 'ai' ? <LoaderCircle className="spin" size={14} /> : <Sparkles size={14} />}{busy === 'ai' ? '生成中' : '生成草稿'}</button></div>
          </section>
          <div className="right-footer"><span className={`save-indicator ${!cacheAvailable ? 'cache-warning' : ''}`}><span />{!cacheAvailable ? '草稿缓存不可用，请保存项目' : savedSnapshot.current === JSON.stringify(project) ? savedAt ? `已保存 ${new Date(savedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : '已从本地项目恢复' : '草稿已缓存 · 待保存项目'}</span><button className="text-button" onClick={openConfig}>API 设置</button></div>
        </div>
      </aside>
    </div>

    {configOpen && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setConfigOpen(false); }}><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal-header"><div><span className="eyebrow">MODEL CONNECTION</span><h2 id="settings-title">模型 API 设置</h2></div><button className="icon-button" aria-label="关闭设置" onClick={() => setConfigOpen(false)}><X size={17} /></button></div>
      <p className="modal-description">连接你自己的兼容模型服务。密钥仅提交给本地服务保存，不会显示在页面中。</p>
      <label className="modal-field"><span>API Base URL</span><input value={config.baseUrl} onChange={event => setConfig(value => ({ ...value, baseUrl: event.target.value }))} placeholder="https://api.example.com/v1" /></label>
      <label className="modal-field"><span>模型名称</span><input value={config.model} onChange={event => setConfig(value => ({ ...value, model: event.target.value }))} placeholder="服务端支持的模型 ID" /></label>
      <label className="modal-field"><span>API Key <small>{hasApiKey ? '已保存，留空表示保持不变' : '仅保存在本地服务'}</small></span><input type="password" autoComplete="new-password" value={config.apiKey ?? ''} onChange={event => setConfig(value => ({ ...value, apiKey: event.target.value }))} placeholder={hasApiKey ? '••••••••••••••••' : '输入 API Key'} /></label>
      <div className="modal-note"><span className={hasApiKey ? 'status-dot ready' : 'status-dot'} />{hasApiKey ? '模型连接信息已配置，可生成 AI 草稿。' : '配置完成后，AI 会先返回预览草稿供你检查。'}</div>
      <div className="modal-actions"><button className="button button-subtle" onClick={() => setConfigOpen(false)}>取消</button><button className="button button-primary" onClick={saveConfig} disabled={configBusy || !config.baseUrl.trim() || !config.model.trim()}>{configBusy ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />}保存设置</button></div>
    </section></div>}
    {notice && <div className={`toast toast-${notice.kind}`} role="status"><span className="toast-mark">{notice.kind === 'error' ? '!' : notice.kind === 'info' ? 'i' : <Check size={13} />}</span>{notice.text}<button aria-label="关闭提示" onClick={() => setNotice(undefined)}><X size={14} /></button></div>}
  </main>;
}
