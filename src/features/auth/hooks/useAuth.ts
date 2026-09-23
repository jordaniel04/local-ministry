import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useAuthInit() {
  const { setUser, clear, setError, setLoading } = useAuthStore()

  useEffect(() => {
    let disposed = false
    let revision = 0
    let deferred: ReturnType<typeof setTimeout> | undefined
    let controller: AbortController | undefined
    let deadline: ReturnType<typeof setTimeout> | undefined

    const cancelPending = () => {
      clearTimeout(deferred)
      clearTimeout(deadline)
      controller?.abort()
    }
    const startDeadline = () => {
      deadline = setTimeout(() => {
        revision += 1
        cancelPending()
        setError('No pudimos completar el inicio. Revisa tu conexión e inténtalo de nuevo.')
      }, 15000)
    }

    setLoading(true)
    startDeadline()
    // INITIAL_SESSION también entrega la sesión guardada al abrir la app.
    // Este callback debe terminar antes de hacer otra petición a Supabase.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (disposed) return
        const currentRevision = ++revision
        cancelPending()
        if (!session?.user) {
          clear()
          return
        }
        setLoading(true)
        startDeadline()
        const user = session.user
        deferred = setTimeout(() => {
          controller = new AbortController()
          void fetchRole(user.id, controller.signal).then((role) => {
            if (disposed || currentRevision !== revision) return
            clearTimeout(deadline)
            setUser(user, role)
          }).catch(() => {
            if (disposed || currentRevision !== revision) return
            clearTimeout(deadline)
            setError('No pudimos cargar tu perfil. Revisa tu conexión e inténtalo de nuevo.')
          })
        }, 0)
      }
    )

    return () => {
      disposed = true
      revision += 1
      cancelPending()
      subscription.unsubscribe()
    }
  }, [setUser, clear, setError, setLoading])
}

async function fetchRole(userId: string, signal: AbortSignal) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .abortSignal(signal)
    .single()
  if (error) throw error
  const role = data?.role
  if (role !== 'admin' && role !== 'secretary' && role !== 'pastor') {
    throw new Error('Perfil sin rol válido')
  }
  return role
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