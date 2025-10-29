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
				if (stats.isDirectory()) {
					try {
						const subFiles = readdirSync(filePath);
						subFiles.forEach((subFile) => {
							const subFilePath = join(filePath, subFile);
							const subStats = statSync(subFilePath);
							if (now - subStats.mtimeMs > maxAge) {
								unlinkSync(subFilePath);
								console.log(`Cleaned up old temp file: ${join(file, subFile)}`);
							}
						});
						
						const remainingFiles = readdirSync(filePath);
						if (remainingFiles.length === 0) {
							files.rmdirSync(filePath);
							console.log(`Removed empty temp directory: ${file}`);
						}
					} catch (dirError) {
						console.error(`Error cleaning temp directory ${file}:`, dirError?.message ?? dirError);
					}
				} else {
					unlinkSync(filePath);
					console.log(`Cleaned up old temp file: ${file}`);
				}
			}
		});
	} catch (error) {
		console.error("Error cleaning up temp files:", error?.message ?? error);
	}
}

export function validateCode(code, options = {}) {
	const {
		maxSize = CONFIG.MAX_FILE_SIZE,
		minSize = 1,
		allowEmpty = false,
		checkSecurity = true,
		trimWhitespace = true
	} = options;

	if (!code || typeof code !== "string") {
		return {
			valid: false,
			error: "Code is required and must be a string"
		};
	}

	const processedCode = trimWhitespace ? code.trim() : code;

	if (!allowEmpty && processedCode.length === 0) {
		return {
			valid: false,
			error: "Code cannot be empty"
		};
	}

	if (code.length > maxSize) {
		return {
			valid: false,
			error: `Code exceeds maximum size of ${maxSize} characters (current: ${code.length})`
		};
	}

	if (processedCode.length < minSize) {
		return {
			valid: false,
			error: `Code must be at least ${minSize} character(s)`
		};
	}

	if (checkSecurity) {
		const securityCheck = validateCodeSecurity(code);
		if (!securityCheck.valid) {
			return securityCheck;
		}
	}

	return { valid: true };
}

function validateCodeSecurity(code) {
	const dangerousPatterns = [
		{ pattern: /eval\s*\(/gi, name: "eval()" },
		{ pattern: /Function\s*\(/gi, name: "Function constructor" },
		{ pattern: /setTimeout\s*\(\s*["'`]/gi, name: "setTimeout with string" },
		{ pattern: /setInterval\s*\(\s*["'`]/gi, name: "setInterval with string" },
		{ pattern: /require\s*\(/gi, name: "require()" },
		{ pattern: /import\s+.*\s+from/gi, name: "import statement" },
		{ pattern: /process\./gi, name: "process object access" },
		{ pattern: /global\./gi, name: "global object access" },
		{ pattern: /Buffer\./gi, name: "Buffer object access" },
		{ pattern: /child_process/gi, name: "child_process module" },
		{ pattern: /fs\./gi, name: "fs module access" },
		{ pattern: /os\./gi, name: "os module access" },
		{ pattern: /net\./gi, name: "net module access" },
		{ pattern: /http\./gi, name: "http module access" },
		{ pattern: /https\./gi, name: "https module access" },
		{ pattern: /exec\s*\(/gi, name: "exec()" },
		{ pattern: /spawn\s*\(/gi, name: "spawn()" },
		{ pattern: /fork\s*\(/gi, name: "fork()" },
		{ pattern: /<script/gi, name: "script tag" },
		{ pattern: /javascript:/gi, name: "javascript protocol" },
		{ pattern: /on\w+\s*=/gi, name: "event handler" }
	];

	for (const { pattern, name } of dangerousPatterns) {
		if (pattern.test(code)) {
			return {
				valid: false,
				error: `Code contains potentially unsafe pattern: ${name}`
			};
		}
	}

	if (code.includes('\0')) {
		return {
			valid: false,
			error: "Code contains null bytes"
		};
	}

	const controlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
	if (controlChars.test(code)) {
		return {
			valid: false,
			error: "Code contains invalid control characters"
		};
	}

	const pathTraversal = /\.\.[\/\\]/g;
	if (pathTraversal.test(code)) {
		return {
			valid: false,
			error: "Code contains potential path traversal patterns"
		};
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
			cwd: CONFIG.TEMP_DIR,
			env: { 
				PATH: process.env.PATH,
				NODE_ENV: 'production'
			},
			uid: process.getuid ? process.getuid() : undefined,
			gid: process.getgid ? process.getgid() : undefined,
			detached: false
		});

		const timer = setTimeout(() => {
			if (!finished) {
				finished = true;
				try {
					child.kill("SIGTERM");
					setTimeout(() => {
						if (!child.killed) {
							child.kill("SIGKILL");
						}
					}, 5000);
				} catch (e) { }
				reject(new Error("Execution timed out"));
			}
		}, CONFIG.EXECUTION_TIMEOUT);

		child.stdout?.on("data", (data) => {
			const chunk = data.toString();
			if (chunk.length > 100000) {
				if (!finished) {
					finished = true;
					clearTimeout(timer);
					child.kill("SIGTERM");
					reject(new Error("Output too large"));
				}
				return;
			}
			stdout += chunk;
		});

		child.stderr?.on("data", (data) => {
			const chunk = data.toString();
			if (chunk.length > 100000) {
				if (!finished) {
					finished = true;
					clearTimeout(timer);
					child.kill("SIGTERM");
					reject(new Error("Error output too large"));
				}
				return;
			}
			stderr += chunk;
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
