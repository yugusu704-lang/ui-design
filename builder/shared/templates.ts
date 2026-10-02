import type { BuilderNode, Page, Project } from './types.ts';
import { validateProject } from './model.ts';

export type TemplateId = 'login' | 'profile' | 'product';
export type IdFactory = () => string;

const randomId: IdFactory = () => crypto.randomUUID();

function takeId(used: Set<string>, idFactory: IdFactory): string {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const id = idFactory();
    if (typeof id === 'string' && id.length > 0 && id.length <= 100 && !used.has(id)) {
      used.add(id);
      return id;
    }
  }
  throw new Error('无法为模板生成唯一编号');
}

function node(id: string, type: BuilderNode['type'], props: BuilderNode['props'] = {}, style: BuilderNode['style'] = {}, children?: BuilderNode[], action?: BuilderNode['action']): BuilderNode {
  return { id, type, props, style, ...(children ? { children } : {}), ...(action ? { action } : {}) };
}

function buildPage(templateId: TemplateId, idFactory: IdFactory, used: Set<string>): Page {
  const id = takeId(used, idFactory);
  const make = (type: BuilderNode['type'], props: BuilderNode['props'] = {}, style: BuilderNode['style'] = {}, children?: BuilderNode[], action?: BuilderNode['action']) => node(takeId(used, idFactory), type, props, style, children, action);

  switch (templateId) {
    case 'login':
      return {
        id,
        name: '登录',
        nodes: [
          make('text', { text: 'ATELIER · ACCOUNT', variant: 'eyebrow' }, { color: '#9a725b', fontSize: 11, fontWeight: 700 }),
          make('text', { text: '欢迎回来', variant: 'heading' }, { fontSize: 30, fontWeight: 700 }),
          make('text', { text: '登录后继续管理你的计划与进展。', variant: 'muted' }, { color: '#77736b', fontSize: 14 }),
          make('stack', {}, { gap: 14 }, [
            make('input', { name: 'email', label: '邮箱', placeholder: 'name@example.com', inputType: 'email', required: true }),
            make('input', { name: 'password', label: '密码', placeholder: '输入密码', inputType: 'password', required: true }),
            make('checkbox', { label: '记住我', checked: true }),
            make('button', { label: '登录', variant: 'primary' }, { width: '100%', padding: 14, borderRadius: 12 }, undefined, { type: 'toast', message: '本地演示：登录表单尚未连接账户服务。' }),
          ]),
          make('text', { text: '这是本地预览页面，不会发送账户信息。', variant: 'muted' }, { color: '#77736b', fontSize: 12 }),
        ],
      };
    case 'profile':
      return {
        id,
        name: '个人资料',
        nodes: [
          make('navbar', { title: '个人资料', back: false }),
          make('card', {}, { padding: 22, borderRadius: 20, background: '#f4eee7' }, [
            make('avatar', { text: '林' }, { width: 64, height: 64, borderRadius: 32 }),
            make('text', { text: '林予', variant: 'subheading' }, { fontSize: 22, fontWeight: 700 }),
            make('text', { text: '认真生活，也认真记录。', variant: 'muted' }, { color: '#77736b', fontSize: 14 }),
          ]),
          make('row', {}, { gap: 12 }, [
            make('stat', { value: '28', label: '已完成' }),
            make('stat', { value: '12', label: '连续记录' }),
            make('stat', { value: '6', label: '进行中' }),
          ]),
          make('stack', {}, { gap: 10 }, [
            make('text', { text: '账户偏好', variant: 'subheading' }, { fontSize: 18, fontWeight: 650 }),
            make('switch', { label: '每日提醒', checked: true }),
            make('switch', { label: '完成时触觉反馈', checked: false }),
          ]),
          make('button', { label: '编辑个人资料', variant: 'secondary' }, { width: '100%', padding: 13, borderRadius: 12 }, undefined, { type: 'dialog', message: '本地演示：个人资料编辑表单。' }),
        ],
      };
    case 'product':
      return {
        id,
        name: '产品介绍',
        nodes: [
          make('navbar', { title: '日日计划', back: false }),
          make('badge', { text: '为专注生活而设计' }, { color: '#805b43', background: '#f2e7dc', padding: 7, borderRadius: 20 }),
          make('text', { text: '给每一个小目标，留一份认真。', variant: 'heading' }, { fontSize: 30, fontWeight: 700 }),
          make('text', { text: '用轻松的方式整理计划、记录习惯，也记得看见自己走过的每一步。', variant: 'body' }, { color: '#68655e', fontSize: 15 }),
          make('card', {}, { padding: 20, borderRadius: 18, background: '#f7f3ed' }, [
            make('text', { text: '每日计划', variant: 'eyebrow' }, { color: '#9a725b', fontSize: 12, fontWeight: 700 }),
            make('text', { text: '从今天最重要的一件事开始。', variant: 'subheading' }, { fontSize: 19, fontWeight: 650 }),
            make('progress', { value: 72, label: '本周进展' }),
          ]),
          make('button', { label: '开始体验', variant: 'primary' }, { width: '100%', padding: 14, borderRadius: 12 }, undefined, { type: 'toast', message: '本地演示：体验入口已准备好。' }),
          make('text', { text: '简洁记录 · 温和提醒 · 本地演示', variant: 'muted' }, { color: '#77736b', fontSize: 12, textAlign: 'center' }),
        ],
      };
  }
}

export function createTemplatePage(templateId: TemplateId, idFactory: IdFactory = randomId): Page {
  if (!['login', 'profile', 'product'].includes(templateId)) throw new Error('不支持的页面模板');
  const page = buildPage(templateId, idFactory, new Set());
  return validateProject({ version: 1, id: 'template-validation', name: '页面模板', theme: 'editorial', pages: [page] }).pages[0];
}

export function addTemplatePage(project: Project, templateId: TemplateId, idFactory: IdFactory = randomId): Project {
  const validated = validateProject(project);
  if (validated.pages.length >= 30) throw new Error('页面数量已达到上限');
  const used = new Set<string>([validated.id, ...validated.pages.map((page) => page.id)]);
  const collect = (nodes: BuilderNode[]) => nodes.forEach((item) => {
    used.add(item.id);
    if (item.children) collect(item.children);
  });
  validated.pages.forEach((page) => collect(page.nodes));
  const page = buildPage(templateId, idFactory, used);
  return validateProject({ ...validated, pages: [...validated.pages, page] });
}
