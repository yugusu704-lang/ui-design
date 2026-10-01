---
id: "comp-skeleton-shimmer"
title: "Skeleton & Shimmer (骨架屏与弱网占位规范)"
type: "component-blueprint"
category: "组件蓝图"
tags:
  - "component/skeleton"
  - "component/loading"
  - "ui/mobile"
  - "ux/performance"
source_repo: "shadcn-ui/ui, ant-design-mobile, react-native-reusables"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[03 - 多尔蒂门槛 (Doherty Threshold) 与微加载]]"
---

# Skeleton & Shimmer (骨架屏与弱网占位规范)

> 整理自 GitHub 开源标杆 `shadcn-ui/ui`、`react-native-reusables` 与 `ant-design-mobile` 现代骨架屏体系。
> 移动端交互铁律：**严禁在无反馈的白屏或全屏死等菊花（Spinner）中流失用户**。骨架屏能在网络请求落地前预先勾勒页面几何空间，将感知响应压进 **< 400ms**（多尔蒂门槛），并从物理上根绝累积布局偏移（CLS, Cumulative Layout Shift）。

---

## 📱 移动端加载形态选型：Skeleton vs Spinner

| 交互形态 | 适用场景 | 用户心理感受 | 劣势与避坑红线 |
| :--- | :--- | :--- | :--- |
| **骨架屏 (Skeleton Shimmer)** | 信息流、商品瀑布流、用户主页、图文详情首屏 | **预期明确，降低焦虑**。用户直观感知即将渲染的内容模块骨架。 | 严禁与真实渲染排版出现高宽偏差；严禁骨架停留超过 8s 未超时降级。 |
| **局部微型转轮 (Inline Spinner)** | 按钮提交中（“支付中...”）、下拉刷新小把手、局部切换 | **轻量即时**。聚焦单个微操作的进行态，不侵入大盘信息。 | 严禁全屏遮罩居中转轮；严禁让用户在无进度预期的死等中点击无效。 |

---

## 🛠️ 骨架屏结构物理与光波扫描 (Shimmer Physics)

```text
+------------------------------------------+
|  (O)  Avatar (w-12 h-12 rounded-full)    |  <- 骨架头像：与真实头像尺寸必须 1:1 精确对齐
|  ==== Title Placeholder (w-3/5 h-4)      |  <- 标题骨架：高度匹配正文字阶，宽度留白模拟自然排版
|  --   Subtext Placeholder (w-2/5 h-3)    |  <- 副文本骨架：更浅灰度，区分视觉层级
+------------------------------------------+
|  [====================================]  |
|  [         Image Media Shimmer        ]  |  <- 媒体占位：严格保持图片宽高比 (aspect-ratio: 16/9)
|  [====================================]  |
+------------------------------------------+
|  -------------------------------------   |  <- 段落骨架：3行长短交替，末行长度 40%~60%
|  -----------------------------------     |
|  -----------------                       |
+------------------------------------------+
```

### 关键动效法则
1. **135° 线性光波扫光 (Shimmer Wave)**：
   - 采用柔和线性渐变：`linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)`；
   - 动画周期推荐 **1.5s ~ 1.8s**，匀速流动，避免过快引起眩晕。
2. **防布局抖动 (CLS = 0)**：
   - 骨架容器的外边距、圆角与内部间距，必须与真实内容卡片完全共享同一套 Design Tokens。

---

## 🎨 视觉实时渲染与工程源码双模呈现

### 1. 👀 实时渲染视觉预览 (Obsidian 原生高保真渲染)

<div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; padding: 20px; max-width: 380px; margin: 16px auto; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- 头部用户信息骨架 -->
  <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 16px;">
    <div style="width: 46px; height: 46px; border-radius: 999px; background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%); background-size: 200% 100%;"></div>
    <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
      <div style="height: 14px; width: 60%; border-radius: 6px; background: #334155;"></div>
      <div style="height: 10px; width: 38%; border-radius: 4px; background: #1e293b;"></div>
    </div>
  </div>

  <!-- 媒体大图骨架 -->
  <div style="height: 140px; width: 100%; border-radius: 16px; background: #1e293b; margin-bottom: 16px; position: relative; overflow: hidden;">
    <div style="position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);"></div>
  </div>

  <!-- 多行段落骨架 -->
  <div style="display: flex; flex-direction: column; gap: 8px;">
    <div style="height: 11px; width: 100%; border-radius: 4px; background: #334155;"></div>
    <div style="height: 11px; width: 92%; border-radius: 4px; background: #334155;"></div>
    <div style="height: 11px; width: 56%; border-radius: 4px; background: #1e293b;"></div>
  </div>
</div>

### 2. 💻 生产级工程源码 (Tailwind CSS / 供 AI 检索调用)

```html
<!-- 移动端文章/媒体动态骨架卡片 (Tailwind 原生脉冲光) -->
<div class="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl">
  <!-- 头部用户信息 -->
  <div class="flex items-center gap-3.5 animate-pulse">
    <div class="h-12 w-12 shrink-0 rounded-full bg-slate-800"></div>
    <div class="flex-1 space-y-2">
      <div class="h-3.5 w-3/5 rounded-md bg-slate-700"></div>
      <div class="h-2.5 w-2/5 rounded bg-slate-800"></div>
    </div>
  </div>

  <!-- 媒体展示区 (16:9 比例锁定防抖动) -->
  <div class="my-4 aspect-[16/9] w-full animate-pulse rounded-2xl bg-slate-800"></div>

  <!-- 文本段落模拟 -->
  <div class="space-y-2.5 animate-pulse">
    <div class="h-2.5 w-full rounded bg-slate-700"></div>
    <div class="h-2.5 w-11/12 rounded bg-slate-700"></div>
    <div class="h-2.5 w-3/5 rounded bg-slate-800"></div>
  </div>
</div>
```

---

## ⚠️ 绝对避坑红线 (DO NOT)
- ❌ **严禁死灰静态展示**：必须附加 `animate-pulse` 或线性 Shimmer，静止灰色块会被用户判定为“图片裂开加载失败”；
- ❌ **严禁宽高忽大忽小**：骨架尺寸必须与即将展示的图片/文本高度像素级一致，杜绝数据到达时页面跳变；
- ❌ **严禁无限加载死锁**：超过 8 秒未获取到数据必须自动切入 `[[09 - Empty & Error State (空状态与缺省断网引导页规范)]]`。

---

## 🔗 知识库关联与导航
- 深入微加载心理门槛：[[03 - 多尔蒂门槛 (Doherty Threshold) 与微加载]]
- 结合基础卡片质感：[[Cards & Bento Surfaces]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
