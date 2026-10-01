import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildApp } from '../server/app.ts';
import type { Project } from '../shared/types.ts';

const project: Project = {
  version: 1, id: 'export-demo', name: 'Export demo', theme: 'editorial',
  pages: [{ id: 'home', name: 'Home', nodes: [{ id: 'headline', type: 'text', props: { text: 'Demo' }, style: {} }] }],
};

test('export endpoint returns a downloadable React project archive', async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'builder-export-'));
  const app = await buildApp({ dataDir });
  try {
    await app.inject({ method: 'POST', url: '/api/config', headers: { Origin: 'http://127.0.0.1:5173' }, payload: { baseUrl: 'https://api.example.test/v1', model: 'test-model', apiKey: 'never-export-this-key' } });
    const response = await app.inject({ method: 'POST', url: '/api/export', headers: { Origin: 'http://127.0.0.1:5173' }, payload: { project } });
    assert.equal(response.statusCode, 200);
    assert.match(response.headers['content-type'] ?? '', /application\/zip/);
    assert.ok(response.rawPayload.length > 0);
    assert.equal(response.rawPayload.includes(Buffer.from('never-export-this-key')), false);
  } finally {
    await app.close();
    await rm(dataDir, { recursive: true, force: true });
  }
});
