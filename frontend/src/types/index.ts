// ============================================
// POS Cafe - TypeScript Interfaces
// ============================================

// User & Authentication
export interface User {
  id: string
  username: string
  email: string
  name: string
  role: 'cashier' | 'kitchen' | 'admin'
  avatar?: string
}

export interface Session {
  user: User
  startTime: Date
  isActive: boolean
}

// Product & Category
export interface Category {
  id: string
  name: string
  icon: string
  order: number
}

export interface Product {
  id: string
  name: string
  price: number
  categoryId: string
  stock: number | 'unlimited'
  isAvailable: boolean
  description?: string
}

// Cart & Order
export interface CartItem {
  product: Product
  quantity: number
  notes: string
}

export interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  notes: string
  isCompleted: boolean
}

export type OrderType = 'dine-in' | 'takeaway'

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'

export interface Order {
  id: string
  orderNumber: string
  type: OrderType
  tableId?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  cashAmount: number
  change: number
  status: OrderStatus
  createdAt: Date
  completedAt?: Date
  cashierName: string
}

// Table Management
export type TableStatus = 'available' | 'occupied'

export interface Table {
  id: string
  number: string
  capacity: number
  status: TableStatus
  area: 'indoor' | 'outdoor'
  currentOrderId?: string
}

// Reports
export interface DailySummary {
  date: string
  totalRevenue: number
  totalTax: number
  totalTransactions: number
  averageOrderValue: number
}

// App Constants
export const TAX_RATE = 0.11 // 11%

export const QUICK_CASH_AMOUNTS = [50000, 100000, 150000, 200000, 250000, 300000]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Menunggu',
  preparing: 'Diproses',
  ready: 'Siap',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export const TABLE_STATUS_COLORS: Record<TableStatus, string> = {
  available: 'bg-green-500',
  occupied: 'bg-red-500',
}
