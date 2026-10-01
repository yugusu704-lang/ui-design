---
id: "ds-google-m3"
title: "Google Material Design 3 (Material You 动态规范)"
type: "design-system"
category: "设计系统"
tags:
  - "design-system/google"
  - "platform/android"
  - "ui/mobile"
  - "color/dynamic"
source_repo: "alexpate/awesome-design-systems"
vendor: "Google LLC"
official_url: "https://m3.material.io/"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[Master Color Catalog]]"
---

# Google Material Design 3 (Material You 动态规范)

> 整理自全球顶尖设计系统集锦 `alexpate/awesome-design-systems` 与 Google 官方 M3。
> Material Design 3 是 Android 生态与跨端 Flutter 的核心标准，主打**个性化动态色彩提取 (Material You)、大圆角包容性与表面染色层级 (Surface Tonal Elevation)**。

---

## 🎨 核心革新：动态色彩取色 (Dynamic Color)

Material 3 抛弃了传统“硬编码固定主色”的做法，引入了基于 HCT（Hue, Chroma, Tone）色彩空间的动态取色算法：
1. **壁纸/品牌色提取**：从用户壁纸或品牌单色中提取出核心主色种子 (Seed Color)；
2. **色调调色板 (Tonal Palette)**：算法自动推导 5 个色调阶梯（Primary, Secondary, Tertiary, Neutral, Neutral Variant），覆盖 0（纯黑）到 100（纯白）共 13 级明度；
3. **高对比度无感切换**：暗黑模式与明亮模式自动无缝映射，保证在强光或弱光环境下的 WCAG 可访问性。

---

## 📱 Android M3 移动端核心物理参数规格

| 设计维度 | 规格标准 | 设计要点与对比 |
| :--- | :--- | :--- |
| **最小触控靶心** | `48 × 48 dp` | 比 iOS 略大，更具包容性，适应各类大屏及老年机型。 |
| **层级高度表达** | 表面色调叠加 (Tonal Elevation) | M3 大幅减少了传统 M1/M2 的强硬落投影（Shadow），改为**背景色调叠加（Surface Tint）**：层级越高的卡片，其混入主色的比例越高、视觉越明亮。 |
| **大圆角与药丸几何** | Full Rounded Pill & Shape | 按钮、芯片（Chip）、输入框大范围采用胶囊形（Pill Shape），卡片圆角由原先的 4dp~8dp 升级至 `16dp ~ 28dp`。 |
| **浮动主操作按钮 (FAB)** | 经典 `56 × 56 dp` 容器 | 强化全局最核心单一行为（如新建邮件、发送消息），支持 Extended FAB 展开药丸文案。 |
| **排版字族** | **Roboto / Google Sans** | Display / Headline / Title / Body / Label 五大语义分级，每级分 Large, Medium, Small。 |

---

## ⚡ 移动端交互：波纹反馈与弹性物理 (Ripple & Physics)

- **无边界/有边界波纹 (State Layers)**：
  - 点击任何组件（Button, ListItem），由手指落点向外扩散半透明涟漪动画（Ripple），同时组件表面叠加 8%~12% 状态透明层（Hover / Focus / Pressed）。
- **容器转换动效 (Container Transform)**：
  - 列表卡片被点击后，以物理流动平滑放大变形成全屏详情页，保持视觉连续性。

---

## 🔗 官方资源与仓库
- 官方规范站点：[Material Design 3 官网](https://m3.material.io/)
- GitHub 官方仓库：[material-components-android](https://github.com/material-components/material-components-android)
- 设计资产总览：[[00 - UI Vibe Coding Compass (MOC)]]
