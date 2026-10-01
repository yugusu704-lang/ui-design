---
id: "comp-toast-notification"
title: "Toast & Notification (轻提示与全局通知规范)"
type: "component-blueprint"
category: "组件蓝图"
tags:
  - "component/toast"
  - "component/notification"
  - "ui/mobile"
  - "interaction/feedback"
source_repo: "shadcn-ui/ui"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[05 - 多尔蒂门槛 (Doherty Threshold) 与微动效反馈]]"
---

# Toast & Notification (轻提示与全局通知规范)

> 整理自全球现代 UI 组件事实标准 `shadcn-ui/ui`、Sonner 提示库与移动端体验设计。
> Toast 是典型的**非模态微反馈（Non-modal Feedback）**，它向用户告知后台任务结果（如：“已加入购物车”、“已复制链接”），**绝不能阻断用户正在进行的浏览或点击流**。

---

## 📱 移动端 Toast 的位置与类型选型

| 提示形态 | 屏幕位置 | 典型停留时间 | 适用场景与优劣势 |
| :--- | :--- | :--- | :--- |
| **顶部胶囊 (Top Dynamic Pill)** | 顶部安全区下方（类似灵动岛悬浮） | 2.5s ~ 4s | **现代 App 最推崇**。既不会被弹出的虚拟键盘遮挡，也不会遮挡底部 TabBar 和结算按钮。 |
| **居中半透明黑块 (Center Toast)** | 屏幕正中心 (HUD 样式) | 1.5s ~ 2s | 经典样式（常配成功打勾或加载菊花图标）。视觉极其醒目，但会短暂遮挡主视线。 |
| **可操作底部轻提示 (Actionable Toast / Snackbar)** | 屏幕下半部（底栏上方） | 4s ~ 6s | 附带“撤销 (Undo)”按钮的操作反馈。必须计算好底部 TabBar 或 Home 条的绝对避让间距。 |

---

## ⚠️ 移动端 Toast 落地的五大天条

1. **绝对禁放关键不可逆错误**：
   - 像“账号已被封禁”、“交易扣款失败，请充值”这类需要用户做出实质性处理的信息，严禁使用几秒就消失的 Toast，必须使用 Dialog 弹窗！
2. **文字精炼，单行最佳**：
   - 移动端 Toast 字符数建议在 **15 个汉字 / 30 个西文字符** 以内，扫一眼即可理解。
3. **支持滑动手势消除**：
   - 顶部 Toast 支持手指向上推开（Swipe up to dismiss），底部 Snackbar 支持向左/向右滑掉，不强迫用户死等倒计时。
4. **消息防叠与防刷屏 (Deduplication)**：
   - 当用户频繁点击同一按钮 5 次时，不能生成 5 个 Toast 依次排队播完，而应刷新已有 Toast 的倒计时。

## 🎨 视觉实时渲染与工程源码双模呈现

### 1. 👀 实时渲染视觉预览 (Obsidian 原生高保真渲染)

<!-- 顶部灵动岛胶囊 Toast -->
<div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 999px; padding: 10px 18px; max-width: 320px; margin: 16px auto; box-shadow: 0 16px 32px -8px rgba(0,0,0,0.5); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
  <div style="display: flex; align-items: center; gap: 8px;">
    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 999px; background: #34d399; box-shadow: 0 0 8px #34d399;"></span>
    <span style="font-size: 12px; font-weight: 600; color: #ffffff;">作品分享链接已复制到剪贴板</span>
  </div>
  <span style="font-size: 11px; color: #94a3b8; cursor: pointer;">✕</span>
</div>

<!-- 底部带 Undo 操作的 Snackbar -->
<div style="background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 12px 16px; max-width: 360px; margin: 12px auto; box-shadow: 0 12px 28px -6px rgba(0,0,0,0.5); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: space-between;">
  <div style="display: flex; align-items: center; gap: 8px;">
    <span style="font-size: 14px;">🗑️</span>
    <span style="font-size: 13px; color: #e2e8f0;">已将该项目移入废纸篓</span>
  </div>
  <button style="border: none; background: rgba(99, 102, 241, 0.2); color: #818cf8; border-radius: 8px; padding: 5px 12px; font-size: 12px; font-weight: 700; cursor: pointer;">撤销 (4s)</button>
</div>

### 2. 💻 生产级工程源码 (Tailwind CSS / 供 AI 检索调用)

```html
<!-- 移动端顶部悬浮胶囊 Toast -->
<div class="fixed top-12 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
  <div class="pointer-events-auto flex items-center gap-3 rounded-full bg-slate-900/95 px-4 py-2.5 shadow-xl border border-white/10 backdrop-blur-md animate-bounce-short">
    <!-- 成功小绿点或图标 -->
    <span class="flex h-2 w-2 rounded-full bg-emerald-400"></span>
    <span class="text-xs font-semibold text-white">链接已成功复制到剪贴板</span>
    <button class="text-xs text-slate-400 hover:text-white pl-1">✕</button>
  </div>
</div>
```

---

## 🔗 知识库关联与导航
- 深入微动效与反馈门槛：[[05 - 多尔蒂门槛 (Doherty Threshold) 与微动效反馈]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
