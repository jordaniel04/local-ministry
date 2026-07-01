# Changelog — ESLIDER Ministry Manager

Registro de cambios por sprint. Formato: [Sprint] — Fecha — Descripción.

---

## [Sprint 1] — 2026-06-26/27 — Fundación

### Añadido
- Proyecto Vite + React + TypeScript inicializado
- Stack completo instalado: Tailwind v4, React Router v6, TanStack Query v5, Zustand, vite-plugin-pwa, Supabase JS
- PWA configurada con Workbox (estrategia NetworkFirst para Supabase)
- Estructura de carpetas por features creada (`src/features/`, `src/lib/`, etc.)
- Cliente Supabase en `src/lib/supabase.ts`
- Variables de entorno en `.env` (excluido de git)
- Schema completo de base de datos en Supabase (12 tablas):
  - `profiles`, `people`, `ministries`, `leader_ministries`
  - `formation_modules`, `formation_lessons`, `person_lesson_progress`
  - `class_sessions`, `attendance`
  - `tasks`, `exposition_notes`, `leader_sessions`
- RLS habilitado en todas las tablas
- Tipos TypeScript generados desde el schema (`src/types/supabase.ts`)
- Documentación completa en `docs/`:
  - `architecture.md` — stack, estructura, decisiones
  - `database.md` — ERD en Mermaid, descripción de tablas
  - `auth-flow.md` — flujo de autenticación con diagramas
  - `api-contracts.md` — queries y mutaciones principales
  - `roadmap.md` — estado y sprints
  - `tooling.md` — plugins y MCPs instalados
  - `use-cases/` — 9 casos de uso con diagramas de secuencia
  - `decisions/` — 4 ADRs de decisiones de arquitectura
  - `learning/` — 9 conceptos técnicos con ejemplos

### Configurado
- Plugins de Claude Code: context7, learning-output-style, playwright, supabase, frontend-design
- Supabase MCP activo y conectado al proyecto `local-ministry`
- `.gitignore` actualizado para excluir `.env`
- `tsconfig.app.json` corregido (eliminado `baseUrl` deprecado)

### Pendiente (Sprint 2)
- Instalar y configurar shadcn/ui
- Implementar Auth (login con email/password)
- Crear layout principal (sidebar + header)
- Configurar React Router con rutas base y protección de rutas
