import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAppearancePreset } from '../shared/appearance.ts';
import { createNode } from '../shared/model.ts';

test('text appearance changes typography and color without replacing content or action', () => {
  const source = createNode('text');
  source.props.text = 'A note worth keeping';
  source.props.variant = 'body';
  source.props.offsetX = 24;
  source.props.offsetY = -8;
  source.style = { width: 220, height: 60, margin: 4, color: '#123456' };
  source.action = { type: 'toast', message: 'Saved locally' };

  const result = applyAppearancePreset(source, 'text-heading');
  assert.equal(result.props.text, source.props.text);
  assert.equal(result.props.offsetX, 24);
  assert.equal(result.props.offsetY, -8);
  assert.deepEqual(result.action, source.action);
  assert.equal(result.style.width, 220);
  assert.equal(result.style.height, 60);
  assert.equal(result.style.margin, 4);
  assert.equal(result.style.fontSize, 24);
  assert.equal(result.props.variant, 'heading');
  assert.equal(source.style.fontSize, undefined);
});

test('button appearance changes only approved presentation fields', () => {
  const source = createNode('button');
  source.props.label = 'Continue';
  source.props.offsetX = 11;
  source.style = { width: 'fit-content', height: 48, padding: 6, borderRadius: 4 };
  source.action = { type: 'navigate', target: 'profile' };

  const result = applyAppearancePreset(source, 'button-secondary');
  assert.equal(result.props.label, 'Continue');
  assert.equal(result.props.offsetX, 11);
  assert.deepEqual(result.action, source.action);
  assert.equal(result.style.width, 'fit-content');
  assert.equal(result.style.height, 48);
  assert.equal(result.style.padding, 12);
  assert.equal(result.style.borderRadius, 12);
  assert.equal(result.props.variant, 'secondary');
});

test('card appearance keeps geometry and rejects presets for the wrong component type', () => {
  const card = createNode('card');
  card.style = { width: 260, height: 180, gap: 16, padding: 8 };
  const result = applyAppearancePreset(card, 'card-soft');
  assert.equal(result.style.width, 260);
  assert.equal(result.style.height, 180);
  assert.equal(result.style.gap, 16);
  assert.equal(result.style.padding, 16);
  assert.throws(() => applyAppearancePreset(card, 'text-heading'));
});
