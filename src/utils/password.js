const bcrypt = require('bcrypt');

// Standard, widely-recommended cost factor — strong enough to resist
// brute force, cheap enough not to noticeably slow down login/register.
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password. Never store or log the plaintext value.
 */
async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a stored bcrypt hash.
 * Returns a boolean — never throws on mismatch, only on internal errors.
 */
async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

module.exports = { hashPassword, comparePassword };
