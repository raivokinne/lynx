import express, { json } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { existsSync, mkdirSync } from "fs";
import { cleanupTempFiles } from "./utils.js";
import { initDb, closeDb } from "./db.js";
import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import logger from "./logger.js";
import router from "./router.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.set("trust proxy", 1);

function validateCorsOrigins(origins) {
	if (!origins) {
		return ["http://localhost:3000", "http://localhost:5173"];
	}

	const allowedOrigins = Array.isArray(origins)
		? origins
		: origins.split(",").map((o) => o.trim());

	const validOrigins = allowedOrigins.filter((origin) => {
		try {
			new URL(origin);
			return true;
		} catch {
			console.warn(`Invalid CORS origin: ${origin}`);
			return false;
		}
	});

	return validOrigins.length > 0 ? validOrigins : ["http://localhost:3000"];
}

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: {
		success: false,
		error: "Too many authentication attempts, please try again later",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: {
		success: false,
		error: "Too many requests, please try again later",
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true,
});

app.use(
	cors({
		origin: validateCorsOrigins(process.env.CORS_ORIGINS),
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		maxAge: 86400,
	}),
);

app.use(generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use((req, res, next) => {
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("X-XSS-Protection", "1; mode=block");
	res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
	res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

	if (process.env.NODE_ENV === "production") {
		res.setHeader(
			"Strict-Transport-Security",
			"max-age=31536000; includeSubDomains; preload",
		);
	}

	next();
});

app.use(json({ limit: "1mb" }));

app.use((req, res, next) => {
	const start = Date.now();
	res.on("finish", () => {
		const duration = Date.now() - start;
		logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
	});
	next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const CONFIG = {
    COMPILER_PATH: join(__dirname, "build", "lynx"),
    FILE_EXTENSION: ".lynx",
    EXECUTION_TIMEOUT: 10_000,
    MAX_FILE_SIZE: 1024 * 1024,
    TEMP_DIR: join(__dirname, "temp"),
};

if (!existsSync(CONFIG.TEMP_DIR)) {
	mkdirSync(CONFIG.TEMP_DIR, { recursive: true });
}

app.use("/api", router);

app.use((_req, res) => {
	res.status(404).json({ success: false, error: "Endpoint not found" });
});

function sanitizeError(error) {
	const errorMessage = error?.message ?? String(error);

	if (process.env.NODE_ENV === "production") {
		const sanitized = errorMessage
			.replace(/\/[^\s]+/g, "[PATH]")
			.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP]")
			.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
			.replace(/password[=:]\s*[^\s,}]+/gi, "password=[REDACTED]")
			.replace(/token[=:]\s*[^\s,}]+/gi, "token=[REDACTED]")
			.replace(/secret[=:]\s*[^\s,}]+/gi, "secret=[REDACTED]");

		return sanitized.length > 200 ? sanitized.substring(0, 200) + "..." : sanitized;
	}

	return errorMessage;
}

app.use((err, req, res, next) => {
	if (process.env.NODE_ENV !== "production") {
		console.error("Unhandled error:", err?.message ?? err);
	}

	const sanitizedError = sanitizeError(err);
	const isDevelopment = process.env.NODE_ENV !== "production";

	res.status(500).json({
		success: false,
		error: isDevelopment ? sanitizedError : "Internal server error",
		...(isDevelopment && { stack: err?.stack }),
	});
});

initDb()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Compiler server running on port ${PORT}`);
			console.log(`Temp directory: ${CONFIG.TEMP_DIR}`);
			console.log(`Compiler path: ${CONFIG.COMPILER_PATH}`);
			console.log(`Execution timeout: ${CONFIG.EXECUTION_TIMEOUT}ms`);
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
		console.log(`Shutting down server... (${signal})`);
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
