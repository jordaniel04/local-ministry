# 20 — setState Forma Funcional: Actualizar con Seguridad

## El problema

Cuando actualizas estado en React, el nuevo valor no está disponible inmediatamente — React lo procesa de forma asíncrona (en el siguiente ciclo de render).

Esto puede causar un bug sutil cuando actualizas **varios campos a la vez**:

```tsx
// ❌ Potencialmente problemático
function handleHolySpiritDateChange(date: string) {
  setForm({ ...form, holy_spirit_baptism_date: date })
  setForm({ ...form, holy_spirit_experience: 'baptized' })
  // El segundo setForm usa `form` del render anterior
  // El primer cambio (holy_spirit_baptism_date) se pierde
}
```

---

## La solución: forma funcional

En lugar de pasar el nuevo estado directamente, pasas una **función** que recibe el estado anterior y devuelve el nuevo:

```tsx
// ✅ Correcto
setForm((prev) => ({
  ...prev,                              // copia todo lo anterior
  holy_spirit_baptism_date: date,       // sobrescribe este campo
  holy_spirit_experience: date ? 'baptized' : prev.holy_spirit_experience,
}))
```

React garantiza que `prev` siempre es el estado más reciente, incluso si hay varios updates en cola. Con un solo `setForm` actualizas dos campos de forma segura.

---

## El operador spread `...prev`

```tsx
// prev es el estado completo del formulario:
// { first_name: 'Jorge', last_name: 'Guevara', phone: '987...', ... }

setForm((prev) => ({
  ...prev,                          // copia TODOS los campos existentes
  holy_spirit_baptism_date: date,   // solo sobreescribe este
}))

// Resultado:
// { first_name: 'Jorge', last_name: 'Guevara', phone: '987...', holy_spirit_baptism_date: '2024-01-01', ... }
```

Sin `...prev`, perderías todos los demás campos del formulario. El spread copia todo y tú solo reemplazas lo que necesitas cambiar.

---

## Cuándo usar cada forma

```tsx
// Forma simple — OK para un solo campo cuando no hay updates simultáneos
setSearch(e.target.value)
setFilter('member')

// Forma funcional — cuando el nuevo valor depende del anterior
setForm((prev) => ({ ...prev, campo: nuevoValor }))
setCount((prev) => prev + 1)   // siempre usar funcional para contadores
```

---

## En este proyecto

En [PersonForm.tsx](../../src/features/people/components/PersonForm.tsx) usamos un helper `set` para actualizar campos individuales del formulario de forma simple:

```tsx
function set<K extends keyof FormState>(field: K, value: FormState[K]) {
  setForm((prev) => ({ ...prev, [field]: value }))
}

// Uso:
set('first_name', 'Jorge')
set('person_type', 'member')
```

Y la forma funcional directa para cuando actualizamos dos campos a la vez (fecha + experiencia E.S.).
