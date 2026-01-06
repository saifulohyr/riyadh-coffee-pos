import { 
  mysqlTable, 
  int, 
  varchar, 
  decimal, 
  timestamp, 
  json,
  text
} from 'drizzle-orm/mysql-core';

// ============================================
// Products Table
// ============================================
export const products = mysqlTable('products', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  stock: int('stock').notNull().default(0),
  description: text('description'),
});

// ============================================
// Transactions Table
// ============================================
export interface TransactionItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export const transactions = mysqlTable('transactions', {
  id: varchar('id', { length: 36 }).primaryKey(), // UUID
  createdAt: timestamp('created_at').defaultNow().notNull(),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).notNull(),
  grandTotal: decimal('grand_total', { precision: 12, scale: 2 }).notNull(),
  amountReceived: decimal('amount_received', { precision: 12, scale: 2 }).notNull(),
  changeAmount: decimal('change_amount', { precision: 12, scale: 2 }).notNull(),
  items: json('items').$type<TransactionItem[]>().notNull(),
});

// ============================================
// Better Auth Tables - Users
// ============================================
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  image: varchar('image', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  role: varchar('role', { length: 50 }).default('cashier').notNull(), // 'admin' | 'cashier'
});

// ============================================
// Better Auth Tables - Sessions
// ============================================
export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
});

// ============================================
// Better Auth Tables - Accounts (for OAuth)
// ============================================
export const accounts = mysqlTable('accounts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: varchar('scope', { length: 255 }),
  password: varchar('password', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});



// Type exports
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
