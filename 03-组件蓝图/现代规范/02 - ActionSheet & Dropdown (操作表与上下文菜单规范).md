---
id: "comp-actionsheet-dropdown"
title: "ActionSheet & Dropdown (操作表与上下文菜单规范)"
type: "component-blueprint"
category: "组件蓝图"
tags:
  - "component/actionsheet"
  - "component/dropdown"
  - "ui/mobile"
  - "interaction/menus"
source_repo: "shadcn-ui/ui"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[01 - 菲茨定律 (Fitts's Law) 与触控靶心]]"
---

# ActionSheet & Dropdown (操作表与上下文菜单规范)

> 整理自全球现代 UI 组件事实标准 `shadcn-ui/ui` 与移动端上下文交互规范。
> 桌面端的 `Dropdown Menu`（靠鼠标 Hover 或微小点击触发）在移动端触摸屏上极易误触。移动端将其演化为**自底呼出的动作表 (ActionSheet)** 或**长按触发的上下文气泡 (Context Menu)**。

---

## 📱 移动端菜单呈现原则

1. **绝对不用桌面 Hover 下拉**：触控屏不存在鼠标悬浮态（Hover），菜单必须通过明确的“点击三点图标 `(...)`”或“长按卡片”激活。
2. **拇指触达优先**：操作项多于 3 项时，一律转为屏幕底部呼出的 ActionSheet，单选项行高不低于 `50px`。
3. **高危红线破坏项隔离**：删除、拉黑、举报等破坏性操作（Destructive Action）必须使用警示红色字体，且通常放置在操作列表的最底端或最顶端，与其他常规项之间以加粗分割线隔离。

---

## 📐 ActionSheet 标准布局模型

```text
+------------------------------------+
|                                    |
|   +----------------------------+   |
|   |         操作说明副标题     |   |  <- 可选：居中 13px 浅灰说明
|   |----------------------------|   |
|   | 转发给好友                 |   |  <- 选项 1 (行高 52px, 居中或左对齐图标)
|   |----------------------------|   |
|   | 保存到相册                 |   |  <- 选项 2
|   |----------------------------|   |
|   | 删除此条记录 (Destructive) |   |  <- 危险选项 (Text-Red-500)
|   +----------------------------+   |
|                                    |  <- 8px 物理悬浮间隙
|   +----------------------------+   |
|   | 取消 (Cancel)              |   |  <- 独立取消胶囊 (字号加粗, 点击收起)
|   +----------------------------+   |
+------------------------------------+
```

---

## 🎨 视觉实时渲染与工程源码双模呈现

### 1. 👀 实时渲染视觉预览 (Obsidian 原生高保真渲染)

<div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 16px; max-width: 360px; margin: 16px auto; box-shadow: 0 16px 36px -10px rgba(0,0,0,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <!-- 主操作块 -->
  <div style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; overflow: hidden;">
    <div style="padding: 10px; text-align: center; font-size: 11px; color: #94a3b8; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
      请选择对动态 #2094 的操作
    </div>
    <div style="padding: 13px; text-align: center; font-size: 14px; font-weight: 500; color: #f8fafc; border-bottom: 1px solid rgba(255, 255, 255, 0.06); cursor: pointer;">
      分享至微信好友 / 朋友圈
    </div>
    <div style="padding: 13px; text-align: center; font-size: 14px; font-weight: 500; color: #f8fafc; border-bottom: 1px solid rgba(255, 255, 255, 0.06); cursor: pointer;">
      复制作品访问链接
    </div>
    <div style="padding: 13px; text-align: center; font-size: 14px; font-weight: 600; color: #f43f5e; cursor: pointer;">
      删除并移入回收站 (不可撤回)
    </div>
  </div>

  <!-- 独立取消胶囊 -->
  <div style="margin-top: 8px; background: rgba(51, 65, 85, 0.9); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; padding: 13px; text-align: center; font-size: 14px; font-weight: 700; color: #ffffff; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
    取消
  </div>
</div>

### 2. 💻 生产级工程源码 (Tailwind CSS / 供 AI 检索调用)

```html
<!-- 移动端 ActionSheet 容器 -->
<div class="fixed inset-x-4 bottom-6 z-50 space-y-2">
  <!-- 主操作清单卡片 -->
  <div class="overflow-hidden rounded-2xl bg-slate-900/95 border border-white/10 backdrop-blur-md">
    <div class="border-b border-white/5 px-4 py-3 text-center text-xs text-slate-400">
      请选择对动态 #2094 的操作
    </div>
    <button class="w-full px-4 py-3.5 text-center text-sm font-medium text-white border-b border-white/5 active:bg-slate-800">
      分享至好友
    </button>
    <button class="w-full px-4 py-3.5 text-center text-sm font-medium text-rose-400 active:bg-rose-500/10">
      删除动态 (Destructive)
    </button>
  </div>

  <!-- 独立取消按钮 -->
  <button class="w-full rounded-2xl bg-slate-800 py-3.5 text-center text-sm font-bold text-white shadow-lg active:bg-slate-700">
    取消
  </button>
</div>
```

---

## 🔗 知识库关联与导航
- 查看抽屉交互逻辑：[[01 - Sheet & Dialog (底部抽屉与模态弹窗交互规范)]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
