import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';

// Support both DATABASE_URL (cloud) and individual vars (local)
const getConnectionConfig = () => {
  if (process.env.DATABASE_URL) {
    // Cloud deployment (Aiven, PlanetScale, etc.)
    return {
      uri: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: true
      }
    };
  }
  
  // Local development
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  };
};

const pool = mysql.createPool({
  ...getConnectionConfig(),
  waitForConnections: true,
  connectionLimit: 10,
});

export const db = drizzle(pool, { schema, mode: 'default' });

export { pool };
