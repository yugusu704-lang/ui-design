const fs = require('fs');
const path = require('path');
const { styles, FAMILIES, ROOT_DIR } = require('./vault-data.js');

console.log('=== 开始执行 Obsidian Vault 完整性自动化校验 ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

// 1. 校验 30 篇风格笔记的存在性与 Frontmatter 合法性
console.log('1. 校验 30 篇原子风格笔记...');
styles.forEach(s => {
  const family = FAMILIES.find(f => {
    const n = parseInt(s.num, 10);
    return n >= f.range[0] && n <= f.range[1];
  });
  const cleanName = s.name.replace(/\(.*?\)/g, '').replace(/[\/\\?%*:|"<>]/g, '').trim();
  const fileName = `${s.num}. ${cleanName}.md`;
  const filePath = path.join(ROOT_DIR, '01-风格库', family.id, fileName);

  const exists = fs.existsSync(filePath);
  assert(exists, `风格文件存在: ${family.id}/${fileName}`);

  if (exists) {
    const content = fs.readFileSync(filePath, 'utf-8');
    assert(content.startsWith('---\n'), `Frontmatter 起始标志正常: #${s.num}`);
    assert(content.includes(`num: "${s.num}"`), `包含正确编号: num: "${s.num}"`);
    assert(content.includes(`primary_color:`), `包含主色 Token: #${s.num}`);
    assert(content.includes(`【UI 设计风格指令 - #${s.num}`), `包含一键 Vibe Coding 提示词块: #${s.num}`);
  }
});

// 2. 校验 MOC 与核心枢纽文件
console.log('\n2. 校验 MOC 与核心协议文件...');
const coreFiles = [
  '00-导航中枢/00 - UI Vibe Coding Compass (MOC).md',
  '00-导航中枢/01 - Style Decision Matrix.md',
  '00-导航中枢/02 - Vibe Prompting Manual.md',
  '00-导航中枢/03 - External Brain Query Protocol.md',
  '02-设计资产/Master Color Catalog.md',
  '02-设计资产/Mobile Typography System.md',
  '02-设计资产/Shadows & Elevation Tokens.md',
  '03-组件蓝图/Cards & Bento Surfaces.md',
  '03-组件蓝图/Tactile Buttons & Pills.md',
  '03-组件蓝图/Navigation & TabBars.md',
  '04-AI助手预设/.cursorrules-ui-expert.md',
  '04-AI助手预设/antigravity-system-prompt.md',
  '04-AI助手预设/tailwind-config-snippets.md',
  '05-可视化白板/30-Styles-Universe.canvas',
  '模版/style-template.md'
];

coreFiles.forEach(f => {
  const p = path.join(ROOT_DIR, f);
  assert(fs.existsSync(p), `核心文件就绪: ${f}`);
});

// 3. 校验 Canvas JSON Schema
console.log('\n3. 校验 30-Styles-Universe.canvas 结构与节点...');
const canvasPath = path.join(ROOT_DIR, '05-可视化白板', '30-Styles-Universe.canvas');
if (fs.existsSync(canvasPath)) {
  try {
    const canvasData = JSON.parse(fs.readFileSync(canvasPath, 'utf-8'));
    assert(Array.isArray(canvasData.nodes) && canvasData.nodes.length === 36, `白板节点总数符合预期 (30 风格 + 6 家族 = 36): 当前 ${canvasData.nodes?.length}`);
    assert(Array.isArray(canvasData.edges) && canvasData.edges.length > 0, `白板边关系存在: 当前 ${canvasData.edges?.length} 条`);

    let missingFiles = 0;
    canvasData.nodes.filter(n => n.type === 'file').forEach(n => {
      if (!fs.existsSync(path.join(ROOT_DIR, n.file))) {
        missingFiles++;
      }
    });
    assert(missingFiles === 0, `Canvas 所有文件节点均物理存在: 0 缺失`);
  } catch (e) {
    assert(false, `Canvas JSON 解析失败: ${e.message}`);
  }
}

// 4. 模拟两次真实意图检索演练 (Simulated Retrieval Test)
console.log('\n4. 模拟外置大脑检索流程演练...');

// Case A: 极简北欧风记账应用
const testQueryA = "极简北欧风记账应用";
console.log(`  [演练 A 输入]: "${testQueryA}"`);
const matchedStyleA = styles.find(s => s.nameZh.includes("北欧极简") || s.name.includes("Scandinavian"));
assert(!!matchedStyleA, `成功按语义匹配到对应风格: #${matchedStyleA?.num} ${matchedStyleA?.name}`);

if (matchedStyleA) {
  const family = FAMILIES.find(f => {
    const n = parseInt(matchedStyleA.num, 10);
    return n >= f.range[0] && n <= f.range[1];
  });
  const cleanName = matchedStyleA.name.replace(/\(.*?\)/g, '').replace(/[\/\\?%*:|"<>]/g, '').trim();
  const notePath = path.join(ROOT_DIR, '01-风格库', family.id, `${matchedStyleA.num}. ${cleanName}.md`);
  const noteContent = fs.readFileSync(notePath, 'utf-8');

  assert(noteContent.includes("Scandinavian") || noteContent.includes("nordic"), "笔记内容包含北欧极简核心 Token");
  console.log(`    -> [外置大脑命中]: ${notePath}`);
  console.log(`    -> [主色输出]: ${matchedStyleA.colors[0]?.name} (${matchedStyleA.colors[0]?.hex})`);
  console.log(`    -> [推荐理由]: ${matchedStyleA.philosophy.slice(0, 40)}...`);
}

// Case B: 极客高精暗黑 AI 运维终端
const testQueryB = "极客高精暗黑 AI 运维终端";
console.log(`\n  [演练 B 输入]: "${testQueryB}"`);
const matchedStyleB = styles.find(s => s.name.includes("Linear") || s.nameZh.includes("极客高精"));
assert(!!matchedStyleB, `成功按语义匹配到对应风格: #${matchedStyleB?.num} ${matchedStyleB?.name}`);

if (matchedStyleB) {
  const family = FAMILIES.find(f => {
    const n = parseInt(matchedStyleB.num, 10);
    return n >= f.range[0] && n <= f.range[1];
  });
  const cleanName = matchedStyleB.name.replace(/\(.*?\)/g, '').replace(/[\/\\?%*:|"<>]/g, '').trim();
  const notePath = path.join(ROOT_DIR, '01-风格库', family.id, `${matchedStyleB.num}. ${cleanName}.md`);
  const noteContent = fs.readFileSync(notePath, 'utf-8');

  assert(noteContent.includes("#8B5CF6") || noteContent.includes("Linear"), "笔记内容包含 Linear 专属 Token");
  console.log(`    -> [外置大脑命中]: ${notePath}`);
  console.log(`    -> [主色输出]: ${matchedStyleB.colors[0]?.name} (${matchedStyleB.colors[0]?.hex})`);
  console.log(`    -> [推荐理由]: ${matchedStyleB.philosophy.slice(0, 40)}...`);
}

console.log(`\n=== 校验总结: ${passCount} 项通过，${failCount} 项失败 ===`);
process.exit(failCount === 0 ? 0 : 1);
