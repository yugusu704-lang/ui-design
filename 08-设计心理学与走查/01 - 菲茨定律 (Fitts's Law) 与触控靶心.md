---
id: "law-fitts"
title: "菲茨定律 (Fitts's Law) 与触控靶心"
type: "psychology"
category: "设计心理学"
tags:
  - "ux/psychology"
  - "laws-of-ux"
  - "ui/mobile"
  - "interaction/touch"
source_repo: "jonyablonski/laws-of-ux"
origin_author: "Paul Fitts (1954)"
related:
  - "[[Tactile Buttons & Pills]]"
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
---

# 菲茨定律 (Fitts's Law) 与移动端触控靶心

> **核心定律**：到达一个目标的时间，取决于目标的**距离 (Distance)** 和目标的**尺寸大小 (Width)**。
> 数学公式：$MT = a + b \log_2(2D / W)$ （$D$ 为到目标的距离，$W$ 为目标宽度）。

---

## 📱 移动端界面的设计洞察与落地黄金准则

在移动单手握持（One-handed Thumb Operation）场景下，菲茨定律发挥着绝对决定性作用：

### 1. 移动端“拇指热区”与边缘效应
- **屏幕底部与四角拥有“无限大”的等效物理尺寸**：
  - 手机物理屏幕的边缘会物理挡住手指的滑动漂移。因此，**屏幕底部的沉底按钮（Bottom CTA）、常驻 TabBar、悬浮胶囊**无论多快触达，手指都不会滑脱屏幕，是操作时间最短、精确度最高的热区。
  - 相反，将核心操作放在大屏手机的**左上角/右上角**是严重违背菲茨定律的反人性行为。

### 2. 最小物理触控面积铁律
- **成年人指腹接触面**：普通人拇指指腹接触电容屏的平均有效面积约为 `8mm ~ 10mm`。
- **iOS HIG 标准**：最小点击热区 `44 × 44 pt`。
- **Android Material 规范**：最小点击热区 `48 × 48 dp`。
- **按钮视觉与热区解耦技巧**：
  ```css
  /* 视觉仅有 20px 的关闭叉叉，通过伪元素或透明 padding 扩展触控靶心 */
  .icon-btn-touchable {
    position: relative;
    width: 20px;
    height: 20px;
  }
  .icon-btn-touchable::after {
    content: '';
    position: absolute;
    top: -12px;
    bottom: -12px;
    left: -12px;
    right: -12px; /* 等效命中区域扩展至 44x44px */
  }
  ```

### 3. 避免“相邻高危按钮”误触
- 当两个相反动作并排摆放时（如：“确认支付”与“取消清空”、“删除”与“编辑”），必须保证它们之间留出至少 `8px ~ 12px` 的物理安全间距，或者改变两者的视觉权重（主按钮高亮实心，次按钮幽灵透明）。

---

## 🔗 关联阅读
- 查看高触觉按钮规范：[[Tactile Buttons & Pills]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
