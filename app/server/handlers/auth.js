import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { db } from "../db.js";
import { createSession } from "./session.js";

export const register = async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    // Input validation
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Username, password, and confirmPassword required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Confirm Password and Password don't match",
      });
    }

    // Password strength validation
    const passw =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;
    if (!password.match(passw)) {
      return res.status(400).json({
        success: false,
        error:
          "Password must be 8-20 characters with uppercase, lowercase, number, and special character",
      });
    }

    // Check if username already exists
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

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Insert user (no email)
    await db.query(
      "INSERT INTO users (id, username, password) VALUES ($1, $2, $3)",
      [userId, username, hashed],
    );

    // Create session
    const ip =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const { sessionId, token } = await createSession(userId, ip, userAgent);

    res.json({
      success: true,
      message: "User registered successfully",
      token,
      user: { id: userId, username },
    });
  } catch (error) {
    console.error("Register error:", error);

    // Detailed error logging for debugging
    if (error.code) {
      console.error("PostgreSQL Error Code:", error.code);
    }
    if (error.detail) {
      console.error("Error Detail:", error.detail);
    }

    // Handle specific database errors
    let message = "Registration failed";

    if (error.code === "23505") {
      // Unique violation
      message = "Username already taken";
    } else if (error.code === "23502") {
      // NOT NULL violation
      message = "Missing required field";
    } else if (error.code === "42P01") {
      // Table does not exist
      message = "Database configuration error";
      console.error("CRITICAL: users table does not exist!");
    } else if (error.code === "23503") {
      // Foreign key violation (likely session creation issue)
      message = "Failed to create session";
      console.error("Session creation failed - check sessions table");
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

    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

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

    // Create session
    const ip =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const { sessionId, token } = await createSession(user.id, ip, userAgent);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Login failed" });
  }
};

export const logout = async (req, res) => {
  try {
    await db.query("DELETE FROM sessions WHERE user_id = $1 AND token = $2", [
      req.user.id,
      req.headers.authorization?.replace("Bearer ", ""),
    ]);

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, error: "Logout failed" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, created_at
       FROM users
       WHERE id = $1`,
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
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
    });
  }
};
