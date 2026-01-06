import { forwardRef } from 'react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { Order } from '@/types'

interface ReceiptProps {
  order: Order
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ order }, ref) => {
  return (
    <div ref={ref} className="print-receipt w-[80mm] bg-white text-black p-4 font-mono text-xs leading-tight">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold mb-1">RIYADH COFFEE</h1>
        <p className="text-[10px]">Jl. Kenangan No. 88, Jakarta</p>
        <p className="text-[10px]">Tel: 021-555-8888</p>
      </div>

      {/* Info */}
      <div className="border-b border-dashed border-black pb-2 mb-2">
        <div className="flex justify-between">
          <span>Order: {order.orderNumber}</span>
          <span>{formatDateTime(new Date(order.createdAt))}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir: {order.cashierName}</span>
          <span>{order.tableId ? `Meja: ${order.tableId}` : 'Takeaway'}</span>
        </div>
      </div>

      {/* Items */}
      <div className="border-b border-dashed border-black pb-2 mb-2 space-y-1">
        {order.items.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between font-medium">
              <span>
                {item.quantity}x {item.productName}
              </span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
            {item.notes && (
              <p className="text-[10px] italic text-gray-600 pl-4">- {item.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-b border-dashed border-black pb-2 mb-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Pajak (11%)</span>
          <span>{formatCurrency(order.tax)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold pt-1 border-t border-dashed border-gray-400 mt-1">
          <span>TOTAL</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="border-b border-dashed border-black pb-2 mb-4 space-y-1">
        <div className="flex justify-between">
          <span>Tunai</span>
          <span>{formatCurrency(order.cashAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kembalian</span>
          <span>{formatCurrency(order.change)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center space-y-1">
        <p className="font-bold">TERIMA KASIH</p>
        <p className="text-[10px]">Silakan datang kembali!</p>
        <p className="text-[10px] mt-2">Wifi: RiyadhWIFI | Pass: riyadhxxx</p>
      </div>
    </div>
  )
})

Receipt.displayName = 'Receipt'
