---
id: "law-doherty"
title: "多尔蒂门槛 (Doherty Threshold) 与微动效反馈"
type: "psychology"
category: "设计心理学"
tags:
  - "ux/psychology"
  - "laws-of-ux"
  - "ui/mobile"
  - "performance/response-time"
source_repo: "jonyablonski/laws-of-ux"
origin_author: "Walter J. Doherty & Ahrvin Thadani (1982)"
related:
  - "[[Tactile Buttons & Pills]]"
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
---

# 多尔蒂门槛 (Doherty Threshold) 与微动效反馈

> **核心定律**：当人机交互的响应反馈时间**低于 400 毫秒（0.4 秒）**时，人类与计算机的交互生产力会呈现指数级跃升，用户将沉浸在无阻碍的心流（Flow）状态中。
> 反之，一旦系统响应超过 400ms 且没有任何反馈，用户将产生明显的卡顿迟滞感与焦虑感。

---

## 📱 移动端小屏界面如何对抗网络延迟与计算耗时

在移动端网络信号（4G/5G/地铁弱网）不可控的情况下，设计必须通过**感知性能优化（Perceived Performance）**将主观延迟降至 400ms 以内：

### 1. 瞬时物理微反馈 (< 100ms)
- 当用户点击一个点赞图标或提交按钮时，界面必须在 **50ms ~ 100ms** 内给出反馈：
  - 按钮微微下凹缩放 (`scale(0.96)`)；
  - 触发一次轻微系统线性马达震动（Light Haptic Feedback）；
  - 点赞红心瞬间放大填色。
- **即使后端网络接口需要 1.5 秒才返回，用户在手指抬起的刹那已经确信系统接收了指令**。

### 2. 乐观更新 (Optimistic UI)
- 在即时通讯聊天、点赞、关注、收藏场景中：
  - 用户一点击“发送”，气泡立即上屏显示在列表中，并在右下角挂微小的旋转时钟（Pending 态）；
  - 绝不使用“转菊花阻塞全屏，等接口 200 OK 后再刷新页面”的反模式。

### 3. 骨架屏 (Skeleton Screens) 代替死板 Spinner
- 页面首次拉取数据时，呈现与真实卡片、文本行严格等比例的高光流动灰条（Skeleton Shimmer）；
- 研究表明：骨架屏比居中大菊花加载圈让用户感觉“速度快了 30% 以上”，因为骨架屏预示了信息即将落地的结构雏形。

---

## 🔗 关联阅读
- 查看触控按钮下压动效与反馈：[[Tactile Buttons & Pills]]
- 动效与组件资源库：[[05 - 开源 UI 套件与动效资源库]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
