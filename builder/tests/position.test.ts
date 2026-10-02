import test from 'node:test';
import assert from 'node:assert/strict';
import { pointerPosition, readNodePosition } from '../shared/position.ts';

const geometry = { scale: .5, scrollX: 0, scrollY: 0, minX: -100, maxX: 200, minY: -100, maxY: 800 };
test('scaled dragging adds CSS scroll distance once, independently of physical pointer distance', () => {
  assert.deepEqual(pointerPosition({ x: 10, y: 20 }, { x: 20, y: 30 }, { ...geometry, scrollY: 40 }), { x: 50, y: 120 });
});
test('drag bounds keep nodes reachable and cannot overflow persisted offset limits', () => {
  assert.deepEqual(pointerPosition({ x: 0, y: 0 }, { x: -1000, y: 1000 }, geometry), { x: -100, y: 800 });
  assert.equal(pointerPosition({ x: 0, y: 0 }, { x: 99999, y: 0 }, { ...geometry, maxX: 99999 }).x, 5000);
});
test('old projects start at the original layout and invalid runtime offsets are ignored', () => {
  assert.deepEqual(readNodePosition({}), { x: 0, y: 0 });
  assert.deepEqual(readNodePosition({ offsetX: '20px', offsetY: NaN }), { x: 0, y: 0 });
});
