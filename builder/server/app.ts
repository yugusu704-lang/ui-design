import Fastify, { type FastifyInstance } from 'fastify';
import fastifyStatic from '@fastify/static';
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import type { BuilderNode, DraftRequest, Project } from '../shared/types.ts';
import { COMPONENT_TYPES, STYLE_KEYS, validateProject } from '../shared/model.ts';
import { exportProject } from '../shared/export.ts';

const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url));
const BUILDER_DIR = path.resolve(SERVER_DIR, '..');
const DEFAULT_DATA_DIR = path.join(BUILDER_DIR, 'data');
const BODY_LIMIT = 20 * 1024 * 1024;
const AI_TIMEOUT_MS = 60_000;

interface SavedConfig {
  baseUrl: string;
  model: string;
  apiKey?: string;
}

export interface BuildAppOptions {
  dataDir?: string;
  distDir?: string;
  fetch?: typeof globalThis.fetch;
}

function isLocalOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)
      && ['4310', '5173'].includes(url.port);
  } catch {
    return false;
  }
}

function assertProject(value: unknown): asserts value is Project {
  validateProject(value);
}

function parseModelConfig(value: unknown): { baseUrl: string; model: string; apiKey?: string } {
  if (!value || typeof value !== 'object') throw new Error('请提供 API 配置。');
  const input = value as Record<string, unknown>;
  const baseUrl = typeof input.baseUrl === 'string' ? input.baseUrl.trim() : '';
  const model = typeof input.model === 'string' ? input.model.trim() : '';
  const apiKey = typeof input.apiKey === 'string' ? input.apiKey : undefined;
  if (!baseUrl || !model) throw new Error('API 地址和模型名称不能为空。');
  let url: URL;
  try { url = new URL(baseUrl); } catch { throw new Error('API 地址格式无效。'); }
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('API 地址必须使用 HTTP 或 HTTPS。');
  if (apiKey !== undefined && apiKey.length > 4096) throw new Error('API 密钥长度超出限制。');
  return { baseUrl: baseUrl.replace(/\/+$/, ''), model, ...(apiKey === undefined ? {} : { apiKey }) };
}

function publicConfig(config: SavedConfig): { baseUrl: string; model: string; hasKey: boolean } {
  return { baseUrl: config.baseUrl, model: config.model, hasKey: Boolean(config.apiKey) };
}

async function readConfig(file: string): Promise<SavedConfig> {
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8')) as Partial<SavedConfig>;
    return {
      baseUrl: typeof parsed.baseUrl === 'string' ? parsed.baseUrl : '',
      model: typeof parsed.model === 'string' ? parsed.model : '',
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : undefined,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { baseUrl: '', model: '' };
    throw error;
  }
}

