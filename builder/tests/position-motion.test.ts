import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { seedProject, validateProject } from '../shared/model.ts';
import { Renderer } from '../src/Renderer.tsx';

test('version 1 documents retain position and motion through JSON and shared rendering', () => {
  const project = structuredClone(seedProject);
  const node = project.pages[0].nodes[1];
  node.props = { ...node.props, offsetX: 24, offsetY: 48, animation: 'fade-in', animationDuration: 800, animationDelay: 200 };
  const restored = validateProject(JSON.parse(JSON.stringify(project)));
  assert.deepEqual(restored.pages[0].nodes[1].props, node.props);
  const html = renderToStaticMarkup(React.createElement(Renderer, { project: restored, pageId: restored.pages[0].id, editing: false }));
  assert.match(html, /data-offset-x="24"/);
  assert.match(html, /left:24px;top:48px/);
  assert.match(html, /data-animation="fade-in"/);
  assert.match(html, /--motion-duration:800ms/);
});

test('unsafe or unbounded reserved position and animation props cannot reach persistence', () => {
  for (const props of [{ offsetX: 5001 }, { offsetY: '10px' }, { animation: 'custom;evil' }, { animationDelay: -1 }, { animationLoop: 'yes' }]) {
    const project = structuredClone(seedProject);
    Object.assign(project.pages[0].nodes[0].props, props);
    assert.throws(() => validateProject(project));
  }
});
