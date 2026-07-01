# ADR-003 — TanStack Query en lugar de useEffect + fetch

**Fecha:** 2026-06-26
**Estado:** Aceptado

## Contexto
Necesitamos una estrategia para fetching de datos desde Supabase en los componentes React.

## Decisión
Usamos **TanStack Query v5** para todas las operaciones de lectura y escritura.

## Razones
- Maneja automáticamente estados de loading, error y datos sin boilerplate
- Caché compartido por `queryKey`: si dos componentes necesitan los mismos datos, solo se hace un request
- Invalidación de caché tras mutaciones: al crear/editar un registro, la lista se actualiza automáticamente
- Refetch automático al volver a la ventana (datos siempre frescos)
- `useEffect + useState` para fetching es propenso a bugs (race conditions, memory leaks, estados desincronizados)

## Consecuencias
- Toda la app debe usar `useQuery` y `useMutation` — nunca `useEffect` para fetching
- Hay una curva de aprendizaje inicial con las `queryKeys` y la invalidación
- El `QueryClient` debe estar en el root de la app (en `main.tsx`)
