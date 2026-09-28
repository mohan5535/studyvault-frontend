const userModel = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

// --- Validation helpers ---------------------------------------------------
// Kept simple and explicit (no external validation library) so the rules
// are easy to read and defend line-by-line.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Min 8 chars, at least one letter and one number (matches the blueprint).
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function validateRegisterInput({ name, email, password }) {
  const fields = {};

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    fields.name = 'Name is required and must be between 2 and 100 characters.';
  }

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    fields.email = 'A valid email address is required.';
  }

  if (typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
    fields.password = 'Password must be at least 8 characters and include at least one letter and one number.';
  }

  return fields;
}

function validateLoginInput({ email, password }) {
  const fields = {};

  if (typeof email !== 'string' || email.trim().length === 0) {
    fields.email = 'Email is required.';
  }

  if (typeof password !== 'string' || password.length === 0) {
    fields.password = 'Password is required.';
  }

  return fields;
}

function apiError(statusCode, message, fields) {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (fields) err.fields = fields;
  return err;
}

// --- Controllers -----------------------------------------------------------

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    const fields = validateRegisterInput({ name, email, password });
    if (Object.keys(fields).length > 0) {
      throw apiError(400, 'Validation failed', fields);
    }

    const trimmedName = name.trim();
    // Normalize email: trim + lowercase, so "Mohan@Example.com" and
    // "mohan@example.com" are treated as the same account.
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await userModel.findByEmail(normalizedEmail);
    if (existingUser) {
      throw apiError(409, 'An account with this email already exists');
    }

    const passwordHash = await hashPassword(password);

    const user = await userModel.createUser({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
    });

    const token = signToken(user.id);

    return res.status(201).json({
      success: true,
      data: {
        user, // { id, name, email, created_at } — no password_hash, model never selects it here
        token,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    const fields = validateLoginInput({ email, password });
    if (Object.keys(fields).length > 0) {
      throw apiError(400, 'Validation failed', fields);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userModel.findByEmail(normalizedEmail);

    // Generic message for both "unknown email" and "wrong password" —
    // never reveal which one was incorrect.
    const invalidCredentialsError = apiError(401, 'Invalid email or password');

    if (!user) {
      throw invalidCredentialsError;
    }

    const passwordMatches = await comparePassword(password, user.password_hash);
    if (!passwordMatches) {
      throw invalidCredentialsError;
    }

    const token = signToken(user.id);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        },
        token,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/auth/me
 * Protected by auth.middleware — req.user.id comes from the verified JWT.
 */
async function me(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      // Token was valid but the user no longer exists (e.g. deleted account).
      throw apiError(401, 'Invalid or expired token');
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, me };
