import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

type Props = { children: React.ReactNode }

export function ProtectedRoute({ children }: Props) {
  const { user, isLoading, error } = useAuthStore()

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert">{error}</p>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    )
  }
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
