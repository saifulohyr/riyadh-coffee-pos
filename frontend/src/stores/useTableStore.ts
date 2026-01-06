import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Table, TableStatus } from '@/types'
import { sampleTables } from '@/data/sample-data'

interface TableState {
  tables: Table[]
  
  // Actions
  updateTableStatus: (tableId: string, status: TableStatus, orderId?: string) => void
  getTableById: (tableId: string) => Table | undefined
  getTablesByArea: (area: 'indoor' | 'outdoor') => Table[]
  getAvailableTables: () => Table[]
  resetTables: () => void
}

export const useTableStore = create<TableState>()(
  persist(
    (set, get) => ({
      tables: sampleTables,

      updateTableStatus: (tableId, status, orderId) => {
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === tableId
              ? { 
                  ...table, 
                  status, 
                  currentOrderId: status === 'available' ? undefined : orderId 
                }
              : table
          ),
        }))
      },

      getTableById: (tableId) => {
        return get().tables.find((t) => t.id === tableId)
      },

      getTablesByArea: (area) => {
        return get().tables.filter((t) => t.area === area)
      },

      getAvailableTables: () => {
        return get().tables.filter((t) => t.status === 'available')
      },

      resetTables: () => {
        set({ tables: sampleTables })
      },
    }),
    {
      name: 'pos-table-storage',
    }
  )
)
