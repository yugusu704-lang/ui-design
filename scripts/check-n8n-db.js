const { loadSqlite3, n8nDatabasePath } = require('./n8n-paths.js');
const sqlite3 = loadSqlite3();
const db = new sqlite3.Database(n8nDatabasePath('n8n.sqlite'));
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Tables:", rows.map(r => r.name));
  db.close();
});
