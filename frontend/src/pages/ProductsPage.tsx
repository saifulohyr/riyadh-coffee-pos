import { useState, useRef } from 'react'
import { cn, formatCurrency } from '@/lib/utils'
import { useProductStore } from '@/stores/useProductStore'
import { Plus, Search, Edit2, Trash2, Package, X, Image as ImageIcon, Upload, Coffee, Utensils, GlassWater, IceCream } from 'lucide-react'
import type { Product, Category } from '@/types'

// Helper for category icons
const getCategoryIcon = (id: string, className = "w-4 h-4") => {
  switch (id) {
    case 'coffee': return <Coffee className={className} />
    case 'tea': return <GlassWater className={className} />
    case 'pastry': return <IceCream className={className} />
    default: return <Package className={className} />
  }
}

// Filter out 'all' category for product forms
const getProductCategories = (categories: Category[]) => 
  categories.filter(c => c.id !== 'all')

export function ProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, fetchProducts, isLoading } = useProductStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    categoryId: '',
    stock: 'unlimited' as number | 'unlimited',
    description: '',
    image: '',
  })
  
  // Fetch on mount (already handled in MainLayout but safe to keep or rely on store)
  // Actually MainLayout handles it. We can just use store data.

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory ? product.categoryId === filterCategory : true
    return matchesSearch && matchesCategory
  })

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        stock: product.stock,
        description: product.description || '',
        image: product.image || '',
      })
    } else {
      const productCategories = getProductCategories(categories)
      setEditingProduct(null)
      setFormData({
        name: '',
        price: 0,
        categoryId: productCategories[0]?.id || 'coffee',
        stock: 'unlimited',
        description: '',
        image: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        alert("Ukuran gambar terlalu besar (maks 5MB)")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const productData: Product = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      name: formData.name,
      price: formData.price,
      categoryId: formData.categoryId,
      stock: formData.stock,
      isAvailable: true,
      description: formData.description,
      image: formData.image,
    }

    if (editingProduct) {
      await updateProduct(editingProduct.id, productData)
    } else {
      await addProduct(productData)
    }

    setIsModalOpen(false)
    // Refresh products after add/update
    await fetchProducts()
  }

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return
    try {
      await deleteProduct(deleteConfirmId)
      setDeleteConfirmId(null)
      await fetchProducts()
    } catch (error) {
      setDeleteError((error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Manajemen Produk</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Kelola produk, harga, dan stok (Admin)</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2.5 rounded-xl font-semibold bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk..."
            className="w-full h-11 pl-11 pr-4 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-11 px-4 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <th className="text-left p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Produk</th>
              <th className="text-left p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Kategori</th>
              <th className="text-right p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Harga</th>
              <th className="text-center p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Stok</th>
              <th className="text-center p-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const category = categories.find((c) => c.id === product.categoryId)
              return (
                <tr key={product.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary)/0.5)] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Image Preview */}
                      <div className="w-12 h-12 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center text-2xl overflow-hidden border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          // Fallback Icon
                          getCategoryIcon(product.categoryId, "w-6 h-6")
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[hsl(var(--foreground))]">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-[200px] truncate">{product.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--secondary))] text-sm text-[hsl(var(--muted-foreground))]">
                      {category ? getCategoryIcon(category.id, "w-3 h-3") : null}
                      {category?.name}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-semibold text-[hsl(var(--primary))]">{formatCurrency(product.price)}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium',
                      product.stock === 'unlimited'
                        ? 'bg-blue-500/20 text-blue-400'
                        : typeof product.stock === 'number' && product.stock <= 5
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    )}>
                      {product.stock === 'unlimited' ? '∞' : product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(product)}
                        className="w-8 h-8 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product.id)}
                        className="w-8 h-8 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-[hsl(var(--muted-foreground))]">
            <Package className="w-16 h-16 mb-4 opacity-30" />
            <p>Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[hsl(var(--card))] rounded-2xl p-6 w-full max-w-md border border-[hsl(var(--border))] shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div className="flex justify-center mb-4">
                <div 
                  className="w-32 h-32 rounded-2xl bg-[hsl(var(--secondary))] border-2 border-dashed border-[hsl(var(--border))] flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(var(--primary))] transition-colors relative overflow-hidden group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.image ? (
                    <>
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-[hsl(var(--muted-foreground))] mb-2" />
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">Upload Foto</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-1 block">Nama Produk</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-1 block">Harga</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-1 block">Kategori</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  required
                >
                  {getProductCategories(categories).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-1 block">Stok (kosongkan untuk unlimited)</label>
                <input
                  type="text"
                  value={formData.stock === 'unlimited' ? '' : formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value === '' ? 'unlimited' : Number(e.target.value) })}
                  placeholder="unlimited"
                  className="w-full h-10 px-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[hsl(var(--foreground))] mb-1 block">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-20 p-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-medium bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl font-medium bg-[hsl(var(--primary))] text-white disabled:opacity-50"
                >
                  {isLoading ? 'Menyimpan...' : (editingProduct ? 'Simpan' : 'Tambah')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-[hsl(var(--card))] rounded-2xl p-6 w-full max-w-sm border border-[hsl(var(--border))] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-500 mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[hsl(var(--foreground))] text-center mb-2">
              Hapus Produk?
            </h3>
            <p className="text-[hsl(var(--muted-foreground))] text-center mb-6">
              Produk akan dihapus secara permanen dari database. Tindakan ini tidak dapat dibatalkan.
            </p>
            {deleteError && (
              <p className="text-red-500 text-sm text-center mb-4">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isLoading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
