import express, { json } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import config from "./src/config/index.js";
import { initDb, closeDb } from "./src/db/connection.js";
import { cleanupTempFiles } from "./src/utils/compiler.js";
import logger from "./logger.js";
import apiRouter from "./src/routes/api.js";

const app = express();

app.set("trust proxy", 1);

function validateCorsOrigins(origins) {
  if (!origins) return ["http://localhost:3000", "http://localhost:5173"];

  const allowedOrigins = Array.isArray(origins) ? origins : origins.split(",").map((o) => o.trim());
  const validOrigins = allowedOrigins.filter((origin) => {
    try {
      new URL(origin);
      return true;
    } catch {
      console.warn(`Invalid CORS origin: ${origin}`);
      return false;
    }
  });

  return validOrigins.length > 0 ? validOrigins : ["http://localhost:3000"];
}

const authLimiter = rateLimit(config.rateLimit.auth);
const generalLimiter = rateLimit(config.rateLimit.general);

app.use(cors({
  origin: validateCorsOrigins(config.cors.origins),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
}));

app.use(generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  if (config.env === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  next();
});

app.use(json({ limit: "1mb" }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config.compiler.path = config.compiler.path || join(__dirname, "build", "lynx");
config.compiler.tempDir = join(__dirname, "temp");
config.compiler.fileExtension = ".lynx";

if (!existsSync(config.compiler.tempDir)) {
  mkdirSync(config.compiler.tempDir, { recursive: true });
}

app.use("/api", apiRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

function sanitizeError(error) {
  const errorMessage = error?.message ?? String(error);

  if (config.env === "production") {
    const sanitized = errorMessage
      .replace(/\/[^\s]+/g, "[PATH]")
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP]")
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
      .replace(/password[=:]\s*[^\s,}]+/gi, "password=[REDACTED]")
      .replace(/token[=:]\s*[^\s,}]+/gi, "token=[REDACTED]");

    return sanitized.length > 200 ? sanitized.substring(0, 200) + "..." : sanitized;
  }

  return errorMessage;
}

app.use((err, req, res, next) => {
  if (config.env !== "production") {
    console.error("Unhandled error:", err?.message ?? err);
  }

  const sanitizedError = sanitizeError(err);
  res.status(500).json({
    success: false,
    error: config.env === "production" ? "Internal server error" : sanitizedError,
    ...(config.env !== "production" && { stack: err?.stack }),
  });
});

async function seedDemoUser() {
  const db = await import("./src/db/connection.js");
  const { db: database } = db;
  const bcrypt = await import("bcrypt");
  const { v4: uuidv4 } = await import("uuid");

  const username = "demo";
  const password = "Demo@123";

  try {
    const existing = await database.query("SELECT id FROM users WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
      console.log("Demo user already exists");
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await database.query(
      "INSERT INTO users (id, username, password) VALUES ($1, $2, $3)",
      [userId, username, hashed],
    );

    console.log("Demo user created: demo / Demo@123");
  } catch (error) {
    console.error("Seed error:", error.message);
  }
}

initDb(config)
  .then(() => seedDemoUser())
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Temp directory: ${config.compiler.tempDir}`);
      console.log(`Compiler path: ${config.compiler.path}`);
      cleanupTempFiles();
      setInterval(cleanupTempFiles, 30 * 60 * 1000);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize:", err);
    process.exit(1);
  });

async function shutdown(signal) {
  try {
    console.log(`Shutting down... (${signal})`);
    cleanupTempFiles();
    await closeDb();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});