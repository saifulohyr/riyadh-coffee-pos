import { useState, useEffect, useRef } from 'react'
import { cn, formatTime } from '@/lib/utils'
import { useOrderStore } from '@/stores/useOrderStore'
import { useTableStore } from '@/stores/useTableStore'
import { ORDER_STATUS_LABELS } from '@/types'
import { Clock, Check, Bell, Volume2, VolumeX } from 'lucide-react'

// Notification sound URL (free sound effect)
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'

export function KitchenPage() {
  const { orders, updateOrderItemStatus, updateOrderStatus, completeOrder } = useOrderStore()
  const { tables } = useTableStore()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const prevPendingCountRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const pendingOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready'
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const completedOrders = orders.filter((o) => o.status === 'completed').slice(0, 5)

  const pendingCount = orders.filter((o) => o.status === 'pending').length

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND)
    audioRef.current.volume = 0.7
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Play sound when NEW order arrives (pendingCount increases)
  useEffect(() => {
    if (soundEnabled && pendingCount > prevPendingCountRef.current && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Browser may block autoplay, user needs to interact first
        console.log('Sound blocked by browser. Click anywhere to enable.')
      })
    }
    prevPendingCountRef.current = pendingCount
  }, [pendingCount, soundEnabled])

  const getTimeSince = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000 / 60)
    if (diff < 1) return 'Baru saja'
    if (diff < 60) return `${diff} menit`
    return `${Math.floor(diff / 60)} jam`
  }

  const handleItemCheck = (orderId: string, productId: string, currentStatus: boolean) => {
    updateOrderItemStatus(orderId, productId, !currentStatus)
  }

  const handleStartPreparing = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing')
  }

  const handleComplete = (orderId: string) => {
    completeOrder(orderId)
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">👨‍🍳 Kitchen Display System</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Pantau dan kelola pesanan masuk</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]">
            <Bell className="w-5 h-5" />
            <span className="font-bold">{pendingCount} Orders Pending</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
              soundEnabled
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'
            )}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 14rem)' }}>
        {pendingOrders.map((order) => {
          const table = tables.find((t) => t.id === order.tableId)
          const allItemsCompleted = order.items.every((item) => item.isCompleted)
          
          return (
            <div
              key={order.id}
              className={cn(
                'bg-[hsl(var(--card))] rounded-2xl border-2 p-4 flex flex-col',
                order.status === 'pending' && 'border-red-500 animate-pulse',
                order.status === 'preparing' && 'border-yellow-500',
                order.status === 'ready' && 'border-green-500'
              )}
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={cn(
                    'text-xs font-bold px-2 py-1 rounded-full',
                    order.status === 'pending' && 'bg-red-500/20 text-red-400',
                    order.status === 'preparing' && 'bg-yellow-500/20 text-yellow-400',
                    order.status === 'ready' && 'bg-green-500/20 text-green-400'
                  )}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mt-2">ORDER {order.orderNumber}</h3>
                </div>
                <div className="text-right text-sm text-[hsl(var(--muted-foreground))]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(new Date(order.createdAt))}
                  </div>
                  <div className="text-xs">({getTimeSince(new Date(order.createdAt))})</div>
                </div>
              </div>

              {/* Location */}
              <div className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
                📍 {table ? `Meja ${table.number}` : 'Takeaway'}
              </div>

              {/* Items */}
              <div className="flex-1 space-y-2 mb-4">
                {order.items.map((item) => (
                  <button
                    key={item.productId}
                    onClick={() => handleItemCheck(order.id, item.productId, item.isCompleted)}
                    className={cn(
                      'w-full text-left p-2 rounded-lg transition-all',
                      item.isCompleted
                        ? 'bg-green-500/20 line-through opacity-60'
                        : 'bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))]'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-5 h-5 rounded border-2 flex items-center justify-center',
                        item.isCompleted ? 'bg-green-500 border-green-500' : 'border-[hsl(var(--muted-foreground))]'
                      )}>
                        {item.isCompleted && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        {item.quantity}x {item.productName}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-[hsl(var(--primary))] ml-7 mt-1">📝 {item.notes}</p>
                    )}
                  </button>
                ))}
              </div>

              {/* Action Button */}
              {order.status === 'pending' && (
                <button
                  onClick={() => handleStartPreparing(order.id)}
                  className="w-full py-2.5 rounded-xl font-semibold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Proses
                </button>
              )}
              {order.status === 'preparing' && allItemsCompleted && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'ready')}
                  className="w-full py-2.5 rounded-xl font-semibold bg-green-500 text-white hover:bg-green-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Siap Disajikan
                </button>
              )}
              {order.status === 'ready' && (
                <button
                  onClick={() => handleComplete(order.id)}
                  className="w-full py-2.5 rounded-xl font-semibold bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)] transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Selesai
                </button>
              )}
            </div>
          )
        })}

        {/* Completed Orders (Faded) */}
        {completedOrders.map((order) => (
          <div
            key={order.id}
            className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-4 opacity-40"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
                Selesai
              </span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{formatTime(new Date(order.createdAt))}</span>
            </div>
            <h3 className="font-bold text-[hsl(var(--foreground))]">ORDER {order.orderNumber}</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">✓ Semua item selesai</p>
          </div>
        ))}

        {pendingOrders.length === 0 && completedOrders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-[hsl(var(--muted-foreground))]">
            <span className="text-6xl mb-4">🍳</span>
            <p className="text-xl font-medium">Tidak ada pesanan</p>
            <p className="text-sm">Menunggu pesanan baru...</p>
          </div>
        )}
      </div>
    </div>
  )
}
