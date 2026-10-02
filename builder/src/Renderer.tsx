import React, { useEffect, useRef, useState } from 'react';
import type { BuilderNode, Project } from '../shared/types';
import { readNodePosition } from '../shared/position';
import { isNodeLocked, normalizeSelection, resizeAxes, type LayoutChange } from '../shared/layout';
import { readMotion, motionStyle } from '../shared/motion';
import { useCanvasDrag } from './useCanvasDrag';
import { ExtendedNode } from './ExtendedNode';
if (typeof document !== 'undefined' && !document.querySelector('link[data-demo-runtime]')) {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('./runtime.css', import.meta.url).href;
  stylesheet.dataset.demoRuntime = 'true';
  document.head.append(stylesheet);
}

export interface RendererProps {
  project: Project;
  pageId: string;
  editing: boolean;
  selectedNodeId?: string;
  selectedNodeIds?: string[];
  onSelect?: (id: string, additive?: boolean) => void;
  onNavigate?: (id: string) => void;
  onMove?: (id: string, position: { x: number; y: number }) => void;
  onLayoutCommit?: (changes: LayoutChange[]) => void;
  motionReplay?: number;
}

type Values = Record<string, string | boolean>;
type StoredTask = { title: string; complete: boolean; pageId: string };

const STYLE_KEYS = new Set([
  'color', 'background', 'fontSize', 'fontWeight', 'padding', 'margin', 'borderRadius',
  'gap', 'textAlign', 'alignItems', 'justifyContent', 'minHeight', 'width', 'height',
  'opacity', 'gridTemplateColumns', 'flexDirection',
]);

