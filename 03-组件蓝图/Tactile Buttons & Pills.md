---
title: "Tactile Buttons & Pills"
tags:
  - "components"
  - "buttons"
  - "pills"
---

# 🔘 高触觉按钮与胶囊标签蓝图 (Tactile Buttons & Pills)

移动端按钮是触觉交互的灵魂。以下整理高频触觉按压按钮与极客微胶囊，支持 **Obsidian 实时高保真视觉渲染** 与 **AI 源码提取**：

---

## 1. 物理触觉按压按钮 (Neo-Tactile Press)

### 👀 实时渲染视觉预览 (Obsidian 原生渲染，支持鼠标/手指点击按压)
<div style="padding: 16px; text-align: center; font-family: 'Inter', sans-serif;">
  <button style="background: #ff5e7e; color: #ffffff; font-weight: 800; font-size: 14px; border: 2.5px solid #000000; border-radius: 12px; box-shadow: 3px 3px 0px #000000; padding: 12px 24px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
    <span>⚡ 立即体验触觉反馈</span>
  </button>
</div>

### 💻 源码实现 (原生 CSS / 供 AI 提取)
```css
.btn-neo-tactile {
  background: #FF5E7E;
  color: #FFFFFF;
  font-weight: 800;
  border: 2.5px solid #000000;
  border-radius: 12px;
  box-shadow: 3px 3px 0px #000000;
  padding: 10px 20px;
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}
.btn-neo-tactile:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px #000000;
}
```

---

## 2. 极客发光微胶囊 (Linear Glow Pill)

### 👀 实时渲染视觉预览
<div style="background: #0b0d0e; padding: 20px; border-radius: 16px; text-align: center; max-width: 320px; margin: 12px auto; font-family: monospace;">
  <button style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.15); color: #f8fafc; font-size: 12px; padding: 6px 14px; border-radius: 999px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 0 12px rgba(168, 85, 247, 0.2);">
    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 999px; background: #c084fc; box-shadow: 0 0 8px #c084fc;"></span>
    <span>Deploying to Production · v2.4</span>
  </button>
</div>

### 💻 源码实现 (Tailwind CSS / 供 AI 提取)
```html
<button class="bg-white/5 border border-white/15 text-white text-xs font-mono px-3 py-1.5 rounded-full hover:bg-white/10 hover:border-purple-500/50 transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
  <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
  Deploying to Production · v2.4
</button>
```
