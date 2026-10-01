const fs = require('fs');
const path = require('path');

const specsDir = path.join('D:', 'mobile-ui-styles', '03-组件蓝图', '现代规范');

// Component 06: Skeleton & Shimmer
const comp06 = `---
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

> 整理自 GitHub 开源标杆 \`shadcn-ui/ui\`、\`react-native-reusables\` 与 \`ant-design-mobile\` 现代骨架屏体系。
> 移动端交互铁律：**严禁在无反馈的白屏或全屏死等菊花（Spinner）中流失用户**。骨架屏能在网络请求落地前预先勾勒页面几何空间，将感知响应压进 **< 400ms**（多尔蒂门槛），并从物理上根绝累积布局偏移（CLS, Cumulative Layout Shift）。

---

## 📱 移动端加载形态选型：Skeleton vs Spinner

| 交互形态 | 适用场景 | 用户心理感受 | 劣势与避坑红线 |
| :--- | :--- | :--- | :--- |
| **骨架屏 (Skeleton Shimmer)** | 信息流、商品瀑布流、用户主页、图文详情首屏 | **预期明确，降低焦虑**。用户直观感知即将渲染的内容模块骨架。 | 严禁与真实渲染排版出现高宽偏差；严禁骨架停留超过 8s 未超时降级。 |
| **局部微型转轮 (Inline Spinner)** | 按钮提交中（“支付中...”）、下拉刷新小把手、局部切换 | **轻量即时**。聚焦单个微操作的进行态，不侵入大盘信息。 | 严禁全屏遮罩居中转轮；严禁让用户在无进度预期的死等中点击无效。 |

---

## 🛠️ 骨架屏结构物理与光波扫描 (Shimmer Physics)

\`\`\`text
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
\`\`\`

### 关键动效法则
1. **135° 线性光波扫光 (Shimmer Wave)**：
   - 采用柔和线性渐变：\`linear-gradient(90deg, #1e293b 0%, #334155 50%, #1e293b 100%)\`；
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

\`\`\`html
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
\`\`\`

---

## ⚠️ 绝对避坑红线 (DO NOT)
- ❌ **严禁死灰静态展示**：必须附加 \`animate-pulse\` 或线性 Shimmer，静止灰色块会被用户判定为“图片裂开加载失败”；
- ❌ **严禁宽高忽大忽小**：骨架尺寸必须与即将展示的图片/文本高度像素级一致，杜绝数据到达时页面跳变；
- ❌ **严禁无限加载死锁**：超过 8 秒未获取到数据必须自动切入 \`[[09 - Empty & Error State (空状态与缺省断网引导页规范)]]\`。

---

## 🔗 知识库关联与导航
- 深入微加载心理门槛：[[03 - 多尔蒂门槛 (Doherty Threshold) 与微加载]]
- 结合基础卡片质感：[[Cards & Bento Surfaces]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
`;

fs.writeFileSync(path.join(specsDir, '06 - Skeleton & Shimmer (骨架屏与弱网占位规范).md'), comp06, 'utf8');
console.log('Created comp06 successfully');

