const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const db = require('./config/db');

const app = express();

// --- Core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
