import { useEffect, useState } from 'react';
import type { BuilderNode } from '../shared/types';
import { resizeAxes } from '../shared/layout';

export function SizeControls({ node, disabled, onResize }: { node: BuilderNode; disabled: boolean; onResize: (axis: 'width' | 'height', value: number) => void }) {
  const [width, setWidth] = useState(typeof node.style.width === 'number' ? String(node.style.width) : '');
  const [height, setHeight] = useState(typeof node.style.height === 'number' ? String(node.style.height) : '');
  useEffect(() => { setWidth(typeof node.style.width === 'number' ? String(node.style.width) : ''); setHeight(typeof node.style.height === 'number' ? String(node.style.height) : ''); }, [node.id, node.style.width, node.style.height]);
  const axes = resizeAxes(node.type); if (axes === 'none') return null;
  return <div className="position-fields size-fields">{(['width','height'] as const).filter(axis => axis === 'width' || axes !== 'width').map(axis => <label key={axis}><span>{axis === 'width' ? '宽' : '高'}</span><input aria-label={axis === 'width' ? '组件宽度' : '组件高度'} type="number" min={axis === 'width' || axes === 'square' ? 24 : 32} max={axis === 'width' ? 5000 : 2000} disabled={disabled} placeholder="自动" value={axis === 'width' ? width : height} onChange={event => (axis === 'width' ? setWidth : setHeight)(event.target.value)} onBlur={event => { if (event.target.value && Number.isFinite(Number(event.target.value))) onResize(axis, Number(event.target.value)); }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }}/><small>px</small></label>)}</div>;
}
