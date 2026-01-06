import { useState } from 'react'
import { cn, formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { useOrderStore } from '@/stores/useOrderStore'
import { useTableStore } from '@/stores/useTableStore'
import { ORDER_STATUS_LABELS, type Order } from '@/types'
import { Calendar, TrendingUp, Receipt, DollarSign, ChevronLeft, ChevronRight, FileText, Eye, X, Download } from 'lucide-react'

export function ReportsPage() {
  const { orders, getTodayOrders, getOrdersByDate } = useOrderStore()
  const { tables } = useTableStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const todayOrders = getTodayOrders()
  const displayOrders = getOrdersByDate(selectedDate)
  
  const completedOrders = displayOrders.filter((o) => o.status === 'completed')
  
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0)
  const totalTax = completedOrders.reduce((sum, o) => sum + o.tax, 0)
  const totalTransactions = completedOrders.length
  const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  const handleExport = () => {
    // Helper to format currency for Excel
    const formatMoney = (amount: number) => {
      // Return raw number for calculation but formatted as string for display
      return formatCurrency(amount)
    }

    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Laporan Penjualan</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #4ade80; color: white; border: 1px solid #000; padding: 10px; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
          .money { text-align: right; }
          .center { text-align: center; }
          .items { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th style="background-color: #166534; color: white;">Order ID</th>
              <th style="background-color: #166534; color: white;">Tanggal</th>
              <th style="background-color: #166534; color: white;">Waktu</th>
              <th style="background-color: #166534; color: white;">Meja</th>
              <th style="background-color: #166534; color: white;">Kasir</th>
              <th style="background-color: #166534; color: white;">Items</th>
              <th style="background-color: #166534; color: white;">Total</th>
              <th style="background-color: #166534; color: white;">Pajak</th>
              <th style="background-color: #166534; color: white;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${displayOrders.map(order => {
              const table = tables.find(t => t.id === order.tableId)
              const itemsList = order.items
                .map(item => `• ${item.productName} (${item.quantity}x) - ${item.notes ? '[' + item.notes + ']' : ''}`)
                .join('<br>')
              
              return `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${formatDate(new Date(order.createdAt))}</td>
                  <td class="center">${formatTime(new Date(order.createdAt))}</td>
                  <td>${table ? table.number : 'Takeaway'}</td>
                  <td>${order.cashierName}</td>
                  <td class="items">${itemsList}</td>
                  <td class="money">${formatMoney(order.total)}</td>
                  <td class="money">${formatMoney(order.tax)}</td>
                  <td class="center">${ORDER_STATUS_LABELS[order.status]}</td>
                </tr>
              `
            }).join('')}
          </tbody>
          <tfoot>
             <tr>
               <td colspan="6" style="text-align: right; font-weight: bold; background-color: #f3f4f6;">TOTAL PENDAPATAN</td>
               <td class="money" style="font-weight: bold; background-color: #f3f4f6;">${formatMoney(totalRevenue)}</td>
               <td colspan="2" style="background-color: #f3f4f6;"></td>
             </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `
    
    // Create download link with .xls extension (Excel recognizes HTML content)
    const blob = new Blob([tableContent], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Laporan_Penjualan_${formatDate(selectedDate).replace(/\s/g, '_')}.xls`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">📊 Laporan Penjualan</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Rekap dan analisis penjualan</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={displayOrders.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(-1)}
              className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center gap-2 min-w-[180px] justify-center">
              <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <span className="font-medium text-[hsl(var(--foreground))]">
                {isToday ? 'Hari Ini' : formatDate(selectedDate)}
              </span>
            </div>
            <button
              onClick={() => changeDate(1)}
              disabled={isToday}
              className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary)/0.2)] flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[hsl(var(--primary))]" />
            </div>
            <span className="text-[hsl(var(--muted-foreground))]">Total Pendapatan</span>
          </div>
          <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{formatCurrency(totalRevenue)}</p>
        </div>

        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-[hsl(var(--muted-foreground))]">Total Transaksi</span>
          </div>
          <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{totalTransactions}</p>
        </div>

        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-[hsl(var(--muted-foreground))]">Total Pajak</span>
          </div>
          <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{formatCurrency(totalTax)}</p>
        </div>

        <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-[hsl(var(--muted-foreground))]">Rata-rata/Order</span>
          </div>
          <p className="text-3xl font-bold text-[hsl(var(--foreground))]">{formatCurrency(avgOrderValue)}</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">📋 Riwayat Transaksi</h3>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <th className="text-left p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Order ID</th>
              <th className="text-left p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Waktu</th>
              <th className="text-left p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Items</th>
              <th className="text-left p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Meja</th>
              <th className="text-left p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Kasir</th>
              <th className="text-right p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Total</th>
              <th className="text-right p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Pajak</th>
              <th className="text-center p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Status</th>
            </tr>
          </thead>
          <tbody>
            {displayOrders.map((order) => {
              const table = tables.find((t) => t.id === order.tableId)
              return (
                <tr key={order.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary)/0.5)] transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-medium text-[hsl(var(--foreground))]">{order.orderNumber}</span>
                  </td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">
                    {formatTime(new Date(order.createdAt))}
                  </td>
                  <td className="p-4">
                     <button 
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-2 text-xs font-medium bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] px-3 py-1.5 rounded-lg transition-colors"
                     >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat Item
                     </button>
                  </td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">
                    {table ? table.number : 'Takeaway'}
                  </td>
                  <td className="p-4 text-[hsl(var(--muted-foreground))]">
                    {order.cashierName}
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-semibold text-[hsl(var(--primary))]">{formatCurrency(order.total)}</span>
                  </td>
                  <td className="p-4 text-right text-[hsl(var(--muted-foreground))]">
                    {formatCurrency(order.tax)}
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      order.status === 'completed' && 'bg-green-500/20 text-green-400',
                      order.status === 'pending' && 'bg-yellow-500/20 text-yellow-400',
                      order.status === 'preparing' && 'bg-blue-500/20 text-blue-400',
                      order.status === 'ready' && 'bg-purple-500/20 text-purple-400',
                      order.status === 'cancelled' && 'bg-red-500/20 text-red-400'
                    )}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {displayOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[hsl(var(--muted-foreground))]">
            <Receipt className="w-16 h-16 mb-4 opacity-30" />
            <p>Tidak ada transaksi pada tanggal ini</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setSelectedOrder(null)}>
            <div className="bg-[hsl(var(--card))] rounded-2xl p-6 w-full max-w-md border border-[hsl(var(--border))] shadow-xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4 mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">Detail Pesanan</h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Order #{selectedOrder.orderNumber}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-[hsl(var(--secondary))] rounded-lg transition-colors">
                        <X className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                    </button>
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 mb-4 scrollbar-thin">
                    {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-[hsl(var(--secondary))] rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))/0.2] text-[hsl(var(--primary))] flex items-center justify-center font-bold text-sm shrink-0">
                                    {item.quantity}x
                                </span>
                                <div>
                                    <p className="font-medium text-[hsl(var(--foreground))] text-sm">{item.productName}</p>
                                    {item.notes && <p className="text-[10px] text-[hsl(var(--muted-foreground))] italic">{item.notes}</p>}
                                </div>
                            </div>
                            <span className="font-mono text-sm text-[hsl(var(--foreground))]">
                                {formatCurrency(item.price * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Footer Totals */}
                <div className="space-y-2 pt-2 border-t border-[hsl(var(--border))]">
                    <div className="flex justify-between text-sm text-[hsl(var(--muted-foreground))]">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[hsl(var(--muted-foreground))]">
                        <span>Pajak (11%)</span>
                        <span>{formatCurrency(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-[hsl(var(--foreground))] pt-2 border-t border-dashed border-[hsl(var(--border))] mt-2">
                        <span>Total</span>
                        <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
