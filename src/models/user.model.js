const pool = require('../config/db');

/**
 * All queries are parameterized ($1, $2, ...) — never string-concatenated —
 * to prevent SQL injection. This is the only file that talks to the
 * `users` table directly.
 */

/**
 * Create a new user. Expects an already-trimmed/normalized email and an
 * already-bcrypt-hashed password (hashing happens in the controller layer
 * via utils/password.js, not here — this model only persists data).
 * Returns the public-safe fields only (never password_hash).
 */
async function createUser({ name, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );
  return result.rows[0];
}

/**
 * Find a user by email, INCLUDING password_hash — needed internally for
 * login to compare against. Callers must never send this raw row back
 * in an HTTP response.
 */
async function findByEmail(email) {
  const result = await pool.query(
    `SELECT id, name, email, password_hash, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Find a user by id, public-safe fields only (no password_hash).
 * Used by GET /api/auth/me.
 */
async function findById(id) {
  const result = await pool.query(
    `SELECT id, name, email, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { createUser, findByEmail, findById };
