import { Session } from "../models/session.js";

export const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.findByUserId(req.user.id);
    res.json({ success: true, sessions });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Get sessions error:", error);
    }
    res.status(500).json({ success: false, error: "Failed to fetch sessions" });
  }
};

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
      console.error("Revoke session error:", error);
    }
    res.status(500).json({ success: false, error: "Failed to revoke session" });
  }
};

export const revokeAllSessions = async (req, res) => {
  try {
    await Session.deleteAllExcept(req.user.id, req.user.sessionId);
    res.json({ success: true, message: "All other sessions revoked successfully" });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Revoke all sessions error:", error);
    }
    res.status(500).json({ success: false, error: "Failed to revoke sessions" });
  }
};