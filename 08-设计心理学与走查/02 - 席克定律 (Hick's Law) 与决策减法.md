---
id: "law-hick"
title: "席克定律 (Hick's Law) 与决策减法"
type: "psychology"
category: "设计心理学"
tags:
  - "ux/psychology"
  - "laws-of-ux"
  - "ui/mobile"
  - "interaction/decision"
source_repo: "jonyablonski/laws-of-ux"
origin_author: "William Hick & Ray Hyman (1952)"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[Navigation & TabBars]]"
---

# 席克定律 (Hick's Law) 与移动端决策减法

> **核心定律**：一个人做出决策的时间，随着**选择项数量 (n) 和复杂度**的增加而呈对数级增长。
> 数学公式：$RT = a + b \log_2(n + 1)$ （$n$ 为刺激选项数量）。

---

## 📱 移动端小屏界面的致命痛点：选择瘫痪 (Choice Overload)

手机屏幕可视面积有限，用户的注意力极其碎片化。一旦在一个屏幕内堆砌过多同等权重的按钮、链接、分类入口，用户将陷入认知停滞甚至直接流失。

### 1. 黄金破局法：渐进式披露 (Progressive Disclosure)
- **只展示当务之急**：不要在一张页面展示表单全部 15 个字段。将其拆解为“分步引导（Multi-step Wizard）”，每屏仅需用户回答 2~3 个选择，顶部配以进度条。
- **“更多”与高级选项收起**：默认只显示 3~4 个高频操作，低频冷门操作折叠进展开面板或二级菜单。

### 2. 突出“推荐预设”消除犹豫
- **给用户明确的暗示**：在充值套餐、会员订阅、规格挑选场景，将其中一个选项打上 `[最受欢迎 / 80%用户的选择]` 标签，并将其预设为选中态，将选择时间从数秒缩短到毫秒级。

### 3. 底栏导航项控制在 3 ~ 5 个
- 移动端底部 TabBar 选项严禁超过 5 个。当存在更多模块时，第 5 个 Tab 统一收纳为“我的”或“更多”，绝不横向堆满 6~7 个微小挤压的图标。

---

## 🔗 关联阅读
- 查看底栏导航最佳设计：[[Navigation & TabBars]]
- 选项卡与分段控制器规范：[[05 - Tabs & SegmentedControl (选项卡与分段控制器规范)]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
