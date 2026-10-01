---
title: "Mobile Typography System"
tags:
  - "tokens"
  - "typography"
  - "fonts"
---

# 📐 移动端字阶、行高与字偶间距体系 (Mobile Typography System)

移动端屏幕在 375px ~ 430px 的狭窄物理空间中，优秀的排版节奏（Typography Rhythm）是避免页面杂乱的关键。

## 1. 推荐字阶比例系统 (Type Scale: Major Second 1.125 / Minor Third 1.2)

| 级别 (Level) | 字号 (Font Size) | 行高 (Line Height) | 字重 (Font Weight) | 字偶间距 (Tracking) | 典型应用 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `32px ~ 36px` | `1.15` | 800/900 | `-0.03em` | 瑞士主义大标题、孟菲斯重点强调、大字报数字 |
| **H1 (Large Title)** | `24px ~ 28px` | `1.25` | 700/800 | `-0.02em` | 主页面主标题、Hero 卡片标题 |
| **H2 (Section Title)** | `18px ~ 20px` | `1.35` | 600/700 | `-0.01em` | 模块栏目名、Bento 分组标题 |
| **Body (正文)** | `14px ~ 15px` | `1.55 ~ 1.6` | 400/500 | `0em` | 普通长段落、列表描述文字 |
| **Caption (副文)** | `12px ~ 13px` | `1.4` | 400/500 | `+0.01em` | 辅助时间戳、次级说明文字 |
| **Micro (极小标签)** | `10px ~ 11px` | `1.2` | 700/800 | `+0.04em` | 胶囊 Badge、状态指示器、代码元数据 |

---

## 2. 风格与字体家族矩阵 (Font Stack Mapping)
- **现代极客 / 科技无衬线**：`'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  - 代表风格：[[02. Minimalist Scandinavian]], [[03. Linear  Raycast Dark]], [[26. Bento Grid Modular]]
- **高奢 / 社论衬线**：`'Playfair Display', 'Cinzel', 'Noto Serif SC', serif`
  - 代表风格：[[05. Monochrome High-Fashion]], [[21. Editorial Magazine]], [[23. Neo-Chinese Ink & Zen]]
- **终端等宽代码**：`'JetBrains Mono', 'Fira Code', monospace`
  - 代表风格：[[15. Holo-HUD Military Matrix]], [[27. Bloomberg Terminal Finance]]
- **复古点阵像素**：`'Press Start 2P', 'Silkscreen', monospace`
  - 代表风格：[[20. Retro 8-Bit Pixel Art]]
