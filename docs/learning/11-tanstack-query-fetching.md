# 11 — TanStack Query: Fetching de Datos del Servidor

## ¿Qué problema resuelve?

Cuando un componente necesita datos de Supabase, la trampa común en React es hacer esto:

```tsx
// ❌ El patrón que parece natural pero tiene problemas
function PeopleList() {
  const [people, setPeople] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    supabase.from('people').select('*')
      .then(({ data }) => setPeople(data))
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [])

  // ...
}
```

Esto funciona, pero tiene problemas invisibles:
- Si navegas a otra pantalla y vuelves, hace otra llamada aunque los datos no cambiaron
- Si dos componentes piden la misma data, hacen dos llamadas separadas
- No hay reintento automático si la red falla
- Tienes que manejar `isLoading`, `error`, `data` manualmente siempre

**TanStack Query** resuelve todo esto con una sola función.

---

## Analogía con Angular

```
Angular                              →   TanStack Query
────────────────────────────────────────────────────────
HttpClient.get('/api/people')        →   queryFn: () => supabase.from('people')...
async pipe + loading state manual    →   { data, isLoading, error } automáticos
Sin caché (por defecto)              →   Caché automático por queryKey
switchMap + takeUntil (cleanup)      →   Manejado internamente
```

La diferencia más grande: Angular necesita que tú manejes el estado de carga y los operadores RxJS. TanStack Query lo hace por ti.

---

## useQuery — Leer datos

```tsx
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

function PeopleList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['people'],           // identificador único del cache
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('full_name')
      if (error) throw error
      return data
    },
  })

  if (isLoading) return <p>Cargando...</p>
  if (error) return <p>Error: {error.message}</p>
  return <ul>{data.map(p => <li key={p.id}>{p.full_name}</li>)}</ul>
}
```

### El queryKey — cómo funciona el caché

El `queryKey` es como una dirección de caché. Si dos componentes usan la misma key, **comparten la misma llamada y el mismo resultado**:

```ts
['people']              // todos las personas
['people', personId]    // una persona específica
['tasks', { leaderId }] // tareas filtradas por líder
```

Si navegas a otra pantalla y vuelves, TanStack Query muestra los datos del caché **instantáneamente** y luego verifica en background si hay datos nuevos. El usuario nunca ve un spinner innecesario.

---

## useMutation — Escribir datos

Para crear, editar o borrar datos se usa `useMutation`:

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function CreatePersonForm() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (newPerson) => {
      const { data, error } = await supabase
        .from('people')
        .insert(newPerson)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidar el caché de 'people' → fuerza re-fetch automático
      queryClient.invalidateQueries({ queryKey: ['people'] })
    },
  })

  return (
    <button onClick={() => mutation.mutate({ full_name: 'Juan', person_type: 'believer' })}>
      {mutation.isPending ? 'Guardando...' : 'Crear persona'}
    </button>
  )
}
```

---

## Ciclo de vida de los datos

```
Componente monta
  → TanStack Query revisa el caché con esa queryKey
  → Si hay caché reciente: muestra datos inmediatamente (sin spinner)
  → Si el caché expiró o no existe: llama queryFn
  → Actualiza caché + re-renderiza componente con nuevos datos

useMutation ejecuta
  → onSuccess: invalidateQueries(['people'])
  → TanStack Query marca ese caché como "stale"
  → Todos los componentes que usan ['people'] hacen re-fetch automático
```

---

## Configuración en este proyecto

El `QueryClient` vive en `src/App.tsx` dentro del `QueryClientProvider`. Es el equivalente al módulo raíz de Angular — todo lo que esté dentro puede usar `useQuery` y `useMutation`.

```tsx
// src/App.tsx
const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* toda la app */}
    </QueryClientProvider>
  )
}
```

---

## Regla en este proyecto (del CLAUDE.md)

> Todo fetch a Supabase va dentro de un `useQuery` o `useMutation`.
> Nunca usar `useEffect` + `useState` para hacer fetch.

---

## Recursos

- [TanStack Query docs](https://tanstack.com/query/latest)
- Archivos en este proyecto: `src/features/*/hooks/use*.ts`
