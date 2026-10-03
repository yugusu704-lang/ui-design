import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useCanvasDrag } from '../src/useCanvasDrag.ts';

// Node has no DOM. These elements expose the geometry and pointer APIs used by
// the real hook, including an active animation that changes the measured rect.
class GestureElement {
  dataset: Record<string, string> = { nodeId: 'text', nodeType: 'text', resizeAxes: 'width', motionEnabled: 'true' };
  style = { left: '', top: '', width: '', height: '', animation: '', setProperty() {}, removeProperty() {} };
  classes = new Set(['is-selected']);
  classList = { contains: (name: string) => this.classes.has(name), add: (name: string) => { this.classes.add(name); }, remove: (...names: string[]) => { names.forEach(name => this.classes.delete(name)); } };
  closest() { return this; }
  getBoundingClientRect() { const left = 20 + (this.style.animation === 'none' ? 0 : 17); return { left, right: left + 40, top: 20, bottom: 60, width: 40, height: 40 }; }
}

test('drag snapping measures the static rectangle after stopping replay and restores motion on cancel', () => {
  const originalElement = globalThis.Element;
  Object.assign(globalThis, { Element: GestureElement });
  const element = new GestureElement();
  const root = { dataset: {}, style: element.style, offsetWidth: 200, clientWidth: 200, clientHeight: 200, scrollHeight: 200, scrollLeft: 0, scrollTop: 0,
    contains: () => true, querySelectorAll: () => [element], getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200 }),
    setPointerCapture() {}, hasPointerCapture: () => false, releasePointerCapture() {},
  };
  let hook!: ReturnType<typeof useCanvasDrag>;
  function Harness() { hook = useCanvasDrag({ enabled: true, pageId: 'page', nodes: [{ id: 'text', type: 'text', props: {}, style: {} }], selectedNodeIds: ['text'] }); return null; }
  try {
    renderToStaticMarkup(React.createElement(Harness));
    hook.rootRef.current = root as unknown as HTMLDivElement;
    const event = { target: element, isPrimary: true, button: 0, pointerId: 1, pointerType: 'mouse', clientX: 30, clientY: 30, shiftKey: false, altKey: false, preventDefault() {} };
    hook.handlers.onPointerDown(event as any);
    hook.handlers.onPointerMove({ ...event, clientX: 40 } as any);
    assert.equal(element.style.left, '12px', 'static left 20 plus pointer delta 10 must snap to 32');
    hook.handlers.onPointerCancel(event as any);
    assert.equal(element.style.left, '');
    assert.equal(element.style.animation, '');
    assert.equal(element.dataset.motionEnabled, 'true');
  } finally { Object.assign(globalThis, { Element: originalElement }); }
});

test('starting image resize preserves its displayed height when the CSS cap is removed', () => {
  const originalElement = globalThis.Element;
  Object.assign(globalThis, { Element: GestureElement });
  const element = new GestureElement();
  element.dataset.nodeType = 'image'; element.dataset.resizeAxes = 'both';
  const normalRect = element.getBoundingClientRect.bind(element);
  element.getBoundingClientRect = () => { const rect = normalRect(); const height = element.style.height ? parseFloat(element.style.height) : element.classes.has('is-resizing') ? 180 : 40; return { ...rect, height, bottom: rect.top + height }; };
  const root = { dataset: {}, style: element.style, offsetWidth: 200, clientWidth: 200, clientHeight: 200, scrollHeight: 200, scrollLeft: 0, scrollTop: 0,
    contains: () => true, querySelectorAll: () => [element], getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200 }),
    setPointerCapture() {}, hasPointerCapture: () => false, releasePointerCapture() {},
  };
  let hook!: ReturnType<typeof useCanvasDrag>;
  function Harness() { hook = useCanvasDrag({ enabled: true, pageId: 'page', nodes: [{ id: 'text', type: 'image', props: {}, style: {} }], selectedNodeIds: ['text'] }); return null; }
  try {
    renderToStaticMarkup(React.createElement(Harness)); hook.rootRef.current = root as unknown as HTMLDivElement;
    const event = { target: element, isPrimary: true, button: 0, pointerId: 1, pointerType: 'mouse', clientX: 75, clientY: 58, shiftKey: false, altKey: false, preventDefault() {} };
    hook.handlers.onPointerDown(event as any);
    assert.equal(element.getBoundingClientRect().height, 40, 'pointerdown must not jump to the uncapped intrinsic height');
    hook.handlers.onPointerCancel(event as any);
    assert.equal(element.style.height, '');
  } finally { Object.assign(globalThis, { Element: originalElement }); }
});
