import dotenv from 'dotenv';
dotenv.config();

import pool from './src/database/connection.js';

async function test() {
  const url = process.env.DATABASE_URL ?? '';
  console.log('Host:', url.split('@')[1]?.split('?')[0] ?? 'NOT SET');

  try {
    const res = await pool.query('SELECT NOW() as time, current_database() as db');
    console.log('Connected');
    console.log('Database:', res.rows[0].db);
    console.log('Server time:', res.rows[0].time);

    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' ORDER BY table_name`
    );
    console.log('Tables:', tables.rows.length ? tables.rows.map(r => r.table_name).join(', ') : '(none yet)');
  } catch (err: any) {
    console.error('FAILED:', err.message);
  } finally {
    await pool.end();
  }
}

test();