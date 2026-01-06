import { cn } from '@/lib/utils'
import { useTableStore } from '@/stores/useTableStore'
import { useOrderStore } from '@/stores/useOrderStore'
import { TABLE_STATUS_COLORS } from '@/types'
import { Users, MapPin } from 'lucide-react'

export function TablesPage() {
  const { tables, updateTableStatus } = useTableStore()
  const { orders } = useOrderStore()

  const indoorTables = tables.filter((t) => t.area === 'indoor')
  const outdoorTables = tables.filter((t) => t.area === 'outdoor')

  const availableCount = tables.filter((t) => t.status === 'available').length
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length

  const getTableOrder = (tableId: string) => {
    return orders.find((o) => o.tableId === tableId && o.status !== 'completed' && o.status !== 'cancelled')
  }

  const handleTableClick = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId)
    if (!table) return

    // Toggle between available and occupied for demo purposes
    if (table.status === 'available') {
      // Do nothing - need to create order from POS
    } else if (table.status === 'occupied') {
      updateTableStatus(tableId, 'available')
    }
  }

  const TableGrid = ({ tableList, title }: { tableList: typeof tables; title: string }) => (
    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
      <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-[hsl(var(--primary))]" />
        {title}
      </h3>
      <div className="grid grid-cols-5 gap-4">
        {tableList.map((table) => {
          const order = getTableOrder(table.id)
          return (
            <button
              key={table.id}
              onClick={() => handleTableClick(table.id)}
              className={cn(
                'aspect-square rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105',
                'border-2',
                table.status === 'available' && 'bg-green-500/20 border-green-500 text-green-400',
                table.status === 'occupied' && 'bg-red-500/20 border-red-500 text-red-400'
              )}
            >
              <div className={cn(
                'w-4 h-4 rounded-full',
                TABLE_STATUS_COLORS[table.status]
              )} />
              <span className="text-xl font-bold text-[hsl(var(--foreground))]">{table.number}</span>
              <div className="flex items-center gap-1 text-xs">
                <Users className="w-3 h-3" />
                <span>{table.capacity} pax</span>
              </div>
              {order && (
                <span className="text-[10px] opacity-75">{order.orderNumber}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">🪑 Manajemen Meja</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Pantau status meja secara real-time</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Kosong ({availableCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-sm text-[hsl(var(--muted-foreground))]">Terisi ({occupiedCount})</span>
          </div>
        </div>
      </div>

      {/* Table Maps */}
      <TableGrid tableList={indoorTables} title="Area Indoor" />
      <TableGrid tableList={outdoorTables} title="Area Outdoor" />

      {/* Summary */}
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-4">
        <p className="text-center text-[hsl(var(--muted-foreground))]">
          📊 Ringkasan: <span className="text-green-400 font-medium">{availableCount} Kosong</span> | 
          <span className="text-red-400 font-medium"> {occupiedCount} Terisi</span>
        </p>
      </div>
    </div>
  )
}
