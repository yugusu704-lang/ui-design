import assert from 'node:assert/strict';
import test from 'node:test';
import { canonical, ProjectSync } from '../src/project-sync.ts';
import { seedProject } from '../shared/model.ts';

const copy = (name: string) => ({ ...structuredClone(seedProject), name });
const ok = (value: unknown) => new Response(JSON.stringify(value), { status: 200 });

test('manual checkpoints retain clicked snapshots and follow only their own confirmed version chain', async () => {
  const writes: Array<Record<string, any>> = [];
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  const fetcher = async (url: string, init?: RequestInit) => {
    if (url.startsWith('/api/save-requests')) return ok({ requests: [] });
    if (url.startsWith('/api/drafts') && !init) return ok({ drafts: [] });
    if (url.startsWith('/api/drafts')) return ok({ draft: JSON.parse(String(init?.body)) });
    if (url === '/api/projects' && !init) return ok([copy('saved')]);
    if (url.startsWith('/api/projects/') && !init) return ok({ project: copy('saved'), saveVersion: 1, updatedAt: 'now' });
    if (url === '/api/projects') {
      const body = JSON.parse(String(init?.body)); writes.push(body);
      if (writes.length === 1) await gate;
      return ok({ ...body, projectId: body.project.id, status: 'completed', saveVersion: writes.length + 1, updatedAt: 'now' });
    }
    return ok({ ready: true });
  };
  const sync = new ProjectSync(copy('saved'), { fetch: fetcher, clientId: 'client-a', auto: false });
  try {
    await sync.start();
    const first = sync.manual(copy('first'));
    await new Promise(resolve => setTimeout(resolve, 10));
    const second = sync.manual(copy('second'));
    sync.edit(copy('newer memory'));
    release();
    await Promise.all([first, second]);
    assert.deepEqual(writes.map(write => [write.project.name, write.baseVersion]), [['first', 1], ['second', 2]]);
    assert.notEqual(writes[0]!.requestId, writes[1]!.requestId);
  } finally { sync.dispose(); }
});

test('a stale manual chain pauses queued publishing while draft synchronization stays available', async () => {
  let saves = 0, drafts = 0;
  const fetcher = async (url: string, init?: RequestInit) => {
    if (url.startsWith('/api/save-requests')) return ok({ requests: [] });
    if (url.startsWith('/api/drafts') && !init) return ok({ drafts: [] });
    if (url.startsWith('/api/drafts')) { drafts++; return ok({ draft: {} }); }
    if (url === '/api/projects' && !init) return ok([copy('saved')]);
    if (url.startsWith('/api/projects/') && !init) return ok({ project: copy('saved'), saveVersion: 1, updatedAt: 'now' });
    if (url === '/api/projects') { saves++; return new Response(JSON.stringify({ error: 'stale version' }), { status: 409 }); }
    return ok({ ready: true });
  };
  const sync = new ProjectSync(copy('saved'), { fetch: fetcher, clientId: 'client-a', auto: false });
  try {
    await sync.start();
    const results = await Promise.allSettled([sync.manual(copy('one')), sync.manual(copy('two'))]);
    assert.ok(results.every(result => result.status === 'rejected'));
    assert.equal(saves, 1); assert.equal(sync.state.phase, 'conflict');
    sync.edit(copy('still editable')); await sync.flush();
    assert.ok(drafts >= 3); assert.equal(sync.state.phase, 'conflict');
  } finally { sync.dispose(); }
});

test('failed SQLite preservation prevents saved-version replacement', async () => {
  let loaded = 0, disconnected = false;
  const fetcher = async (url: string, init?: RequestInit) => {
    if (disconnected) throw new Error('offline');
    if (url.startsWith('/api/save-requests')) return ok({ requests: [] });
    if (url.startsWith('/api/drafts')) return ok({ drafts: [] });
    if (url === '/api/projects') return ok([copy('saved')]);
    if (url.startsWith('/api/projects/')) return ok({ project: copy('saved'), saveVersion: 1, updatedAt: 'now' });
    return ok({ ready: true });
  };
  const sync = new ProjectSync(copy('saved'), { fetch: fetcher, clientId: 'client-a', auto: false, onProject: () => loaded++ });
  try {
    await sync.start(); sync.edit(copy('unsent')); disconnected = true;
    await assert.rejects(sync.useSaved(), /offline/);
    assert.equal(loaded, 1); assert.equal(sync.state.phase, 'offline'); assert.equal(sync.state.memoryOnly, true);
  } finally { sync.dispose(); }
});