// Component 07: Badge & Avatar Group
const comp07 = `---
id: "comp-badge-avatar"
title: "Badge & Avatar Group (徽标与头像堆叠组规范)"
type: "component-blueprint"
category: "组件蓝图"
tags:
  - "component/badge"
  - "component/avatar"
  - "ui/mobile"
  - "interaction/social"
source_repo: "shadcn-ui/ui, ant-design-mobile, youzan/vant"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[02 - 米勒定律 (Miller's Law) 与信息分块]]"
---

# Badge & Avatar Group (徽标与头像堆叠组规范)

> 整理自全球主流设计规范 \`shadcn-ui/ui\` 与 \`ant-design-mobile\`。
> 移动端屏幕寸土寸金，**徽标（Badge）** 负责精准提醒未读信息与系统状态，**头像堆叠组（Avatar Group）** 负责在微小尺寸下呈现高聚合的社交活跃度与协作人员列表。

---

## 📱 徽标选型：Dot vs Count vs Status

| 徽标形态 | 典型应用场景 | 尺寸与视觉权重 | 交互与文本限制 |
| :--- | :--- | :--- | :--- |
| **小红点 (Dot Badge)** | 底部 TabBar 未读更新、设置菜单有新版本 | 6px ~ 8px 纯色圆点，右上角定位 | 仅提示“有更新”，无数字压迫感；已读即刻消失。 |
| **计数胶囊 (Count Pill)** | 消息列表未读私信、购物车商品数量 | 高度 18px，最小宽度 18px，左右内边距 5px | **上限封顶 99+**；超过 99 严禁撑爆容器，防止变形。 |
| **状态指示灯 (Presence Ring)** | 头像右下角（在线/勿扰/离开/离线） | 10px ~ 12px 圆环，带 2px 底板色描边 | 绿点（在线）、橙点（离开）、红点（忙碌）、灰环（离线）。 |

---

## 🛠️ 头像堆叠组物理模型 (Avatar Stacking)

\`\`\`text
+------------------------------------------+
|  ( Avatar 1 )                            |
|       ( Avatar 2 )                       |  <- 头像间距负重叠 (-space-x-3 / -12px)
|            ( Avatar 3 )                  |  <- 隔离描边：ring-2 ring-slate-900 (防止边缘色块粘连)
|                 [ +4 更多 ]               |  <- 剩余计数胶囊：展示超出人员数量
+------------------------------------------+
\`\`\`

### 关键工程规则
1. **隔离遮罩描边 (Physical Cutout Ring)**：
   - 堆叠的每一个头像必须拥有与**父容器底色完全相同**的 2px 环形描边（\`ring-2 ring-slate-900\`），形成硬性的物理分离感；
2. **米勒定律限制 ($\le 4$ 个)**：
   - 移动端单行头像堆叠展示最多 3~4 个，超出部分必须收敛为 \`+N\` 胶囊圆球。

---

## 🎨 视觉实时渲染与工程源码双模呈现

### 1. 👀 实时渲染视觉预览 (Obsidian 原生高保真渲染)

<div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; padding: 20px; max-width: 380px; margin: 16px auto; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <!-- 标题与状态 -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
    <div>
      <div style="font-size: 14px; font-weight: 700;">协作团队成员</div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">4 人正在协同编辑</div>
    </div>
    <!-- 徽标通知按钮 -->
    <div style="position: relative; display: inline-flex;">
      <span style="font-size: 20px; cursor: pointer;">🔔</span>
      <span style="position: absolute; top: -2px; right: -4px; height: 16px; min-width: 16px; border-radius: 999px; background: #ef4444; color: #ffffff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; border: 2px solid #0f172a;">8</span>
    </div>
  </div>

  <!-- 头像堆叠列表 -->
  <div style="display: flex; align-items: center; padding: 10px 0;">
    <div style="display: flex; margin-left: 6px;">
      <!-- 头像 1 (在线) -->
      <div style="position: relative; margin-left: -6px;">
        <div style="width: 42px; height: 42px; border-radius: 999px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; border: 2.5px solid #0f172a;">AL</div>
        <span style="position: absolute; bottom: 0; right: 0; width: 11px; height: 11px; border-radius: 999px; background: #22c55e; border: 2px solid #0f172a;"></span>
      </div>
      <!-- 头像 2 -->
      <div style="position: relative; margin-left: -12px;">
        <div style="width: 42px; height: 42px; border-radius: 999px; background: linear-gradient(135deg, #ec4899, #f43f5e); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; border: 2.5px solid #0f172a;">MR</div>
        <span style="position: absolute; bottom: 0; right: 0; width: 11px; height: 11px; border-radius: 999px; background: #22c55e; border: 2px solid #0f172a;"></span>
      </div>
      <!-- 头像 3 (忙碌) -->
      <div style="position: relative; margin-left: -12px;">
        <div style="width: 42px; height: 42px; border-radius: 999px; background: linear-gradient(135deg, #06b6d4, #3b82f6); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; border: 2.5px solid #0f172a;">KC</div>
        <span style="position: absolute; bottom: 0; right: 0; width: 11px; height: 11px; border-radius: 999px; background: #eab308; border: 2px solid #0f172a;"></span>
      </div>
      <!-- +N 更多胶囊 -->
      <div style="margin-left: -12px; width: 42px; height: 42px; border-radius: 999px; background: #1e293b; color: #94a3b8; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; border: 2.5px solid #0f172a;">
        +12
      </div>
    </div>
  </div>
</div>

### 2. 💻 生产级工程源码 (Tailwind CSS / 供 AI 检索调用)

\`\`\`html
<!-- 移动端头像重叠组 (Avatar Stacking Group) -->
<div class="flex items-center -space-x-3 overflow-hidden p-2">
  <!-- 头像单项 (带在线指示器) -->
  <div class="relative inline-block">
    <div class="h-10 w-10 rounded-full ring-2 ring-slate-900 bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
      JD
    </div>
    <span class="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
  </div>

  <div class="relative inline-block">
    <div class="h-10 w-10 rounded-full ring-2 ring-slate-900 bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white">
      SL
    </div>
    <span class="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
  </div>

  <!-- 超额数量收敛胶囊 -->
  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300 ring-2 ring-slate-900">
    +5
  </div>
</div>
\`\`\`

---

## ⚠️ 绝对避坑红线 (DO NOT)
- ❌ **严禁头像无描边直接叠放**：不同头像边缘颜色相近时，无 ring-2 隔离会导致人物轮廓粘连模糊；
- ❌ **严禁数字徽标无封顶**：未读消息出现 142 条时未转换成 \`99+\`，会导致徽标被横向严重拉伸变形；
- ❌ **严禁红点侵占触控靶心**：Badge 必须设置 \`pointer-events-none\`，严禁遮挡母体按钮的点击响应。

---

## 🔗 知识库关联与导航
- 结合米勒定律信息分块：[[02 - 米勒定律 (Miller's Law) 与信息分块]]
- 结合按钮组件规范：[[Tactile Buttons & Pills]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
`;

