# 10 — Zustand: Estado Global

## ¿Qué problema resuelve?

En React, los datos viven dentro de componentes. Si dos componentes en distintas ramas del árbol necesitan el mismo dato (por ejemplo, "el usuario logueado"), hay un problema: no se pueden comunicar directamente.

La solución ingenua es **prop drilling**: pasar el dato de padre a hijo a nieto... hasta donde se necesite. Funciona, pero se vuelve caótico cuando el árbol tiene 5+ niveles.

**Zustand** es una "tienda" (store) global: un espacio fuera del árbol de componentes donde cualquier componente puede leer o escribir datos, sin importar dónde esté en el árbol.

---

## Analogía con Angular

```
Angular                          →   React + Zustand
────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })  →   create() — singleton global
BehaviorSubject<User>            →   user: User | null en el store
subject.next(newValue)           →   set({ user: newValue })
subject.getValue()               →   useAuthStore().user
inject(AuthService)              →   useAuthStore() en cualquier componente
```

La diferencia clave: en Angular el Service vive en el DI container del framework. En Zustand el store vive en memoria JavaScript — más simple, sin configuración.

---

## Nuestro authStore

```ts
// src/store/authStore.ts
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
  isLoading: true,       // true al inicio — aún no sabemos si hay sesión
  setUser: (user, role) => set({ user, role, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ user: null, role: null, isLoading: false }),
}))
```

### ¿Por qué `isLoading: true` al inicio?

Cuando la app arranca, Supabase necesita ~100ms para leer el token del localStorage y verificar si la sesión es válida. Durante ese tiempo, el store no sabe si hay usuario o no.

Si `isLoading` empezara en `false`, React renderizaría el estado `user: null` → redireccionaría a `/login` → medio segundo después llegaría la sesión real → redireccionaría a `/dashboard`. El usuario vería un flash de la pantalla de login. Con `isLoading: true`, el `ProtectedRoute` muestra un spinner y espera.

---

## Cómo usarlo en un componente

```tsx
function MiComponente() {
  // Solo lee lo que necesita — no re-renderiza si cambia otra cosa
  const user = useAuthStore((state) => state.user)
  const role = useAuthStore((state) => state.role)

  return <p>Hola {user?.email} — rol: {role}</p>
}
```

O con desestructuración (re-renderiza si cambia cualquier campo):

```tsx
const { user, role, isLoading } = useAuthStore()
```

---

## Cuándo usar Zustand vs TanStack Query

| Situación | Herramienta |
|---|---|
| Estado del usuario logueado (persiste en toda la sesión) | Zustand |
| Datos del servidor (lista de personas, ministerios) | TanStack Query |
| Estado de UI local (modal abierto, tab activo) | `useState` |
| Formulario complejo con muchos campos | `useState` o React Hook Form |

**Regla práctica:** Si el dato viene de Supabase → TanStack Query. Si es estado de la app que no viene de la DB → Zustand o useState.

---

## Recursos

- [Zustand docs](https://zustand.docs.pmnd.rs/)
- Archivo en este proyecto: `src/store/authStore.ts`
