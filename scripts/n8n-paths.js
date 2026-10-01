const os = require('node:os');
const path = require('node:path');

function n8nUserFolder() {
  return path.resolve(process.env.N8N_USER_FOLDER || path.join(os.homedir(), '.n8n'));
}

function n8nDatabasePath(filename = 'database.sqlite') {
  return path.join(n8nUserFolder(), filename);
}

function loadSqlite3() {
  if (process.env.SQLITE3_MODULE_PATH) {
    return require(path.resolve(process.env.SQLITE3_MODULE_PATH));
  }

  const bundledPath = path.resolve(__dirname, '../.runtime/n8n-app/node_modules/sqlite3');
  try {
    return require(bundledPath);
  } catch {
    try {
      return require(require.resolve('sqlite3', { paths: [path.resolve(__dirname, '..')] }));
    } catch {
      throw new Error('sqlite3 was not found. Set SQLITE3_MODULE_PATH or install it in the project runtime.');
    }
  }
}

module.exports = { loadSqlite3, n8nDatabasePath, n8nUserFolder };
