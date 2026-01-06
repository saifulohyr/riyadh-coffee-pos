
import { pool } from '../src/db/index.js';

async function dropTable() {
  console.log('running migration: drop verifications table...');
  try {
    await pool.execute('DROP TABLE IF EXISTS verifications');
    console.log('✅ successfully dropped verifications table');
  } catch (e: any) {
    console.error('❌ error dropping table:', e.message);
  } finally {
    process.exit(0);
  }
}

dropTable();
