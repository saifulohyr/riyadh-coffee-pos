import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  });

  try {
    console.log('🔄 Adding description column to products table...');
    
    // Check if column exists first to avoid error
    const [columns] = await connection.execute('SHOW COLUMNS FROM products LIKE "description"');
    if ((columns as any[]).length > 0) {
      console.log('⚠️ Column description already exists. Skipping.');
    } else {
      await connection.execute('ALTER TABLE products ADD COLUMN description TEXT');
      console.log('✅ Column description added successfully.');
    }

  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    await connection.end();
  }
}

main();
