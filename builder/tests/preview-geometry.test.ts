import assert from 'node:assert/strict';
import test from 'node:test';
import { fitPhonePreview, phoneDevices } from '../src/preview-geometry.ts';

test('provides the fixed compact, standard, and large device presets', () => {
  assert.deepEqual(phoneDevices, [
    { id: 'compact', label: '紧凑', width: 360, height: 800 },
    { id: 'standard', label: '标准', width: 390, height: 844 },
    { id: 'large', label: '大屏', width: 430, height: 932 },
  ]);
});

test('fit mode includes a 6px border on each side and keeps the viewport dimensions', () => {
  assert.deepEqual(fitPhonePreview(phoneDevices[1]!, { width: 402, height: 856 }), {
    width: 402,
    height: 856,
    scale: 1,
    displayWidth: 402,
    displayHeight: 856,
  });
});

test('fit mode scales down to the limiting available width or height', () => {
  const widthLimited = fitPhonePreview(phoneDevices[1]!, { width: 201, height: 1000 });
  assert.deepEqual(widthLimited, { width: 402, height: 856, scale: 0.5, displayWidth: 201, displayHeight: 428 });

  const heightLimited = fitPhonePreview(phoneDevices[1]!, { width: 1000, height: 428 });
  assert.deepEqual(heightLimited, { width: 402, height: 856, scale: 0.5, displayWidth: 201, displayHeight: 428 });
});

test('fit mode never enlarges previews when the available area is larger', () => {
  assert.deepEqual(fitPhonePreview(phoneDevices[0]!, { width: 1200, height: 1600 }), {
    width: 372,
    height: 812,
    scale: 1,
    displayWidth: 372,
    displayHeight: 812,
  });
});

test('fit mode returns a zero scale for non-positive or non-finite available dimensions', () => {
  for (const available of [
    { width: 0, height: 500 },
    { width: 300, height: -1 },
    { width: Number.NaN, height: 500 },
    { width: 300, height: Number.POSITIVE_INFINITY },
  ]) {
    const result = fitPhonePreview(phoneDevices[1]!, available);
    assert.equal(result.scale, 0);
    assert.equal(result.displayWidth, 0);
    assert.equal(result.displayHeight, 0);
  }
});

test('actual mode stays at 1:1 regardless of hidden or unavailable space', () => {
  assert.deepEqual(fitPhonePreview(phoneDevices[2]!, { width: 100, height: 100 }, 'actual'), {
    width: 442,
    height: 944,
    scale: 1,
    displayWidth: 442,
    displayHeight: 944,
  });
});

test('each preset keeps the same outer-frame aspect ratio after fitting', () => {
  for (const device of phoneDevices) {
    const result = fitPhonePreview(device, { width: 250, height: 600 });
    assert.ok(Math.abs(result.displayWidth / result.displayHeight - result.width / result.height) < 1e-12);
    assert.ok(result.displayWidth <= 250);
    assert.ok(result.displayHeight <= 600);
    assert.equal(result.width, device.width + 12);
    assert.equal(result.height, device.height + 12);
  }
});
