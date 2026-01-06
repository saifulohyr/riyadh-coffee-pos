import { db } from '../db/index.js';
import { products, type Product } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';

class ProductService {
  /**
   * Get all products from the database
   */
  async getAllProducts(): Promise<Product[]> {
    const result = await db.select().from(products);
    return result;
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: number): Promise<Product | null> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0] || null;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.category, category));
    return result;
  }

  /**
   * Update product stock
   */
  async updateStock(productId: number, quantity: number): Promise<void> {
    await db
      .update(products)
      .set({ stock: quantity })
      .where(eq(products.id, productId));
  }

  /**
   * Decrement product stock by a certain amount
   */
  async decrementStock(productId: number, amount: number): Promise<void> {
    await db
      .update(products)
      .set({ stock: sql`${products.stock} - ${amount}` })
      .where(eq(products.id, productId));
  }

  /**
   * Check if product has sufficient stock
   */
  async hasStock(productId: number, requiredAmount: number): Promise<boolean> {
    const product = await this.getProductById(productId);
    if (!product) return false;
    return Number(product.stock) >= requiredAmount;
  }

  /**
   * Create a new product
   */
  async createProduct(data: {
    name: string;
    category: string;
    price: string;
    stock: number;
    description?: string;
  }): Promise<number> {
    const result = await db.insert(products).values({
      name: data.name,
      category: data.category,
      price: data.price,
      stock: data.stock,
      description: data.description,
    });
    return result[0].insertId;
  }

  /**
   * Update a product
   */
  async updateProduct(
    id: number,
    data: Partial<{
      name: string;
      category: string;
      price: string;
      stock: number;
      description: string;
    }>
  ): Promise<void> {
    await db.update(products).set(data).where(eq(products.id, id));
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }
}

export const productService = new ProductService();
