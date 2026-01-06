import { useState, useRef } from 'react'
import { Search, Plus, Minus, Trash2, StickyNote, Printer, Utensils, ShoppingBag, CheckCircle, Coffee, GlassWater, IceCream, Package, Info } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { useProductStore } from '@/stores/useProductStore'
import { useCartStore } from '@/stores/useCartStore'
import { useTableStore } from '@/stores/useTableStore'
import { useOrderStore } from '@/stores/useOrderStore'
import { QUICK_CASH_AMOUNTS } from '@/types'
import type { Product } from '@/types'
import { useReactToPrint } from 'react-to-print'
import { Receipt } from '@/components/pos/Receipt'

// Helper for category icons
const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'all': return <Package className="w-4 h-4" />
    case 'coffee': return <Coffee className="w-4 h-4" />
    case 'food': return <Utensils className="w-4 h-4" />
    case 'tea': return <GlassWater className="w-4 h-4" />
    case 'pastry': return <IceCream className="w-4 h-4" />
    default: return <Package className="w-4 h-4" />
  }
}

// Helper for larger icons (in grid)
const getCategoryIconLarge = (id: string) => {
  switch (id) {
    case 'coffee': return <Coffee className="w-12 h-12" />
    case 'food': return <Utensils className="w-12 h-12" />
    case 'tea': return <GlassWater className="w-12 h-12" />
    case 'pastry': return <IceCream className="w-12 h-12" />
    default: return <Package className="w-12 h-12" />
  }
}

