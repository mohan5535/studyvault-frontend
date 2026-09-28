const pool = require('../config/db');

/**
 * All queries are parameterized and every read/update/delete is scoped by
 * user_id in the WHERE clause — this is what prevents IDOR (one user
 * reading/editing/deleting another user's category by guessing an id).
 * Duplicate-name conflicts are left to the DB's own UNIQUE(user_id, name)
 * constraint (caught by the controller as Postgres error code 23505)
 * rather than a separate pre-check query, which avoids a race condition
 * between "check" and "insert".
 */

async function findAllByUser(userId) {
  const result = await pool.query(
    `SELECT id, user_id, name, color, created_at
     FROM categories
     WHERE user_id = $1
     ORDER BY name ASC`,
    [userId]
  );
  return result.rows;
}

async function findByIdAndUser(id, userId) {
  const result = await pool.query(
    `SELECT id, user_id, name, color, created_at
     FROM categories
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
}

async function create({ userId, name, color }) {
  const result = await pool.query(
    `INSERT INTO categories (user_id, name, color)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, name, color, created_at`,
    [userId, name, color || null]
  );
  return result.rows[0];
}

/**
 * Update a category, scoped to the owning user. Returns null if no row
 * matched (either the id doesn't exist or belongs to another user) —
 * the controller turns that into a 404.
 */
async function update(id, userId, { name, color }) {
  const result = await pool.query(
    `UPDATE categories
     SET name = $1, color = $2
     WHERE id = $3 AND user_id = $4
     RETURNING id, user_id, name, color, created_at`,
    [name, color || null, id, userId]
  );
  return result.rows[0] || null;
}

/**
 * Delete a category, scoped to the owning user. Returns the deleted row
 * (or null if nothing matched) so the controller can distinguish
 * "deleted" from "not found / not yours".
 *
 * Note: resources.category_id has ON DELETE SET NULL at the database
 * level, so any resources referencing this category are automatically
 * uncategorized rather than deleted — no application code needed here
 * to enforce that; it's a DB constraint guarantee.
 */
async function remove(id, userId) {
  const result = await pool.query(
    `DELETE FROM categories
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, userId]
  );
  return result.rows[0] || null;
}

module.exports = { findAllByUser, findByIdAndUser, create, update, remove };
