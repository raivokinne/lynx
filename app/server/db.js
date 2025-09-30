import pkg from 'pg';
const { Pool } = pkg;

export let db;

export async function initDb() {
    try {
        db = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            max: 20,
		ssl: { rejectUnauthorized: false, },
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        await db.query('SELECT NOW()');

        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS codes (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                title TEXT,
                code TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS user_settings (
                id TEXT PRIMARY KEY,
                user_id TEXT UNIQUE NOT NULL,
                settings TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Failed to initialize database:", error);
        throw error;
    }
}

export async function closeDb() {
    if (db) {
        try {
            await db.end();
            console.log("Database connection closed");
        } catch (error) {
            console.warn("Error closing database:", error);
        }
    }
}
