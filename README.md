# 🧭 30 Mobile UI Styles & Vibe Coding Compass (Obsidian Vault 外置大脑)

## Atelier 本地页面工作室

仓库现在包含以组件搭建为主、AI 辅助的移动端前端编辑器。默认使用暖米色工作台，支持 22 种组件、五页任务与习惯模板、实时预览、本地保存、撤销重做和 React + TypeScript 源码导出。

安装 Node.js 24 后启动：

```sh
cd builder
npm ci
npm run dev
```

打开 `http://127.0.0.1:5173`。AI 需要在「模型设置」中配置自己的兼容 API；手动搭建、保存和导出可以独立使用。完整说明见 [builder/README.md](builder/README.md)。

可选辅助工具需单独配置：DevFlow 启动器通过 `DEVFLOW_ENGINE` 定位外部引擎，`DEVFLOW_PYTHON` 可指定 Python；n8n 维护脚本通过 `N8N_USER_FOLDER` 定位数据库目录，`SQLITE3_MODULE_PATH` 可指定本地 sqlite3 模块。它们不参与 Atelier 的启动流程，本地运行时与数据库不纳入仓库。

---

> 本仓库已全面升级构筑为**面向人类设计师与 AI 编码助手（Cursor / Claude Code / Antigravity / Windsurf）的高效“移动端 UI 设计外置大脑（Obsidian Vault）”**。
>
> 包含了 **30 种专为手机屏幕设计的经典与前沿风格**，每种风格均沉淀为**原子化 Markdown 笔记，配备结构化 YAML Frontmatter、双模设计 Token（原生 CSS + Tailwind）、高触觉微交互法则、避坑红线、双向链接网络及一键式 AI 提示词配方**。

---

## 🏛️ Obsidian Vault 核心导航入口

在 Obsidian 中将本文件夹（`./`）打开为 Vault，即可体验完整外置大脑：

- 🧭 **顶层内容地图 (MOC)**：[`00-导航中枢/00 - UI Vibe Coding Compass (MOC).md`](00-%E5%AF%BC%E8%88%AA%E4%B8%AD%E6%9E%A2/00%20-%20UI%20Vibe%20Coding%20Compass%20(MOC).md)
- 📊 **多维决策矩阵**：[`00-导航中枢/01 - Style Decision Matrix.md`](00-%E5%AF%BC%E8%88%AA%E4%B8%AD%E6%9E%A2/01%20-%20Style%20Decision%20Matrix.md)（按行业场景、情绪氛围、复杂度快速选型）
- 📖 **Vibe 提示词手册**：[`00-导航中枢/02 - Vibe Prompting Manual.md`](00-%E5%AF%BC%E8%88%AA%E4%B8%AD%E6%9E%A2/02%20-%20Vibe%20Prompting%20Manual.md)（提示词黄金三段式工程）
- 🤖 **AI 检索调用协议**：[`00-导航中枢/03 - External Brain Query Protocol.md`](00-%E5%AF%BC%E8%88%AA%E4%B8%AD%E6%9E%A2/03%20-%20External%20Brain%20Query%20Protocol.md)（规范 AI 如何精准提取知识库并交付工程代码）
- 🌌 **2D 风格宇宙白板**：[`05-可视化白板/30-Styles-Universe.canvas`](05-%E5%8F%AF%E8%A7%86%E5%8C%96%E7%99%BD%E6%9D%BF/30-Styles-Universe.canvas)（在 Obsidian 内打开 2D 可视化灵感画板）
- 🛠️ **AI 助手开箱即用规则**：[`04-AI助手预设/`](04-AI%E5%8A%A9%E6%89%8B%E9%A2%84%E8%AE%BE/)（包含 `.cursorrules` 与 Antigravity 系统提示词）

---

## 快速检阅与启动方式

### 方式一：在 Obsidian 中作为外置大脑使用（推荐）
在 Obsidian 中点击 **"Open folder as vault"（打开文件夹作为仓库）**，选择 `./`，即刻享受双链知识图谱与动态 Dataview 视窗。

### 方式二：直接在浏览器中打开全功能真机仿真展厅
在 Windows 文件资源管理器中双击打开：
`./index.html`
**双击即可直接在 Edge / Chrome / Safari 浏览器中全功能运行**（包含 30 种风格的 1:1 动态可交互真机模型与代码复制）。

