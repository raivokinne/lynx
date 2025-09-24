import sqlite3 from "sqlite3";
import { open } from "sqlite";

export let db;

export async function initDb() {
    db = await open({
        filename: "./db.sqlite",
        driver: sqlite3.Database,
    });

    await db.exec(`
CREATE TABLE IF NOT EXISTS users (
id TEXT PRIMARY KEY,
username TEXT UNIQUE NOT NULL,
password TEXT NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

    await db.exec(`
CREATE TABLE IF NOT EXISTS codes (
id TEXT PRIMARY KEY,
user_id TEXT,
title TEXT,
code TEXT NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
`);
    await db.exec(`
  CREATE TABLE IF NOT EXISTS user_settings (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    settings TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
  `);
}
