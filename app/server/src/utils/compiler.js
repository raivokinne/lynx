import { spawn, execSync } from "child_process";
import { existsSync } from "fs";

const useFirejail = (() => {
  try {
    execSync("which firejail", { stdio: "ignore" });
    return true;
  } catch {
    return config.env !== "production";
  }
})();
import { readdirSync, rmdirSync, statSync, unlinkSync, existsSync } from "fs";
import { join, resolve } from "path";
import config from "../config/index.js";
import logger from "../../logger.js";

const MAX_OUTPUT_SIZE = 100_000;

// Sanitize session ID to prevent directory traversal
export const sanitizeSessionId = (sessionId) => {
  if (!sessionId || typeof sessionId !== "string") return "anonymous";
  return sessionId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50) || "anonymous";
};

// Remove temp files older than 1 hour
export const cleanupTempFiles = () => {
  try {
    const tempDir = resolve(config.compiler.tempDir);
    if (!existsSync(tempDir)) return;

    const files = readdirSync(tempDir);
    const now = Date.now();
    const maxAge = 60 * 60 * 1000;

    for (const file of files) {
      const filePath = join(tempDir, file);
      const stats = statSync(filePath);

      if (now - stats.mtimeMs > maxAge) {
        if (stats.isDirectory()) {
          try {
            const subFiles = readdirSync(filePath);
            for (const subFile of subFiles) {
              const subFilePath = join(filePath, subFile);
              const subStats = statSync(subFilePath);
              if (now - subStats.mtimeMs > maxAge) {
                unlinkSync(subFilePath);
              }
            }
            const remaining = readdirSync(filePath);
            if (remaining.length === 0) rmdirSync(filePath);
          } catch (err) {
            logger.error(`Dir cleanup error ${file}:`, err.message);
          }
        } else {
          unlinkSync(filePath);
        }
      }
    }
  } catch (error) {
    logger.error("Error cleaning up temp files:", error?.message ?? error);
  }
};

// Execute the Lynx compiler
export const executeCompiler = (filePath) => {
  const safePath = resolve(filePath);
  const tempDir = resolve(config.compiler.tempDir);

  if (!safePath.startsWith(tempDir + "/")) {
    return Promise.reject(new Error("Invalid file path"));
  }

  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let finished = false;

    const totalOutput = () => stdout.length + stderr.length;

    const finish = (fn) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      fn();
    };

    const killChild = () => {
      try {
        child.kill("SIGTERM");
        setTimeout(() => {
          if (!child.killed) child.kill("SIGKILL");
        }, 5000);
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          logger.error("Failed to kill child:", e.message);
        }
      }
    };

    let child;
    if (useFirejail) {
      child = spawn(
        "firejail",
        [
          "--net=none",
          "--nosound",
          "--nogroups",
          "--noroot",
          "--private-dev",
          "--seccomp",
          "--caps.drop=all",
          "--rlimit-nproc=50",
          "--rlimit-fsize=10485760",
          `--whitelist=${config.compiler.path}`,
          `--whitelist=${config.compiler.tempDir}`,
          "--quiet",
          config.compiler.path,
          safePath,
        ],
        {
          stdio: ["ignore", "pipe", "pipe"],
          cwd: config.compiler.tempDir,
          env: { PATH: process.env.PATH },
        },
      );
    } else {
      child = spawn(config.compiler.path, [safePath], {
        stdio: ["ignore", "pipe", "pipe"],
        cwd: config.compiler.tempDir,
        env: { PATH: process.env.PATH },
      });
    }

    const timer = setTimeout(() => {
      finish(() => {
        killChild();
        reject(new Error("Execution timed out"));
      });
    }, config.compiler.timeout);

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
      if (totalOutput() > MAX_OUTPUT_SIZE) {
        finish(() => {
          killChild();
          reject(new Error("Output too large"));
        });
      }
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      finish(() =>
        reject(new Error(`Failed to start compiler: ${err.message}`)),
      );
    });

    child.on("close", (code, signal) => {
      finish(() => {
        if (code === 0) {
          resolve(stdout);
        } else {
          const parts = [
            `Compiler exited with code ${code}${signal ? ` (signal: ${signal})` : ""}`,
          ];
          if (stderr.trim()) parts.push(stderr.trim());
          if (stdout.trim()) parts.push(stdout.trim());
          reject(new Error(parts.join("\n")));
        }
      });
    });
  });
};
