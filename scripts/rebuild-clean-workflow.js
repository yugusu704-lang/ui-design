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

const matcherJs = [
  '// 内置全量 30 种风格数据字典',
  'const STYLES_DB = ' + JSON.stringify(stylesPayload) + ';',
  '',
  'const inputItem = $input.first().json;',
  'const body = inputItem.body || inputItem.query || inputItem;',
  'const query = (body.query || body.text || body.keyword || "").toString();',
  '',
  'let bestMatch = STYLES_DB[0];',
  'let maxScore = -1;',
  '',
  'for (const s of STYLES_DB) {',
  '  let score = 0;',
  '  const text = (s.name + " " + s.nameZh + " " + s.subtitle + " " + s.bestFor + " " + s.philosophy + " " + s.categoryZh).toLowerCase();',
  '',
  '  // 1. 英文单词精确匹配',
  '  const words = query.toLowerCase().split(/[^a-z0-9]+/);',
  '  for (const w of words) {',
  '    if (w.length >= 3 && text.includes(w)) score += 10;',
  '  }',
  '',
  '  // 2. 中文 2-gram 窗口滑动精确语义匹配',
  '  const cleanZh = query.replace(/[^\\u4e00-\\u9fa5]/g, "");',
  '  for (let i = 0; i < cleanZh.length - 1; i++) {',
  '    const gram = cleanZh.slice(i, i + 2);',
  '    if (s.nameZh.includes(gram)) score += 20;',
  '    else if (s.bestFor.includes(gram)) score += 10;',
  '    else if (s.subtitle.includes(gram)) score += 6;',
  '    else if (s.philosophy.includes(gram)) score += 3;',
  '  }',
  '',
  '  if (score > maxScore) {',
  '    maxScore = score;',
  '    bestMatch = s;',
  '  }',
  '}',
  '',
  'const quickPrompt = "【UI 设计风格指令 - #" + bestMatch.num + " " + bestMatch.name + " (" + bestMatch.nameZh + ")】\\n" +',
  '  "请按照 " + bestMatch.name + " 风格规范编写移动端界面：\\n" +',
  '  "1. 核心调性：" + bestMatch.subtitle + "\\n" +',
  '  "2. 色彩要求：主色采用 " + bestMatch.colors.map(c => c.name + " (" + c.hex + ")").join("、") + "；\\n" +',
  '  "3. 几何与阴影规则：\\n" + bestMatch.cssSnippet + "\\n" +',
  '  "4. 提示词参考：" + bestMatch.prompt;',
  '',
  'const noteCleanName = bestMatch.name.replace(/\\(.*?\\)/g, "").replace(/[\\/\\\\?%*:|"<>]/g, "").trim();',
  'const localPath = "01-风格库/" + bestMatch.familyId + "/" + bestMatch.num + ". " + noteCleanName + ".md";',
  '',
  'return [{',
  '  json: {',
  '    status: "success",',
  '    query: query,',
  '    matchScore: maxScore,',
  '    matchedStyle: {',
  '      num: bestMatch.num,',
  '      name: bestMatch.name,',
  '      nameZh: bestMatch.nameZh,',
  '      family: bestMatch.family,',
  '      subtitle: bestMatch.subtitle,',
  '      bestFor: bestMatch.bestFor,',
  '      primaryColor: (bestMatch.colors[0] ? bestMatch.colors[0].hex : "#000000"),',
  '      colors: bestMatch.colors,',
  '      cssSnippet: bestMatch.cssSnippet',
  '    },',
  '    quickVibePromptBlock: quickPrompt,',
  '    localObsidianPath: localPath',
  '  }',
  '}];'
].join('\n');

// 1. 直接更新 SQLite 数据库
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
        n.parameters.jsCode = matcherJs;
      }
      if (n.type === 'n8n-nodes-base.webhook') {
        n.parameters.responseMode = 'responseNode';
      }
    });
    db.run("UPDATE workflow_entity SET nodes = ? WHERE id = ?", [JSON.stringify(nodes), r.id]);
    console.log("Updated workflow row in SQLite: " + r.id);
  });
  setTimeout(() => {
    db.close();
    console.log("Database update committed.");
  }, 500);
});

// 2. 生成纯净的 workflow JSON 文件
const cleanWorkflow = {
  name: "UI Vibe Coding Brain - Query API",
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "ui-brain-query",
        responseMode: "responseNode",
        options: {}
      },
      id: "node-webhook",
      name: "接收 UI 设计诉求 (Webhook)",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [240, 300],
      webhookId: "ui-brain-query"
    },
    {
      parameters: {
        jsCode: matcherJs
      },
      id: "node-code-matcher",
      name: "本地知识库语义检索 (纯 JS 内存匹配)",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [480, 300]
    },
    {
      parameters: {
        respondWith: "json",
        responseBody: "={{ $json }}",
        options: {}
      },
      id: "node-respond",
      name: "返回三阶交付包 (JSON/Prompt)",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [720, 300]
    }
  ],
  connections: {
    "接收 UI 设计诉求 (Webhook)": {
      main: [
        [
          {
            node: "本地知识库语义检索 (纯 JS 内存匹配)",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "本地知识库语义检索 (纯 JS 内存匹配)": {
      main: [
        [
          {
            node: "返回三阶交付包 (JSON/Prompt)",
            type: "main",
            index: 0
          }
        ]
      ]
    }
  },
  pinData: {},
  settings: {
    executionOrder: "v1"
  }
};

fs.writeFileSync(path.resolve(__dirname, "../n8n-workflows/ui-brain-query-workflow.json"), JSON.stringify(cleanWorkflow, null, 2), "utf-8");
console.log("Clean workflow JSON generated successfully.");
