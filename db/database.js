const sqlite3 = require('sqlite3').verbose();

// Create a new database instance
const DBSOURCE = "db.sqlite"  // This will store our database in a file named db.sqlite

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text
        )`,
        (err) => {
            if (err) {
                // Table already created
                console.log("Table already exists.");
            } else {
                // Table just created, creating some rows
                const insert = 'INSERT INTO user (name) VALUES (?)';
                db.run(insert, ["Alice"]);
                db.run(insert, ["Bob"]);
            }
        });  
  }
});

module.exports = db;

