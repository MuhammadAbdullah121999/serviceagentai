import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Check backend/.env');
}

const isCloud =
  connectionString.includes('neon.tech') ||
  connectionString.includes('rlwy.net') ||
  connectionString.includes('railway.app');

const pool = new Pool({
  connectionString,
  ssl: isCloud ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

export default pool;