import { existsSync, unlinkSync, writeFileSync, mkdirSync } from "fs";
import { join, basename, dirname } from "path";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "crypto";
import { validateCode } from "../utils.js";
import { CONFIG } from "../index.js";
import { executeCompiler } from "../utils.js";
import { logExecution } from "./executionHistory.js";

export const compiler = async (req, res) => {
  let tempFilePath = null;
  const startTime = Date.now();
  let success = false;
  let output = null;
  let error = null;

  try {
    const { code } = req.body;
    const validation = validateCode(code);

    if (!validation.valid) {
      error = validation.error;
      return res.status(400).json({ success: false, error: validation.error });
    }

    const sessionId = req.user ? req.user.sessionId : 'anonymous';
    const timestamp = Date.now();
    const randomSuffix = randomBytes(8).toString('hex');
    const filename = `code_${sessionId}_${timestamp}_${randomSuffix}${CONFIG.FILE_EXTENSION}`;
    
    const userTempDir = join(CONFIG.TEMP_DIR, sessionId);
    if (!existsSync(userTempDir)) {
      mkdirSync(userTempDir, { recursive: true, mode: 0o700 });
    }
    
    tempFilePath = join(userTempDir, filename);
    writeFileSync(tempFilePath, code, "utf8", { mode: 0o600 });
    console.log(`Created temp file: ${basename(tempFilePath)}`);

    output = await executeCompiler(tempFilePath);
    success = true;

    res.json({
      success: true,
      output: output || "Program executed successfully (no output)",
    });
  } catch (err) {
    console.error("Compilation error:", err?.message ?? err);
    error = err?.message ?? String(err);

    res.json({
      success: false,
      error: error,
    });
  } finally {
    const executionTime = Date.now() - startTime;

    if (req.user) {
      await logExecution(
        req.user.id,
        req.body.codeId || null,
        success,
        output,
        error,
        executionTime,
      );
    }

    if (tempFilePath && existsSync(tempFilePath)) {
      try {
        unlinkSync(tempFilePath);
        console.log(`Cleaned up temp file: ${basename(tempFilePath)}`);
      } catch (cleanupError) {
        console.error(
          "Error cleaning up temp file:",
          cleanupError?.message ?? cleanupError,
        );
      }
    }
  }
};
