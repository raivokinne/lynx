import jwt from "jsonwebtoken";
import { db } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication token required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const sessionResult = await db.query(
      `SELECT s.*, u.username
             FROM sessions s
             JOIN users u ON s.user_id = u.id
             WHERE s.id = $1 AND s.token = $2 AND s.expires_at > NOW()`,
      [decoded.sessionId, token],
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired session",
      });
    }

    const session = sessionResult.rows[0];

    req.user = {
      id: decoded.id,
      username: session.username,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
      });
    }
    console.error("Auth middleware error:", error?.message ?? error);
    return res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  }
};
