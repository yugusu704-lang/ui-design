/**
 * rename-to-chinese.js
 * 将 Vault 所有顶层文件夹与风格家族子文件夹重命名为中文，
 * 并同步更新所有 .md 文件中的 Wiki 链接 + Canvas JSON 文件路径引用。
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ──────────────────────────────────────────────────────────
// 1. 重命名映射表（英文旧名 → 中文新名）
// ──────────────────────────────────────────────────────────

/** 顶层文件夹 */
const TOP_DIRS = [
  { old: '00-Index & MOC',           new: '00-导航中枢' },
  { old: '01-Styles',                new: '01-风格库' },
  { old: '02-Design Tokens',         new: '02-设计资产' },
  { old: '03-Component Blueprints',  new: '03-组件蓝图' },
  { old: '04-Agent Presets & Rules', new: '04-AI助手预设' },
  { old: '05-Visual Canvas',         new: '05-可视化白板' },
  { old: 'templates',                new: '模版' },
];

/** 风格家族子文件夹（位于 01-风格库/ 下）  */
const FAMILY_DIRS = [
  { old: '01 - Modern Tech & Minimalism', new: '01-现代极简与数字科技' },
  { old: '02 - Glassmorphism & Depth',    new: '02-玻璃拟物与空间深度' },
  { old: '03 - Cyber & Futuristic',       new: '03-赛博科幻与未来主义' },
  { old: '04 - Pop & Playful',            new: '04-潮流趣味与青年文化' },
  { old: '05 - Cultural & Warmth',        new: '05-人文社科与东方意境' },
  { old: '06 - Functional & Specialized', new: '06-业务级功能专属' },
];

// ──────────────────────────────────────────────────────────
// 2. 构建完整替换字典（路径片段级别，用于文本替换）
// ──────────────────────────────────────────────────────────

/**
 * replaceMap 的 key   = 旧路径片段（出现在 .md 链接或 canvas JSON 的 file 字段中）
 * replaceMap 的 value = 新路径片段
 * 排序：先替换最长的字符串，避免短串干扰长串。
 */
const replaceMap = {};

// 顶层 → 直接加入
for (const { old: o, new: n } of TOP_DIRS) {
  replaceMap[o] = n;
}

// 家族子文件夹 → 包含两种形式（旧顶层/旧家族 和 新顶层/旧家族）
const oldStylesTop = '01-Styles';
const newStylesTop = '01-风格库';
for (const { old: o, new: n } of FAMILY_DIRS) {
  replaceMap[`${oldStylesTop}/${o}`] = `${newStylesTop}/${n}`;
  replaceMap[`${newStylesTop}/${o}`] = `${newStylesTop}/${n}`; // 幂等
  replaceMap[o] = n; // 纯文件夹名（Canvas group label 等场景）
}

// 按长度降序排列，保证长串优先替换
const sortedKeys = Object.keys(replaceMap).sort((a, b) => b.length - a.length);

function replaceAll(content) {
  let result = content;
  for (const key of sortedKeys) {
    // 转义正则特殊字符
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), replaceMap[key]);
  }
  return result;
}

// ──────────────────────────────────────────────────────────
// 3. 递归收集所有需要更新内容的文件（先做内容替换，再做物理重命名）
// ──────────────────────────────────────────────────────────

function collectFiles(dir, exts) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.')) result.push(...collectFiles(full, exts));
    } else if (exts.some(e => entry.name.endsWith(e))) {
      result.push(full);
    }
  }
  return result;
}

// ── 步骤 A：更新所有 .md 和 .canvas 文件的内容 ──────────
console.log('\n[Step A] 更新所有文件内容中的路径引用…');
const contentFiles = collectFiles(ROOT, ['.md', '.canvas']);
let contentUpdated = 0;
for (const file of contentFiles) {
  const original = fs.readFileSync(file, 'utf-8');
  const updated  = replaceAll(original);
  if (original !== updated) {
    fs.writeFileSync(file, updated, 'utf-8');
    console.log(`  ✏️  已更新: ${path.relative(ROOT, file)}`);
    contentUpdated++;
  }
}
console.log(`  → 共更新 ${contentUpdated} 个文件的内部引用。`);

// ── 步骤 B：重命名家族子文件夹（先重命名子级，再重命名父级）──
console.log('\n[Step B] 重命名风格家族子文件夹…');
const stylesParentOld = path.join(ROOT, oldStylesTop);
const stylesParentNew = path.join(ROOT, newStylesTop); // 可能还不存在，先用旧名操作

for (const { old: o, new: n } of FAMILY_DIRS) {
  const oldPath = path.join(stylesParentOld, o);
  const newPath = path.join(stylesParentOld, n); // 父文件夹还用旧名
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`  📁 ${o}  →  ${n}`);
  } else {
    console.log(`  ⚠️  跳过（不存在）: ${o}`);
  }
}

// ── 步骤 C：重命名顶层文件夹 ──────────────────────────────
console.log('\n[Step C] 重命名顶层文件夹…');
for (const { old: o, new: n } of TOP_DIRS) {
  const oldPath = path.join(ROOT, o);
  const newPath = path.join(ROOT, n);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`  📁 ${o}  →  ${n}`);
  } else if (fs.existsSync(newPath)) {
    console.log(`  ✅ 已是中文名，跳过: ${n}`);
  } else {
    console.log(`  ⚠️  跳过（不存在）: ${o}`);
  }
}

// ── 步骤 D：更新 README.md 中的路径引用（根目录层级）──────
console.log('\n[Step D] 更新根目录 README.md 引用…');
const readmePath = path.join(ROOT, 'README.md');
if (fs.existsSync(readmePath)) {
  const original = fs.readFileSync(readmePath, 'utf-8');
  const updated  = replaceAll(original);
  if (original !== updated) {
    fs.writeFileSync(readmePath, updated, 'utf-8');
    console.log('  ✏️  README.md 已更新。');
  } else {
    console.log('  ✅ README.md 无需更新。');
  }
}

// ── 步骤 E：更新 scripts/vault-data.js 中的家族 id 字段 ──
console.log('\n[Step E] 更新 scripts/vault-data.js 中的 FAMILIES 配置…');
const vaultDataPath = path.join(ROOT, 'scripts', 'vault-data.js');
if (fs.existsSync(vaultDataPath)) {
  let vd = fs.readFileSync(vaultDataPath, 'utf-8');
  vd = replaceAll(vd);
  fs.writeFileSync(vaultDataPath, vd, 'utf-8');
  console.log('  ✏️  vault-data.js 已更新。');
}

console.log('\n[完成] 所有文件夹已重命名为中文，内部引用已全量同步。\n');