export function POSPage() {
  const { products, categories } = useProductStore()
  const { tables } = useTableStore()
  const availableTables = tables.filter(t => t.status === 'available')
  
  const {
    items,
    orderType,
    selectedTableId,
    subtotal,
    tax,
    total,
    cashAmount,
    change,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    setOrderType,
    setSelectedTable,
    setCashAmount,
  } = useCartStore()
  
  const { createOrder } = useOrderStore()

  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastOrder, setLastOrder] = useState<any>(null)

  // Ref for printing
  const receiptRef = useRef<HTMLDivElement>(null)

  // Setup print function
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${lastOrder?.orderNumber || 'new'}`,
  })

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || !selectedCategory ? true : product.categoryId === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && product.isAvailable
  })

  const handleAddNote = (productId: string) => {
    const item = items.find(i => i.product.id === productId)
    setNoteText(item?.notes || '')
    setEditingNoteId(productId)
  }

  const saveNote = () => {
    if (editingNoteId) {
      updateNotes(editingNoteId, noteText)
      setEditingNoteId(null)
      setNoteText('')
    }
  }

  const handleCompleteOrder = async () => {
    try {
      const order = await createOrder()
      if (order) {
        setLastOrder(order)
        setShowReceipt(true)
      }
    } catch (error) {
      console.error('Failed to complete order:', error)
      alert('Gagal memproses pesanan. Silakan coba lagi.')
    }
  }

  const { isProcessing } = useOrderStore()
  const canComplete = items.length > 0 && cashAmount >= total && (orderType === 'takeaway' || selectedTableId) && !isProcessing

  // Product Detail State
  const [viewProduct, setViewProduct] = useState<Product | null>(null)

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left Panel - Menu */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Category Tabs */}
        <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-2 shadow-sm',
                selectedCategory === category.id || (category.id === 'all' && !selectedCategory)
                  ? 'bg-[hsl(var(--primary))] text-white shadow-[hsl(var(--primary)/0.3)] shadow-lg'
                  : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
              )}
            >
              <span>{getCategoryIcon(category.id)}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu (nama, rasa, bahan)..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all shadow-sm"
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-4 scrollbar-thin">
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addItem(product)}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-4 text-left hover:border-[hsl(var(--primary))] hover:shadow-xl hover:shadow-[hsl(var(--primary)/0.05)] transition-all group flex flex-col h-full active:scale-95 relative overflow-hidden"
              >
                {/* Product Image */}
                <div className="w-full aspect-square rounded-xl bg-[hsl(var(--secondary))] mb-4 flex items-center justify-center text-[hsl(var(--muted-foreground))] group-hover:scale-105 transition-transform duration-300 shadow-inner overflow-hidden relative">
                   {getCategoryIconLarge(product.categoryId)}
                   
                   {/* Info Button */}
                   {product.description && (
                     <div 
                        onClick={(e) => { e.stopPropagation(); setViewProduct(product); }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-[hsl(var(--primary))] hover:scale-110 z-10"
                        title="Lihat Detail"
                     >
                       <Info className="w-4 h-4" />
                     </div>
                   )}
                </div>
                <div className="mt-auto">
                  <h3 className="font-bold text-[hsl(var(--foreground))] truncate text-lg">{product.name}</h3>
                  {/* Clean Card: Description removed from here */}
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <p className="text-[hsl(var(--primary))] font-bold text-lg">{formatCurrency(product.price)}</p>
                    {product.stock !== 'unlimited' && (
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap",
                        Number(product.stock) < 5 
                          ? 'bg-red-500/20 text-red-500' 
                          : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'
                      )}>
                        {product.stock} left
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart & Payment */}
      <div className="w-[400px] flex flex-col bg-[hsl(var(--card))] rounded-3xl border border-[hsl(var(--border))] overflow-hidden shadow-2xl relative">
        {/* Header Order Type */}
        <div className="p-4 bg-[hsl(var(--secondary)/0.5)] border-b border-[hsl(var(--border))] backdrop-blur-sm">
          <div className="flex gap-1 p-1 bg-[hsl(var(--background))] rounded-xl border border-[hsl(var(--border))] mb-3">
            <button
              onClick={() => setOrderType('dine-in')}
              className={cn(
                'flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm',
                orderType === 'dine-in'
                  ? 'bg-[hsl(var(--primary))] text-white shadow-md'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
              )}
            >
              <Utensils className="w-4 h-4" />
              Dine-in
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={cn(
                'flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm',
                orderType === 'takeaway'
                  ? 'bg-[hsl(var(--primary))] text-white shadow-md'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
              )}
            >
              <ShoppingBag className="w-4 h-4" />
              Takeaway
            </button>
          </div>

          {orderType === 'dine-in' && (
            <div className="relative">
              <select
                value={selectedTableId || ''}
                onChange={(e) => setSelectedTable(e.target.value || null)}
                className="w-full h-10 px-4 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm appearance-none cursor-pointer"
              >
                <option value="">Pilih Nomor Meja...</option>
                {availableTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Meja {table.number} ({table.capacity} pax) - {table.area}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[hsl(var(--muted-foreground))]">
                ▼
              </div>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--background)/0.5)]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[hsl(var(--muted-foreground))] space-y-4">
              <div className="w-20 h-20 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 opacity-40" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg">Keranjang Kosong</p>
                <p className="text-sm opacity-70">Silakan pilih menu disamping</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-[hsl(var(--background))] rounded-xl p-3 border border-[hsl(var(--border))] shadow-sm group hover:border-[hsl(var(--primary)/0.5)] transition-all"
                >
                  <div className="flex justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[hsl(var(--foreground))] text-sm truncate">{item.product.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatCurrency(item.product.price)}</p>
                        {item.notes && (
                           <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 max-w-full truncate">
                             📝 {item.notes}
                           </span>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-[hsl(var(--foreground))] text-sm">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-[hsl(var(--secondary))] rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-[hsl(var(--foreground))] hover:bg-[hsl(var(--background))] rounded-md transition-all active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-[hsl(var(--foreground))]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-[hsl(var(--foreground))] hover:bg-[hsl(var(--background))] rounded-md transition-all active:scale-90"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex gap-1 opacity-100 transition-opacity">
                      <button
                        onClick={() => handleAddNote(item.product.id)}
                        className={cn(
                          "w-7 h-7 flex items-center justify-center rounded-lg transition-colors border",
                          item.notes 
                            ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" 
                            : "text-[hsl(var(--muted-foreground))] border-transparent hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]"
                        )}
                        title="Tambah Catatan"
                      >
                        <StickyNote className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="w-7 h-7 flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Hapus Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Logic Section - Sticky Bottom */}
        <div className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] shadow-[0_-5px_15px_rgba(0,0,0,0.2)] z-10">
          {/* Summary Details */}
          <div className="p-4 space-y-3 pb-2">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-[hsl(var(--muted-foreground))]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[hsl(var(--muted-foreground))]">
                <span>Pajak (11%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-[hsl(var(--secondary)/0.5)] p-3 rounded-xl border border-[hsl(var(--border))]">
              <span className="font-bold text-[hsl(var(--foreground))]">TOTAL</span>
              <span className="text-xl font-black text-[hsl(var(--primary))]">{formatCurrency(total)}</span>
            </div>

            {/* Cash Input */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">$</span>
              <input
                type="number"
                value={cashAmount || ''}
                onChange={(e) => setCashAmount(Number(e.target.value))}
                placeholder="Uang Diterima"
                className="w-full h-11 pl-8 pr-4 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-bold focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              />
            </div>

            {/* Quick Cash Grid */}
            <div className="grid grid-cols-4 gap-2">
              {QUICK_CASH_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCashAmount(amount)}
                  className="py-1.5 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] text-xs font-semibold transition-colors border border-transparent hover:border-[hsl(var(--border))]"
                >
                  {amount / 1000}k
                </button>
              ))}
              <button
                 onClick={() => setCashAmount(total)}
                 className="col-span-1 py-1.5 rounded-lg bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.25)] text-xs font-bold transition-colors"
              >
                PAS
              </button>
            </div>
            
            {/* Change Display */}
            {cashAmount > 0 && (
              <div className="flex justify-between items-center text-sm px-1">
                <span className="text-[hsl(var(--muted-foreground))]">Kembalian:</span>
                <span className={cn("font-bold", change >= 0 ? "text-green-500" : "text-red-500")}>
                  {formatCurrency(Math.max(0, change))}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 pt-2 hidden md:flex gap-3">
             <button
              onClick={clearCart}
              disabled={items.length === 0}
              className="px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleCompleteOrder}
              disabled={!canComplete}
              className="flex-1 py-3 rounded-xl font-bold bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[hsl(var(--primary)/0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              <span>{isProcessing ? 'Memproses...' : 'Bayar & Cetak'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Note Dialog */}
      {editingNoteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setEditingNoteId(null)}>
          <div className="bg-[hsl(var(--card))] rounded-2xl p-6 w-full max-w-sm border border-[hsl(var(--border))] shadow-2xl scale-100 transition-all" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-[hsl(var(--primary))]" />
              Catatan Pesanan
            </h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              autoFocus
              placeholder="Contoh: Jangan terlalu manis, ekstra es..."
              className="w-full h-32 p-4 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setEditingNoteId(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
              >
                Batal
              </button>
              <button
                onClick={saveNote}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {viewProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn" onClick={() => setViewProduct(null)}>
          <div className="bg-[hsl(var(--card))] rounded-3xl p-6 w-full max-w-md border border-[hsl(var(--border))] shadow-2xl scale-100 relative overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              onClick={() => setViewProduct(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 text-[hsl(var(--foreground))] hover:bg-black/30 backdrop-blur-md flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5 rotate-45" /> {/* Use Plus rotated as Close */}
            </button>

            {/* Hero Image */}
            <div className="-mx-6 -mt-6 mb-6 aspect-video bg-[hsl(var(--secondary))] w-[calc(100%+3rem)] relative flex items-center justify-center">
              {getCategoryIconLarge(viewProduct.categoryId)}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                   <span className="text-xs font-bold tracking-wider text-[hsl(var(--primary))] uppercase">
                     {categories.find(c => c.id === viewProduct.categoryId)?.name || 'Menu'}
                   </span>
                   <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] leading-tight mt-1">{viewProduct.name}</h2>
                </div>
                <div className="bg-[hsl(var(--secondary))] px-3 py-1 rounded-full border border-[hsl(var(--border))] shrink-0">
                  <span className="font-bold text-[hsl(var(--foreground))]">{formatCurrency(viewProduct.price)}</span>
                </div>
              </div>

              <div className="my-4 bg-[hsl(var(--secondary)/0.5)] p-4 rounded-xl border border-[hsl(var(--border))]">
                 <p className="text-[hsl(var(--muted-foreground))] leading-relaxed text-sm">
                   {viewProduct.description || "Tidak ada deskripsi untuk produk ini."}
                 </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[hsl(var(--secondary))] p-3 rounded-xl border border-[hsl(var(--border))] flex flex-col items-center justify-center">
                   <span className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Stok Tersedia</span>
                   <span className={cn(
                     "font-bold",
                     viewProduct.stock === 'unlimited' ? 'text-blue-500' : (Number(viewProduct.stock) < 5 ? 'text-red-500' : 'text-green-500')
                   )}>
                     {viewProduct.stock === 'unlimited' ? '∞ Unlimited' : viewProduct.stock}
                   </span>
                </div>
                 <div className="bg-[hsl(var(--secondary))] p-3 rounded-xl border border-[hsl(var(--border))] flex flex-col items-center justify-center">
                   <span className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Status</span>
                   <span className={cn(
                     "font-bold",
                     viewProduct.isAvailable ? 'text-green-500' : 'text-red-500'
                   )}>
                     {viewProduct.isAvailable ? 'Siap Saji' : 'Habis'}
                   </span>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <button
               onClick={() => { addItem(viewProduct); setViewProduct(null); }}
               className="w-full py-3.5 rounded-xl font-bold bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)] shadow-lg shadow-[hsl(var(--primary)/0.2)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah ke Pesanan
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowReceipt(false)}>
          <div className="bg-white rounded-3xl p-6 w-auto max-w-md shadow-2xl scale-100 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-black mb-1">Transaksi Berhasil!</h2>
            <p className="text-gray-500 text-sm mb-6">Order {lastOrder.orderNumber} telah dibuat</p>

            {/* Printable Area */}
            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 mb-6 max-h-[50vh] overflow-y-auto">
               <Receipt ref={receiptRef} order={lastOrder} />
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Tutup
              </button>
              <button
                onClick={() => handlePrint()}
                className="flex-1 py-3 rounded-xl font-bold bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
