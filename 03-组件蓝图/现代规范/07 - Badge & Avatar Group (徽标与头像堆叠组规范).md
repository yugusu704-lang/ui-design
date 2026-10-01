---
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

> 整理自全球主流设计规范 `shadcn-ui/ui` 与 `ant-design-mobile`。
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

```text
+------------------------------------------+
|  ( Avatar 1 )                            |
|       ( Avatar 2 )                       |  <- 头像间距负重叠 (-space-x-3 / -12px)
|            ( Avatar 3 )                  |  <- 隔离描边：ring-2 ring-slate-900 (防止边缘色块粘连)
|                 [ +4 更多 ]               |  <- 剩余计数胶囊：展示超出人员数量
+------------------------------------------+
```

### 关键工程规则
1. **隔离遮罩描边 (Physical Cutout Ring)**：
   - 堆叠的每一个头像必须拥有与**父容器底色完全相同**的 2px 环形描边（`ring-2 ring-slate-900`），形成硬性的物理分离感；
2. **米勒定律限制 ($le 4$ 个)**：
   - 移动端单行头像堆叠展示最多 3~4 个，超出部分必须收敛为 `+N` 胶囊圆球。

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

```html
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
```

---

## ⚠️ 绝对避坑红线 (DO NOT)
- ❌ **严禁头像无描边直接叠放**：不同头像边缘颜色相近时，无 ring-2 隔离会导致人物轮廓粘连模糊；
- ❌ **严禁数字徽标无封顶**：未读消息出现 142 条时未转换成 `99+`，会导致徽标被横向严重拉伸变形；
- ❌ **严禁红点侵占触控靶心**：Badge 必须设置 `pointer-events-none`，严禁遮挡母体按钮的点击响应。

---

## 🔗 知识库关联与导航
- 结合米勒定律信息分块：[[02 - 米勒定律 (Miller's Law) 与信息分块]]
- 结合按钮组件规范：[[Tactile Buttons & Pills]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
