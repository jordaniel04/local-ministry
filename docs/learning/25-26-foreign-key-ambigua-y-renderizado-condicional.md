# Conceptos 25 y 26 — Foreign key ambigua en Supabase y renderizado condicional con `&&`

## Dónde aparece en el proyecto

- Concepto 25: `src/features/tasks/hooks/useTasks.ts` — función `useTasks()`
- Concepto 26: `src/features/tasks/components/TaskForm.tsx` — campo "Persona a visitar"

---

## Concepto 25 — Foreign key ambigua y el operador `!` en Supabase

### El problema

La tabla `tasks` tiene dos columnas que apuntan a la misma tabla `people`:

- `assigned_to` → la persona que ejecuta la tarea (el líder)
- `related_person_id` → la persona a visitar (opcional)

Cuando querés traer los datos de ambas en una sola consulta y escribís esto:

```ts
.select('*, people(first_name, last_name)')
```

Supabase no sabe cuál de las dos relaciones seguir. Devuelve un error de ambigüedad porque hay dos caminos posibles hacia `people`.

### La solución: alias + `!nombre_constraint`

```ts
.select(`
  *,
  assigned_person:people!tasks_assigned_to_fkey (first_name, last_name),
  related_person:people!tasks_related_person_id_fkey (first_name, last_name)
`)
```

Hay dos partes:

**1. El alias (`assigned_person:`)**

Renombrás el resultado en la respuesta. Sin alias, ambas relaciones se llamarían `people` y se pisarían. Con alias, el resultado llega como:

```json
{
  "assigned_person": { "first_name": "María", "last_name": "González" },
  "related_person": { "first_name": "Juan", "last_name": "Pérez" }
}
```

**2. El `!nombre_constraint`**

Le decís a Supabase exactamente qué foreign key usar. El nombre del constraint es el que definiste en el schema de la base de datos (visible en el plan del proyecto).

| Sin `!` | Con `!` |
|---|---|
| Supabase elige (o falla) | Vos elegís con precisión |
| Error si hay ambigüedad | Funciona siempre |

### Dónde ver los nombres de constraints

En el plan del schema (`docs/`) o en el panel de Supabase → Table Editor → Foreign Keys. El nombre sigue el patrón `tabla_columna_fkey`.

---

## Concepto 26 — Renderizado condicional con `&&`

### Qué es

En React, el JSX que va dentro de `{}` es código JavaScript normal. Eso significa que podés usar operadores lógicos para decidir si un elemento aparece o no.

### Cómo funciona `&&`

El operador `&&` en JavaScript evalúa de izquierda a derecha:
- Si la parte izquierda es `false`, devuelve `false` y para ahí
- Si la parte izquierda es `true`, devuelve lo que esté a la derecha

React ignora `false` cuando está dentro de JSX — simplemente no renderiza nada.

```tsx
{form.task_type === 'visit' && (
  <div className="space-y-1.5">
    <Label>Persona a visitar</Label>
    <Select ...>...</Select>
  </div>
)}
```

| Valor de `form.task_type` | Resultado de la expresión | Lo que React muestra |
|---|---|---|
| `'visit'` | `true && <div>...</div>` → el `<div>` | El campo aparece |
| `'administrative'` | `false && <div>...</div>` → `false` | No muestra nada |
| `'other'` | `false && <div>...</div>` → `false` | No muestra nada |

### Por qué aparece/desaparece en tiempo real

Cuando cambiás el selector de tipo de tarea, `setForm(...)` actualiza el estado. React detecta que `form.task_type` cambió y redibuja el componente. En ese redibujo, la expresión `form.task_type === 'visit'` se evalúa de nuevo — si ahora es `true`, el campo aparece; si es `false`, desaparece.

Todo esto pasa sin recargar la página, sin CSS de visibilidad, sin variables extra. Solo el estado cambia y React se encarga del resto.

### Alternativa: el operador ternario

Para casos donde querés mostrar una cosa u otra (no solo mostrar/ocultar):

```tsx
{form.task_type === 'visit'
  ? <p>Es una visita</p>
  : <p>No es una visita</p>
}
```

`&&` es para mostrar/ocultar. El ternario (`? :`) es para elegir entre dos opciones.

---

## Resumen

| Concepto | Dónde | Para qué |
|---|---|---|
| Alias en select (`nombre:tabla`) | `useTasks.ts` línea 11 | Renombrar el resultado de un JOIN |
| `!nombre_constraint` | `useTasks.ts` línea 11 | Resolver ambigüedad cuando hay dos FK al mismo target |
| `&&` condicional | `TaskForm.tsx` | Mostrar/ocultar elementos según el estado |
| Ternario `? :` | — | Elegir entre dos elementos según una condición |
