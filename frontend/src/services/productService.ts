import type { Product, Category } from '@/types'
import { apiGet, apiPost, apiPut, apiDelete } from './api'

// Backend product type (matches database)
interface BackendProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  description: string | null;
}

// Transform backend product to frontend Product type
const transformProduct = (bp: BackendProduct): Product => ({
  id: String(bp.id),
  name: bp.name,
  categoryId: bp.category.toLowerCase().replace(/\s+/g, '-'),
  price: parseFloat(bp.price),
  stock: bp.stock,
  description: bp.description || undefined,
  isAvailable: bp.stock > 0,
})

// Static categories
const defaultCategories: Category[] = [
  { id: 'all', name: 'All', icon: 'Package', order: 0 },
  { id: 'coffee', name: 'Coffee', icon: 'Coffee', order: 1 },
  { id: 'food', name: 'Food', icon: 'Utensils', order: 2 },
  { id: 'tea', name: 'Tea', icon: 'GlassWater', order: 3 },
  { id: 'pastry', name: 'Pastry', icon: 'IceCream', order: 4 },
]

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const products = await apiGet<BackendProduct[]>('/api/products')
    return products.map(transformProduct)
  },

  getCategories: async (): Promise<Category[]> => {
    return defaultCategories
  },

  createProduct: async (product: Product): Promise<Product> => {
    // Convert stock: 'unlimited' -> 9999, number -> number
    const stockValue = product.stock === 'unlimited' ? 9999 : (typeof product.stock === 'number' ? product.stock : 0)
    
    const payload = {
      name: product.name,
      category: product.categoryId.charAt(0).toUpperCase() + product.categoryId.slice(1),
      price: product.price,
      stock: stockValue,
      description: product.description || null,
    }

    const result = await apiPost<{ id: number }>('/api/products', payload)
    
    return {
      ...product,
      id: String(result.id),
      stock: stockValue,
      isAvailable: stockValue > 0,
    }
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    const payload: Record<string, unknown> = {}
    
    if (updates.name) payload.name = updates.name
    if (updates.categoryId) {
      payload.category = updates.categoryId.charAt(0).toUpperCase() + updates.categoryId.slice(1)
    }
    if (updates.price !== undefined) payload.price = updates.price
    if (updates.stock !== undefined) {
      payload.stock = updates.stock === 'unlimited' ? 9999 : (typeof updates.stock === 'number' ? updates.stock : 0)
    }
    if (updates.description !== undefined) payload.description = updates.description || null

    await apiPut(`/api/products/${id}`, payload)
    
    // Fetch updated product to return complete data
    const products = await apiGet<BackendProduct[]>('/api/products')
    const updated = products.find(p => String(p.id) === id)
    if (updated) {
      return transformProduct(updated)
    }
    
    // Fallback if not found
    const stock = typeof payload.stock === 'number' ? payload.stock : 0
    return {
      id,
      name: updates.name || '',
      categoryId: updates.categoryId || '',
      price: updates.price || 0,
      stock,
      description: updates.description,
      isAvailable: stock > 0,
    }
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    await apiDelete(`/api/products/${id}`)
    return true
  },
}
