import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { buildApp, type BuildAppOptions } from '../server/app.ts';
import type { Project } from '../shared/types.ts';

const project: Project = {
  version: 1,
  id: 'habit-demo',
  name: 'Habit demo',
  theme: 'nordic',
  pages: [{ id: 'home', name: 'Home', nodes: [{ id: 'title', type: 'text', props: { text: 'Hello' }, style: {} }] }],
};

async function withApp(run: (app: Awaited<ReturnType<typeof buildApp>>, dataDir: string) => Promise<void>, options: Omit<BuildAppOptions, 'dataDir'> = {}) {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'builder-server-'));
  const app = await buildApp({ ...options, dataDir });
  try { await run(app, dataDir); }
  finally { await app.close(); await rm(dataDir, { recursive: true, force: true }); }
}

test('projects persist in SQLite and invalid project data is rejected', async () => {
  await withApp(async (app, dataDir) => {
    const origin = { Origin: 'http://127.0.0.1:5173' };
    const created = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: { project } });
    assert.equal(created.statusCode, 200);
    assert.deepEqual(created.json(), { project });
    assert.deepEqual((await app.inject('/api/projects')).json(), [project]);
    assert.deepEqual((await app.inject('/api/projects/habit-demo')).json(), { project });

    const invalid = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: { project: { ...project, version: 88 } } });
    assert.equal(invalid.statusCode, 400);

    const db = new DatabaseSync(path.join(dataDir, 'projects.sqlite'));
    assert.equal((db.prepare('SELECT COUNT(*) AS count FROM revisions WHERE project_id = ?').get(project.id) as { count: number }).count, 1);
    db.close();
    const persisted = await readFile(path.join(dataDir, 'projects.sqlite'));
    assert.ok(persisted.length > 0);
  });
});

test('AI draft validates the complete project and preserves selected-node scope', async () => {
  const changed: Project = structuredClone(project);
  changed.pages[0]!.nodes[0]!.props.text = 'A calmer headline';
  await withApp(async app => {
    const origin = { Origin: 'http://127.0.0.1:5173' };
    await app.inject({ method: 'POST', url: '/api/config', headers: origin, payload: { baseUrl: 'https://api.example.test/v1', model: 'mock-model', apiKey: 'test-key' } });
    const response = await app.inject({ method: 'POST', url: '/api/ai/draft', headers: origin, payload: { project, prompt: '润色标题', selectedNodeId: 'title', pageId: 'home' } });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { project: changed });
  }, { fetch: async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(changed) } }] }), { status: 200 }) });

  const outOfScope = structuredClone(changed);
  outOfScope.name = 'AI changed project metadata';
  await withApp(async app => {
    const origin = { Origin: 'http://localhost:5173' };
    await app.inject({ method: 'POST', url: '/api/config', headers: origin, payload: { baseUrl: 'https://api.example.test/v1', model: 'mock-model', apiKey: 'test-key' } });
    const response = await app.inject({ method: 'POST', url: '/api/ai/draft', headers: origin, payload: { project, prompt: '润色标题', selectedNodeId: 'title' } });
    assert.equal(response.statusCode, 502);
    assert.match(response.json().error, /选中组件所在页面的其他内容/);
  }, { fetch: async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(outOfScope) } }] }), { status: 200 }) });
});

test('AI upstream failures produce a friendly error', async () => {
  await withApp(async app => {
    const origin = { Origin: 'http://127.0.0.1:5173' };
    await app.inject({ method: 'POST', url: '/api/config', headers: origin, payload: { baseUrl: 'https://api.example.test/v1', model: 'mock-model', apiKey: 'test-key' } });
    const response = await app.inject({ method: 'POST', url: '/api/ai/draft', headers: origin, payload: { project, prompt: '润色标题' } });
    assert.equal(response.statusCode, 502);
    assert.match(response.json().error, /请求过多/);
  }, { fetch: async () => new Response('rate limited', { status: 429 }) });
});

test('config returns only safe fields and keeps the API key in private server config', async () => {
  await withApp(async (app, dataDir) => {
    const saved = await app.inject({
      method: 'POST', url: '/api/config', headers: { Origin: 'http://localhost:5173' },
      payload: { baseUrl: 'https://api.example.test/v1', model: 'example-model', apiKey: 'secret-test-key' },
    });
    assert.equal(saved.statusCode, 200);
    assert.deepEqual(saved.json(), { baseUrl: 'https://api.example.test/v1', model: 'example-model', hasKey: true });
    const config = await app.inject('/api/config');
    assert.deepEqual(config.json(), { baseUrl: 'https://api.example.test/v1', model: 'example-model', hasKey: true });
    assert.equal(JSON.stringify(config.json()).includes('secret-test-key'), false);
    assert.equal((await readFile(path.join(dataDir, 'config.json'), 'utf8')).includes('secret-test-key'), true);

    const denied = await app.inject({
      method: 'POST', url: '/api/config', headers: { Origin: 'https://evil.example' }, payload: { baseUrl: '', model: '', apiKey: '' },
    });
    assert.equal(denied.statusCode, 403);
  });
});