function nodeStyle(input: BuilderNode['style']): React.CSSProperties {
  const output: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(input ?? {})) {
    if (STYLE_KEYS.has(key) && (typeof value === 'number' || (typeof value === 'string' && value.length <= 150 && !/url\s*\(|expression\s*\(|[<>;{}]/i.test(value)))) {
      output[key] = value;
    }
  }
  if (typeof input?.width === 'number') { output.flexShrink = 0; output.flexBasis = 'auto'; }
  return output as React.CSSProperties;
}

function textProp(node: BuilderNode, ...keys: string[]): string {
  for (const key of keys) {
    const value = node.props?.[key];
    if (typeof value === 'string' || typeof value === 'number') return String(value);
  }
  return '';
}

function boolProp(node: BuilderNode, ...keys: string[]): boolean {
  return keys.some((key) => node.props?.[key] === true);
}

function childrenOf(node: BuilderNode): BuilderNode[] { return Array.isArray(node.children) ? node.children : []; }

function initialValue(node: BuilderNode): string {
  return textProp(node, 'value', 'defaultValue');
}

export function requiredFieldError(nodes: BuilderNode[], values: Values, pageId: string): string | undefined {
  const fields: BuilderNode[] = [];
  const visit = (items: BuilderNode[]) => items.forEach((node) => {
    if (node.type === 'input' || node.type === 'textarea') fields.push(node);
    visit(childrenOf(node));
  });
  visit(nodes);
  const missing = fields.find((field) => boolProp(field, 'required') && !String(values[`${pageId}/${field.id}`] ?? initialValue(field)).trim());
  return missing ? textProp(missing, 'label', 'placeholder') : undefined;
}

export function Renderer({ project, pageId, editing, selectedNodeId, selectedNodeIds, onSelect, onNavigate, onMove, onLayoutCommit, motionReplay = 0 }: RendererProps) {
  const page = project.pages.find((item) => item.id === pageId);
  const [values, setValues] = useState<Values>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, number>>({});
  const [tasks, setTasks] = useState<StoredTask[]>([]);
  const [toast, setToast] = useState('');
  const [dialog, setDialog] = useState('');
  const selection = normalizeSelection(page?.nodes ?? [], selectedNodeIds ?? (selectedNodeId ? [selectedNodeId] : []));
  const drag = useCanvasDrag({ enabled: editing && Boolean(onMove || onLayoutCommit), pageId, nodes: page?.nodes ?? [], selectedNodeIds: selection, onSelect, onMove, onLayoutCommit });
  const lastReplay = useRef(motionReplay);
  const [replay, setReplay] = useState<{ id: string; token: number; active: boolean }>();
  useEffect(() => {
    if (motionReplay === lastReplay.current) return;
    lastReplay.current = motionReplay;
    if (selectedNodeId) setReplay({ id: selectedNodeId, token: motionReplay, active: true });
  }, [motionReplay, selectedNodeId]);

  const showToast = (message: string) => {
    setToast(message || '已完成');
    window.setTimeout(() => setToast(''), 2600);
  };

  const updateValue = (key: string, value: string | boolean) => setValues((current) => ({ ...current, [key]: value }));

  const taskFilter = (() => {
    if (!page || editing) return '';
    const stack = [...page.nodes];
    while (stack.length) {
      const node = stack.shift()!;
      if (node.type === 'tabs') {
        const options = textProp(node, 'items', 'options').split(/[|,]/).map((item) => item.trim()).filter(Boolean);
        return (options[activeTabs[`${pageId}/${node.id}`] ?? 0] || '').toLowerCase();
      }
      stack.push(...childrenOf(node));
    }
    return '';
  })();

  const submit = (target?: string, message?: string) => {
    const error = requiredFieldError(page?.nodes ?? [], values, pageId);
    if (error !== undefined) {
      showToast(error ? `请填写${error}` : '请完成必填项');
      return;
    }
    const fields: BuilderNode[] = [];
    const visit = (nodes: BuilderNode[]) => nodes.forEach((node) => { if (node.type === 'input' || node.type === 'textarea') fields.push(node); visit(childrenOf(node)); });
    visit(page?.nodes ?? []);
    const titleField = fields.find((field) => /task|title|name/i.test(textProp(field, 'name', 'label', 'placeholder')));
    const title = String((titleField && values[`${pageId}/${titleField.id}`]) || (titleField && initialValue(titleField)) || '').trim();
    if (title) {
      setTasks((current) => [{ title, complete: false, pageId: target || pageId }, ...current]);
      if (titleField) updateValue(`${pageId}/${titleField.id}`, '');
      showToast(message || '已添加任务');
    } else showToast(message || '已保存');
    if (target) onNavigate?.(target);
  };

  const runAction = (node: BuilderNode) => {
    const action = node.action;
    if (!action) { showToast(textProp(node, 'message') || '已完成'); return; }
    switch (action.type) {
      case 'navigate': onNavigate?.(action.target || ''); break;
    case 'toast': showToast(action.message || textProp(node, 'label', 'text') || '已完成'); break;
    case 'dialog': setDialog(action.message || textProp(node, 'title', 'label', 'text') || '详情'); break;
      case 'submit': submit(action.target, action.message); break;
      case 'toggle': setCompleted((current) => ({ ...current, [`${pageId}/${node.id}`]: !current[`${pageId}/${node.id}`] })); break;
    }
  };

  const renderNode = (node: BuilderNode, path: string): React.ReactNode => {
    const key = `${pageId}/${node.id}`;
    const selected = selection.includes(node.id);
    const locked = isNodeLocked(page?.nodes ?? [], node.id);
    const childNodes = childrenOf(node);
    const label = textProp(node, 'label', 'title', 'text', 'name');
    const content = (className = '') => <span className={className}>{label || textProp(node, 'value', 'caption')}</span>;
    const kids = () => childNodes.map((child, index) => <React.Fragment key={`${pageId}/${child.id}`}>{renderNode(child, `${path}/${index}`)}</React.Fragment>);
    const handleClick = (event: React.MouseEvent) => {
      if (editing) {
        event.preventDefault(); event.stopPropagation();
        if (!event.detail || !drag.consumePointerSelection(node.id)) onSelect?.(node.id, event.shiftKey);
      }
    };
    const position = readNodePosition(node.props);
    const motion = readMotion(node.props);
    const isReplaying = editing && replay?.id === node.id && replay.active && selected;
    const nodeKey = editing && replay?.id === node.id ? `${key}/replay-${replay.token}` : key;
    const common = {
      className: `demo-node demo-${node.type}${textProp(node, 'variant') ? ` variant-${textProp(node, 'variant')}` : ''}${editing ? ' is-editing' : ''}${selected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}`,
      style: { ...nodeStyle(node.style), ...motionStyle(motion), ...(isReplaying ? { '--motion-iterations': '1' } : {}), position: 'relative' as const, left: position.x, top: position.y },
      onClick: (event: React.MouseEvent) => { handleClick(event); if (!editing && node.action && !['button', 'tabs', 'switch', 'task', 'habit', 'navbar'].includes(node.type)) runAction(node); },
      'data-node-id': node.id,
      'data-offset-x': position.x,
      'data-offset-y': position.y,
      'data-node-type': node.type,
      'data-resize-axes': locked ? 'none' : resizeAxes(node.type),
      'data-authored-width': typeof node.style.width === 'number' ? 'true' : undefined,
      'data-authored-height': typeof node.style.height === 'number' ? 'true' : undefined,
      'data-animation': motion.preset,
      'data-motion-trigger': isReplaying ? 'enter' : motion.trigger,
      'data-motion-enabled': !editing || isReplaying ? 'true' : 'false',
      onAnimationEnd: () => { if (isReplaying) setReplay(value => value ? { ...value, active: false } : value); },
    };
    const act = (event: React.MouseEvent) => { event.stopPropagation(); if (!editing) runAction(node); };
    const stored = values[`${pageId}/${node.id}`];
    const check = typeof stored === 'boolean' ? stored : boolProp(node, 'checked', 'defaultChecked');
    const completeKey = `${pageId}/${node.id}`;
    const isComplete = completed[completeKey] ?? boolProp(node, 'complete', 'completed', 'checked');

    switch (node.type) {
      case 'stack': return <div key={nodeKey} {...common}>{kids()}</div>;
      case 'row': return <div key={nodeKey} {...common}>{kids()}</div>;
      case 'grid': return <div key={nodeKey} {...common}>{kids()}</div>;
      case 'card': return <section key={nodeKey} {...common}>{label && <h3 className="demo-card-title">{label}</h3>}{kids()}</section>;
      case 'divider': return <hr key={nodeKey} {...common} aria-label={label || 'Divider'} />;
      case 'text': {
        const size = textProp(node, 'variant', 'size').toLowerCase();
        const Tag = size === 'title' || size === 'h1' || size === 'heading' ? 'h1' : size === 'subheading' || size === 'h2' ? 'h2' : size === 'caption' || size === 'eyebrow' ? 'small' : 'p';
        return <Tag key={nodeKey} {...common} className={`${common.className}${['heading','subheading','body','eyebrow','muted','caption','title'].includes(size) ? ` demo-text-${size}` : ''}`}>{label || '文字'}</Tag>;
      }
      case 'image': {
        const src = textProp(node, 'src', 'url');
        return src ? <img key={nodeKey} {...common} src={src} alt={textProp(node, 'alt', 'label') || '图片预览'} /> : <div key={nodeKey} {...common} role="img" aria-label={textProp(node, 'alt', 'label') || '图片占位'}><span className="demo-image-mark">▧</span><span>{textProp(node, 'alt', 'label') || '图片'}</span></div>;
      }
      case 'avatar': {
        const src = textProp(node, 'src', 'url');
        return <span key={nodeKey} {...common} aria-label={label || 'Avatar'}>{src ? <img src={src} alt="" /> : (label || '?').trim().slice(0, 2).toUpperCase()}</span>;
      }
      case 'badge': return <span key={nodeKey} {...common}>{label || '标签'}</span>;
      case 'button': return <button key={nodeKey} {...common} type="button" aria-pressed={node.action?.type === 'toggle' ? isComplete : undefined} onClick={(event) => { handleClick(event); if (!editing) act(event); }}>{content()}{!label && '按钮'}</button>;
      case 'input': return <label key={nodeKey} {...common}><span>{textProp(node, 'label') || textProp(node, 'placeholder') || '单行输入'}</span><input type={textProp(node, 'inputType', 'type') || 'text'} placeholder={textProp(node, 'placeholder')} value={String(stored ?? initialValue(node))} required={boolProp(node, 'required')} onChange={(event) => { if (!editing) updateValue(`${pageId}/${node.id}`, event.target.value); }} onClick={(event) => { if (editing) handleClick(event as unknown as React.MouseEvent); }} /></label>;
      case 'textarea': return <label key={nodeKey} {...common}><span>{textProp(node, 'label') || textProp(node, 'placeholder') || '备注'}</span><textarea placeholder={textProp(node, 'placeholder')} value={String(stored ?? initialValue(node))} required={boolProp(node, 'required')} rows={Number(node.props?.rows) || 3} onChange={(event) => { if (!editing) updateValue(`${pageId}/${node.id}`, event.target.value); }} onClick={(event) => { if (editing) handleClick(event as unknown as React.MouseEvent); }} /></label>;
      case 'checkbox': return <label key={nodeKey} {...common}><input type="checkbox" checked={check} onChange={(event) => { if (!editing) updateValue(`${pageId}/${node.id}`, event.target.checked); }} /><span>{label || '复选框'}</span></label>;
      case 'switch': return <label key={nodeKey} {...common}><span>{label || '开关'}</span><button type="button" className={`demo-switch-control${check ? ' on' : ''}`} role="switch" aria-checked={check} onClick={(event) => { event.stopPropagation(); handleClick(event); if (!editing) updateValue(`${pageId}/${node.id}`, !check); }}><i /></button></label>;
      case 'select': {
        const options = textProp(node, 'options').split(/[|,]/).map((option) => option.trim()).filter(Boolean);
        return <label key={nodeKey} {...common}><span>{textProp(node, 'label') || '选择一项'}</span><select value={String(stored ?? textProp(node, 'value') ?? options[0] ?? '')} onChange={(event) => { if (!editing) updateValue(`${pageId}/${node.id}`, event.target.value); }}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
      }
      case 'progress': { const value = Math.min(100, Math.max(0, Number(node.props?.value) || 0)); return <div key={nodeKey} {...common}><div className="demo-progress-label"><span>{label || '进度'}</span><strong>{value}%</strong></div><div className="demo-progress-track"><i style={{ width: `${value}%` }} /></div></div>; }
      case 'stat': return <div key={nodeKey} {...common}><span>{label || '数据'}</span><strong>{textProp(node, 'value', 'amount') || '0'}</strong>{textProp(node, 'caption', 'change') && <small>{textProp(node, 'caption', 'change')}</small>}</div>;
      case 'task': {
        const title = label || '一件重要的小事';
        if ((taskFilter.includes('完成') && !taskFilter.includes('进行') && !isComplete) || ((taskFilter.includes('进行') || taskFilter.includes('active') || taskFilter.includes('progress')) && isComplete)) return null;
        return <article key={nodeKey} {...common} onClick={(event) => { handleClick(event); if (!editing && node.action) runAction(node); }}><button type="button" className={`demo-task-check${isComplete ? ' checked' : ''}`} aria-label={isComplete ? '标记为未完成' : '标记为已完成'} onClick={(event) => { event.stopPropagation(); handleClick(event); if (!editing) setCompleted((current) => ({ ...current, [completeKey]: !isComplete })); }}>{isComplete ? '✓' : ''}</button><div className={`demo-task-copy${isComplete ? ' complete' : ''}`}><strong>{title}</strong><span>{textProp(node, 'subtitle', 'description', 'time') || '今天 · 个人'}</span></div>{textProp(node, 'tag', 'category') && <span className="demo-task-tag">{textProp(node, 'tag', 'category')}</span>}</article>;
      }
      case 'habit': {
        const days = textProp(node, 'days', 'streak') || '3';
        return <article key={nodeKey} {...common}><div className="demo-habit-icon">✦</div><div className="demo-task-copy"><strong>{label || '每日习惯'}</strong><span>{textProp(node, 'subtitle', 'description') || `已连续坚持 ${days} 天`}</span></div><button className={`demo-habit-check${isComplete ? ' checked' : ''}`} type="button" aria-label="标记习惯完成" onClick={(event) => { event.stopPropagation(); handleClick(event); if (!editing) setCompleted((current) => ({ ...current, [completeKey]: !isComplete })); }}>{isComplete ? '✓' : '+'}</button></article>;
      }
      case 'navbar': {
        const title = textProp(node, 'title', 'brand', 'label') || '页面标题';
        return <nav key={nodeKey} {...common} aria-label={title}>{childNodes.length ? kids() : <><span className="demo-navbar-leading">{boolProp(node, 'back') ? <button type="button" aria-label="返回上一页" onClick={(event) => { handleClick(event); if (!editing) runAction(node); }}>‹</button> : null}</span><strong className="demo-navbar-title">{title}</strong><span className="demo-navbar-trailing" /></>}</nav>;
      }
      case 'tabs': {
        const labels = childNodes.length ? childNodes.map((child) => textProp(child, 'label', 'title', 'text') || child.id) : textProp(node, 'items', 'options').split(/[|,]/).filter(Boolean).map((item) => item.trim());
        const active = activeTabs[completeKey] ?? 0;
        return <div key={nodeKey} {...common}><div className="demo-tablist" role="tablist" aria-label={label || '分类'}>{labels.map((item, index) => <button key={`${item}-${index}`} type="button" role="tab" aria-selected={active === index} className={active === index ? 'active' : ''} onClick={(event) => { event.stopPropagation(); handleClick(event); if (!editing) setActiveTabs((current) => ({ ...current, [completeKey]: index })); }}>{item}</button>)}</div>{childNodes.length > 0 && <div className="demo-tab-panel">{renderNode(childNodes[active] || childNodes[0], `${path}/tab${active}`)}</div>}</div>;
      }
      case 'empty': return <div key={nodeKey} {...common}><div className="demo-empty-icon">✦</div><strong>{label || '留一点空间给新的计划'}</strong><span>{textProp(node, 'description', 'subtitle') || '创建你的第一个目标，慢慢向前。'}</span>{kids()}</div>;
      default: return <ExtendedNode key={nodeKey} node={node} editing={editing} common={common} onAction={() => { if (!editing) runAction(node); }} />;
    }
  };

  if (!page) return <div className={`demo-root theme-${project.theme}`}><div className="demo-missing">此页面暂不可用。</div></div>;
  return <div ref={drag.rootRef} {...drag.handlers} className={`demo-root theme-${project.theme}${editing ? ' is-editing' : ''}${drag.draggingId ? ' is-dragging' : ''}`} data-page-id={page.id}>
    {editing && !page.nodes.length && <div className="demo-editor-empty"><span>＋</span><strong>从一个组件开始</strong><p>在左侧组件库中选择内容，添加后拖动调整位置。</p></div>}
    {page.nodes.map((node, index) => <React.Fragment key={`${page.id}/${node.id}`}>{renderNode(node, String(index))}</React.Fragment>)}
    {tasks.some((task) => task.pageId === pageId) && <section className="demo-created-tasks" aria-live="polite"><h3>新建任务</h3>{tasks.filter((task) => task.pageId === pageId).map((task, index) => <article key={`${task.title}-${index}`} className="demo-task"><button type="button" className={`demo-task-check${task.complete ? ' checked' : ''}`} onClick={() => setTasks((current) => current.map((item) => item === task ? { ...item, complete: !item.complete } : item))}>{task.complete ? '✓' : ''}</button><div className={`demo-task-copy${task.complete ? ' complete' : ''}`}><strong>{task.title}</strong><span>刚刚 · 个人</span></div></article>)}</section>}
    {toast && <div className="demo-toast" role="status">{toast}</div>}
    {dialog && <div className="demo-dialog-backdrop" role="presentation" onClick={() => setDialog('')}><section className="demo-dialog" role="dialog" aria-modal="true" aria-label={dialog} onClick={(event) => event.stopPropagation()}><button className="demo-dialog-close" type="button" aria-label="关闭" onClick={() => setDialog('')}>×</button><div className="demo-dialog-icon">✦</div><h2>{dialog}</h2><p>停下来想一想，安排好今天最重要的事。</p><button type="button" className="demo-dialog-ok" onClick={() => setDialog('')}>知道了</button></section></div>}
  </div>;
}

export default Renderer;
