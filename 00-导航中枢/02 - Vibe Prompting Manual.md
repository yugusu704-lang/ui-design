---
title: "02 - Vibe Prompting Manual"
tags:
  - "guide"
  - "prompt-engineering"
  - "vibe-coding"
---

# 📖 Vibe Coding 提示词工程实战手册 (Vibe Prompting Manual)

## 什么是 Vibe Coding？
Vibe Coding 是由 Andrej Karpathy 提出的一种新型人机协作范式：**人类通过高维度的自然语言、审美意图、设计 Token 与交互规则设定“氛围（Vibe）与骨架”，AI 编程助手（Cursor / Claude / Antigravity / Windsurf）负责高效产出底层高精度实现代码。**

在 UI 设计中，最忌讳的是给 AI 笼统模糊的指令（如“做一个好看的个人中心”），这往往导致 AI 输出千篇一律的无聊灰白布局。
**本手册指导您如何从外置大脑中调取风格，精准催化 AI 产出专业大师级界面。**

---

## 黄金三段式 Prompt 结构 (The Golden Prompt Formula)

向 AI 助手下达 UI 开发指令时，请务必组合以下三层信息：

```markdown
【第一层：业务需求与核心动作 (Business Intent)】
我们要用 [技术栈，如 Next.js + Tailwind / React + Vite / Flutter] 实现一个 [具体功能，如极简个人账单总览页]。
页面的核心用户动作是 [主要操作，如一键记账与月份筛选]。

【第二层：从外置大脑抽取的风格配方 (Style Vibe)】
请严格遵循以下 UI 风格规范（调取自外置大脑）：
- 风格基调：[直接复制目标风格卡片的 Vibe Prompt 块]
- 主色彩 Token：[主色、强调色与表面背景色 Hex 代码]
- 微观几何与物理法则：[描边厚度、圆角弧度、阴影参数与 active 点击位移]

【第三层：工程落地与防御性约束 (Engineering Constraints)】
- 布局结构：移动端 100% 响应式，采用现代移动端安全区域 (env(safe-area-inset-bottom))；
- 避坑红线：[直接粘贴目标风格卡片中的 Anti-Patterns 红线]；
- 产出物要求：请直接输出完整的、自包含的组件代码与清晰的交互状态。
```

---

## 实战演练示例：开发一个极客 AI 终端

当我们需要为一款 AI 终端开发移动端聊天流时：
1. 打开 [[01 - Style Decision Matrix|选型矩阵]]，定位至 **开发者工具/AI 终端**；
2. 命中风格：[[03. Linear  Raycast Dark]]；
3. 打开对应笔记，复制其 Prompt 块，组装为终极 Prompt：

> *"我们要用 React + Tailwind 构建一个极简 AI 终端的移动端对话气泡流。
请严格遵循 Linear / Raycast Dark 风格：背景采用黑曜石深黑 (#0B0D0E)，卡片采用暗表面渐变 (#161922 -> #101217)，带有 1px 细微发光边框 (border border-white/10)，阴影为 0 8px 32px rgba(0,0,0,0.5)。
代码与 Token 使用等宽字体 (JetBrains Mono)，AI 思考中状态使用柔和紫晶微光 (#8B5CF6) 呼吸动画。
切忌使用刺眼纯白背景或大于 1px 的厚边框，保持极致纯粹的极客质感。"*

---

## 主流开发助手集成指引
- **在 Cursor 中使用**：将 [[.cursorrules-ui-expert|Cursor 专属规则]] 放置于项目根目录，Cursor 将自动在生成代码时遵从本知识库的设计审美；
- **在 Antigravity 中使用**：在 System Prompt 或自定义规则中加载 [[antigravity-system-prompt|Antigravity 系统预设]]；
- **在 Claude Code 中使用**：直接在提问中引用目标风格卡片的相对路径或复制 Prompt 块。
