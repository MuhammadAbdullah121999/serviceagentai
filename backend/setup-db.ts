import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pg from 'pg';


const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
  try {
    console.log('📦 Setting up database...');
    
    // Read schema file
    const schemaPath = path.join(process.cwd(), 'src/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('✅ Database setup complete!');
    console.log('✅ Tables created: users, service_requests');
    console.log('✅ Indexes created');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    await pool.end();
    process.exit(1);
  }
}

setupDatabase();