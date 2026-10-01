---
id: "comp-mobile-form"
title: "Mobile Form & Input (移动端表单与键盘适配规范)"
type: "component-blueprint"
category: "组件蓝图"
tags:
  - "component/form"
  - "component/input"
  - "ui/mobile"
  - "interaction/keyboard"
source_repo: "shadcn-ui/ui"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[03 - 米勒定律 (Miller's Law) 与信息组块]]"
---

# Mobile Form & Input (移动端表单与键盘适配规范)

> 整理自全球现代 UI 组件事实标准 `shadcn-ui/ui` 与移动端表单体验指南。
> 移动端表单输入是所有交互中**摩擦力最大 (Friction)、跳出率最高**的环节。当虚拟软键盘弹起时，屏幕可见高度瞬间腰斩 50%，设计必须提供最极致的辅助。

---

## 📱 移动端输入框核心物理避坑指南

### 1. iOS 16px 字号防页面自动缩放陷阱 (iOS Auto-zoom)
- **踩坑现象**：在 iOS Safari / WebView 中，如果 `<input>` 的 `font-size` 小于 `16px`，一旦用户点击聚焦，浏览器会自动强制放大整个页面，导致布局完全错位且用户无法自行复原。
- **解决规则**：移动端输入框正文字号**必须保持 $\ge 16\text{px}$**。

### 2. 软键盘类型精确匹配 (HTML5 inputmode)
千万不要所有字段都无脑给 `type="text"`。为不同字段配置专用键盘，能减少用户 70% 的输入切换时间：
```html
<!-- 纯数字/验证码/金额：呼出九宫格大数字键盘 -->
<input type="text" inputmode="numeric" pattern="[0-9]*" />

<!-- 电话号码 -->
<input type="tel" autocomplete="tel" />

<!-- 电子邮箱：呼出带有 @ 和 .com 的键盘 -->
<input type="email" autocomplete="email" />

<!-- 搜索框：右下角回车键变成蓝色的“搜索”字样 -->
<input type="search" enterkeyhint="search" />
```

### 3. 页面视口与键盘顶起避让 (Scroll into View)
- 当用户聚焦到屏幕下半部分的输入框时，必须通过 JavaScript 监听或原生机制触发 `element.scrollIntoView({ behavior: 'smooth', block: 'center' })`，将输入框自动平滑推到屏幕上半部，防止被软键盘死死盖住。

---

## 📐 现代高触觉输入框解构图

```text
+-------------------------------------------------------------+
| 手机号码 (Label: 13px, Muted Gray)                          |
| [ 🇨🇳 +86 ▾ ]  138 8888 6666             [(x)] [ 获取验证码 ]|
+-------------------------------------------------------------+
  ▲               ▲                         ▲        ▲
国家代码      自动分段空格              一键清除    内嵌倒计时按钮
(Prefix)     (Miller 组块化)            (Clear Icon) (Suffix CTA)
```

---

## 🎨 视觉实时渲染与工程源码双模呈现

### 1. 👀 实时渲染视觉预览 (Obsidian 原生高保真渲染)

<div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 20px; max-width: 380px; margin: 16px auto; box-shadow: 0 16px 36px -10px rgba(0,0,0,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- 表单项 1：手机号与验证码 -->
  <div style="margin-bottom: 16px;">
    <label style="display: block; font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;">手机号码 (带组块分段)</label>
    <div style="display: flex; align-items: center; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; height: 48px; padding: 0 12px;">
      <span style="font-size: 13px; color: #94a3b8; font-weight: 600; padding-right: 10px; border-right: 1px solid rgba(255,255,255,0.1); margin-right: 10px;">+86 ▾</span>
      <input type="tel" value="138 8888 6666" style="border: none; background: transparent; color: #ffffff; font-size: 16px; font-weight: 500; letter-spacing: 1px; outline: none; flex: 1;" readonly />
      <span style="color: #64748b; font-size: 12px; cursor: pointer; padding: 4px;">✕</span>
    </div>
  </div>

  <!-- 表单项 2：带操作按钮的短信验证码 -->
  <div style="margin-bottom: 16px;">
    <label style="display: block; font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px;">短信动态验证码</label>
    <div style="display: flex; align-items: center; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; height: 48px; padding: 0 12px;">
      <input type="text" placeholder="6 位验证码" style="border: none; background: transparent; color: #ffffff; font-size: 16px; outline: none; flex: 1;" readonly />
      <button style="border: none; background: #6366f1; color: #ffffff; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 600; cursor: pointer;">获取验证码</button>
    </div>
    <div style="font-size: 11px; color: #64748b; margin-top: 4px;">字号恒定 $\ge 16\text{px}$，已彻底规避 iOS Safari 自动聚焦缩放</div>
  </div>

  <!-- 提交按钮 -->
  <button style="width: 100%; height: 46px; border: none; background: #6366f1; border-radius: 12px; color: #ffffff; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 16px rgba(99,102,241,0.4);">
    安全登录
  </button>
</div>

### 2. 💻 生产级工程源码 (Tailwind CSS / 供 AI 检索调用)

```html
<div class="space-y-1.5 w-full">
  <label class="text-xs font-semibold text-slate-300">电子邮箱地址</label>
  <div class="relative flex items-center">
    <input
      type="email"
      inputmode="email"
      placeholder="name@example.com"
      class="h-12 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 text-base text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
    />
    <!-- 校验状态或一键清空图标 -->
    <button class="absolute right-3.5 text-slate-400 hover:text-white">
      ✕
    </button>
  </div>
  <p class="text-[11px] text-slate-500">用于接收登录动态验证码与安全通知</p>
</div>
```

---

## 🔗 知识库关联与导航
- 结合米勒定律信息组块：[[03 - 米勒定律 (Miller's Law) 与信息组块]]
- 结合体验自查清单：[[06 - 移动端 UI-UX 终极体验自查清单]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
