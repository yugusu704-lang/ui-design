---
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

> 整理自全球移动端事实标准 iOS Mail、微信与 `ant-design-mobile`。
> 在移动端列表页中，**手势横滑单元格 (SwipeAction)** 是在有限行高内集成“置顶、标为已读、收藏、删除”等快捷动作的最高效交互，完美兼顾了界面的整洁度与高频单手盲操效率。

---

## 📱 滑动操作两段式阈值法则 (Two-Tier Swipe Threshold)

| 滑动阶段 | 触发距离 | 物理反馈与行为 | 典型用途 |
| :--- | :--- | :--- | :--- |
| **一阶：拉出菜单 (Reveal Actions)** | 横向左滑 $40	ext{px} sim 120	ext{px}$ | 露出固定宽度的操作按钮组，松手后弹性吸附固定展开。 | 用户可从容核对按钮图标并二次点击（如：标为已读、更多）。 |
| **二阶：越界强触发 (Full Drag Auto-Trigger)** | 横向左滑 $ge 65%$ 屏幕宽度 | 伴随轻度触觉震动（Haptic），松手直接执行终极动作（如快速删除）。 | 超高频流式清理邮件/聊天记录，无需额外二次点击。 |

---

## 🛠️ 单元格手势结构解剖

```text
+-------------------------------------------------------------+
| 底层右侧隐蔽动作区: [ 标为已读 #3b82f6 ] [ 置顶 #f59e0b ] [ 删除 #ef4444 ] |
+-------------------------------------------------------------+
   ▲ 上层前景卡片随手指向左滑动 (transform: translateX(-160px))
+-------------------------------------------------------------+
| [Avatar]  张经理: 下午两点的技术评审会准时开始...     14:32 |
+-------------------------------------------------------------+
```

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

```html
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
```

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
