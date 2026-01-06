import { Wifi, WifiOff, Clock } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { formatDate, formatTime } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function Header() {
  const { session } = useAuthStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(timer)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <header className="h-16 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] flex items-center justify-between px-6">
      {/* Left - Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
          Riyadh Coffee POS
        </h1>
      </div>

      {/* Right - Status & User */}
      <div className="flex items-center gap-6">
        {/* Online Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          isOnline 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {formatDate(currentTime)} • {formatTime(currentTime)}
          </span>
        </div>

        {/* User */}
        {session && (
          <div className="flex items-center gap-3 pl-6 border-l border-[hsl(var(--border))]">
            <div className="w-9 h-9 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white font-semibold">
              {session.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                {session.user.name}
              </span>
              <span className="text-xs text-[hsl(var(--muted-foreground))] capitalize">
                {session.user.role}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