async function writeConfig(file: string, config: SavedConfig): Promise<void> {
  const temp = `${file}.tmp`;
  await writeFile(temp, `${JSON.stringify(config, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  await rename(temp, file);
}

function extractJson(content: unknown): unknown {
  if (typeof content !== 'string') throw new Error('AI 返回了无法识别的内容，请重试。');
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(trimmed); }
  catch { throw new Error('AI 返回内容不是有效 JSON，请调整提示词后重试。'); }
}

function nodeIndex(p: Project): Map<string, { pageIndex: number; path: number[] }> {
  const map = new Map<string, { pageIndex: number; path: number[] }>();
  p.pages.forEach((page, pageIndex) => {
    const walk = (nodes: Project['pages'][number]['nodes'], parent: number[] = []) => nodes.forEach((node, index) => {
      const nodePath = [...parent, index];
      map.set(node.id, { pageIndex, path: nodePath });
      if (node.children) walk(node.children, nodePath);
    });
    walk(page.nodes);
  });
  return map;
}

function nodeAt(project: Project, pageIndex: number, indexes: number[]) {
  let nodes: BuilderNode[] | undefined = project.pages[pageIndex]?.nodes;
  let node;
  for (const index of indexes) {
    node = nodes?.[index];
    if (!node) return undefined;
    nodes = node.children;
  }
  return node;
}

function enforceDraftScope(original: Project, draft: Project, request: DraftRequest): void {
  if (request.project.id !== draft.id) throw new Error('AI 草稿不能更改项目 ID。');
  if (request.selectedNodeId) {
    const found = nodeIndex(original).get(request.selectedNodeId);
    if (!found) throw new Error('选中的组件已不存在，请刷新后重试。');
    if (request.pageId && original.pages[found.pageIndex]?.id !== request.pageId) throw new Error('选中组件不属于指定页面。');
    const before = structuredClone(original);
    const after = structuredClone(draft);
    const beforeNode = nodeAt(before, found.pageIndex, found.path);
    const afterNode = nodeAt(after, found.pageIndex, found.path);
    if (!beforeNode || !afterNode || afterNode.id !== request.selectedNodeId) throw new Error('AI 草稿不能删除或重命名选中的组件。');
    // Keep the selected component's descendants editable, while its parent location and all siblings stay fixed.
    const parentIndexes = found.path.slice(0, -1);
    const beforeSiblings = parentIndexes.length
      ? nodeAt(before, found.pageIndex, parentIndexes)?.children
      : before.pages[found.pageIndex]?.nodes;
    const afterSiblings = parentIndexes.length
      ? nodeAt(after, found.pageIndex, parentIndexes)?.children
      : after.pages[found.pageIndex]?.nodes;
    const index = found.path.at(-1)!;
    if (!beforeSiblings || !afterSiblings || beforeSiblings.length !== afterSiblings.length) throw new Error('AI 草稿修改了选中组件之外的结构。');
    for (let i = 0; i < beforeSiblings.length; i++) {
      if (i !== index && !isDeepStrictEqual(beforeSiblings[i], afterSiblings[i])) throw new Error('AI 草稿修改了选中组件之外的内容。');
    }
    beforeSiblings[index] = afterSiblings[index];
    if (!isDeepStrictEqual(before, after)) throw new Error('AI 草稿修改了选中组件所在页面的其他内容。');
    return;
  }
  if (request.pageId) {
    const pageIndex = original.pages.findIndex(page => page.id === request.pageId);
    if (pageIndex < 0) throw new Error('指定页面已不存在，请刷新后重试。');
    if (draft.pages.length !== original.pages.length || draft.pages.some((page, index) => page.id !== original.pages[index]?.id)) throw new Error('AI 草稿不能新增、删除或替换页面。');
    const normalized = structuredClone(draft);
    normalized.pages[pageIndex] = structuredClone(original.pages[pageIndex]!);
    if (!isDeepStrictEqual(normalized, original)) throw new Error('AI 草稿修改了未选中的页面。');
  }
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const dataDir = path.resolve(options.dataDir ?? DEFAULT_DATA_DIR);
  await mkdir(dataDir, { recursive: true });
  const database = new DatabaseSync(path.join(dataDir, 'projects.sqlite'));
  database.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, document TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS revisions (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, document TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS revisions_project_id ON revisions(project_id, id DESC);
  `);
  const configFile = path.join(dataDir, 'config.json');
  const app = Fastify({ logger: false, bodyLimit: BODY_LIMIT });
  const fetcher = options.fetch ?? globalThis.fetch;

  app.addHook('onRequest', async (request, reply) => {
    if (!/^(localhost|127\.0\.0\.1)(:\d{1,5})?$/i.test(request.headers.host ?? '')) {
      return reply.code(403).send({ error: '仅允许通过本机地址访问。' });
    }
  });

  app.addHook('preHandler', async (request, reply) => {
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.url.startsWith('/api/')) {
      if (!isLocalOrigin(request.headers.origin)) return reply.code(403).send({ error: '仅允许来自本机页面的写入请求。' });
    }
  });
  app.addHook('onClose', async () => { database.close(); });

  app.get('/api/projects', async () => {
    const rows = database.prepare('SELECT document FROM projects ORDER BY updated_at DESC').all() as Array<{ document: string }>;
    return rows.map(row => JSON.parse(row.document) as Project);
  });

  app.post<{ Body: { project?: unknown } }>('/api/projects', async (request, reply) => {
    try {
      assertProject(request.body?.project);
      const project = request.body.project;
      const now = new Date().toISOString();
      const document = JSON.stringify(project);
      database.exec('BEGIN IMMEDIATE');
      try {
        database.prepare('INSERT INTO projects(id, document, updated_at) VALUES(?, ?, ?) ON CONFLICT(id) DO UPDATE SET document=excluded.document, updated_at=excluded.updated_at').run(project.id, document, now);
        database.prepare('INSERT INTO revisions(project_id, document, created_at) VALUES(?, ?, ?)').run(project.id, document, now);
        database.exec('COMMIT');
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
      return { project };
    } catch (error) {
      return reply.code(400).send({ error: error instanceof Error ? error.message : '项目数据无效。' });
    }
  });

  app.get<{ Params: { id: string } }>('/api/projects/:id', async (request, reply) => {
    const row = database.prepare('SELECT document FROM projects WHERE id = ?').get(request.params.id) as { document: string } | undefined;
    if (!row) return reply.code(404).send({ error: '未找到该项目。' });
    return { project: JSON.parse(row.document) as Project };
  });

  app.get('/api/config', async () => publicConfig(await readConfig(configFile)));

  app.post<{ Body: unknown }>('/api/config', async (request, reply) => {
    try {
      const submitted = parseModelConfig(request.body);
      const current = await readConfig(configFile);
      const config: SavedConfig = { ...submitted, apiKey: submitted.apiKey ?? current.apiKey };
      await writeConfig(configFile, config);
      return publicConfig(config);
    } catch (error) {
      return reply.code(400).send({ error: error instanceof Error ? error.message : 'API 配置无效。' });
    }
  });

  app.post<{ Body: DraftRequest }>('/api/ai/draft', async (request, reply) => {
    let config: SavedConfig;
    try { config = await readConfig(configFile); }
    catch { return reply.code(500).send({ error: '读取 AI 配置失败。' }); }
    if (!config.apiKey || !config.baseUrl || !config.model) return reply.code(400).send({ error: '请先在设置中填写 API 地址、模型和 API 密钥。' });
    const draftRequest = request.body;
    if (!draftRequest || typeof draftRequest.prompt !== 'string' || !draftRequest.prompt.trim()) return reply.code(400).send({ error: '请输入 AI 修改要求。' });
    if (draftRequest.prompt.length > 20_000) return reply.code(400).send({ error: 'AI 修改要求不能超过 20,000 个字符。' });
    try { assertProject(draftRequest.project); }
    catch (error) { return reply.code(400).send({ error: error instanceof Error ? error.message : '项目数据无效。' }); }

    try {
      const endpoint = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;
      const response = await fetcher(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.model,
          temperature: 0.2,
          messages: [
            { role: 'system', content: `你是 UI 项目编辑助手。只输出完整的 JSON Project 对象，不要返回 Markdown、代码或说明文字，也不要生成或执行代码。项目必须符合此 schema：version 固定为 1；theme 只能是 nordic、editorial、dark；pages 是页面数组，每页包含 id、name、nodes；所有 page id 和所有组件 id 必须非空且各自唯一。组件 type 只能是 ${COMPONENT_TYPES.join(', ')}；props 只能包含值为 string、number 或 boolean 的普通数据；style 只能使用这些键：${STYLE_KEYS.join(', ')}，值为 string 或有限 number。action 只能是 navigate、toast、toggle、submit、dialog；navigate 的 target 必须是现有 page id。只有 stack、row、grid、card 可以包含 children。selectedNodeId 存在时，仅可修改该组件的 props、style、action 或其子树，必须保留该组件 id，其他所有组件和页面必须完全不变。只有 pageId 存在时，只可修改该页面的名称和节点，必须保留该页面 id，所有其他页面、页面顺序和项目元数据必须完全不变。没有选中范围时，才可以按要求新增页面或调整完整结构。必须返回完整项目并保留所有未修改数据。` },
            { role: 'user', content: JSON.stringify({ project: draftRequest.project, selectedNodeId: draftRequest.selectedNodeId, pageId: draftRequest.pageId, instruction: draftRequest.prompt }) },
          ],
        }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      });
      if (!response.ok) {
        const detail = response.status === 401 || response.status === 403 ? 'API 密钥无效或没有访问权限。'
          : response.status === 429 ? 'AI 服务当前请求过多，请稍后重试。'
            : `AI 服务返回错误（${response.status}）。`;
        return reply.code(502).send({ error: detail });
      }
      const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
      const project = extractJson(payload.choices?.[0]?.message?.content);
      assertProject(project);
      enforceDraftScope(draftRequest.project, project, draftRequest);
      return { project };
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') return reply.code(504).send({ error: 'AI 请求超时，请稍后重试。' });
      if (error instanceof TypeError) return reply.code(502).send({ error: '无法连接 AI 服务，请检查 API 地址和网络。' });
      return reply.code(502).send({ error: error instanceof Error ? error.message : 'AI 草稿生成失败，请重试。' });
    }
  });

  app.post<{ Body: { project?: unknown } }>('/api/export', async (request, reply) => {
    try {
      assertProject(request.body?.project);
      const bytes = await exportProject(request.body.project);
      return reply.header('content-type', 'application/zip').header('content-disposition', 'attachment; filename="project.zip"').send(Buffer.from(bytes));
    } catch (error) {
      return reply.code(400).send({ error: error instanceof Error ? error.message : '无法导出该项目。' });
    }
  });

  const distDir = path.resolve(options.distDir ?? path.join(BUILDER_DIR, 'dist'));
  if (existsSync(distDir)) {
    await app.register(fastifyStatic, { root: distDir, prefix: '/', wildcard: false });
    app.get('/*', async (_request, reply) => reply.sendFile('index.html'));
  }

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = (error as { statusCode?: number }).statusCode;
    const message = (error as { message?: string }).message;
    if (statusCode === 413) return reply.code(413).send({ error: '请求内容过大，请缩小项目后重试。' });
    return reply.code(statusCode ?? 500).send({ error: statusCode && statusCode < 500 ? message : '服务器暂时无法处理请求。' });
  });
  return app;
}
