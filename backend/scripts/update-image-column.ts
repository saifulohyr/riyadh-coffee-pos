import 'dotenv/config';
import mysql from 'mysql2/promise';

async function updateImageColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  });

  try {
    // Change imageUrl column from VARCHAR(500) to LONGTEXT for base64 images
    await connection.execute('ALTER TABLE products MODIFY COLUMN image_url LONGTEXT');
    console.log('✅ image_url column changed to LONGTEXT');
    console.log('📷 Database now supports base64 image storage!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

updateImageColumn();
