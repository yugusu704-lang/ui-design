import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { COMPONENT_TYPES } from '../shared/model.ts';
import { ComponentThumbnail } from '../src/ComponentThumbnail.tsx';

test('all component thumbnails render distinct static SVGs without interactive controls', () => {
  const markup = COMPONENT_TYPES.map((type) => renderToStaticMarkup(React.createElement(ComponentThumbnail, { type })));
  assert.equal(markup.length, 36);
  assert.equal(new Set(markup).size, 36);
  for (const [index, html] of markup.entries()) {
    assert.match(html, new RegExp(`data-component-thumbnail="${COMPONENT_TYPES[index]}"`));
    assert.match(html, /<svg[^>]*role="img"/);
    assert.doesNotMatch(html, /<(?:button|input|select|textarea|img)\b/i);
  }
});
