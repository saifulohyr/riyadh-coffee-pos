import { db } from '../db/index.js';
import { transactions } from '../db/schema.js';
import { sql, gte, lte, and } from 'drizzle-orm';

export interface DailySalesReport {
  date: string;
  totalTransactions: number;
  totalSubtotal: number;
  totalTax: number;
  totalGrandTotal: number;
}

class ReportService {
  /**
   * Get today's sales summary
   */
  async getTodaySales(): Promise<DailySalesReport> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const result = await db
      .select({
        totalTransactions: sql<number>`COUNT(*)`,
        totalSubtotal: sql<number>`COALESCE(SUM(subtotal), 0)`,
        totalTax: sql<number>`COALESCE(SUM(tax_amount), 0)`,
        totalGrandTotal: sql<number>`COALESCE(SUM(grand_total), 0)`,
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.createdAt, startOfDay),
          lte(transactions.createdAt, endOfDay)
        )
      );

    const report = result[0];

    return {
      date: today.toISOString().split('T')[0],
      totalTransactions: Number(report?.totalTransactions) || 0,
      totalSubtotal: Number(report?.totalSubtotal) || 0,
      totalTax: Number(report?.totalTax) || 0,
      totalGrandTotal: Number(report?.totalGrandTotal) || 0,
    };
  }

  /**
   * Get sales report for a specific date range
   */
  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<DailySalesReport[]> {
    const result = await db
      .select({
        date: sql<string>`DATE(created_at)`,
        totalTransactions: sql<number>`COUNT(*)`,
        totalSubtotal: sql<number>`SUM(subtotal)`,
        totalTax: sql<number>`SUM(tax_amount)`,
        totalGrandTotal: sql<number>`SUM(grand_total)`,
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.createdAt, startDate),
          lte(transactions.createdAt, endDate)
        )
      )
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at) DESC`);

    return result.map((row) => ({
      date: String(row.date),
      totalTransactions: Number(row.totalTransactions) || 0,
      totalSubtotal: Number(row.totalSubtotal) || 0,
      totalTax: Number(row.totalTax) || 0,
      totalGrandTotal: Number(row.totalGrandTotal) || 0,
    }));
  }

  /**
   * Get all transactions for today with details
   */
  async getTodayTransactions() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    return await db
      .select()
      .from(transactions)
      .where(
        and(
          gte(transactions.createdAt, startOfDay),
          lte(transactions.createdAt, endOfDay)
        )
      )
      .orderBy(sql`created_at DESC`);
  }
}

export const reportService = new ReportService();
