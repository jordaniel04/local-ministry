# Concepto 27 — Función que devuelve función (currying básico)

## Dónde aparece en el proyecto

`src/features/notes/components/NoteForm.tsx` — función `set()`, línea 57

---

## El problema que resuelve

El formulario de notas tiene 6 campos de texto. Sin ningún patrón especial, cada campo necesitaría su propio handler:

```tsx
<Input onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
<Input onChange={(e) => setForm((prev) => ({ ...prev, speaker: e.target.value }))} />
<Textarea onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} />
// ... 3 más iguales
```

Es código idéntico repetido 6 veces, solo cambia el nombre del campo.

---

## La solución: función que devuelve función

```ts
function set(field: keyof FormState) {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
}
```

`set` recibe el nombre del campo y **devuelve el handler** listo para usar:

```tsx
<Input onChange={set('title')} />
<Input onChange={set('speaker')} />
<Textarea onChange={set('content')} />
```

Cuando React llama al `onChange`, está llamando a la función que `set('title')` devolvió.

### Cómo se ejecuta paso a paso

1. React renderiza `<Input onChange={set('title')} />`
2. `set('title')` se ejecuta y devuelve una función — esa función queda guardada como el handler
3. Cuando el usuario escribe, React llama al handler con el evento `e`
4. El handler llama a `setForm` actualizando solo el campo `title`

---

## El detalle de `[field]`

```ts
{ ...prev, [field]: e.target.value }
```

Las llaves `[]` alrededor de `field` son **computed property names** (nombres de propiedad computados). Significan "usa el valor de esta variable como nombre de clave".

| Código | Resultado si `field = 'title'` |
|---|---|
| `{ field: 'hola' }` | `{ field: 'hola' }` — clave literal "field" |
| `{ [field]: 'hola' }` | `{ title: 'hola' }` — clave dinámica |

Sin los corchetes, todos los campos se guardarían bajo la clave `"field"` — incorrecto.

---

## `keyof FormState` — seguridad de tipos

```ts
function set(field: keyof FormState) { ... }
```

`keyof FormState` es un tipo que representa **todos los nombres de campo válidos** de `FormState`:

```ts
// Equivale a:
type CamposValidos = 'title' | 'speaker' | 'exposition_date' | 'content' | 'highlights' | 'improvements'
```

Si intentás usar `set('apellido')`, TypeScript te avisa en rojo antes de que corras el código:

```
Argument of type '"apellido"' is not assignable to parameter of type 'keyof FormState'
```

Esto es una de las ventajas de TypeScript: los errores aparecen mientras escribís, no cuando el usuario usa la app.

---

## Resumen

| Concepto | Para qué |
|---|---|
| Función que devuelve función | Evitar repetir el mismo handler N veces |
| `[variable]` en objeto | Usar una variable como nombre de clave dinámica |
| `keyof Tipo` | Restringir un parámetro a los campos que existen en un tipo |
