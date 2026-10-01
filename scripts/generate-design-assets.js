const fs = require('fs');
const path = require('path');
const { styles, FAMILIES, ROOT_DIR } = require('./vault-data.js');

// 1. Master Color Catalog
let colorCatalog = `---
title: "Master Color Catalog"
tags:
  - "tokens"
  - "colors"
  - "palette"
---

# 🎨 30 套移动端 UI 风格全景色彩索引表 (Master Color Catalog)

本表汇总了 Vault 中全部 30 套风格的标志性核心色彩 Token，供在开发跨风格混搭或创建全局调色板时快速检索与复制：

| 风格编号 | 风格名称 | 主色 (Primary) | 辅色 1 (Accent 1) | 辅色 2 (Accent 2) | 背景底色 (Surface) |
| :---: | :--- | :--- | :--- | :--- | :--- |
`;

styles.forEach(s => {
  const c0 = s.colors[0] ? `\`${s.colors[0].hex}\` (${s.colors[0].name})` : '-';
  const c1 = s.colors[1] ? `\`${s.colors[1].hex}\` (${s.colors[1].name})` : '-';
  const c2 = s.colors[2] ? `\`${s.colors[2].hex}\` (${s.colors[2].name})` : '-';
  const bg = s.phoneTheme?.bg ? `\`${s.phoneTheme.bg}\`` : '-';
  colorCatalog += `| \`#${s.num}\` | **${s.name}** | ${c0} | ${c1} | ${c2} | ${bg} |\n`;
});

fs.writeFileSync(path.join(ROOT_DIR, '02-设计资产', 'Master Color Catalog.md'), colorCatalog, 'utf-8');

// 2. Mobile Typography System
const typoContent = `---
title: "Mobile Typography System"
tags:
  - "tokens"
  - "typography"
  - "fonts"
---

# 📐 移动端字阶、行高与字偶间距体系 (Mobile Typography System)

移动端屏幕在 375px ~ 430px 的狭窄物理空间中，优秀的排版节奏（Typography Rhythm）是避免页面杂乱的关键。

## 1. 推荐字阶比例系统 (Type Scale: Major Second 1.125 / Minor Third 1.2)

| 级别 (Level) | 字号 (Font Size) | 行高 (Line Height) | 字重 (Font Weight) | 字偶间距 (Tracking) | 典型应用 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | \`32px ~ 36px\` | \`1.15\` | 800/900 | \`-0.03em\` | 瑞士主义大标题、孟菲斯重点强调、大字报数字 |
| **H1 (Large Title)** | \`24px ~ 28px\` | \`1.25\` | 700/800 | \`-0.02em\` | 主页面主标题、Hero 卡片标题 |
| **H2 (Section Title)** | \`18px ~ 20px\` | \`1.35\` | 600/700 | \`-0.01em\` | 模块栏目名、Bento 分组标题 |
| **Body (正文)** | \`14px ~ 15px\` | \`1.55 ~ 1.6\` | 400/500 | \`0em\` | 普通长段落、列表描述文字 |
| **Caption (副文)** | \`12px ~ 13px\` | \`1.4\` | 400/500 | \`+0.01em\` | 辅助时间戳、次级说明文字 |
| **Micro (极小标签)** | \`10px ~ 11px\` | \`1.2\` | 700/800 | \`+0.04em\` | 胶囊 Badge、状态指示器、代码元数据 |

---

## 2. 风格与字体家族矩阵 (Font Stack Mapping)
- **现代极客 / 科技无衬线**：\`'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif\`
  - 代表风格：[[02. Minimalist Scandinavian]], [[03. Linear  Raycast Dark]], [[26. Bento Grid Modular]]
- **高奢 / 社论衬线**：\`'Playfair Display', 'Cinzel', 'Noto Serif SC', serif\`
  - 代表风格：[[05. Monochrome High-Fashion]], [[21. Editorial Magazine]], [[23. Neo-Chinese Ink & Zen]]
- **终端等宽代码**：\`'JetBrains Mono', 'Fira Code', monospace\`
  - 代表风格：[[15. Holo-HUD Military Matrix]], [[27. Bloomberg Terminal Finance]]
- **复古点阵像素**：\`'Press Start 2P', 'Silkscreen', monospace\`
  - 代表风格：[[20. Retro 8-Bit Pixel Art]]
`;

fs.writeFileSync(path.join(ROOT_DIR, '02-设计资产', 'Mobile Typography System.md'), typoContent, 'utf-8');

// 3. Shadows & Elevation Tokens
const shadowContent = `---
title: "Shadows & Elevation Tokens"
tags:
  - "tokens"
  - "shadows"
  - "elevation"
---

# 🌓 物理阴影、发光与深度层级代码库 (Shadows & Elevation Tokens)

阴影是移动端界面传达 **Z 轴空间深度与触觉感知** 的核心物理语言。

## 1. 核心阴影类别

### A. 零模糊硬投影 (Neo-Brutalism / Pop Art)
\`\`\`css
/* 纯黑实体冲击，零高斯羽化 */
--shadow-hard-md: 4px 4px 0px #000000;
--shadow-hard-sm: 2px 2px 0px #000000;
--shadow-hard-lg: 6px 6px 0px #000000;
\`\`\`

### B. 多重微漫反射 (Linear Dark / Clean Scandinavian)
\`\`\`css
/* 黑曜石高精暗黑阴影 */
--shadow-linear-deep: 0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
/* 北欧极简如呼吸般的极轻微柔阴影 */
--shadow-nordic-whisper: 0 4px 20px -4px rgba(0, 0, 0, 0.04);
\`\`\`

### C. 拟物双向对冲柔光 (Soft Neumorphism 2.0)
\`\`\`css
/* 一侧高光反射、一侧阴暗吸收 */
--shadow-neu-surface: 7px 7px 16px #CBD5E1, -7px -7px 16px #FFFFFF;
--shadow-neu-inset: inset 4px 4px 8px #CBD5E1, inset -4px -4px 8px #FFFFFF;
\`\`\`

### D. 彩色膨胀弥散 (Claymorphism & Dopamine Candy)
\`\`\`css
/* 同色系彩色扩散投影 + 顶底双内高光 */
--shadow-clay-pink: 0 18px 30px -6px rgba(244, 114, 182, 0.35), inset 0 6px 10px rgba(255, 255, 255, 0.9), inset 0 -4px 6px rgba(0,0,0,0.05);
\`\`\`
`;

