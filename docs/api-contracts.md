# API Contracts — Queries y Mutaciones principales

> Última actualización: 2026-06-27
> Todas las operaciones usan el cliente Supabase en `src/lib/supabase.ts`

## Personas (`people`)

```ts
// Listar todas las personas activas
supabase.from('people').select('*').eq('is_active', true).order('full_name')

// Filtrar por tipo
supabase.from('people').select('*').eq('person_type', 'member')

// Buscar por nombre
supabase.from('people').select('*').ilike('full_name', '%juan%')

// Obtener una persona con sus ministerios
supabase.from('people').select(`
  *,
  leader_ministries(
    ministry_id,
    ministries(id, name)
  )
`).eq('id', personId).single()

// Crear persona
supabase.from('people').insert({ full_name, person_type, phone })

// Actualizar persona
supabase.from('people').update({ phone, address }).eq('id', personId)

// Archivar (no borrar)
supabase.from('people').update({ is_active: false }).eq('id', personId)
```

## Formación — Progreso (`person_lesson_progress`)

```ts
// Progreso completo de una persona (con módulos y lecciones)
supabase.from('person_lesson_progress').select(`
  *,
  formation_lessons(
    id, title, order_index,
    formation_modules(id, name, order_index)
  )
`).eq('person_id', personId)

// Marcar lección como completada
supabase.from('person_lesson_progress').upsert({
  person_id: personId,
  lesson_id: lessonId,
  completed: true,
  completed_at: new Date().toISOString()
}, { onConflict: 'person_id,lesson_id' })

// Registrar nota de evaluación
supabase.from('person_lesson_progress').upsert({
  person_id: personId,
  lesson_id: lessonId,
  completed: true,
  score: 85.5,
  score_notes: 'Buen dominio del tema',
  evaluated_by: currentUserId
}, { onConflict: 'person_id,lesson_id' })

// Promedio por módulo (query SQL directo)
supabase.rpc('get_module_averages', { p_person_id: personId })
// (función a crear en BD cuando se necesite)
```

## Asistencia (`attendance`)

```ts
// Asistencia de una sesión
supabase.from('attendance').select(`
  *,
  people(id, full_name, person_type)
`).eq('session_id', sessionId)

// Registrar asistencia de múltiples personas a la vez
supabase.from('attendance').upsert(
  attendanceList.map(({ personId, status }) => ({
    session_id: sessionId,
    person_id: personId,
    status
  })),
  { onConflict: 'session_id,person_id' }
)

// Historial de asistencia de una persona
supabase.from('attendance').select(`
  status, notes,
  class_sessions(title, session_date)
`).eq('person_id', personId).order('created_at', { ascending: false })
```

## Tareas (`tasks`)

```ts
// Tareas pendientes de un líder
supabase.from('tasks')
  .select('*, people!related_person_id(full_name)')
  .eq('assigned_to', leaderId)
  .eq('status', 'pending')
  .order('due_date')

// Crear tarea
supabase.from('tasks').insert({
  title,
  assigned_to: leaderId,
  task_type,
  due_date,
  related_person_id  // opcional
})

// Marcar como completada
supabase.from('tasks').update({
  status: 'done',
  result_notes
}).eq('id', taskId)
```

## Reportes — Queries para el dashboard

```ts
// Líderes con más de 2 faltas en los últimos 30 días
supabase.from('attendance')
  .select('person_id, people(full_name), count()')
  .eq('status', 'absent')
  .gte('created_at', thirtyDaysAgo)
  .group('person_id')
  .having('count(*)', 'gt', 2)

// Personas sin progreso en formación en los últimos 30 días
supabase.from('people')
  .select('id, full_name')
  .not('id', 'in',
    supabase.from('person_lesson_progress')
      .select('person_id')
      .gte('updated_at', thirtyDaysAgo)
  )

// Tareas vencidas
supabase.from('tasks')
  .select('*, people!assigned_to(full_name)')
  .eq('status', 'pending')
  .lt('due_date', today)
```

## Notas sobre `upsert`

`upsert` = INSERT si no existe, UPDATE si ya existe (basado en el conflicto). Se usa mucho en `person_lesson_progress` y `attendance` porque una persona solo puede tener UN registro de progreso por lección y UNA asistencia por sesión (garantizado por el `UNIQUE` en la BD).
