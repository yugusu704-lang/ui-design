const { loadSqlite3, n8nDatabasePath } = require('./n8n-paths.js');
const sqlite3 = loadSqlite3();
const db = new sqlite3.Database(n8nDatabasePath());
db.all("SELECT id, name, active, nodes FROM workflow_entity", (err, rows) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  rows.forEach(r => {
    console.log("ID:", r.id, "Name:", r.name, "Active:", r.active);
    const nodes = JSON.parse(r.nodes);
    nodes.forEach(n => {
      console.log(" Node:", n.name, "Type:", n.type, "Params:", JSON.stringify(n.parameters));
    });
  });
  db.close();
});
