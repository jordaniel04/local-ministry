import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

type Role = 'admin' | 'secretary' | 'pastor'

type AuthState = {
  user: User | null
  role: Role | null
  isLoading: boolean
  setUser: (user: User | null, role: Role | null) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoading: true,
  setUser: (user, role) => set({ user, role, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ user: null, role: null, isLoading: false }),
}))
