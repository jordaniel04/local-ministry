# UC-08 — Registrar Nota de Exposición

## Descripción
El admin o secretario registra una nota de una exposición/prédica, con secciones para puntos destacados y áreas de mejora.

## Actores
- Admin, Secretario

## Flujo principal

```mermaid
sequenceDiagram
  actor U as Admin/Secretary
  participant NF as NoteForm
  participant TQ as TanStack Query
  participant SB as Supabase
  participant DB as exposition_notes

  U->>NF: Clic en "Nueva nota de exposición"
  U->>NF: Ingresa título (ej: "Predicación — Fe y Obras")
  U->>NF: (Opcional) Ingresa nombre del expositor
  U->>NF: Selecciona fecha
  U->>NF: Escribe contenido general de la nota
  U->>NF: Escribe puntos destacados (highlights)
  U->>NF: Escribe áreas por mejorar (improvements)
  U->>NF: Clic en "Guardar"
  NF->>TQ: useMutation → insert
  TQ->>SB: supabase.from('exposition_notes').insert({ title, speaker, exposition_date, content, highlights, improvements })
  SB->>DB: INSERT INTO exposition_notes
  DB-->>TQ: { data: nota }
  TQ->>TQ: invalidateQueries(['exposition-notes'])
  NF-->>U: Redirige a la nota guardada
```

## Estructura de una nota

```
Título: Predicación sobre la Fe
Expositor: Pastor Martínez
Fecha: 27/06/2026

Contenido general:
  Texto libre con el resumen de la exposición...

Puntos destacados (✅):
  - Ilustración del sembrador muy clara
  - Buena aplicación práctica al final

Por mejorar (🔧):
  - El punto 2 quedó incompleto por el tiempo
  - Sería bueno más versículos de apoyo
```

## Postcondiciones
- Nueva fila en `exposition_notes`
- La nota queda disponible para consulta futura
