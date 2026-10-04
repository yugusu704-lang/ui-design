import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown, ArrowUp, Check, ChevronDown, ChevronRight, CircleHelp, Download, Eye,
  FilePlus2, FolderOpen, Frame, GripVertical, ImagePlus, Layers2, LayoutGrid, Pencil,
  LoaderCircle, MessageSquareText, MoreHorizontal, PanelLeftClose,
  PanelRightClose, Plus, Redo2, Save, Search, Settings2, Sparkles, Trash2,
  Undo2, X, Copy, Play, RotateCcw, Move, WandSparkles,
} from 'lucide-react';
import type { Action, BuilderNode, ComponentType, ModelConfig, Page, Project } from '../shared/types';
import { createNode, findNode, insertNode, moveNode, removeNode, updateNode, validateProject } from '../shared/model';
import { createProjectDocument } from '../shared/projects';
import { Renderer } from './Renderer';
import { DevicePreview } from './DevicePreview';
import { componentGroups, typeLabels } from '../shared/catalog';
import { duplicateNode, insertAfter } from '../shared/editor';
import { ProjectSync, type SyncState } from './project-sync';
import type { DraftRecord } from '../shared/storage';
import { ProjectHistory, RecoveryPanel } from './ProjectHistory';
import { ProjectManager } from './ProjectManager';
import { ComponentThumbnail } from './ComponentThumbnail';
import { MotionPicker } from './MotionPicker';
import { addTemplatePage, type TemplateId } from '../shared/templates';
import { appearancePresets, applyAppearancePreset } from '../shared/appearance';
import { alignSelection, isNodeLocked, normalizeSelection, constrainNodeSize, type Alignment, type LayoutChange } from '../shared/layout';
import { measureNodeMinimums } from './useCanvasDrag';
import { SizeControls } from './SizeControls';
import './workbench.css';
import './library-tools.css';
import './editor.css';
import './project-manager.css';

type Panel = 'components' | 'pages' | 'settings' | null;
type Notice = { kind: 'success' | 'error' | 'info'; text: string };

