# ADR-004 — shadcn/ui en lugar de MUI o Chakra UI

**Fecha:** 2026-06-26
**Estado:** Aceptado

## Contexto
Necesitamos una librería de componentes UI para construir la interfaz.

## Decisión
Usamos **shadcn/ui**.

## Razones
- Los componentes se copian al proyecto (`src/components/ui/`) — no son una dependencia externa. Control total sobre el código
- No hay breaking changes de versiones externas que rompan la app
- Construido sobre Radix UI (accesibilidad) + Tailwind CSS (ya en el stack)
- MUI y Chakra tienen sus propios sistemas de estilos que entran en conflicto con Tailwind
- Los componentes de shadcn se pueden modificar libremente sin restricciones de API

## Consecuencias
- Hay que instalar cada componente individualmente con el CLI de shadcn
- Al actualizar shadcn, los cambios no llegan automáticamente — hay que hacer merge manual
- El código de los componentes vive en el repo (más código propio, pero más control)
