---
title: "Navigation & TabBars"
tags:
  - "components"
  - "navigation"
  - "tabbars"
---

# 🧭 移动端沉浸式导航与底部栏蓝图 (Navigation & TabBars)

移动端底部导航承载着用户的单手核心动线。以下整理经典悬浮磨砂与大厂分段 TabBar：

---

## 1. 悬浮磨砂底部导航栏 (Floating Ambient TabBar)

### 👀 实时渲染视觉预览 (Obsidian 原生高保真渲染)
<div style="background: rgba(24, 24, 27, 0.85); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 999px; padding: 8px 24px; max-width: 320px; margin: 16px auto; display: flex; justify-content: space-around; align-items: center; box-shadow: 0 16px 36px -10px rgba(0,0,0,0.6); backdrop-filter: blur(20px); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- 激活项 -->
  <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer;">
    <span style="color: #6366f1; font-size: 16px;">✦</span>
    <span style="color: #ffffff; font-size: 11px; font-weight: 700;">探索</span>
  </div>
  
  <!-- 未激活项 1 -->
  <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer;">
    <span style="color: #71717a; font-size: 16px;">📁</span>
    <span style="color: #71717a; font-size: 11px; font-weight: 500;">知识库</span>
  </div>
  
  <!-- 未激活项 2 -->
  <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer;">
    <span style="color: #71717a; font-size: 16px;">⚡</span>
    <span style="color: #71717a; font-size: 11px; font-weight: 500;">雷达</span>
  </div>
  
  <!-- 未激活项 3 -->
  <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; cursor: pointer;">
    <span style="color: #71717a; font-size: 16px;">⚙️</span>
    <span style="color: #71717a; font-size: 11px; font-weight: 500;">设置</span>
  </div>
</div>

### 💻 源码实现 (Tailwind CSS / 供 AI 提取)
```html
<nav class="fixed bottom-6 inset-x-4 max-w-sm mx-auto backdrop-blur-2xl bg-zinc-900/80 border border-white/10 rounded-full px-4 py-2.5 flex items-center justify-around shadow-2xl z-50">
  <a href="#" class="text-white font-medium text-xs flex flex-col items-center">
    <span class="text-lg text-indigo-400">✦</span>
    <span>探索</span>
  </a>
  <a href="#" class="text-zinc-500 hover:text-zinc-300 font-medium text-xs flex flex-col items-center">
    <span class="text-lg">📁</span>
    <span>知识库</span>
  </a>
  <a href="#" class="text-zinc-500 hover:text-zinc-300 font-medium text-xs flex flex-col items-center">
    <span class="text-lg">⚙️</span>
    <span>设置</span>
  </a>
</nav>
```