test('canonical snapshots ignore object insertion order but retain array order', () => {
  assert.equal(canonical({ b: 2, a: [1, 2] }), canonical({ a: [1, 2], b: 2 }));
  assert.notEqual(canonical([1, 2]), canonical([2, 1]));
});

test('resending an unchanged draft after saving preserves its frozen base and sequence', async () => {
  const uploads: any[] = [];
  const fetcher = async (url: string, init?: RequestInit) => {
    if (url.startsWith('/api/save-requests')) return ok({ requests: [] });
    if (url.startsWith('/api/drafts') && !init) return ok({ drafts: [] });
    if (url.startsWith('/api/drafts')) { uploads.push(JSON.parse(String(init?.body))); return ok({ draft: {} }); }
    if (url === '/api/projects' && !init) return ok([copy('saved')]);
    if (url.startsWith('/api/projects/') && !init) return ok({ project: copy('saved'), saveVersion: 1, updatedAt: 'now' });
    if (url === '/api/projects') return ok({ status: 'completed', saveVersion: 2, updatedAt: 'now' });
    return ok({ ready: true });
  };
  const sync = new ProjectSync(copy('saved'), { fetch: fetcher, clientId: 'a', auto: false });
  try { await sync.start(); await sync.manual(copy('changed')); await sync.flush(); assert.deepEqual(uploads[1], uploads[0]); }
  finally { sync.dispose(); }
});

test('loading a saved version aborts if an edit arrives after preservation', async () => {
  let loadCount = 0, replacing = false, release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  const fetcher = async (url: string, init?: RequestInit) => {
    if (url.startsWith('/api/save-requests')) return ok({ requests: [] });
    if (url.startsWith('/api/drafts')) return ok(init ? { draft: {} } : { drafts: [] });
    if (url === '/api/projects') return ok([copy('saved')]);
    if (url.startsWith('/api/projects/')) { if (replacing) await gate; return ok({ project: copy('saved'), saveVersion: 1, updatedAt: 'now' }); }
    return ok({ ready: true });
  };
  const sync = new ProjectSync(copy('saved'), { fetch: fetcher, clientId: 'a', auto: false, onProject: () => loadCount++ });
  try {
    await sync.start(); replacing = true; const operation = sync.useSaved();
    await new Promise(resolve => setTimeout(resolve, 10)); sync.edit(copy('newer unsent edit')); release();
    await assert.rejects(operation, /修改|changed/);
    assert.equal(loadCount, 1); assert.equal(sync.state.memoryOnly, true);
  } finally { release(); sync.dispose(); }
});

test('new edits replace an unsent automatic snapshot while a manual save is in flight', async () => {
  const names: string[] = []; let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  const fetcher = async (url: string, init?: RequestInit) => {
    if (url.startsWith('/api/save-requests')) return ok({ requests: [] });
    if (url.startsWith('/api/drafts')) return ok(init ? { draft: {} } : { drafts: [] });
    if (url === '/api/projects' && !init) return ok([copy('saved')]);
    if (url.startsWith('/api/projects/')) return ok({ project: copy('saved'), saveVersion: 1, updatedAt: 'now' });
    if (url === '/api/projects') { names.push(JSON.parse(String(init?.body)).project.name); if (names.length === 1) await gate; return ok({ status: 'completed', saveVersion: names.length + 1, updatedAt: 'now' }); }
    return ok({ ready: true });
  };
  const sync = new ProjectSync(copy('saved'), { fetch: fetcher, clientId: 'a' });
  try {
    await sync.start(); const first = sync.manual(copy('manual'));
    await new Promise(resolve => setTimeout(resolve, 20)); sync.edit(copy('old auto'));
    await new Promise(resolve => setTimeout(resolve, 1600)); sync.edit(copy('latest auto')); release(); await first;
    await new Promise(resolve => setTimeout(resolve, 20)); assert.deepEqual(names, ['manual']);
  } finally { release(); sync.dispose(); }
});
