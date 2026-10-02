import assert from 'node:assert/strict';
import { copyFile, mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
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

test('newer database schemas are rejected without downgrading their version marker', async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'builder-future-schema-'));
  const filename = path.join(dataDir, 'projects.sqlite');
  const original = new DatabaseSync(filename); original.exec('PRAGMA user_version = 2'); original.close();
  try {
    await assert.rejects(async () => { const unexpected = await buildApp({ dataDir }); await unexpected.close(); }, /newer|更新|较新/i);
    const db = new DatabaseSync(filename);
    try { assert.equal((db.prepare('PRAGMA user_version').get() as { user_version: number }).user_version, 2); }
    finally { db.close(); }
  } finally { await rm(dataDir, { recursive: true, force: true }); }
});

async function withApp(run: (app: Awaited<ReturnType<typeof buildApp>>, dataDir: string) => Promise<void>, options: Omit<BuildAppOptions, 'dataDir'> = {}) {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'builder-server-'));
  const app = await buildApp({ ...options, dataDir });
  try { await run(app, dataDir); }
  finally { await app.close(); await rm(dataDir, { recursive: true, force: true }); }
}

const origin = { Origin: 'http://127.0.0.1:5173' };
function savePayload(overrides: Record<string, unknown> = {}) {
  return { project, clientId: 'client-a', baseVersion: 0, kind: 'manual', requestId: 'save-1', ...overrides };
}

test('project saves require a version and return the versioned envelope', async () => {
  await withApp(async (app, dataDir) => {
    const missingVersion = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: { project } });
    assert.equal(missingVersion.statusCode, 428);
    const created = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload() });
    assert.equal(created.statusCode, 200);
    assert.equal(created.json().status, 'completed');
    assert.equal(created.json().saveVersion, 1);
    assert.deepEqual(created.json().project, project);
    assert.deepEqual((await app.inject('/api/projects')).json(), [project]);
    assert.deepEqual((await app.inject('/api/projects/habit-demo')).json(), {
      project, saveVersion: 1, updatedAt: created.json().updatedAt,
    });

    const invalid = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload({ project: { ...project, version: 88 }, requestId: 'invalid' }) });
    assert.equal(invalid.statusCode, 400);

    const db = new DatabaseSync(path.join(dataDir, 'projects.sqlite'));
    assert.equal((db.prepare('SELECT COUNT(*) AS count FROM revisions WHERE project_id = ?').get(project.id) as { count: number }).count, 1);
    assert.equal((db.prepare('SELECT save_version FROM projects WHERE id = ?').get(project.id) as { save_version: number }).save_version, 1);
    db.close();
    const persisted = await readFile(path.join(dataDir, 'projects.sqlite'));
    assert.ok(persisted.length > 0);
  });
});

test('request hashes are canonical, autos can be no-ops, and manual saves advance history', async () => {
  await withApp(async app => {
    const created = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload() });
    const reordered = { pages: project.pages, theme: project.theme, name: project.name, id: project.id, version: project.version };
    const retry = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload({ project: reordered }) });
    assert.equal(retry.statusCode, 200);
    assert.equal(retry.json().saveVersion, 1);

    const auto = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload({ kind: 'auto', requestId: 'auto-1', baseVersion: 1 }) });
    assert.equal(auto.statusCode, 200);
    assert.equal(auto.json().saveVersion, 1);
    const manual = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload({ requestId: 'manual-2', baseVersion: 1, label: 'Checkpoint' }) });
    assert.equal(manual.json().saveVersion, 2);

    const revisions = await app.inject(`/api/projects/${project.id}/revisions`);
    assert.equal(revisions.json().revisions.length, 2);
    assert.deepEqual(revisions.json().revisions.map((revision: { kind: string; label?: string; saveVersion: number }) => [revision.kind, revision.label, revision.saveVersion]), [
      ['manual', 'Checkpoint', 2], ['manual', undefined, 1],
    ]);
    const detail = await app.inject(`/api/projects/${project.id}/revisions/${revisions.json().revisions[0].id}`);
    assert.deepEqual(detail.json().revision.project, project);
    const stale = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload({ requestId: 'stale-1', baseVersion: 1 }) });
    assert.equal(stale.statusCode, 409);
    assert.equal(stale.json().receipt.status, 'conflict');
    assert.equal(created.json().saveVersion, 1);

    const reused = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload({ requestId: 'save-1', label: 'changed hash' }) });
    assert.equal(reused.statusCode, 409);
    const reusedWithDifferentDraftAck = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload({ requestId: 'save-1', draftId: 'draft-other', editSeq: 1 }) });
    assert.equal(reusedWithDifferentDraftAck.statusCode, 409);
    const allReceipts = await app.inject('/api/save-requests?clientId=client-a');
    assert.equal(allReceipts.json().requests.length, 4);
    assert.equal((await app.inject('/api/save-requests?clientId=client-a&pending=true')).json().requests.length, 0);
  });
});

