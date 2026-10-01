---
id: "spec-laws-ux-ai"
title: "AI 规约：设计心理学与体验法则 (Laws of UX AI Spec)"
for_agent: true
max_tokens_target: 350
tags:
  - "ai-spec"
  - "laws-of-ux"
  - "psychology"
  - "constraints"
---

# 🤖 设计心理学与体验法则 AI 秒查规约 (Laws of UX Spec)

> **AI 检阅指令**：进行界面逻辑走查与布局决策时仅读取本卡片，**严禁**向下读取实验史实长文。

| 法则名称 | 约束领域 | 硬性工程数值 (Metrics) | 核心设计规约与反模式 (DO & DO NOT) | 一键即用 CSS / Tailwind |
| :--- | :--- | :--- | :--- | :--- |
| **菲茨定律 (Fitts)** | 触控靶心与拇指区 | • 视觉热区扩展: $\ge 44\text{pt} / 48\text{dp}$<br>• 相对间距: 相邻危险键 $\ge 12\text{px}$<br>• 核心操作区: 屏幕下半段 40% | ✅ 核心 CTA 沉底屏幕边缘（边缘具备无限大击中面）<br>❌ 严禁将高频主按钮放置在左上角或右上角<br>❌ 严禁视觉仅 16px 图标不加 padding 扩展命中区 | `relative p-3` (扩展命中)<br>`after:absolute after:inset-[-10px]`<br>`sticky bottom-4 mx-4` |
| **席克定律 (Hick)** | 决策减法与选项数 | • 底部导航项: 严格限制 $3 \sim 5$ 个<br>• 表单单屏字段: $\le 3 \sim 4$ 个<br>• 预选推荐: 必须高亮 1 个默认态 | ✅ 复杂表单使用分步向导 (Multi-step Wizard)<br>❌ 严禁在一屏内平铺超过 5 个同等权重的主按钮<br>❌ 严禁让用户在无默认推荐时面对 10+ 复杂套餐 | `ring-2 ring-primary bg-primary/5` (默认高亮推荐)<br>`hidden md:block` (折叠低频选项) |
| **米勒定律 (Miller)** | 信息组块与短期记忆 | • 手机号: 3-4-4 分段 (`138 0000 0000`)<br>• 银行卡: 4-4-4-4 分段<br>• 单页认知块: $7 \pm 2$ 个卡片组块 | ✅ 采用 Bento Grid (便当盒) 封装关联数据<br>❌ 严禁长达 11 位或 16 位的连贯纯数字无断点展示<br>❌ 严禁长设置页面无分组、无间隙通栏平铺 | `tracking-wider font-mono` (分段易读)<br>`space-y-4` (卡片分组隔离 `16px`) |
| **雅各布定律 (Jakob)** | 心智模型与手势一致 | • 图标映射: 搜索=放大镜 / 设置=齿轮 / 返回=向左箭头<br>• 返回手势: 左边缘向右滑（无冲突） | ✅ 尊重十亿用户成熟心智，把创新留给业务核心<br>❌ 严禁将下拉手势改成呼出菜单（必须是下拉刷新）<br>❌ 严禁改变常见功能图标的基础语义（反人类创新） | `cursor-pointer select-none`<br>`touch-pan-y` (防止横滑手势冲突) |
| **多尔蒂门槛 (Doherty)** | 响应时间与加载心理 | • 触控微反馈: $\le 100\text{ms}$ (`scale-95`)<br>• 容忍极限: $400\text{ms}$ (超时必须骨架屏)<br>• 防抖防重: 点击后 `disable 500ms` | ✅ 采用乐观更新 (Optimistic UI) 立即上屏聊天与点赞<br>❌ 严禁使用阻断式全屏大菊花转圈代替骨架屏<br>❌ 严禁接口网络慢时无任何点击按下视觉反馈 | `active:scale-[0.96] transition-transform duration-100`<br>`animate-pulse bg-slate-800` (骨架屏) |
