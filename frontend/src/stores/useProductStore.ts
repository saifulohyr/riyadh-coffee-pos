import { create } from 'zustand'
import type { Product, Category } from '@/types'
import { productService } from '@/services/productService'

interface ProductState {
  products: Product[]
  categories: Category[]
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchProducts: () => Promise<void>
  addProduct: (product: Product) => Promise<void>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  
  // Categories (keeping sync for now or can populate from service too)
  fetchCategories: () => Promise<void>
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null })
    try {
      const products = await productService.getProducts()
      set({ products, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await productService.getCategories()
      set({ categories })
    } catch (error) {
      console.error('Failed to fetch categories', error)
    }
  },

  addProduct: async (product) => {
    set({ isLoading: true, error: null })
    try {
      const newProduct = await productService.createProduct(product)
      set((state) => ({ 
        products: [...state.products, newProduct],
        isLoading: false 
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateProduct: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const updatedProduct = await productService.updateProduct(id, updates)
      set((state) => ({
        products: state.products.map((p) => p.id === id ? updatedProduct : p),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await productService.deleteProduct(id)
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
}))
