import test from 'node:test';
import assert from 'node:assert/strict';
import { addTemplatePage, createTemplatePage } from '../shared/templates.ts';
import { seedProject, validateProject } from '../shared/model.ts';

test('template pages receive fresh ids and validate with local-only actions', () => {
  let next = 0;
  const page = createTemplatePage('login', () => `fresh-${++next}`);
  assert.equal(page.id, 'fresh-1');
  assert.ok(page.nodes.length > 0);
  assert.equal(new Set([page.id, ...page.nodes.map((node) => node.id)]).size, page.nodes.length + 1);
  const project = validateProject({ ...seedProject, pages: [page] });
  const targets = project.pages.flatMap((item) => item.nodes.flatMap((node) => node.action?.target ? [node.action.target] : []));
  assert.ok(targets.every((target) => project.pages.some((item) => item.id === target)));
  assert.ok(project.pages.flatMap((item) => item.nodes).every((node) => !Object.values(node.props).some((value) => typeof value === 'string' && /^https?:/i.test(value))));
});

test('adding a template preserves the input and existing pages', () => {
  const original = structuredClone(seedProject);
  let next = 0;
  const updated = addTemplatePage(original, 'profile', () => `added-${++next}`);
  assert.deepEqual(original, seedProject);
  assert.equal(updated.pages.length, original.pages.length + 1);
  assert.deepEqual(updated.pages.slice(0, original.pages.length), original.pages);
  assert.notEqual(updated.pages.at(-1)?.id, original.pages[0].id);
  assert.doesNotThrow(() => validateProject(updated));
});

test('template ids avoid collisions with ids already in the project', () => {
  let next = 0;
  const updated = addTemplatePage(seedProject, 'product', () => ['home', 'home-head', 'new-page', 'new-node'][next++] ?? `fresh-${next}`);
  const page = updated.pages.at(-1)!;
  const allIds = [page.id, ...page.nodes.map((node) => node.id)];
  assert.equal(new Set(allIds).size, allIds.length);
  assert.notEqual(page.id, 'home');
  assert.notEqual(page.nodes[0].id, 'home-head');
});

test('adding a template rejects a project at the page limit', () => {
  const full = { ...seedProject, pages: Array.from({ length: 30 }, (_, index) => ({ id: `page-${index}`, name: `Page ${index}`, nodes: [] })) };
  assert.throws(() => addTemplatePage(full, 'login', () => `fresh-${Math.random()}`));
});
