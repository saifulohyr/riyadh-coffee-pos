import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoginPage } from '@/pages/LoginPage'
import { POSPage } from '@/pages/POSPage'
import { TablesPage } from '@/pages/TablesPage'
import { KitchenPage } from '@/pages/KitchenPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { UsersPage } from '@/pages/UsersPage'
import { useAuthStore } from '@/stores/useAuthStore'

// Role Protection Component
const RoleRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { session } = useAuthStore()
  
  if (!session || !allowedRoles.includes(session.user.role)) {
    return <Navigate to="/login" replace /> // Or a 403 Access Denied page
  }

  return <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          
          {/* Admin Routes */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>

          {/* Cashier & Admin Routes */}
          <Route element={<RoleRoute allowedRoles={['admin', 'cashier']} />}>
            <Route path="/pos" element={<POSPage />} />
            <Route path="/tables" element={<TablesPage />} />
          </Route>

          {/* All Roles */}
          <Route element={<RoleRoute allowedRoles={['admin', 'cashier', 'kitchen']} />}>
             <Route path="/kitchen" element={<KitchenPage />} />
          </Route>

        </Route>

        {/* Redirect based on role? For now default to /pos or /kitchen */}
        <Route path="/" element={<Navigate to="/pos" replace />} />
        <Route path="*" element={<Navigate to="/pos" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
