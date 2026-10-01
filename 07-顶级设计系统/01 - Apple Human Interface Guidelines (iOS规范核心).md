---
id: "ds-apple-hig"
title: "Apple Human Interface Guidelines (iOS规范核心)"
type: "design-system"
category: "设计系统"
tags:
  - "design-system/apple"
  - "platform/ios"
  - "ui/mobile"
  - "interaction/haptics"
source_repo: "alexpate/awesome-design-systems"
vendor: "Apple Inc."
official_url: "https://developer.apple.com/design/human-interface-guidelines/"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[Navigation & TabBars]]"
  - "[[Tactile Buttons & Pills]]"
---

# Apple Human Interface Guidelines (iOS 规范核心)

> 整理自全球顶尖设计系统集锦 `alexpate/awesome-design-systems` 与苹果官方 HIG。
> iOS 设计规范是移动设备交互设计的基石，核心追求**直观性 (Clarity)、遵从性 (Deference) 与深度感 (Depth)**。

---

## 🏛️ 核心设计哲学 (Core Principles)

1. **清晰直观 (Clarity)**：
   - 文本无论在何种字号下都必须清晰易读，图标轮廓精准干脆，重点装饰元素恰如其分，一切设计为内容理解服务。
2. **遵从内容 (Deference)**：
   - UI 界面不喧宾夺主。流动的动效与轻盈的半透明材质（Vibrancy / Blur）帮助用户理解内容层级，而非炫耀视觉技法。
3. **空间深度 (Depth)**：
   - 真实的视觉图层与真实的物理反馈（Haptics 震动触觉），让用户感知界面如同一叠可拾取、可滑动的实体卡片。

---

## 📱 iOS 移动端核心物理参数规格

| 设计维度 | 规格标准 | 备注与红线要求 |
| :--- | :--- | :--- |
| **最小触控热区** | `44 × 44 pt` | 满足成年人指腹点击无误判的生理极限（遵守 [[01 - 菲茨定律 (Fitts's Law) 与触控靶心]]）。 |
| **屏幕安全区 (Safe Area)** | 动态感知 Header & Home Indicator | 顶部预留状态栏/灵动岛高度（约 54~59 pt），底部预留 Home 条避让（34 pt），内容滚动可穿透，按钮绝不能贴死屏幕物理底边。 |
| **底层导航 (TabBar)** | 高度 `49 pt`（未含 Home 避让） | 推荐 3~5 个顶层视图，超过 5 个使用 `More` 或抽屉，保持单手可达。 |
| **系统字体阶梯** | **SF Pro** (Display / Text) | 大标题 Large Title: `34pt (Bold)` / 标题 1: `28pt` / 正文 Body: `17pt (Regular)` / 辅助说明 Caption: `12pt`。 |
| **卡片默认圆角** | 连续曲率平滑圆角 (Squircle) | 通常为 `12pt ~ 24pt`，避免几何尖锐生硬。 |

---

## 🖐️ iOS 灵魂交互：触觉与拟真手势 (Haptics & Gestures)

- **UIFeedbackGenerator 触觉分级**：
  - `Impact (Light/Medium/Heavy)`：实体按钮物理微压、滑块刻度卡顿；
  - `Selection`：滚轮选择器（Picker Wheel）拨动时的齿轮咬合感；
  - `Notification (Success/Warning/Error)`：操作完成或失败时的多段节奏震动。
- **边缘滑动返回 (Interactive Pop Gesture)**：
  - 从屏幕左侧边缘右滑返回上一级，是 iOS 用户强烈的无意识心智，任何二级页面严禁拦截此原生手势。

---

## 🔗 官方资源与仓库
- 官方规范指南：[Apple HIG 官方站点](https://developer.apple.com/design/human-interface-guidelines/)
- SF Symbols 官方图标库：[Apple SF Symbols 资源](https://developer.apple.com/sf-symbols/)
- 设计资产总览：[[00 - UI Vibe Coding Compass (MOC)]]
