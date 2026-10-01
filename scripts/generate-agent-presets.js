const fs = require('fs');
const path = require('path');
const { styles, FAMILIES, ROOT_DIR } = require('./vault-data.js');

// 1. External Brain Query Protocol
const protocolContent = `---
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
1. **检索入口**：首查 [[01 - Style Decision Matrix|多维选型决策矩阵]]，并在 \`01-风格库/\` 下检索 30 篇原子笔记；
2. **遴选结果**：推选 **Top 1 最优解**（并提供 1 个备选供选择）；
3. **输出推荐理由**：引用该风格笔记中的“风格哲学”与“视觉心理学”，向用户阐述为何该风格最能赋能其业务。

### 第三阶段：工程级代码包直出 (Deliver)
直接调取该风格原子笔记中的代码资产，打包输出：
1. **色彩 Token 清单**：主色、强调色、背景色、文字色 Hex 与变量名；
2. **微观几何法则**：圆角（Border Radius）、描边（Border）、阴影（Shadow）及 Active 态位移；
3. **核心实现代码**：给出**原生 CSS** 与 **Tailwind CSS 类名** 双模代码；
4. **一键式 Vibe Coding 提示词**：输出可直接复制粘贴进代码补全器的完整 Prompt 块；
5. **避坑红线 (Anti-Patterns)**：附带 2~3 条绝对不能踩的视觉红线。

---

## 📋 标准化交付样例模版 (Standard Output Template)

\`\`\`markdown
### 🎯 外置大脑风格匹配：#03 Linear / Raycast Dark (极客高精暗黑质感)

> **选型推荐理由**：您的需求是构建一款移动端云原生运维监控看板。Linear Dark 风格采用黑曜石阶梯暗色与 1px 微发丝边缘高光，不仅能极大降低运维人员长时间盯盘的视觉疲劳，更能带来顶级极客工具的专业感与精度信赖。

#### 🎨 核心色彩 Token
- **主色 (Accent)**: \`#8B5CF6\` (激光紫)
- **黑曜石底板 (Obsidian Canvas)**: \`#0B0D0E\`
- **表面卡片 (Surface Gradient)**: \`linear-gradient(180deg, #161922 0%, #101217 100%)\`
- **发丝描边 (Hairline Border)**: \`1px solid rgba(255, 255, 255, 0.08)\`
- **深度阴影 (Elevation Shadow)**: \`0 8px 32px rgba(0, 0, 0, 0.5)\`

#### 🧩 核心组件实现 (Tailwind CSS 双模)
\`\`\`html
<div class="bg-gradient-to-b from-[#161922] to-[#101217] border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] active:scale-[0.99] transition-transform">
  <div class="flex items-center justify-between">
    <span class="text-xs font-mono text-purple-400 font-medium">POD #04-READY</span>
    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
  </div>
  <div class="text-xl font-bold text-white mt-2 font-mono">99.98% UPTIME</div>
</div>
\`\`\`

#### 🤖 一键 Vibe Coding 专属提示词
[在此直接输出该风格的专属 Prompt Block]

#### ⚠️ 避坑红线
- ❌ 绝对禁止使用刺眼纯白大面积背景；
- ❌ 绝对禁止使用粗于 1px 的厚边框或童趣马卡龙色彩；
- ❌ 保持等宽数字与高精度微排版。
\`\`\`
`;

fs.writeFileSync(path.join(ROOT_DIR, '00-导航中枢', '03 - External Brain Query Protocol.md'), protocolContent, 'utf-8');

