# Conceptos 22 y 23 — JOINs anidados en Supabase y aplanar datos con `.map()`

## Dónde aparece en el proyecto

`src/features/ministries/hooks/useMinistries.ts` — función `useMinistries()`

---

## Concepto 22 — JOIN anidado en Supabase

### El problema

Cuando cargás ministerios, necesitás saber quiénes son sus líderes. Esa información vive en dos tablas distintas: `leader_ministries` (la relación) y `people` (los datos de la persona).

Sin ninguna herramienta especial, necesitarías:
1. Consultar `ministries` → obtenés los ministerios
2. Consultar `leader_ministries` → obtenés qué personas son líderes de cada ministerio
3. Consultar `people` → obtenés los nombres de esas personas
4. Unir todo manualmente en tu código

Eso son 3 consultas y código extra solo para mostrar una pantalla.

### La solución: `select()` con tablas relacionadas

Supabase conoce las claves foráneas de tu base de datos. Si `leader_ministries.ministry_id` apunta a `ministries.id`, Supabase sabe que están relacionadas y te permite traer los datos de una tabla "desde adentro" de otra:

```ts
const { data } = await supabase
  .from('ministries')
  .select(`
    *,
    leader_ministries (
      id,
      person_id,
      people (
        first_name,
        last_name,
        person_type
      )
    )
  `)
```

Esto hace **una sola consulta** a la base de datos y trae:
- Todos los campos de `ministries` (el `*`)
- Dentro de cada ministerio: los registros de `leader_ministries` que le pertenecen
- Dentro de cada líder: los datos de la persona en `people`

### Cómo llegan los datos

Supabase te devuelve los datos con la misma estructura anidada que escribiste en el `select`:

```json
{
  "id": "abc-123",
  "name": "Ministerio de Alabanza",
  "is_active": true,
  "leader_ministries": [
    {
      "id": "lm-001",
      "person_id": "p-001",
      "people": {
        "first_name": "María",
        "last_name": "González",
        "person_type": "member"
      }
    }
  ]
}
```

El nombre de la clave (`leader_ministries`, `people`) viene del nombre real de la tabla en la base de datos.

---

## Concepto 23 — Aplanar datos anidados con `.map()`

### El problema con la estructura anidada

La estructura que devuelve Supabase es correcta, pero incómoda de usar en los componentes. Para mostrar el nombre de un líder tendrías que escribir:

```tsx
{m.leader_ministries[0].people.first_name}
```

Y antes de eso, verificar que `leader_ministries` no es null, que `people` no es null, etc. Es mucho ruido.

### La solución: transformar los datos en el hook

En `useMinistries.ts` la función `queryFn` no devuelve los datos tal como llegan — los transforma primero con `.map()`:

```ts
return (data ?? []).map((m) => ({
  ...m,
  leaders: (m.leader_ministries ?? []).map((lm: any) => ({
    id: lm.id,
    person_id: lm.person_id,
    first_name: lm.people?.first_name ?? '',
    last_name: lm.people?.last_name ?? '',
    person_type: lm.people?.person_type ?? '',
  })),
}))
```

Esto convierte la estructura anidada en algo plano y predecible:

```json
{
  "id": "abc-123",
  "name": "Ministerio de Alabanza",
  "leaders": [
    {
      "id": "lm-001",
      "person_id": "p-001",
      "first_name": "María",
      "last_name": "González",
      "person_type": "member"
    }
  ]
}
```

Ahora en los componentes podés escribir simplemente `m.leaders[0].first_name`.

### Los operadores que aparecen

**`?? ''`** (nullish coalescing — "fusión de nulos"):
```ts
lm.people?.first_name ?? ''
```
Significa: "si `first_name` es `null` o `undefined`, usá `''` en su lugar". Evita errores cuando un campo no tiene valor.

**`?.`** (optional chaining — "encadenamiento opcional"):
```ts
lm.people?.first_name
```
Significa: "intentá acceder a `first_name`, pero si `people` es `null`, no falles — devolvé `undefined`". Sin el `?.`, si `people` fuera null, esto tiraría un error.

**`(data ?? []).map(...)`**:
Si `data` es null (por ejemplo, si la consulta aún no terminó), usar `.map()` directamente fallaría. El `?? []` garantiza que siempre haya un array sobre el que iterar.

### Por qué se hace en el hook y no en el componente

El hook es el único lugar que sabe cómo viene la data de Supabase. Al transformarla ahí, los componentes reciben siempre la misma forma — si mañana cambiás la query o la estructura de la base de datos, solo cambiás el hook, no todos los componentes que lo usan.

---

## Resumen

| Concepto | Dónde | Para qué |
|---|---|---|
| JOIN anidado `select()` | `useMinistries.ts` línea 10 | Traer varias tablas relacionadas en una sola consulta |
| `.map()` para aplanar | `useMinistries.ts` línea 27 | Transformar datos anidados en formato cómodo para componentes |
| `?.` optional chaining | `useMinistries.ts` línea 32 | Acceder a propiedades sin fallar si el objeto es null |
| `?? ''` nullish coalescing | `useMinistries.ts` línea 32 | Proveer valor por defecto cuando algo es null/undefined |
