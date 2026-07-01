# Tooling — MCPs, Plugins y Skills para ESLIDER

Referencia de todo lo que hay que instalar en Claude Code para trabajar este proyecto.

## Estado de instalación

| Herramienta | Tipo | Estado | Cómo instalar |
|---|---|---|---|
| `context7` | Plugin oficial | ✅ Instalado y activo | Manage Plugins → Marketplace |
| `learning-output-style` | Plugin oficial | ✅ Instalado y activo | Manage Plugins → Marketplace |
| `playwright` | Plugin oficial | ✅ Instalado y activo | Manage Plugins → Marketplace |
| `supabase` | Plugin oficial | ✅ Instalado (activo tras reinicio) | Manage Plugins → Marketplace |
| `github` | Plugin oficial | ⚠️ Instalado, falta autenticación | Manage Plugins → Marketplace |
| `frontend-design` | Plugin oficial | ⬜ Pendiente | Manage Plugins → Marketplace |
| `autoskills` | CLI one-shot | ⬜ Pendiente | `npx autoskills` en la raíz |

> Nota: `/install-plugin` no es un comando válido. Los plugins se instalan desde la UI de Claude Code → Manage Plugins → Marketplaces.

## Detalle de cada herramienta

### Plugins activos

**`context7`**
- Para qué: trae documentación actualizada de supabase-js, TanStack Query, React Router, vite-plugin-pwa, shadcn/ui antes de escribir código
- Cómo funciona: Claude lo usa automáticamente. También se puede forzar escribiendo `use context7` en el prompt

**`learning-output-style`**
- Para qué: modo aprendizaje — Claude explica cada decisión con bloques ★ Insight y a veces pide que el developer escriba código clave

**`playwright`**
- Para qué: probar la app en Chrome, verificar flujos (login, CRUD), detectar bugs visuales en la PWA

**`supabase`**
- Para qué: ejecutar SQL en Supabase, ver tablas, gestionar auth y migraciones desde Claude
- Nota: requiere autenticación con tu cuenta Supabase tras el reinicio

**`github`**
- Para qué: gestionar el repo, ver issues y PRs desde Claude
- Pendiente: autenticarse con la cuenta de GitHub (punto rojo en el plugin)

### Plugins pendientes

**`frontend-design`**
- Para qué: genera UI de calidad alta, evita el aspecto genérico — útil para el layout del sidebar y tablas
- Instalar: Manage Plugins → Marketplaces → buscar frontend-design

### CLI one-shot

**`autoskills`**
- Para qué: detecta el stack del proyecto y descarga skills curadas automáticamente
- Cubre: react-best-practices, vite, supabase-postgres-best-practices, tailwind-css-patterns, shadcn, typescript-advanced-types
- Correr UNA sola vez: `npx autoskills` en la raíz del proyecto (`C:\Info\JD\Proyectos\eslider-ministry`)

## Skills activas (cargadas automáticamente)

Las siguientes skills ya están disponibles desde `autoskills` u otras fuentes:

| Skill | Para qué |
|---|---|
| `react-best-practices` | Patrones React/Next.js de Vercel Engineering |
| `supabase-postgres-best-practices` | Optimización de queries y schema en Postgres |
| `tailwind-css-patterns` | Patrones de layout y utilidades Tailwind |
| `typescript-advanced-types` | Tipos genéricos, condicionales, mapped types |
| `vite` | Configuración de Vite y plugins |
| `frontend-design` | UI de calidad alta con shadcn/Tailwind |
| `supabase` (plugin skill) | Patrones de Auth, RLS, queries con supabase-js |