fs.writeFileSync(path.join(specsDir, '07 - Badge & Avatar Group (徽标与头像堆叠组规范).md'), comp07, 'utf8');
console.log('Created comp07 successfully');

// Component 08: SwipeAction & ListCell
const comp08 = `---
id: "comp-swipe-action-cell"
title: "SwipeAction & ListCell (滑动操作与手势单元格规范)"
type: "component-blueprint"
category: "组件蓝图"
tags:
  - "component/swipe"
  - "component/cell"
  - "ui/mobile"
  - "interaction/gesture"
source_repo: "ant-design-mobile, youzan/vant, react-native-swipe-list-view"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[01 - 菲茨定律 (Fitts's Law) 与触控靶心]]"
---

# SwipeAction & ListCell (滑动操作与手势单元格规范)

> 整理自全球移动端事实标准 iOS Mail、微信与 \`ant-design-mobile\`。
> 在移动端列表页中，**手势横滑单元格 (SwipeAction)** 是在有限行高内集成“置顶、标为已读、收藏、删除”等快捷动作的最高效交互，完美兼顾了界面的整洁度与高频单手盲操效率。

---

## 📱 滑动操作两段式阈值法则 (Two-Tier Swipe Threshold)

| 滑动阶段 | 触发距离 | 物理反馈与行为 | 典型用途 |
| :--- | :--- | :--- | :--- |
| **一阶：拉出菜单 (Reveal Actions)** | 横向左滑 $40\text{px} \sim 120\text{px}$ | 露出固定宽度的操作按钮组，松手后弹性吸附固定展开。 | 用户可从容核对按钮图标并二次点击（如：标为已读、更多）。 |
| **二阶：越界强触发 (Full Drag Auto-Trigger)** | 横向左滑 $\ge 65\%$ 屏幕宽度 | 伴随轻度触觉震动（Haptic），松手直接执行终极动作（如快速删除）。 | 超高频流式清理邮件/聊天记录，无需额外二次点击。 |

---

## 🛠️ 单元格手势结构解剖

\`\`\`text
+-------------------------------------------------------------+
| 底层右侧隐蔽动作区: [ 标为已读 #3b82f6 ] [ 置顶 #f59e0b ] [ 删除 #ef4444 ] |
+-------------------------------------------------------------+
   ▲ 上层前景卡片随手指向左滑动 (transform: translateX(-160px))
+-------------------------------------------------------------+
| [Avatar]  张经理: 下午两点的技术评审会准时开始...     14:32 |
+-------------------------------------------------------------+
\`\`\`

### 关键手势阻尼法则
1. **反向手势互锁 (Exclusive Gesture)**：
   - 用户在一个列表中展开第 2 个单元格时，第 1 个已展开的单元格必须**自动弹性回弹收起**；
   - 纵向滚动优先：当识别到用户手势为纵向垂直滚动时，必须锁死横向滑动手势，防止列表卡顿跳跃。
2. **破坏性防误触保护**：
   - “删除”按钮若在一阶点击，必须联动触发确认弹窗或提供 3 秒底部 Toast 撤销（Undo）。

---

## 🎨 视觉实时渲染与工程源码双模呈现

### 1. 👀 实时渲染视觉预览 (Obsidian 原生高保真渲染)

<div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; padding: 18px; max-width: 380px; margin: 16px auto; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <div style="font-size: 13px; font-weight: 700; color: #94a3b8; margin-bottom: 12px; letter-spacing: 0.5px;">消息列表 (支持左滑操作演示)</div>

  <!-- 滑动手势模拟容器 -->
  <div style="position: relative; border-radius: 16px; overflow: hidden; background: #ef4444;">
    <!-- 底层隐藏操作按钮 -->
    <div style="position: absolute; inset-y: 0; right: 0; width: 140px; display: flex; align-items: center;">
      <div style="flex: 1; height: 100%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; cursor: pointer;">
        标已读
      </div>
      <div style="flex: 1; height: 100%; background: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; cursor: pointer;">
        删除
      </div>
    </div>

    <!-- 上层主内容 (模拟左滑露出状态) -->
    <div style="position: relative; background: #1e293b; padding: 14px; transform: translateX(-120px); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 12px;">
      <div style="width: 40px; height: 40px; border-radius: 999px; background: linear-gradient(135deg, #6366f1, #38bdf8); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; shrink: 0;">
        UI
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 14px; font-weight: 600; color: #f8fafc;">设计规范评审群</span>
          <span style="font-size: 11px; color: #64748b;">11:24</span>
        </div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          新增了 5 组全功能移动端核心组件...
        </div>
      </div>
    </div>
  </div>
</div>

### 2. 💻 生产级工程源码 (Tailwind CSS / 供 AI 检索调用)

\`\`\`html
<!-- 移动端带手势滑出的单元格容器 -->
<div class="relative overflow-hidden rounded-2xl bg-slate-900 border border-white/5">
  <!-- 底层快捷操作动作组 -->
  <div class="absolute inset-y-0 right-0 flex w-36 items-center">
    <button class="flex h-full flex-1 items-center justify-center bg-indigo-600 text-xs font-semibold text-white active:brightness-90">
      已读
    </button>
    <button class="flex h-full flex-1 items-center justify-center bg-rose-600 text-xs font-semibold text-white active:brightness-90">
      删除
    </button>
  </div>

  <!-- 上层可拖拽卡片 (通过 transition-transform 实现平滑位移) -->
  <div class="relative flex items-center gap-3.5 bg-slate-800 p-4 transition-transform duration-200">
    <div class="h-11 w-11 shrink-0 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
      TG
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-semibold text-white truncate">团队群组通知</h4>
        <span class="text-xs text-slate-400">10:48</span>
      </div>
      <p class="text-xs text-slate-400 truncate mt-0.5">请各端按最新移动端物理触控规范完成预检...</p>
    </div>
  </div>
</div>
\`\`\`

---

## ⚠️ 绝对避坑红线 (DO NOT)
- ❌ **严禁横竖手势打架**：未计算角度斜率（Slope > 1.5 判定为纵滚）会导致上下滑屏时偶发横向卡死；
- ❌ **严禁多行同时展开**：屏幕同时存在多个张开的动作抽屉会带来灾难性的混乱感，必须互斥关闭；
- ❌ **严禁直接永久物理删除**：高危删除操作必须提供 3 秒倒计时撤销 Bar。

---

## 🔗 知识库关联与导航
- 深入触控靶心与菲茨定律：[[01 - 菲茨定律 (Fitts's Law) 与触控靶心]]
- 结合轻提示通知系统：[[03 - Toast & Notification (轻提示与全局通知规范)]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
`;

