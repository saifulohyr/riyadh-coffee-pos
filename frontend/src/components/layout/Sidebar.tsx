import { NavLink, useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, 
  ChefHat, 
  LayoutGrid, 
  Package, 
  BarChart3,
  LogOut,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'

export function Sidebar() {
  const navigate = useNavigate()
  const { logout, session } = useAuthStore()
  const role = session?.user.role

  const navItems = [
    { 
      to: '/pos', 
      icon: ShoppingCart, 
      label: 'Kasir', 
      roles: ['admin', 'cashier'] 
    },
    { 
      to: '/kitchen', 
      icon: ChefHat, 
      label: 'Dapur', 
      roles: ['admin', 'cashier', 'kitchen'] 
    },
    { 
      to: '/tables', 
      icon: LayoutGrid, 
      label: 'Meja', 
      roles: ['admin', 'cashier'] 
    },
    { 
      to: '/products', 
      icon: Package, 
      label: 'Produk', 
      roles: ['admin'] 
    },
    { 
      to: '/reports', 
      icon: BarChart3, 
      label: 'Laporan', 
      roles: ['admin'] 
    },
    { 
      to: '/users', 
      icon: Users, 
      label: 'Users', 
      roles: ['admin'] 
    },
  ]

  const filteredItems = navItems.filter(item => item.roles.includes(role || ''))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-20 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-[hsl(var(--border))] p-2">
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden">
          <img src="/pul.png" alt="Riyadh Coffee" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-2 py-4 overflow-y-auto scrollbar-hide">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200',
                'hover:bg-[hsl(var(--accent))] group shrink-0',
                isActive
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'text-[hsl(var(--muted-foreground))]'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[hsl(var(--border))]">
        <button
          onClick={handleLogout}
          className="w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive))] hover:text-white transition-all duration-200 mx-auto"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  )
}
