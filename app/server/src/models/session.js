import { db } from "../db/connection.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import config from "../config/index.js";

// Session model - handles user session management and JWT tokens
export const Session = {
  // Create new session with JWT token
  async create(userId, { ip, userAgent } = {}) {
    const id = uuidv4();
    const token = jwt.sign({ id: userId, sessionId: id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);  // 24 hours

    await db.query(
      `INSERT INTO sessions (id, user_id, token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, userId, token, expiresAt, ip, userAgent],
    );
    return { id, token };
  },

  async validate(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const result = await db.query(
        `SELECT s.*, u.username, u.is_active FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.id = $1 AND s.expires_at > NOW()`,
        [decoded.sessionId],
      );
      return result.rows[0] || null;
    } catch {
      return null;
    }
  },

  async updateLastActivity(id) {
    await db.query("UPDATE sessions SET last_activity = NOW() WHERE id = $1", [id]);
  },

  async findByUserId(userId) {
    const result = await db.query(
      `SELECT id, ip_address, user_agent, created_at, last_activity, expires_at
       FROM sessions WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY last_activity DESC`,
      [userId],
    );
    return result.rows;
  },

  async delete(id, userId) {
    const result = await db.query(
      "DELETE FROM sessions WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    return result.rowCount > 0;
  },

  async deleteAllExcept(userId, exceptId) {
    const result = await db.query(
      "DELETE FROM sessions WHERE user_id = $1 AND id != $2",
      [userId, exceptId],
    );
    return result.rowCount;
  },

  async cleanup() {
    await db.query("DELETE FROM sessions WHERE expires_at < NOW()");
  },
};

export default Session;