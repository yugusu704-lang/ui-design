---
id: "style-id"
num: "31"
title: "New Style Name (风格中文名)"
name_en: "New Style Name"
name_zh: "风格中文名"
family: "Modern Tech & Minimalism"
family_zh: "现代极简与数字科技"
family_folder: "01-现代极简与数字科技"
tags:
  - "style/new-style"
  - "family/modern-tech"
  - "category/minimal"
  - "theme/dark"
best_for:
  - "目标业务场景 1"
  - "目标业务场景 2"
primary_color: "#6366F1"
accent_colors:
  - name: "Primary"
    hex: "#6366F1"
  - name: "Accent"
    hex: "#EC4899"
bg_color: "#0B0D0E"
text_color: "#F8FAFC"
font_family: "'Inter', sans-serif"
physics:
  border: "1px solid rgba(255, 255, 255, 0.08);"
  shadow: "0 8px 32px rgba(0, 0, 0, 0.5);"
related_styles:
  - "[[03. Linear  Raycast Dark]]"
---

# #31 New Style Name (风格中文名)

> **核心调性**：简要说明该风格的核心视觉调性与感官特质。
> **最佳场景**：适合的业务品类、目标受众与场景。
> **设计家族**：[[00 - UI Vibe Coding Compass (MOC)|所属家族]]

---

## 🌟 风格哲学与视觉心理 (Philosophy)

[此处填写风格的美学哲学、心理学依据与设计源流]

---

## 🎨 核心色彩与 Design Tokens

### 色彩全景表
| 色彩名称 (Token) | Hex 色值 | 视觉角色 | 典型应用 |
| :--- | :--- | :--- | :--- |
| **Primary** | `#6366F1` | 主色 | 核心按钮、焦点状态 |

### CSS 变量定义
```css
:root {
  --style-new-primary: #6366F1;
  --style-new-bg: #0B0D0E;
  --style-new-text: #F8FAFC;
}
```

---

## 📐 物理微观几何与交互法则 (Physics & Geometry)

1. **边缘与描边**：[说明描边粗细与透明度]
2. **阴影与光效**：[说明投影层级与模糊半径]
3. **触觉反馈**：[说明 active 态位移或按压弹性]

---

## 🧩 原子级组件实现代码 (Components)

### 1. 原生 CSS 核心实现
```css
.new-style-card {
  background: #111620;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}
```

### 2. Tailwind CSS v3/v4 实用类实现
```html
<div class="bg-[#111620] border border-white/10 rounded-2xl p-4 shadow-xl">
  <h3 class="font-bold text-white">组件标题</h3>
</div>
```

---

## 🤖 Vibe Coding 专属提示词配方 (Prompt Recipe)

```markdown
【UI 设计风格指令 - #31 New Style】
请按照 New Style 风格规范编写移动端界面：
...
```

---

## ⚙️ Tailwind 配置扩展 (tailwind.config.js)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'new-primary': '#6366F1',
      }
    }
  }
};
```

---

## ⚠️ 避坑红线与反模式 (Anti-Patterns)

- ❌ **红线 1**：[常见翻车点 1]
- ❌ **红线 2**：[常见翻车点 2]

---

## 🔗 推荐混搭搭配 (Compatible Styles)

- [[03. Linear  Raycast Dark]]：推荐搭配理由

---

## 📱 本地真机交互仿真

- 🔗 **本地全功能模拟器**：[在本地浏览器中查看全功能模拟器](../index.html)
