# Graph Report - .  (2026-06-30)

## Corpus Check
- 130 files · ~191,349 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 601 nodes · 986 edges · 29 communities (24 shown, 5 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 86 edges (avg confidence: 0.84)
- Token cost: 296,403 input · 52,302 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Database & Reporting Domain|Database & Reporting Domain]]
- [[_COMMUNITY_Architecture & Auth Docs|Architecture & Auth Docs]]
- [[_COMMUNITY_Data Fetching Learning Notes|Data Fetching Learning Notes]]
- [[_COMMUNITY_shadcn UI Primitives|shadcn UI Primitives]]
- [[_COMMUNITY_App Shell & Routing|App Shell & Routing]]
- [[_COMMUNITY_Formation Module (Feature)|Formation Module (Feature)]]
- [[_COMMUNITY_ReactSupabase Fundamentals Notes|React/Supabase Fundamentals Notes]]
- [[_COMMUNITY_People Feature|People Feature]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Tasks Feature|Tasks Feature]]
- [[_COMMUNITY_Leader Tracking Feature|Leader Tracking Feature]]
- [[_COMMUNITY_Ministries Feature|Ministries Feature]]
- [[_COMMUNITY_shadcn Components Config|shadcn Components Config]]
- [[_COMMUNITY_Notes Feature & Supabase Client|Notes Feature & Supabase Client]]
- [[_COMMUNITY_TS Config (App)|TS Config (App)]]
- [[_COMMUNITY_Tooling & Changelog|Tooling & Changelog]]
- [[_COMMUNITY_TS Config (Node)|TS Config (Node)]]
- [[_COMMUNITY_Supabase Generated Types|Supabase Generated Types]]
- [[_COMMUNITY_Migrations Learning Notes|Migrations Learning Notes]]
- [[_COMMUNITY_Icon Sprite Set|Icon Sprite Set]]
- [[_COMMUNITY_Props & Derived State Notes|Props & Derived State Notes]]
- [[_COMMUNITY_Oxlint Config|Oxlint Config]]
- [[_COMMUNITY_shadcn Setup Notes|shadcn Setup Notes]]
- [[_COMMUNITY_TS Project References|TS Project References]]
- [[_COMMUNITY_Favicon Asset|Favicon Asset]]
- [[_COMMUNITY_Hero Image Asset|Hero Image Asset]]
- [[_COMMUNITY_React Logo Asset (unused)|React Logo Asset (unused)]]
- [[_COMMUNITY_Vite Logo Asset (unused)|Vite Logo Asset (unused)]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 32 edges
2. `compilerOptions` - 18 edges
3. `compilerOptions` - 15 edges
4. `Diagrama ERD (Mermaid) de 12 tablas` - 14 edges
5. `CLAUDE.md — ESLIDER Ministry Manager (contexto de proyecto)` - 12 edges
6. `Tabla people` - 8 edges
7. `Tooling — MCPs, Plugins y Skills para ESLIDER` - 8 edges
8. `usePeople()` - 7 edges
9. `Sprint 1 — Fundación` - 7 edges
10. `API Contracts — Queries y Mutaciones principales` - 7 edges

## Surprising Connections (you probably didn't know these)
- `docs/roadmap.md` --references--> `Roadmap — ESLIDER Ministry Manager`  [INFERRED]
  CLAUDE.md → docs/roadmap.md
- `index.html — entry point de la SPA` --shares_data_with--> `Plantilla React + TypeScript + Vite`  [INFERRED]
  index.html → README.md
- `Input()` --calls--> `cn()`  [INFERRED]
  src/components/ui/input.tsx → src/lib/utils.ts
- `Reglas de Supabase (cliente único, manejo de errores, RLS siempre)` --references--> `Cliente Supabase (src/lib/supabase.ts)`  [INFERRED]
  CLAUDE.md → CHANGELOG.md
- `API Contracts — Queries y Mutaciones principales` --references--> `Cliente Supabase (src/lib/supabase.ts)`  [EXTRACTED]
  docs/api-contracts.md → CHANGELOG.md

## Import Cycles
- 1-file cycle: `src/components/ui/button.tsx -> src/components/ui/button.tsx`
- 1-file cycle: `src/components/ui/dialog.tsx -> src/components/ui/dialog.tsx`
- 1-file cycle: `src/components/ui/input.tsx -> src/components/ui/input.tsx`
- 1-file cycle: `src/components/ui/select.tsx -> src/components/ui/select.tsx`
- 1-file cycle: `src/components/ui/separator.tsx -> src/components/ui/separator.tsx`
- 1-file cycle: `src/lib/supabase.ts -> src/lib/supabase.ts`

## Hyperedges (group relationships)
- **Stack tecnológico definido conjuntamente por 4 ADRs** — docs_decisions_adr_001_vite_over_nextjs, docs_decisions_adr_002_supabase_over_firebase, docs_decisions_adr_003_tanstack_query, docs_decisions_adr_004_shadcn_ui, claude_md_stack [INFERRED 0.85]
- **Flujo CORE de formación: módulos, lecciones, progreso y promedio** — docs_database_table_formation_modules, docs_database_table_formation_lessons, docs_database_table_person_lesson_progress, docs_database_module_average_sql, docs_use_cases_uc_04_track_formation [INFERRED 0.90]
- **Alertas del dashboard construidas sobre múltiples tablas** — uc_09_absences_alert_sql, uc_09_no_progress_alert_sql, uc_09_overdue_tasks_alert_sql, uc_09_upcoming_sessions_alert_sql, uc_09_dashboardpage_component [INFERRED 0.85]
- **Authentication flow: RLS/JWT + Zustand authStore + ProtectedRoute** — docs_learning_01_rls_supabase_auth, docs_learning_10_zustand_estado_global_authstore, docs_learning_13_protected_route_guardia_protectedroute, docs_learning_14_useeffect_ciclo_de_vida_useauthinit [INFERRED 0.85]
- **Form state management pattern: derived state, functional setState, dependency-driven reset, field-setter currying** — docs_learning_18_estado_derivado_derived_state, docs_learning_19_useeffect_dependencias_dependency_array, docs_learning_20_setstate_forma_funcional_functional_setstate, docs_learning_27_funcion_que_devuelve_funcion_currying [INFERRED 0.75]
- **Data fetching/write cycle: useQuery, useMutation, queryKey, invalidateQueries** — docs_learning_09_tanstack_query_usequery, docs_learning_09_tanstack_query_usemutation, docs_learning_09_tanstack_query_querykey, docs_learning_09_tanstack_query_invalidatequeries, docs_learning_21_invalidatequeries_ciclo_escritura_invalidatequeries_flow [EXTRACTED 1.00]

## Communities (29 total, 5 thin omitted)

### Community 0 - "Database & Reporting Domain"
Cohesion: 0.06
Nodes (55): Queries de asistencia (attendance), Queries de reportes para dashboard (líderes con faltas, sin progreso, tareas vencidas), API Contracts — Queries y Mutaciones principales, RPC get_module_averages (pendiente de crear), Queries de personas (people): listar, filtrar, buscar, crear, actualizar, archivar, Queries de progreso de formación (person_lesson_progress), Queries de tareas (tasks), Patrón upsert (INSERT si no existe, UPDATE si existe) (+47 more)

### Community 1 - "Architecture & Auth Docs"
Cohesion: 0.05
Nodes (47): Reglas de fetching (TanStack Query obligatorio, query keys pattern), Glosario del dominio (Miembro, Visitante, Líder, Ministerio, Consolidado, Discipulado, Acompañamiento, Sesión 1:1), Estructura de carpetas src/features por módulo, Reglas de imports (alias @/, sin rutas relativas de más de un nivel), Modo de aprendizaje para explicar código (conceptos React, alternativas, analogías Angular), CLAUDE.md — ESLIDER Ministry Manager (contexto de proyecto), Reglas de componentes React (functional only, un componente por archivo, PascalCase), Stack tecnológico (React 18, TS, Vite, Supabase, React Router v6, TanStack Query v5, Zustand, Tailwind v4, shadcn/ui, vite-plugin-pwa) (+39 more)

### Community 2 - "Data Fetching Learning Notes"
Cohesion: 0.05
Nodes (43): Foreign Key (llave foránea), leader_ministries junction table, Muchos a muchos (N:M), ON DELETE CASCADE, Uno a muchos (1:N), manifest.webmanifest, Progressive Web App (PWA), Service Worker (+35 more)

### Community 3 - "shadcn UI Primitives"
Cohesion: 0.09
Nodes (29): AppLayout(), navItems, Badge(), badgeVariants, Card(), CardAction(), CardContent(), CardDescription() (+21 more)

### Community 4 - "App Shell & Routing"
Cohesion: 0.06
Nodes (12): App(), AuthInitializer(), queryClient, Props, ProtectedRoute(), signIn(), useAuthInit(), Tab (+4 more)

### Community 5 - "Formation Module (Feature)"
Cohesion: 0.12
Nodes (30): Input(), CurriculumManager(), LessonForm(), Props, LessonProgressRow(), Props, ModuleForm(), Props (+22 more)

### Community 6 - "React/Supabase Fundamentals Notes"
Cohesion: 0.06
Nodes (37): auth.role() function, authenticated_read policy on people, RLS (Row Level Security), Service role key, Supabase Auth (JWT), createClient() from @supabase/supabase-js, Singleton Pattern, supabase client (src/lib/supabase.ts) (+29 more)

### Community 7 - "People Feature"
Cohesion: 0.14
Nodes (28): FILTERS, FilterType, PeopleList(), Props, PersonBadge(), Props, typeStyles, FieldProps (+20 more)

### Community 8 - "Package Dependencies"
Cohesion: 0.06
Nodes (33): dependencies, @base-ui/react, class-variance-authority, clsx, lucide-react, react, react-dom, react-router-dom (+25 more)

### Community 9 - "Tasks Feature"
Cohesion: 0.16
Nodes (23): Textarea, Props, TaskCard(), EMPTY_FORM, FormState, Props, TaskForm(), FILTERS (+15 more)

### Community 10 - "Leader Tracking Feature"
Cohesion: 0.19
Nodes (17): Button(), buttonVariants, LeaderSessionsList(), Props, SessionCard(), EMPTY_FORM, FormState, Props (+9 more)

### Community 11 - "Ministries Feature"
Cohesion: 0.20
Nodes (17): LeaderAssigner(), Props, MinistriesList(), FormState, MinistryForm(), Props, useAssignLeader(), useCreateMinistry() (+9 more)

### Community 12 - "shadcn Components Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 13 - "Notes Feature & Supabase Client"
Cohesion: 0.20
Nodes (15): NoteCard(), Props, EMPTY_FORM, FormState, NoteForm(), Props, NotesList(), useCreateNote() (+7 more)

### Community 14 - "TS Config (App)"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+12 more)

### Community 15 - "Tooling & Changelog"
Cohesion: 0.12
Nodes (20): Plugins de Claude Code instalados (context7, learning-output-style, playwright, supabase, frontend-design), Schema completo de BD (12 tablas), PWA configurada con Workbox (NetworkFirst para Supabase), Sprint 1 — Fundación, Pendiente Sprint 2 (shadcn/ui, Auth, layout, router), Cliente Supabase (src/lib/supabase.ts), Tipos TypeScript generados (src/types/supabase.ts), Supabase MCP conectado al proyecto local-ministry (+12 more)

### Community 16 - "TS Config (Node)"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 17 - "Supabase Generated Types"
Cohesion: 0.18
Nodes (10): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+2 more)

