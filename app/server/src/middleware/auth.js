import { Session } from "../models/session.js";
import jwt from "jsonwebtoken";
import config from "../config/index.js";

// Session validation query
const SESSION_QUERY = `
  SELECT s.id, s.user_id, s.expires_at, u.username
  FROM sessions s
  JOIN users u ON s.user_id = u.id
  WHERE s.id = $1 AND s.token = $2 AND s.expires_at > NOW()
`;

// Extract Bearer token from Authorization header
const extractBearerToken = (req) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  return token || null;
};

// Verify JWT token and extract payload
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return null;
    }
    throw error;
  }
};

// Authentication middleware - validates JWT and session
export const authenticateToken = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication token required",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    const session = await Session.validate(token);
    if (!session) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired session",
      });
    }

    await Session.updateLastActivity(decoded.sessionId);

    req.user = {
      id: session.user_id,
      username: session.username,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Auth middleware error:", error?.message ?? error);
    }
    return res.status(500).json({ success: false, error: "Authentication failed" });
  }
};

export default { authenticateToken };