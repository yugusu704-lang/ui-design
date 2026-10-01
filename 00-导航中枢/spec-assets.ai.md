---
id: "spec-assets-ai"
title: "AI 规约：设计资产与工具快速决策表 (Design Assets AI Spec)"
for_agent: true
max_tokens_target: 250
tags:
  - "ai-spec"
  - "assets"
  - "decision-matrix"
---

# 🤖 设计资产与工具 AI 快速决策表 (Assets Decision Spec)

> **AI 检阅指令**：为用户推荐设计资产、图标、插画或色彩工具时仅读取本表，无需遍历长篇资源库。

| 资产类别 | 首选推荐 (Top 1) | 核心特色与规格 | 备选工具 (Runner-up) | 移动端工程红线 (DO NOT) |
| :--- | :--- | :--- | :--- | :--- |
| **矢量图标** | **Lucide Icons** (`lucide.dev`) | 24px 网格 / 2px 线条 / 通透现代 / 全端支持 | **Phosphor Icons** (6种权重, 适合TabBar切图) | ❌ 严禁使用未对齐网格的生硬位图图标<br>❌ 严禁图标外层未加 padding 导致命中区 < 44px |
| **屏显字体** | **Inter** (西文) + **MiSans** (中文) | 高 x-height / 视网膜屏锐利 / 数字等宽对齐 | **Geist** (极客冷感) / **HarmonyOS Sans** (动态字重) | ❌ 严禁在小屏正文使用细笔画衬线体（光晕发虚）<br>❌ 严禁未设置系统兜底字体族 (System Fallback) |
| **矢量插画** | **unDraw** (`undraw.co`) | SVG 轻量 / 支持传入 Hex 色值全局换主题色 | **Open Peeps** (手绘人物涂鸦, CC0) | ❌ 严禁全量引入未剔除元数据的重型 SVG (用 SVGO 压缩)<br>❌ 严禁插画与主 App 色调割裂产生拼贴感 |
| **3D 微拟物** | **Spline** (`spline.design`) | 支持导出极轻量 WebP 序列或嵌入式交互 | **Shapefest** (高清黏土/金属微卡片) | ❌ 严禁在低端机信息流滥用重型 WebGL 消耗电池<br>❌ 优先烘焙为透明背景无损 WebP / AVIF |
| **配色工具** | **Realtime Colors** (`realtimecolors.com`) | 所见即所得映射到真实 UI 按钮/卡片/输入框 | **Coolors** (色盲对比度走查) | ❌ 严禁正文文字与背景对比度低于 4.5:1 (WCAG AA)<br>❌ 严禁暗黑模式大面积使用刺眼纯黑 `#000` + 纯白 `#FFF` |
| **样机展示** | **Shots.so** (`shots.so`) | 一键套壳最新 iPhone 钛金属/黏土框，免水印 | **Previewed** (App Store 商店上架多屏长图) | ❌ 严禁展示图样机边框过大压缩真实界面内容 |