fs.writeFileSync(path.join(ROOT_DIR, '02-设计资产', 'Shadows & Elevation Tokens.md'), shadowContent, 'utf-8');

// 4. Component Blueprints: Cards & Bento Surfaces
const cardsContent = `---
title: "Cards & Bento Surfaces"
tags:
  - "components"
  - "cards"
  - "bento"
---

# 🧩 移动端卡片与表面质感蓝图 (Cards & Bento Surfaces)

卡片是移动端最基础的信息承载单元。以下整理了 4 类最常用的卡片结构实现：

## 1. Apple-Style Bento Grid 模块卡片
\`\`\`html
<!-- Tailwind 实现 -->
<div class="bg-zinc-900/90 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/20 transition-colors">
  <div class="flex items-center justify-between text-zinc-400 text-xs">
    <span>STATS</span>
    <span class="text-emerald-400 font-mono">+12.4%</span>
  </div>
  <div class="my-3 text-2xl font-bold text-white tracking-tight">1,842 kWh</div>
  <div class="text-xs text-zinc-500">Live grid telemetry feed</div>
</div>
\`\`\`

## 2. Liquid Frosted Glass 毛玻璃悬浮卡片
\`\`\`html
<div class="backdrop-blur-xl bg-white/15 border border-white/30 rounded-3xl p-5 shadow-2xl text-white">
  <div class="text-sm font-medium opacity-80">Ambient Soundscape</div>
  <div class="text-lg font-bold mt-1">Deep Rain Focus</div>
</div>
\`\`\`

## 3. Neo-Brutalism 硬朗描边卡片
\`\`\`html
<div class="bg-white border-[3px] border-black rounded-xl p-4 shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all">
  <span class="bg-yellow-400 border-2 border-black text-black text-xs font-black px-2 py-0.5 rounded">NEW DROP</span>
  <h4 class="font-black text-xl mt-2">Cyber Sneaker #09</h4>
</div>
\`\`\`
`;

fs.writeFileSync(path.join(ROOT_DIR, '03-组件蓝图', 'Cards & Bento Surfaces.md'), cardsContent, 'utf-8');

// 5. Component Blueprints: Tactile Buttons & Pills
const buttonsContent = `---
title: "Tactile Buttons & Pills"
tags:
  - "components"
  - "buttons"
  - "pills"
---

# 🔘 高触觉按钮与胶囊标签蓝图 (Tactile Buttons & Pills)

## 1. 物理触觉按压按钮 (Neo-Tactile Press)
\`\`\`css
.btn-neo-tactile {
  background: #FF5E7E;
  color: #FFFFFF;
  font-weight: 800;
  border: 2.5px solid #000000;
  border-radius: 12px;
  box-shadow: 3px 3px 0px #000000;
  padding: 10px 20px;
  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}
.btn-neo-tactile:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px #000000;
}
\`\`\`

## 2. 极客发光微胶囊 (Linear Glow Pill)
\`\`\`html
<button class="bg-white/5 border border-white/15 text-white text-xs font-mono px-3 py-1.5 rounded-full hover:bg-white/10 hover:border-purple-500/50 transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
  <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
  Deploying to Production
</button>
\`\`\`
`;

fs.writeFileSync(path.join(ROOT_DIR, '03-组件蓝图', 'Tactile Buttons & Pills.md'), buttonsContent, 'utf-8');

// 6. Component Blueprints: Navigation & TabBars
const navContent = `---
title: "Navigation & TabBars"
tags:
  - "components"
  - "navigation"
  - "tabbars"
---

# 🧭 移动端沉浸式导航与底部栏蓝图 (Navigation & TabBars)

## 1. 悬浮磨砂底部导航栏 (Floating Ambient TabBar)
\`\`\`html
<nav class="fixed bottom-6 inset-x-4 max-w-sm mx-auto backdrop-blur-2xl bg-zinc-900/80 border border-white/10 rounded-full px-4 py-2.5 flex items-center justify-around shadow-2xl z-50">
  <a href="#" class="text-white font-medium text-xs flex flex-col items-center">
    <span class="text-lg">✦</span>
    <span>Explore</span>
  </a>
  <a href="#" class="text-zinc-500 hover:text-zinc-300 font-medium text-xs flex flex-col items-center">
    <span class="text-lg">📁</span>
    <span>Vault</span>
  </a>
  <a href="#" class="text-zinc-500 hover:text-zinc-300 font-medium text-xs flex flex-col items-center">
    <span class="text-lg">⚙️</span>
    <span>Settings</span>
  </a>
</nav>
\`\`\`
`;

fs.writeFileSync(path.join(ROOT_DIR, '03-组件蓝图', 'Navigation & TabBars.md'), navContent, 'utf-8');

console.log('Generated Design Assets & Component Blueprints successfully.');