fs.writeFileSync(path.join(specsDir, '08 - SwipeAction & ListCell (滑动操作与手势单元格规范).md'), comp08, 'utf8');
console.log('Created comp08 successfully');

// Component 09: Empty & Error State
const comp09 = `---
id: "comp-empty-error-state"
title: "Empty & Error State (空状态与缺省断网引导页规范)"
type: "component-blueprint"
category: "组件蓝图"
tags:
  - "component/empty"
  - "component/error"
  - "ui/mobile"
  - "ux/recovery"
source_repo: "ant-design-mobile, youzan/vant, shadcn-ui/ui"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[07 - 移动电商高容错系统 (Shopify Polaris 范式)]]"
---

# Empty & Error State (空状态与缺省断网引导页规范)

> 整理自 GitHub 开源标杆 \`ant-design-mobile\`、\`youzan/vant\` 与 Shopify Polaris 容错规范。
> 移动端网络环境复杂、存储受限，**空状态（Empty State）绝不是无内容的死胡同，而是引导用户继续探索的最核心转化入口**。优秀的空状态能化解挫败感，通过清晰的“行动召唤（Call to Action）”将用户带回主路径。

---

## 📱 移动端 4 大经典缺省场景分类

| 缺省场景 | 核心诱因 | 心理学文案法则 | 恢复行动按钮 (CTA) |
| :--- | :--- | :--- | :--- |
| **搜索无结果 (No Search Match)** | 拼写错误或商品/内容缺货 | 抱歉，未找到“关键词”，换个词试试？ | **推荐热搜词胶囊**、一键清空搜索词 |
| **购物车/收藏夹为空 (Empty Cart)** | 新用户或刚刚结算完成 | 您的购物车空空如也，逛逛今日精选吧！ | **“去逛逛精选商品”** 主按钮 |
| **弱网/断网离线 (Offline Network)** | 电梯/地铁/信号盲区网络断开 | 网络似乎开小差了，请检查网络设置。 | **“重新加载”** 按钮（带轻震重试动效） |
| **权限受限/404 (No Permission)** | 登录凭证失效、页面已下线 | 当前内容暂不可见或已迁移。 | **“返回首页”** / “去登录” 按钮 |

---

## 🛠️ 缺省页物理布局黄金三段式

\`\`\`text
+------------------------------------------+
|                                          |
|         [ 情感化插画 / 柔光图标 ]        |  <- 尺寸 96px~120px，低饱和弱对比，不喧宾夺主
|                                          |
|           主标题：暂无相关记录           |  <- text-base / font-bold text-white
|    副文案：可以尝试更换筛选项或重置搜索   |  <- text-xs text-slate-400，引导解决问题
|                                          |
|        [ 一键重新加载 (h-11 px-8) ]      |  <- 主按钮：符合 44pt 触控靶心，带弹性反馈
|                                          |
+------------------------------------------+
\`\`\`

---

## 🎨 视觉实时渲染与工程源码双模呈现

### 1. 👀 实时渲染视觉预览 (Obsidian 原生高保真渲染)

<div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; padding: 32px 20px; max-width: 380px; margin: 16px auto; text-align: center; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <!-- 情感化光晕图标 -->
  <div style="width: 80px; height: 80px; border-radius: 999px; background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px auto;">
    <span style="font-size: 34px;">📦</span>
  </div>

  <!-- 标题与解释文案 -->
  <div style="font-size: 16px; font-weight: 700; color: #f8fafc;">暂无未完成订单</div>
  <div style="font-size: 12px; color: #94a3b8; max-width: 240px; margin: 6px auto 22px auto; line-height: 1.5;">
    您当前所有的历史订单均已配送完毕，快去探索当季新鲜好物吧！
  </div>

  <!-- 恢复动作主按钮 -->
  <button style="display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 28px; border-radius: 14px; background: #6366f1; color: #ffffff; font-size: 13px; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
    去商城逛逛
  </button>
</div>

### 2. 💻 生产级工程源码 (Tailwind CSS / 供 AI 检索调用)

\`\`\`html
<!-- 移动端全功能断网/空状态引导卡片 -->
<div class="flex flex-col items-center justify-center p-8 text-center">
  <!-- 柔光环形图标 -->
  <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
    <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-2.828-6.364m0 0a9 9 0 012.828-6.364m0 0l2.829 2.829"></path>
    </svg>
  </div>

  <h3 class="text-base font-bold text-white">网络连接中断</h3>
  <p class="mt-1.5 max-w-xs text-xs text-slate-400 leading-relaxed">
    信号连接微弱，未能成功拉取数据。请检查网络后点击下方按钮重试。
  </p>

  <!-- 核心恢复按钮 (44pt 触控靶心) -->
  <button class="mt-6 flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
    重新加载数据
  </button>
</div>
\`\`\`

---

## ⚠️ 绝对避坑红线 (DO NOT)
- ❌ **严禁责备用户**：禁止使用“你没有输入正确”、“你的网络太差”等负面用词，必须转化为包容性解决文案；
- ❌ **严禁死路设计**：空状态必须提供至少 1 个可点击的前进入口（返回上一页、去首页或重试），禁止让用户困在死屏；
- ❌ **严禁巨大突兀插画**：插画高度不得超过屏高的 25%，防止挤压核心行动按钮。

---

## 🔗 知识库关联与导航
- 深入高容错电商模式：[[07 - 移动电商高容错系统 (Shopify Polaris 范式)]]
- 结合表单与输入防错：[[04 - Mobile Form & Input (移动端表单与键盘适配规范)]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
`;

