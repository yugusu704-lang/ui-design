import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildApp } from '../server/app.ts';
import { seedProject } from '../shared/model.ts';
import { ProjectSync } from '../src/project-sync.ts';
import type { DraftRecord } from '../shared/storage.ts';

async function fixture(run: (app: Awaited<ReturnType<typeof buildApp>>, fetcher: (url: string, init?: RequestInit) => Promise<Response>) => Promise<void>) {
  const directory = await mkdtemp(path.join(tmpdir(), 'atelier-sync-sqlite-'));
  const app = await buildApp({ dataDir: directory });
  const fetcher = async (url: string, init?: RequestInit) => {
    const response = await app.inject({ method: (init?.method ?? 'GET') as 'GET' | 'POST' | 'PUT', url, headers: { origin: 'http://127.0.0.1:5173', 'content-type': 'application/json' }, ...(init?.body ? { payload: String(init.body) } : {}) });
    return new Response(response.body, { status: response.statusCode });
  };
  try { await run(app, fetcher); }
  finally { await app.close(); await rm(directory, { recursive: true, force: true }); }
}

test('fresh unedited project saves and can be copied using the actual SQLite API', async () => {
  await fixture(async (app, fetcher) => {
    const sync = new ProjectSync(seedProject, { clientId: 'integration-client', fetch: fetcher, auto: false });
    try {
      await sync.start(); await sync.manual(); assert.equal(sync.state.saveVersion, 1); assert.equal(sync.state.phase, 'saved');
      const copied = await sync.copyCurrent(); assert.notEqual(copied.id, seedProject.id); await sync.manual();
      assert.equal(sync.state.saveVersion, 1);
      const original = (await app.inject(`/api/projects/${seedProject.id}`)).json(); assert.equal(original.saveVersion, 1); assert.deepEqual(original.project, seedProject);
      const drafts = (await app.inject('/api/drafts?clientId=integration-client')).json().drafts as DraftRecord[];
      assert.equal(drafts.length, 2); assert.ok(drafts.every(draft => draft.editSeq >= 1));
    } finally { sync.dispose(); }
  });
});

test('lost completed-save response retries the identical request without a duplicate revision', async () => {
  await fixture(async (app, fetcher) => {
    const bodies: string[] = []; let dropped = false;
    const sync = new ProjectSync(seedProject, { clientId: 'retry-client', auto: false, fetch: async (url, init) => {
      const response = await fetcher(url, init);
      if (url === '/api/projects' && init?.method === 'POST') { bodies.push(String(init.body)); if (!dropped) { dropped = true; throw new Error('connection lost after commit'); } }
      return response;
    } });
    try {
      await sync.start(); await sync.manual(); assert.equal(bodies.length, 2); assert.equal(bodies[0], bodies[1]);
      const history = (await app.inject(`/api/projects/${seedProject.id}/revisions`)).json(); assert.equal(history.revisions.length, 1); assert.equal(sync.state.saveVersion, 1);
    } finally { sync.dispose(); }
  });
});

test('two clients conflict without overwriting the published project and retain the losing draft', async () => {
  await fixture(async (app, fetcher) => {
    const a = new ProjectSync(seedProject, { clientId: 'a', fetch: fetcher, auto: false });
    const b = new ProjectSync(seedProject, { clientId: 'b', fetch: fetcher, auto: false });
    try {
      await a.start(); await a.manual(); await b.start();
      await a.manual({ ...structuredClone(seedProject), name: 'client-a winner' });
      await assert.rejects(b.manual({ ...structuredClone(seedProject), name: 'client-b draft' }), /冲突/);
      assert.equal(b.state.phase, 'conflict');
      assert.equal((await app.inject(`/api/projects/${seedProject.id}`)).json().project.name, 'client-a winner');
      assert.equal((await app.inject('/api/drafts?clientId=b')).json().drafts[0].project.name, 'client-b draft');
    } finally { a.dispose(); b.dispose(); }
  });
});
