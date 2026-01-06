import { db, pool } from '../db/index.js';
import { products, transactions, type TransactionItem } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Input types
export interface CartItem {
  productId: number;
  quantity: number;
}

export interface TransactionInput {
  items: CartItem[];
  amountReceived: number;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  validatedItems: TransactionItem[];
  subtotal: number;
}

// Transaction result
export interface TransactionResult {
  id: string;
  createdAt: Date;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  amountReceived: number;
  changeAmount: number;
  items: TransactionItem[];
}

class TransactionService {
  /**
   * Get tax rate from environment (11% PPN)
   */
  private getTaxRate(): number {
    return Number(process.env.TAX_RATE) || 0.11;
  }

  /**
   * Validate stock availability for all items in the cart
   */
  async validateStock(items: CartItem[]): Promise<ValidationResult> {
    const errors: string[] = [];
    const validatedItems: TransactionItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      // Get product from database
      const productResult = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId));
      
      const product = productResult[0];

      if (!product) {
        errors.push(`Product with ID ${item.productId} not found`);
        continue;
      }

      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for ${product.name}: ${item.quantity}`);
        continue;
      }

      const currentStock = Number(product.stock);
      if (currentStock < item.quantity) {
        errors.push(
          `Insufficient stock for ${product.name}: requested ${item.quantity}, available ${currentStock}`
        );
        continue;
      }

      // Calculate item total
      const price = Number(product.price);
      const total = price * item.quantity;
      subtotal += total;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        price: price,
        total: total,
      });
    }

    return {
      valid: errors.length === 0 && validatedItems.length > 0,
      errors,
      validatedItems,
      subtotal,
    };
  }

  /**
   * Calculate 11% PPN tax
   */
  calculateTax(subtotal: number): number {
    const taxRate = this.getTaxRate();
    return Math.round(subtotal * taxRate * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate change amount
   */
  calculateChange(grandTotal: number, amountReceived: number): number {
    return Math.round((amountReceived - grandTotal) * 100) / 100;
  }

  /**
   * Process a complete transaction
   * 1. Validate stock
   * 2. Calculate subtotal, tax, grand total
   * 3. Calculate change
   * 4. Create transaction record
   * 5. Decrement stock atomically
   */
  async processTransaction(data: TransactionInput): Promise<TransactionResult> {
    // Step 1: Validate stock
    const validation = await this.validateStock(data.items);
    
    if (!validation.valid) {
      throw new Error(validation.errors.join('; '));
    }

    // Step 2: Calculate amounts
    const subtotal = validation.subtotal;
    const taxAmount = this.calculateTax(subtotal);
    const grandTotal = subtotal + taxAmount;

    // Step 3: Validate payment
    if (data.amountReceived < grandTotal) {
      throw new Error(
        `Insufficient payment: received ${data.amountReceived}, required ${grandTotal}`
      );
    }

    const changeAmount = this.calculateChange(grandTotal, data.amountReceived);

    // Step 4 & 5: Create transaction and decrement stock atomically
    const transactionId = uuidv4();
    const createdAt = new Date();

    // Get a connection from pool for transaction
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Insert transaction record
      await connection.execute(
        `INSERT INTO transactions (id, created_at, subtotal, tax_amount, grand_total, amount_received, change_amount, items)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transactionId,
          createdAt,
          subtotal.toFixed(2),
          taxAmount.toFixed(2),
          grandTotal.toFixed(2),
          data.amountReceived.toFixed(2),
          changeAmount.toFixed(2),
          JSON.stringify(validation.validatedItems),
        ]
      );

      // Decrement stock for each item
      for (const item of validation.validatedItems) {
        await connection.execute(
          `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`,
          [item.quantity, item.productId, item.quantity]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return {
      id: transactionId,
      createdAt,
      subtotal,
      taxAmount,
      grandTotal,
      amountReceived: data.amountReceived,
      changeAmount,
      items: validation.validatedItems,
    };
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string) {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return result[0] || null;
  }

  /**
   * Get all transactions
   */
  async getAllTransactions() {
    return await db.select().from(transactions).orderBy(sql`created_at DESC`);
  }
}

export const transactionService = new TransactionService();
