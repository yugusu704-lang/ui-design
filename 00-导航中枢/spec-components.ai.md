---
id: "spec-components-ai"
title: "AI 规约：移动端现代组件蓝图 (Component Blueprints AI Spec)"
for_agent: true
max_tokens_target: 500
tags:
  - "ai-spec"
  - "components"
  - "shadcn-ui"
  - "constraints"
---

# 🤖 移动端现代组件蓝图 AI 秒查规约 (Component Spec)

> **AI 检阅指令**：组装或生成具体 UI 组件时仅读取本卡片，**严禁**向下读取完整长篇组件文档。

| 组件类型 | 交互场景与定位 | 硬性工程数值 (Metrics) | 绝对避坑红线 (DO NOT) | 生产级 Tailwind 模板 |
| :--- | :--- | :--- | :--- | :--- |
| **Sheet (底部抽屉)** | 筛选、长表单、详情弹层 (代替居中 Dialog) | • 抽屉圆角: `rounded-t-3xl`<br>• 顶部把手: `w-10 h-1 rounded-full`<br>• 阻尼关闭: 手指下滑 $\ge 80\text{px}$ 触发 | ❌ 展开抽屉时未锁定底层母页（必须 body scroll lock）<br>❌ 内部滚动在未回顶时意外触发抽屉下滑关闭<br>❌ 底部提交按钮未留出 iOS 34px 安全区 | `<div class="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-slate-900 p-6 pb-10 border-t border-white/10 shadow-2xl"><div class="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-700"></div>...</div>` |
| **ActionSheet (操作表)** | 列表长按、更多操作 (代替桌面 Hover 下拉) | • 选项行高: $\ge 50\text{px}$<br>• 取消按钮: 独立悬浮胶囊 (`mt-2`)<br>• 破坏选项: 红色 (`text-rose-500`) | ❌ 依赖鼠标 hover 或微小点击展示菜单<br>❌ 将删除/注销等高危破坏项与普通分享项混排<br>❌ 取消按钮未做视觉分离 | `<div class="fixed inset-x-4 bottom-6 z-50 space-y-2"><div class="rounded-2xl bg-slate-900/95 border border-white/10 divide-y divide-white/5">...</div><button class="w-full rounded-2xl bg-slate-800 py-3.5 font-bold text-white">取消</button></div>` |
| **Toast (轻提示)** | 操作成功、复制链接 (非阻塞性即时反馈) | • 推荐位置: 顶部胶囊 (`top-12`)<br>• 停留时长: 2.5s ~ 4s<br>• 字符限制: $\le 15$ 汉字单行 | ❌ 使用几秒消失的 Toast 展示严重不可逆错误<br>❌ 放在屏幕最下方被弹出的键盘或 TabBar 遮挡<br>❌ 用户连续点击时生成大量 Toast 串联排队 | `<div class="fixed top-12 inset-x-0 z-50 flex justify-center pointer-events-none"><div class="pointer-events-auto flex items-center gap-2 rounded-full bg-slate-900/95 px-4 py-2 border border-white/10 shadow-xl backdrop-blur-md text-xs text-white">...</div></div>` |
| **Form / Input (表单输入)** | 登录、注册、搜索、支付信息录入 | • 正文字号: **强制 $\ge 16\text{px}$** (防 iOS 放大)<br>• 输入框高度: `h-12` (48px)<br>• 软键盘: 专设 `inputmode` | ❌ 输入框字号小于 16px 导致 iOS Safari 强行缩放页面<br>❌ 输入数字/电话时未指定 `inputmode="numeric"` 唤出全键盘<br>❌ 输入框被键盘遮挡时未自动 `scrollIntoView` | `<input type="tel" inputmode="numeric" class="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-base text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />` |
| **Tabs / Segment (分段控制器)** | 同一页面平级互斥视图快速切换 | • 固定项数: 药丸分段限 2~4 个<br>• 滑块动效: 物理弹簧位移 `spring`<br>• 手势联动: 支持下层内容划屏联动 | ❌ 药丸分段控制器塞入 5 个以上导致选项字体重叠截断<br>❌ 点击 Tab 时仅内容瞬跳，缺乏指示器平滑滑移过渡<br>❌ 长横滑 Tabs 选中边缘项时未自动滚动居中 | `<div class="inline-flex w-full rounded-2xl bg-slate-800 p-1 border border-white/5"><button class="flex-1 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-md transition-all">Tab1</button><button class="flex-1 rounded-xl py-2 text-xs text-slate-400">Tab2</button></div>` |
| **Skeleton (骨架屏占位)** | 弱网加载、信息流与图文详情首屏 | • 宽高比: 与真实内容严格 1:1 对齐<br>• 动效周期: `animate-pulse` (1.5s~1.8s)<br>• 段落末行: 宽度收窄至 50%~60% | ❌ 使用纯灰静止死色块让用户误以为界面崩溃<br>❌ 骨架高度与真实内容不一致导致严重布局抖动(CLS)<br>❌ 超过 8s 未获取数据未降级为失败重试状态 | `<div class="w-full animate-pulse space-y-3 p-4 rounded-2xl bg-slate-900 border border-white/10"><div class="h-12 w-12 rounded-full bg-slate-800"></div><div class="h-3 w-3/4 rounded bg-slate-700"></div></div>` |
| **Badge / Avatar (徽标与头像)** | 未读通知、消息角标、协同成员堆叠 | • 红点尺寸: 6px~8px 圆点 (`rounded-full`)<br>• 计数封顶: **上限 99+** 防止撑爆<br>• 堆叠间隔: `-space-x-3` + `ring-2` | ❌ 头像重叠未加 `ring-2` 造成相邻颜色粘连<br>❌ 徽标未做 `pointer-events-none` 抢占点击靶心<br>❌ 99 条以上未做封顶导致胶囊被拉伸变形 | `<div class="flex items-center -space-x-3"><div class="relative"><div class="h-10 w-10 rounded-full ring-2 ring-slate-900 bg-indigo-600"></div><span class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span></div><div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 ring-2 ring-slate-900 text-xs text-slate-300">+3</div></div>` |
| **SwipeAction (手势滑动操作)** | 列表已读、置顶、右滑收藏、左滑删除 | • 一阶阈值: 左滑 $60\text{px}\sim 120\text{px}$ 吸附<br>• 二阶阈值: 左滑 $\ge 65\%$ 宽自动触发<br>• 互斥关闭: 同屏仅允许单行处于滑动展开 | ❌ 纵向滚动时偶发触发横滑导致手势打架卡顿<br>❌ 展开第 2 项时未自动收回已展开的第 1 项<br>❌ 破坏性删除操作未提供 3 秒底部撤销(Undo) | `<div class="relative overflow-hidden rounded-2xl bg-slate-900"><div class="absolute inset-y-0 right-0 flex w-28"><button class="flex-1 bg-rose-600 text-xs text-white">删除</button></div><div class="relative bg-slate-800 p-4 transition-transform">...</div></div>` |
| **Empty State (缺省断网引导)** | 购物车空、搜索无果、离线断网、404 | • 情感图标: 80px~96px 柔光无攻击性插画<br>• 恢复按钮: 符合 44pt 触控靶心主按钮<br>• 文案基调: 绝对包容、禁止指责用户 | ❌ 页面只展示“无数据”死胡同，无任何引导动作<br>❌ 出现 404 或网络断开时未提供“重新加载”或“返回首页”<br>❌ 插画尺寸过大超过屏高 30% 挤压触控区 | `<div class="flex flex-col items-center p-8 text-center"><div class="h-16 w-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl mb-3">📦</div><h4 class="text-sm font-bold text-white">暂无相关数据</h4><button class="mt-4 h-10 px-5 rounded-xl bg-indigo-600 text-xs font-semibold text-white active:scale-95">重新加载</button></div>` |
| **Stepper (步进器加减)** | 电商加减购、选座买票、数量微调 | • 触控扩展: 两侧按钮真实触控 $\ge 36\text{pt}$<br>• 等宽数字: **强制 `font-mono`** 防左右晃动<br>• 防抖提交: 连续点击防抖 300ms 批量上报 | ❌ 数字使用普通比例字体导致 1 变成 2 时按钮左右抖动<br>❌ 达到 min/max 极限边界时未置灰禁用按钮<br>❌ 快速点击时未做 debounce 导致向后端并发风暴 | `<div class="inline-flex items-center rounded-xl bg-slate-900 p-1 border border-white/10"><button class="h-8 w-8 rounded-lg bg-slate-800 text-white font-bold active:scale-90 disabled:opacity-30">-</button><span class="w-9 text-center font-mono text-xs font-bold text-white">1</span><button class="h-8 w-8 rounded-lg bg-indigo-600 text-white font-bold active:scale-90">+</button></div>` |
