import { Session } from "../models/session.js";

const SESSION_QUERY = `
  SELECT s.id, s.user_id, s.expires_at, u.username
  FROM sessions s
  JOIN users u ON s.user_id = u.id
  WHERE s.id = $1 AND s.token = $2 AND s.expires_at > NOW()
`;

const extractBearerToken = (req) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  return token || null;
};

const verifyToken = (token) => {
  try {
    return require("jsonwebtoken").verify(token, require("../config/index.js").jwt.secret);
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
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

    const { rows } = await Session.validate(token);
    await Session.updateLastActivity(decoded.sessionId);

    const session = rows[0];
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