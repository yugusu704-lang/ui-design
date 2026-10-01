const fs = require('fs');
const path = require('path');
const { styles, FAMILIES } = require('./vault-data.js');

// 预打包好的 30 种风格数据字典
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

const workflow = {
  name: "UI Vibe Coding Brain - Query API (Self-Contained)",
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
        jsCode: `// 内置全量 30 种风格数据字典 (零外部依赖，100% 稳定运行)
const STYLES_DB = ${JSON.stringify(stylesPayload, null, 2)};

// 提取用户传入的参数 (支持 GET query 参数 或 POST JSON body)
const inputItem = $input.first().json;
const body = inputItem.body || inputItem.query || inputItem;
const query = (body.query || body.text || body.keyword || "").toLowerCase();

let bestMatch = STYLES_DB[0];
let maxScore = -1;

for (const s of STYLES_DB) {
  let score = 0;
  if (query.includes(s.name.toLowerCase())) score += 10;
  if (query.includes(s.nameZh.toLowerCase())) score += 10;
  if (query.includes(s.category.toLowerCase())) score += 3;
  if (query.includes(s.categoryZh.toLowerCase())) score += 3;
  for (const kw of s.keywords) {
    if (query.includes(kw.toLowerCase())) score += 2;
  }
  for (const bf of s.bestFor.split(/[、,，]/)) {
    if (query.includes(bf.trim())) score += 5;
  }
  if (score > maxScore) {
    maxScore = score;
    bestMatch = s;
  }
}

// 格式化输出三阶交付包
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
    quickVibePromptBlock: \`【UI 设计风格指令 - #\${bestMatch.num} \${bestMatch.name} (\${bestMatch.nameZh})】
请按照 \${bestMatch.name} 风格规范编写移动端界面：
1. 核心调性：\${bestMatch.subtitle}
2. 色彩要求：主色采用 \${bestMatch.colors.map(c => c.name + ' (' + c.hex + ')').join('、')}；
3. 几何与阴影规则：
\${bestMatch.cssSnippet}
4. 提示词参考：\${bestMatch.prompt}\`,
    localObsidianPath: \`01-风格库/\${bestMatch.familyId}/\${bestMatch.num}. \${bestMatch.name.replace(/\\(.*?\\)/g, '').replace(/[\\/\\\\?%*:|"<>]/g, '').trim()}.md\`
  }
}];`
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

fs.writeFileSync(path.resolve(__dirname, '../n8n-workflows/ui-brain-query-workflow.json'), JSON.stringify(workflow, null, 2), 'utf-8');
console.log('Self-contained workflow updated successfully!');
