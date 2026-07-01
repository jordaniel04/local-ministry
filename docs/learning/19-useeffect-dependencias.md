# 19 — useEffect con Dependencias: Vigilar Cambios

## Repaso rápido

`useEffect` corre código **después** de que el componente se renderiza. Con el array vacío `[]` corre una sola vez al montar. Pero ¿qué pasa si necesitas que corra cada vez que un valor específico cambie?

---

## El array de dependencias

El segundo argumento de `useEffect` es la "lista de vigilancia":

```tsx
useEffect(() => {
  // código a ejecutar
}, [valor1, valor2])   // ← se ejecuta cuando valor1 O valor2 cambian
```

React compara los valores antes y después de cada render. Si alguno cambió, ejecuta el efecto.

---

## El caso real en este proyecto

En `PersonForm`, el mismo formulario sirve para **crear** y **editar** personas. Cuando se abre en modo edición, necesita cargar los datos de esa persona. Cuando se abre en modo creación, necesita estar vacío.

```tsx
useEffect(() => {
  if (person) {
    // Modo edición: llenar con datos existentes
    setForm({
      first_name: person.first_name,
      last_name: person.last_name,
      phone: person.phone ?? '',
      // ...todos los campos
    })
  } else {
    // Modo creación: limpiar todo
    setForm(EMPTY_FORM)
  }
}, [person, open])   // ← vigila: ¿cambió la persona? ¿se abrió/cerró el modal?
```

**¿Por qué vigilar `open` también?**
Si el usuario edita a Jorge, cierra el modal sin guardar, y luego abre "nueva persona", `person` sigue siendo el mismo objeto. Sin `open` en las dependencias, el formulario seguiría mostrando los datos de Jorge. Con `open`, cada vez que el modal cambia de estado (abre o cierra), el efecto corre y resetea el formulario correctamente.

---

## Qué pasa sin dependencias correctas

```tsx
// Sin dependencias — corre en CADA render (casi nunca se quiere)
useEffect(() => { resetForm() })

// Array vacío — corre UNA VEZ al montar
useEffect(() => { resetForm() }, [])

// Con dependencias — corre cuando person u open cambian ✅
useEffect(() => { resetForm() }, [person, open])
```

---

## Visualización del flujo

```
Usuario abre modal "Nueva persona"
  → open: false → true         (cambió)
  → useEffect se ejecuta
  → person es undefined        (modo creación)
  → setForm(EMPTY_FORM)        ✅ formulario vacío

Usuario cierra y abre "Editar Jorge"
  → open: false → true         (cambió)
  → person: undefined → Jorge  (cambió)
  → useEffect se ejecuta
  → person existe              (modo edición)
  → setForm({ first_name: 'Jorge Daniel', ... })  ✅ datos de Jorge
```

Archivo: [src/features/people/components/PersonForm.tsx](../../src/features/people/components/PersonForm.tsx)
