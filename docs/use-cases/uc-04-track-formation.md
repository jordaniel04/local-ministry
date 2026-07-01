# UC-04 — Registrar Progreso de Formación

## Descripción
El admin o secretario marca una lección como completada y opcionalmente registra una nota de evaluación para una persona.

## Actores
- Admin, Secretario

## Precondiciones
- La persona existe en `people`
- Los módulos y lecciones están definidos en `formation_modules` y `formation_lessons`

## Flujo principal — Marcar lección completada

```mermaid
sequenceDiagram
  actor U as Admin
  participant FP as FormationPage
  participant TQ as TanStack Query
  participant SB as Supabase
  participant DB as person_lesson_progress

  U->>FP: Abre perfil de formación de una persona
  FP->>SB: SELECT progress con módulos y lecciones
  SB-->>FP: Lista de lecciones con estado (completada/pendiente)
  U->>FP: Clic en checkbox de lección "Lección 1 — Fe"
  FP->>TQ: useMutation → upsert
  TQ->>SB: upsert({ person_id, lesson_id, completed: true, completed_at })
  SB->>DB: INSERT ... ON CONFLICT DO UPDATE
  DB-->>SB: { data: progreso }
  TQ->>TQ: invalidateQueries(['formation', personId])
  FP-->>U: Checkbox marcado, barra de progreso actualizada
```

## Flujo alternativo — Registrar nota de evaluación

```mermaid
sequenceDiagram
  actor U as Admin
  participant FP as FormationPage
  participant TQ as TanStack Query
  participant SB as Supabase

  U->>FP: Clic en "Evaluar" en una lección completada
  FP->>FP: Abre modal con campo de nota (0-100) y observaciones
  U->>FP: Ingresa nota: 87, observaciones: "Buen dominio"
  U->>FP: Clic en "Guardar evaluación"
  FP->>TQ: useMutation → upsert
  TQ->>SB: upsert({ person_id, lesson_id, score: 87, score_notes: "...", evaluated_by })
  SB-->>TQ: { data: actualizado }
  FP-->>U: Muestra nota 87 junto a la lección
  FP-->>U: Actualiza promedio del módulo
```

## Cálculo de promedios

```
Promedio módulo = AVG(score) de lecciones con score IS NOT NULL
Promedio general = AVG(promedios de módulos)
```

Las lecciones completadas SIN nota no afectan el promedio — solo las evaluadas.

## Postcondiciones
- Fila en `person_lesson_progress` creada o actualizada
- Barra de progreso del módulo refleja el avance
- Promedio actualizado si se registró nota
