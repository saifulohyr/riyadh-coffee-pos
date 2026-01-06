import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 500))

    const success = login(email, password)
    
    if (success) {
      const user = useAuthStore.getState().session?.user
      if (user?.role === 'kitchen') {
        navigate('/kitchen')
      } else {
        navigate('/pos')
      }
    } else {
      setError('Email atau password salah.')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[hsl(var(--primary)/0.15)] to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-[hsl(var(--primary)/0.1)] to-transparent rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 shadow-2xl backdrop-blur-sm animate-fadeIn">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg overflow-hidden p-2">
              <img src="/pul.png" alt="Riyadh Coffee" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Riyadh Coffee</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">Point of Sale System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="masukkan@email.com"
                  className={cn(
                    'w-full h-12 pl-11 pr-4 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]',
                    'text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]',
                    'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent',
                    'transition-all duration-200'
                  )}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className={cn(
                    'w-full h-12 pl-11 pr-4 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]',
                    'text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]',
                    'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent',
                    'transition-all duration-200'
                  )}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slideIn">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email}
              className={cn(
                'w-full h-12 rounded-xl font-semibold text-white',
                'bg-gradient-to-r from-[hsl(var(--primary))] to-green-600',
                'hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5',
                'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--background))]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
                'transition-all duration-200 flex items-center justify-center gap-2'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>🚀 Masuk</span>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
            <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mb-3">
              Choose Account 
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Kasir', email: 'cashier@riyadh.coffee' },
                { label: 'Dapur', email: 'kitchen@riyadh.coffee' },
                { label: 'Admin', email: 'admin@riyadh.coffee' }
              ].map(({ label, email }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setEmail(email)
                    setPassword('') // Clear password for security
                  }}
                  className="px-3 py-2 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] text-sm transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-6">
          Powered by Riyadh Coffee System
        </p>
      </div>
    </div>
  )
}
