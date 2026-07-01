# Conceptos 30 y 31 — Upsert con `onConflict` y PWA standalone en Android

## Concepto 30 — Upsert: insertar o actualizar en una sola operación

### Dónde aparece en el proyecto

`src/features/attendance/hooks/useAttendance.ts` — función `useUpsertAttendance()`

---

### El problema

Cuando tomás asistencia, el usuario puede cambiar de opinión: primero marca "Presente" y después quiere cambiarlo a "Tarde". Hay dos escenarios posibles:

1. **No existe registro** → hay que insertar
2. **Ya existe registro** → hay que actualizar

La solución ingenua sería:

```ts
// Buscar si ya existe
const { data } = await supabase
  .from('attendance')
  .select('id')
  .eq('session_id', sessionId)
  .eq('person_id', personId)
  .single()

// Decidir según el resultado
if (data) {
  await supabase.from('attendance').update({ status }).eq('id', data.id)
} else {
  await supabase.from('attendance').insert({ session_id, person_id, status })
}
```

Dos viajes a la base de datos, más lógica de decisión, más posibilidad de error.

### La solución: `upsert`

```ts
const { error } = await supabase
  .from('attendance')
  .upsert(
    { session_id: sessionId, person_id: personId, status },
    { onConflict: 'session_id,person_id' }
  )
```

`upsert` (combinación de **up**date + in**sert**) hace todo en una sola operación:

- Si no existe un registro con esa combinación `session_id + person_id` → **inserta**
- Si ya existe → **actualiza** con los nuevos valores

### Por qué `onConflict` es necesario

`onConflict` le dice a Supabase qué columnas definen "ya existe". En este caso, la combinación `session_id + person_id` es única — no puede haber dos registros de asistencia para la misma persona en la misma sesión.

Eso está garantizado en la base de datos con una constraint:

```sql
UNIQUE (session_id, person_id)
```

Sin esa constraint en la tabla, el `upsert` no sabe cuándo hay conflicto y simplemente inserta duplicados.

### Diagrama del flujo

```
upsert({ session_id, person_id, status })
        ↓
¿Existe registro con ese session_id + person_id?
        ↓                          ↓
       NO                         SÍ
        ↓                          ↓
    INSERT                      UPDATE status
```

### Resumen

| Enfoque | Viajes a la BD | Lógica manual |
|---|---|---|
| buscar → insertar/actualizar | 2 | Sí |
| `upsert` con `onConflict` | 1 | No |

---

## Concepto 31 — PWA standalone: por qué Android muestra (o no) la barra de direcciones

### Dónde aparece en el proyecto

`vite.config.ts` → manifest + `public/pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`

---

### El problema que tuvimos

Al agregar la app al escritorio del celular, seguía apareciendo la barra de direcciones del navegador — como si fuera un acceso directo normal al sitio, no una app instalada.

### Cómo decide Android si activar standalone

Android Chrome evalúa una checklist antes de activar el modo "app" (sin barra de direcciones):

| Requisito | Estado en el problema |
|---|---|
| `display: 'standalone'` en el manifest | ✅ Ya estaba |
| Ícono PNG 192×192 que exista en `public/` | ❌ **Faltaba** |
| Ícono PNG 512×512 que exista en `public/` | ❌ **Faltaba** |
| HTTPS (o localhost en desarrollo) | ✅ Ya estaba |
| Service Worker registrado | ✅ Ya estaba |

El manifest decía que los íconos existían, pero los archivos PNG no estaban en `public/`. Android intentaba cargarlos, fallaba, y decidía no activar el modo standalone.

### Por qué un SVG no alcanza

El proyecto tenía `favicon.svg` e `icons.svg` pero no PNGs. Android requiere PNGs específicamente — no acepta SVG para la instalación de PWA. Los íconos SVG son para el navegador de escritorio; los PNGs son para el sistema operativo móvil.

### La solución

Generar los tres archivos PNG desde el logo original y ponerlos en `public/`:

```
public/
├── pwa-192x192.png      ← Android usa este para el ícono del escritorio
├── pwa-512x512.png      ← Android usa este para la splash screen
└── apple-touch-icon.png ← iOS usa este (180×180)
```

Y en `vite.config.ts` declarar el propósito de cada ícono:

```ts
icons: [
  { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
]
```

`purpose: 'any maskable'` en el 512×512 le dice a Android que puede recortar el ícono para ajustarlo a la forma de su pantalla (círculo, cuadrado redondeado, etc.).

### Diagrama del proceso de instalación

```
Usuario abre la app en Chrome móvil
        ↓
Chrome verifica checklist de PWA
        ↓
¿Todos los requisitos OK?
        ↓                    ↓
       SÍ                    NO
        ↓                    ↓
Muestra banner          Modo standalone
"Instalar app"          no disponible —
        ↓               barra de
Al abrir: sin           direcciones visible
barra de direcciones
```

---

## Resumen

| Concepto | Dónde | Para qué |
|---|---|---|
| `upsert` con `onConflict` | `useAttendance.ts` | Insertar o actualizar en una sola operación sin lógica condicional |
| PNGs en `public/` | `vite.config.ts` + `public/` | Satisfacer los requisitos de Android para activar modo standalone (sin barra de direcciones) |
