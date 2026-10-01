const fs = require('fs');
const path = require('path');
const { styles, FAMILIES, getFamilyForStyle, ROOT_DIR } = require('./vault-data.js');

function cleanFileName(num, name) {
  const cleanName = name
    .replace(/\(.*?\)/g, '')
    .replace(/[\/\\?%*:|"<>]/g, '')
    .trim();
  return `${num}. ${cleanName}.md`;
}

const FAMILY_COORDS = [
  { id: "f1", x: 0, y: 0, color: "4" },        // Modern Tech (Cyan/Blue)
  { id: "f2", x: 2200, y: 0, color: "5" },     // Glassmorphism (Purple)
  { id: "f3", x: 4400, y: 0, color: "1" },     // Cyber (Red/Pink)
  { id: "f4", x: 0, y: 1600, color: "6" },     // Pop (Yellow)
  { id: "f5", x: 2200, y: 1600, color: "3" },  // Cultural (Green)
  { id: "f6", x: 4400, y: 1600, color: "2" },  // Functional (Orange)
];

const nodes = [];
const edges = [];

// Create Family Group Nodes
FAMILIES.forEach((f, fIdx) => {
  const coord = FAMILY_COORDS[fIdx];
  const groupNode = {
    id: `group_${fIdx + 1}`,
    type: "group",
    x: coord.x,
    y: coord.y,
    width: 1900,
    height: 1350,
    label: `${f.id} (${f.nameZh})`,
    color: coord.color
  };
  nodes.push(groupNode);

  // Styles in this family
  const fStyles = styles.filter(s => {
    const n = parseInt(s.num, 10);
    return n >= f.range[0] && n <= f.range[1];
  });

  // Lay out the 5 styles in 2 rows: 3 on top, 2 on bottom
  fStyles.forEach((s, sIdx) => {
    const col = sIdx < 3 ? sIdx : sIdx - 3;
    const row = sIdx < 3 ? 0 : 1;
    const offsetX = 60 + col * 580;
    const offsetY = 80 + row * 620;

    const fileName = cleanFileName(s.num, s.name);
    const relativeFilePath = `01-风格库/${f.id}/${fileName}`;

    const styleNode = {
      id: `node_style_${s.num}`,
      type: "file",
      file: relativeFilePath,
      x: coord.x + offsetX,
      y: coord.y + offsetY,
      width: 520,
      height: 540,
      color: coord.color
    };
    nodes.push(styleNode);
  });
});

// Key Edges between complementary styles
const KEY_PAIRS = [
  { from: "01", to: "16", label: "波普撞色脉络" },
  { from: "02", to: "03", label: "极简黑白对照" },
  { from: "03", to: "26", label: "极客Bento构建" },
  { from: "06", to: "08", label: "空间景深演进" },
  { from: "07", to: "10", label: "拟物到黏土" },
  { from: "11", to: "27", label: "高能暗黑极速" },
  { from: "14", to: "22", label: "生态自然美学" },
  { from: "23", to: "24", label: "东方禅意与侘寂" },
  { from: "04", to: "25", label: "欧洲理性构成" },
  { from: "28", to: "06", label: "弥散光与拟玻" }
];

KEY_PAIRS.forEach((p, idx) => {
  edges.push({
    id: `edge_${idx + 1}`,
    fromNode: `node_style_${p.from}`,
    fromSide: "right",
    toNode: `node_style_${p.to}`,
    toSide: "left",
    label: p.label
  });
});

const canvasData = { nodes, edges };

fs.writeFileSync(
  path.join(ROOT_DIR, '05-可视化白板', '30-Styles-Universe.canvas'),
  JSON.stringify(canvasData, null, 2),
  'utf-8'
);

console.log(`Generated 30-Styles-Universe.canvas with ${nodes.length} nodes and ${edges.length} edges!`);
