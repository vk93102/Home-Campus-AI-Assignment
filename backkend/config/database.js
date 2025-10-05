const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor(dbPath = './database.db') {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error("Error connecting to SQLite database:", err.message);
            } else {
                console.log('Connected to the local SQLite database.');
            }
        });
    }

    // A promise-based wrapper for db.run
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // A promise-based wrapper for db.get
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
    
    // A promise-based wrapper for db.all
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    async setupTables() {
        const usersTable = `
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
          )
        `;
        const studentsTable = `
          CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            status TEXT,
            is_scholarship BOOLEAN,
            attendance_percentage REAL,
            assignment_score REAL,
            grade_point_average REAL,
            user_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
          )
        `;
        
        await this.run(usersTable);
        await this.run(studentsTable);
    }
}

module.exports = new Database();

