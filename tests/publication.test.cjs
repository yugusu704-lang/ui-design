const assert = require('node:assert/strict');
const test = require('node:test');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

test('published source excludes machine paths and local application data', () => {
  const root = path.resolve(__dirname, '..');
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  for (const file of files) {
    assert.doesNotMatch(file, /(^|\/)(node_modules|dist|data|verification|\.runtime)(\/|$)|(^|\/)\.env(?:\.|$)|\.sqlite(?:-|$)/, file);
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.equal(/\b[A-Z]:[\\/]|file:\/\/\/|[\\/]Users[\\/]|[\\/]home[\\/]/.test(source), false, `Machine-specific path in ${file}`);
  }
});
