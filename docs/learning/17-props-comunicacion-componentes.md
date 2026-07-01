# 17 — Props: Cómo los Componentes se Comunican

## ¿Qué son las props?

En React, los componentes son funciones que reciben parámetros. Esos parámetros se llaman **props** (abreviación de "properties").

Igual que una función normal puede recibir argumentos, un componente recibe props para saber qué mostrar y cómo comportarse.

```tsx
// Una función normal
function saludar(nombre: string) {
  return `Hola, ${nombre}`
}

// Un componente React — recibe props igual que argumentos
function Saludo({ nombre }: { nombre: string }) {
  return <p>Hola, {nombre}</p>
}

// Se usa así:
<Saludo nombre="Jorge" />
```

---

## Props como funciones — comunicación hijo → padre

El problema más común: un componente hijo necesita "avisarle" al padre que algo pasó (un botón fue clickeado, un formulario fue enviado).

La solución: el padre le pasa una **función como prop**. El hijo simplemente la llama.

```tsx
// El PADRE controla qué pasa
function PeoplePage() {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <PeopleList onNewPerson={() => setFormOpen(true)} />
  )
}

// El HIJO no sabe qué hace esa función — solo la ejecuta
function PeopleList({ onNewPerson }: { onNewPerson: () => void }) {
  return (
    <button onClick={onNewPerson}>Nueva persona</button>
  )
}
```

`PeopleList` no sabe qué pasa cuando llama `onNewPerson`. Podría abrir un modal, navegar a otra página, o imprimir algo. No le importa — solo la ejecuta. El padre decide.

---

## ¿Por qué así y no de otra forma?

**Opción A (la que usamos):** el padre le pasa la función al hijo.
- El hijo es reutilizable — funciona en cualquier contexto
- El estado vive en un solo lugar (el padre)
- Fácil de seguir el flujo de datos

**Opción B (problemática):** el hijo tiene su propio estado para el modal.
- Duplicación de estado
- Difícil de coordinar con otros componentes
- El padre no sabe cuándo el hijo abrió o cerró el formulario

---

## Tipado de props con TypeScript

```tsx
// Siempre definir un tipo para las props
type Props = {
  onNewPerson: () => void        // función sin argumentos, sin retorno
  title?: string                 // el ? significa opcional
  person: Person                 // requerido, tipo Person
}

function MiComponente({ onNewPerson, title = 'Personas', person }: Props) {
  // ...
}
```

---

## En este proyecto

- `PeoplePage` → pasa `onNewPerson` a `PeopleList`
- `PeoplePage` → pasa `open` y `onClose` a `PersonForm`
- `PersonDetail` → pasa `open`, `onClose` y `person` a `PersonForm`

Archivos: [src/pages/PeoplePage.tsx](../../src/pages/PeoplePage.tsx), [src/features/people/components/PeopleList.tsx](../../src/features/people/components/PeopleList.tsx)
