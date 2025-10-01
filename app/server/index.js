import express, { json } from "express";
import cors from "cors";
import { existsSync, mkdirSync } from "fs";
import { cleanupTempFiles } from "./utils.js";
import { initDb, closeDb } from "./db.js";
import "dotenv/config";

import router from "./router.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(json({ limit: "10mb" }));

export const CONFIG = {
  COMPILER_PATH: "./build/lynx",
  FILE_EXTENSION: ".lynx",
  EXECUTION_TIMEOUT: 100_000,
  MAX_FILE_SIZE: 1024 * 1024,
  TEMP_DIR: "./temp",
};

if (!existsSync(CONFIG.TEMP_DIR)) {
  mkdirSync(CONFIG.TEMP_DIR, { recursive: true });
}

app.use("/api", router);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err?.message ?? err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Compiler server running on port ${PORT}`);
      console.log(`📁 Temp directory: ${CONFIG.TEMP_DIR}`);
      console.log(`⚡ Compiler path: ${CONFIG.COMPILER_PATH}`);
      console.log(`⏱️  Execution timeout: ${CONFIG.EXECUTION_TIMEOUT}ms`);
      cleanupTempFiles();
      setInterval(cleanupTempFiles, 30 * 60 * 1000);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });

async function shutdown(signal) {
  try {
    console.log(`\n🛑 Shutting down server... (${signal})`);
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
