import assert from 'node:assert/strict';
import test from 'node:test';
import { alignSelection, constrainNodeSize, isNodeLocked, normalizeSelection, resizeAxes, snapToGrid, snapToGuide } from '../shared/layout.ts';
import type { BuilderNode } from '../shared/types.ts';

const tree: BuilderNode[] = [
  { id: 'locked', type: 'card', props: { editorLocked: true }, style: {}, children: [
    { id: 'child', type: 'text', props: {}, style: {} },
  ] },
  { id: 'free', type: 'stack', props: {}, style: {}, children: [
    { id: 'leaf', type: 'button', props: {}, style: {} },
  ] },
];

test('normalizes selected nodes by removing descendants of selected ancestors', () => {
  assert.deepEqual(normalizeSelection(tree, ['child', 'free', 'locked', 'leaf', 'free']), ['locked', 'free']);
});

test('inherits editor locks from every ancestor', () => {
  assert.equal(isNodeLocked(tree, 'child'), true);
  assert.equal(isNodeLocked(tree, 'locked'), true);
  assert.equal(isNodeLocked(tree, 'leaf'), false);
  assert.equal(isNodeLocked(tree, 'missing'), false);
});

test('snaps layout values to the nearest eight pixel grid point', () => {
  assert.equal(snapToGrid(13), 16);
  assert.equal(snapToGrid(-13), -16);
});

test('snaps to a nearby guide in screen pixels and lets Alt bypass snapping', () => {
  assert.equal(snapToGuide(100, [106], 0.5), 106);
  assert.equal(snapToGuide(100, [106], 0.5, true), 100);
  assert.equal(snapToGuide(100, [113], 0.5), 100);
});

test('aligns every selected center to the center of the combined bounds', () => {
  const aligned = alignSelection([
    { id: 'small', left: 0, top: 0, width: 20, height: 10 },
    { id: 'large', left: 40, top: 20, width: 60, height: 30 },
  ], 'centerX');
  assert.deepEqual(aligned, [
    { id: 'small', position: { x: 40, y: 0 } },
    { id: 'large', position: { x: 20, y: 20 } },
  ]);
});

test('respects node resize axes and clamps dimensions to canvas bounds', () => {
  assert.equal(resizeAxes('divider'), 'none');
  assert.equal(resizeAxes('avatar'), 'square');
  assert.equal(resizeAxes('image'), 'both');
  assert.deepEqual(constrainNodeSize('avatar', { width: 12 }, 120), { width: 24, height: 24 });
  assert.deepEqual(constrainNodeSize('card', { width: 500, height: 20 }, 240, 420), { width: 240, height: 420 });
  assert.deepEqual(constrainNodeSize('card', { width: 500, height: 3000 }, 240, 420), { width: 240, height: 2000 });
  assert.deepEqual(constrainNodeSize('button', { width: 12 }, 180), { width: 24 });
  assert.equal(constrainNodeSize('divider', { width: 50 }, 180), undefined);
});
