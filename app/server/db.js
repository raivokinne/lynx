import pkg from "pg";
const { Pool } = pkg;

let dbInstance = null;
let initPromise = null;

export const getDb = () => {
    if (!dbInstance) {
        throw new Error("Database not initialized. Call initDb() first.");
    }
    return dbInstance;
};

export let db;

export async function initDb() {
    if (initPromise) {
        return initPromise;
    }

    initPromise = (async () => {
        try {
            console.log("Initializing database connection...");

            dbInstance = new Pool({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                max: 20,
		     ssl: {
    rejectUnauthorized: false,
  },
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            // Set the exported db variable
            db = dbInstance;

            // Test connection
            const result = await dbInstance.query("SELECT NOW()");
            console.log("Database connected successfully at:", result.rows[0].now);

            // Users table
            await dbInstance.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

            // Codes table
            await dbInstance.query(`
        CREATE TABLE IF NOT EXISTS codes (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          title TEXT,
          code TEXT NOT NULL,
          language TEXT DEFAULT 'cpp',
          description TEXT,
          is_deleted BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

            // User settings table
            await dbInstance.query(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id TEXT PRIMARY KEY,
          user_id TEXT UNIQUE NOT NULL,
          settings TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

            // Sessions table
            await dbInstance.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          token TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ip_address TEXT,
          user_agent TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

            await dbInstance.query(`
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)
      `);

            await dbInstance.query(`
        CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)
      `);

            await dbInstance.query(`
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
      `);

            // Shared codes table
            await dbInstance.query(`
        CREATE TABLE IF NOT EXISTS shared_codes (
          id TEXT PRIMARY KEY,
          code_id TEXT NOT NULL,
          share_token TEXT UNIQUE NOT NULL,
          is_public BOOLEAN DEFAULT false,
          view_count INTEGER DEFAULT 0,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (code_id) REFERENCES codes(id) ON DELETE CASCADE
        )
      `);

            await dbInstance.query(`
        CREATE INDEX IF NOT EXISTS idx_shared_codes_token ON shared_codes(share_token)
      `);

            await dbInstance.query(`
        CREATE INDEX IF NOT EXISTS idx_shared_codes_code_id ON shared_codes(code_id)
      `);

            // Code versions table
            await dbInstance.query(`
        CREATE TABLE IF NOT EXISTS code_versions (
          id TEXT PRIMARY KEY,
          code_id TEXT NOT NULL,
          code TEXT NOT NULL,
          title TEXT,
          version_number INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (code_id) REFERENCES codes(id) ON DELETE CASCADE
        )
      `);

            await dbInstance.query(`
        CREATE INDEX IF NOT EXISTS idx_code_versions_code_id ON code_versions(code_id)
      `);

            // Execution history table
            await dbInstance.query(`
        CREATE TABLE IF NOT EXISTS execution_history (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          code_id TEXT,
          success BOOLEAN NOT NULL,
          output TEXT,
          error TEXT,
          execution_time_ms INTEGER,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (code_id) REFERENCES codes(id) ON DELETE SET NULL
        )
      `);

            await dbInstance.query(`
        CREATE INDEX IF NOT EXISTS idx_execution_history_user_id ON execution_history(user_id)
      `);

            await dbInstance.query(`
        CREATE INDEX IF NOT EXISTS idx_execution_history_executed_at ON execution_history(executed_at)
      `);

            console.log("Database initialized successfully with all tables");
            return dbInstance;
        } catch (error) {
            console.error("Failed to initialize database:", error);
            dbInstance = null;
            db = null;
            initPromise = null;
            throw error;
        }
    })();

    return initPromise;
}

export async function closeDb() {
    if (dbInstance) {
        try {
            await dbInstance.end();
            dbInstance = null;
            db = null;
            initPromise = null;
            console.log("Database connection closed");
        } catch (error) {
            console.warn("Error closing database:", error);
        }
    }
}
