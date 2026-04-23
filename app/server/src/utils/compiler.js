import { spawn } from "child_process";
import { readdirSync, rmdirSync, statSync, unlinkSync, existsSync } from "fs";
import { join, resolve } from "path";
import config from "../config/index.js";

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
            console.error(`Dir cleanup error ${file}:`, err.message);
          }
        } else {
          unlinkSync(filePath);
        }
      }
    }
  } catch (error) {
    console.error("Error cleaning up temp files:", error?.message ?? error);
  }
};

// Validate code with size and security checks
export const validateCode = (code, options = {}) => {
  const { maxSize = config.compiler.maxFileSize, minSize = 1, checkSecurity = true } = options;

  if (!code || typeof code !== "string") {
    return { valid: false, error: "Code is required and must be a string" };
  }

  const processedCode = code.trim();
  if (processedCode.length === 0) {
    return { valid: false, error: "Code cannot be empty" };
  }

  if (code.length > maxSize) {
    return { valid: false, error: `Code exceeds maximum size of ${maxSize} characters` };
  }

  if (processedCode.length < minSize) {
    return { valid: false, error: `Code must be at least ${minSize} character(s)` };
  }

  if (checkSecurity) {
    const securityCheck = validateCodeSecurity(code);
    if (!securityCheck.valid) return securityCheck;
  }

  return { valid: true };
};

function validateCodeSecurity(code) {
  const dangerousPatterns = [
    { pattern: /eval\s*\(/gi, name: "eval()" },
    { pattern: /Function\s*\(/gi, name: "Function constructor" },
    { pattern: /process\./gi, name: "process object" },
    { pattern: /global\./gi, name: "global object" },
    { pattern: /require\s*\(/gi, name: "require()" },
    { pattern: /child_process/gi, name: "child_process module" },
  ];

  for (const { pattern, name } of dangerousPatterns) {
    if (pattern.test(code)) {
      return { valid: false, error: `Code contains unsafe pattern: ${name}` };
    }
  }

  if (code.includes("\0")) {
    return { valid: false, error: "Code contains null bytes" };
  }

  return { valid: true };
}

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
          console.error("Failed to kill child:", e.message);
        }
      }
    };

    const child = spawn("firejail", [
      "--net=none", "--nosound", "--nogroups", "--noroot",
      "--private-dev", "--seccomp", "--caps.drop=all",
      "--rlimit-nproc=50", "--rlimit-fsize=10485760",
      `--whitelist=${config.compiler.path}`,
      `--whitelist=${config.compiler.tempDir}`,
      "--quiet", config.compiler.path, safePath,
    ], {
      stdio: ["ignore", "pipe", "pipe"],
      cwd: config.compiler.tempDir,
      env: { PATH: process.env.PATH },
    });

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
      finish(() => reject(new Error(`Failed to start compiler: ${err.message}`)));
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