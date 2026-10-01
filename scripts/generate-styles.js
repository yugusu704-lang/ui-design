const fs = require('fs');
const path = require('path');
const { styles, FAMILIES, getFamilyForStyle, ROOT_DIR } = require('./vault-data.js');

// Mapping style related connections
const RELATED_MAP = {
  "01": ["26. Bento Grid Modular", "16. Memphis Pop Vibrant", "18. Acid Graphic Anti-Design"],
  "02": ["03. Linear Raycast Dark", "24. Japanese Wabi-Sabi", "26. Bento Grid Modular"],
  "03": ["02. Minimalist Scandinavian", "26. Bento Grid Modular", "11. Cyberpunk Neon"],
  "04": ["01. Neo-Brutalism", "25. Retro Bauhaus Geometry", "21. Editorial Magazine"],
  "05": ["21. Editorial Magazine", "04. Swiss International Typo", "02. Minimalist Scandinavian"],
  "06": ["08. Spatial VisionOS UI", "28. Aurora Fluid Mesh Gradient", "07. Soft Neumorphism 2.0"],
  "07": ["06. Liquid Glassmorphism", "10. Claymorphism 3D", "02. Minimalist Scandinavian"],
  "08": ["06. Liquid Glassmorphism", "28. Aurora Fluid Mesh Gradient", "03. Linear Raycast Dark"],
  "09": ["27. Bloomberg Terminal Finance", "15. Holo-HUD Military Matrix", "03. Linear Raycast Dark"],
  "10": ["17. Dopamine Pastel Candy", "07. Soft Neumorphism 2.0", "16. Memphis Pop Vibrant"],
  "11": ["12. Bioluminescent Dark", "13. Y2K Futuristic Digital", "27. Bloomberg Terminal Finance"],
  "12": ["28. Aurora Fluid Mesh Gradient", "11. Cyberpunk Neon", "08. Spatial VisionOS UI"],
  "13": ["18. Acid Graphic Anti-Design", "11. Cyberpunk Neon", "16. Memphis Pop Vibrant"],
  "14": ["22. Warm Earthy Botanical", "28. Aurora Fluid Mesh Gradient", "06. Liquid Glassmorphism"],
  "15": ["27. Bloomberg Terminal Finance", "09. Modern Skeuomorphism Craft", "11. Cyberpunk Neon"],
  "16": ["01. Neo-Brutalism", "17. Dopamine Pastel Candy", "25. Retro Bauhaus Geometry"],
  "17": ["10. Claymorphism 3D", "16. Memphis Pop Vibrant", "28. Aurora Fluid Mesh Gradient"],
  "18": ["01. Neo-Brutalism", "13. Y2K Futuristic Digital", "19. Comic Ben-Day Dots"],
  "19": ["20. Retro 8-Bit Pixel Art", "01. Neo-Brutalism", "16. Memphis Pop Vibrant"],
  "20": ["19. Comic Ben-Day Dots", "15. Holo-HUD Military Matrix", "27. Bloomberg Terminal Finance"],
  "21": ["05. Monochrome High-Fashion", "23. Neo-Chinese Ink & Zen", "24. Japanese Wabi-Sabi"],
  "22": ["24. Japanese Wabi-Sabi", "14. Solarpunk Eco-Futurism", "23. Neo-Chinese Ink & Zen"],
  "23": ["24. Japanese Wabi-Sabi", "21. Editorial Magazine", "22. Warm Earthy Botanical"],
  "24": ["23. Neo-Chinese Ink & Zen", "22. Warm Earthy Botanical", "02. Minimalist Scandinavian"],
  "25": ["04. Swiss International Typo", "01. Neo-Brutalism", "16. Memphis Pop Vibrant"],
  "26": ["03. Linear Raycast Dark", "02. Minimalist Scandinavian", "06. Liquid Glassmorphism"],
  "27": ["09. Modern Skeuomorphism Craft", "15. Holo-HUD Military Matrix", "03. Linear Raycast Dark"],
  "28": ["06. Liquid Glassmorphism", "12. Bioluminescent Dark", "17. Dopamine Pastel Candy"],
  "29": ["09. Modern Skeuomorphism Craft", "11. Cyberpunk Neon", "21. Editorial Magazine"],
  "30": ["02. Minimalist Scandinavian", "26. Bento Grid Modular", "06. Liquid Glassmorphism"]
};

