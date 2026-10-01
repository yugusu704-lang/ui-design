---
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

```mermaid
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
```

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
