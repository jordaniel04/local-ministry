# Cliente Supabase — Singleton

## ¿Qué es un singleton?

Un singleton es un objeto que **solo existe una vez** en toda la app. Si intentas crear otro, obtienes el mismo.

## ¿Por qué solo uno?

El cliente Supabase mantiene internamente:
- La sesión del usuario (JWT token)
- La conexión al servidor de realtime
- El estado de autenticación

Si crearas dos clientes, tendrían estados desincronizados — uno podría tener la sesión y el otro no.

## Dónde vive en este proyecto

```
src/lib/supabase.ts  ← único lugar donde se crea
```

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

## ¿Cómo se usa en el resto de la app?

Cualquier archivo que necesite hablar con Supabase importa este cliente:

```ts
// En cualquier hook o componente:
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase
  .from('people')
  .select('*')
```

## Analogía con Angular

En Angular, un `Service` con `providedIn: 'root'` es un singleton — Angular crea una sola instancia y la inyecta donde se necesite. El cliente Supabase cumple el mismo rol: es el "servicio" central de acceso a datos.

```
Angular:  @Injectable({ providedIn: 'root' }) class SupabaseService
React:    export const supabase = createClient(...)  en src/lib/supabase.ts
```

## Regla del proyecto

> **Nunca crear otro `createClient()` fuera de `src/lib/supabase.ts`.**

Si necesitas acceder a Supabase en un nuevo archivo, siempre importa el cliente existente.
