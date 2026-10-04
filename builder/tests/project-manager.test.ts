import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProjectManager } from '../src/ProjectManager.tsx';
import type { Project } from '../shared/types.ts';

const current: Project = {
  version: 1,
  id: 'current-project',
  name: '晨间计划',
  theme: 'editorial',
  pages: [],
};

test('project manager exposes creation, project-list, current-project, and copy actions', () => {
  const markup = renderToStaticMarkup(createElement(ProjectManager, {
    current,
    onList: async () => [current],
    onCreate: async () => {},
    onSwitch: async () => {},
    onCopy: async () => {},
    onClose: () => {},
  }));

  assert.match(markup, /新建项目/);
  assert.match(markup, /项目列表/);
  assert.match(markup, /晨间计划/);
  assert.match(markup, /当前项目/);
  assert.match(markup, /复制当前项目/);
});