// 2. .cursorrules-ui-expert.md
const cursorrulesContent = `# .cursorrules - UI & Vibe Coding Expert
# 适用于 Cursor 编辑器的全局或项目级 UI 规则配置

You are an expert Mobile UI Designer and Frontend Architect specialized in "Vibe Coding".
When generating frontend mobile interfaces (React / React Native / Next.js / Vue / Tailwind / CSS), you ALWAYS follow the design principles from the UI Vibe Coding Compass external brain.

## Core Rules
1. Never produce generic, uninspired, default gray layouts.
2. Every screen must have a distinct "Design Stance" rooted in one of the 30 recognized styles (e.g. Neo-Brutalism, Linear Dark, Liquid Glass, Scandinavian, Bento Grid, etc.).
3. Strict Token Consistency:
   - Colors: Always define cohesive palettes (Primary, Secondary, Background, Hairline border).
   - Micro-Geometry: Every style has strict border-radius and border-width rules (e.g., Swiss Typo = 0px; Neo-Brutalism = 3px solid black; VisionOS = rounded-3xl).
   - Shadows & Depth: Use realistic multi-layer shadows or unblurred hard shadows based on the active style.
4. Tactile Interactions: All clickable buttons and cards MUST have visible micro-interaction feedback on active/hover (e.g., active:scale-95 or active:translate-x-[2px] active:translate-y-[2px]).
5. Mobile Ergonomics: Always consider mobile safe areas (safe-area-inset-top, safe-area-inset-bottom) and thumb-reach zones.
`;

fs.writeFileSync(path.join(ROOT_DIR, '04-AI助手预设', '.cursorrules-ui-expert.md'), cursorrulesContent, 'utf-8');

// 3. antigravity-system-prompt.md
const antigravityPromptContent = `# Antigravity & Claude System Prompt Extension (UI Design External Brain)

## 身份定位与核心能力
你搭载了位于当前仓库根目录的 **Vibe Coding UI 设计外置大脑**。
当用户需要进行 UI 设计、页面重构、组件开发或风格选型时，你必须主动调取该外置知识库中的设计规范，并遵循《03 - External Brain Query Protocol》进行标准化三阶交付。

## 检索指引
1. **先诊断**：根据用户的业务场景与目标受众，从 6 大家族（现代极简、玻璃深度、赛博科幻、潮流趣味、人文东方、业务专属）中匹配最适宜的 1~2 套风格；
2. **出 Token**：直接提供可落地的 Hex 色彩、CSS 变量与 Tailwind 类名；
3. **带 Prompt**：每次设计输出均附带高保真 Vibe Coding 提示词，方便用户在下一步生成具体页面。
`;

fs.writeFileSync(path.join(ROOT_DIR, '04-AI助手预设', 'antigravity-system-prompt.md'), antigravityPromptContent, 'utf-8');

// 4. tailwind-config-snippets.md
let twConfigContent = `---
title: "Tailwind Config Snippets"
tags:
  - "tailwind"
  - "tokens"
  - "config"
---

# ⚙️ 30 款风格 Tailwind CSS 全局配置合集 (tailwind.config.js Master)

将以下扩展项复制到您项目的 \`tailwind.config.js\` 的 \`theme.extend\` 中，即可全量解锁 30 套风格的色彩与阴影类：

\`\`\`javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
`;

styles.forEach(s => {
  twConfigContent += `        // #${s.num} ${s.name}\n`;
  s.colors.forEach((c, idx) => {
    const key = `${s.id}-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    twConfigContent += `        '${key}': '${c.hex}',\n`;
  });
});

twConfigContent += `      },
      boxShadow: {
        'neo': '4px 4px 0px 0px #000000',
        'neo-sm': '2px 2px 0px 0px #000000',
        'linear': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'glass': '0 16px 36px rgba(0, 0, 0, 0.2)',
        'neu-flat': '7px 7px 16px #CBD5E1, -7px -7px 16px #FFFFFF',
        'spatial': '0 20px 50px rgba(0, 0, 0, 0.6)',
        'clay': '0 18px 30px -6px rgba(192, 132, 252, 0.28), inset 0 6px 10px rgba(255, 255, 255, 0.9)',
        'cyber-glow': '0 0 15px rgba(255, 0, 127, 0.5), 0 0 30px rgba(0, 240, 255, 0.3)',
      },
      borderRadius: {
        'squircle-lg': '28px',
        'squircle-md': '20px',
      }
    },
  },
  plugins: [],
};
\`\`\`
`;

fs.writeFileSync(path.join(ROOT_DIR, '04-AI助手预设', 'tailwind-config-snippets.md'), twConfigContent, 'utf-8');
console.log('Generated Agent Presets and Protocol successfully.');
