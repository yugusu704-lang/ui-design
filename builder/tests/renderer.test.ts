import test from 'node:test';
import assert from 'node:assert/strict';
import { requiredFieldError } from '../src/Renderer';
import type { BuilderNode } from '../shared/types';

const form: BuilderNode[] = [{
  id: 'form', type: 'stack', props: {}, style: {}, children: [
    { id: 'task-name', type: 'input', props: { label: 'Task name', required: true }, style: {} },
    { id: 'notes', type: 'textarea', props: { label: 'Notes' }, style: {} },
  ],
}];

test('requiredFieldError rejects an empty required field, including whitespace', () => {
  assert.equal(requiredFieldError(form, { 'today/task-name': '   ' }, 'today'), 'Task name');
});

test('requiredFieldError accepts a completed required field and ignores other pages', () => {
  assert.equal(requiredFieldError(form, { 'today/task-name': 'Plan the week', 'other/task-name': '' }, 'today'), undefined);
  assert.equal(requiredFieldError(form, { 'other/task-name': 'Plan the week' }, 'today'), 'Task name');
});
