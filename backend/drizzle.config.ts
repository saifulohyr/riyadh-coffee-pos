import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '3306';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'riyadh_coffee_db';

// Build connection URL for drizzle-kit
const url = `mysql://${user}:${password}@${host}:${port}/${database}`;

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    url,
  },
});
