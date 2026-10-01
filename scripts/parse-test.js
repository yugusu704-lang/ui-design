const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf-8');
const startTag = 'const UI_STYLES = [';
const endTag = '\n    ];\n\n    /* Application Global State */';

const startIndex = html.indexOf(startTag);
const endIndex = html.indexOf(endTag, startIndex);

console.log("Found indices:", startIndex, endIndex);

const code = html.slice(startIndex, endIndex + 6) + '\nmodule.exports = UI_STYLES;';
const sandbox = { module: {}, exports: {}, console, require, showToast: () => {} };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const styles = sandbox.module.exports;
console.log(`Successfully parsed ${styles.length} styles!`);
styles.forEach(s => {
  console.log(`[${s.num}] ${s.name} (${s.nameZh}) - [${s.category} / ${s.categoryZh}]`);
});
