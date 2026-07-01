# CLAUDE.md — ESLIDER Ministry Manager

Documento de contexto y reglas para Claude Code. Leer antes de escribir cualquier código.

## Qué es este proyecto

App web PWA para gestionar el Ministerio de Formación de ESLIDER. Permite registrar miembros, asignar tareas a líderes, hacer seguimiento de reuniones 1:1 y registrar notas de exposiciones.

**Usuarios:** Admin (Jorge), Secretario, Pastor (solo lectura). Líderes con acceso propio en fases futuras.

## Stack

- **Framework:** React 18 + TypeScript (Vite)
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Routing:** React Router v6
- **Server state:** TanStack Query v5
- **Global state:** Zustand (solo cuando TanStack Query no alcance)
- **UI:** Tailwind CSS v4 + shadcn/ui
- **PWA:** vite-plugin-pwa (Workbox)

## Estructura de carpetas

```
src/
├── features/          # Un módulo por feature de negocio
│   ├── people/        # M1 — Miembros y visitantes
│   ├── ministries/    # M2 — Ministerios y líderes
│   ├── tasks/         # M3 — Delegación de tareas/visitas
│   ├── notes/         # M4 — Notas de exposiciones
│   └── leader-tracking/ # M5 — Seguimiento 1:1
├── components/ui/     # Componentes shadcn/ui
├── components/        # Componentes compartidos reutilizables
├── hooks/             # Custom hooks globales
├── lib/               # supabase.ts, utils, helpers
├── pages/             # Páginas (conectan features con el router)
├── router/            # Definición de rutas
├── store/             # Zustand stores
└── types/             # Tipos TypeScript globales y tipos de Supabase
```

Cada feature sigue esta estructura interna:
```
features/people/
├── components/        # Componentes específicos de esta feature
├── hooks/             # Custom hooks (useQuery, useMutation para esta feature)
├── types.ts           # Tipos locales de la feature
└── index.ts           # Re-exports públicos
```

## Reglas de código

### TypeScript
- Siempre tipar explícitamente — nunca usar `any`
- Usar los tipos generados por Supabase en `src/types/supabase.ts`
- Preferir `type` sobre `interface` para tipos de datos; `interface` para contratos extensibles

### Componentes React
- Solo functional components — nunca class components
- Un componente por archivo
- Nombre del archivo = nombre del componente (PascalCase): `PeopleList.tsx`
- Props siempre tipadas con `type Props = { ... }`

### Imports
- Usar alias `@/` para imports absolutos: `import { supabase } from '@/lib/supabase'`
- Nunca usar rutas relativas que suban más de un nivel (`../../`)

### Fetching de datos
- Todo fetch a Supabase va dentro de un `useQuery` o `useMutation` de TanStack Query
- Nunca usar `useEffect` + `useState` para hacer fetch — para eso existe TanStack Query
- Las query keys siguen el patrón: `['people']`, `['people', id]`, `['tasks', { leaderId }]`

### Estilos
- Solo Tailwind CSS — sin CSS modules ni styled-components
- Clases de Tailwind directamente en JSX
- Para componentes complejos usar `cn()` de `@/lib/utils` para combinar clases

### Supabase
- El cliente Supabase vive en `@/lib/supabase.ts` — nunca crear otro
- Siempre manejar errores de Supabase: `const { data, error } = await supabase...`
- RLS habilitado en todas las tablas — nunca bypassear con service_role en el cliente

## Glosario del dominio

- **Miembro / Creyente:** Persona que pertenece formalmente a la iglesia
- **Visitante:** Persona que asiste pero aún no es miembro
- **Líder:** Miembro que dirige uno o más ministerios
- **Ministerio:** Área de servicio dentro de la iglesia (hay ~15)
- **Consolidado:** Primera clase/visita formal a un nuevo creyente
- **Discipulado 1/2/3:** Niveles de formación espiritual progresiva
- **Acompañamiento:** Visita de apoyo sin agenda de enseñanza
- **Sesión 1:1:** Reunión personal entre el admin y un líder para seguimiento

## Cómo explicar el código (modo aprendizaje)

El desarrollador es nuevo en React pero quiere aprender como un senior. Al implementar cualquier cosa:

1. **Explica qué concepto de React estás usando** cuando aparezca por primera vez (ej: "useState es como una variable que, cuando cambia, hace que el componente se redibuje")
2. **Menciona primero las alternativas disponibles y pregúntame antes de decidir**. Cada alternativa debe incluir una pequeña explicación de qué se trata para poder entenderla. Una vez que yo decida, amplía la información y el desarrollo sobre la alternativa escogida.
3. Tiene algo de experiencia con Angular — si hay analogía útil, úsala (ej: "esto es similar a un Service en Angular")
4. No asumir conocimiento previo de React

## Consultas de documentación

Antes de escribir código que use estas librerías, consultar Context7 para tener la API actualizada:
- `supabase-js`
- `@tanstack/react-query`
- `react-router-dom`
- `vite-plugin-pwa`
- `shadcn/ui`
- `zustand`

## Roadmap

Ver estado actual del proyecto en `docs/roadmap.md`.
Al terminar una feature, actualizar el roadmap marcándola como completada.
