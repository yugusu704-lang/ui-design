const fs = require('fs');
const path = require('path');
const { styles, FAMILIES, getFamilyForStyle, ROOT_DIR } = require('./vault-data.js');

function cleanFileName(num, name) {
  const cleanName = name
    .replace(/\(.*?\)/g, '')
    .replace(/[\/\\?%*:|"<>]/g, '')
    .trim();
  return `${num}. ${cleanName}`;
}

// 1. Build MOC
let mocContent = `---
title: "UI Vibe Coding Compass (MOC)"
tags:
  - "moc"
  - "index"
  - "vibe-coding"
  - "mobile-ui"
---

# 🧭 30 Mobile UI Styles & Vibe Coding Compass (MOC)

> 本知识库是专为**移动端产品设计与 AI Vibe Coding**打造的**高保真外置大脑与检索知识库**。
> 包含 **30 种专为手机屏幕打造的经典与前沿风格**，每篇笔记均配备**双模设计 Token（原生 CSS + Tailwind）、触觉物理法则、避坑红线及一键式 AI 提示词配方**。

---

## ⚡ 核心枢纽快速导航

- 📊 **多维选型矩阵**：[[01 - Style Decision Matrix|多维度风格决策矩阵 (按行业/情绪/复杂度检索)]]
- 📖 **提示词实战指南**：[[02 - Vibe Prompting Manual|Vibe Coding 提示词工程落地指南]]
- 🤖 **AI 检索调用协议**：[[03 - External Brain Query Protocol|AI 助手知识库调用协议 (面向 Cursor / Claude / Antigravity)]]
- 🌌 **2D 风格宇宙白板**：[[30-Styles-Universe.canvas|打开 30 风格宇宙 2D 可视化白板]]
- 📱 **本地实时模拟器**：[在本地浏览器打开 30 种风格真机仿真展厅 (index.html)](../index.html)

---

## 🏛️ 六大设计风格家族 (Design Families)

`;

FAMILIES.forEach(f => {
  const fStyles = styles.filter(s => {
    const n = parseInt(s.num, 10);
    return n >= f.range[0] && n <= f.range[1];
  });

  mocContent += `### ${f.id} (${f.nameZh})\n`;
  mocContent += `> *${f.desc}*\n\n`;
  mocContent += `| 序号 | 风格名称 | 主色 Token | 最佳应用场景 | 原子笔记链接 |\n`;
  mocContent += `| :---: | :--- | :---: | :--- | :--- |\n`;

  fStyles.forEach(s => {
    const noteName = cleanFileName(s.num, s.name);
    mocContent += `| \`#${s.num}\` | **${s.name}** (${s.nameZh}) | \`${s.colors[0]?.hex || '#000'}\` | ${s.bestFor.slice(0, 24)}... | [[${noteName}\\|查看完整规范]] |\n`;
  });
  mocContent += `\n`;
});

mocContent += `---

## 🔍 Dataview 动态查询视窗 (可选生态插件)

> [!NOTE]
> 如果您的 Obsidian 已安装 **Dataview** 插件，以下代码块将自动呈现动态交互式数据表格；未安装插件时，上方静态表格亦可完全正常查阅。

\`\`\`dataview
TABLE num AS "编号", family_zh AS "设计家族", primary_color AS "主色", best_for AS "推荐场景"
FROM "01-风格库"
SORT num ASC
\`\`\`

---

## 🛠️ 全局资产与组件库
- 🎨 [[Master Color Catalog|30 套风格全景调色板速查]]
- 📐 [[Mobile Typography System|移动端字阶、行高与字偶间距规范]]
- 🌓 [[Shadows & Elevation Tokens|物理阴影、发光与深度层级代码库]]
- 🧩 [[Cards & Bento Surfaces|核心卡片表面质感规范]]
- 🔘 [[Tactile Buttons & Pills|高触觉按钮与胶囊标签]]
- 🧭 [[Navigation & TabBars|移动端沉浸式导航与底部栏]]
`;

fs.writeFileSync(path.join(ROOT_DIR, '00-导航中枢', '00 - UI Vibe Coding Compass (MOC).md'), mocContent, 'utf-8');
console.log('Generated MOC successfully.');

// 2. Build 01 - Style Decision Matrix.md
const matrixContent = `---
title: "01 - Style Decision Matrix"
tags:
  - "matrix"
  - "decision-tree"
  - "selector"
---

# 📊 30 款移动端 UI 风格多维决策矩阵 (Style Decision Matrix)

当您启动一个新项目或面临风格选型困惑时，请根据以下四大维度快速定位最契合的风格卡片：

---

## 维度一：按业务行业与垂类场景 (By Industry)

| 业务行业 | 推荐风格首选 (Top 1) | 推荐备选 (Top 2~3) | 核心选型逻辑 |
| :--- | :--- | :--- | :--- |
| **开发者工具 / AI 终端 / 云原生** | [[03. Linear  Raycast Dark]] | [[26. Bento Grid Modular]], [[15. Holo-HUD Military Matrix]] | 追求黑曜石暗黑、发丝级高光边框与极高信息可读性 |
| **Web3 / 加密资产 / 高频交易** | [[27. Bloomberg Terminal Finance]] | [[11. Cyberpunk Neon]], [[03. Linear  Raycast Dark]] | 零延迟感、等宽数字、高饱和红绿极速辨识 |
| **个人效率 / 极简日记 / 记账** | [[02. Minimalist Scandinavian]] | [[26. Bento Grid Modular]], [[07. Soft Neumorphism 2.0]] | 宽阔留白、无压迫呼吸感，降低长期记录的心智负担 |
| **Z世代潮玩 / 潮流电商 / 社群** | [[01. Neo-Brutalism]] | [[16. Memphis Pop Vibrant]], [[18. Acid Graphic Anti-Design]] | 粗黑描边与波普高撞色，强烈实体感与叛逆张力 |
| **萌宠 / 女性健康 / 治愈习惯** | [[17. Dopamine Pastel Candy]] | [[10. Claymorphism 3D]], [[28. Aurora Fluid Mesh Gradient]] | 马卡龙软糖粉彩、超大圆角与温润治愈微反馈 |
| **现代出版 / 深度长文 / 播客媒体**| [[21. Editorial Magazine]] | [[05. Monochrome High-Fashion]], [[24. Japanese Wabi-Sabi]] | 羊皮纸温润色泽、经典衬线正文字阶与空气感留白 |
| **茶道 / 国风文创 / 禅意养生** | [[23. Neo-Chinese Ink & Zen]] | [[24. Japanese Wabi-Sabi]], [[22. Warm Earthy Botanical]] | 宣纸肌理、水墨五色晕染与大写意留白 |
| **自然护肤 / 手作陶瓷 / 环保出行**| [[22. Warm Earthy Botanical]] | [[14. Solarpunk Eco-Futurism]], [[24. Japanese Wabi-Sabi]] | 燕麦亚麻浅胚、赤陶红与鼠尾草绿，回归自然温度 |
| **游戏伴侣 / ACG社区 / 动漫二次元**| [[19. Comic Ben-Day Dots]] | [[20. Retro 8-Bit Pixel Art]], [[29. Dark Fantasy RPG HUD]] | 本戴波点网屏、漫画手绘墨线与分镜动效冲击 |
| **医疗生物 / 连续体征 / 严肃健康**| [[30. Medical Biotech Clean]] | [[02. Minimalist Scandinavian]], [[26. Bento Grid Modular]] | 无菌冰晶蓝白、高精微遥测心电波形，守护与权威信赖 |

---

## 维度二：按情绪与感官氛围 (By Emotional Vibe)

\`\`\`mermaid
quadrantChart
    title 移动端 UI 风格感官象限分布
    x-axis 极简理性 (Minimal / Rational) --> 热情张扬 (Expressive / Vivid)
    y-axis 复古人文 (Retro / Cultural) --> 未来极客 (Futuristic / Cyber)
    "03 Linear Dark": [0.20, 0.85]
    "11 Cyberpunk": [0.85, 0.90]
    "15 Holo HUD": [0.25, 0.92]
    "06 Liquid Glass": [0.35, 0.75]
    "08 VisionOS": [0.30, 0.82]
    "28 Aurora Fluid": [0.70, 0.70]
    "01 Neo-Brutalism": [0.88, 0.40]
    "16 Memphis Pop": [0.92, 0.35]
    "17 Dopamine Candy": [0.85, 0.30]
    "18 Acid Graphic": [0.95, 0.55]
    "02 Scandinavian": [0.10, 0.35]
    "04 Swiss Typo": [0.15, 0.30]
    "05 Monochrome": [0.18, 0.20]
    "21 Editorial": [0.25, 0.15]
    "23 Ink Zen": [0.30, 0.10]
    "24 Wabi-Sabi": [0.15, 0.08]
    "20 Retro 8-Bit": [0.80, 0.18]
    "26 Bento Grid": [0.30, 0.60]
    "27 Bloomberg": [0.10, 0.70]
    "30 Medical Biotech": [0.20, 0.50]
\`\`\`

---

## 维度三：按明暗底色与暗黑模式适配度 (By Theme Mode)

### 纯暗黑原生风格 (Dark Native)
- [[03. Linear  Raycast Dark]]（黑曜石 #0B0D0E）
- [[11. Cyberpunk Neon]]（碳素深黑 #090A0F）
- [[12. Bioluminescent Dark]]（深海午夜蓝 #030712）
- [[15. Holo-HUD Military Matrix]]（橄榄暗夜 #0C100D）
- [[27. Bloomberg Terminal Finance]]（纯黑 #000000）
- [[29. Dark Fantasy RPG HUD]]（黑曜石石板 #121015）

### 纯明亮原生风格 (Light Native)
- [[02. Minimalist Scandinavian]]（纯雪白 #FFFFFF）
- [[04. Swiss International Typo]]（功能白 #FFFFFF）
- [[05. Monochrome High-Fashion]]（真丝白 #FAF9F6）
- [[17. Dopamine Pastel Candy]]（草莓奶昔 #FFF5F7）
- [[21. Editorial Magazine]]（羊皮纸暖白 #FAF7F2）
- [[22. Warm Earthy Botanical]]（亚麻浅胚 #F5EFEB）
- [[23. Neo-Chinese Ink & Zen]]（宣纸米白 #F7F4EC）
- [[30. Medical Biotech Clean]]（无菌冰晶白 #FFFFFF）

### 混合/双模通吃风格 (Hybrid / Dual Theme)
- [[01. Neo-Brutalism]]（默认亮黄白，但支持暗黑高反差变体）
- [[06. Liquid Glassmorphism]]（多层自适应高斯模糊，光影自适应）
- [[26. Bento Grid Modular]]（Bento 模块流天然支持明暗双轨无缝切换）
`;

fs.writeFileSync(path.join(ROOT_DIR, '00-导航中枢', '01 - Style Decision Matrix.md'), matrixContent, 'utf-8');
console.log('Generated Decision Matrix successfully.');

// 3. Build 02 - Vibe Prompting Manual.md
const promptManualContent = `---
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

\`\`\`markdown
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
\`\`\`

---

## 实战演练示例：开发一个极客 AI 终端

当我们需要为一款 AI 终端开发移动端聊天流时：
1. 打开 [[01 - Style Decision Matrix|选型矩阵]]，定位至 **开发者工具/AI 终端**；
2. 命中风格：[[03. Linear  Raycast Dark]]；
3. 打开对应笔记，复制其 Prompt 块，组装为终极 Prompt：

> *"我们要用 React + Tailwind 构建一个极简 AI 终端的移动端对话气泡流。\n请严格遵循 Linear / Raycast Dark 风格：背景采用黑曜石深黑 (#0B0D0E)，卡片采用暗表面渐变 (#161922 -> #101217)，带有 1px 细微发光边框 (border border-white/10)，阴影为 0 8px 32px rgba(0,0,0,0.5)。\n代码与 Token 使用等宽字体 (JetBrains Mono)，AI 思考中状态使用柔和紫晶微光 (#8B5CF6) 呼吸动画。\n切忌使用刺眼纯白背景或大于 1px 的厚边框，保持极致纯粹的极客质感。"*

---

## 主流开发助手集成指引
- **在 Cursor 中使用**：将 [[.cursorrules-ui-expert|Cursor 专属规则]] 放置于项目根目录，Cursor 将自动在生成代码时遵从本知识库的设计审美；
- **在 Antigravity 中使用**：在 System Prompt 或自定义规则中加载 [[antigravity-system-prompt|Antigravity 系统预设]]；
- **在 Claude Code 中使用**：直接在提问中引用目标风格卡片的相对路径或复制 Prompt 块。
`;

fs.writeFileSync(path.join(ROOT_DIR, '00-导航中枢', '02 - Vibe Prompting Manual.md'), promptManualContent, 'utf-8');
console.log('Generated Prompting Manual successfully.');
