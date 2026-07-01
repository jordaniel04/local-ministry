# UC-07 — Registrar Sesión 1:1 con Líder

## Descripción
El admin registra los detalles de una reunión personal con un líder: resumen, acuerdos y fecha de próxima sesión.

## Actores
- Admin, Secretario

## Flujo principal

```mermaid
sequenceDiagram
  actor U as Admin
  participant SF as SessionForm
  participant TQ as TanStack Query
  participant SB as Supabase
  participant DB as leader_sessions

  U->>SF: Selecciona líder desde el listado
  U->>SF: Ingresa fecha de la sesión
  U->>SF: Escribe resumen de la reunión
  U->>SF: Escribe acuerdos / compromisos
  U->>SF: (Opcional) Indica fecha de próxima sesión
  U->>SF: Clic en "Guardar sesión"
  SF->>TQ: useMutation → insert
  TQ->>SB: supabase.from('leader_sessions').insert({ leader_id, session_date, summary, agreements, next_session_date })
  SB->>DB: INSERT INTO leader_sessions
  DB-->>TQ: { data: sesión }
  TQ->>TQ: invalidateQueries(['leader-sessions', leaderId])
  SF-->>U: Redirige al historial del líder
```

## Flujo — Ver historial de sesiones de un líder

```mermaid
sequenceDiagram
  actor U as Admin
  participant LP as LeaderProfile
  participant SB as Supabase

  U->>LP: Abre perfil de un líder
  LP->>SB: SELECT * FROM leader_sessions WHERE leader_id = X ORDER BY session_date DESC
  SB-->>LP: Lista de sesiones anteriores
  LP-->>U: Muestra timeline de sesiones con resúmenes y acuerdos
```

## Postcondiciones
- Nueva fila en `leader_sessions`
- El historial del líder se actualiza automáticamente
- Si se indicó próxima sesión, puede mostrarse como recordatorio en el dashboard
