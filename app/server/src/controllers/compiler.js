/**
 * Compiler controller
 * Handles code compilation and execution with rate limiting
 */
import { existsSync, unlinkSync, writeFileSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { sanitizeSessionId, executeCompiler } from "../utils/compiler.js";
import config from "../config/index.js";
import logger from "../../logger.js";

const executionCounts = new Map();
const cooldowns = new Map();
const MAX_UNAUTHENTICATED_EXECUTIONS = 5;
const COOLDOWN_DURATION = 60000;
const USER_ID_COOKIE = "lynx_execution_id";

const getUserId = (req, res) => {
  if (req.user?.id) {
    return req.user.id;
  }

  let userId = req.cookies?.[USER_ID_COOKIE];

  if (!userId) {
    userId = uuidv4();
    res.cookie(USER_ID_COOKIE, userId, config.cookie);
  }

  return userId;
};

// Clean up old rate limit entries (runs every 60 seconds)
setInterval(() => {
  const now = Date.now();
  for (const [key] of executionCounts) {
    const keyTime = parseInt(key.split("::")[1]);
    if (now - keyTime * 60000 > 120_000) executionCounts.delete(key);
  }
  for (const [key, value] of cooldowns) {
    if (value < now) cooldowns.delete(key);
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

  try {
    const userId = getUserId(req, res);
    const isAuthenticated = !!req.user?.id;
    const now = Date.now();
    const userKey = `${userId}::${Math.floor(now / 60000)}`;
    const count = executionCounts.get(userKey) || 0;

    if (!isAuthenticated) {
      executionCounts.set(userKey, count + 1);
    }

    const { code } = req.body;

    const userKeyId = `${userId}::${userId}`;
    const cooldown = cooldowns.get(userKeyId);
    const nowTime = Date.now();

    let isOnCooldown = false;
    let cooldownEnd = null;

    if (!isAuthenticated && cooldown && cooldown > nowTime) {
      isOnCooldown = true;
      cooldownEnd = cooldown;
    } else if (cooldown && cooldown <= nowTime) {
      cooldowns.delete(userKeyId);
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

    if (!isAuthenticated && isOnCooldown) {
      const remainingCooldown = Math.ceil((cooldownEnd - nowTime) / 1000);
      return res.status(429).json({
        success: false,
        error: `Cooldown active. Please wait ${remainingCooldown}s.`,
        executionsRemaining: 0,
        cooldownEnd: cooldownEnd,
      });
    }

    output = await executeCompiler(tempFilePath);

    success = true;

    res.json({
      success: true,
      output: output?.trim() || "Program executed successfully (no output)",
      executionsRemaining: isAuthenticated
        ? null
        : MAX_UNAUTHENTICATED_EXECUTIONS - (count + 1),
      cooldownEnd: null,
    });
  } catch (err) {
    const message = err?.message ?? String(err);

    const isUserError =
      message.startsWith("Compiler exited") ||
      message === "Execution timed out" ||
      message === "Output too large";

    if (isUserError) {
      if (!isAuthenticated && count + 1 >= MAX_UNAUTHENTICATED_EXECUTIONS) {
        const keyId = `${userId}::${userId}`;
        cooldowns.set(keyId, Date.now() + COOLDOWN_DURATION);
      }

      res.status(400).json({
        success: false,
        error: message,
        executionsRemaining: isAuthenticated ? null : 0,
        cooldownEnd:
          !isAuthenticated && count + 1 >= MAX_UNAUTHENTICATED_EXECUTIONS
            ? Date.now() + COOLDOWN_DURATION
            : null,
      });
    } else {
      res.status(500).json({
        success: false,
        error:
          process.env.NODE_ENV === "production"
            ? "Compilation failed"
            : message,
        executionsRemaining: null,
        cooldownEnd: null,
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

export const executionStatusController = async (req, res) => {
  try {
    const userId = getUserId(req, res);
    const isAuthenticated = !!req.user?.id;
    const nowTime = Date.now();

    if (isAuthenticated) {
      return res.json({
        executionsRemaining: null,
        cooldownEnd: null,
        isOnCooldown: false,
      });
    }

    const userKeyId = `${userId}::${userId}`;
    const cooldown = cooldowns.get(userKeyId);
    const minuteKey = `${userId}::${Math.floor(nowTime / 60000)}`;
    const count = executionCounts.get(minuteKey) || 0;

    let cooldownEnd = null;
    let isOnCooldown = false;

    if (cooldown && cooldown > nowTime) {
      cooldownEnd = cooldown;
      isOnCooldown = true;
    } else if (cooldown) {
      cooldowns.delete(userKeyId);
    }

    res.json({
      executionsRemaining: MAX_UNAUTHENTICATED_EXECUTIONS - count,
      cooldownEnd: cooldownEnd,
      isOnCooldown: isOnCooldown,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to get execution status",
    });
  }
};
