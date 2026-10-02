import type { BuilderNode } from './types.ts';

export const appearancePresets = [
  { id: 'text-heading', label: '标题', type: 'text' },
  { id: 'text-body', label: '正文', type: 'text' },
  { id: 'text-muted', label: '弱化说明', type: 'text' },
  { id: 'button-primary', label: '主要按钮', type: 'button' },
  { id: 'button-secondary', label: '次要按钮', type: 'button' },
  { id: 'card-soft', label: '柔和卡片', type: 'card' },
  { id: 'card-highlight', label: '强调卡片', type: 'card' },
  { id: 'card-outline', label: '浅色卡片', type: 'card' },
] as const;

export type AppearancePresetId = (typeof appearancePresets)[number]['id'];

type PresetStyle = Record<string, string | number>;
type Preset = { type: BuilderNode['type']; style: PresetStyle; variant?: string };

const presets: Record<AppearancePresetId, Preset> = {
  'text-heading': { type: 'text', variant: 'heading', style: { fontSize: 24, fontWeight: 700, color: '#39362f' } },
  'text-body': { type: 'text', variant: 'body', style: { fontSize: 16, fontWeight: 400, color: '#4f4b43' } },
  'text-muted': { type: 'text', variant: 'muted', style: { fontSize: 14, color: '#77736b' } },
  'button-primary': { type: 'button', variant: 'primary', style: { background: '#805b43', color: '#ffffff', padding: 12, borderRadius: 12 } },
  'button-secondary': { type: 'button', variant: 'secondary', style: { background: '#f2e7dc', color: '#68462f', padding: 12, borderRadius: 12 } },
  'card-soft': { type: 'card', style: { background: '#f7f3ed', color: '#39362f', padding: 16, borderRadius: 16 } },
  'card-highlight': { type: 'card', style: { background: '#f4eee7', color: '#39362f', padding: 20, borderRadius: 20 } },
  'card-outline': { type: 'card', style: { background: '#fcfaf7', color: '#39362f', padding: 16, borderRadius: 12 } },
};

export function applyAppearancePreset(node: BuilderNode, presetId: AppearancePresetId): BuilderNode {
  const preset = presets[presetId];
  if (!preset) throw new Error('不支持的外观预设');
  if (node.type !== preset.type) throw new Error(`外观预设仅适用于 ${preset.type} 组件`);

  const result = structuredClone(node);
  result.style = { ...result.style, ...preset.style };
  if (preset.variant) result.props = { ...result.props, variant: preset.variant };
  return result;
}
