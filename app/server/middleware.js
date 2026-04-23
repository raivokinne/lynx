import jwt from "jsonwebtoken";
import { db } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is required");
  process.exit(1);
}

const SESSION_QUERY = `
  SELECT s.id, s.user_id, s.expires_at, u.username
  FROM   sessions s
  JOIN   users    u ON s.user_id = u.id
  WHERE  s.id         = $1
    AND  s.token      = $2
    AND  s.expires_at > NOW()
`;
// Extract JWT token from Authorization header
const extractBearerToken = (req) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  return token || null;
};

const verifyToken = (token) => {
  try {
    return (
      jwt.verify(token, JWT_SECRET)
    );
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return null;
    }
    throw error;
  }
};

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

    const { rows } = await db.query(SESSION_QUERY, [decoded.sessionId, token]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired session",
      });
    }

    req.user = {
      id: decoded.id,
      username: rows[0].username,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Auth middleware error:", error?.message ?? error);
    }

    return res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  }
};
