import 'dotenv/config';
import mysql from 'mysql2/promise';

async function resetProducts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  });

  try {
    // Delete all products
    await connection.execute('DELETE FROM products');
    console.log('✅ All products deleted');

    // Reset auto increment to 1
    await connection.execute('ALTER TABLE products AUTO_INCREMENT = 1');
    console.log('✅ AUTO_INCREMENT reset to 1');

    console.log('\n📦 Database is now empty and ready for fresh products!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

resetProducts();
