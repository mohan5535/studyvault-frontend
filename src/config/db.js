const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error(
    'Missing required environment variable: DATABASE_URL. ' +
      'Set a valid PostgreSQL connection string in .env.'
  );
}

function parseDatabaseUrl(connectionString) {
  let url;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error('DATABASE_URL is not a valid PostgreSQL connection string.');
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL must use postgres:// or postgresql://.');
  }

  if (!url.hostname) {
    throw new Error('DATABASE_URL is missing the PostgreSQL hostname.');
  }

  return {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    hostname: url.hostname,
    port: Number(url.port || 5432),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    searchParams: url.searchParams,
  };
}

// Neon currently resolves this hostname to these public IPv4 addresses.
// The app selects one at startup to avoid the local DNS resolver issue
// observed on some Windows/JioFiber setups. TLS still uses the original
// Neon hostname as SNI/servername.
const NEON_IPV4_FALLBACKS = [
  '3.18.239.121',
  '18.189.49.143',
  '3.141.122.14',
];

function isNeonHostname(hostname) {
  return /\.neon\.tech$/i.test(hostname);
}

function buildPoolConfig(config, hostAddress) {
  const useSSL =
    process.env.NODE_ENV !== 'development' ||
    /sslmode=require/i.test(process.env.DATABASE_URL);

  return {
    user: config.user,
    password: config.password,
    host: hostAddress,
    port: config.port,
    database: config.database,
    ssl: useSSL
      ? {
          rejectUnauthorized: false,
          servername: config.hostname,
        }
      : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

async function createPool() {
  const config = parseDatabaseUrl(process.env.DATABASE_URL);

  const addresses = isNeonHostname(config.hostname)
    ? [config.hostname, ...NEON_IPV4_FALLBACKS]
    : [config.hostname];

  let lastError;

  for (const address of addresses) {
    try {
      const pool = new Pool(buildPoolConfig(config, address));
      await pool.query('SELECT 1');

      pool.on('error', (err) => {
        console.error('Unexpected error on idle PostgreSQL client:', err.message);
      });

      console.log(`PostgreSQL connected: ${config.hostname} (${address})`);
      return pool;
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(
    `Unable to connect to PostgreSQL at "${config.hostname}". ` +
      `Tried ${addresses.join(', ')}. Last error: ${lastError?.message || 'unknown error'}`
  );
}

const poolPromise = createPool();

async function query(text, values) {
  const pool = await poolPromise;
  return pool.query(text, values);
}

async function connect() {
  const pool = await poolPromise;
  return pool.connect();
}

async function close() {
  const pool = await poolPromise;
  return pool.end();
}

module.exports = {
  ready: poolPromise,
  query,
  connect,
  close,
};
