import pkg from "pg";
const { Pool } = pkg;
import logger from "../../logger.js";

// PostgreSQL connection pool singleton
let poolInstance = null;
let initPromise = null;

// Get database pool instance - throws if not initialized
export const getPool = () => {
  if (!poolInstance) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return poolInstance;
};

// Database query helper - wraps pool queries
export const db = {
  query: (...args) => poolInstance.query(...args),
};

// Initialize database connection and create tables
export async function initDb(config) {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      logger.info("Initializing database connection...");

      // Create connection pool with config settings
      poolInstance = new Pool({
        host: config.db.host,
        port: config.db.port,
        database: config.db.name,
        user: config.db.user,
        password: config.db.password,
        ssl: config.db.ssl,
        ...config.db.pool,
      });

      // Verify connection works
      const result = await poolInstance.query("SELECT NOW()");
      logger.info("Database connected:", result.rows[0].now);

      // Create all required tables
      await createTables(poolInstance);
      logger.info("Database initialized with all tables");

      return poolInstance;
    } catch (error) {
      logger.error("Failed to initialize database:", error);
      poolInstance = null;
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

async function createTables(pool) {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`,
    `CREATE TABLE IF NOT EXISTS codes (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT,
      code TEXT NOT NULL,
      language TEXT DEFAULT 'lynx',
      description TEXT,
      is_deleted BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      settings TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS shared_codes (
      id TEXT PRIMARY KEY,
      code_id TEXT NOT NULL,
      share_token TEXT UNIQUE NOT NULL,
      is_public BOOLEAN DEFAULT false,
      view_count INTEGER DEFAULT 0,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (code_id) REFERENCES codes(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS code_versions (
      id TEXT PRIMARY KEY,
      code_id TEXT NOT NULL,
      code TEXT NOT NULL,
      title TEXT,
      version_number INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (code_id) REFERENCES codes(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS execution_history (
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
    )`,
  ];

  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`,
    `CREATE INDEX IF NOT EXISTS idx_shared_codes_token ON shared_codes(share_token)`,
    `CREATE INDEX IF NOT EXISTS idx_shared_codes_code_id ON shared_codes(code_id)`,
    `CREATE INDEX IF NOT EXISTS idx_code_versions_code_id ON code_versions(code_id)`,
    `CREATE INDEX IF NOT EXISTS idx_execution_history_user_id ON execution_history(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_execution_history_executed_at ON execution_history(executed_at)`,
  ];

  for (const sql of queries) {
    await pool.query(sql);
  }

  for (const sql of indexes) {
    await pool.query(sql);
  }
}

export async function closeDb() {
  if (poolInstance) {
    try {
      await poolInstance.end();
      poolInstance = null;
      initPromise = null;
      logger.info("Database connection closed");
    } catch (error) {
      logger.warn("Error closing database:", error);
    }
  }
}
