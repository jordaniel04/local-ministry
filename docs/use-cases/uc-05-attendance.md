# UC-05 — Registrar Asistencia

## Descripción
El admin o secretario crea una sesión de clase/culto y registra la asistencia de cada persona.

## Actores
- Admin, Secretario

## Flujo principal

```mermaid
sequenceDiagram
  actor U as Admin/Secretary
  participant AP as AttendancePage
  participant TQ as TanStack Query
  participant SB as Supabase
  participant DB as class_sessions / attendance

  U->>AP: Clic en "Nueva sesión"
  U->>AP: Ingresa título ("Culto 27 Jun") y fecha
  AP->>SB: insert into class_sessions
  SB->>DB: INSERT class_sessions
  DB-->>AP: { id: session_id }

  AP->>SB: SELECT people WHERE is_active = true
  SB-->>AP: Lista de personas

  loop Para cada persona
    U->>AP: Marca estado: presente / faltó / justificó / tardanza
  end

  U->>AP: Clic en "Guardar asistencia"
  AP->>TQ: useMutation → upsert bulk
  TQ->>SB: upsert([{ session_id, person_id, status }, ...])
  SB->>DB: INSERT INTO attendance ... ON CONFLICT DO UPDATE
  DB-->>SB: OK
  TQ->>TQ: invalidateQueries(['attendance', sessionId])
  AP-->>U: "Asistencia guardada"
```

## Flujo alternativo — Editar asistencia ya registrada

```mermaid
sequenceDiagram
  actor U as Admin
  participant AP as AttendancePage
  participant SB as Supabase

  U->>AP: Abre sesión ya registrada
  AP->>SB: SELECT attendance WHERE session_id = X
  SB-->>AP: Lista con estados actuales pre-llenados
  U->>AP: Cambia estado de una persona
  U->>AP: Clic "Guardar"
  AP->>SB: upsert (ON CONFLICT actualiza el estado)
  SB-->>AP: OK
```

## Estados de asistencia

| Estado | Código | Descripción |
|---|---|---|
| Asistió | `present` | Estuvo presente |
| Faltó | `absent` | No asistió sin justificación |
| Justificó | `justified` | Avisó con anticipación |
| Tardanza | `late` | Llegó tarde |

## Postcondiciones
- Fila en `class_sessions` creada
- Filas en `attendance` creadas o actualizadas (una por persona)
- Los reportes de alertas pueden calcular faltas consecutivas
