---
id: "ds-shopify-polaris"
title: "Shopify Polaris (移动电商与商户端交互系统)"
type: "design-system"
category: "设计系统"
tags:
  - "design-system/shopify"
  - "domain/ecommerce"
  - "ui/mobile"
  - "interaction/forms"
source_repo: "alexpate/awesome-design-systems"
vendor: "Shopify Inc."
official_url: "https://polaris.shopify.com/"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[04 - Mobile Form & Input (移动端表单与键盘适配规范)]]"
---

# Shopify Polaris (移动电商与商户端交互系统)

> 整理自全球顶尖设计系统集锦 `alexpate/awesome-design-systems` 与 Shopify Polaris 官方规范。
> Polaris 是全球**电商、支付、订单管理与 SaaS 移动端**交互设计的教科书级规范，以**高容错、清晰信息密度与严密的业务反馈**闻名。

---

## 🛍️ 核心设计哲学 (Core Philosophy)

1. **以商户与买家任务为中心 (Focus on Merchant Success)**：
   - 移动端一切设计服务于“快速做决策”与“安全无误完成交易”，杜绝干扰性装饰。
2. **信任感与安全性 (Trust & Predictability)**：
   - 在涉及资金结算、订单发货、退款处理等关键节点，提供严格的二次确认、防误触与可撤销机制（Undo）。
3. **极高容错度的表单设计 (Forgiving Forms)**：
   - 即时行内校验、自动格式化输入（如信用卡号、手机号空格分隔）、清晰的错误提示与软键盘智能适配。

---

## 📱 移动电商场景的核心交互组件标准

| 核心组件 | 交互标准与落地红线 |
| :--- | :--- |
| **结算沉底栏 (Sticky Checkout Bar)** | 常驻屏幕底部，展示总价 + 强化“立即支付”主按钮；必须避让 iOS Home Indicator；在键盘弹出时平滑收起或吸附。 |
| **数量步进器 (Stepper / Stepper Pill)** | 加减按钮必须具备最小 `40×40px` 触控面积，长按支持连续加速增减，支持直接点击中间数字唤起数字键盘输入。 |
| **状态徽标 (Badges & Banners)** | 区分“待付款 (Amber)”、“已发货/成功 (Green)”、“已取消/异常 (Rose)”；移动端仅采用精炼文本配合颜色，杜绝歧义。 |
| **可撤销轻提示 (Actionable Toast)** | 当商户在手机端批量归档或删除订单时，提供带“撤销 (Undo)”按钮的 4 秒 Toast 浮窗，代替阻塞式的全屏弹窗。 |

---

## 📋 移动端订单与商品卡片布局规则
- **左图右文经典结构**：商品缩略图尺寸建议 `80×80px`（圆角 `8px`），右侧为标题（最多双行截断）、规格标签（如 `黑色 / XL`）、价格与数量控制器。
- **价格排版规范**：货币符号（`¥ / $`）建议字号略小于金额主体（例如 `¥` 12px，`199` 18px Bold），强化金额数值的主视觉识别速度。

---

## 🔗 官方资源与仓库
- Polaris 官方站点：[polaris.shopify.com](https://polaris.shopify.com/)
- GitHub 官方仓库：[Shopify/polaris](https://github.com/Shopify/polaris)
- 设计资产总览：[[00 - UI Vibe Coding Compass (MOC)]]
