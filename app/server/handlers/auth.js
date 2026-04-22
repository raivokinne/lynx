import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { db } from "../db.js";
import { createSession } from "./session.js";

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;

export const register = async (req, res) => {
	try {
		const { username, password, confirmPassword } = req.body;

		if (!username || !password || !confirmPassword) {
			return res.status(400).json({
				success: false,
				error: "Username, password, and confirmPassword required",
			});
		}

		if (username.length < 3 || username.length > 32) {
			return res.status(400).json({
				success: false,
				error: "Username must be 3–32 characters",
			});
		}

		if (!USERNAME_REGEX.test(username)) {
			return res.status(400).json({
				success: false,
				error: "Username may only contain letters, numbers, hyphens, and underscores",
			});
		}

		if (password !== confirmPassword) {
			return res.status(400).json({
				success: false,
				error: "Passwords do not match",
			});
		}

		if (!PASSWORD_REGEX.test(password)) {
			return res.status(400).json({
				success: false,
				error: "Password must be 8-20 characters with uppercase, lowercase, number, and special character",
			});
		}

		const existingUser = await db.query(
			"SELECT id FROM users WHERE username = $1",
			[username],
		);

		if (existingUser.rows.length > 0) {
			return res.status(400).json({
				success: false,
				error: "Username already taken",
			});
		}

		const hashed = await bcrypt.hash(password, 10);
		const userId = uuidv4();

		await db.query(
			"INSERT INTO users (id, username, password) VALUES ($1, $2, $3)",
			[userId, username, hashed],
		);

		const ip = req.ip;
		const userAgent = req.headers["user-agent"];
		const { token } = await createSession(userId, ip, userAgent);

		res.json({
			success: true,
			message: "User registered successfully",
			token,
			user: { id: userId, username },
		});
	} catch (error) {
		if (process.env.NODE_ENV !== "production") {
			console.error("Register error:", error);
			if (error.code) console.error("PostgreSQL Error Code:", error.code);
			if (error.detail) console.error("Error Detail:", error.detail);
		}

		let message = "Registration failed";

		if (error.code === "23505") {
			message = "Username already taken";
		} else if (error.code === "23502") {
			message = "Missing required field";
		} else if (error.code === "42P01") {
			if (process.env.NODE_ENV !== "production") {
				console.error("CRITICAL: users table does not exist!");
			}
			message = "Database configuration error";
		} else if (error.code === "23503") {
			if (process.env.NODE_ENV !== "production") {
				console.error("Session creation failed - check sessions table");
			}
			message = "Failed to create session";
		}

		res.status(400).json({ success: false, error: message });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({
				success: false,
				error: "Username and password required",
			});
		}

		const result = await db.query(
			"SELECT id, username, password FROM users WHERE username = $1",
			[username],
		);

		const user = result.rows[0];

		if (!user) {
			return res.status(401).json({
				success: false,
				error: "Invalid credentials",
			});
		}

		const match = await bcrypt.compare(password, user.password);

		if (!match) {
			return res.status(401).json({
				success: false,
				error: "Invalid credentials",
			});
		}

		const ip = req.ip;
		const userAgent = req.headers["user-agent"];
		const { token } = await createSession(user.id, ip, userAgent);

		res.json({
			success: true,
			token,
			user: {
				id: user.id,
				username: user.username,
			},
		});
	} catch (error) {
		if (process.env.NODE_ENV !== "production") {
			console.error("Login error:", error);
		}
		res.status(500).json({ success: false, error: "Login failed" });
	}
};

export const logout = async (req, res) => {
	try {
		await db.query(
			"DELETE FROM sessions WHERE id = $1 AND user_id = $2",
			[req.user.sessionId, req.user.id],
		);

		res.json({
			success: true,
			message: "Logged out successfully",
		});
	} catch (error) {
		if (process.env.NODE_ENV !== "production") {
			console.error("Logout error:", error);
		}
		res.status(500).json({ success: false, error: "Logout failed" });
	}
};

export const getProfile = async (req, res) => {
	try {
		const result = await db.query(
			"SELECT id, username, created_at FROM users WHERE id = $1",
			[req.user.id],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		res.json({
			success: true,
			user: result.rows[0],
		});
	} catch (error) {
		if (process.env.NODE_ENV !== "production") {
			console.error("Get profile error:", error);
		}
		res.status(500).json({
			success: false,
			error: "Failed to fetch profile",
		});
	}
};
