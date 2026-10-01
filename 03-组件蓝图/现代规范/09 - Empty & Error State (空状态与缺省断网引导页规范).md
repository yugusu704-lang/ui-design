---
id: "comp-empty-error-state"
title: "Empty & Error State (空状态与缺省断网引导页规范)"
type: "component-blueprint"
category: "组件蓝图"
tags:
  - "component/empty"
  - "component/error"
  - "ui/mobile"
  - "ux/recovery"
source_repo: "ant-design-mobile, youzan/vant, shadcn-ui/ui"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[07 - 移动电商高容错系统 (Shopify Polaris 范式)]]"
---

# Empty & Error State (空状态与缺省断网引导页规范)

> 整理自 GitHub 开源标杆 `ant-design-mobile`、`youzan/vant` 与 Shopify Polaris 容错规范。
> 移动端网络环境复杂、存储受限，**空状态（Empty State）绝不是无内容的死胡同，而是引导用户继续探索的最核心转化入口**。优秀的空状态能化解挫败感，通过清晰的“行动召唤（Call to Action）”将用户带回主路径。

---

## 📱 移动端 4 大经典缺省场景分类

| 缺省场景 | 核心诱因 | 心理学文案法则 | 恢复行动按钮 (CTA) |
| :--- | :--- | :--- | :--- |
| **搜索无结果 (No Search Match)** | 拼写错误或商品/内容缺货 | 抱歉，未找到“关键词”，换个词试试？ | **推荐热搜词胶囊**、一键清空搜索词 |
| **购物车/收藏夹为空 (Empty Cart)** | 新用户或刚刚结算完成 | 您的购物车空空如也，逛逛今日精选吧！ | **“去逛逛精选商品”** 主按钮 |
| **弱网/断网离线 (Offline Network)** | 电梯/地铁/信号盲区网络断开 | 网络似乎开小差了，请检查网络设置。 | **“重新加载”** 按钮（带轻震重试动效） |
| **权限受限/404 (No Permission)** | 登录凭证失效、页面已下线 | 当前内容暂不可见或已迁移。 | **“返回首页”** / “去登录” 按钮 |

---

## 🛠️ 缺省页物理布局黄金三段式

```text
+------------------------------------------+
|                                          |
|         [ 情感化插画 / 柔光图标 ]        |  <- 尺寸 96px~120px，低饱和弱对比，不喧宾夺主
|                                          |
|           主标题：暂无相关记录           |  <- text-base / font-bold text-white
|    副文案：可以尝试更换筛选项或重置搜索   |  <- text-xs text-slate-400，引导解决问题
|                                          |
|        [ 一键重新加载 (h-11 px-8) ]      |  <- 主按钮：符合 44pt 触控靶心，带弹性反馈
|                                          |
+------------------------------------------+
```

---

## 🎨 视觉实时渲染与工程源码双模呈现

### 1. 👀 实时渲染视觉预览 (Obsidian 原生高保真渲染)

<div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; padding: 32px 20px; max-width: 380px; margin: 16px auto; text-align: center; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <!-- 情感化光晕图标 -->
  <div style="width: 80px; height: 80px; border-radius: 999px; background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px auto;">
    <span style="font-size: 34px;">📦</span>
  </div>

  <!-- 标题与解释文案 -->
  <div style="font-size: 16px; font-weight: 700; color: #f8fafc;">暂无未完成订单</div>
  <div style="font-size: 12px; color: #94a3b8; max-width: 240px; margin: 6px auto 22px auto; line-height: 1.5;">
    您当前所有的历史订单均已配送完毕，快去探索当季新鲜好物吧！
  </div>

  <!-- 恢复动作主按钮 -->
  <button style="display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 28px; border-radius: 14px; background: #6366f1; color: #ffffff; font-size: 13px; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
    去商城逛逛
  </button>
</div>

### 2. 💻 生产级工程源码 (Tailwind CSS / 供 AI 检索调用)

```html
<!-- 移动端全功能断网/空状态引导卡片 -->
<div class="flex flex-col items-center justify-center p-8 text-center">
  <!-- 柔光环形图标 -->
  <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
    <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-2.828-6.364m0 0a9 9 0 012.828-6.364m0 0l2.829 2.829"></path>
    </svg>
  </div>

  <h3 class="text-base font-bold text-white">网络连接中断</h3>
  <p class="mt-1.5 max-w-xs text-xs text-slate-400 leading-relaxed">
    信号连接微弱，未能成功拉取数据。请检查网络后点击下方按钮重试。
  </p>

  <!-- 核心恢复按钮 (44pt 触控靶心) -->
  <button class="mt-6 flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-6 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
    重新加载数据
  </button>
</div>
```

---

## ⚠️ 绝对避坑红线 (DO NOT)
- ❌ **严禁责备用户**：禁止使用“你没有输入正确”、“你的网络太差”等负面用词，必须转化为包容性解决文案；
- ❌ **严禁死路设计**：空状态必须提供至少 1 个可点击的前进入口（返回上一页、去首页或重试），禁止让用户困在死屏；
- ❌ **严禁巨大突兀插画**：插画高度不得超过屏高的 25%，防止挤压核心行动按钮。

---

## 🔗 知识库关联与导航
- 深入高容错电商模式：[[07 - 移动电商高容错系统 (Shopify Polaris 范式)]]
- 结合表单与输入防错：[[04 - Mobile Form & Input (移动端表单与键盘适配规范)]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
