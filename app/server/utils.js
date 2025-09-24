import { spawn } from "child_process";
import { readdirSync, statSync, unlinkSync } from "fs";
import { join } from "path";
import { CONFIG } from "./index.js";

export function cleanupTempFiles() {
    try {
        const files = readdirSync(CONFIG.TEMP_DIR);
        const now = Date.now();
        const maxAge = 60 * 60 * 1000;

        files.forEach((file) => {
            const filePath = join(CONFIG.TEMP_DIR, file);
            const stats = statSync(filePath);

            if (now - stats.mtimeMs > maxAge) {
                unlinkSync(filePath);
                console.log(`Cleaned up old temp file: ${file}`);
            }
        });
    } catch (error) {
        console.error("Error cleaning up temp files:", error?.message ?? error);
    }
}

export function validateCode(code) {
    if (!code || typeof code !== "string") {
        return { valid: false, error: "Code is required and must be a string" };
    }
    if (code.length > CONFIG.MAX_FILE_SIZE) {
        return { valid: false, error: "Code is too large" };
    }
    return { valid: true };
}

export function executeCompiler(filePath) {
    return new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";
        let finished = false;

        const child = spawn(CONFIG.COMPILER_PATH, [filePath], {
            stdio: ["ignore", "pipe", "pipe"],
        });

        const timer = setTimeout(() => {
            if (!finished) {
                finished = true;
                try {
                    child.kill("SIGTERM");
                } catch (e) { }
                reject(new Error("Execution timed out"));
            }
        }, CONFIG.EXECUTION_TIMEOUT);

        child.stdout?.on("data", (data) => {
            stdout += data.toString();
        });

        child.stderr?.on("data", (data) => {
            stderr += data.toString();
        });

        child.on("error", (err) => {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            reject(new Error(`Failed to start compiler: ${err.message}`));
        });

        child.on("close", (code, signal) => {
            if (finished) return;
            finished = true;
            clearTimeout(timer);

            if (code === 0) {
                resolve(stdout);
            } else {
                const parts = [
                    `Compiler exited with code ${code}${signal ? ` (signal: ${signal})` : ""}`,
                ];
                if (stderr.trim()) parts.push(`${stderr.trim()}`);
                if (stdout.trim()) parts.push(`${stdout.trim()}`);
                reject(new Error(parts.join("\n")));
            }
        });
    });
}