### 方式三：本地轻量 HTTP 服务器启动
```powershell
node server.js
```
然后在浏览器访问：`http://localhost:3000`

此服务仅监听本机并提供展厅页面，项目数据库、API 配置和内部文件不会通过展厅服务访问。

---

## 30 种手机 UI 风格与 Vibe Coding 提示词全集

### 第一家族：现代极简与数字科技 (Modern Tech & Minimalism)

#### 01. Neo-Brutalism (新野兽派)
- **核心调性**：高对比粗黑描边、硬投影与高饱和波普调色，强烈的实体触觉冲击。
- **最佳场景**：Z世代潮玩电商、创意设计社区、潮流背单词/打卡工具、独立开发者主页。
- **关键色彩 Token**：`#FFE600`(酸黄), `#4DEEEA`(电青), `#000000`(纯黑), `#FFFFFF`(纯白), `#FF5E7E`(荧光珊瑚粉)。
- **灵魂 CSS**：
  ```css
  .neo-card {
    border: 3px solid #000000;
    box-shadow: 4px 4px 0px #000000;
    background-color: #FFFFFF;
    border-radius: 14px;
  }
  .neo-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0px #000000;
  }
  ```
- **Vibe Prompt**：
  > *Design a mobile app screen in Neo-Brutalism style. Use 3px solid black borders (#000000), hard unblurred drop-shadows (box-shadow: 4px 4px 0px #000), bright pop accent colors like acid yellow (#FFE600) and electric cyan (#4DEEEA). Employ bold grotesque typography, chunky tactile cards, solid black pill badges, and high-contrast tactile buttons with active press states.*

#### 02. Minimalist Scandinavian (北欧极简纯白)
- **核心调性**：极致开阔留白、0.5px 发丝级描边与中性灰阶，无压迫的平静克制。
- **最佳场景**：极简日记笔记、个人财务记账、日程待办、高端音响遥控器。
- **关键色彩 Token**：`#FFFFFF`(纯雪白), `#F8F9FA`(浅灰底), `#1E293B`(深岩灰), `#64748B`(次级字)。
- **灵魂 CSS**：
  ```css
  .nordic-card {
    background: #FFFFFF;
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.03);
    border-radius: 20px;
  }
  ```
- **Vibe Prompt**：
  > *Design a clean Scandinavian minimalist mobile UI. Palette: pure snow white (#FFFFFF), delicate off-white (#F8F9FA), muted charcoal (#1E293B) and subtle gray (#64748B). Use hairline 0.5px borders (rgba(0,0,0,0.06)), generous whitespace, tight typography hierarchy (Inter/SF Pro), smooth rounded-2xl cards with soft whisper shadows (0 2px 8px rgba(0,0,0,0.02)).*

#### 03. Linear / Raycast Dark (极客高精暗黑)
- **核心调性**：黑曜石级暗色、微光边缘描边与高精度微对比，开发者的终极审美。
- **最佳场景**：AI 原生交互工具、开发者移动终端、GitHub客户端、云原生运维看板。
- **关键色彩 Token**：`#0B0D0E`(黑曜石), `#16191E`(暗表面), `#8B5CF6`(激光紫), `#F8FAFC`(高亮白)。
- **灵魂 CSS**：
  ```css
  .linear-card {
    background: linear-gradient(180deg, #161922 0%, #101217 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    border-radius: 16px;
  }
  ```
- **Vibe Prompt**：
  > *Create an ultra-sleek Linear / Raycast inspired dark mode mobile UI. Dark obsidian background (#0B0D0E, #121518), hairline border accents (1px solid rgba(255,255,255,0.08)), subtle radial gradients for hover/active glow, purple-indigo pill indicators, refined monospace metadata tags, and razor-sharp typography.*

#### 04. Swiss International Typography (瑞士国际主义排版)
- **核心调性**：严苛网格、巨大非对称无衬线标题与朱砂红点缀，纯粹的功能主义理性。
- **最佳场景**：新闻深度阅读、建筑与工业设计媒体、现代艺术摄影展、思想智库期刊。
- **关键色彩 Token**：`#000000`(纯黑), `#FFFFFF`(白), `#FF3B30`(瑞士红), `#E5E5E5`(浅灰)。
- **灵魂 CSS**：
  ```css
  .swiss-container {
    border-radius: 0px;
    border-left: 3px solid #000000;
    padding: 16px;
    background: #FFFFFF;
  }
  ```
- **Vibe Prompt**：
  > *Design a mobile interface following the Swiss International Typographic Style. Strict modular grid alignment, stark black and white contrast with a single bold Vermillion Red (#FF3B30) accent. Oversized heavy sans-serif headings (Akzidenz/Helvetica), sharp rectangular geometry without rounded corners (border-radius: 0px), and clean horizontal dividing rules.*

#### 05. Monochrome High-Fashion (黑白高奢先锋)
- **核心调性**：极致纯黑白、Bodoni/Playfair 经典衬线标题与金属香槟金微点缀，高定气场。
- **最佳场景**：奢侈品电商 Lookbook、高定时装展买手店、高端香水与名表甄选。
- **关键色彩 Token**：`#111111`(丝绒黑), `#FAF9F6`(真丝白), `#D4AF37`(香槟金), `#8E8E93`(灰)。
- **灵魂 CSS**：
  ```css
  .luxury-card {
    background: #FFFFFF;
    border: 1px solid rgba(17, 17, 17, 0.1);
    padding: 24px 18px;
  }
  .luxury-title {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  ```
- **Vibe Prompt**：
  > *Design a high-fashion luxury editorial mobile UI in pure monochrome. High-contrast pure black and off-white silk canvas (#FAF9F6). Elegant high-contrast serif typography for headings (Playfair / Bodoni), minimal razor-thin borders, generous spatial rhythm, and subtle champagne gold (#D4AF37) accents for micro-badges.*

---

### 第二家族：玻璃拟物与空间深度 (Glassmorphism & Depth)

#### 06. Liquid Glassmorphism (液态拟玻 / iOS 18 Ambient Glass)
- **核心调性**：多重高斯模糊、半透明液态折射与虹彩高光边缘，通透如水。
- **最佳场景**：高品质音乐流媒体播放器、智慧家庭环境控制、新一代系统控制中心。
- **灵魂 CSS**：
  ```css
  .liquid-glass {
    background: rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(24px) saturate(190%);
    -webkit-backdrop-filter: blur(24px) saturate(190%);
    border: 1px solid rgba(255, 255, 255, 0.28);
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255,255,255,0.4);
    border-radius: 24px;
  }
  ```
- **Vibe Prompt**：
  > *Create a modern Liquid Glassmorphism mobile UI inspired by Apple VisionOS and iOS 18 ambient glass. Multi-layer backdrop blur (backdrop-filter: blur(24px) saturate(180%)), semi-transparent frosted white surfaces (rgba(255,255,255,0.15)), specular 1px white border highlights, subtle inner shadows, and dynamic colorful ambient background orbs.*

#### 07. Soft Neumorphism 2.0 (微柔新拟态 / Soft UI)
- **核心调性**：摒弃脏阴影的进化版双向柔光映射，如同挤压高档温润黏土。
- **最佳场景**：智能恒温器调节界面、冥想助眠白噪音、高端新能源车机遥控器。
- **灵魂 CSS**：
  ```css
  .neu-surface {
    background: #E8ECEF;
    border-radius: 22px;
    box-shadow: 7px 7px 16px #CBD5E1, -7px -7px 16px #FFFFFF;
  }
  .neu-inset {
    box-shadow: inset 4px 4px 8px #CBD5E1, inset -4px -4px 8px #FFFFFF;
  }
  ```
- **Vibe Prompt**：
  > *Design a refined Soft Neumorphism 2.0 mobile interface. Neutral warm-gray background (#E8ECEF). Cards and buttons seamlessly extruded from background using dual-direction soft lighting: box-shadow: -6px -6px 14px #FFFFFF, 6px 6px 14px #CBD5E1. Tactile debossed active states, pill-shaped toggles, clean pastel turquoise accent (#14B8A6).*

#### 08. Spatial / VisionOS Floating UI (空间计算悬浮分层)
- **核心调性**：多层纵深 Z 轴悬浮、大弧度超椭圆 (Squircle 28px) 与视线注视流光。
- **最佳场景**：Apple Vision Pro 伴侣 App、空间全景相册、沉浸式 3D 影音播客。
- **灵魂 CSS**：
  ```css
  .spatial-card {
    background: rgba(30, 30, 38, 0.72);
    backdrop-filter: blur(30px);
    border: 1.5px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05);
    border-radius: 28px;
  }
  ```
- **Vibe Prompt**：
  > *Design a VisionOS inspired spatial computing mobile UI. Semi-translucent dark smoked glass panels, deep z-axis spatial elevation, large squircle corners (rounded-[28px]), ambient rim lighting that simulates gaze focus, floating layered widgets, and ultra-crisp white iconography.*

#### 09. Modern Skeuomorphism Craft (现代精密拟物工坊)
- **核心调性**：拉丝航空铝材、滚花旋钮微纹理与物理弹簧机械阻尼，重塑物理尊严。
- **最佳场景**：专业音频均衡器、专业胶片相机调参、黑胶唱机模拟器、名贵机械表指南针。
- **灵魂 CSS**：
  ```css
  .craft-panel {
    background: linear-gradient(180deg, #2B303A 0%, #1E2229 100%);
    border: 1px solid #475161;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 6px 18px rgba(0,0,0,0.5);
    border-radius: 14px;
  }
  ```
- **Vibe Prompt**：
  > *Create a modern skeuomorphic craft mobile UI inspired by Teenage Engineering and Leica cameras. Finely textured brushed dark titanium (#1F2428), knurled metallic rotary controls, amber LED status indicator lights (#F59E0B), realistic bevel borders, and mechanical spring switch toggles.*

#### 10. Claymorphism 3D (3D膨胀黏土风)
- **核心调性**：充气质感圆润泡泡形态、彩色弥散软阴影与糖果粉彩，童趣治愈。
- **最佳场景**：儿童益智启蒙、亲子宠物养成游戏、趣味记账、年轻化社交打赏。
- **灵魂 CSS**：
  ```css
  .clay-card {
    background: #FFFFFF;
    border-radius: 28px;
    box-shadow:
      0 18px 30px -6px rgba(192, 132, 252, 0.28),
      inset 0 -5px 8px rgba(0, 0, 0, 0.04),
      inset 0 6px 10px rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.6);
  }
  ```
- **Vibe Prompt**：
  > *Design a playful Claymorphism 3D mobile app UI. Chunky, inflated marshmallow-like 3D cards with smooth rounded-3xl corners. Use pastel candy palette (bubblegum pink #F472B6, soft lavender #C084FC, mint green #34D399). Multi-layer colored drop shadows for deep pillowy volume.*

---

### 第三家族：赛博、科幻与未来主义 (Cyber, Sci-Fi & Futuristic)

#### 11. Cyberpunk Neon (赛博朋克霓虹)
- **核心调性**：黑曜石暗夜底色、热烈洋红与赛博电青双色分裂发光，高能未来都市。
- **最佳场景**：Web3加密钱包、硬核电竞玩家俱乐部、赛博科幻RPG游戏伴侣。
- **Vibe Prompt**：
  > *Create an intense Cyberpunk Neon mobile UI. Deep obsidian carbon background (#090A0F), dual-tone electric split lighting: Hot Magenta (#FF007F) and Cyber Cyan (#00F0FF). Glowing text shadows, neon contour borders, circuit HUD grid overlays, and angled clipped-corner polygon cards.*

#### 12. Bioluminescent Dark (深海荧光科技)
- **核心调性**：万米海沟深邃午夜蓝、磷光水母薄荷绿与紫晶荧光微光脉冲，神秘空灵。
- **最佳场景**：AI深度思考过程可视化、智能睡眠与梦境追踪、观星与太空天文探索。
- **Vibe Prompt**：
  > *Design an ethereal Bioluminescent Dark mobile interface. Abyssal midnight navy background (#030712, #071322), glowing phosphorescent accents in marine teal (#00F5D4) and deep bio-violet (#7928CA). Soft radial gradient halos that mimic deep-sea organism breathing pulses, subtle wave telemetry lines, and floating luminescent cards.*

#### 13. Y2K Futuristic Digital (千禧Y2K数码复古)
- **核心调性**：金属电镀渐变、星芒符号 ✦ ✧ 与千禧粉蓝全息彩虹光泽，复古未来狂欢。
- **最佳场景**：潮玩盲盒抽奖、千禧复古滤镜相机、青年亚文化潮流音乐播放器。
- **Vibe Prompt**：
  > *Create a Y2K Futuristic Aesthetic mobile UI. Chrome liquid metallic gradients, sparkling four-point starbursts (✦, ✧), holographic iridescent borders, and bubblegum pop accents (electric pink #FF70A6, candy sky blue #70D6FF, lime fizz #E9FF70). Glossy reflective pill buttons and nostalgic millennium digital badges.*

#### 14. Solarpunk / Eco-Futurism (太阳能朋克 / 生态未来)
- **核心调性**：温润森林墨绿、太阳能琥珀金与叶脉仿生玻璃，科技与自然共生。
- **最佳场景**：智慧绿色出行、碳足迹管理追踪、有机农场遥控、清洁能源电桩。
- **Vibe Prompt**：
  > *Design a Solarpunk Eco-Futuristic mobile UI. Lush deep forest green (#1B4332) blended with warm solar gold (#FFB703) and refreshing sage (#74C69D). Frosted organic glass cards with botanical leaf-curve corners, clean circular solar telemetry energy gauges, and clean optimistic environmental data charts.*

#### 15. Holo-HUD Military Matrix (战术HUD全息矩阵)
- **核心调性**：战术六角网格、夜视仪磷光绿/荧光橙与斜角切角多边形，高精度仪器感。
- **最佳场景**：户外极限探险越野、航模无人机地面站操控、极客服务器终端监控。
- **Vibe Prompt**：
  > *Create a tactical military Holo-HUD mobile UI. Dark olive-black background (#0C100D), high-visibility phosphor night-vision green (#39FF14) and tactical amber (#FFB000). Telemetry crosshair marks, coordinate coordinates, hexagonal battery gauges, angled clipped polygon borders, and dense monospace readouts.*

---

### 第四家族：潮流、趣味与青年文化 (Pop, Playful & Youth Culture)

#### 16. Memphis Pop Vibrant (孟菲斯波普潮流)
- **核心调性**：趣味几何乱序散射（波浪纹、水磨石点）、倾斜卡片与高饱和撞色。
- **最佳场景**：青年潮流文创集市、周末派对聚会组局、趣味闯关背单词应用。
- **Vibe Prompt**：
  > *Design a high-energy Memphis Pop mobile UI. Cheerful geometric scatters (squiggly waves, black terrazzo polka dots, triangles), dynamic slight tilt on cards (transform: rotate(-1.5deg)), clashing dopamine colors (coral red #FF5E7E, electric cobalt #3B82F6, bright sun #FFD166). High fun, high playfulness.*

#### 17. Dopamine Pastel Candy (多巴胺马卡龙软糖)
- **核心调性**：草莓奶昔粉、牛油果浅绿与蓬松软萌胶囊圆角，多巴胺治愈系。
- **最佳场景**：萌宠成长日常记录、女性经期健康管理、日常治愈小确幸打卡、烘焙食谱分享。
- **Vibe Prompt**：
  > *Create a sweet Dopamine Pastel Candy mobile UI. Delightful soft candy palette: strawberry milk pink (#FF8FAB), soft lilac (#E0AAFF), pistachio green (#B7E4C7), and butter yellow (#FFE382). Puffy squishy cards with extra large pill shapes, rounded floating tabs, and juicy high-spring tactile button feedback.*

#### 18. Acid Graphic / Anti-Design (酸性平面反设计)
- **核心调性**：液态水银扭曲、剧毒荧光绿撞酸性深紫、反网格贴纸标签，先锋亚文化。
- **最佳场景**：地下摇滚/电子音乐演出票务、街头滑板社群、先锋艺术展演。
- **Vibe Prompt**：
  > *Design an Acid Graphic / Anti-Design mobile UI. Harsh clashing contrast: Toxic Lime (#BFFF00), Acid Violet (#240046), and Liquid Silver chrome. Distorted sticker-like label tags, intentional defiance of traditional grid margins, warped typography styling, and industrial barcode raw aesthetic.*

#### 19. Comic / Ben-Day Dots (美漫/日漫波点线稿风)
- **核心调性**：半色调本戴波点网屏、漫画手绘黑墨线稿、气泡对话框与动效拟声词。
- **最佳场景**：漫画二次元阅读器、动漫同人交流社区、ACG集换式卡牌对决。
- **Vibe Prompt**：
  > *Create a Comic Book / Manga Pop mobile UI. Ben-Day halftone screen dot backgrounds, bold hand-drawn inked outlines (border: 2.5px solid #000), dialogue speech-bubble cards with directional tails, dynamic comic action burst badges (✦ BOOM! / NEW!), and classic halftone print primary red, yellow, and black.*

#### 20. Retro 8-Bit Pixel Art (复古8比特像素工坊)
- **核心调性**：阶梯式像素边缘、街机经典 16 色调色板与方块血量条，情怀拉满。
- **最佳场景**：复古游戏伴侣攻略、怀旧像素风记账、极简复读机学习工具。
- **Vibe Prompt**：
  > *Design a Retro 8-Bit Pixel Art mobile UI. Pixel font (Press Start 2P / Silkscreen), stepped stair-step pixel corners, authentic NES/GameBoy nostalgic color palette (Arcade Emerald #10B981, CRT Dark Green #064E3B, Amber Coin #F59E0B). Blocky pixel progress bars and chunky retro quest badges.*

---

### 第五家族：人文社科、复刻与东方意境 (Editorial, Warmth & Culture)

#### 21. Editorial Magazine / New Yorker (社论杂志出版物)
- **核心调性**：羊皮纸温润质感、经典衬线正文字阶、双发丝分割线与首字下沉。
- **最佳场景**：深度长文阅读专栏、文学小说精读、智库学术论文评析。
- **Vibe Prompt**：
  > *Create an intellectual Editorial Magazine mobile UI inspired by The New Yorker and Kinfolk. Warm sepia parchment background (#FAF7F2), rich ink typography (Playfair / Noto Serif SC), delicate double hairline dividers, elegant drop caps for article excerpts, and quotation card callouts with generous typographic air.*

#### 22. Warm Earthy Botanical (大地自然手作风)
- **核心调性**：燕麦亚麻浅胚、温暖赤陶陶土红与桉树鼠尾草绿，手作质朴温度。
- **最佳场景**：精油香薰SPA生活馆、自然有机护肤品、手工柴烧陶瓷工坊。
- **Vibe Prompt**：
  > *Design a Warm Earthy Botanical mobile UI. Natural oatmeal linen canvas (#F5EFEB), warm terracotta pottery accents (#C86D51), dusty eucalyptus sage (#8A9A86), and raw umber text. Artisanal soft rounded contours, gentle earthy pill tags, and an organic wellness ambiance.*

#### 23. Neo-Chinese Ink & Zen (新中式水墨禅意)
- **核心调性**：宣纸肌理微底、水墨五色渐变晕染、朱砂印章红点缀与大写意留白。
- **最佳场景**：茶道美学电商、国风传统诗词文创、中医药养生与禅修冥想。
- **Vibe Prompt**：
  > *Create a Neo-Chinese Ink & Zen aesthetic mobile UI. Xuan rice paper canvas (#F7F4EC), graduated ink-wash blacks, cinnabar seal stamp red (#C23531), and celadon jade green (#7BA29A). Flowing negative space (留白), calligraphy serif fonts, subtle vertical text layout accents, and delicate circular ink mist backdrops.*

#### 24. Japanese Wabi-Sabi (日式侘寂原木)
- **核心调性**：榻榻米草木浅灰褐、老白茶米色与未打磨陶器粗粝微纹，静谧低噪。
- **最佳场景**：日式温泉极简预订、正念减压指南、无印系极简生活家品。
- **Vibe Prompt**：
  > *Design a Japanese Wabi-Sabi minimalist mobile UI. Muted tatami straw beige (#EDE8DF), aged ash wood (#8C7E72), and weathered tea ceremony stone. Unadorned asymmetric layout, ultra-low visual noise, subtle organic textured borders, and peaceful breathing space.*

#### 25. Retro Bauhaus Geometry (包豪斯几何构成)
- **核心调性**：包豪斯红黄蓝纯三原色、纯粹圆方三角几何拓扑与强烈结构张力。
- **最佳场景**：设计专业教学互动课件、现代建筑巡礼指南、几何智力解谜游戏。
- **Vibe Prompt**：
  > *Create a Bauhaus Geometry mobile UI. Strict adherence to primary color triad: Bauhaus Red (#D02027), Cobalt Blue (#19478A), and Cadmium Yellow (#F5B82E) against stark white and dark charcoal. Clean circles, triangles, and rectangular cards combined in asymmetrical constructivist layouts.*

---

### 第六家族：功能级业务专属体系 (Functional & Industry Specialized)

#### 26. Bento Grid Modular (Bento 便当盒模块流)
- **核心调性**：非对称高密度跨栏多宫格、Squircle 圆角与卡片内置微交互组件。
- **最佳场景**：智能手机主屏小组件、SaaS产品功能特性展示、个人数字身份看板。
- **Vibe Prompt**：
  > *Design an Apple-inspired Bento Grid Modular mobile UI. High-density 2-column asymmetric grid cards (spanning 1x1, 2x1, 2x2). Squircle rounded-2xl corners, sleek graphite dark surfaces (#18181B) with fine subtle borders, self-contained micro-widgets (battery bar, audio waveform, quick toggles).*

#### 27. Bloomberg Terminal Finance (彭博终端高频金融)
- **核心调性**：纯黑画布底、高能见度荧光绿/紧急红涨跌色、等宽制表数字，零浪费排版。
- **最佳场景**：加密货币合约交易所、外汇高频交易行情、量化对冲基金终端看板。
- **Vibe Prompt**：
  > *Create a high-density Bloomberg Terminal / Web3 DEX trading mobile UI. Pitch black canvas (#000000), stark high-visibility phosphor green (#00E676) for gains and emergency crimson (#FF3B30) for losses. Monospace font with tabular numeric alignment, live candlestick sparkline bars, and dense compact orderbook tables.*

#### 28. Aurora Fluid Mesh Gradient (极光流体微光弥散)
- **核心调性**：多重动态径向极光渐变、星云迷雾虚化与悬浮磨砂白卡片，如梦似幻。
- **最佳场景**：AI生成式大模型助手界面、情绪日记与心境反思、新潮冥想音频空间。
- **Vibe Prompt**：
  > *Design an Aurora Fluid Mesh Gradient mobile UI. Ambient diffused organic background blobs in coral, lavender, sky blue and lime, floating translucent frosted cards (rgba(255,255,255,0.7) with blur(20px)), ethereal glow borders, and uplifting emotional typography.*

#### 29. Dark Fantasy RPG HUD (暗黑魔幻RPG游戏界面)
- **核心调性**：做旧古铜金属鎏金滚边、黑曜石底板、鲜红血球与幽蓝法力水晶槽。
- **最佳场景**：魔幻卡牌手游伴侣、跑团 DND 角色卡管理、沉浸式互动剧本杀辅助。
- **Vibe Prompt**：
  > *Create a Dark Fantasy RPG mobile HUD interface. Obsidian stone textured background, ornate burnished antique bronze gold borders (#D4AF37), deep crimson ruby red (#990000) health status meters, luminous sapphire blue (#1E40AF) mana indicators, and sculpted gothic serif numerals.*

#### 30. Medical Biotech Clean (医疗生物高精透润)
- **核心调性**：无菌冰晶蓝白、高精微遥测心电波形与权威安全视觉指引，守护与可信。
- **最佳场景**：连续血糖仪 (CGM) 监测、移动心电监护仪、三甲医院掌上医生挂号问诊。
- **Vibe Prompt**：
  > *Design a Medical Biotech Clean mobile app UI. Sterile crisp white background (#FFFFFF), translucent ice-blue panels (#EBF5FB), reassuring clinical cyan (#0284C7) and vital alert amber (#F59E0B). Precision micro-telemetry data readouts (BPM, SpO2), smooth sinusoidal ECG heartbeat waveform, and clear clinical trust cues.*

---

## 如何在日常 Vibe Coding 中应用这些 Prompt？

当你在 Cursor、Antigravity、Claude Code、Windsurf 等开发工具中进行自然语言交互开发时，可以直接这样使用：

1. **直接粘贴 Vibe Prompt** 作为主页面生成的调性约束；
2. **结合你的业务需求**，例如：
   > *"请按照以下风格规范帮我用 React Native / Flutter / Tailwind 编写一个【智能记账应用首页】：\n[在此处粘贴目标风格的 Vibe Prompt]"*
3. **搭配核心 CSS Snippet**，将提取出的阴影 (`box-shadow`)、圆角 (`border-radius`) 和滤镜 (`backdrop-filter`) 写入你项目的 Tailwind 配置或全局样式文件中。
