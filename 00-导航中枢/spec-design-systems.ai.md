---
id: "spec-design-systems-ai"
title: "AI 规约：顶级大厂设计系统 (Design Systems AI Spec)"
for_agent: true
max_tokens_target: 350
tags:
  - "ai-spec"
  - "design-system"
  - "constraints"
---

# 🤖 大厂设计系统 AI 秒查规约 (Design Systems Spec)

> **AI 检阅指令**：提取设计系统时仅读取本卡片，**严禁**向下读取深度背景长文。

| 系统名称 | 触发意图与场景 | 硬性物理数值 (Metrics) | 绝对避坑红线 (DO NOT) | 核心代码/Token |
| :--- | :--- | :--- | :--- | :--- |
| **Apple HIG** | iOS 原生、高净值工具、极简、SwiftUI、注重触觉 | • 触控靶心: $\ge 44 \times 44\text{pt}$<br>• 安全区底边: `34pt` 避让<br>• 基础圆角: `12~24pt` 平滑 Squircle<br>• 字号: 大标题 34pt / 正文 17pt | ❌ 拦截屏幕左边缘右滑返回手势<br>❌ 按钮贴死物理底边未留 Home 条<br>❌ 混用安卓强落阴影 | `font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text'`<br>`backdrop-filter: blur(20px)` |
| **Google M3** | Android 原生、跨端 Flutter、高个性化、包容性 | • 触控靶心: $\ge 48 \times 48\text{dp}$<br>• FAB 容器: $56 \times 56\text{dp}$<br>• 卡片圆角: `16~28dp` / 按钮 `9999px`<br>• 层级: 表面染色 Tint 代替重阴影 | ❌ 大面积使用深重黑色落阴影<br>❌ 使用低于 48dp 的点击热区<br>❌ 硬编码主色而不支持暗黑自适应 | `rounded-full` (Pill Shape)<br>`bg-surface-tint` (Tonal Elevation)<br>`state-layer: hover 8%, press 12%` |
| **Shopify Polaris** | 电商交易、订单、支付、SaaS商户后台、表单 | • 沉底支付条: `bottom-0 pb-safe z-40`<br>• 步进器按钮: $\ge 40 \times 40\text{px}$<br>• 商品缩略图: `80x80px r-8px`<br>• Toast 停留: 4s (带 Undo 撤销) | ❌ 破坏性删除操作不提供二次确认或撤销<br>❌ 结算金额未突出（主数值字号应 $\ge 18\text{px}$）<br>❌ 表单缺乏即时行内错误提示 | `text-rose-600` (Destructive)<br>`text-emerald-600` (Success)<br>`sticky bottom-0 bg-white/95 border-t` |
| **Ant Design Mobile** | 国内移动端、企业办公、审批流、高信息密度 | • 列表行高: 单行 48px / 双行 68px<br>• 物理细线: 0.5px Hairline<br>• 级联选择器: 3D 滚轮拟物高度 240px<br>• 主题色: `#1677FF` 蚂蚁蓝 | ❌ 在移动端平铺超过 5 层的长表单<br>❌ 采用粗糙的 1px 模糊边框（须 scaleY(0.5)）<br>❌ 破坏性操作与常规项混排无间距 | `border-b-[0.5px] border-slate-200`<br>`active:bg-slate-100`<br>`text-[15px]` (正文字号) |
| **IBM Carbon** | 云计算、工业运维、AI看板、数据可视化 | • 2x 网格: 严格基于 `4/8/16/24/32/48px`<br>• 最小图表点热区: `24x24px`<br>• 暗色看板底色: `#161616` (非纯黑)<br>• WCAG: 强制 AAA 级高对比度 | ❌ 出现任何奇数间距（如 7px, 13px）<br>❌ 移动端单图表堆砌超过 3 条折线<br>❌ 使用低饱和低对比度的装饰性浅灰字 | `bg-[#161616]` (Canvas)<br>`bg-[#262626]` (Card Surface)<br>`font-mono` (KPI 指标数值) |
