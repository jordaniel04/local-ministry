import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

type Props = { children: React.ReactNode }

export function ProtectedRoute({ children }: Props) {
  const { user, isLoading } = useAuthStore()

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
