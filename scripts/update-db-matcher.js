const fs = require('fs');
const path = require('path');
const { loadSqlite3, n8nDatabasePath } = require('./n8n-paths.js');
const sqlite3 = loadSqlite3();
const { styles, FAMILIES } = require('./vault-data.js');

const stylesPayload = styles.map(s => {
  const family = FAMILIES.find(f => {
    const n = parseInt(s.num, 10);
    return n >= f.range[0] && n <= f.range[1];
  });
  return {
    num: s.num,
    name: s.name,
    nameZh: s.nameZh,
    category: s.category,
    categoryZh: s.categoryZh,
    family: family ? family.nameZh : "",
    familyId: family ? family.id : "",
    subtitle: s.subtitle,
    philosophy: s.philosophy,
    bestFor: s.bestFor,
    keywords: s.keywords,
    colors: s.colors,
    prompt: s.prompt,
    cssSnippet: s.cssSnippet
  };
});

const matcherCode = `// 内置全量 30 种风格数据字典
const STYLES_DB = ${JSON.stringify(stylesPayload)};

const inputItem = $input.first().json;
const body = inputItem.body || inputItem.query || inputItem;
const query = (body.query || body.text || body.keyword || "").toString();

let bestMatch = STYLES_DB[0];
let maxScore = -1;

for (const s of STYLES_DB) {
  let score = 0;
  const text = (s.name + " " + s.nameZh + " " + s.subtitle + " " + s.bestFor + " " + s.philosophy + " " + s.categoryZh).toLowerCase();

  // 1. 英文单词精确匹配
  const words = query.toLowerCase().split(/[^a-z0-9]+/);
  for (const w of words) {
    if (w.length >= 3 && text.includes(w)) score += 10;
  }

  // 2. 中文 2-gram 窗口滑动精准语义匹配
  const cleanZh = query.replace(/[^\\u4e00-\\u9fa5]/g, "");
  for (let i = 0; i < cleanZh.length - 1; i++) {
    const gram = cleanZh.slice(i, i + 2);
    if (s.nameZh.includes(gram)) score += 20;
    else if (s.bestFor.includes(gram)) score += 10;
    else if (s.subtitle.includes(gram)) score += 6;
    else if (s.philosophy.includes(gram)) score += 3;
  }

  if (score > maxScore) {
    maxScore = score;
    bestMatch = s;
  }
}

return [{
  json: {
    status: "success",
    query: query,
    matchScore: maxScore,
    matchedStyle: {
      num: bestMatch.num,
      name: bestMatch.name,
      nameZh: bestMatch.nameZh,
      family: bestMatch.family,
      subtitle: bestMatch.subtitle,
      bestFor: bestMatch.bestFor,
      primaryColor: bestMatch.colors[0] ? bestMatch.colors[0].hex : "#000000",
      colors: bestMatch.colors,
      cssSnippet: bestMatch.cssSnippet
    },
    quickVibePromptBlock: \`【UI 设计风格指令 - #\${bestMatch.num} \${bestMatch.name} (\${bestMatch.nameZh})】\\n请按照 \${bestMatch.name} 风格规范编写移动端界面：\\n1. 核心调性：\${bestMatch.subtitle}\\n2. 色彩要求：主色采用 \${bestMatch.colors.map(c => c.name + ' (' + c.hex + ')').join('、')}；\\n3. 几何与阴影规则：\\n\${bestMatch.cssSnippet}\\n4. 提示词参考：\${bestMatch.prompt}\`,
    localObsidianPath: \`01-风格库/\${bestMatch.familyId}/\${bestMatch.num}. \${bestMatch.name.replace(/\\(.*?\\)/g, '').replace(/[\\/\\\\?%*:|"<>]/g, '').trim()}.md\`
  }
}];`;

// 1. 更新数据库
const db = new sqlite3.Database(n8nDatabasePath());
db.all("SELECT id, nodes FROM workflow_entity", (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  rows.forEach(r => {
    let nodes = JSON.parse(r.nodes);
    nodes.forEach(n => {
      if (n.type === 'n8n-nodes-base.code') {
        n.parameters.jsCode = matcherCode;
      }
      if (n.type === 'n8n-nodes-base.webhook') {
        n.parameters.responseMode = 'responseNode';
      }
    });
    db.run("UPDATE workflow_entity SET nodes = ? WHERE id = ?", [JSON.stringify(nodes), r.id], () => {
      console.log("Updated workflow in sqlite: " + r.id);
    });
  });
  setTimeout(() => {
    db.close();
    console.log("Database update done!");
  }, 1000);
});

// 2. 更新工作流 JSON 文件
const wfPath = path.resolve(__dirname, '../n8n-workflows/ui-brain-query-workflow.json');
let content = fs.readFileSync(wfPath, 'utf-8'); if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1); const wf = JSON.parse(content);
wf.nodes.forEach(n => {
  if (n.type === 'n8n-nodes-base.code') {
    n.parameters.jsCode = matcherCode;
  }
  if (n.type === 'n8n-nodes-base.webhook') {
    n.parameters.responseMode = 'responseNode';
  }
});
fs.writeFileSync(wfPath, JSON.stringify(wf, null, 2), 'utf-8');
console.log("JSON template updated!");

