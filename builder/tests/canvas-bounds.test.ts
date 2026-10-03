import assert from 'node:assert/strict';
import test from 'node:test';
import { movementBounds } from '../shared/layout.ts';

test('full-width flow nodes can move horizontally while retaining a reachable part of every selection', () => {
  const bounds = movementBounds([{ left: 24, top: 40, width: 342, height: 100, x: 0, y: 0 }], 390, 844);
  assert.ok(bounds.minX < 0); assert.ok(bounds.maxX > 0); assert.ok(bounds.minY <= 0); assert.ok(bounds.maxY > 0);
});

test('group movement intersects each node reachability and persisted offset limits', () => {
  const bounds = movementBounds([{ left: 24, top: 40, width: 50, height: 30, x: 4998, y: 0 }, { left: 240, top: 200, width: 100, height: 50, x: 0, y: -4998 }], 390, 844);
  assert.equal(bounds.maxX, 2); assert.equal(bounds.minY, -2); assert.ok(bounds.minX <= 0); assert.ok(bounds.maxY >= 0);
});
