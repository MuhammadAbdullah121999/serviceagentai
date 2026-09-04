import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import pool from './src/database/connection.js';

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    const schemaPath = path.join(process.cwd(), 'src/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    await pool.query(schema);

    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' ORDER BY table_name`
    );

    console.log('Done. Tables:', tables.rows.map(r => r.table_name).join(', '));
  } catch (error: any) {
    console.error('Setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setupDatabase();