import test from 'node:test';
import assert from 'node:assert/strict';
import { readMotion, validateMotion, motionStyle } from '../shared/motion.ts';

test('legacy nodes remain static and malformed runtime values get safe defaults', () => {
  assert.deepEqual(readMotion({}), { preset: 'none', duration: 600, delay: 0, trigger: 'enter', loop: false });
  assert.equal(readMotion({ animation: 'invalid', animationDuration: NaN }).preset, 'none');
});
test('motion duration, delay and loops have strict persistence boundaries', () => {
  const invalid: Record<string, string | number | boolean>[] = [{ animationDuration: 99 }, { animationDelay: Infinity }, { animationTrigger: 'click' }, { animationLoop: 'true' }];
  for (const props of invalid) assert.throws(() => validateMotion(props));
  const props = { animation: 'fade-up', animationDuration: 3000, animationDelay: 3000, animationLoop: true };
  assert.doesNotThrow(() => validateMotion(props));
  assert.equal(motionStyle(readMotion(props))['--motion-iterations'], 'infinite');
});
