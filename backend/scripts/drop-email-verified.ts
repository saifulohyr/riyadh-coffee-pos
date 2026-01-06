
import { pool } from '../src/db/index.js';

async function dropColumn() {
  console.log('Running migration: drop email_verified...');
  try {
    await pool.execute('ALTER TABLE users DROP COLUMN email_verified');
    console.log('✅ Successfully dropped email_verified column');
  } catch (e: any) {
    if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.log('⚠️  Column email_verified does not exist (already dropped).');
    } else {
      console.error('❌ Error dropping column:', e.message);
    }
  } finally {
    process.exit(0);
  }
}

dropColumn();
