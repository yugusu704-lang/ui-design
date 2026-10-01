---
id: "comp-sheet-dialog"
title: "Sheet & Dialog (底部抽屉与模态弹窗交互规范)"
type: "component-blueprint"
category: "组件蓝图"
tags:
  - "component/sheet"
  - "component/dialog"
  - "ui/mobile"
  - "interaction/modal"
source_repo: "shadcn-ui/ui"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[01 - 菲茨定律 (Fitts's Law) 与触控靶心]]"
---

# Sheet & Dialog (底部抽屉与模态弹窗交互规范)

> 整理自全球现代 UI 组件事实标准 `shadcn-ui/ui` 与 Radix Dialog 规范。
> 在移动端小屏设备上，**自底向上的滑动抽屉 (Bottom Sheet)** 几乎全面取代了传统的居中强遮罩弹窗（Center Dialog），极大地增强了单手触控友好度。

---

## 📱 移动端容器选型：Sheet vs Dialog

| 交互形态 | 触发与位置 | 典型使用场景 | 优势与单手体验 |
| :--- | :--- | :--- | :--- |
| **底部抽屉 (Bottom Sheet)** | 从屏幕底端滑出，覆盖 40%~90% 高度 | 筛选面板、评论列表、规格选择、长表单填写 | **移动端首选**。操作区域天然位于拇指舒适区；顶部配备小拉手横条（Drag Handle），支持自然向下滑动手势关闭。 |
| **居中模态框 (Center Dialog)** | 屏幕几何正中心，四周暗黑遮罩 | 破坏性高危确认（如“确定注销账户？”）、不可逆警告 | **强中断阻断**。强迫用户注意力聚焦，只包含简单标题、1~2 句话说明与确认/取消双按钮。 |

---

## 🛠️ 底部抽屉 (Bottom Sheet) 结构解剖与交互状态

```text
+-------------------------------+  <- 顶部暗黑遮罩 (Backdrop Blur: rgba(0,0,0,0.4))
|                               |
|   +-----------------------+   |
|   |       --- (Handle)    |   |  <- 拖拽药丸拉手 (Width: 36px, Height: 4px, Radius: 999px)
|   | 标题与关闭按钮 (X)    |   |  <- Header (Sticky 固定，不随内部滚动跑偏)
|   |-----------------------|   |
|   |                       |   |
|   | 内部可滚动内容区域    |   |  <- Body (超出高度自动滚动，-webkit-overflow-scrolling: touch)
|   |                       |   |
|   |-----------------------|   |
|   | [取消]   [确认提交]   |   |  <- Footer (常驻底部，避让 iOS 底部 Home Indicator 34px)
|   +-----------------------+   |
+-------------------------------+
```

### 关键手势阻尼与物理交互规则
1. **拖动手势优先级判别 (Gesture Conflict)**：
   - 内部内容处于滚动顶部（`scrollTop === 0`）时，向下拖动触发抽屉关闭；
   - 内部内容已被用户向下滚离顶部时，手势优先响应内部列表滚动，不触发抽屉意外关闭。
2. **背景阻断锁定 (Body Scroll Lock)**：
   - 抽屉展开期间，底层的母体页面必须禁止滚动（`overflow: hidden`），防止双层滚动引起的画面抽搐。
3. **点击遮罩退出**：
   - 点击顶部变暗的遮罩层（Backdrop），以平滑的弹簧曲线（Spring Curve 250ms）收起抽屉。

---

## 🎨 视觉实时渲染与工程源码双模呈现

### 1. 👀 实时渲染视觉预览 (Obsidian 原生高保真渲染)

<div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; padding: 20px; max-width: 380px; margin: 16px auto; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <!-- 拖拽药丸拉手 -->
  <div style="width: 36px; height: 4px; background: rgba(255,255,255,0.25); border-radius: 999px; margin: 0 auto 16px auto;"></div>
  
  <!-- 头部 -->
  <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">
    <div>
      <div style="font-size: 15px; font-weight: 700; color: #ffffff;">选择收货地址</div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">当前支持同城闪送 (30分钟送达)</div>
    </div>
    <span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 999px; background: rgba(255,255,255,0.08); color: #94a3b8; font-size: 12px; cursor: pointer;">✕</span>
  </div>

  <!-- 列表项 -->
  <div style="margin: 14px 0; display: flex; flex-direction: column; gap: 10px;">
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 14px; background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.4);">
      <div>
        <div style="font-size: 13px; font-weight: 600; color: #e0e7ff;">北京市海淀区中关村南大街 1 号</div>
        <div style="font-size: 11px; color: #818cf8; margin-top: 2px;">张三 (默认) · 138****8888</div>
      </div>
      <span style="color: #6366f1; font-weight: bold; font-size: 15px;">✓</span>
    </div>
    
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05);">
      <div>
        <div style="font-size: 13px; font-weight: 500; color: #cbd5e1;">北京市朝阳区望京 SOHO T3</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">张三 (公司) · 138****8888</div>
      </div>
      <span style="color: #64748b; font-size: 12px;">选择</span>
    </div>
  </div>

  <!-- 底部操作按钮 -->
  <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; gap: 10px;">
    <button style="flex: 1; height: 40px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); background: transparent; color: #cbd5e1; font-size: 12px; font-weight: 600; cursor: pointer;">新增地址</button>
    <button style="flex: 2; height: 40px; border-radius: 12px; border: none; background: #6366f1; color: #ffffff; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(99,102,241,0.4);">确认选择</button>
  </div>
</div>

### 2. 💻 生产级工程源码 (Tailwind CSS / 供 AI 检索调用)

```html
<!-- 半透明模糊遮罩 -->
<div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200"></div>

<!-- 底部抽出容器 (支持深浅模式) -->
<div class="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-3xl border-t border-white/10 bg-slate-900 p-6 shadow-2xl pb-10">
  <!-- 拖动小把手 -->
  <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-700"></div>
  
  <div class="flex items-center justify-between pb-4">
    <h3 class="text-lg font-bold text-white">选择配送地址</h3>
    <button class="rounded-full p-2 text-slate-400 hover:bg-slate-800">✕</button>
  </div>
  
  <!-- 滚动体 -->
  <div class="overflow-y-auto space-y-3 max-h-[50vh]">
    <div class="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
      <div>
        <div class="text-sm font-semibold text-white">北京市海淀区中关村南大街 1 号</div>
        <div class="text-xs text-indigo-400 mt-0.5">张三 (默认) · 138****8888</div>
      </div>
      <span class="text-indigo-400 font-bold">✓</span>
    </div>
  </div>
</div>
```

---

## 🔗 知识库关联与导航
- 深入组件手势与按钮：[[Tactile Buttons & Pills]]
- 结合设计系统规范：[[01 - Apple Human Interface Guidelines (iOS规范核心)]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
