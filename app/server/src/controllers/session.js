/**
 * Session controller
 * Handles user session management
 */
import { Session } from "../models/session.js";
import logger from "../../logger.js";

/**
 * Get all sessions for current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success response with array of sessions, or error
 */
export const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.findByUserId(req.user.id);
    res.json({ success: true, sessions });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      logger.error("Get sessions error:", error);
    }
    res.status(500).json({ success: false, error: "Failed to fetch sessions" });
  }
};

/**
 * Revoke a specific session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success message or error
 */
export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const deleted = await Session.delete(sessionId, req.user.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }
    res.json({ success: true, message: "Session revoked successfully" });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      logger.error("Revoke session error:", error);
    }
    res.status(500).json({ success: false, error: "Failed to revoke session" });
  }
};

/**
 * Revoke all sessions except the current one
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {JSON} Success message or error
 */
export const revokeAllSessions = async (req, res) => {
  try {
    await Session.deleteAllExcept(req.user.id, req.user.sessionId);
    res.json({ success: true, message: "All other sessions revoked successfully" });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      logger.error("Revoke all sessions error:", error);
    }
    res.status(500).json({ success: false, error: "Failed to revoke sessions" });
  }
};