fs.writeFileSync(path.join(specsDir, '09 - Empty & Error State (空状态与缺省断网引导页规范).md'), comp09, 'utf8');
console.log('Created comp09 successfully');

// Component 10: Stepper & Quantity
const comp10 = `---
id: "comp-stepper-quantity"
title: "Stepper & Quantity (步进器与数量加减器规范)"
type: "component-blueprint"
category: "组件蓝图"
tags:
  - "component/stepper"
  - "component/counter"
  - "ui/mobile"
  - "interaction/ecommerce"
source_repo: "youzan/vant, ant-design-mobile"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[01 - 菲茨定律 (Fitts's Law) 与触控靶心]]"
---

# Stepper & Quantity (步进器与数量加减器规范)

> 整理自全球移动电商与外卖点餐事实标准 \`youzan/vant\` 与 \`ant-design-mobile\`。
> 在移动端购物车、商品详情及选座购票中，**步进器（Stepper）** 是高频数值增减的关键构件。由于拇指触控精度有限，步进器必须在紧凑尺寸内严格保障触控热区、防抖限制与临界状态保护。

---

## 📱 步进器物理形态与热区扩张设计

\`\`\`text
+------------------------------------------------+
|  [ - 减号 ]      [  12  数值框  ]      [ + 加号 ]  |
+------------------------------------------------+
      ▲                  ▲                   ▲
   触控靶心           只读或弹键盘           触控靶心
   >= 36x36pt         居中等宽数字          >= 36x36pt
   (p-2扩展命中)     (font-mono防抖动)    (p-2扩展命中)
\`\`\`

### 关键工程交互法则
1. **等宽字体防抖 (Font Monospace)**：
   - 居中的数字显示区域必须设置等宽字体（\`font-mono\`），确保数字在 1 $\rightarrow$ 2 $\rightarrow$ 10 跃迁时，宽度保持恒定，两端的加减按钮**绝不发生横向抖动**；
2. **临界值禁用态 (Boundary Lock)**：
   - 当数值到达最小值（如 \`min = 1\`）时，减号按钮必须立即变灰置灰并禁用手势响应（\`opacity-40 cursor-not-allowed pointer-events-none\`）；
   - 到达库存上限（如 \`max = 99\`）时加号同样置灰，并可轻度抖动 Toast 提示“已达限购上限”；
3. **防连击与防抖 (Debounce 300ms)**：
   - 用户连续快速狂点加号时，本地 UI 数字即时反馈自增，但向服务器发送的变更网络请求必须防抖 300ms 批量提交。

---

## 🎨 视觉实时渲染与工程源码双模呈现

### 1. 👀 实时渲染视觉预览 (Obsidian 原生高保真渲染)

<div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; padding: 20px; max-width: 380px; margin: 16px auto; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <!-- 商品卡片与步进器联动 -->
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div>
      <div style="font-size: 14px; font-weight: 700; color: #ffffff;">阿拉比卡冷萃咖啡</div>
      <div style="font-size: 12px; font-weight: 700; color: #38bdf8; margin-top: 2px;">¥28.00</div>
    </div>

    <!-- 胶囊型高触觉步进器 -->
    <div style="display: inline-flex; align-items: center; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 2px;">
      <!-- 减号 -->
      <button style="width: 34px; height: 34px; border-radius: 10px; border: none; background: rgba(255,255,255,0.06); color: #ffffff; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer;">-</button>
      <!-- 数值展示 (等宽字体) -->
      <span style="min-width: 36px; text-align: center; font-size: 14px; font-weight: 700; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #f8fafc;">2</span>
      <!-- 加号 -->
      <button style="width: 34px; height: 34px; border-radius: 10px; border: none; background: #6366f1; color: #ffffff; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(99,102,241,0.4);">+</button>
    </div>
  </div>
</div>

### 2. 💻 生产级工程源码 (Tailwind CSS / 供 AI 检索调用)

\`\`\`html
<!-- 移动端高触觉胶囊步进器 (带触控微缩放与等宽字体) -->
<div class="inline-flex items-center rounded-xl border border-white/10 bg-slate-900 p-1 shadow-inner">
  <!-- 减少按钮 (临界禁用支持) -->
  <button class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-base font-bold text-white transition-transform active:scale-90 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none">
    -
  </button>

  <!-- 居中数值 (等宽字体防左右晃动) -->
  <span class="w-10 text-center font-mono text-sm font-bold text-white">
    3
  </span>

  <!-- 增加按钮 (高亮主色) -->
  <button class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-base font-bold text-white shadow-md shadow-indigo-500/20 transition-transform active:scale-90 hover:bg-indigo-500">
    +
  </button>
</div>
\`\`\`

---

## ⚠️ 绝对避坑红线 (DO NOT)
- ❌ **严禁非等宽字体**：非 mono 字体数字变化时光标与按钮来回抖动，引发视觉疲劳与误触；
- ❌ **严禁点击靶心太小**：按钮物理展示若为 28px，必须使用 \`p-2\` 或外层包裹扩展至 $\ge 40\text{px}$ 真实触控面积；
- ❌ **严禁网络接口未防抖**：未做 debounce 会导致用户点击 5 次触发 5 次并发请求致使数据库死锁。

---

## 🔗 知识库关联与导航
- 深入触控靶心原则：[[01 - 菲茨定律 (Fitts's Law) 与触控靶心]]
- 结合移动表单体系：[[04 - Mobile Form & Input (移动端表单与键盘适配规范)]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
`;

fs.writeFileSync(path.join(specsDir, '10 - Stepper & Quantity (步进器与数量加减器规范).md'), comp10, 'utf8');
console.log('Created comp10 successfully');
