import { db } from "../db/connection.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

// User model - handles user authentication and profile data
export const User = {
  // Create a new user with hashed password
  async create(username, password) {
    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await db.query(
      "INSERT INTO users (id, username, password) VALUES ($1, $2, $3)",
      [id, username, hashed],
    );
    return { id, username };
  },

  // Find user by ID
  async findById(id) {
    const result = await db.query(
      "SELECT id, username, is_active, last_login, created_at FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  },

  // Find user by username (for login)
  async findByUsername(username) {
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    return result.rows[0] || null;
  },

  // Verify password against stored hash
  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  },

  // Update user's last login timestamp
  async updateLastLogin(id) {
    await db.query(
      "UPDATE users SET last_login = NOW() WHERE id = $1",
      [id],
    );
  },
};

export default User;