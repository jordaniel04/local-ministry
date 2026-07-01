# 12 — React Router v6: Rutas Anidadas y Outlet

## Analogía con Angular

```
Angular                              →   React Router v6
────────────────────────────────────────────────────────
RouterModule.forRoot(routes)         →   createBrowserRouter([...])
children: [{ path, component }]      →   children: [{ path, element }]
<router-outlet>                      →   <Outlet />
routerLink="/dashboard"              →   to="/dashboard" en <NavLink>
canActivate: [AuthGuard]             →   <ProtectedRoute> wrapeando el layout
ActivatedRoute                       →   useParams(), useSearchParams()
Router.navigate(['/dashboard'])      →   useNavigate() → navigate('/dashboard')
```

La mayor diferencia conceptual: en Angular las rutas son **configuración declarativa** procesada por el framework. En React Router son **componentes** — una ruta es simplemente un componente que decide qué renderizar.

---

## Cómo está configurado en este proyecto

```ts
// src/router/index.tsx
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,         // ruta pública
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>             // guardia: verifica sesión
        <AppLayout />              // layout con sidebar
      </ProtectedRoute>
    ),
    children: [                    // rutas hijas — se renderizan dentro del <Outlet>
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'people', element: <div>Personas</div> },
      // ...
    ],
  },
])
```

### ¿Qué es `index: true`?

Es la ruta "por defecto" cuando la URL coincide con el padre pero no con ningún hijo. En este caso, si vas a `/`, redirige a `/dashboard`. Equivale a `redirectTo` en Angular.

---

## El rol de `<Outlet />`

`<Outlet />` es el "hueco" donde se renderizan las rutas hijas. En `AppLayout.tsx`:

```tsx
function AppLayout() {
  return (
    <div className="flex">
      <Sidebar />           {/* siempre visible */}
      <main>
        <Outlet />          {/* aquí aparece DashboardPage, PeoplePage, etc. */}
      </main>
    </div>
  )
}
```

Cuando navegas a `/dashboard`, React Router:
1. Renderiza el padre (`ProtectedRoute` → `AppLayout`)
2. Dentro del `<Outlet>` del padre, renderiza el hijo (`DashboardPage`)

El sidebar siempre está presente. Solo el contenido del `<Outlet>` cambia. Idéntico a cómo funciona un `<router-outlet>` dentro de un layout en Angular.

---

## NavLink vs Link

```tsx
import { NavLink, Link } from 'react-router-dom'

// Link — navegación simple, sin estado activo
<Link to="/dashboard">Dashboard</Link>

// NavLink — agrega clase "active" automáticamente cuando la URL coincide
<NavLink
  to="/dashboard"
  className={({ isActive }) => isActive ? 'bg-accent' : ''}
>
  Dashboard
</NavLink>
```

`NavLink` es como `routerLinkActive` en Angular — detecta si la ruta está activa y permite aplicar estilos condicionalmente.

---

## useNavigate — navegación programática

```tsx
import { useNavigate } from 'react-router-dom'

function LoginForm() {
  const navigate = useNavigate()

  async function handleSubmit() {
    await signIn(email, password)
    navigate('/dashboard')    // como this.router.navigate(['/dashboard']) en Angular
  }
}
```

---

## Parámetros de ruta

Para rutas como `/people/abc-123`:

```tsx
// En el router:
{ path: 'people/:personId', element: <PersonDetailPage /> }

// En el componente:
import { useParams } from 'react-router-dom'

function PersonDetailPage() {
  const { personId } = useParams()
  // personId = 'abc-123'
}
```

Equivale a `this.route.snapshot.paramMap.get('personId')` en Angular.

---

## Recursos

- [React Router docs](https://reactrouter.com/en/main)
- Archivo en este proyecto: `src/router/index.tsx`
- Layout en este proyecto: `src/components/AppLayout.tsx`
