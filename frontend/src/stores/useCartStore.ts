import { create } from 'zustand'
import { TAX_RATE } from '@/types'
import type { CartItem, Product, OrderType } from '@/types'

// const TAX_RATE_VALUE = 0.1 // Removed local constant

interface CartState {
  items: CartItem[]
  orderType: OrderType
  selectedTableId: string | null
  
  // Computed values
  subtotal: number
  tax: number
  total: number
  
  // Payment
  cashAmount: number
  change: number
  
  // Actions
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateNotes: (productId: string, notes: string) => void
  clearCart: () => void
  
  setOrderType: (type: OrderType) => void
  setSelectedTable: (tableId: string | null) => void
  setCashAmount: (amount: number) => void
  
  // Helpers
  getItemCount: () => number
}

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + tax
  return { subtotal, tax, total }
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  orderType: 'dine-in',
  selectedTableId: null,
  subtotal: 0,
  tax: 0,
  total: 0,
  cashAmount: 0,
  change: 0,

  addItem: (product) => {
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.product.id === product.id
      )

      let newItems: CartItem[]
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newItems = [...state.items, { product, quantity: 1, notes: '' }]
      }

      const totals = calculateTotals(newItems)
      return {
        items: newItems,
        ...totals,
        change: state.cashAmount - totals.total,
      }
    })
  },

  removeItem: (productId) => {
    set((state) => {
      const newItems = state.items.filter(
        (item) => item.product.id !== productId
      )
      const totals = calculateTotals(newItems)
      return {
        items: newItems,
        ...totals,
        change: state.cashAmount - totals.total,
      }
    })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }

    set((state) => {
      const newItems = state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
      const totals = calculateTotals(newItems)
      return {
        items: newItems,
        ...totals,
        change: state.cashAmount - totals.total,
      }
    })
  },

  updateNotes: (productId, notes) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, notes } : item
      ),
    }))
  },

  clearCart: () => {
    set({
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      cashAmount: 0,
      change: 0,
      selectedTableId: null,
    })
  },

  setOrderType: (type) => {
    set({ orderType: type, selectedTableId: type === 'takeaway' ? null : get().selectedTableId })
  },

  setSelectedTable: (tableId) => {
    set({ selectedTableId: tableId })
  },

  setCashAmount: (amount) => {
    set((state) => ({
      cashAmount: amount,
      change: amount - state.total,
    }))
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },
}))