const primaryContent: Partial<Record<ComponentType, string>> = {
  text: 'text', avatar: 'text', badge: 'text', button: 'label', input: 'label', textarea: 'label',
  checkbox: 'label', switch: 'label', select: 'label', progress: 'label', stat: 'label',
  task: 'title', habit: 'title', empty: 'title', navbar: 'title', card: 'title',
};
const contentLabels = { text: '文案', title: '标题', label: '标签', placeholder: '占位提示', value: '显示值', description: '说明', caption: '辅助文案', subtitle: '副标题', items: '条目', alt: '图片说明', tag: '分类', days: '连续天数', options: '选项', min: '最小值', max: '最大值', step: '步长', unit: '单位', rows: '占位行数', price: '价格', period: '计费周期', features: '功能清单', author: '姓名', role: '身份', quote: '评价', rating: '评分' } as const;
const palettes: Record<Project['theme'], { label: string; description: string; swatches: string[] }> = {
  nordic: { label: '北欧清简', description: '明亮留白与柔和绿意', swatches: ['#f5f4ee', '#344f42', '#d9e5d8'] },
  editorial: { label: '纸感编辑', description: '温暖纸色与衬线标题', swatches: ['#f3efe6', '#3d3831', '#b86b4c'] },
  dark: { label: '夜间模式', description: '沉静深色与清晰层次', swatches: ['#202522', '#b7d2bd', '#343d37'] },
};
function clientIdentity(): string {
  try { const stored = localStorage.getItem('atelier-client-id'); if (stored) return stored; const id = crypto.randomUUID(); localStorage.setItem('atelier-client-id', id); return id; }
  catch { return crypto.randomUUID(); }
}
function selectedProjectPreference(): string | undefined {
  try { return localStorage.getItem('atelier-selected-project-id') ?? undefined; }
  catch { return undefined; }
}

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
  const [project, setProject] = useState<Project>(() => createProjectDocument('未命名项目'));
  const [history, setHistory] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);
  const [activePageId, setActivePageId] = useState(project.pages[0]?.id ?? '');
  const [renamingPageId, setRenamingPageId] = useState<string>();
  const [pageNameDraft, setPageNameDraft] = useState('');
  const [selectedId, setSelectedId] = useState<string>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [panel, setPanel] = useState<Panel>('components');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');
  const [propertyTab, setPropertyTab] = useState<'content' | 'layout' | 'action'>('content');
  const [revealId, setRevealId] = useState<string>();
  const [motionReplay, setMotionReplay] = useState(0);
  const [notice, setNotice] = useState<Notice>();
  const [busy, setBusy] = useState<'save' | 'export' | 'ai' | 'project' | null>(null);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>({ online: false, initialized: false, phase: 'loading', saveVersion: 0, memoryOnly: false, pendingCount: 0 });
  const syncRef = useRef<ProjectSync | null>(null);
  const [clientId] = useState(clientIdentity);
  const [recoveryDrafts, setRecoveryDrafts] = useState<DraftRecord[]>([]);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [draft, setDraft] = useState<Project>();
  const [draftPageId, setDraftPageId] = useState<string>();
  const [prompt, setPrompt] = useState('');
  const [aiScope, setAiScope] = useState<'project' | 'page' | 'node'>('page');
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useState<ModelConfig>({ baseUrl: '', model: '', apiKey: '' });
  const [hasApiKey, setHasApiKey] = useState(false);
  const [configBusy, setConfigBusy] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [rightTab, setRightTab] = useState<'properties' | 'motion' | 'ai'>('properties');
  const [mobilePanel, setMobilePanel] = useState<'canvas' | 'left' | 'right'>('canvas');
  const fileRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const latestProject = useRef(project);
  const lastHistoryGroup = useRef<string | undefined>(undefined);
  latestProject.current = project;

  const activePage = project.pages.find(page => page.id === activePageId) ?? project.pages[0];
  const selectedNode = activePage && selectedId ? findNode(activePage.nodes, selectedId) : undefined;
  const selection = normalizeSelection(activePage?.nodes ?? [], selectedIds.length ? selectedIds : selectedId ? [selectedId] : []);
  const selectedLocked = Boolean(selectedId && isNodeLocked(activePage?.nodes ?? [], selectedId));
  const tree = useMemo(() => flatten(activePage?.nodes ?? [], 0, expanded), [activePage?.nodes, expanded]);
  const filteredGroups = useMemo(() => componentGroups.map(group => ({
    ...group,
    items: group.items.filter(item => `${item.label} ${item.hint} ${item.type}`.toLowerCase().includes(query.toLowerCase())),
  })).filter(group => group.items.length && (category === '全部' || category === group.title)), [query, category]);

  const showNotice = useCallback((text: string, kind: Notice['kind'] = 'success') => {
    setNotice({ text, kind });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setNotice(undefined), 3200);
  }, []);

  useEffect(() => {
    if (!project.pages.some(page => page.id === activePageId)) setActivePageId(project.pages[0]?.id ?? '');
    if (selectedId && !project.pages.some(page => findNode(page.nodes, selectedId))) setSelectedId(undefined);
  }, [project, activePageId, selectedId]);
  useEffect(() => { if (!selectedId) setSelectedIds([]); else setSelectedIds(ids => ids.includes(selectedId) ? ids : [selectedId]); }, [selectedId]);

  useEffect(() => {
    let alive = true;
    const sync = new ProjectSync(latestProject.current, { clientId, initialProjectId: selectedProjectPreference(),
      onState: state => { if (alive) setSyncState(state); },
      onProject: restored => { if (alive) {
        window.dispatchEvent(new Event('atelier-cancel-gesture'));
        latestProject.current = restored; setProject(restored); setActivePageId(restored.pages[0]?.id ?? '');
        setHistory([]); setFuture([]); lastHistoryGroup.current = undefined;
        setSelectedId(undefined); setSelectedIds([]); setRenamingPageId(undefined); setExpanded({});
        setDraft(undefined); setDraftPageId(undefined); setPrompt(''); setMode('edit'); setMobilePanel('canvas');
        setRevealId(undefined); setMotionReplay(0);
      } },
      onRecovery: drafts => { if (alive) setRecoveryDrafts(drafts); },
    });
    syncRef.current = sync; void sync.start();
    return () => { alive = false; sync.dispose(); if (syncRef.current === sync) syncRef.current = null; };
  }, [clientId]);
  useEffect(() => { syncRef.current?.edit(project); }, [project]);
  useEffect(() => {
    if (!syncState.initialized || !syncState.saveVersion) return;
    try { localStorage.setItem('atelier-selected-project-id', project.id); } catch { /* Interface preference only. */ }
  }, [project.id, syncState.initialized, syncState.saveVersion]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (syncState.memoryOnly || syncState.pendingCount) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [syncState.memoryOnly, syncState.pendingCount]);
  useEffect(() => {
    window.dispatchEvent(new Event('atelier-cancel-gesture'));
    setSelectedIds([]); setSelectedId(undefined);
  }, [activePageId, mode]);

  useEffect(() => {
    if (!revealId) return;
    const frame = requestAnimationFrame(() => {
      const node = Array.from(document.querySelectorAll<HTMLElement>('.phone-screen [data-node-id]')).find(item => item.dataset.nodeId === revealId);
      node?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      setRevealId(undefined);
    });
    return () => cancelAnimationFrame(frame);
  }, [revealId, project]);

  useEffect(() => {
    let alive = true;
    fetch('/api/config').then(response => response.ok ? response.json() : null).then(value => {
      if (!alive || !value) return;
      setConfig({ baseUrl: value.baseUrl ?? '', model: value.model ?? '', apiKey: '' });
      setHasApiKey(Boolean(value.hasKey));
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const commit = useCallback((next: Project, group?: string) => {
    if (draft || busy === 'ai' || busy === 'project' || projectsOpen || !syncState.initialized) return;
    try { validateProject(next); }
    catch (error) { showNotice(error instanceof Error ? error.message : '修改无效', 'error'); return; }
    if (!group || lastHistoryGroup.current !== group) setHistory(items => [...items.slice(-39), project]);
    lastHistoryGroup.current = group;
    setFuture([]);
    setProject(next);
  }, [project, draft, busy, projectsOpen, showNotice, syncState.initialized]);

  const patchPage = (patch: Partial<Page>, group?: string) => {
    if (!activePage || draft || busy === 'ai') return;
    commit({ ...project, pages: project.pages.map(page => page.id === activePage.id ? { ...page, ...patch } : page) }, group);
  };

  const updateSelected = (patch: Partial<BuilderNode>, group?: string) => {
    if (!activePage || !selectedId || draft || busy === 'ai') return;
    if (selectedLocked && (patch.props?.offsetX !== undefined || patch.props?.offsetY !== undefined || patch.style && ['width', 'height', 'flexShrink', 'flexBasis'].some(key => patch.style![key] !== selectedNode?.style[key]))) { showNotice('请先解锁图层再调整布局', 'info'); return; }
    patchPage({ nodes: updateNode(activePage.nodes, selectedId, patch) }, group);
  };

  const addComponent = (type: ComponentType) => {
    if (!activePage || draft || busy === 'ai') return;
    if (selectedLocked) { showNotice('请先解锁图层或取消选中，再插入组件', 'info'); return; }
    const node = createNode(type);
    const canNest = selectedNode && ['stack', 'row', 'grid', 'card'].includes(selectedNode.type);
    patchPage({ nodes: canNest ? insertNode(activePage.nodes, node, selectedNode.id) : insertAfter(activePage.nodes, node, selectedId) });
    setSelectedId(node.id);
    setRevealId(node.id);
    setRightTab('properties');
    setMode('edit');
    setMobilePanel('canvas');
    showNotice(`${typeLabels[type]}已添加${canNest ? `到「${nodeLabel(selectedNode)}」` : ''}，可直接拖动位置`);
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
    if (flatten(page.nodes).some(item => isNodeLocked(page.nodes, item.node.id))) { showNotice('页面包含锁定图层，请先解锁再删除', 'info'); return; }
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
    lastHistoryGroup.current = undefined;
    setHistory(items => items.slice(0, -1));
    setFuture(items => [...items, project]);
    setProject(previous);
    showNotice('已撤销上一步', 'info');
  };
  const redo = () => {
    if (draft || busy === 'ai') return;
    const next = future.at(-1);
    if (!next) return;
    lastHistoryGroup.current = undefined;
    setFuture(items => items.slice(0, -1));
    setHistory(items => [...items, project]);
    setProject(next);
    showNotice('已恢复操作', 'info');
  };

  const deleteSelected = () => {
    if (!selectedNode || !activePage || draft || busy === 'ai') return;
    const ids = selection.filter(id => !isNodeLocked(activePage.nodes, id) && !flatten(findNode(activePage.nodes, id)?.children ?? []).some(item => isNodeLocked(activePage.nodes, item.node.id)));
    if (!ids.length) { showNotice('请先解锁图层再删除', 'info'); return; }
    patchPage({ nodes: ids.reduce((nodes, id) => removeNode(nodes, id), activePage.nodes) });
    setSelectedId(undefined);
    showNotice('组件已删除，可撤销恢复', 'info');
  };

  const copySelected = () => {
    if (!selectedNode || !activePage || draft || busy === 'ai') return;
    const copy = duplicateNode(selectedNode);
    patchPage({ nodes: insertAfter(activePage.nodes, copy, selectedNode.id) });
    setSelectedId(copy.id);
    setRevealId(copy.id);
    showNotice('组件已复制');
  };

  const moveComponent = (id: string, position: { x: number; y: number }) => {
    if (!activePage || draft || busy === 'ai') return;
    const node = findNode(activePage.nodes, id);
    if (!node || isNodeLocked(activePage.nodes, id)) return;
    patchPage({ nodes: updateNode(activePage.nodes, id, { props: { ...node.props, offsetX: position.x, offsetY: position.y } }) });
  };

  const selectNode = (id: string, additive = false) => {
    const ids = additive ? selection.includes(id) ? selection.filter(item => item !== id) : [...selection, id] : [id];
    const next = normalizeSelection(activePage?.nodes ?? [], ids);
    setSelectedIds(next); setSelectedId(next.at(-1));
    if (rightTab === 'ai') setRightTab('properties');
  };
  const commitLayout = (changes: LayoutChange[]) => {
    if (!activePage || draft || busy === 'ai') return;
    let nodes = activePage.nodes;
    for (const change of changes) {
      const node = findNode(nodes, change.id); if (!node || isNodeLocked(nodes, change.id)) continue;
      nodes = updateNode(nodes, change.id, { ...(change.position ? { props: { ...node.props, offsetX: change.position.x, offsetY: change.position.y } } : {}), ...(change.size ? { style: { ...node.style, width: change.size.width, ...(change.size.height !== undefined ? { height: change.size.height } : {}), flexShrink: 0, flexBasis: 'auto' } } : {}) });
    }
    if (nodes !== activePage.nodes) patchPage({ nodes });
  };
  const alignNodes = (alignment: Alignment) => {
    const root = document.querySelector<HTMLElement>('.phone-screen .demo-root');
    if (!root || !activePage) return;
    const scale = root.getBoundingClientRect().width / root.offsetWidth || 1;
    const rects = selection.filter(id => !isNodeLocked(activePage.nodes, id)).flatMap(id => {
      const element = [...root.querySelectorAll<HTMLElement>('[data-node-id]')].find(item => item.dataset.nodeId === id);
      if (!element) return []; const rect = element.getBoundingClientRect();
      return [{ id, left: rect.left / scale, top: rect.top / scale, width: rect.width / scale, height: rect.height / scale }];
    });
    const aligned = alignSelection(rects, alignment);
    commitLayout(aligned.map(change => { const rect = rects.find(item => item.id === change.id)!; const node = findNode(activePage.nodes, change.id)!; return { id: change.id, position: { x: Math.max(-5000, Math.min(5000, Number(node.props.offsetX ?? 0) + change.position!.x - rect.left)), y: Math.max(-5000, Math.min(5000, Number(node.props.offsetY ?? 0) + change.position!.y - rect.top)) } }; }));
  };
  const resizeSelected = (axis: 'width' | 'height', value: number) => {
    if (!selectedNode || selectedLocked) return;
    const root = document.querySelector<HTMLElement>('.phone-screen .demo-root');
    const element = root && [...root.querySelectorAll<HTMLElement>('[data-node-id]')].find(item => item.dataset.nodeId === selectedNode.id);
    if (!root || !element?.parentElement) return;
    window.dispatchEvent(new Event('atelier-cancel-gesture'));
    const originalWidth = element.style.width;
    const originalAnimation = element.style.animation;
    element.style.animation = 'none';
    try {
      const scale = root.getBoundingClientRect().width / root.offsetWidth || 1;
      const parentStyle = getComputedStyle(element.parentElement);
      const availableWidth = element.parentElement.clientWidth - (parseFloat(parentStyle.paddingLeft) || 0) - (parseFloat(parentStyle.paddingRight) || 0);
      const width = axis === 'width' || selectedNode.type === 'avatar' ? value : element.getBoundingClientRect().width / scale;
      const height = axis === 'height' ? value : typeof selectedNode.style.height === 'number' ? selectedNode.style.height : undefined;
      element.style.width = `${Math.max(24, Math.min(availableWidth, width))}px`;
      const minimums = measureNodeMinimums(element, selectedNode.type, scale);
      const size = constrainNodeSize(selectedNode.type, { width, ...(height !== undefined ? { height } : {}) }, availableWidth, minimums.height, minimums.width);
      if (size) commitLayout([{ id: selectedNode.id, size }]); else showNotice('当前容器内容无法满足这个尺寸，请先调整内部布局', 'info');
    } finally {
      element.style.width = originalWidth;
      element.style.animation = originalAnimation;
    }
  };
  const addTemplate = (templateId: TemplateId) => {
    try { const next = addTemplatePage(project, templateId); commit(next); setActivePageId(next.pages.at(-1)!.id); setSelectedId(undefined); setMobilePanel('canvas'); showNotice('模板已添加为新页面'); }
    catch (error) { showNotice(error instanceof Error ? error.message : '添加模板失败', 'error'); }
  };

  const switchPage = (id: string) => {
    setActivePageId(id);
    setSelectedId(undefined);
  };

  const saveProject = async (label?: string) => {
    try { await syncRef.current?.manual(latestProject.current, label); showNotice('检查点已保存到 SQLite', 'info'); }
    catch (error) { showNotice(error instanceof Error ? error.message : '保存失败，请检查本地服务', 'error'); throw error; }
  };
  const manageProject = async (operation: (sync: ProjectSync) => Promise<Project>) => {
    const sync = syncRef.current;
    if (!sync) throw new Error('本地工作区尚未连接');
    sync.edit(latestProject.current);
    setBusy('project');
    try {
      const opened = await operation(sync);
      void sync.refreshRecovery().catch(() => {});
      showNotice(`已打开「${opened.name}」`);
    } finally { setBusy(null); }
  };

  useEffect(() => {
    const shortcuts = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = Boolean(target.closest('input,textarea,select,[contenteditable="true"]'));
      if (configOpen || historyOpen || recoveryOpen || projectsOpen || draft || busy === 'ai' || busy === 'project') return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (!busy) void saveProject().catch(() => {}); return; }
      if (typing) return;
      if (event.ctrlKey || event.metaKey) {
        if (event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); }
        if (event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
        if (event.key.toLowerCase() === 'd') { event.preventDefault(); copySelected(); }
        return;
      }
      if (event.key === 'Escape') setSelectedId(undefined);
      if (mode !== 'edit') return;
      if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); deleteSelected(); }
      if (selectedNode && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const x = Number(selectedNode.props.offsetX ?? 0) + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0);
        const y = Number(selectedNode.props.offsetY ?? 0) + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0);
        const deltaX = x - Number(selectedNode.props.offsetX ?? 0), deltaY = y - Number(selectedNode.props.offsetY ?? 0);
        commitLayout(selection.flatMap(id => { const node = activePage && findNode(activePage.nodes, id); return node && !isNodeLocked(activePage!.nodes, id) ? [{ id, position: { x: Math.max(-5000, Math.min(5000, Number(node.props.offsetX ?? 0) + deltaX)), y: Math.max(-5000, Math.min(5000, Number(node.props.offsetY ?? 0) + deltaY)) } }] : []; }));
      }
    };
    window.addEventListener('keydown', shortcuts);
    return () => window.removeEventListener('keydown', shortcuts);
  });

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
  const openComponents = () => { setPanel('components'); setMobilePanel('left'); };
  const restoreRevision = async (restored: Project, revision: number) => {
    const original = latestProject.current;
    setBusy('save');
    try {
      const sync = syncRef.current; if (!sync) throw new Error('尚未连接工作区');
      await sync.flush();
      if (sync.state.phase !== 'saved') await sync.manual(original, '恢复前检查点');
      await sync.manual(validateProject(restored), `恢复版本 ${revision}`, 'restore');
      setProject(restored); setHistory([]); setFuture([]); setSelectedId(undefined); setActivePageId(restored.pages[0]?.id ?? '');
      showNotice('版本已恢复，并生成新修订');
    } catch (error) { syncRef.current?.edit(original); throw error; }
    finally { setBusy(null); }
  };
  const statusText: Record<SyncState['phase'], string> = { loading: '正在连接本地工作区', memory: '内存中有修改', draft: '草稿已同步到 SQLite', saving: '保存中 · 等待工作区确认', saved: `已保存 · 版本 ${syncState.saveVersion}`, offline: '服务断开', conflict: '版本冲突 · 正式保存已暂停' };

  useEffect(() => { document.querySelector('.right-content')?.scrollTo({ top: 0 }); }, [rightTab, selectedId]);

  return <main className="atelier-shell" onBlurCapture={() => { lastHistoryGroup.current = undefined; }}>
    <header className="topbar">
      <div className="brand-lockup"><span className="brand-mark">A</span><div><div className="brand-name">Atelier</div><div className="brand-caption">LOCAL BUILDER</div></div></div>
      <div className="project-title-wrap"><span className="topbar-rule" /><button className="project-manager-trigger" aria-label="管理项目" title="新建和切换项目" disabled={!syncState.initialized || busy !== null || Boolean(draft)} onClick={() => { window.dispatchEvent(new Event('atelier-cancel-gesture')); setProjectsOpen(true); }}><FolderOpen size={16}/><span>项目</span><ChevronDown size={13}/></button><input className="project-title" aria-label="项目名称" maxLength={100} value={project.name} readOnly={Boolean(draft) || busy !== null || projectsOpen} onChange={event => commit({ ...project, name: event.target.value }, 'project-name')} /><span className="local-chip"><span />本地项目</span></div>
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
        <button className="button button-subtle" aria-label="版本历史" onClick={() => setHistoryOpen(true)}><Layers2 size={15}/><span className="history-label">历史</span></button>
        <button className="button button-subtle save-button" aria-label="保存项目" onClick={() => void saveProject().catch(() => {})} disabled={busy !== null || !syncState.initialized || syncState.phase === 'conflict'}><Save size={15} /><span>保存</span></button>
        <button className="button button-primary export-button" aria-label="导出源码" title="导出源码" onClick={exportProject} disabled={busy !== null}>{busy === 'export' ? <LoaderCircle className="spin" size={15} /> : <Download size={15} />}<span>导出源码</span></button>
      </div>
    </header>
    <div className={`sync-bar sync-${syncState.phase}`} role="status"><span>{statusText[syncState.phase]}</span>{syncState.phase === 'offline' && <small>{syncState.memoryOnly ? '新修改仅在内存中，关闭前请重连' : '已有草稿已在 SQLite，新的修改需重新连接'}</small>}{syncState.error && <small>{syncState.error}</small>}{(recoveryDrafts.length > 0 || syncState.phase === 'conflict') && <button className="text-button" onClick={() => { setRecoveryOpen(true); void syncRef.current?.refreshRecovery().catch(() => {}); }}>恢复草稿{recoveryDrafts.length ? ` (${recoveryDrafts.length})` : ''}</button>}{syncState.phase === 'conflict' && <button className="text-button" onClick={() => void syncRef.current?.copyCurrent().then(() => showNotice('已另存为新项目')).catch(error => showNotice(error.message, 'error'))}>当前内容另存为新项目</button>}{syncState.phase === 'offline' && <button className="text-button" onClick={() => void syncRef.current?.reconnect()}>重连</button>}</div>
    <div className={`workspace ${panel === null ? 'left-is-collapsed' : ''} ${rightCollapsed ? 'right-is-collapsed' : ''} ${focused ? 'focused' : ''}`}>
      <aside className={`left-panel ${panel === 'pages' ? 'pages-mode' : ''} ${mobilePanel === 'left' ? 'mobile-visible' : ''}`}>
        <div className="left-panel-tabs">
          <button className={panel !== 'pages' ? 'selected' : ''} onClick={openComponents}><Plus size={14} />组件</button>
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
          <div className="category-filter" aria-label="组件分类">{['全部', ...componentGroups.map(group => group.title)].map(title => <button key={title} aria-pressed={category === title} className={category === title ? 'active' : ''} onClick={() => setCategory(title)}>{title}</button>)}</div>
          <div className="insert-context"><span>添加到</span><strong>{selectedNode && ['stack', 'row', 'grid', 'card'].includes(selectedNode.type) ? nodeLabel(selectedNode) : activePage?.name}</strong>{selectedNode && <button title="取消选中，添加到页面末尾" onClick={() => setSelectedId(undefined)}><X size={12} /></button>}</div>
          <details className="template-picker"><summary>从页面模板开始</summary><div>{([{ id: 'login', label: '登录' }, { id: 'profile', label: '个人资料' }, { id: 'product', label: '商品详情' }] as const).map(template => <button key={template.id} disabled={Boolean(draft) || busy === 'ai'} onClick={() => addTemplate(template.id)}>{template.label} <Plus size={12}/></button>)}</div></details>
          <div className="component-groups">{filteredGroups.length ? filteredGroups.map(group => <section className="component-group" key={group.title}>
            <h3>{group.title}<span>{group.items.length}</span></h3>{group.note && <p className="component-group-note">{group.note}</p>}<div className="component-grid">{group.items.map(item => <button key={item.type} className="component-tile" onClick={() => addComponent(item.type)} title={`添加${item.label}`} disabled={Boolean(draft) || busy === 'ai'}><ComponentThumbnail type={item.type}/><span className="tile-copy"><strong>{item.label}</strong><small>{item.hint}</small></span><Plus className="tile-plus" size={13} /></button>)}</div>
          </section>) : <div className="empty-search"><Search size={20} /><span>没有找到相关组件</span><button onClick={() => { setQuery(''); setCategory('全部'); }}>重置筛选</button></div>}</div>
          <div className="panel-footer"><span className="footer-mark">A</span><span>开源灵感</span><a href="https://github.com/shadcn-ui/ui" target="_blank" rel="noreferrer">shadcn/ui</a><a href="https://github.com/radix-ui/primitives" target="_blank" rel="noreferrer">Radix</a></div>
        </> : <div className="left-collapsed"><button onClick={openComponents}><Plus size={16} /><span>组件</span></button><button onClick={() => setPanel('pages')}><FolderOpen size={16} /><span>页面</span></button></div>}
      </aside>

      <section className={`canvas-area ${mobilePanel === 'canvas' ? 'mobile-visible' : ''}`}>
        <div className="canvas-toolbar">
          <button className="button button-subtle focus-toggle" aria-pressed={focused} onClick={() => { window.dispatchEvent(new Event('atelier-cancel-gesture')); setFocused(value => !value); }}>{focused ? '退出专注' : '专注画布'}</button>
          <button className="mobile-panel-trigger" onClick={() => setMobilePanel('left')}><Plus size={14} />组件</button><div className="breadcrumb"><span>页面</span><ChevronRight size={14} /><select aria-label="当前页面" value={activePage?.id} onChange={event => switchPage(event.target.value)}>{project.pages.map(page => <option key={page.id} value={page.id}>{page.name}</option>)}</select></div>
            <div className="canvas-meta"><select className="theme-select" aria-label="演示主题" value={project.theme} disabled={Boolean(draft)} onChange={event => commit({ ...project, theme: event.target.value as Project['theme'] })}>{Object.entries(palettes).map(([key, palette]) => <option value={key} key={key}>{palette.label}</option>)}</select></div>
          <button className="mobile-panel-trigger inspector-trigger" onClick={() => setMobilePanel('right')}><Settings2 size={14} />属性</button>
        </div>
        <div className="canvas-pagebar" aria-label="项目页面">{project.pages.map(page => <button key={page.id} className={page.id === activePageId ? 'active' : ''} aria-pressed={page.id === activePageId} onClick={() => switchPage(page.id)}>{page.name}</button>)}<button className="pagebar-add" title="新建页面" aria-label="新建页面" onClick={addPage} disabled={Boolean(draft) || busy === 'ai'}><Plus size={14} /></button></div>
        <div className="canvas-stage">
          <DevicePreview theme={(draft ?? project).theme} draft={Boolean(draft)} status={draft ? '草稿预览中' : mode === 'edit' ? '编辑模式' : '交互预览'}>
            {(draft ? draft.pages.find(page => page.id === draftPageId) : activePage) ? <Renderer project={draft ?? project} pageId={(draft ? draft.pages.find(page => page.id === draftPageId) : activePage)!.id} editing={Boolean(!draft && mode === 'edit' && busy === null && syncState.initialized)} selectedNodeId={draft ? undefined : selectedId} selectedNodeIds={draft ? [] : selection} motionReplay={motionReplay} onLayoutCommit={commitLayout} onMove={moveComponent} onSelect={(id, additive) => { if (!draft && mode === 'edit') selectNode(id, additive); }} onNavigate={id => { if (draft) { if (draft.pages.some(page => page.id === id)) setDraftPageId(id); } else switchPage(id); }} /> : <div className="canvas-empty"><div className="canvas-empty-icon"><Frame size={22} /></div><h2>从一张空白画布开始</h2><p>添加组件，逐步搭建你的页面。</p><button className="button button-primary" onClick={openComponents}><Plus size={15} />添加第一个组件</button></div>}
            {draft && <div className="draft-ribbon"><Sparkles size={13} />AI 草稿预览</div>}
            {draft && <div className="draft-actions">{draft.pages.length > 1 && <select aria-label="预览草稿页面" value={draftPageId} onChange={event => setDraftPageId(event.target.value)}>{draft.pages.map(page => <option value={page.id} key={page.id}>{page.name}</option>)}</select>}<button className="button button-subtle" onClick={() => { setDraft(undefined); setDraftPageId(undefined); showNotice('已放弃 AI 草稿', 'info'); }}>放弃草稿</button><button className="button button-primary" onClick={() => { setHistory(items => [...items.slice(-39), project]); setFuture([]); setProject(draft); setActivePageId(draft.pages.some(page => page.id === draftPageId) ? draftPageId! : draft.pages[0].id); setSelectedId(undefined); setDraft(undefined); setDraftPageId(undefined); setPrompt(''); showNotice('AI 草稿已应用，可随时撤销'); }}><Check size={14} />应用修改</button></div>}
          </DevicePreview>
        </div>
        <div className="canvas-bottom">{selectedNode && mode === 'edit' ? <><span className="selection-path"><Move size={13}/>{selection.length > 1 ? `已选 ${selection.length} 个` : typeLabels[selectedNode.type]}</span>{selection.length > 1 ? <div className="alignment-tools">{(['left','centerX','right','top','centerY','bottom'] as const).map((alignment, index) => <button key={alignment} aria-label={['左对齐','水平居中','右对齐','顶部对齐','垂直居中','底部对齐'][index]} onClick={() => alignNodes(alignment)}>{['左','中','右','上','中','下'][index]}</button>)}</div> : <span className="structure-count">X {selectedNode.props.offsetX ?? 0} · Y {selectedNode.props.offsetY ?? 0}</span>}<button title="复制组件 Ctrl+D" aria-label="复制组件" onClick={copySelected}><Copy size={14}/></button><button disabled={selectedLocked} title="复位位置" aria-label="复位位置" onClick={() => moveComponent(selectedNode.id, { x: 0, y: 0 })}><RotateCcw size={14}/></button><button disabled={selectedLocked} title="删除组件 Delete" aria-label="删除选中组件" onClick={deleteSelected}><Trash2 size={14}/></button><span className="canvas-hint">Shift 多选 · Alt 暂停吸附</span></> : <><span className="structure-count">{flatten(activePage?.nodes ?? []).length} 个组件</span><span className="canvas-hint">{mode === 'edit' ? '点击选择，拖动移动；Shift 多选' : '点击组件体验交互，切回编辑继续设计'}</span></>}</div>
      </section>

      <aside className={`right-panel ${mobilePanel === 'right' ? 'mobile-visible' : ''}`}>
        <button className="right-collapsed-trigger" aria-label={rightCollapsed ? '展开右侧面板' : '收起右侧面板'} onClick={() => setRightCollapsed(value => !value)}><PanelRightClose size={17}/></button>
        <div className="right-tabs"><button className={`right-tab ${rightTab === 'properties' ? 'active' : ''}`} onClick={() => setRightTab('properties')}><Settings2 size={15} />属性</button><button className={`right-tab ${rightTab === 'motion' ? 'active' : ''}`} onClick={() => setRightTab('motion')}><WandSparkles size={15} />动效</button><button className={`right-tab ${rightTab === 'ai' ? 'active' : ''}`} onClick={() => { setRightTab('ai'); window.setTimeout(() => document.getElementById('ai-prompt')?.focus(), 0); }}><Sparkles size={15} />AI</button><button className="mobile-back" onClick={() => setMobilePanel('canvas')}>返回画布</button></div>
        <div className={`right-content ${rightTab === 'ai' ? 'ai-focus' : ''} ${rightTab === 'motion' ? 'motion-focus' : ''}`}>
          <section className="inspector-section tree-section">
            <div className="section-title-row"><div><span className="eyebrow">STRUCTURE</span><h2>图层</h2></div><span className="section-count">{tree.length}</span></div>
            {!activePage?.nodes.length ? <div className="tree-empty"><Layers2 size={17} /><span>页面还是空的</span><button onClick={openComponents}>添加组件</button></div> : <div className="layer-tree">{tree.map(({ node, depth }) => <div key={node.id} className={`layer-row ${selection.includes(node.id) ? 'selected' : ''} ${isNodeLocked(activePage.nodes, node.id) ? 'locked' : ''}`} style={{ paddingLeft: 8 + depth * 16 }}>
              {node.children?.length ? <button className="tree-disclosure" onClick={() => setExpanded(value => ({ ...value, [node.id]: value[node.id] === false }))}>{expanded[node.id] === false ? <ChevronRight size={13} /> : <ChevronDown size={13} />}</button> : <span className="tree-spacer" />}
              <button className="layer-select" onClick={event => { selectNode(node.id, event.shiftKey); setRevealId(node.id); setMode('edit'); }}><span className="layer-icon">{nodeIcon(node.type)}</span><span className="layer-name">{nodeLabel(node)}</span><span className="layer-type">{node.type}</span></button>
              <button className="layer-lock" aria-label={`${node.props.editorLocked ? '解锁' : '锁定'}${nodeLabel(node)}`} title={isNodeLocked(activePage.nodes, node.id) && !node.props.editorLocked ? '继承父图层锁定' : node.props.editorLocked ? '解锁图层' : '锁定图层'} disabled={isNodeLocked(activePage.nodes, node.id) && !node.props.editorLocked} onClick={() => patchPage({ nodes: updateNode(activePage.nodes, node.id, { props: { ...node.props, editorLocked: !node.props.editorLocked } }) })}>{isNodeLocked(activePage.nodes, node.id) ? '锁' : '·'}</button>
              {node.id === selectedId && <span className="layer-selected-dot" />}
            </div>)}</div>}
          </section>
          <section className="inspector-section properties-section">
            <div className="section-title-row"><div><span className="eyebrow">PROPERTIES</span><h2>{selectedNode ? nodeLabel(selectedNode) : '属性面板'}</h2></div>{selectedNode && <button className="icon-button small" title="复制组件" onClick={copySelected}><Copy size={15} /></button>}</div>
            {!selectedNode ? <div className="inspector-empty"><div className="empty-spark"><Settings2 size={18} /></div><strong>选择一个组件</strong><p>在画布或图层中选择组件后，可在这里编辑内容、样式和交互。</p><button onClick={openComponents}><Plus size={14} />添加组件</button></div> : <>
              <div className="property-subtabs" role="tablist" aria-label="属性分类">{(['content', 'layout', 'action'] as const).map(tab => <button key={tab} role="tab" aria-selected={propertyTab === tab} className={propertyTab === tab ? 'active' : ''} onClick={() => setPropertyTab(tab)}>{{content:'内容',layout:'位置与样式',action:'交互'}[tab]}</button>)}</div>
              {appearancePresets.some(preset => preset.type === selectedNode.type) && <div className="appearance-presets" aria-label="外观预设">{appearancePresets.filter(preset => preset.type === selectedNode.type).map(preset => <button key={preset.id} onClick={() => updateSelected(applyAppearancePreset(selectedNode, preset.id))}>{preset.label}</button>)}</div>}
              {selectedLocked && <p className="property-note">图层已锁定，解锁后可移动、缩放、排序或删除。</p>}
              <div className="property-group" hidden={propertyTab !== 'content'}><h3>内容</h3>
                {(Object.keys(contentLabels) as (keyof typeof contentLabels)[]).map(key => {
                  const value = selectedNode.props[key];
                  if (value === undefined && primaryContent[selectedNode.type] !== key) return null;
                  const multiline = ['text', 'description', 'subtitle'].includes(key);
                  const onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateSelected({ props: { ...selectedNode.props, [key]: typeof value === 'number' ? Number(event.target.value) : event.target.value } }, `prop-${selectedId}-${key}`);
                  return <label className={`field-row${multiline ? ' multiline-field' : ''}`} key={key}><span>{contentLabels[key]}</span>{multiline ? <textarea aria-label={contentLabels[key]} value={String(value ?? '')} onChange={onChange} placeholder="输入内容" rows={2} /> : <input aria-label={contentLabels[key]} type={typeof value === 'number' ? 'number' : 'text'} value={String(value ?? '')} onChange={onChange} placeholder="输入内容" />}</label>;
                })}
                {(['accordion', 'alert'].includes(selectedNode.type)) && <label className="field-row toggle-property"><span>{selectedNode.type === 'accordion' ? '默认展开' : '允许关闭'}</span><input aria-label={selectedNode.type === 'accordion' ? '默认展开' : '允许关闭'} type="checkbox" checked={Boolean(selectedNode.props[selectedNode.type === 'accordion' ? 'open' : 'dismissible'])} onChange={event => updateSelected({ props: { ...selectedNode.props, [selectedNode.type === 'accordion' ? 'open' : 'dismissible']: event.target.checked } })} /></label>}
                {selectedNode.type === 'image' && <div className="image-property"><label className="field-row"><span>图片地址</span><input value={String(selectedNode.props.src ?? '')} onChange={event => updateSelected({ props: { ...selectedNode.props, src: event.target.value } })} placeholder="粘贴图片链接" /></label><button className="button button-subtle image-pick" onClick={chooseImage}><ImagePlus size={14} />从本地选择</button><input ref={fileRef} type="file" accept="image/*" hidden onChange={event => readImage(event.target.files?.[0])} /></div>}
                {['checkbox', 'switch', 'task', 'habit'].includes(selectedNode.type) && <label className="field-row toggle-property"><span>初始状态</span><input type="checkbox" checked={Boolean(selectedNode.props.checked ?? false)} onChange={event => updateSelected({ props: { ...selectedNode.props, checked: event.target.checked } })} /><span>{selectedNode.props.checked ? '开启' : '关闭'}</span></label>}
                {['input', 'textarea'].includes(selectedNode.type) && <label className="field-row toggle-property"><span>必填字段</span><input type="checkbox" checked={Boolean(selectedNode.props.required ?? false)} onChange={event => updateSelected({ props: { ...selectedNode.props, required: event.target.checked } })} /><span>{selectedNode.props.required ? '是' : '否'}</span></label>}
                {selectedNode.type === 'navbar' && <label className="field-row toggle-property"><span>显示返回键</span><input type="checkbox" checked={Boolean(selectedNode.props.back ?? false)} onChange={event => updateSelected({ props: { ...selectedNode.props, back: event.target.checked } })} /><span>{selectedNode.props.back ? '显示' : '隐藏'}</span></label>}
              </div>
              <div className="property-group" hidden={propertyTab !== 'layout'}><div className="property-heading"><h3>位置</h3><button className="text-button" onClick={() => moveComponent(selectedNode.id, { x: 0, y: 0 })}>复位</button></div><div className="position-fields">{(['offsetX', 'offsetY'] as const).map((axis, index) => <label key={axis}><span>{index === 0 ? 'X' : 'Y'}</span><input aria-label={index === 0 ? '水平偏移' : '垂直偏移'} type="number" min={-5000} max={5000} value={Number(selectedNode.props[axis] ?? 0)} onChange={event => updateSelected({ props: { ...selectedNode.props, [axis]: Math.max(-5000, Math.min(5000, Number(event.target.value))) } })} /><small>px</small></label>)}</div><p className="property-note">相对原布局的位置偏移。拖动调整位置；图层排序调整排列顺序。</p><div className="property-heading"><h3>布局与样式</h3><button className="text-button" onClick={() => updateSelected({ style: {} })}>恢复主题</button></div>
                <label className="field-row"><span>宽度</span><select disabled={selectedLocked} value={String(selectedNode.style.width ?? 'auto')} onChange={event => updateSelected({ style: { ...selectedNode.style, width: event.target.value, flexShrink: 0, flexBasis: 'auto' } })}>{typeof selectedNode.style.width === 'number' && <option value={selectedNode.style.width}>{selectedNode.style.width}px · 自定义</option>}<option value="auto">自动</option><option value="100%">填满</option><option value="50%">一半</option><option value="fit-content">适应内容</option></select></label>
                <SizeControls node={selectedNode} disabled={selectedLocked} onResize={resizeSelected}/>
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
              <div className="property-group" hidden={propertyTab !== 'action'}><div className="property-heading-actions"><h3>动作</h3><span className="mock-badge">本地模拟</span></div>
                <label className="field-row"><span>触发行为</span><select value={selectedAction?.type ?? 'none'} onChange={event => { const type = event.target.value; if (type === 'none') updateSelected({ action: undefined }); else if (type === 'navigate') { const target = project.pages.find(page => page.id !== activePage?.id); if (!target) { showNotice('请先创建另一个页面，再设置跳转', 'info'); return; } setAction({ type, target: target.id }); } else setAction({ type: type as Action['type'], target: undefined }); }}><option value="none">无</option><option value="toast">提示消息</option><option value="navigate">跳转页面</option><option value="toggle">切换状态</option><option value="submit">提交表单</option><option value="dialog">打开对话框</option></select></label>
                {selectedAction?.type === 'navigate' ? <label className="field-row"><span>目标页面</span><select value={selectedAction.target ?? ''} onChange={event => setAction({ target: event.target.value })}>{project.pages.filter(page => page.id !== activePage?.id).map(page => <option value={page.id} key={page.id}>{page.name}</option>)}</select></label> : selectedAction && <label className="field-row"><span>{selectedAction.type === 'toggle' ? '状态名称' : '提示内容'}</span><input value={selectedAction.message ?? ''} onChange={event => setAction({ message: event.target.value })} placeholder="操作完成" /></label>}
              </div>
              <div className="node-tools"><span>图层排序</span><button disabled={selectedLocked} title="上移一层" aria-label="上移一层" onClick={() => patchPage({ nodes: moveNode(activePage!.nodes, selectedNode.id, -1) })}><ArrowUp size={14}/></button><button disabled={selectedLocked} title="下移一层" aria-label="下移一层" onClick={() => patchPage({ nodes: moveNode(activePage!.nodes, selectedNode.id, 1) })}><ArrowDown size={14}/></button><button disabled={selectedLocked} title="嵌套到上方容器" onClick={() => { const index = tree.findIndex(item => item.node.id === selectedNode.id); const parent = tree.slice(0, index).reverse().find(item => ['stack','row','grid','card'].includes(item.node.type) && !containsNode(selectedNode, item.node.id) && !isNodeLocked(activePage!.nodes, item.node.id))?.node; if (parent) { const withoutNode = removeNode(activePage!.nodes, selectedNode.id); patchPage({ nodes: insertNode(withoutNode, selectedNode, parent.id) }); showNotice(`已移入「${nodeLabel(parent)}」`); } else showNotice('上方没有可用的布局容器', 'info'); }}><GripVertical size={14}/>移入容器</button></div>
            </>}
          </section>
          <section className="inspector-section motion-section">
            <div className="section-title-row"><div><span className="eyebrow">MOTION</span><h2>让页面有节奏</h2></div><WandSparkles size={18} /></div>
            {!selectedNode ? <div className="inspector-empty"><div className="empty-spark"><WandSparkles size={18} /></div><strong>为组件添加动效</strong><p>先在画布中选择组件，然后挑选动效。预览时会自动播放。</p></div> : <>
              <p className="motion-selection">正在编辑 <strong>{typeLabels[selectedNode.type]}</strong></p>
              <MotionPicker value={String(selectedNode.props.animation ?? 'none')} onApply={id => updateSelected({ props: { ...selectedNode.props, animation: id } })}/>
              {String(selectedNode.props.animation ?? 'none') !== 'none' && <div className="motion-settings">
                <label className="field-row"><span>时长</span><div className="range-field"><input aria-label="动效时长" type="range" min={100} max={3000} step={100} value={Number(selectedNode.props.animationDuration ?? 600)} onChange={event => updateSelected({ props: { ...selectedNode.props, animationDuration: Number(event.target.value) } })} /><output>{Number(selectedNode.props.animationDuration ?? 600) / 1000}s</output></div></label>
                <label className="field-row"><span>延迟</span><div className="range-field"><input aria-label="动效延迟" type="range" min={0} max={3000} step={100} value={Number(selectedNode.props.animationDelay ?? 0)} onChange={event => updateSelected({ props: { ...selectedNode.props, animationDelay: Number(event.target.value) } })} /><output>{Number(selectedNode.props.animationDelay ?? 0) / 1000}s</output></div></label>
                <label className="field-row"><span>触发方式</span><select value={String(selectedNode.props.animationTrigger ?? 'enter')} onChange={event => updateSelected({ props: { ...selectedNode.props, animationTrigger: event.target.value } })}><option value="enter">页面进入</option><option value="hover">鼠标悬停 / 键盘聚焦</option></select></label>
                <label className="field-row toggle-property"><span>循环播放</span><input aria-label="循环播放" type="checkbox" checked={Boolean(selectedNode.props.animationLoop ?? false)} onChange={event => updateSelected({ props: { ...selectedNode.props, animationLoop: event.target.checked } })} /></label>
                <button className="button button-primary motion-replay" onClick={() => setMotionReplay(value => value + 1)}><Play size={14} />重播选中动效</button>
              </div>}
              <p className="property-note">编辑时保持静止，重播后可继续拖动。跟随系统的减少动态效果设置。</p>
              <a className="motion-source" href="https://github.com/animate-css/animate.css" target="_blank" rel="noreferrer">动效参考 Animate.css ↗</a>
            </>}
          </section>
          <section className="ai-card">
            <div className="ai-card-heading"><span className="ai-icon"><Sparkles size={15} /></span><div><strong>AI 助手</strong><span>描述你想怎么调整</span></div><button className="icon-button small" title="配置模型 API" onClick={openConfig}><Settings2 size={15} /></button></div>
            <label className="ai-scope"><span>修改范围</span><select value={aiScope} onChange={event => setAiScope(event.target.value as typeof aiScope)} disabled={busy === 'ai' || Boolean(draft)}><option value="project">整个项目</option><option value="page">当前页面</option><option value="node" disabled={!selectedId}>选中组件</option></select></label>
            <textarea id="ai-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder={hasApiKey ? '例如：让首页更简洁，突出今日习惯' : '先配置兼容 OpenAI Chat Completions 的模型 API'} disabled={!hasApiKey || busy === 'ai' || Boolean(draft)} />
            <div className="ai-card-footer"><span className={hasApiKey ? 'api-ready' : ''}><span />{hasApiKey ? `已连接 · ${config.model || '自定义模型'}` : '尚未配置模型 API'}</span><button className="button button-primary ai-submit" disabled={!hasApiKey || busy !== null || !prompt.trim()} onClick={createDraft}>{busy === 'ai' ? <LoaderCircle className="spin" size={14} /> : <Sparkles size={14} />}{busy === 'ai' ? '生成中' : '生成草稿'}</button></div>
          </section>
          <div className="right-footer"><span className={`save-indicator ${!syncState.online ? 'cache-warning' : ''}`}><span />{statusText[syncState.phase]}</span><button className="text-button" onClick={openConfig}>API 设置</button></div>
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
    {projectsOpen && <ProjectManager current={project} disabled={busy !== null || !syncState.initialized || syncState.pendingCount > 0} onList={() => { const sync = syncRef.current; if (!sync) return Promise.reject(new Error('本地工作区尚未连接')); return sync.listProjects(); }} onCreate={(name, theme, source) => manageProject(sync => sync.createProject(name, theme, source))} onSwitch={id => manageProject(sync => sync.openProject(id))} onCopy={name => manageProject(sync => sync.duplicateProject(name))} onClose={() => setProjectsOpen(false)}/ >}
    {historyOpen && <ProjectHistory projectId={project.id} onClose={() => setHistoryOpen(false)} onSave={saveProject} onRestore={restoreRevision}/>}
    {recoveryOpen && <RecoveryPanel drafts={recoveryDrafts} onClose={() => setRecoveryOpen(false)} onSaved={async () => { await syncRef.current?.useSaved(); }} onRecover={async (draft, asNew) => { await syncRef.current?.recover(draft, asNew); }}/ >}
    {notice && <div className={`toast toast-${notice.kind}`} role="status"><span className="toast-mark">{notice.kind === 'error' ? '!' : notice.kind === 'info' ? 'i' : <Check size={13} />}</span>{notice.text}<button aria-label="关闭提示" onClick={() => setNotice(undefined)}><X size={14} /></button></div>}
  </main>;
}
