---
id: "ds-antd-mobile"
title: "Ant Design Mobile (企业级移动端设计体系)"
type: "design-system"
category: "设计系统"
tags:
  - "design-system/ant-design"
  - "platform/cross-platform"
  - "ui/mobile"
  - "market/china"
source_repo: "alexpate/awesome-design-systems"
vendor: "Ant Group (蚂蚁集团)"
official_url: "https://mobile.ant.design/"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[01 - Sheet & Dialog (底部抽屉与模态弹窗交互规范)]]"
---

# Ant Design Mobile (企业级移动端设计体系)

> 整理自全球顶尖设计系统集锦 `alexpate/awesome-design-systems` 与 Ant Design Mobile 官方文档。
> 蚂蚁移动设计体系是国内企业级移动端应用的事实标准，广泛应用于**移动办公（钉钉/企业微信生态）、金融理财、O2O生活服务及复杂业务审批流**。

---

## 🐜 核心设计哲学 (Core Values)

1. **确定性与高效率 (Certainty & High Efficiency)**：
   - 面对复杂的业务流程（多级审批、金融风控认证、合同签署），保持组件状态清晰、交互逻辑闭环，避免用户在移动端迷失。
2. **轻量与适度 (Lightweight & Moderate)**：
   - 界面元素克制，采用通透白底配合蚂蚁蓝（`#1677FF`），利用清晰的微描边与分割线（Hairline 0.5px）划分内容，保持高信息密度。
3. **触控与手势深度契合 (Touch First)**：
   - 深度打通下拉刷新（Pull to Refresh）、上拉无限加载（Infinite Scroll）、侧滑单元格删除（SwipeAction）、级联选择器（CascadePicker）。

---

## 📱 核心业务组件与落地规范

| 组件类型 | 经典表现形式 | 规范与设计要点 |
| :--- | :--- | :--- |
| **列表视图 (List)** | 通栏与分组卡片两种形态 | 标题、副标题、右侧辅助信息（Value）与右箭头对齐；单行行高默认 `48px`，双行 `68px`，支持 0.5px 物理分割线。 |
| **动作面板 (ActionSheet)** | 底部向上滑出半屏浮层 | 用于临时提供操作选项（如：“拍照”、“从相册选择”、“删除”）；取消按钮与主操作项具备独立视觉间距。 |
| **级联与滚轮选择器 (Picker)** | 3D 滚轮拟物微动效 | 支持省市区联动、日期时间滚轮；在移动端单手模式下，相比树状展开更节省垂直屏幕高度。 |
| **气泡与轻提示 (Toast / Popover)** | 居中浮层（半透明黑底白字） | 展示操作结果（如“已保存”、“网络超时”），停留 `1.5s ~ 2s` 自动消失，不打断主操作链路。 |

---

## 📐 响应式与高清适配 (Retina & Viewport)
- **1px 物理像素抗锯齿**：在 Retina 屏上利用 CSS `transform: scaleY(0.5)` 实现真实的 0.5px 发丝级分割线，告别粗糙的 1px 模糊边框。
- **动态字号与无障碍放大**：界面弹性布局（REM / VW / Flex），支持跟随系统“老年人特大字体模式”自适应排版，不出现文本截断重叠。

---

## 🔗 官方资源与仓库
- 官方规范站点：[mobile.ant.design](https://mobile.ant.design/)
- GitHub 官方仓库：[ant-design/ant-design-mobile](https://github.com/ant-design/ant-design-mobile)
- 设计资产总览：[[00 - UI Vibe Coding Compass (MOC)]]
