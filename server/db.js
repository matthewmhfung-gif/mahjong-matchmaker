const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'mahjong.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    skill_level TEXT NOT NULL CHECK(skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    variant TEXT NOT NULL CHECK(variant IN ('American', 'Japanese Riichi', 'Hong Kong', 'Chinese Classical')),
    availability TEXT NOT NULL DEFAULT '[]',
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date_time TEXT NOT NULL,
    variant TEXT NOT NULL CHECK(variant IN ('American', 'Japanese Riichi', 'Hong Kong', 'Chinese Classical')),
    skill_requirement TEXT NOT NULL CHECK(skill_requirement IN ('Beginner', 'Intermediate', 'Advanced', 'Expert', 'Any')),
    max_players INTEGER DEFAULT 4,
    location TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS session_players (
    session_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (session_id, player_id),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
  );
`);

// Migrate existing DBs that predate the location column
const cols = db.prepare('PRAGMA table_info(sessions)').all().map((c) => c.name);
if (!cols.includes('location')) {
  db.exec("ALTER TABLE sessions ADD COLUMN location TEXT DEFAULT ''");
}

module.exports = db;
