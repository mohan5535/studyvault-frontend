require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error(
    '\n[FATAL] Missing required environment variable: DATABASE_URL\n' +
      'Set a valid PostgreSQL connection string in .env before starting the server.\n'
  );
  process.exit(1);
}

const db = require('./src/config/db');
const app = require('./src/app');
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await db.ready;
    app.listen(PORT, () => {
      console.log(
        `StudyVault API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`
      );
    });
  } catch (err) {
    console.error('\n[FATAL] PostgreSQL connection failed.');
    console.error(err.message);
    process.exit(1);
  }
})();
