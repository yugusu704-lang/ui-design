---
id: "comp-stepper-quantity"
title: "Stepper & Quantity (步进器与数量加减器规范)"
type: "component-blueprint"
category: "组件蓝图"
tags:
  - "component/stepper"
  - "component/counter"
  - "ui/mobile"
  - "interaction/ecommerce"
source_repo: "youzan/vant, ant-design-mobile"
related:
  - "[[00 - UI Vibe Coding Compass (MOC)]]"
  - "[[01 - 菲茨定律 (Fitts's Law) 与触控靶心]]"
---

# Stepper & Quantity (步进器与数量加减器规范)

> 整理自全球移动电商与外卖点餐事实标准 `youzan/vant` 与 `ant-design-mobile`。
> 在移动端购物车、商品详情及选座购票中，**步进器（Stepper）** 是高频数值增减的关键构件。由于拇指触控精度有限，步进器必须在紧凑尺寸内严格保障触控热区、防抖限制与临界状态保护。

---

## 📱 步进器物理形态与热区扩张设计

```text
+------------------------------------------------+
|  [ - 减号 ]      [  12  数值框  ]      [ + 加号 ]  |
+------------------------------------------------+
      ▲                  ▲                   ▲
   触控靶心           只读或弹键盘           触控靶心
   >= 36x36pt         居中等宽数字          >= 36x36pt
   (p-2扩展命中)     (font-mono防抖动)    (p-2扩展命中)
```

### 关键工程交互法则
1. **等宽字体防抖 (Font Monospace)**：
   - 居中的数字显示区域必须设置等宽字体（`font-mono`），确保数字在 1 $ightarrow$ 2 $ightarrow$ 10 跃迁时，宽度保持恒定，两端的加减按钮**绝不发生横向抖动**；
2. **临界值禁用态 (Boundary Lock)**：
   - 当数值到达最小值（如 `min = 1`）时，减号按钮必须立即变灰置灰并禁用手势响应（`opacity-40 cursor-not-allowed pointer-events-none`）；
   - 到达库存上限（如 `max = 99`）时加号同样置灰，并可轻度抖动 Toast 提示“已达限购上限”；
3. **防连击与防抖 (Debounce 300ms)**：
   - 用户连续快速狂点加号时，本地 UI 数字即时反馈自增，但向服务器发送的变更网络请求必须防抖 300ms 批量提交。

---

## 🎨 视觉实时渲染与工程源码双模呈现

### 1. 👀 实时渲染视觉预览 (Obsidian 原生高保真渲染)

<div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; padding: 20px; max-width: 380px; margin: 16px auto; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
  <!-- 商品卡片与步进器联动 -->
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div>
      <div style="font-size: 14px; font-weight: 700; color: #ffffff;">阿拉比卡冷萃咖啡</div>
      <div style="font-size: 12px; font-weight: 700; color: #38bdf8; margin-top: 2px;">¥28.00</div>
    </div>

    <!-- 胶囊型高触觉步进器 -->
    <div style="display: inline-flex; align-items: center; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 2px;">
      <!-- 减号 -->
      <button style="width: 34px; height: 34px; border-radius: 10px; border: none; background: rgba(255,255,255,0.06); color: #ffffff; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer;">-</button>
      <!-- 数值展示 (等宽字体) -->
      <span style="min-width: 36px; text-align: center; font-size: 14px; font-weight: 700; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #f8fafc;">2</span>
      <!-- 加号 -->
      <button style="width: 34px; height: 34px; border-radius: 10px; border: none; background: #6366f1; color: #ffffff; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(99,102,241,0.4);">+</button>
    </div>
  </div>
</div>

### 2. 💻 生产级工程源码 (Tailwind CSS / 供 AI 检索调用)

```html
<!-- 移动端高触觉胶囊步进器 (带触控微缩放与等宽字体) -->
<div class="inline-flex items-center rounded-xl border border-white/10 bg-slate-900 p-1 shadow-inner">
  <!-- 减少按钮 (临界禁用支持) -->
  <button class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-base font-bold text-white transition-transform active:scale-90 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none">
    -
  </button>

  <!-- 居中数值 (等宽字体防左右晃动) -->
  <span class="w-10 text-center font-mono text-sm font-bold text-white">
    3
  </span>

  <!-- 增加按钮 (高亮主色) -->
  <button class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-base font-bold text-white shadow-md shadow-indigo-500/20 transition-transform active:scale-90 hover:bg-indigo-500">
    +
  </button>
</div>
```

---

## ⚠️ 绝对避坑红线 (DO NOT)
- ❌ **严禁非等宽字体**：非 mono 字体数字变化时光标与按钮来回抖动，引发视觉疲劳与误触；
- ❌ **严禁点击靶心太小**：按钮物理展示若为 28px，必须使用 `p-2` 或外层包裹扩展至 $ge 40	ext{px}$ 真实触控面积；
- ❌ **严禁网络接口未防抖**：未做 debounce 会导致用户点击 5 次触发 5 次并发请求致使数据库死锁。

---

## 🔗 知识库关联与导航
- 深入触控靶心原则：[[01 - 菲茨定律 (Fitts's Law) 与触控靶心]]
- 结合移动表单体系：[[04 - Mobile Form & Input (移动端表单与键盘适配规范)]]
- 返回知识库总览：[[00 - UI Vibe Coding Compass (MOC)]]
