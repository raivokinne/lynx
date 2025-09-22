import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function authenticate(req, res, next) {
  try {
    let rawHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    if (!rawHeader) {
      return res
        .status(401)
        .json({ success: false, error: "No token provided" });
    }

    if (Array.isArray(rawHeader)) rawHeader = rawHeader[0];

    let token = String(rawHeader).trim();

    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.split(" ")[1] || "";
    }

    token = token.replace(/^"(.*)"$/, "$1").trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Malformed authorization header (no token found)",
      });
    }

    try {
      console.log(
        `[AUTH] token length=${token.length}, head=${token.slice(0, 6)}..., tail=${token.slice(-6)}`,
      );
    } catch (e) {
      /* ignore */
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (verr) {
      return res
        .status(401)
        .json({ success: false, error: `Invalid token: ${verr.message}` });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Authentication middleware error" });
  }
}
