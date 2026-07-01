# UC-02 — Registrar Persona

## Descripción
El admin o secretario registra una nueva persona (miembro, creyente o visitante).

## Actores
- Admin, Secretario

## Precondiciones
- Usuario autenticado con rol `admin` o `secretary`

## Flujo principal

```mermaid
sequenceDiagram
  actor U as Admin/Secretary
  participant PF as PersonForm
  participant TQ as TanStack Query
  participant SB as Supabase
  participant DB as people

  U->>PF: Completa formulario (nombre, tipo, teléfono...)
  U->>PF: Clic en "Guardar"
  PF->>TQ: useMutation → insert
  TQ->>SB: supabase.from('people').insert({ full_name, person_type, ... })
  SB->>DB: INSERT INTO people ...
  DB-->>SB: { data: nueva_persona }
  SB-->>TQ: { data: nueva_persona }
  TQ->>TQ: invalidateQueries(['people'])
  TQ-->>PF: onSuccess
  PF-->>U: Redirige a detalle de persona
```

## Flujo alternativo — Validación fallida

```mermaid
sequenceDiagram
  actor U as Admin/Secretary
  participant PF as PersonForm

  U->>PF: Envía formulario sin nombre
  PF-->>U: Muestra error "El nombre es requerido" (validación local)
  Note over PF: No llega a Supabase
```

## Campos del formulario
| Campo | Requerido | Notas |
|---|---|---|
| Nombre completo | ✅ | |
| Tipo | ✅ | miembro / creyente / visitante |
| Teléfono | ❌ | |
| Email | ❌ | |
| Dirección | ❌ | |
| Fecha de nacimiento | ❌ | |
| Notas | ❌ | |

## Postcondiciones
- Nueva fila en `people`
- Lista de personas se actualiza automáticamente (TanStack Query invalida caché)
