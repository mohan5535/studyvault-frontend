const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const db = require('./config/db');

const app = express();

// --- Core middleware ---
app.use(helmet());

function sanitizeOrigin(str) {
  try {
    const parsed = new URL(str.trim());
    return parsed.origin;
  } catch {
    return str.trim().replace(/\/.*$/, '');
  }
}

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(sanitizeOrigin)
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, postman, mobile, server-to-server)
      if (!origin) return callback(null, true);

      let cleanOrigin = origin;
      try {
        cleanOrigin = new URL(origin).origin;
      } catch {
        cleanOrigin = origin.replace(/\/$/, '');
      }

      // Allow if wildcard configured or if CORS_ORIGIN not specified
      if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') {
        return callback(null, true);
      }

      // Check configured origins or common deployment domains
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1') ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.endsWith('.onrender.com') ||
        cleanOrigin.endsWith('.netlify.app')
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// --- Health check ---
// Used by Render for uptime checks and by us to verify the server booted.
app.get('/api/health', async (req, res, next) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({
      success: true,
      message: 'StudyVault API is healthy',
      database: 'connected',
    });
  } catch (err) {
    next(err);
  }
});

// --- Route mounts ---
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/resources', require('./routes/resource.routes'));

// --- 404 + centralized error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