// Anti-patterns map
const ANTI_PATTERNS = {
  "01": ["切忌滥用弥散柔光或毛玻璃阴影，必须使用纯黑（#000000）零模糊硬阴影", "避免过于细小精巧的衬线字体，字阶必须粗犷有张力", "禁止使用淡灰或低对比描边，描边必须在 2.5px ~ 3px 纯黑"],
  "02": ["绝对禁止使用大于 1px 的粗黑描边，应使用 rgba(0,0,0,0.06) 极致发丝线", "禁止高饱和度撞色，色彩必须克制在中性灰阶与低饱和单一点缀", "切忌信息过于拥挤，必须留出至少 30% 以上的开阔白空间"],
  "03": ["避免纯粹的刺眼纯白大面积背景，表面应由 #0B0D0E 向 #161922 微妙阶梯过渡", "禁止生硬的高透明度大阴影，需依赖 1px 高光边框（rgba(255,255,255,0.08)）来刻画轮廓", "避免使用童趣可爱的马卡龙色作为指示器"],
  "04": ["禁止使用任何圆角（border-radius 必须为 0px）", "切忌花哨复杂的渐变底色，严格坚守黑、白、瑞士红（#FF3B30）三色", "绝对禁止元素脱离网格基线乱序排布"],
  "05": ["严禁使用无衬线体作为主要标题，必须使用 Bodoni 或 Playfair 等高对比衬线", "禁止使用平民化的波普高饱和色，仅允许极克制的香槟金（#D4AF37）微点缀", "切忌小边距和卡片拥挤堆砌，必须保持奢侈品级别的开阔空气感"],
  "06": ["在没有足够动态环境光或彩色背景的页面上强行使用会变成灰蒙蒙的脏色", "backdrop-filter blur 必须搭配 saturate(180%~190%)，否则玻璃质感会显浑浊", "禁止在多层玻璃嵌套中重复叠加高开销模糊滤镜导致移动端掉帧"],
  "07": ["背景底色与组件表面颜色必须完全一致（通常为 #E8ECEF），切忌把凸起做成白色把背景做成深色", "禁止在复杂高密度表格或长列表使用新拟态，容易引发视疲劳且无层级区分", "双向光影必须一侧明（#FFFFFF）、一侧暗（#CBD5E1），禁止双暗或双亮"],
  "08": ["窗口与卡片圆角必须采用超大超椭圆（Squircle 24px~32px），小圆角会丧失 VisionOS 悬浮感", "切忌使用全实色死黑背景，需半透烟熏深色玻璃 + 视线注视流光边缘", "层级之间必须有明确的 Z 轴阴影距离差（Z-depth）"],
  "09": ["切忌廉价塑料质感的纯色渐变，必须有细腻的拉丝金属或机械滚花微纹理", "状态指示灯必须有微发光晕（amber glow），不可画成普通扁平圆点", "物理开关和旋钮必须提供明确的机械阻尼触觉与阴影位移反馈"],
  "10": ["切忌使用死黑阴影，阴影必须带有主体色的同色系彩色弥散（如粉色卡片搭配浅紫阴影）", "内阴影（inset shadow）不可过硬，必须呈现蓬松柔软的膨胀感", "不适宜在金融、政企等强严肃合规场景中使用"],
  "11": ["严禁大面积纯亮色背景，必须以黑曜石/碳纤维底板为底衬托霓虹辉光", "双色调（洋红 + 电青）必须有主次比例，切忌 1:1 均分导致视觉混乱", "文字 glow 发光半径不宜过大，否则会导致小字无法阅读"],
  "12": ["禁止使用刺目冷硬的日光白色，光晕应模拟深海浮游生物的渐进呼吸韵律", "背景必须是极深的深海午夜蓝（#030712 / #071322），而非绝对纯黑", "发光数据曲线需搭配半透明渐变填充区域以体现通透感"],
  "13": ["不要只用粉蓝色却丢失了金属电镀全息渐变质感，否则容易退化为普通多巴胺", "星芒符号（✦, ✧）要作为点睛图标，不可在正文大段滥用遮挡阅读", "胶囊按钮需有千禧数码时代的亮面高光反射（glossy shine）"],
  "14": ["禁止出现冷硬刺眼的机械赛博紫/赛博蓝，所有色彩必须来源于森林、太阳与泥土", "有机圆角与叶脉曲线需保持优雅，避免过于杂乱的不规则异形裁切", "数据图表应采用自然能量流或环形日光环，而非冷冰冰的折线"],
  "15": ["字体必须选用等宽字体（JetBrains Mono / Share Tech Mono），非等宽会严重破坏战术仪表感", "避免大面积柔和毛玻璃，应当采用硬质斜角切角多边形与战术准星十字刻度", "夜视绿与战术橙为核心指示色，切忌掺入童趣糖果色"],
  "16": ["切忌图形元素过于整齐对称，孟菲斯的核心在于破格与随机散落的波浪与圆点", "文字可读性必须排在第一位，花哨背景不能直接盖在重要文字下方", "卡片倾斜角度控制在 -1.5deg ~ 2deg 之间，过大角度会导致用户阅读困难"],
  "17": ["避免使用高饱和刺目纯色，必须使用加了牛奶的马卡龙粉彩（Pastel）", "阴影不能用灰黑色，必须用柔粉色或淡紫色的扩散彩色光晕", "卡片圆角要极度圆润（rounded-3xl），不可出现尖锐直角"],
  "18": ["虽然打破网格，但核心操作按钮（如购买/下一步）必须清晰醒目可点击", "液态熔融金属与毒性荧光绿（#BFFF00）对比强烈，长时间阅读内容需提供暗色承载卡片", "贴纸倾斜与条形码元素要作为层级修饰，避免遮盖核心标题"],
  "19": ["本戴波点（Ben-Day dots）不宜过密，过密会形成摩尔纹引起视觉眩晕", "气泡对话框尾巴方向需明确指向信息发起方或操作点", "漫画拟声词徽章（POW / BOOM）仅用于关键行动或新功能提示，不可满屏乱放"],
  "20": ["严禁使用抗锯齿圆角平滑字体，必须全程搭配 8-bit 等宽点阵像素字体", "调色板严格限制在经典街机 16 色之内，不可使用现代平滑千级渐变", "血量槽与进度条必须呈现明显的阶梯式方块推进感"],
  "21": ["正文行高必须宽裕（推荐 1.7 ~ 1.8），不可紧缩排版", "背景切忌使用冷白，必须使用带有微米黄/羊皮纸质感的暖调底（#FAF7F2）", "首字下沉（Drop Cap）只应用于文章或卡片首段首字，不可段段下沉"],
  "22": ["严禁使用高饱和度化学合成荧光色，必须保持陶土红、鼠尾草绿与亚麻胚色", "避免冷酷的锐利金属描边，所有边框与分割线均应温润柔和", "质感以手作温润为核心，切忌科技感的发光辉光动效"],
  "23": ["留白（Negative Space）必须占到画面的 40% 以上，切忌满屏堆满卡片", "水墨晕染应当作为背景氛围或状态过渡，不可影响前景正文字体的阅读对比度", "朱砂红印章元素仅作为画龙点睛的权威认证或状态戳，不可大面积涂抹"],
  "24": ["追求不完美与质朴，切忌极度规整对称的机械式九宫格", "色彩饱和度极低，禁止任何跳脱的艳丽色彩破坏静谧氛围", "不要使用花哨浮夸的弹跳进入动画，动效需如落叶般舒缓轻柔"],
  "25": ["严格坚守红、黄、蓝三原色 + 黑白的色彩拓扑，禁止私自引入紫色或粉色", "几何图形必须是纯粹的圆、正方、正三角，不搞复杂多边形", "版面具有强烈的结构构造张力，必须体现形式追随功能的纯粹理性"],
  "26": ["Bento 卡片内必须是自成一体的微组件，切忌卡片内只放一段枯燥纯文本", "跨栏比例需协调（1x1, 2x1, 2x2），禁止无规律的碎片化网格排列", "每张卡片内的 padding 和圆角必须全站高度统一（统一 rounded-2xl 或 rounded-3xl）"],
  "27": ["必须全部使用等宽制表数字（font-variant-numeric: tabular-nums），防止数据跳动时引起抖动", "涨绿跌红（或按地区设置涨红跌绿）必须极其纯粹醒目，零装饰性杂色干扰", "信息密度极高，禁止为了留白而刻意拉大无意义的卡片间距"],
  "28": ["极光弥散光斑的 CSS filter blur 必须在 40px ~ 80px 之间，光斑太小会呈现生硬色块", "悬浮卡片需使用白色磨砂玻璃承接正文，不可直接将白字置于彩色极光流体之上导致失读", "渐变色彩过渡要柔和，避免对比色直接碰撞产生脏灰相交带"],
  "29": ["金属古铜滚边需带有明暗高光，不可画成单色土黄色描边", "血球与魔法水晶槽必须有深度液体高光反光，突出力量感", "界面音效与触觉反馈应模拟沉重石板与金属碰撞，避免轻飘飘的反馈"],
  "30": ["背景必须是纯洁无菌的医疗白（#FFFFFF）与极浅冰晶蓝（#EBF5FB），禁止脏灰色调", "心电与生命体征数据需平滑抗锯齿，禁止出现锯齿状伪劣图表", "警戒色（Alert Amber/Red）必须精准定义阈值，不可泛滥提示导致狼来了效应"]
};

