---
title: "Shadows & Elevation Tokens"
tags:
  - "tokens"
  - "shadows"
  - "elevation"
---

# 🌓 物理阴影、发光与深度层级代码库 (Shadows & Elevation Tokens)

阴影是移动端界面传达 **Z 轴空间深度与触觉感知** 的核心物理语言。

## 1. 核心阴影类别

### A. 零模糊硬投影 (Neo-Brutalism / Pop Art)
```css
/* 纯黑实体冲击，零高斯羽化 */
--shadow-hard-md: 4px 4px 0px #000000;
--shadow-hard-sm: 2px 2px 0px #000000;
--shadow-hard-lg: 6px 6px 0px #000000;
```

### B. 多重微漫反射 (Linear Dark / Clean Scandinavian)
```css
/* 黑曜石高精暗黑阴影 */
--shadow-linear-deep: 0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
/* 北欧极简如呼吸般的极轻微柔阴影 */
--shadow-nordic-whisper: 0 4px 20px -4px rgba(0, 0, 0, 0.04);
```

### C. 拟物双向对冲柔光 (Soft Neumorphism 2.0)
```css
/* 一侧高光反射、一侧阴暗吸收 */
--shadow-neu-surface: 7px 7px 16px #CBD5E1, -7px -7px 16px #FFFFFF;
--shadow-neu-inset: inset 4px 4px 8px #CBD5E1, inset -4px -4px 8px #FFFFFF;
```

### D. 彩色膨胀弥散 (Claymorphism & Dopamine Candy)
```css
/* 同色系彩色扩散投影 + 顶底双内高光 */
--shadow-clay-pink: 0 18px 30px -6px rgba(244, 114, 182, 0.35), inset 0 6px 10px rgba(255, 255, 255, 0.9), inset 0 -4px 6px rgba(0,0,0,0.05);
```
