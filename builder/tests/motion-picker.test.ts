import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFile } from 'node:fs/promises';
import { motionPresets } from '../shared/motion.ts';
import { MotionPicker } from '../src/MotionPicker.tsx';

test('motion picker exposes an apply button and a separate touch preview for every preset', async () => {
  const html = renderToStaticMarkup(React.createElement(MotionPicker, { value: 'fade-up', onApply: () => undefined }));
  const tiles = [...html.matchAll(/(<article\b[^>]*data-motion-tile="([^"]+)"[^>]*>(.*?)<\/article>)/g)];
  assert.equal(tiles.length, motionPresets.length);
  assert.deepEqual(tiles.map(([, , id]) => id), motionPresets.map((preset) => preset.id));
  for (const [, article, , tile] of tiles) {
    assert.equal((tile.match(/class="motion-picker-apply"/g) ?? []).length, 1);
    assert.equal((tile.match(/class="motion-picker-play"/g) ?? []).length, 1);
    assert.match(tile, /aria-label="预览[^\"]+动效"/);
    assert.match(article, /data-motion-trigger="hover"/);
    assert.match(tile, /<button class="motion-picker-apply"[^>]*>[\s\S]*?<\/button><button class="motion-picker-play"/);
  }
  assert.match(html, /aria-pressed="true"/);
  const css = await readFile(new URL('../src/library-tools.css', import.meta.url), 'utf8');
  assert.match(css, /\.motion-picker-play[^}]*width:\s*44px/);
  assert.match(css, /\.motion-picker-play[^}]*height:\s*44px/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
