const { verifyToken } = require('../utils/jwt');

/**
 * Protects routes by requiring a valid JWT in the Authorization header.
 * On success, attaches `req.user = { id }` using the id decoded from the
 * TOKEN ITSELF — the authenticated user's identity is never taken from
 * the request body/params, which would allow one user to act as another
 * by simply changing a field in their request.
 *
 * Responds 401 for any of: missing header, malformed header, invalid
 * signature, or expired token. The message is intentionally generic
 * (doesn't distinguish "expired" from "invalid" to the client) to avoid
 * giving an attacker extra information, while still logging nothing
 * sensitive.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required' },
    });
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required' },
    });
  }

  try {
    const payload = verifyToken(token);

    if (!payload || !payload.sub) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired token' },
      });
    }

    req.user = { id: payload.sub };
    return next();
  } catch (err) {
    // Covers jwt.TokenExpiredError, JsonWebTokenError (bad signature/
    // malformed token), and any other verification failure.
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired token' },
    });
  }
}

module.exports = authMiddleware;
