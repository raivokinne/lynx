import { db } from "../db/connection.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const User = {
  async create(username, password) {
    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await db.query(
      "INSERT INTO users (id, username, password) VALUES ($1, $2, $3)",
      [id, username, hashed],
    );
    return { id, username };
  },

  async findById(id) {
    const result = await db.query(
      "SELECT id, username, is_active, last_login, created_at FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  },

  async findByUsername(username) {
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    return result.rows[0] || null;
  },

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  },

  async updateLastLogin(id) {
    await db.query(
      "UPDATE users SET last_login = NOW() WHERE id = $1",
      [id],
    );
  },
};

export default User;