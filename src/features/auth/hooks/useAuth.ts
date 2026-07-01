import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useAuthInit() {
  const { setUser, clear } = useAuthStore()

  useEffect(() => {
    // Al montar: verificar si hay sesión activa
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        clear()
        return
      }
      const role = await fetchRole(session.user.id)
      setUser(session.user, role)
    })

    // Escuchar cambios de sesión (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          clear()
          return
        }
        const role = await fetchRole(session.user.id)
        setUser(session.user, role)
      }
    )

    return () => subscription.unsubscribe()
  }, [])
}

async function fetchRole(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return (data?.role as 'admin' | 'secretary' | 'pastor') ?? 'secretary'
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
