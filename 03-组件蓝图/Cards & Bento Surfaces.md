---
title: "Cards & Bento Surfaces"
tags:
  - "components"
  - "cards"
  - "bento"
---

# 🧩 移动端卡片与表面质感蓝图 (Cards & Bento Surfaces)

卡片是移动端最基础的信息承载单元。以下整理了 3 类最常用的卡片结构，支持 **Obsidian 实时高保真视觉渲染** 与 **AI 源码复制**：

---

## 1. Apple-Style Bento Grid 模块卡片

### 👀 实时渲染视觉预览
<div style="background: rgba(24, 24, 27, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 20px; padding: 18px; max-width: 320px; margin: 12px auto; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 700; color: #a1a1aa; letter-spacing: 0.5px;">
    <span>STATS TELEMETRY</span>
    <span style="color: #34d399; font-family: monospace; font-size: 12px; background: rgba(52, 211, 153, 0.1); padding: 2px 6px; border-radius: 6px;">+12.4% ↑</span>
  </div>
  <div style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin: 12px 0 4px 0;">1,842 kWh</div>
  <div style="font-size: 12px; color: #71717a;">Live dynamic grid telemetry feed</div>
</div>

### 💻 源码实现 (Tailwind CSS)
```html
<div class="bg-zinc-900/90 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/20 transition-colors">
  <div class="flex items-center justify-between text-zinc-400 text-xs">
    <span>STATS TELEMETRY</span>
    <span class="text-emerald-400 font-mono">+12.4% ↑</span>
  </div>
  <div class="my-3 text-2xl font-bold text-white tracking-tight">1,842 kWh</div>
  <div class="text-xs text-zinc-500">Live dynamic grid telemetry feed</div>
</div>
```

---

## 2. Liquid Frosted Glass 毛玻璃悬浮卡片

### 👀 实时渲染视觉预览
<div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 24px; padding: 20px; max-width: 320px; margin: 12px auto; box-shadow: 0 20px 40px rgba(0,0,0,0.3); backdrop-filter: blur(16px); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <div style="display: flex; align-items: center; justify-content: space-between;">
    <div style="font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7);">Ambient Soundscape</div>
    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 999px; background: #38bdf8; box-shadow: 0 0 8px #38bdf8;"></span>
  </div>
  <div style="font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 6px;">Deep Rain Focus Flow</div>
  <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 4px;">432Hz · Spatial Binaural Audio</div>
</div>

### 💻 源码实现 (Tailwind CSS)
```html
<div class="backdrop-blur-xl bg-white/15 border border-white/30 rounded-3xl p-5 shadow-2xl text-white">
  <div class="text-sm font-medium opacity-80">Ambient Soundscape</div>
  <div class="text-lg font-bold mt-1">Deep Rain Focus Flow</div>
  <div class="text-xs text-white/50 mt-1">432Hz · Spatial Binaural Audio</div>
</div>
```

---

## 3. Neo-Brutalism 硬朗描边卡片

### 👀 实时渲染视觉预览
<div style="background: #ffffff; border: 3px solid #000000; border-radius: 14px; padding: 18px; max-width: 320px; margin: 12px auto; box-shadow: 4px 4px 0px #000000; font-family: 'Inter', sans-serif;">
  <span style="background: #ffe600; border: 2px solid #000000; color: #000000; font-size: 11px; font-weight: 900; padding: 3px 8px; border-radius: 6px; display: inline-block;">NEW DROP</span>
  <h4 style="font-weight: 900; font-size: 18px; color: #000000; margin: 10px 0 4px 0;">Cyber Sneaker #09</h4>
  <p style="font-size: 12px; color: #555555; margin: 0;">限量发售 · 实体波普触感</p>
</div>

### 💻 源码实现 (Tailwind CSS)
```html
<div class="bg-white border-[3px] border-black rounded-xl p-4 shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all">
  <span class="bg-yellow-400 border-2 border-black text-black text-xs font-black px-2 py-0.5 rounded">NEW DROP</span>
  <h4 class="font-black text-xl mt-2">Cyber Sneaker #09</h4>
</div>
```
