# UC-06 — Delegar Tarea a Líder

## Descripción
El admin delega una tarea (visita, administrativa u otra) a un líder, con fecha límite opcional.

## Actores
- Admin, Secretario

## Flujo principal

```mermaid
sequenceDiagram
  actor U as Admin
  participant TF as TaskForm
  participant TQ as TanStack Query
  participant SB as Supabase
  participant DB as tasks

  U->>TF: Clic en "Nueva tarea"
  U->>TF: Ingresa título, descripción, tipo
  U->>TF: Selecciona líder asignado
  U->>TF: (Opcional) Selecciona persona relacionada
  U->>TF: (Opcional) Selecciona ministerio y fecha límite
  U->>TF: Clic en "Crear tarea"
  TF->>TQ: useMutation → insert
  TQ->>SB: supabase.from('tasks').insert({ title, assigned_to, task_type, ... })
  SB->>DB: INSERT INTO tasks
  DB-->>TQ: { data: nueva_tarea }
  TQ->>TQ: invalidateQueries(['tasks'])
  TF-->>U: Redirige a lista de tareas
```

## Flujo alternativo — Marcar tarea como completada

```mermaid
sequenceDiagram
  actor U as Admin
  participant TL as TaskList
  participant SB as Supabase

  U->>TL: Clic en "Marcar como hecha" en una tarea
  TL->>TL: Abre modal para ingresar resultado
  U->>TL: Escribe resultado/observaciones
  U->>TL: Confirma
  TL->>SB: update({ status: 'done', result_notes })
  SB-->>TL: OK
  TL-->>U: Tarea aparece en sección "Completadas"
```

## Tipos de tarea

| Tipo | Código | Ejemplo |
|---|---|---|
| Visita | `visit` | "Visitar a María García esta semana" |
| Administrativa | `administrative` | "Coordinar el ensayo del domingo" |
| Otra | `other` | Cualquier otra actividad |

## Postcondiciones
- Nueva fila en `tasks` con `status: 'pending'`
- Visible en el listado de tareas del líder asignado
- Aparece en alertas del dashboard si pasa la fecha límite sin completarse