// Clean name for filenames
function cleanFileName(num, name) {
  const cleanName = name
    .replace(/\(.*?\)/g, '')
    .replace(/[\/\\?%*:|"<>]/g, '')
    .trim();
  return `${num}. ${cleanName}.md`;
}

// Generate each style note
styles.forEach(s => {
  const family = getFamilyForStyle(s.num);
  const fileName = cleanFileName(s.num, s.name);
  const targetPath = path.join(ROOT_DIR, '01-风格库', family.id, fileName);

  const bestForList = s.bestFor.split(/[、,，]/).map(x => x.trim().replace(/。/g, '')).filter(Boolean);
  const relatedList = RELATED_MAP[s.num] || [];
  const antiPatternList = ANTI_PATTERNS[s.num] || [
    "避免破坏该风格的核心对比度规则",
    "不要与其他反差过大的风格生硬拼凑",
    "保持设计 Token 命名的全站一致性"
  ];

  // Tailwind classes derivation
  const tailwindClasses = {
    card: s.cssSnippet.includes('border-radius: 28px') ? 'rounded-[28px]' :
          s.cssSnippet.includes('border-radius: 0px') ? 'rounded-none' :
          s.cssSnippet.includes('border-radius: 24px') ? 'rounded-3xl' :
          s.cssSnippet.includes('border-radius: 20px') ? 'rounded-2xl' :
          s.cssSnippet.includes('border-radius: 14px') ? 'rounded-xl' : 'rounded-2xl',
    border: s.cssSnippet.includes('3px solid #000') ? 'border-[3px] border-black' :
            s.cssSnippet.includes('1px solid rgba(255,255,255') ? 'border border-white/10' :
            s.cssSnippet.includes('border: 1px solid rgba(0, 0, 0') ? 'border border-black/5' : 'border border-current/10',
    shadow: s.cssSnippet.includes('4px 4px 0') ? 'shadow-[4px_4px_0px_#000]' :
            s.cssSnippet.includes('blur(') ? 'backdrop-blur-xl shadow-2xl' : 'shadow-md'
  };

  const content = `---
id: "${s.id}"
num: "${s.num}"
title: "${s.name} (${s.nameZh})"
name_en: "${s.name}"
name_zh: "${s.nameZh}"
family: "${family.nameEn}"
family_zh: "${family.nameZh}"
family_folder: "${family.id}"
tags:
  - "style/${s.id}"
  - "family/${family.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-')}"
  - "category/${s.category}"
  - "theme/${s.phoneTheme?.bg === '#000000' || s.phoneTheme?.bg?.includes('#0') || s.phoneTheme?.bg?.includes('#1') ? 'dark' : 'light'}"
best_for:
${bestForList.map(b => `  - "${b}"`).join('\n')}
primary_color: "${s.colors[0]?.hex || '#000000'}"
accent_colors:
${s.colors.map(c => `  - name: "${c.name}"\n    hex: "${c.hex}"`).join('\n')}
bg_color: "${s.phoneTheme?.bg || '#FFFFFF'}"
text_color: "${s.phoneTheme?.text || '#000000'}"
font_family: "${s.phoneTheme?.fontFamily || 'Inter, sans-serif'}"
physics:
  border: "${s.cssSnippet.match(/border[^;]+;/)?.[0] || '1px solid currentColor;'}"
  shadow: "${s.cssSnippet.match(/box-shadow[^;]+;/)?.[0] || 'none;'}"
related_styles:
${relatedList.map(r => `  - "[[${r}]]"`).join('\n')}
---

# #${s.num} ${s.name} (${s.nameZh})

> **核心调性**：${s.subtitle}
> **最佳场景**：${s.bestFor}
> **设计家族**：[[00 - UI Vibe Coding Compass (MOC)#${family.id}|${family.nameZh} (${family.nameEn})]]

---

## 🌟 风格哲学与视觉心理 (Philosophy)

${s.philosophy}

在移动端屏幕尺寸受限的物理空间内，该风格通过独特的边缘处理、明度反差与材质深度，快速建立产品的第一视觉识别力，并在潜意识中向用户传达专属的情绪基调。

---

## 🎨 核心色彩与 Design Tokens

### 色彩全景表
| 色彩名称 (Token) | Hex 色值 | 视觉角色 | 典型应用 |
| :--- | :--- | :--- | :--- |
${s.colors.map((c, i) => `| **${c.name}** | \`${c.hex}\` | ${i === 0 ? '主色 (Primary)' : i === 1 ? '强调色 (Accent)' : i === 2 ? '背景/表面 (Surface)' : '辅助/边框 (Subtle)'} | 卡片高亮、关键按钮、指示灯 |`).join('\n')}

### CSS 变量定义 (可直接写入 :root)
\`\`\`css
:root {
  --style-${s.id}-primary: ${s.colors[0]?.hex || '#000000'};
${s.colors.slice(1).map((c, idx) => `  --style-${s.id}-accent-${idx+1}: ${c.hex};`).join('\n')}
  --style-${s.id}-bg: ${s.phoneTheme?.bg || '#FFFFFF'};
  --style-${s.id}-text: ${s.phoneTheme?.text || '#000000'};
  --style-${s.id}-font: ${s.phoneTheme?.fontFamily || "'Inter', sans-serif"};
}
\`\`\`

---

## 📐 物理微观几何与交互法则 (Physics & Geometry)

1. **边缘与描边**：${s.cssSnippet.includes('3px solid') ? '采用 3px 极粗黑色硬描边，强调物体的雕塑感与实体分量。' : s.cssSnippet.includes('1px solid') ? '极精细 1px 微发丝级边框，提供精准轮廓而不增加多余视觉噪点。' : '基于材质自适应的边缘折射。'}
2. **阴影与光效**：${s.cssSnippet.includes('4px 4px 0') ? '纯黑色零羽化硬投影（box-shadow: 4px 4px 0 #000），赋予纯粹的波普实体感。' : s.cssSnippet.includes('blur') ? '多重高斯漫反射柔光，打造层次纵深的通透悬浮质感。' : '温润物理环境光漫反射。'}
3. **触觉反馈 (Press States)**：
   - **Active 态物理位移**：点击时产生 2px 位移，模拟机械按键按下体验：
     \`transform: translate(2px, 2px);\`

---

## 🧩 原子级组件实现代码 (Components)

### 1. 原生 CSS 核心实现
\`\`\`css
${s.cssSnippet}
\`\`\`

### 2. Tailwind CSS v3/v4 实用类实现
\`\`\`html
<!-- 卡片组件 -->
<div class="${tailwindClasses.card} ${tailwindClasses.border} ${tailwindClasses.shadow} p-4 transition-all">
  <div class="font-bold text-base">组件标题</div>
  <p class="text-sm opacity-80 mt-1">组件描述与正文内容...</p>
</div>
\`\`\`

---

## 🤖 Vibe Coding 专属提示词配方 (Prompt Recipe)

> [!TIP]
> **一键复制以下 Prompt 块**，直接作为 Cursor / Claude Code / Antigravity / Windsurf 的编码上下文指令：

\`\`\`markdown
【UI 设计风格指令 - #${s.num} ${s.name}】
请按照 ${s.name} (${s.nameZh}) 风格规范帮我编写前端移动端界面：
1. 核心视觉：${s.prompt}
2. 色彩要求：主色采用 ${s.colors.map(c => `${c.name} (${c.hex})`).join('、')}；
3. 几何与阴影：遵循以下核心样式特征：
${s.cssSnippet}
4. 交互反馈：按钮与卡片点击时需有贴合物理触觉的微交互反馈，保持极致的设计品质与细节完整度。
\`\`\`

---

## ⚙️ Tailwind 配置扩展 (tailwind.config.js)

\`\`\`javascript
${s.tailwindConfig || `// Tailwind Preset for ${s.name}
module.exports = {
  theme: {
    extend: {
      colors: {
        '${s.id}-primary': '${s.colors[0]?.hex || '#000000'}',
        ${s.colors.slice(1).map((c, i) => `'${s.id}-c${i+1}': '${c.hex}'`).join(',\n        ')}
      }
    }
  }
};`}
\`\`\`

---

## ⚠️ 避坑红线与反模式 (Anti-Patterns)

${antiPatternList.map((ap, i) => `- ❌ **红线 ${i+1}**：${ap}`).join('\n')}

---

## 🔗 推荐混搭搭配 (Compatible Styles)

${relatedList.map(r => `- [[${r}]]：与当前风格混搭，可平衡严肃性与趣味性`).join('\n')}

---

## 📱 本地真机交互仿真

- 🔗 **本地全功能模拟器**：[在本地浏览器中查看 #${s.num} 风格的真实交互仿真](../../index.html)
- 💡 *提示：在本地打开 \`index.html\`，按键盘快捷键或在左侧列表点击对应项即可查看真机 1:1 动态渲染！*
`;

  fs.writeFileSync(targetPath, content, 'utf-8');
});

console.log('Successfully generated all 30 atomic style notes!');
