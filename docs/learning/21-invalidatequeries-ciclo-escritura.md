# 21 — invalidateQueries: Cómo se Actualiza la Lista Automáticamente

## El problema del caché

TanStack Query guarda los datos en caché para no hacer llamadas innecesarias a Supabase. Cuando entras a `/people`, hace una sola llamada y guarda el resultado. Si navegas a otra pantalla y vuelves, muestra los datos del caché instantáneamente.

Pero esto crea un problema: si **creas una nueva persona**, TanStack Query no sabe que el caché ya está desactualizado. La lista seguiría mostrando los datos viejos hasta que el caché expire naturalmente.

---

## La solución: invalidar el caché manualmente

Después de una mutación exitosa, le decimos a TanStack Query "este caché ya no es válido":

```tsx
const queryClient = useQueryClient()

useMutation({
  mutationFn: async (person) => {
    const { data, error } = await supabase.from('people').insert(person)
    if (error) throw error
    return data
  },
  onSuccess: () => {
    // "El caché de ['people'] está desactualizado, recárgalo"
    queryClient.invalidateQueries({ queryKey: ['people'] })
  },
})
```

---

## El flujo completo

```
Usuario llena formulario y hace clic en "Crear persona"
  → mutationFn: inserta en Supabase                ← llamada a la DB
  → onSuccess: invalidateQueries(['people'])        ← marca caché como stale
  → TanStack Query re-fetcha ['people']             ← nueva llamada a Supabase
  → Lista se actualiza con la nueva persona         ← pantalla actualizada
  → Modal se cierra (onClose())
```

Todo esto sin que el usuario recargue la página.

---

## queryKey — la dirección del caché

El `queryKey` es como el nombre del cajón donde guardas los datos:

```tsx
['people']              // todos los datos de personas
['people', personId]    // datos de UNA persona específica
['tasks', { leaderId }] // tareas filtradas por líder
```

Cuando invalidas `['people']`, solo ese cajón se marca como desactualizado. Los demás (como `['people', id]`) no se ven afectados a menos que los invalides también.

En `useUpdatePerson` invalidamos ambos:

```tsx
onSuccess: (data) => {
  queryClient.invalidateQueries({ queryKey: ['people'] })        // lista
  queryClient.invalidateQueries({ queryKey: ['people', data.id] }) // detalle
},
```

---

## La diferencia con refetch

```tsx
// refetch — fuerza recarga ahora mismo, aunque los datos estén frescos
queryClient.refetchQueries({ queryKey: ['people'] })

// invalidateQueries — marca como stale, recarga solo si hay componentes activos mirando esos datos
queryClient.invalidateQueries({ queryKey: ['people'] })
```

`invalidateQueries` es más inteligente: si nadie está viendo la lista en este momento, no hace la llamada innecesaria. Cuando alguien la vea, ahí sí recarga.

---

Archivo: [src/features/people/hooks/usePeople.ts](../../src/features/people/hooks/usePeople.ts)
