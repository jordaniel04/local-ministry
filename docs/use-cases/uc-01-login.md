# UC-01 — Login

## Descripción
El usuario (admin, secretario o pastor) ingresa sus credenciales para acceder a la app.

## Actores
- Admin, Secretario, Pastor

## Precondiciones
- El usuario ya fue creado en Supabase Auth por el admin

## Flujo principal

```mermaid
sequenceDiagram
  actor U as Usuario
  participant LP as LoginPage
  participant SB as Supabase Auth
  participant DB as profiles
  participant ZS as Zustand Store
  participant App as Dashboard

  U->>LP: Ingresa email + password
  LP->>SB: signInWithPassword({ email, password })
  SB-->>LP: { session, user }
  LP->>DB: SELECT role FROM profiles WHERE id = user.id
  DB-->>LP: { role: 'admin' }
  LP->>ZS: setUser({ ...user, role })
  LP-->>App: navigate('/dashboard')
```

## Flujo alternativo — Credenciales incorrectas

```mermaid
sequenceDiagram
  actor U as Usuario
  participant LP as LoginPage
  participant SB as Supabase Auth

  U->>LP: Ingresa email o password incorrecto
  LP->>SB: signInWithPassword({ email, password })
  SB-->>LP: { error: "Invalid login credentials" }
  LP-->>U: Muestra "Email o contraseña incorrectos"
```

## Postcondiciones
- El JWT queda guardado en localStorage por Supabase automáticamente
- El rol del usuario queda en el Zustand store
- El usuario ve el dashboard según su rol
