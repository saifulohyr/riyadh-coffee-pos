import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order, OrderStatus, OrderItem } from '@/types'
import { generateOrderId } from '@/lib/utils'
import { useCartStore } from './useCartStore'
import { useTableStore } from './useTableStore'
import { useAuthStore } from './useAuthStore'
import { transactionApi } from '@/services/transactionApi'
import { useProductStore } from './useProductStore'

interface OrderState {
  orders: Order[]
  orderCounter: number
  isProcessing: boolean
  
  // Actions
  createOrder: () => Promise<Order | null>
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  updateOrderItemStatus: (orderId: string, productId: string, isCompleted: boolean) => void
  completeOrder: (orderId: string) => void
  cancelOrder: (orderId: string) => void
  
  // Queries
  getOrderById: (orderId: string) => Order | undefined
  getPendingOrders: () => Order[]
  getCompletedOrders: () => Order[]
  getTodayOrders: () => Order[]
  getOrdersByDate: (date: Date) => Order[]
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      orderCounter: 1,
      isProcessing: false,

      createOrder: async () => {
        const cartStore = useCartStore.getState()
        const authStore = useAuthStore.getState()
        const tableStore = useTableStore.getState()
        const productStore = useProductStore.getState()

        if (cartStore.items.length === 0) return null
        if (cartStore.cashAmount < cartStore.total) return null

        set({ isProcessing: true })

        try {
          // Call backend API to process transaction
          const result = await transactionApi.processTransaction(
            cartStore.items.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
            cartStore.cashAmount
          )

          const orderNumber = String(get().orderCounter).padStart(4, '0')
          
          const orderItems: OrderItem[] = cartStore.items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            notes: item.notes,
            isCompleted: false,
          }))

          const newOrder: Order = {
            id: result.id, // Use transaction ID from backend
            orderNumber: `#${orderNumber}`,
            type: cartStore.orderType,
            tableId: cartStore.selectedTableId || undefined,
            items: orderItems,
            subtotal: result.subtotal,
            tax: result.taxAmount,
            total: result.grandTotal,
            cashAmount: result.amountReceived,
            change: result.changeAmount,
            status: 'pending',
            createdAt: new Date(result.createdAt),
            cashierName: authStore.session?.user.name || 'Unknown',
          }

          // Update table status if dine-in
          if (cartStore.orderType === 'dine-in' && cartStore.selectedTableId) {
            tableStore.updateTableStatus(cartStore.selectedTableId, 'occupied', newOrder.id)
          }

          set((state) => ({
            orders: [newOrder, ...state.orders],
            orderCounter: state.orderCounter + 1,
            isProcessing: false,
          }))

          // Clear cart after order
          cartStore.clearCart()
          
          // Refresh products to get updated stock
          productStore.fetchProducts()

          return newOrder
        } catch (error) {
          console.error('Failed to create order:', error)
          set({ isProcessing: false })
          throw error
        }
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { 
                  ...order, 
                  status,
                  completedAt: status === 'completed' ? new Date() : order.completedAt 
                }
              : order
          ),
        }))
      },

      updateOrderItemStatus: (orderId, productId, isCompleted) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.productId === productId
                      ? { ...item, isCompleted }
                      : item
                  ),
                }
              : order
          ),
        }))

        // Check if all items are completed
        const order = get().getOrderById(orderId)
        if (order && order.items.every((item) => item.isCompleted)) {
          get().updateOrderStatus(orderId, 'ready')
        }
      },

      completeOrder: (orderId) => {
        const order = get().getOrderById(orderId)
        if (!order) return

        // Note: Table is NOT freed automatically. Cashier must manually set it to available.

        get().updateOrderStatus(orderId, 'completed')
      },

      cancelOrder: (orderId) => {
        const order = get().getOrderById(orderId)
        if (!order) return

        // Free up table if dine-in
        if (order.type === 'dine-in' && order.tableId) {
          const tableStore = useTableStore.getState()
          tableStore.updateTableStatus(order.tableId, 'available')
        }

        get().updateOrderStatus(orderId, 'cancelled')
      },

      getOrderById: (orderId) => {
        return get().orders.find((o) => o.id === orderId)
      },

      getPendingOrders: () => {
        return get().orders.filter(
          (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
        )
      },

      getCompletedOrders: () => {
        return get().orders.filter((o) => o.status === 'completed')
      },

      getTodayOrders: () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return get().orders.filter((o) => new Date(o.createdAt) >= today)
      },

      getOrdersByDate: (date) => {
        const start = new Date(date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(date)
        end.setHours(23, 59, 59, 999)
        
        return get().orders.filter((o) => {
          const orderDate = new Date(o.createdAt)
          return orderDate >= start && orderDate <= end
        })
      },
    }),
    {
      name: 'pos-order-storage',
      partialize: (state) => ({
        orders: state.orders,
        orderCounter: state.orderCounter,
      }),
    }
  )
)
