const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const dir = path.join(ROOT_DIR, 'n8n-workflows');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// A standard n8n workflow export JSON schema
const workflow = {
  name: "UI Vibe Coding Brain - Query API",
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "ui-brain-query",
        responseMode: "lastNode",
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
        jsCode: `// 获取用户输入的检索词或意图
const body = $input.first().json.body || $input.first().json;
const query = (body.query || body.text || "").toLowerCase();

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.env.UI_DESIGN_REPO_DIR || process.cwd();
const { styles, FAMILIES } = require(path.join(ROOT_DIR, 'scripts', 'vault-data.js'));

// 简单关键词加权匹配算法
let bestMatch = styles[0];
let maxScore = -1;

for (const s of styles) {
  let score = 0;
  if (query.includes(s.name.toLowerCase())) score += 10;
  if (query.includes(s.nameZh.toLowerCase())) score += 10;
  if (query.includes(s.category.toLowerCase())) score += 3;
  if (query.includes(s.categoryZh.toLowerCase())) score += 3;
  for (const kw of s.keywords) {
    if (query.includes(kw.toLowerCase())) score += 2;
  }
  for (const bf of s.bestFor.split(/[、,]/)) {
    if (query.includes(bf.trim())) score += 5;
  }
  if (score > maxScore) {
    maxScore = score;
    bestMatch = s;
  }
}

// 提取该风格对应的 Markdown 笔记内容
const family = FAMILIES.find(f => {
  const n = parseInt(bestMatch.num, 10);
  return n >= f.range[0] && n <= f.range[1];
});
const cleanName = bestMatch.name.replace(/\\(.*?\\)/g, '').replace(/[\\/\\\\?%*:|"<>]/g, '').trim();
const relativeNotePath = ['01-风格库', family.id, bestMatch.num + '. ' + cleanName + '.md'].join('/');
const notePath = path.join(ROOT_DIR, ...relativeNotePath.split('/'));
let noteMarkdown = "";
try {
  noteMarkdown = fs.readFileSync(notePath, 'utf-8');
} catch (e) {
  noteMarkdown = "Note read error: " + e.message;
}

return [{
  json: {
    query: query,
    matchScore: maxScore,
    matchedStyle: {
      num: bestMatch.num,
      name: bestMatch.name,
      nameZh: bestMatch.nameZh,
      family: family.nameZh,
      subtitle: bestMatch.subtitle,
      bestFor: bestMatch.bestFor,
      colors: bestMatch.colors,
      prompt: bestMatch.prompt,
      cssSnippet: bestMatch.cssSnippet,
      notePath: relativeNotePath
    },
    quickVibePromptBlock: "【UI 设计风格指令 - #" + bestMatch.num + " " + bestMatch.name + "】\\n" + bestMatch.prompt,
    markdownDoc: noteMarkdown
  }
}];`
      },
      id: "node-code-matcher",
      name: "本地知识库语义检索 (Node.js)",
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
            node: "本地知识库语义检索 (Node.js)",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "本地知识库语义检索 (Node.js)": {
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

fs.writeFileSync(path.join(dir, 'ui-brain-query-workflow.json'), JSON.stringify(workflow, null, 2), 'utf-8');
console.log('Sample workflow exported to n8n-workflows/ui-brain-query-workflow.json');
