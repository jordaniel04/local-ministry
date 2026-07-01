# TanStack Query — Por qué reemplaza useEffect + fetch

## El problema con useEffect + fetch

En React, la forma "naïve" de obtener datos es así:

```ts
// ❌ Lo que NO haremos en este proyecto
function PeopleList() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    supabase.from('people').select('*')
      .then(({ data, error }) => {
        if (error) setError(error)
        else setPeople(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Cargando...</p>
  if (error) return <p>Error</p>
  return <ul>{people.map(p => <li>{p.full_name}</li>)}</ul>
}
```

Problemas:
- Cada vez que navegas a esta pantalla, vuelve a hacer el fetch aunque los datos no cambiaron
- Si dos componentes necesitan los mismos datos, hacen dos requests separados
- Tienes que manejar manualmente `loading`, `error`, y el dato
- No se actualiza automáticamente cuando cambias algo

## La solución: TanStack Query

```ts
// ✅ Lo que SÍ haremos
function PeopleList() {
  const { data: people, isLoading, error } = useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const { data, error } = await supabase.from('people').select('*')
      if (error) throw error
      return data
    }
  })

  if (isLoading) return <p>Cargando...</p>
  if (error) return <p>Error</p>
  return <ul>{people.map(p => <li>{p.full_name}</li>)}</ul>
}
```

## ¿Qué ganas con TanStack Query?

| Feature | useEffect | TanStack Query |
|---|---|---|
| Caché automático | ❌ | ✅ No repite el fetch si los datos son frescos |
| Loading/Error state | Manual | ✅ Automático |
| Refetch al volver a la pantalla | ❌ | ✅ Automático |
| Dos componentes, un solo request | ❌ | ✅ Comparten caché por queryKey |
| Invalidar caché tras mutación | Manual | ✅ `queryClient.invalidateQueries` |

## La queryKey — el identificador del caché

```ts
queryKey: ['people']              // todos los people
queryKey: ['people', id]          // un person específico
queryKey: ['tasks', { leaderId }] // tasks filtradas por líder
```

Si dos componentes usan la misma `queryKey`, comparten el mismo caché — un solo request para ambos.

## Mutaciones (INSERT, UPDATE, DELETE)

```ts
const mutation = useMutation({
  mutationFn: async (newPerson) => {
    const { data, error } = await supabase.from('people').insert(newPerson)
    if (error) throw error
    return data
  },
  onSuccess: () => {
    // Invalida el caché de people → fuerza refetch automático
    queryClient.invalidateQueries({ queryKey: ['people'] })
  }
})

// Usar:
mutation.mutate({ full_name: 'Juan', person_type: 'member' })
```

## Analogía con Angular

En Angular, un `HttpClient` dentro de un `Service` con `shareReplay(1)` hace algo similar — comparte el resultado entre suscriptores. TanStack Query es eso pero mucho más completo y sin el boilerplate de RxJS.

## Regla del proyecto

> **Nunca usar `useEffect + useState` para fetching de datos.**
> Todo fetch a Supabase va dentro de `useQuery` o `useMutation`.
