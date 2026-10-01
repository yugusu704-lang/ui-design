---
id: "ds-ibm-carbon"
title: "IBM Carbon Design System (严谨型数据与设计规范)"
type: "design-system"
category: "设计系统"
tags:
  - "design-system/ibm-carbon"
  - "domain/enterprise"
  - "ui/mobile"
  - "data/dataviz"
source_repo: "alexpate/awesome-design-systems"
vendor: "IBM Corp."
official_url: "https://carbondesignsystem.com/"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[Cards & Bento Surfaces]]"
---

# IBM Carbon Design System (严谨型数据与设计规范)

> 整理自全球顶尖设计系统集锦 `alexpate/awesome-design-systems` 与 IBM Carbon 官方规范。
> Carbon 是全球工业级软件、云计算中控、AI 数据看板与严肃系统的设计规范巅峰，以**严谨的 2x 网格系统 (2x Grid)、高对比度语义色彩与出类拔萃的数据可视化规范**见长。

---

## 📐 核心设计支柱 (Design Pillars)

1. **绝对严谨的 2x 网格系统 (2x Grid)**：
   - 所有的间距（Margin / Padding / Gap）与组件尺寸严格基于 `8px` 及其半步长 `4px` 步进（4, 8, 16, 24, 32, 48, 64px），杜绝任何奇数随意排版。
2. **极高标准的可访问性 (Accessibility First)**：
   - 全面支持 WCAG AAA 级对比度，所有文本与关键数据图表确保色盲与弱视群体无障碍辨识。
3. **数据可视化色彩规范 (Data Visualization Palettes)**：
   - 为折线图、柱状图、饼图提供系统级的离散色彩（Categorical）、连续色彩（Sequential）与发散色彩（Diverging）算法调色盘。

---

## 📱 移动端数据与看板设计规范

| 设计维度 | 规范标准 | 移动端落地建议 |
| :--- | :--- | :--- |
| **小屏图表响应式** | 简化数据密度 (Progressive Disclosure) | 移动端折线图避免超过 3 条曲线混杂；提供点击数据游标（Scrubber Tooltip），手指滑动时展示即时浮层数据，而非把标签密密麻麻堆在轴线上。 |
| **KPI 指标卡片 (Stat Cards)** | 突出单一数值的核心层级 | 主数字采用大字号加粗（28px~36px），配以环比/同比上升下降红绿色微胶囊标签（如 `+12.4% ↑`），底部留出 40px 高度嵌入微缩火花线图（Sparkline）。 |
| **暗黑/明亮中性灰阶 (Cool Gray / Warm Gray)** | 4 种系统主题（White, Gray 10, Gray 90, Gray 100） | 企业级移动端推荐使用沉稳冷灰 `Gray 100`（`#161616`）作为暗色看板底色，消除纯黑眩光。 |

---

## 🔗 官方资源与仓库
- 官方规范站点：[carbondesignsystem.com](https://carbondesignsystem.com/)
- GitHub 官方仓库：[carbon-design-system/carbon](https://github.com/carbon-design-system/carbon)
- 设计资产总览：[[00 - UI Vibe Coding Compass (MOC)]]
