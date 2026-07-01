# 15 — shadcn/ui: Componentes Copiados al Proyecto

## ¿Qué es shadcn/ui?

shadcn/ui NO es una librería de componentes tradicional. No se instala como paquete npm y no se importa desde `node_modules`. En cambio, **copia el código fuente** de cada componente directamente a tu proyecto.

---

## Analogía con Angular

```
Angular Material                     →   shadcn/ui
────────────────────────────────────────────────────────
npm install @angular/material        →   npx shadcn add button (copia código)
import { MatButtonModule }           →   import { Button } from '@/components/ui/button'
Componentes en node_modules          →   Componentes en src/components/ui/
No puedes modificar internos         →   Puedes modificar TODO
Actualizaciones con npm update       →   Actualizaciones manuales (copiando de nuevo)
```

---

## Por qué existe este enfoque

El modelo tradicional (Angular Material, MUI) tiene un problema: los componentes viven en `node_modules`. Si necesitas cambiar algo, tienes que usar APIs de override complejas o `::ng-deep` en Angular.

shadcn adopta la filosofía opuesta: **tú eres dueño del código**. Si necesitas que el `Button` tenga un comportamiento especial, abres `src/components/ui/button.tsx` y lo cambias directamente. Sin hacks, sin workarounds.

---

## Cómo está configurado en este proyecto

```
src/components/ui/
├── button.tsx      ← código fuente copiado
├── card.tsx        ← código fuente copiado
├── input.tsx       ← código fuente copiado
└── label.tsx       ← código fuente copiado
```

El archivo `components.json` en la raíz del proyecto le dice a shadcn dónde copiar los componentes:

```json
{
  "style": "base-nova",
  "tailwind": { "css": "src/index.css" },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui"
  }
}
```

---

## La pila tecnológica de shadcn

Los componentes de shadcn no hacen todo el trabajo solos. Usan otras librerías por debajo:

```
shadcn/ui (estilo visual + Tailwind)
    ↓
@base-ui/react (accesibilidad: ARIA, keyboard navigation, focus management)
    ↓
Tailwind CSS v4 (clases de estilo)
    ↓
class-variance-authority (variantes: "primary", "destructive", "outline")
```

`@base-ui/react` es como Angular CDK (Component Dev Kit): maneja la parte de accesibilidad invisible — que Tab navegue correctamente, que los screen readers anuncien el botón, que Escape cierre un modal. Los desarrolladores de shadcn usan esta base y agregan el estilo visual encima.

---

## La función `cn()` — combinar clases

```tsx
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Se usa para combinar clases de Tailwind sin conflictos:

```tsx
// Sin cn() — conflicto: ¿cuál color aplica?
<Button className="bg-red-500 bg-blue-500" />

// Con cn() — twMerge resuelve el conflicto correctamente
cn('bg-red-500', condition && 'bg-blue-500')
// → 'bg-blue-500' si condition es true
```

`clsx` maneja condiciones (`condition && 'clase'`, objetos `{ clase: condicion }`). `twMerge` resuelve conflictos entre clases de Tailwind que afectan la misma propiedad CSS.

---

## Cómo agregar un nuevo componente

```bash
npx shadcn add dialog     # copia Dialog a src/components/ui/dialog.tsx
npx shadcn add table      # copia Table a src/components/ui/table.tsx
npx shadcn add select     # copia Select a src/components/ui/select.tsx
```

En este proyecto con SSL corporativo se necesita el prefijo:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 npx shadcn add dialog
```

---

## class-variance-authority (cva) — variantes

Los componentes usan `cva` para definir variantes de estilo:

```tsx
// Ejemplo simplificado de button.tsx
const buttonVariants = cva(
  'inline-flex items-center rounded-md font-medium',  // clases base
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background',
      },
      size: {
        default: 'h-9 px-4',
        sm: 'h-8 px-3',
        lg: 'h-10 px-6',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

// Uso:
<Button variant="destructive" size="sm">Eliminar</Button>
```

Es similar a cómo en Angular Material usas `color="warn"` o `mat-raised-button` — pero implementado con clases de Tailwind puras.

---

## Recursos

- [shadcn/ui docs](https://ui.shadcn.com)
- Componentes en este proyecto: `src/components/ui/`
- Config: `components.json` en la raíz
