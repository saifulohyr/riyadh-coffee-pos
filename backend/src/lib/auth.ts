import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'fallback-secret-key-for-development',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
  database: drizzleAdapter(db, {
    provider: 'mysql',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,

    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'cashier',
        input: true,
      },
    },
  },
});

export type Auth = typeof auth;
