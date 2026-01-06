import { useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Plus, Search, Edit2, Trash2, User as UserIcon, Shield, X, Check } from 'lucide-react'
import type { User } from '@/types'

export function UsersPage() {
  const { users, addUser, updateUser, deleteUser, session } = useAuthStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'cashier' as 'admin' | 'cashier' | 'kitchen',
  })

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        username: '',
        email: '',
        role: 'cashier',
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingUser) {
      updateUser(editingUser.id, formData)
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        ...formData,
      }
      addUser(newUser)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (id === session?.user.id) {
      alert("Anda tidak bisa menghapus akun sendiri!")
      return
    }
    if (confirm('Hapus user ini?')) {
      deleteUser(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">User Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Kelola akses pengguna sistem</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2.5 rounded-xl font-semibold bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah User
        </button>
      </div>

      <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[hsl(var(--secondary)/0.5)]">
            <tr>
              <th className="text-left p-4 font-semibold">User</th>
              <th className="text-left p-4 font-semibold">Role</th>
              <th className="text-left p-4 font-semibold">Username</th>
              <th className="text-center p-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary)/0.3)]">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.2)] flex items-center justify-center text-[hsl(var(--primary))]">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    user.role === 'admin' ? 'bg-purple-500/20 text-purple-500' :
                    user.role === 'kitchen' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-[hsl(var(--muted-foreground))]">@{user.username}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openModal(user)}
                      className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[hsl(var(--muted-foreground))] hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--card))] p-6 rounded-2xl w-full max-w-md border border-[hsl(var(--border))] shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editingUser ? 'Edit User' : 'Tambah User Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl bg-[hsl(var(--secondary))] border-transparent focus:border-[hsl(var(--primary))] focus:ring-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username (untuk login)</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl bg-[hsl(var(--secondary))] border-transparent focus:border-[hsl(var(--primary))] focus:ring-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl bg-[hsl(var(--secondary))] border-transparent focus:border-[hsl(var(--primary))] focus:ring-0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                  className="w-full px-4 py-2 rounded-xl bg-[hsl(var(--secondary))] border-transparent focus:border-[hsl(var(--primary))] focus:ring-0 appearance-none"
                >
                  <option value="cashier">Cashier (POS Only)</option>
                  <option value="kitchen">Kitchen (Dapur Only)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[hsl(var(--primary))] text-white font-semibold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
