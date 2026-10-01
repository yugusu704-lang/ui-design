---
id: "law-miller"
title: "米勒定律 (Miller's Law) 与信息组块"
type: "psychology"
category: "设计心理学"
tags:
  - "ux/psychology"
  - "laws-of-ux"
  - "ui/mobile"
  - "interaction/chunking"
source_repo: "jonyablonski/laws-of-ux"
origin_author: "George Miller (1956)"
related:
  - "[[Cards & Bento Surfaces]]"
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
---

# 米勒定律 (Miller's Law) 与移动端信息组块

> **核心定律**：人类工作记忆（Working Memory）一次能容纳的信息块数量极限平均为 **$7 \pm 2$ 个组块（Chunks）**。

---

## 📱 移动端小屏界面如何落地“组块化 (Chunking)”

不要让用户在没有间断的长串字符或信息平铺中感到大脑认知过载。优秀的移动端设计必须主动帮用户把信息打包成若干逻辑块。

### 1. 经典字符输入分段 (Automatic Chunking)
- **手机号自动加空格**：输入 `13800138000` 时，输入框实时自动格式化为 `138 0013 8000`（3-4-4 结构），极速降低核对成本。
- **银行卡/信用卡号**：按 `4-4-4-4` 分段呈现；身份证号按 `6-8-4` 分段呈现。
- **验证码独立格子**：采用 4 位或 6 位分体式独立方块（Pin Input Box），输入自动跳焦。

### 2. Bento Grid (便当盒) 与卡片分组
- 移动端页面切忌无尽的平铺文字流。应利用 Bento 网格（便当盒）或分组卡片，将相关联的数据封装在同一个具有圆角背景、轻微微光或阴影的独立卡片内。
- 用户浏览时，大脑将一个“卡片”视作 1 个单一的认知组块，而非零散的 5 行字。

### 3. 设置列表分组（Grouped Inset Lists）
- 遵循 iOS / Android 原生规范：长设置列表必须按语义切分成 3~5 个小节（Sections），每个小节之间留出 `16px ~ 24px` 的留白并带小灰字标题。

---

## 🔗 关联阅读
- 查看 Bento 表面与卡片组合：[[Cards & Bento Surfaces]]
- 移动端表单与输入框设计：[[04 - Mobile Form & Input (移动端表单与键盘适配规范)]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
