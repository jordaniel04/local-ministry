# Flujo de Autenticación — ESLIDER Ministry Manager

> Última actualización: 2026-06-27

## Proveedor

Supabase Auth con email y password. No hay registro público — el admin crea los usuarios manualmente desde el panel de Supabase.

## Flujo de login

```mermaid
sequenceDiagram
  participant U as Usuario
  participant App as React App
  participant SB as Supabase Auth
  participant DB as PostgreSQL

  U->>App: Ingresa email + password en /login
  App->>SB: supabase.auth.signInWithPassword({ email, password })
  
  alt Credenciales correctas
    SB-->>App: { session: { access_token, refresh_token, user } }
    App->>App: Guarda sesión (localStorage automático)
    App->>DB: SELECT * FROM profiles WHERE id = user.id
    DB-->>App: { role: 'admin' | 'secretary' | 'pastor' }
    App->>App: Guarda rol en Zustand store
    App-->>U: Redirige a /dashboard
  else Credenciales incorrectas
    SB-->>App: { error: "Invalid login credentials" }
    App-->>U: Muestra mensaje de error
  end
```

## Flujo de sesión persistente

Cuando el usuario recarga la página, no tiene que volver a hacer login:

```mermaid
sequenceDiagram
  participant App as React App
  participant SB as Supabase Auth
  participant DB as PostgreSQL

  App->>App: Inicia (recarga de página)
  App->>SB: supabase.auth.getSession()
  
  alt Sesión válida en localStorage
    SB-->>App: { session: { user, access_token } }
    App->>DB: SELECT role FROM profiles WHERE id = user.id
    DB-->>App: rol del usuario
    App-->>App: Muestra app normalmente
  else Sin sesión o token expirado
    SB-->>App: { session: null }
    App-->>App: Redirige a /login
  end
```

## Flujo de logout

```mermaid
sequenceDiagram
  participant U as Usuario
  participant App as React App
  participant SB as Supabase Auth

  U->>App: Clic en "Cerrar sesión"
  App->>SB: supabase.auth.signOut()
  SB-->>App: OK
  App->>App: Limpia Zustand store
  App-->>U: Redirige a /login
```

## Protección de rutas

Las rutas privadas verifican si hay sesión activa. Si no la hay, redirigen a `/login`:

```mermaid
flowchart TD
  A[Usuario navega a /dashboard] --> B{¿Hay sesión?}
  B -- Sí --> C[Renderiza /dashboard]
  B -- No --> D[Redirige a /login]
  C --> E{¿Tiene permiso para esta acción?}
  E -- Sí admin/secretary --> F[Muestra botón Editar]
  E -- No pastor --> G[Oculta botón Editar]
```

## Renovación automática del token

El JWT expira cada 1 hora. Supabase JS renueva el token automáticamente usando el `refresh_token` (válido por 7 días) sin que el usuario note nada.

## Gestión de usuarios

Los usuarios se crean manualmente desde el panel de Supabase → Authentication → Users. Después del primer login, se crea automáticamente el registro en `profiles` (esto lo implementaremos con un trigger o desde el código al primer login).

## Roles y permisos

| Rol | Login | Ver datos | Crear/Editar/Borrar |
|---|---|---|---|
| `admin` | ✅ | ✅ | ✅ |
| `secretary` | ✅ | ✅ | ✅ |
| `pastor` | ✅ | ✅ | ❌ |

El control de permisos tiene dos capas:
1. **UI** — ocultar botones de edición para el pastor
2. **RLS** — aunque el pastor intente la operación directamente, la BD la bloquea
