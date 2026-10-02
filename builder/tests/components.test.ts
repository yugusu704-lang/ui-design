import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { COMPONENT_TYPES, createNode, validateProject } from '../shared/model.ts';
import { componentGroups } from '../shared/catalog.ts';
import { Renderer } from '../src/Renderer.tsx';

test('every palette component produces a valid, supported portable node', () => {
  const types = componentGroups.flatMap(group => group.items.map(item => item.type));
  assert.equal(new Set(types).size, COMPONENT_TYPES.length);
  assert.deepEqual(new Set(types), new Set(COMPONENT_TYPES));
  const project = validateProject({ version: 1, id: 'catalog', name: 'Catalog', theme: 'nordic', pages: [{ id: 'home', name: 'Home', nodes: types.map(createNode) }] });
  const html = renderToStaticMarkup(React.createElement(Renderer, { project, pageId: 'home', editing: false }));
  assert.equal((html.match(/data-node-id=/g) ?? []).length, types.length);
  assert.ok(!html.includes('暂不支持此组件'));
});
test('extended widgets retain native semantics and escape user content', () => {
  const alert = createNode('alert');
  alert.props.title = '<img src=x onerror=evil()>';
  const project = validateProject({ version: 1, id: 'semantic', name: 'Semantic', theme: 'nordic', pages: [{ id: 'home', name: 'Home', nodes: [alert, createNode('accordion'), createNode('radio'), createNode('slider')] }] });
  const html = renderToStaticMarkup(React.createElement(Renderer, { project, pageId: 'home', editing: false }));
  assert.match(html, /role="status"/);
  assert.match(html, /<details/);
  assert.match(html, /type="radio"/);
  assert.match(html, /type="range"/);
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<img src=x'));
});
