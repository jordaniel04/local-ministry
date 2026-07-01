# 13 — ProtectedRoute: Guardia de Rutas en React

## El problema

React Router no tiene un concepto nativo de "guard" como Angular. No existe `canActivate`. Entonces, ¿cómo proteges rutas para que solo usuarios autenticados puedan verlas?

La solución idiomática en React es un **componente wrapper** que decide si renderiza sus hijos o redirige.

---

## Analogía con Angular

```
Angular                              →   React
────────────────────────────────────────────────────────
@Injectable() AuthGuard              →   componente ProtectedRoute
canActivate(): boolean               →   if (!user) return <Navigate>
implements CanActivate               →   no hay interfaz, es solo un componente
RouterModule guards: [AuthGuard]     →   element: <ProtectedRoute><AppLayout /></ProtectedRoute>
```

La diferencia conceptual importante: en Angular el guard es **lógica separada** del componente. En React el guard **es** un componente — usa los mismos mecanismos que cualquier otro componente (hooks, estado, JSX).

---

## El código

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

type Props = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
```

---

## Los tres estados posibles

```
isLoading = true   →   Supabase aún verifica el token
                       Mostrar spinner (evitar flash de /login)

isLoading = false
user = null        →   No hay sesión activa
                       Redirigir a /login

isLoading = false
user = User        →   Sesión válida
                       Renderizar los hijos (AppLayout + contenido)
```

### ¿Por qué el spinner es necesario?

Sin el spinner, pasaría esto en cada recarga de página:

```
1. App carga          → isLoading=true, user=null
2. ProtectedRoute     → user=null → redirige a /login   ← FLASH INCORRECTO
3. Supabase responde  → user=Jorge → redirige a /dashboard
```

El usuario vería /login por ~100ms antes de ir al dashboard. Con `isLoading=true` inicial, el spinner ocupa ese tiempo y el usuario nunca ve el flash.

---

## Cómo se usa en el router

```tsx
// src/router/index.tsx
{
  path: '/',
  element: (
    <ProtectedRoute>        // guardia
      <AppLayout />         // layout protegido
    </ProtectedRoute>
  ),
  children: [
    { path: 'dashboard', element: <DashboardPage /> },
    // ...
  ],
}
```

`AppLayout` incluye `<Outlet />` donde se renderizan las rutas hijas. El `ProtectedRoute` es la capa exterior que decide si el layout (y todo lo que contiene) se muestra o no.

---

## `replace` en Navigate

```tsx
<Navigate to="/login" replace />
```

El `replace` es importante: reemplaza la entrada actual en el historial del navegador en vez de agregar una nueva. Sin él, si el usuario hace clic en "Atrás" desde /login, volvería a la ruta protegida (que volvería a redirigirlo a /login — loop infinito).

Con `replace`, el historial queda limpio.

---

## Guardia por rol (futuro)

Cuando necesitemos que solo el admin pueda ver ciertas rutas, se extiende el mismo patrón:

```tsx
function AdminRoute({ children }: Props) {
  const { user, role, isLoading } = useAuthStore()

  if (isLoading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (role !== 'admin') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
```

---

## Recursos

- Archivo en este proyecto: `src/components/ProtectedRoute.tsx`
- Store relacionado: `src/store/authStore.ts`
- Ver también: [13-protected-route-guardia.md](./13-protected-route-guardia.md) y [06-rls-roles.md](./06-rls-roles.md)
