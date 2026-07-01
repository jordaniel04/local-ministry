import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from '@/router'
import { useAuthInit } from '@/features/auth/hooks/useAuth'

const queryClient = new QueryClient()

function AuthInitializer() {
  useAuthInit()
  return null
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
