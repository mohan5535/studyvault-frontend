const jwt = require('jsonwebtoken');

// JWT_SECRET is required for any auth operation to work. We check lazily
// here (not at module load) so this file can be safely required even
// before dotenv has run in some tooling/test contexts — the real,
// hard failure on missing env vars happens at server startup (server.js).
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  return secret;
}

/**
 * Sign a JWT for a given user id.
 * Payload intentionally contains ONLY the subject (user id) — no name,
 * email, or other user data — so the token never leaks profile info
 * and stays valid even if the user later edits their profile.
 */
function signToken(userId) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ sub: userId }, getSecret(), { expiresIn });
}

/**
 * Verify a JWT and return its decoded payload.
 * Throws on missing/invalid/expired tokens — callers (auth middleware)
 * are responsible for turning that into a 401 response.
 */
function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

module.exports = { signToken, verifyToken };
