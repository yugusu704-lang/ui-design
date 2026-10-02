import type { BuilderNode } from './types.ts';

export function insertAfter(nodes: BuilderNode[], node: BuilderNode, afterId?: string): BuilderNode[] {
  if (!afterId) return [...nodes, node];
  const index = nodes.findIndex(item => item.id === afterId);
  if (index >= 0) return [...nodes.slice(0, index + 1), node, ...nodes.slice(index + 1)];
  return nodes.map(item => item.children ? { ...item, children: insertAfter(item.children, node, afterId) } : item);
}

export function duplicateNode(node: BuilderNode, id: () => string = () => crypto.randomUUID()): BuilderNode {
  const copy = structuredClone(node);
  const renew = (item: BuilderNode): BuilderNode => ({ ...item, id: id(), ...(item.children ? { children: item.children.map(renew) } : {}) });
  return renew(copy);
}