### Community 18 - "Migrations Learning Notes"
Cohesion: 0.29
Nodes (7): apply_migration tool, generate_typescript_types tool, Migración de Base de Datos, Supabase MCP, Row/Insert/Update type variants, Tables<> / TablesInsert<> helpers, src/types/supabase.ts generated types

### Community 19 - "Icon Sprite Set"
Cohesion: 0.29
Nodes (7): Bluesky Icon (symbol#bluesky-icon), Discord Icon (symbol#discord-icon), Documentation Icon (symbol#documentation-icon), GitHub Icon (symbol#github-icon), icons.svg (Sprite Sheet), Social/Contacts Icon (symbol#social-icon), X (Twitter) Icon (symbol#x-icon)

### Community 20 - "Props & Derived State Notes"
Cohesion: 0.33
Nodes (6): Function-as-prop (child-to-parent communication), PeopleList (src/features/people/components/PeopleList.tsx), PeoplePage (src/pages/PeoplePage.tsx), Props (React), Estado derivado (derived state), PeopleList filtered variable

### Community 21 - "Oxlint Config"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 22 - "shadcn Setup Notes"
Cohesion: 0.40
Nodes (5): @base-ui/react (accessibility layer), cn() utility (src/lib/utils.ts), components.json config, class-variance-authority (cva), shadcn/ui (copy-in-source components)

## Ambiguous Edges - Review These
- `TanStack Query` → `@tanstack/router-* compromised packages`  [AMBIGUOUS]
  docs/learning/16-npm-vs-pnpm-seguridad.md · relation: conceptually_related_to

## Knowledge Gaps
- **206 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `$schema` (+201 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `TanStack Query` and `@tanstack/router-* compromised packages`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `shadcn UI Primitives` to `Tasks Feature`, `Leader Tracking Feature`, `Formation Module (Feature)`, `People Feature`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `Diagrama ERD (Mermaid) de 12 tablas` connect `Database & Reporting Domain` to `Architecture & Auth Docs`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `CLAUDE.md — ESLIDER Ministry Manager (contexto de proyecto)` connect `Architecture & Auth Docs` to `Tooling & Changelog`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 31 inferred relationships involving `cn()` (e.g. with `AppLayout()` and `Badge()`) actually correct?**
  _`cn()` has 31 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _213 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Database & Reporting Domain` be split into smaller, more focused modules?**
  _Cohesion score 0.05656565656565657 - nodes in this community are weakly interconnected._