/**
 * Compiler controller
 * Handles code compilation and execution with rate limiting
 */
import { existsSync, unlinkSync, writeFileSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { randomBytes } from "crypto";
import { validateCode, sanitizeSessionId, executeCompiler } from "../utils/compiler.js";
import config from "../config/index.js";
import logger from "../../logger.js";

const executionCounts = new Map();

// Clean up old rate limit entries (runs every 60 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [key] of executionCounts) {
    const keyTime = parseInt(key.split("::")[1]);
    if (now - keyTime * 60000 > 120_000) executionCounts.delete(key);
  }
}, 60_000);

/**
 * Execute Lynx code by compiling and running it
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success response with output, or error
 */
export const compilerController = async (req, res) => {
  let tempFilePath = null;
  const startTime = Date.now();
  let success = false;
  let output = null;
  let error = null;

  try {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const userKey = `${userId}::${Math.floor(now / 60000)}`;
    const count = executionCounts.get(userKey) || 0;

    if (count >= config.rateLimit.compiler.max) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded. Please try again later.",
      });
    }

    executionCounts.set(userKey, count + 1);

    const { code } = req.body;
    const validation = validateCode(code, { checkSecurity: true });

    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const sessionId = sanitizeSessionId(req.user?.sessionId || "anonymous");
    const timestamp = Date.now();
    const randomSuffix = randomBytes(8).toString("hex");
    const filename = `code_${sessionId}_${timestamp}_${randomSuffix}${config.compiler.fileExtension}`;

    const absoluteTempDir = resolve(config.compiler.tempDir);
    const userTempDir = join(absoluteTempDir, sessionId);

    // Check path traversal BEFORE creating any files/directories
    const resolvedUserDir = resolve(userTempDir);
    if (!resolvedUserDir.startsWith(absoluteTempDir + "/")) {
      throw new Error("Invalid directory path");
    }

    // Now safe to create directory
    if (!existsSync(resolvedUserDir)) {
      mkdirSync(resolvedUserDir, { recursive: true, mode: 0o700 });
    }

    tempFilePath = join(resolvedUserDir, filename);
    const resolvedFilePath = resolve(tempFilePath);

    // Double-check the file path is within temp directory
    if (!resolvedFilePath.startsWith(absoluteTempDir + "/")) {
      throw new Error("Invalid file path");
    }

    writeFileSync(tempFilePath, code, { encoding: "utf8", mode: 0o600 });
    output = await executeCompiler(tempFilePath);

    success = true;
    res.json({
      success: true,
      output: output?.trim() || "Program executed successfully (no output)",
    });
  } catch (err) {
    const message = err?.message ?? String(err);
    error = message;

    const isUserError =
      message.startsWith("Compiler exited") ||
      message === "Execution timed out" ||
      message === "Output too large";

    if (isUserError) {
      res.status(400).json({ success: false, error: message });
    } else {
      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === "production" ? "Compilation failed" : message,
      });
    }
  } finally {
    if (tempFilePath && existsSync(tempFilePath)) {
      try {
        unlinkSync(tempFilePath);
      } catch (e) {
        logger.error("Error cleaning up temp file:", e?.message);
      }
    }
  }
};