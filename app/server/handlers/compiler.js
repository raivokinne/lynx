import { existsSync, unlinkSync, writeFileSync, mkdirSync } from "fs";
import { join, basename, resolve } from "path";
import { randomBytes } from "crypto";
import { validateCode, sanitizeSessionId } from "../utils.js";
import { CONFIG } from "../index.js";
import { executeCompiler } from "../utils.js";
import { logExecution } from "./executionHistory.js";

const executionCounts = new Map();
const MAX_EXECUTIONS_PER_MINUTE = 10;

export const compiler = async (req, res) => {
    let tempFilePath = null;
    const startTime = Date.now();
    let success = false;
    let output = null;
    let error = null;

    try {
        const userId = req.user?.id || req.ip;
        const now = Date.now();
        const userKey = `${userId}-${Math.floor(now / 60000)}`;
        const count = executionCounts.get(userKey) || 0;

        if (count >= MAX_EXECUTIONS_PER_MINUTE) {
            return res.status(429).json({
                success: false,
                error: "Rate limit exceeded. Please try again later.",
            });
        }

        executionCounts.set(userKey, count + 1);

        if (Math.random() < 0.1) {
            for (const [key] of executionCounts) {
                const keyTime = parseInt(key.split("-")[1]);
                if (now - keyTime * 60000 > 120000) {
                    executionCounts.delete(key);
                }
            }
        }

        const { code } = req.body;

        console.log("Code to execute:", JSON.stringify(code));
        console.log("Code length:", code?.length);

        const validation = validateCode(code, { checkSecurity: false });

        if (!validation.valid) {
            error = validation.error;
            return res
                .status(400)
                .json({ success: false, error: validation.error });
        }

        const rawSessionId = req.user ? req.user.sessionId : "anonymous";
        const sessionId = sanitizeSessionId(rawSessionId);
        const timestamp = Date.now();
        const randomSuffix = randomBytes(8).toString("hex");
        const filename = `code_${sessionId}_${timestamp}_${randomSuffix}${CONFIG.FILE_EXTENSION}`;

        const absoluteTempDir = resolve(CONFIG.TEMP_DIR);
        const userTempDir = join(absoluteTempDir, sessionId);

        if (!existsSync(userTempDir)) {
            mkdirSync(userTempDir, { recursive: true, mode: 0o700 });
        }

        tempFilePath = join(userTempDir, filename);

        if (!resolve(tempFilePath).startsWith(absoluteTempDir)) {
            throw new Error("Invalid file path");
        }

        writeFileSync(tempFilePath, code, { encoding: "utf8", mode: 0o600 });
        console.log(`Created temp file: ${filename}`);

        output = await executeCompiler(tempFilePath);

        console.log("Raw compiler output:", JSON.stringify(output));
        console.log("Output length:", output?.length);

        const trimmedOutput = output?.trim() || "";

        success = true;
        res.json({
            success: true,
            output:
                trimmedOutput || "Program executed successfully (no output)",
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
