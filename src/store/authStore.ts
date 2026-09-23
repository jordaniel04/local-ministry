import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

type Role = 'admin' | 'secretary' | 'pastor'

type AuthState = {
  user: User | null
  role: Role | null
  isLoading: boolean
  error: string | null
  setError: (error: string) => void
  setUser: (user: User | null, role: Role | null) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoading: true,
  error: null,
  setError: (error) => set({ error, user: null, role: null, isLoading: false }),
  setUser: (user, role) => set({ user, role, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading, error: null }),
  clear: () => set({ user: null, role: null, isLoading: false, error: null }),
}))
