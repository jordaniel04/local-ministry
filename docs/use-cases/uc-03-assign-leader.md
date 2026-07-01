# UC-03 — Asignar Líder a Ministerio

## Descripción
El admin asigna una persona como líder de uno o más ministerios.

## Actores
- Admin, Secretario

## Precondiciones
- La persona ya está registrada en `people`
- El ministerio ya existe en `ministries`

## Flujo principal

```mermaid
sequenceDiagram
  actor U as Admin
  participant MP as MinistryPage
  participant TQ as TanStack Query
  participant SB as Supabase
  participant DB as leader_ministries

  U->>MP: Selecciona un ministerio
  U->>MP: Clic en "Asignar líder"
  MP->>MP: Abre modal de búsqueda de personas
  U->>MP: Busca y selecciona a Juan Pérez
  U->>MP: Clic en "Confirmar"
  MP->>TQ: useMutation → insert
  TQ->>SB: supabase.from('leader_ministries').insert({ person_id, ministry_id })
  SB->>DB: INSERT INTO leader_ministries ...
  DB-->>SB: { data: asignación }
  TQ->>TQ: invalidateQueries(['ministries', ministryId])
  MP-->>U: Muestra a Juan Pérez como líder del ministerio
```

## Flujo alternativo — Ya es líder de ese ministerio

```mermaid
sequenceDiagram
  actor U as Admin
  participant MP as MinistryPage
  participant SB as Supabase

  U->>MP: Intenta asignar a Juan Pérez (ya es líder)
  MP->>SB: insert({ person_id, ministry_id })
  SB-->>MP: Error: violates unique constraint
  MP-->>U: "Esta persona ya es líder de este ministerio"
```

## Postcondiciones
- Nueva fila en `leader_ministries`
- Un ministerio puede tener varios líderes
- Una persona puede liderar varios ministerios
