import { seedProject, validateProject } from './model';
import type { Project } from './types';

export function createProjectDocument(name: string, theme: Project['theme'] = 'editorial', source: 'blank' | 'example' = 'blank'): Project {
  const title = name.trim();
  if (!title || title.length > 100) throw new Error('项目名称应为 1–100 个字符');
  if (source !== 'blank' && source !== 'example') throw new Error('项目来源无效');
  return validateProject({
    version: 1, id: crypto.randomUUID(), name: title, theme,
    pages: source === 'example' ? structuredClone(seedProject.pages) : [{ id: crypto.randomUUID(), name: '首页', nodes: [] }],
  });
}
