import "dotenv/config";

// Application configuration - centralized settings management
export const config = {
  // Server settings
  port: process.env.PORT || 3001,
  env: process.env.NODE_ENV || "development",
  
  // Database connection settings
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // SSL configuration for production environment
    ssl: process.env.NODE_ENV === "production" ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
      ca: process.env.DB_CA_CERT,
      key: process.env.DB_CLIENT_KEY,
      cert: process.env.DB_CLIENT_CERT,
    } : false,
    // Connection pool settings
    pool: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      statement_timeout: 30000,
      query_timeout: 30000,
    },
  },

  // JWT authentication settings
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "24h",
  },

  // Rate limiting configuration (milliseconds, max requests)
  rateLimit: {
    auth: { windowMs: 15 * 60 * 1000, max: 50 },
    general: { windowMs: 15 * 60 * 1000, max: 100 },
    compiler: { windowMs: 60 * 1000, max: 10 },
  },

  // Lynx compiler settings
  compiler: {
    path: process.env.COMPILER_PATH || null,
    fileExtension: process.env.COMPILER_FILE_EXT || ".lynx",
    tempDir: process.env.COMPILER_TEMP_DIR || null,
    timeout: 10000,          // Execution timeout in ms
    maxFileSize: 1024 * 1024,  // 1MB max file size
    maxOutputSize: 100000,    // Max output buffer size
  },

  // CORS configuration
  cors: {
    origins: process.env.CORS_ORIGINS?.split(",").map(o => o.trim()) || ["http://localhost:3000", "http://localhost:5173"],
  },
};

// Validate required environment variables at startup
if (!config.jwt.secret) {
  console.error("FATAL: JWT_SECRET environment variable is required");
  process.exit(1);
}

export default config;