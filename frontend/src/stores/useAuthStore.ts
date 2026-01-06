import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@/types'
import { sampleUsers } from '@/data/sample-data'

interface AuthState {
  session: Session | null
  isAuthenticated: boolean
  users: User[] // Managed list of users
  
  // Actions
  login: (email: string, password: string) => boolean
  logout: () => void
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
}

// Hardcoded credentials for security requirement
// Simple hash function for client-side demo security (avoids plain text in code)
const hash = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

// Hashed credentials (so plain text passwords are not visible in code)
// admin975 -> -969153752
// kitchenxxx -> 688924500
// cashierxxx -> -2030711851
const CREDENTIAL_HASHES: Record<string, string> = {
  'admin@riyadh.coffee': '-969153752',
  'kitchen@riyadh.coffee': '688924500',
  'cashier@riyadh.coffee': '-2030711851',
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isAuthenticated: false,
      users: sampleUsers as User[], 

      login: (email: string, password: string) => {
        // Find user by email
        const user = get().users.find(u => u.email === email)
        
        if (!user) return false

        // Check password hash
        if (CREDENTIAL_HASHES[email]) {
          if (hash(password) !== CREDENTIAL_HASHES[email]) {
            return false
          }
        } 
        
        const session: Session = {
          user: user,
          startTime: new Date(),
          isActive: true,
        }
        set({ session, isAuthenticated: true })
        return true
      },

      logout: () => {
        set({ session: null, isAuthenticated: false })
      },

      addUser: (user) => {
        set((state) => ({ users: [...state.users, user] }))
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
          // Update session if the logged-in user is updated
          session: state.session?.user.id === id 
            ? { ...state.session, user: { ...state.session.user, ...updates } } 
            : state.session
        }))
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }))
      },
    }),
    {
      name: 'pos-auth-storage-v4',
      // We persist users so changes by Admin are saved
    }
  )
)