test('revision history pages contain 30 entries and use an exclusive before cursor', async () => {
  await withApp(async app => {
    for (let version = 0; version < 31; version++) {
      const response = await app.inject({
        method: 'POST', url: '/api/projects', headers: origin,
        payload: savePayload({ baseVersion: version, requestId: `page-${version}` }),
      });
      assert.equal(response.statusCode, 200);
    }
    const firstPage = (await app.inject(`/api/projects/${project.id}/revisions`)).json();
    assert.equal(firstPage.revisions.length, 30);
    assert.equal(firstPage.hasMore, true);
    const cursor = firstPage.revisions.at(-1).id;
    const secondPage = (await app.inject(`/api/projects/${project.id}/revisions?before=${cursor}`)).json();
    assert.equal(secondPage.revisions.length, 1);
    assert.equal(secondPage.hasMore, false);
    assert.ok(secondPage.revisions[0].id < cursor);
  });
});

test('draft sequence is immutable by owner, and saves acknowledge only the matching draft', async () => {
  await withApp(async app => {
    await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload() });
    const changed: Project = structuredClone(project);
    changed.name = 'Recovered copy';
    const draftPayload = { project: changed, clientId: 'client-a', baseVersion: 1, editSeq: 1 };
    const uploaded = await app.inject({ method: 'PUT', url: '/api/drafts/draft-a', headers: origin, payload: draftPayload });
    assert.equal(uploaded.statusCode, 200);
    assert.equal(uploaded.json().draft.editSeq, 1);
    const retry = await app.inject({ method: 'PUT', url: '/api/drafts/draft-a', headers: origin, payload: draftPayload });
    assert.equal(retry.statusCode, 200);
    assert.equal(retry.json().draft.updatedAt, uploaded.json().draft.updatedAt);
    const sameSeqChanged = await app.inject({ method: 'PUT', url: '/api/drafts/draft-a', headers: origin, payload: { ...draftPayload, project: { ...changed, name: 'different' } } });
    assert.equal(sameSeqChanged.statusCode, 409);
    const older = await app.inject({ method: 'PUT', url: '/api/drafts/draft-a', headers: origin, payload: { ...draftPayload, editSeq: 0 } });
    assert.equal(older.statusCode, 400);

    const saved = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload({ project: changed, baseVersion: 1, requestId: 'save-draft', draftId: 'draft-a', editSeq: 1 }) });
    assert.equal(saved.json().saveVersion, 2);
    assert.equal((await app.inject('/api/drafts?clientId=client-a&projectId=habit-demo')).json().drafts[0].savedVersion, 2);

    const newer = { ...draftPayload, editSeq: 2, project: { ...changed, name: 'Newer unsaved text' } };
    await app.inject({ method: 'PUT', url: '/api/drafts/draft-a', headers: origin, payload: newer });
    const staleSequence = await app.inject({ method: 'PUT', url: '/api/drafts/draft-a', headers: origin, payload: { ...draftPayload, editSeq: 1 } });
    assert.equal(staleSequence.statusCode, 409);
    const oldAck = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload({ project: changed, baseVersion: 2, requestId: 'old-seq-save', draftId: 'draft-a', editSeq: 1 }) });
    assert.equal(oldAck.statusCode, 200);
    assert.equal(oldAck.json().saveVersion, 3);
    const currentDraft = (await app.inject('/api/drafts?clientId=client-a')).json().drafts[0];
    assert.equal(currentDraft.editSeq, 2);
    assert.equal(currentDraft.project.name, 'Newer unsaved text');
    assert.equal(currentDraft.savedVersion, undefined);

    const stolen = await app.inject({ method: 'PUT', url: '/api/drafts/draft-a', headers: origin, payload: { ...newer, clientId: 'client-b' } });
    assert.equal(stolen.statusCode, 409);
    const archived = await app.inject({ method: 'POST', url: '/api/drafts/draft-a/archive', headers: origin, payload: { clientId: 'client-a' } });
    assert.equal(archived.json().draft.archived, true);
  });
});

