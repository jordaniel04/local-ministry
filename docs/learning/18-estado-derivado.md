# 18 — Estado Derivado: No Todo Necesita useState

## El error común

Cuando empiezas con React, la tentación es poner todo en `useState`. Si tienes una lista filtrada, pones el filtro Y la lista filtrada en estado:

```tsx
// ❌ Innecesario
const [people, setPeople] = useState([])
const [filter, setFilter] = useState('all')
const [filtered, setFiltered] = useState([])   // ← no hace falta

// Problema: tienes que sincronizar manualmente
useEffect(() => {
  setFiltered(people.filter(p => p.person_type === filter))
}, [people, filter])
```

Esto funciona pero es más código del necesario y puede desincronizarse.

---

## La solución: calcular durante el render

Si un valor **se puede calcular** de otros valores que ya existen, no necesita su propio estado:

```tsx
// ✅ Correcto
const [filter, setFilter] = useState('all')
const { data: people } = usePeople()   // viene de TanStack Query

// filtered se calcula automáticamente — no es estado
const filtered = (people ?? []).filter(p =>
  filter === 'all' || p.person_type === filter
)
```

Cada vez que `people` o `filter` cambian, React re-renderiza el componente y `filtered` se recalcula solo. Sin efecto, sin sincronización manual.

---

## ¿Por qué funciona esto?

React re-ejecuta la función del componente completa cada vez que hay un cambio de estado. Eso significa que todas las variables dentro del componente se recalculan en cada render.

```
Usuario cambia filtro
  → setFilter('member')       ← cambia el estado
  → React re-renderiza        ← re-ejecuta todo el componente
  → filtered se recalcula     ← automáticamente con el nuevo filtro
  → pantalla se actualiza
```

Es eficiente porque React es muy rápido haciendo este ciclo. No necesitas optimizar manualmente a menos que la lista tenga miles de elementos.

---

## Regla práctica

Hazte esta pregunta:

> "¿Puedo calcular este valor a partir de datos que ya tengo?"

- **Sí** → no uses `useState`, calcula directamente
- **No** → usa `useState`

| Situación | Herramienta |
|---|---|
| Lista filtrada | Calcular (variable normal) |
| Texto del buscador | `useState` |
| Datos de Supabase | TanStack Query |
| Modal abierto/cerrado | `useState` |
| Promedio de notas | Calcular |
| Rol del usuario | Zustand store |

---

## En este proyecto

En [PeopleList.tsx](../../src/features/people/components/PeopleList.tsx):

```tsx
// search y filter son estado — el usuario los controla
const [search, setSearch] = useState('')
const [filter, setFilter] = useState<FilterType>('all')

// filtered es derivado — se calcula de lo que ya tenemos
const filtered = (people ?? []).filter((p: Person) => {
  const matchesType = filter === 'all' || p.person_type === filter
  const fullName = `${p.first_name} ${p.last_name}`.toLowerCase()
  const matchesSearch = fullName.includes(search.toLowerCase())
  return matchesType && matchesSearch && p.is_active
})
```
