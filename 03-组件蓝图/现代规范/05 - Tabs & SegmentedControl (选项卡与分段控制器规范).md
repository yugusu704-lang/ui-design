---
id: "comp-tabs-segmented"
title: "Tabs & SegmentedControl (选项卡与分段控制器规范)"
type: "component-blueprint"
category: "组件蓝图"
tags:
  - "component/tabs"
  - "component/segmented-control"
  - "ui/mobile"
  - "interaction/navigation"
source_repo: "shadcn-ui/ui"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[Navigation & TabBars]]"
  - "[[02 - 席克定律 (Hick's Law) 与决策减法]]"
---

# Tabs & SegmentedControl (选项卡与分段控制器规范)

> 整理自全球现代 UI 组件事实标准 `shadcn-ui/ui` 与 iOS 移动端交互规范。
> 当同一页面下存在多个平级互斥的数据视图（如：“全部”、“待付款”、“已完成”），移动端主要采用**分段控制器 (Segmented Control)** 或**顶部滚动选项卡 (Scrollable Tabs)**。

---

## 📱 组件形态对比与选型决策

| 控件形态 | 选项数量 | 容器宽度机制 | 最佳应用场景 |
| :--- | :--- | :--- | :--- |
| **药丸分段控制器 (Segmented Control)** | 固定 2 ~ 4 个 | 全宽等分（例如 3 个选项各占 33.3%） | 订单状态筛选、按月/按年计费切换、明细/汇总视图切换。 |
| **可横滑选项卡 (Scrollable Tabs)** | 5 个以上（较多分类） | 内容自适应宽度 + 横向平滑滚动 | 新闻客户端频道（推荐/科技/热点/娱乐/财经）、电商一级大类目。 |

---

## 🖐️ 关键物理动效与手势规范

1. **背景滑块平滑位移 (Sliding Pill Indicator)**：
   - 选中的高亮背景必须是一个独立浮动的层（带物理弹簧 `spring` 阻尼），在不同项之间点击时，滑块平滑滑动到目标位置，伴随轻微的拉伸挤压（Squash & Stretch），拒绝生硬的无动效瞬跳。
2. **左右滑动手势联动 (Pager Gesture)**：
   - 在移动端，点击顶部 Tab 切换视图的同时，下方的页面内容区域**必须支持手指左右划屏跟手联动**。手势位移与顶部下划线/滑块保持 $1:1$ 实时像素位移。
3. **激活项自动居中 (Scroll-into-View for Long Tabs)**：
   - 在长滚动 Tabs 中，当用户点击靠近屏幕边缘的 Tab 时，选项卡列表必须自动横向平滑滚动，将当前激活的 Tab 居中显示在手机屏幕中央。

## 🎨 视觉实时渲染与工程源码双模呈现

### 1. 👀 实时渲染视觉预览 (Obsidian 原生高保真渲染)

<!-- 形态一：药丸分段控制器 -->
<div style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 4px; max-width: 360px; margin: 16px auto; display: flex; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="flex: 1; text-align: center; padding: 8px 0; border-radius: 12px; background: #6366f1; color: #ffffff; font-size: 12px; font-weight: 700; box-shadow: 0 2px 8px rgba(99,102,241,0.4); cursor: pointer;">
    月度账单
  </div>
  <div style="flex: 1; text-align: center; padding: 8px 0; border-radius: 12px; color: #94a3b8; font-size: 12px; font-weight: 500; cursor: pointer;">
    季度汇总
  </div>
  <div style="flex: 1; text-align: center; padding: 8px 0; border-radius: 12px; color: #94a3b8; font-size: 12px; font-weight: 500; cursor: pointer;">
    年度报表
  </div>
</div>

<!-- 形态二：横向滚动选项卡 -->
<div style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); max-width: 360px; margin: 16px auto; display: flex; gap: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="padding-bottom: 10px; border-bottom: 2px solid #6366f1; color: #ffffff; font-size: 14px; font-weight: 700; cursor: pointer;">
    精选推荐
  </div>
  <div style="padding-bottom: 10px; color: #64748b; font-size: 14px; font-weight: 500; cursor: pointer;">
    数码潮玩
  </div>
  <div style="padding-bottom: 10px; color: #64748b; font-size: 14px; font-weight: 500; cursor: pointer;">
    智能家居
  </div>
  <div style="padding-bottom: 10px; color: #64748b; font-size: 14px; font-weight: 500; cursor: pointer;">
    户外机能
  </div>
</div>

### 2. 💻 生产级工程源码 (Tailwind CSS / 供 AI 检索调用)

```html
<!-- 移动端药丸分段控制器 -->
<div class="inline-flex w-full rounded-2xl bg-slate-800/80 p-1 border border-white/5 backdrop-blur-sm">
  <button class="flex-1 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-md transition-all">
    月度账单
  </button>
  <button class="flex-1 rounded-xl py-2 text-xs font-medium text-slate-400 hover:text-white transition-all">
    季度汇总
  </button>
  <button class="flex-1 rounded-xl py-2 text-xs font-medium text-slate-400 hover:text-white transition-all">
    年度报表
  </button>
</div>
```

---

## 🔗 知识库关联与导航
- 结合席克定律决策减法：[[02 - 席克定律 (Hick's Law) 与决策减法]]
- 结合底层导航系统：[[Navigation & TabBars]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
