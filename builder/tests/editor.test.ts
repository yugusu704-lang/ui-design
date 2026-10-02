import test from 'node:test';
import assert from 'node:assert/strict';
import { duplicateNode, insertAfter } from '../shared/editor.ts';
import type { BuilderNode } from '../shared/types.ts';

const title: BuilderNode = { id: 'title', type: 'text', props: { text: 'Hello' }, style: {} };
const button: BuilderNode = { id: 'button', type: 'button', props: { label: 'Continue' }, style: {}, action: { type: 'navigate', target: 'home' } };
const group: BuilderNode = { id: 'group', type: 'stack', props: {}, style: {}, children: [title, button] };

test('insertion follows a selected nested sibling without moving it out of its container', () => {
  const node = { ...title, id: 'new' };
  const output = insertAfter([group], node, 'title');
  assert.deepEqual(output[0].children?.map(item => item.id), ['title', 'new', 'button']);
  assert.deepEqual(group.children?.map(item => item.id), ['title', 'button']);
});

test('duplication renews descendant IDs, preserves actions and does not share editable data', () => {
  let counter = 0;
  const copy = duplicateNode(group, () => `copy-${++counter}`);
  assert.deepEqual([copy.id, ...copy.children!.map(item => item.id)], ['copy-1', 'copy-2', 'copy-3']);
  assert.deepEqual(copy.children![1].action, button.action);
  copy.children![0].props.text = 'Changed';
  assert.equal(title.props.text, 'Hello');
});
