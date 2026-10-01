---
title: "03 - External Brain Query Protocol"
tags:
  - "protocol"
  - "ai-agent"
  - "retrieval"
---

# 🤖 外置大脑检索与交付协议 (External Brain Query Protocol)

> **适用对象**：人类用户、Cursor、Claude Code、Antigravity、Windsurf 等 AI 智能代理。
> **目的**：规范当用户提出 UI 设计需求时，AI 如何检索本知识库，并以何种格式返回。

---

## 🧭 三阶交付协议 (The 3-Step Delivery Protocol)

当用户在对话中表达 UI 设计诉求（如 *“帮我设计一个健康监测 App”* 或 *“@UI-Brain 检索：极简暗黑交易终端”*）时，AI 代理必须严格遵循以下三步协议进行检索与交付：

### 第一阶段：需求诊断与意图对齐 (Diagnose)
1. **识别业务场景**：确定应用类型（如金融、社交、工具、电商、文创）；
2. **提取情绪关键词**：提炼用户期望的心理氛围（如严肃权威、克制极简、潮酷叛逆、治愈温暖）；
3. **确定明暗底色**：判断适合 Dark Native、Light Native 还是双模通吃。

### 第二阶段：知识库检索与风格匹配 (Retrieve)
1. **检索入口**：首查 [[01 - Style Decision Matrix|多维选型决策矩阵]]，并在 `01-风格库/` 下检索 30 篇原子笔记；
2. **规范与避坑秒查 (防上下文污染铁律)**：
   - 提取移动端物理硬参数（44pt靶心、16px防缩放、400ms延迟）与组件蓝图时，**强制且仅读取** [[05 - AI 极简设计规约与避坑秒查手册]] 及下辖的 `spec-*.ai.md` 微规约；
   - **严禁**无目的向下通读 `06-`、`07-`、`08-` 下的数千字人类百科长文，确保单次检索上下文消耗 $\le 350$ Tokens。
3. **遴选结果**：推选 **Top 1 最优解**（并提供 1 个备选供选择）；
4. **输出推荐理由**：引用该风格笔记中的“风格哲学”与“视觉心理学”，向用户阐述为何该风格最能赋能其业务。

### 第三阶段：工程级代码包直出 (Deliver)
直接调取该风格原子笔记中的代码资产，打包输出：
1. **色彩 Token 清单**：主色、强调色、背景色、文字色 Hex 与变量名；
2. **微观几何法则**：圆角（Border Radius）、描边（Border）、阴影（Shadow）及 Active 态位移；
3. **核心实现代码**：给出**原生 CSS** 与 **Tailwind CSS 类名** 双模代码；
4. **一键式 Vibe Coding 提示词**：输出可直接复制粘贴进代码补全器的完整 Prompt 块；
5. **避坑红线 (Anti-Patterns)**：附带 2~3 条绝对不能踩的视觉红线。

---

## 📋 标准化交付样例模版 (Standard Output Template)

```markdown
### 🎯 外置大脑风格匹配：#03 Linear / Raycast Dark (极客高精暗黑质感)

> **选型推荐理由**：您的需求是构建一款移动端云原生运维监控看板。Linear Dark 风格采用黑曜石阶梯暗色与 1px 微发丝边缘高光，不仅能极大降低运维人员长时间盯盘的视觉疲劳，更能带来顶级极客工具的专业感与精度信赖。

#### 🎨 核心色彩 Token
- **主色 (Accent)**: `#8B5CF6` (激光紫)
- **黑曜石底板 (Obsidian Canvas)**: `#0B0D0E`
- **表面卡片 (Surface Gradient)**: `linear-gradient(180deg, #161922 0%, #101217 100%)`
- **发丝描边 (Hairline Border)**: `1px solid rgba(255, 255, 255, 0.08)`
- **深度阴影 (Elevation Shadow)**: `0 8px 32px rgba(0, 0, 0, 0.5)`

#### 🧩 核心组件实现 (Tailwind CSS 双模)
```html
<div class="bg-gradient-to-b from-[#161922] to-[#101217] border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] active:scale-[0.99] transition-transform">
  <div class="flex items-center justify-between">
    <span class="text-xs font-mono text-purple-400 font-medium">POD #04-READY</span>
    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
  </div>
  <div class="text-xl font-bold text-white mt-2 font-mono">99.98% UPTIME</div>
</div>
```

#### 🤖 一键 Vibe Coding 专属提示词
[在此直接输出该风格的专属 Prompt Block]

#### ⚠️ 避坑红线
- ❌ 绝对禁止使用刺眼纯白大面积背景；
- ❌ 绝对禁止使用粗于 1px 的厚边框或童趣马卡龙色彩；
- ❌ 保持等宽数字与高精度微排版。
```
