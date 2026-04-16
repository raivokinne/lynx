import { existsSync, unlinkSync, writeFileSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { randomBytes } from "crypto";
import { validateCode, sanitizeSessionId } from "../utils.js";
import { CONFIG } from "../index.js";
import { executeCompiler } from "../utils.js";
import { logExecution } from "./executionHistory.js";

const executionCounts = new Map();
const MAX_EXECUTIONS_PER_MINUTE = 10;
const MAX_LOG_OUTPUT = 10_000;

setInterval(() => {
    const now = Date.now();
    for (const [key] of executionCounts) {
        const keyTime = parseInt(key.split("::")[1]);
        if (now - keyTime * 60000 > 120_000) executionCounts.delete(key);
    }
}, 60_000);

export const compiler = async (req, res) => {
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

        if (count >= MAX_EXECUTIONS_PER_MINUTE) {
            return res.status(429).json({
                success: false,
                error: "Rate limit exceeded. Please try again later.",
            });
        }

        executionCounts.set(userKey, count + 1);

        const { code } = req.body;

        const validation = validateCode(code, { checkSecurity: true });

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

        output = await executeCompiler(tempFilePath);

        const trimmedOutput = output?.trim() || "";

        success = true;
        res.json({
            success: true,
            output:
                trimmedOutput || "Program executed successfully (no output)",
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
            const clientMessage =
                process.env.NODE_ENV === "production"
                    ? "Compilation failed"
                    : message;
            res.status(500).json({ success: false, error: clientMessage });
        }
    } finally {
        const executionTime = Date.now() - startTime;

        if (req.user) {
            await logExecution(
                req.user.id,
                req.body.codeId || null,
                success,
                output?.slice(0, MAX_LOG_OUTPUT),
                error?.slice(0, MAX_LOG_OUTPUT),
                executionTime,
            );
        }

        if (tempFilePath && existsSync(tempFilePath)) {
            try {
                unlinkSync(tempFilePath);
            } catch (cleanupError) {
                console.error(
                    "Error cleaning up temp file:",
                    cleanupError?.message ?? cleanupError,
                );
            }
        }
    }
};
