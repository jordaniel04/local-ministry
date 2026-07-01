# Conceptos 28 y 29 — `enabled` en useQuery y `Map` como estructura de datos

## Dónde aparece en el proyecto

`src/features/formation/hooks/useFormation.ts` — función `usePersonProgress()`

---

## Concepto 28 — `enabled`: consultas que esperan un valor

### El problema

`usePersonProgress` necesita un `personId` para consultar a Supabase. Pero el hook se registra cuando el componente se monta — antes de que el usuario elija a alguien. Sin ninguna protección, TanStack Query ejecutaría la query con `personId = ''`, lo que mandaría una consulta inválida.

### La solución

```ts
export function usePersonProgress(personId: string) {
  return useQuery({
    queryKey: ['formation-progress', personId],
    enabled: !!personId,   // solo ejecuta si personId tiene valor
    queryFn: async () => { ... }
  })
}
```

`enabled` recibe un boolean. Cuando es `false`, TanStack Query simplemente no hace nada — no lanza la query, no muestra loading, no muestra error.

### Qué hace `!!personId`

El doble `!` convierte cualquier valor a su equivalente boolean:

| Valor de `personId` | `!!personId` | Resultado |
|---|---|---|
| `''` (vacío) | `false` | Query no ejecuta |
| `'abc-123-uuid'` | `true` | Query ejecuta |

Un solo `!` invierte el boolean. El segundo `!` lo vuelve a invertir — el efecto neto es convertir cualquier valor a `true` o `false` limpiamente.

### Por qué la query key incluye `personId`

```ts
queryKey: ['formation-progress', personId]
```

Cuando el usuario cambia de persona, `personId` cambia → la query key cambia → TanStack Query hace una nueva consulta para esa persona. Si la misma persona ya se consultó antes, usa el caché sin ir a la base de datos.

---

## Concepto 29 — `Map`: estructura de datos para búsquedas rápidas

> Nota: esto es distinto al método `.map()` de arrays (concepto 23). `Map` con mayúscula es una estructura de datos de JavaScript.

### El problema

`usePersonProgress` hace dos consultas separadas:
1. Módulos y lecciones del currículo
2. Registros de progreso de esa persona

Después hay que cruzarlos: para cada lección, encontrar si tiene un registro de progreso.

La solución ingenua sería usar `.find()` por cada lección:

```ts
lessons.map((lesson) => ({
  ...lesson,
  progress: progress.find((p) => p.lesson_id === lesson.id) ?? null
}))
```

Esto funciona, pero es lento: por cada lección recorre toda la lista de progreso. Con 50 lecciones y 50 registros son **2.500 comparaciones**.

### La solución: `Map` como índice

```ts
// Construir el índice una sola vez
const progressMap = new Map(
  (progress ?? []).map((p) => [p.lesson_id, p])
)

// Buscar en tiempo constante
lessons.map((lesson) => ({
  ...lesson,
  progress: progressMap.get(lesson.id) ?? null
}))
```

`Map` es como un diccionario: cada entrada tiene una clave y un valor. Se crea con pares `[clave, valor]`:

```ts
new Map([
  ['lesson-uuid-1', { completed: true, score: 85 }],
  ['lesson-uuid-2', { completed: false, score: null }],
])
```

`.get('lesson-uuid-1')` devuelve el objeto de progreso directamente — sin recorrer nada.

### Comparación de rendimiento

| Enfoque | Operaciones para 50 lecciones |
|---|---|
| `.find()` por cada lección | 50 × 50 = **2.500** comparaciones |
| `Map` | 50 construir + 50 buscar = **100** operaciones |

En una app pequeña la diferencia no se nota. Pero es un patrón que se usa en cualquier escala porque es la forma correcta de cruzar dos listas.

### Cuándo usar `Map` vs `.find()`

- **`.find()`**: cuando buscás una vez o la lista es muy corta (menos de 10 elementos)
- **`Map`**: cuando buscás el mismo tipo de dato muchas veces, o la lista puede crecer

---

## Resumen

| Concepto | Dónde | Para qué |
|---|---|---|
| `enabled: !!valor` | `usePersonProgress` | Evitar que useQuery ejecute sin los datos necesarios |
| `new Map([...])` | `usePersonProgress` | Índice para cruzar dos listas en O(1) en vez de O(n²) |
| `.get(clave)` | `usePersonProgress` | Buscar un valor en el Map por su clave |
