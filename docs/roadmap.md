# Roadmap — ESLIDER Ministry Manager

> Última actualización: 2026-06-30

## Estado actual
Sprints 1–7 completados. Auth, Personas, Ministerios, Tareas, Notas, Seguimiento 1:1, Formación y Asistencia funcionando.

## Completado ✅
- [2026-06-26] Inicializar proyecto Vite + React + TypeScript
- [2026-06-26] Instalar y configurar stack completo (Tailwind v4, React Router, TanStack Query, Zustand, vite-plugin-pwa, Supabase JS)
- [2026-06-26] Configurar PWA (manifest + Workbox con NetworkFirst para Supabase)
- [2026-06-26] Crear estructura de carpetas por features
- [2026-06-26] Crear CLAUDE.md con reglas y contexto del proyecto
- [2026-06-26] Crear proyecto en Supabase y configurar credenciales en `.env`
- [2026-06-26] Crear schema de base de datos completo (11 tablas + RLS)
- [2026-06-26] Generar tipos TypeScript desde Supabase (`src/types/supabase.ts`)
- [2026-06-26] Instalar y configurar shadcn/ui (estilo base-nova, Tailwind v4)
- [2026-06-26] Implementar Auth: login con email/password + Zustand store + inicialización de sesión
- [2026-06-26] Crear Layout principal: sidebar colapsable, NavLink activo, logout
- [2026-06-26] Configurar React Router v7: rutas protegidas, ProtectedRoute, rutas hijas con Outlet
- [2026-06-29] Migrar de npm a pnpm v11.9.0 (supply chain policies activas)
- [2026-06-29] Documentar conceptos de aprendizaje 10–23 en `docs/learning/`
- [2026-06-29] Sprint 2 — Módulo Personas: listado, filtros, formulario, detalle, campos espirituales
- [2026-06-30] Sprint 3 — Ministerios y Líderes: catálogo, asignación muchos-a-muchos, chips UI
- [2026-06-30] Sprint 4 — Tareas y Delegaciones: CRUD, filtros por estado, completar con resultado, vencidas
- [2026-06-30] Sprint 5 — Notas de exposiciones: listado, card expandible, highlights/mejoras
- [2026-06-30] Sprint 5 — Seguimiento 1:1: sesiones con líderes, resumen, acuerdos, próxima sesión
- [2026-06-30] Sprint 6 — Módulo de Formación (CORE): currículo, progreso por persona, promedio de notas
- [2026-06-30] Sprint 7 — Asistencia: sesiones de clase/culto, toma masiva por sesión con upsert

## Backlog 💡
- Roles diferenciados para líderes (acceso solo a su área)
- Dashboard con métricas generales para el pastor
- Notificaciones cuando una tarea lleva mucho tiempo pendiente
- Exportar listados a PDF/Excel

## Decisiones de arquitectura 🏗️
- **Vite sobre Next.js**: App de gestión interna sin necesidad de SEO — SPA es suficiente y más simple
- **Supabase sobre Firebase**: Datos relacionales (personas ↔ ministerios ↔ tareas) se modelan mejor en PostgreSQL que en NoSQL
- **TanStack Query sobre useEffect+fetch**: Maneja caché, loading, error y refetch automáticamente
- **Tailwind sobre CSS Modules**: Menos contexto switching, estilos junto al JSX
- **shadcn/ui sobre MUI/Chakra**: Los componentes viven en el proyecto, control total sin depender de una API externa
- **Texto simple en notas**: No se necesita editor enriquecido — textarea es suficiente para apuntes de exposiciones
- **Sin adjuntos en sesiones 1:1**: No se necesita Supabase Storage en esta versión
- **PWA**: La app se usará desde móvil por líderes en campo — instalable sin App Store
