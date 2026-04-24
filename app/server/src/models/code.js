import { db } from "../db/connection.js";
import { v4 as uuidv4 } from "uuid";

// Code model - handles saved code snippets CRUD operations
export const Code = {
	// Create new code snippet
	async create(userId, { title, code, language = "lynx", description = null }) {
		const id = uuidv4();
		await db.query(
			"INSERT INTO codes (id, user_id, title, code, language, description) VALUES ($1, $2, $3, $4, $5, $6)",
			[id, userId, title || "Untitled", code, language, description],
		);
		return { id };
	},

	// Update existing code snippet
	async update(id, userId, { title, code }) {
		const result = await db.query(
			`UPDATE codes SET title = COALESCE($1, title), code = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4 RETURNING *`,
			[title, code, id, userId],
		);
		return result.rows[0] || null;
	},

	// Find code by ID (with ownership check)
	async findById(id, userId) {
		const result = await db.query(
			"SELECT * FROM codes WHERE id = $1 AND user_id = $2",
			[id, userId],
		);
		if (!result.rows[0]) return null;
		const row = result.rows[0];
		return {
			id: row.id,
			title: row.title,
			code: row.code,
			language: row.language,
			description: row.description,
			createdAt: row.create_at,
			updatedAt: row.update_at,
		};
	},

	// Find all codes for a user
	async findAllByUserId(userId) {
		const result = await db.query(
			"SELECT id, title, code, create_at, update_at FROM codes WHERE user_id = $1 AND is_deleted = false ORDER BY update_at DESC",
			[userId],
		);
		return result.rows.map(row => ({
			id: row.id,
			title: row.title,
			code: row.code,
			createdAt: row.create_at,
			updatedAt: row.update_at,
		}));
	},

	// Permanently delete code
	async delete(id, userId) {
		const result = await db.query(
			"DELETE FROM codes WHERE id = $1 AND user_id = $2",
			[id, userId],
		);
		return result.rowCount > 0;
	},

	// Soft delete (mark as deleted)
	async softDelete(id, userId) {
		const result = await db.query(
			"UPDATE codes SET is_deleted = true WHERE id = $1 AND user_id = $2",
			[id, userId],
		);
		return result.rowCount > 0;
	},
};

export default Code;
