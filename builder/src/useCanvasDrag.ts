import { useEffect, useRef, useState, type MouseEvent, type PointerEvent, type DragEvent } from 'react';
import { pointerPosition, type DragGeometry, type Position } from '../shared/position';

interface Options { enabled: boolean; pageId: string; onSelect?: (id: string) => void; onMove?: (id: string, position: Position) => void }
interface Gesture {
  id: string; pointerId: number; element: HTMLElement; root: HTMLDivElement;
  pointer: Position; start: Position; current: Position; geometry: DragGeometry;
  scroll: Position; moved: boolean; left: string; top: string;
}

export function useCanvasDrag(options: Options) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | undefined>(undefined);
  const latest = useRef(options);
  latest.current = options;
  const suppressClick = useRef<{ id: string; time: number } | undefined>(undefined);
  const [draggingId, setDraggingId] = useState<string>();

  const finish = (commit: boolean) => {
    const drag = gesture.current;
    if (!drag) return;
    gesture.current = undefined;
    drag.element.style.left = drag.left;
    drag.element.style.top = drag.top;
    drag.element.classList.remove('is-dragging');
    if (drag.root.hasPointerCapture(drag.pointerId)) drag.root.releasePointerCapture(drag.pointerId);
    setDraggingId(undefined);
    if (drag.moved) suppressClick.current = { id: drag.id, time: Date.now() };
    if (commit && drag.moved && (drag.current.x !== drag.start.x || drag.current.y !== drag.start.y)) latest.current.onMove?.(drag.id, drag.current);
  };

  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && gesture.current) { event.preventDefault(); finish(false); }
    };
    const root = rootRef.current;
    const wheel = (event: WheelEvent) => { if (gesture.current?.moved) event.preventDefault(); };
    window.addEventListener('keydown', escape);
    root?.addEventListener('wheel', wheel, { passive: false });
    return () => { window.removeEventListener('keydown', escape); root?.removeEventListener('wheel', wheel); finish(false); };
  }, [options.enabled, options.pageId]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!latest.current.enabled || gesture.current || !event.isPrimary || event.button !== 0) return;
    const root = rootRef.current;
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-node-id]') : null;
    if (!root || !target || !root.contains(target)) return;
    const id = target.dataset.nodeId!;
    const selectedBefore = target.classList.contains('is-selected');
    latest.current.onSelect?.(id);
    if (event.pointerType === 'touch' && !selectedBefore) return;
    event.preventDefault();
    const rootRect = root.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const scale = rootRect.width / root.offsetWidth || 1;
    const start = { x: Number(target.dataset.offsetX) || 0, y: Number(target.dataset.offsetY) || 0 };
    const baseX = (rect.left - rootRect.left) / scale - start.x;
    const baseY = (rect.top - rootRect.top) / scale + root.scrollTop - start.y;
    gesture.current = {
      id, pointerId: event.pointerId, element: target, root, pointer: { x: event.clientX, y: event.clientY }, start, current: start,
      scroll: { x: root.scrollLeft, y: root.scrollTop }, moved: false, left: target.style.left, top: target.style.top,
      geometry: { scale, scrollX: 0, scrollY: 0, minX: 24 - rect.width / scale - baseX, maxX: root.clientWidth - 24 - baseX,
        minY: -baseY, maxY: Math.max(root.scrollHeight, root.clientHeight) - 24 - baseY },
    };
    root.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = gesture.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const delta = { x: event.clientX - drag.pointer.x, y: event.clientY - drag.pointer.y };
    if (!drag.moved && Math.hypot(delta.x, delta.y) < 4) return;
    event.preventDefault();
    if (!drag.moved) { drag.moved = true; drag.element.classList.add('is-dragging'); setDraggingId(drag.id); }
    drag.current = pointerPosition(drag.start, delta, { ...drag.geometry, scrollX: drag.root.scrollLeft - drag.scroll.x, scrollY: drag.root.scrollTop - drag.scroll.y });
    drag.element.style.left = `${drag.current.x}px`;
    drag.element.style.top = `${drag.current.y}px`;
  };
  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const suppressed = suppressClick.current;
    if (!suppressed) return;
    suppressClick.current = undefined;
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-node-id]') : null;
    if (Date.now() - suppressed.time < 500 && (!target || target.dataset.nodeId === suppressed.id)) { event.preventDefault(); event.stopPropagation(); }
  };
  return { rootRef, draggingId, cancel: () => finish(false), handlers: {
    onPointerDown, onPointerMove,
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => { if (gesture.current?.pointerId === event.pointerId) finish(true); },
    onPointerCancel: (event: PointerEvent<HTMLDivElement>) => { if (gesture.current?.pointerId === event.pointerId) finish(false); },
    onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => { if (gesture.current?.pointerId === event.pointerId) finish(false); },
    onClickCapture,
    onDragStart: (event: DragEvent) => { if (latest.current.enabled) event.preventDefault(); },
  } };
}