test('durable pending saves recover on app restart', async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'builder-pending-'));
  let app = await buildApp({ dataDir, processPending: false });
  try {
    const firstProject: Project = structuredClone(project);
    firstProject.name = 'First queued snapshot';
    const secondProject: Project = structuredClone(project);
    secondProject.name = 'Second queued snapshot';
    const accepted = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload({ project: firstProject, requestId: 'save-first' }) });
    assert.equal(accepted.statusCode, 202);
    assert.equal(accepted.json().status, 'pending');
    const acceptedSecond = await app.inject({ method: 'POST', url: '/api/projects', headers: origin, payload: savePayload({ project: secondProject, requestId: 'save-second', baseVersion: 1 }) });
    assert.equal(acceptedSecond.json().status, 'pending');
    assert.deepEqual((await app.inject('/api/save-requests?clientId=client-a&pending=true')).json().requests.map((receipt: { requestId: string }) => receipt.requestId), ['save-first', 'save-second']);
    await app.close();
    app = await buildApp({ dataDir });
    const envelope = (await app.inject('/api/projects/habit-demo')).json();
    assert.equal(envelope.saveVersion, 2);
    assert.equal(envelope.project.name, 'Second queued snapshot');
    assert.equal((await app.inject('/api/save-requests/save-first?clientId=client-a')).json().status, 'completed');
    assert.equal((await app.inject('/api/save-requests/save-second?clientId=client-a')).json().status, 'completed');
    assert.equal((await app.inject('/api/save-requests?clientId=client-a&pending=true')).json().requests.length, 0);
  } finally {
    await app.close();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test('legacy SQLite migration creates a recoverable backup and is repeatable', async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), 'builder-migration-'));
  const databasePath = path.join(dataDir, 'projects.sqlite');
  const legacy = new DatabaseSync(databasePath);
  legacy.exec(`
    CREATE TABLE projects (id TEXT PRIMARY KEY, document TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE revisions (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, document TEXT NOT NULL, created_at TEXT NOT NULL);
  `);
  legacy.prepare('INSERT INTO projects(id,document,updated_at) VALUES(?,?,?)').run(project.id, JSON.stringify(project), '2026-01-01T00:00:00.000Z');
  legacy.prepare('INSERT INTO revisions(project_id,document,created_at) VALUES(?,?,?)').run(project.id, JSON.stringify(project), '2026-01-01T00:00:00.000Z');
  legacy.prepare('INSERT INTO revisions(project_id,document,created_at) VALUES(?,?,?)').run(project.id, JSON.stringify(project), '2026-01-02T00:00:00.000Z');
  legacy.close();
  let app = await buildApp({ dataDir });
  try {
    assert.equal((await app.inject(`/api/projects/${project.id}`)).json().saveVersion, 2);
    const revisions = (await app.inject(`/api/projects/${project.id}/revisions`)).json().revisions;
    assert.deepEqual(revisions.map((revision: { saveVersion: number }) => revision.saveVersion), [2, 1]);
    const backups = (await readdir(dataDir)).filter(file => file.includes('.pre-migration-') && file.endsWith('.bak'));
    assert.equal(backups.length, 1);

    await app.close();
    app = await buildApp({ dataDir });
    const backupsAfterRestart = (await readdir(dataDir)).filter(file => file.includes('.pre-migration-') && file.endsWith('.bak'));
    assert.equal(backupsAfterRestart.length, 1);

    const backupDb = new DatabaseSync(path.join(dataDir, backups[0]!), { readOnly: true });
    assert.equal((backupDb.prepare('PRAGMA table_info(projects)').all() as Array<{ name: string }>).some(column => column.name === 'save_version'), false);
    backupDb.close();

    const restoreDir = await mkdtemp(path.join(tmpdir(), 'builder-migration-restore-'));
    try {
      await copyFile(path.join(dataDir, backups[0]!), path.join(restoreDir, 'projects.sqlite'));
      const restored = await buildApp({ dataDir: restoreDir });
      try {
        assert.equal((await restored.inject(`/api/projects/${project.id}`)).json().saveVersion, 2);
        assert.equal((await restored.inject(`/api/projects/${project.id}/revisions`)).json().revisions.length, 2);
      } finally { await restored.close(); }
    } finally { await rm(restoreDir, { recursive: true, force: true }); }
  } finally {
    await app.close();
    await rm(dataDir, { recursive: true, force: true });
  }
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
