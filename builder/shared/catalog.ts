import type { ComponentType } from './types';
export interface CatalogItem { type: ComponentType; label: string; hint: string; source?: string }
export const componentGroups: { title: string; note?: string; items: CatalogItem[] }[] = [
  { title: '布局', items: [
    { type: 'stack', label: '垂直容器', hint: '纵向组合内容' }, { type: 'row', label: '水平容器', hint: '横向排列与对齐' },
    { type: 'grid', label: '网格容器', hint: '多列内容布局' }, { type: 'card', label: '卡片', hint: '组织一组相关内容' }, { type: 'divider', label: '分割线', hint: '轻量内容分隔' },
  ] },
  { title: '内容', items: [
    { type: 'text', label: '文本', hint: '标题、正文与说明' }, { type: 'image', label: '图片', hint: '图片链接或本地上传' },
    { type: 'avatar', label: '头像', hint: '人物照片或文字头像' }, { type: 'badge', label: '标签', hint: '状态与分类标记' },
    { type: 'list', label: '内容列表', hint: '轻量清单与信息展示', source: 'shadcn/ui' }, { type: 'testimonial', label: '用户评价', hint: '引言、评分与人物介绍', source: 'shadcn/ui' },
  ] },
  { title: '表单', items: [
    { type: 'button', label: '按钮', hint: '触发页面交互' }, { type: 'input', label: '单行输入', hint: '文本输入与必填校验' },
    { type: 'textarea', label: '多行输入', hint: '备注与较长文本' }, { type: 'checkbox', label: '复选框', hint: '选择一个选项' },
    { type: 'switch', label: '开关', hint: '切换一个状态' }, { type: 'select', label: '下拉选择', hint: '从选项中选择' },
    { type: 'search', label: '搜索框', hint: '关键词输入与清空', source: 'shadcn/ui' }, { type: 'radio', label: '单选组', hint: '互斥选项与键盘选择', source: 'Radix' },
    { type: 'slider', label: '滑块', hint: '范围值与步长设置', source: 'Radix' }, { type: 'rating', label: '评分', hint: '可交互星级评价', source: 'shadcn/ui' },
  ] },
  { title: '导航', items: [
    { type: 'navbar', label: '顶部导航', hint: '页面标题与返回操作' }, { type: 'tabs', label: '标签切换', hint: '切换内容分组' },
    { type: 'segmented', label: '分段控制', hint: '紧凑的互斥选项', source: 'Radix' }, { type: 'breadcrumb', label: '面包屑', hint: '展示当前位置路径', source: 'shadcn/ui' },
    { type: 'bottomnav', label: '底部导航', hint: '移动端主导航入口', source: 'shadcn/ui' },
  ] },
  { title: '反馈', items: [
    { type: 'alert', label: '提示横幅', hint: '消息反馈与关闭操作', source: 'shadcn/ui' }, { type: 'accordion', label: '折叠面板', hint: '展开查看详细内容', source: 'Radix' },
    { type: 'skeleton', label: '骨架屏', hint: '内容加载状态占位', source: 'shadcn/ui' }, { type: 'empty', label: '空状态', hint: '没有内容时的引导' },
  ] },
  { title: '数据', items: [
    { type: 'progress', label: '进度条', hint: '目标完成进度' }, { type: 'stat', label: '数据概览', hint: '数字与变化趋势' },
    { type: 'timeline', label: '时间线', hint: '计划与事件的时间顺序', source: 'shadcn/ui' },
  ] },
  { title: '组合', items: [
    { type: 'task', label: '任务条目', hint: '可完成的待办事项' }, { type: 'habit', label: '习惯打卡', hint: '连续记录与打卡' },
    { type: 'pricing', label: '方案卡片', hint: '价格、功能与选择操作', source: 'shadcn/ui' },
  ] },
];
export const typeLabels = Object.fromEntries(componentGroups.flatMap(group => group.items.map(item => [item.type, item.label]))) as Record<ComponentType, string>;
