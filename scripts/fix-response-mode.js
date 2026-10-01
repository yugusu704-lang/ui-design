const { loadSqlite3, n8nDatabasePath } = require('./n8n-paths.js');
const sqlite3 = loadSqlite3();
const db = new sqlite3.Database(n8nDatabasePath());

db.all("SELECT id, nodes FROM workflow_entity", (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  let updatedCount = 0;
  rows.forEach(r => {
    let nodesStr = r.nodes;
    if (nodesStr.includes('"responseMode":"lastNode"')) {
      nodesStr = nodesStr.replace(/"responseMode":"lastNode"/g, '"responseMode":"responseNode"');
      db.run("UPDATE workflow_entity SET nodes = ? WHERE id = ?", [nodesStr, r.id], (uErr) => {
        if (uErr) console.error("Update error for " + r.id, uErr);
        else console.log("Updated workflow " + r.id + " responseMode to responseNode");
      });
      updatedCount++;
    }
  });
  setTimeout(() => {
    db.close();
    console.log("DB update finished. Total updated:", updatedCount);
  }, 1000);
});
