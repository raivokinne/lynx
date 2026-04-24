import { Session } from "../models/session.js";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import logger from "../../logger.js";

const extractToken = (req) => {
  return req.cookies?.auth_token;
};

// Verify JWT token and extract payload
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
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

// Authentication middleware - validates JWT and session
export const authenticateToken = async (req, res, next) => {
  try {
    const token = extractToken(req);

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
      token,
    };

    next();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      logger.error("Auth middleware error:", error?.message ?? error);
    }
    return res
      .status(500)
      .json({ success: false, error: "Authentication failed" });
  }
};

export default { authenticateToken };
