# Tipos TypeScript generados por Supabase

## ¿Qué son?

Son tipos TypeScript generados automáticamente desde el schema real de la base de datos. Viven en `src/types/supabase.ts` y le dicen a TypeScript exactamente qué forma tiene cada tabla.

## Las tres variantes por tabla

Por cada tabla, Supabase genera tres tipos:

```ts
// Ejemplo con la tabla `people`

// Row → lo que devuelve un SELECT
type PersonRow = {
  id: string           // siempre presente
  full_name: string    // siempre presente
  phone: string | null // puede ser null
  person_type: string  // siempre presente
  created_at: string   // siempre presente
}

// Insert → lo que mandas al INSERT
type PersonInsert = {
  full_name: string        // requerido (no tiene DEFAULT)
  person_type: string      // requerido
  id?: string              // opcional (tiene DEFAULT gen_random_uuid())
  phone?: string | null    // opcional
  created_at?: string      // opcional (tiene DEFAULT now())
}

// Update → lo que mandas al UPDATE (todo opcional)
type PersonUpdate = {
  full_name?: string
  phone?: string | null
  // ... todos opcionales
}
```

## ¿Por qué importa esto?

TypeScript te avisa en tiempo de desarrollo si te equivocas:

```ts
// ✅ Correcto
await supabase.from('people').insert({
  full_name: 'Juan Pérez',
  person_type: 'member'
})

// ❌ Error en el editor — full_name es requerido
await supabase.from('people').insert({
  person_type: 'member'
  // TypeScript: "Property 'full_name' is missing"
})

// ❌ Error en el editor — typo en el nombre de columna
await supabase.from('people').select('fullname')
// TypeScript: "fullname does not exist in people"
```

## Cómo se usan en el proyecto

```ts
import type { Tables, TablesInsert } from '@/types/supabase'

// Tipo de una fila de people
type Person = Tables<'people'>

// Tipo para insertar una persona
type NewPerson = TablesInsert<'people'>
```

## Cuándo regenerarlos

Cada vez que se aplica una migración que cambia el schema (agregar columna, nueva tabla, etc.), hay que regenerar los tipos. Claude lo hace automáticamente después de cada migración.
