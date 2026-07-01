# 14 — useEffect: Ciclo de Vida en React

## ¿Qué es useEffect?

`useEffect` es el hook que permite ejecutar código **después de que el componente se renderiza**. Es la manera de sincronizar un componente con algo externo: una API, un timer, una suscripción, el DOM directamente.

---

## Analogía con Angular

```
Angular                              →   React
────────────────────────────────────────────────────────
ngOnInit()                           →   useEffect(() => { ... }, [])
ngOnDestroy()                        →   return () => cleanup() dentro del useEffect
ngOnChanges(changes)                 →   useEffect(() => { ... }, [dependencia])
```

La diferencia importante: en Angular el ciclo de vida está separado en métodos distintos (`ngOnInit`, `ngOnDestroy`, etc.). En React **todo vive dentro de un solo `useEffect`** — la función que retorna es el cleanup.

---

## Estructura básica

```tsx
useEffect(() => {
  // CÓDIGO QUE CORRE DESPUÉS DEL RENDER
  // equivalente a ngOnInit

  return () => {
    // CLEANUP — corre antes de que el componente se desmonte
    // equivalente a ngOnDestroy
  }
}, [/* dependencias */])
```

---

## El array de dependencias — la parte más importante

```tsx
// Sin array → corre después de CADA render (casi nunca se quiere esto)
useEffect(() => { console.log('render') })

// Array vacío [] → corre UNA VEZ al montar (como ngOnInit)
useEffect(() => { console.log('montó') }, [])

// Con dependencias → corre cuando alguna dependencia cambia
useEffect(() => {
  console.log('personId cambió a:', personId)
}, [personId])
```

---

## Cómo lo usamos en este proyecto

En `useAuthInit` usamos `useEffect` para dos cosas:

```ts
// src/features/auth/hooks/useAuth.ts
export function useAuthInit() {
  const { setUser, clear } = useAuthStore()

  useEffect(() => {
    // 1. Al montar: verificar si hay sesión guardada en localStorage
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { clear(); return }
      const role = await fetchRole(session.user.id)
      setUser(session.user, role)
    })

    // 2. Suscribirse a cambios futuros de sesión (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) { clear(); return }
        const role = await fetchRole(session.user.id)
        setUser(session.user, role)
      }
    )

    // Cleanup: cancelar la suscripción cuando el componente se desmonte
    return () => subscription.unsubscribe()
  }, [])   // [] → solo corre una vez al inicio de la app
}
```

El `subscription.unsubscribe()` en el return es crítico: sin él, si el componente se destruye (o en React Strict Mode que monta/desmonta componentes dos veces en desarrollo), la suscripción quedaría activa y podría causar memory leaks o comportamiento inesperado.

---

## ¿Por qué el array vacío `[]`?

En este caso queremos que la inicialización de auth ocurra **una sola vez** cuando la app arranca, no cada vez que el componente se re-renderiza. Si omitimos el array, el efecto correría en cada render — creando suscripciones infinitas.

---

## useEffect NO es para fetch de datos

Esta es la trampa más común al aprender React:

```tsx
// ❌ No hagas esto para datos de Supabase
useEffect(() => {
  supabase.from('people').select('*').then(({ data }) => setPeople(data))
}, [])

// ✅ Usa TanStack Query en su lugar
const { data } = useQuery({ queryKey: ['people'], queryFn: ... })
```

`useEffect` para fetch tiene problemas conocidos: condiciones de carrera, sin caché, sin retry automático. TanStack Query resuelve todo eso. Ver [11-tanstack-query-fetching.md](./11-tanstack-query-fetching.md).

**Regla:** `useEffect` solo para suscripciones, timers, integración con librerías externas al DOM. Nunca para fetch de datos de la DB.

---

## React Strict Mode y los efectos dobles

En desarrollo, React Strict Mode monta → desmonta → monta cada componente dos veces para detectar efectos que no tienen cleanup. Por eso en dev verás los logs de `useEffect` dos veces. En producción solo corre una vez. Si tu efecto tiene cleanup correcto, esto no causa problemas.

---

## Recursos

- Archivo en este proyecto: `src/features/auth/hooks/useAuth.ts`
- [React docs: useEffect](https://react.dev/reference/react/useEffect)
