const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Read index.html and parse UI_STYLES
const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
const startTag = 'const UI_STYLES = [';
const endTag = '\n    ];\n\n    /* Application Global State */';

const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf(endTag, startIndex);
if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find UI_STYLES array');
  process.exit(1);
}

const code = html.slice(startIndex, endIndex + 6) + '\nmodule.exports = UI_STYLES;';
const sandbox = { module: {}, exports: {}, console, require, showToast: () => {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const styles = sandbox.module.exports;
console.log(`Parsed ${styles.length} styles from index.html.`);

// 2. Define the 6 Families
const FAMILIES = [
  {
    id: "01-现代极简与数字科技",
    nameEn: "Modern Tech & Minimalism",
    nameZh: "现代极简与数字科技",
    desc: "以克制、理性、高对比与纯粹排版为核心，专为极客、开发者与现代科技产品打造。",
    range: [1, 5]
  },
  {
    id: "02-玻璃拟物与空间深度",
    nameEn: "Glassmorphism & Depth",
    nameZh: "玻璃拟物与空间深度",
    desc: "探索光线折射、多层高斯模糊与三维触觉，专为空间计算、流媒体与温润体验设计。",
    range: [6, 10]
  },
  {
    id: "03-赛博科幻与未来主义",
    nameEn: "Cyber & Futuristic",
    nameZh: "赛博、科幻与未来主义",
    desc: "高能荧光、双色分离、战术全息与生态科幻，专为 Web3、极限科技与硬核极客打造。",
    range: [11, 15]
  },
  {
    id: "04-潮流趣味与青年文化",
    nameEn: "Pop & Playful",
    nameZh: "潮流、趣味与青年文化",
    desc: "波普撞色、反设计、多巴胺软糖与漫画波点，专为青年亚文化、治愈系与游戏设计。",
    range: [16, 20]
  },
  {
    id: "05-人文社科与东方意境",
    nameEn: "Cultural & Warmth",
    nameZh: "人文社科、复刻与东方意境",
    desc: "经典社论、大地自然、水墨禅意、日式侘寂与包豪斯，具有深沉的人文温度与哲学厚度。",
    range: [21, 25]
  },
  {
    id: "06-业务级功能专属",
    nameEn: "Functional & Specialized",
    nameZh: "业务级功能专属体系",
    desc: "Bento 网格、高频金融终端、极光流体、魔幻RPG与医疗生物，针对具体业务垂类深度优化。",
    range: [26, 30]
  }
];

// Helper: map style number to Family
function getFamilyForStyle(num) {
  const n = parseInt(num, 10);
  return FAMILIES.find(f => n >= f.range[0] && n <= f.range[1]);
}

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Initialize Directories
const DIRS = [
  '00-导航中枢',
  '01-风格库',
  ...FAMILIES.map(f => `01-风格库/${f.id}`),
  '02-设计资产',
  '03-组件蓝图',
  '04-AI助手预设',
  '05-可视化白板',
  '模版'
];

DIRS.forEach(d => ensureDir(path.join(ROOT_DIR, d)));
console.log('Directories initialized successfully.');

module.exports = { styles, FAMILIES, getFamilyForStyle, ROOT_DIR, ensureDir };
