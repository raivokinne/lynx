import express, { json } from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

app.use(cors());
app.use(json({ limit: '10mb' }));

let db;

async function initDb() {
	db = await open({
		filename: './db.sqlite',
		driver: sqlite3.Database
	});

	await db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`);

	await db.exec(`
		CREATE TABLE IF NOT EXISTS codes (
			id TEXT PRIMARY KEY,
			user_id TEXT,
			title TEXT,
			code TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`);
}

const CONFIG = {
	COMPILER_PATH: './build/lynx',
	FILE_EXTENSION: '.go',
	EXECUTION_TIMEOUT: 10000,
	MAX_FILE_SIZE: 1024 * 1024,
	TEMP_DIR: './temp'
};

if (!existsSync(CONFIG.TEMP_DIR)) {
	mkdirSync(CONFIG.TEMP_DIR, { recursive: true });
}

// ------------------ Helpers ------------------
function cleanupTempFiles() {
	try {
		const files = readdirSync(CONFIG.TEMP_DIR);
		const now = Date.now();
		const maxAge = 60 * 60 * 1000; // 1 hour

		files.forEach(file => {
			const filePath = join(CONFIG.TEMP_DIR, file);
			const stats = statSync(filePath);

			if (now - stats.mtimeMs > maxAge) {
				unlinkSync(filePath);
				console.log(`Cleaned up old temp file: ${file}`);
			}
		});
	} catch (error) {
		console.error('Error cleaning up temp files:', error.message);
	}
}

function validateCode(code) {
	if (!code || typeof code !== 'string') {
		return { valid: false, error: 'Code is required and must be a string' };
	}
	if (code.length > CONFIG.MAX_FILE_SIZE) {
		return { valid: false, error: 'Code is too large' };
	}
	return { valid: true };
}

function executeCompiler(filePath) {
	return new Promise((resolve, reject) => {
		const command = `${CONFIG.COMPILER_PATH} "${filePath}"`;

		const child = exec(command, {
			timeout: CONFIG.EXECUTION_TIMEOUT,
			maxBuffer: 1024 * 1024
		}, (error, stdout, stderr) => {
			if (error) {
				if (error.killed && error.signal === 'SIGTERM') {
					reject(new Error('Execution timed out'));
				} else {
					reject(new Error(stderr || error.message));
				}
			} else {
				resolve(stdout);
			}
		});

		setTimeout(() => {
			if (!child.killed) {
				child.kill('SIGTERM');
			}
		}, CONFIG.EXECUTION_TIMEOUT);
	});
}

function authenticate(req, res, next) {
	const authHeader = req.headers['authorization'];
	if (!authHeader) return res.status(401).json({ success: false, error: 'No token provided' });

	const token = authHeader.split(' ')[1];
	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ success: false, error: 'Invalid token' });
		req.user = user;
		next();
	});
}

// ------------------ Auth Routes ------------------
app.post('/api/register', async (req, res) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({ success: false, error: 'Username and password required' });
		}

		const hashed = await bcrypt.hash(password, 10);
		const userId = uuidv4();

		await db.run(
			'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
			[userId, username, hashed]
		);

		res.json({ success: true, message: 'User registered successfully' });
	} catch (error) {
		console.error('Register error:', error.message);
		res.status(500).json({ success: false, error: 'Registration failed' });
	}
});

app.post('/api/login', async (req, res) => {
	try {
		const { username, password } = req.body;

		const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
		if (!user) {
			return res.status(401).json({ success: false, error: 'Invalid credentials' });
		}

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			return res.status(401).json({ success: false, error: 'Invalid credentials' });
		}

		const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

		res.json({ success: true, token });
	} catch (error) {
		console.error('Login error:', error.message);
		res.status(500).json({ success: false, error: 'Login failed' });
	}
});

// ------------------ Compiler Route ------------------
app.post('/api/compile', async (req, res) => {
	let tempFilePath = null;
	try {
		const { code } = req.body;

		const validation = validateCode(code);
		if (!validation.valid) {
			return res.status(400).json({ success: false, error: validation.error });
		}

		const filename = `code_${uuidv4()}${CONFIG.FILE_EXTENSION}`;
		tempFilePath = join(CONFIG.TEMP_DIR, filename);

		writeFileSync(tempFilePath, code, 'utf8');
		console.log(`Created temp file: ${filename}`);

		const output = await executeCompiler(tempFilePath);

		res.json({ success: true, output: output || 'Program executed successfully (no output)' });

	} catch (error) {
		console.error('Compilation error:', error.message);
		res.json({ success: false, error: error.message });
	} finally {
		if (tempFilePath && existsSync(tempFilePath)) {
			try {
				unlinkSync(tempFilePath);
				console.log(`Cleaned up temp file: ${basename(tempFilePath)}`);
			} catch (cleanupError) {
				console.error('Error cleaning up temp file:', cleanupError.message);
			}
		}
	}
});

// ------------------ Save & Fetch Code ------------------
app.post('/api/code/save', authenticate, async (req, res) => {
	try {
		const { title, code } = req.body;
		if (!code) return res.status(400).json({ success: false, error: 'Code is required' });

		const codeId = uuidv4();
		await db.run(
			'INSERT INTO codes (id, user_id, title, code) VALUES (?, ?, ?, ?)',
			[codeId, req.user.id, title || 'Untitled', code]
		);

		res.json({ success: true, message: 'Code saved successfully', id: codeId });
	} catch (error) {
		console.error('Save code error:', error.message);
		res.status(500).json({ success: false, error: 'Failed to save code' });
	}
});

app.get('/api/code/list', authenticate, async (req, res) => {
	try {
		const codes = await db.all('SELECT id, title, created_at FROM codes WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
		res.json({ success: true, codes });
	} catch (error) {
		console.error('List code error:', error.message);
		res.status(500).json({ success: false, error: 'Failed to fetch codes' });
	}
});

app.get('/api/code/:id', authenticate, async (req, res) => {
	try {
		const { id } = req.params;
		const code = await db.get('SELECT id, title, code, created_at FROM codes WHERE id = ? AND user_id = ?', [id, req.user.id]);

		if (!code) {
			return res.status(404).json({ success: false, error: 'Code not found' });
		}

		res.json({ success: true, code });
	} catch (error) {
		console.error('Get code error:', error.message);
		res.status(500).json({ success: false, error: 'Failed to fetch code' });
	}
});

// ------------------ Error Handling ------------------
app.use((error, _req, res) => {
	console.error('Unhandled error:', error);
	res.status(500).json({ success: false, error: 'Internal server error' });
});

app.use((_req, res) => {
	res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// ------------------ Startup ------------------
initDb().then(() => {
	app.listen(PORT, () => {
		console.log(`🚀 Compiler server running on port ${PORT}`);
		console.log(`📁 Temp directory: ${CONFIG.TEMP_DIR}`);
		console.log(`⚡ Compiler path: ${CONFIG.COMPILER_PATH}`);
		console.log(`⏱️  Execution timeout: ${CONFIG.EXECUTION_TIMEOUT}ms`);

		cleanupTempFiles();
		setInterval(cleanupTempFiles, 30 * 60 * 1000);
	});
}).catch(err => {
	console.error('Failed to initialize database:', err);
	process.exit(1);
});

process.on('SIGINT', () => {
	console.log('\n🛑 Shutting down server...');
	cleanupTempFiles();
	if (db) db.close();
	process.exit(0);
});

process.on('SIGTERM', () => {
	console.log('\n🛑 Shutting down server...');
	cleanupTempFiles();
	if (db) db.close();
	process.exit(0);
});
