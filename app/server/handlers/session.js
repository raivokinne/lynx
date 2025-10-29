import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is required");
  process.exit(1);
}

export const createSession = async (userId, ip, userAgent) => {
  const sessionId = uuidv4();
  const token = jwt.sign({ id: userId, sessionId }, JWT_SECRET, {
    expiresIn: "24h",
  });

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.query(
    `INSERT INTO sessions (id, user_id, token, expires_at, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6)`,
    [sessionId, userId, token, expiresAt, ip, userAgent],
  );

  return { sessionId, token };
};

export const validateSession = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await db.query(
      `SELECT s.*, u.username, u.is_active
             FROM sessions s
             JOIN users u ON s.user_id = u.id
             WHERE s.id = $1 AND s.expires_at > NOW()`,
      [decoded.sessionId],
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return null;
    }

    await db.query(`UPDATE sessions SET last_activity = NOW() WHERE id = $1`, [
      decoded.sessionId,
    ]);

    return result.rows[0];
  } catch (error) {
    return null;
  }
};

export const getUserSessions = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, ip_address, user_agent, created_at, last_activity, expires_at
             FROM sessions
             WHERE user_id = $1 AND expires_at > NOW()
             ORDER BY last_activity DESC`,
      [req.user.id],
    );

    res.json({
      success: true,
      sessions: result.rows,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Get sessions error:", error?.message ?? error);
    }
    res.status(500).json({
      success: false,
      error: "Failed to fetch sessions",
    });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await db.query(
      `DELETE FROM sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    res.json({
      success: true,
      message: "Session revoked successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Revoke session error:", error?.message ?? error);
    }
    res.status(500).json({
      success: false,
      error: "Failed to revoke session",
    });
  }
};

export const revokeAllSessions = async (req, res) => {
  try {
    const currentSessionId = req.user.sessionId;

    await db.query(`DELETE FROM sessions WHERE user_id = $1 AND id != $2`, [
      req.user.id,
      currentSessionId,
    ]);

    res.json({
      success: true,
      message: "All other sessions revoked successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Revoke all sessions error:", error?.message ?? error);
    }
    res.status(500).json({
      success: false,
      error: "Failed to revoke sessions",
    });
  }
};

export const cleanupExpiredSessions = async () => {
  try {
    const result = await db.query(
      `DELETE FROM sessions WHERE expires_at < NOW()`,
    );
    console.log(`Cleaned up ${result.rowCount} expired sessions`);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Cleanup sessions error:", error?.message ?? error);
    }
  }
};
