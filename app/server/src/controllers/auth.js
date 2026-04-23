/**
 * Authentication controller
 * Handles user registration, login, logout, and profile retrieval
 */
import { User } from "../models/user.js";
import { Session } from "../models/session.js";

// Input validation patterns
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success response with token and user data, or error
 */
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

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Username already taken",
      });
    }

    const user = await User.create(username, password);
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];
    const { token } = await Session.create(user.id, { ip, userAgent });

    res.json({
      success: true,
      message: "User registered successfully",
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Register error:", error);
    }
    res.status(400).json({ success: false, error: "Registration failed" });
  }
};

/**
 * Authenticate user and create session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success response with token and user data, or error
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password required",
      });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const match = await User.verifyPassword(user, password);
    if (!match) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    await User.updateLastLogin(user.id);
    const ip = req.ip;
    const userAgent = req.headers["user-agent"];
    const { token } = await Session.create(user.id, { ip, userAgent });

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error?.message ?? error);
    res.status(500).json({ success: false, error: "Login failed" });
  }
};

/**
 * Logout current user and delete session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success message or error
 */
export const logout = async (req, res) => {
  try {
    await Session.delete(req.user.sessionId, req.user.id);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Logout error:", error);
    }
    res.status(500).json({ success: false, error: "Logout failed" });
  }
};

/**
 * Get current user's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success response with user data, or error
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.json({ success: true, user });
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