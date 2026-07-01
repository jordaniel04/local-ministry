# 16 — npm vs pnpm: Seguridad en Cadena de Suministro

## El problema: lifecycle scripts

Cuando haces `npm install`, el gestor de paquetes no solo descarga código — también **ejecuta código** de cada paquete que tenga scripts `preinstall`, `install` o `postinstall`. Esto incluye dependencias de dependencias que nunca revisaste.

```
npm install @tanstack/router
  → descarga el paquete
  → ejecuta su postinstall script  ← aquí entra el malware
  → el script roba tokens de GitHub, AWS, SSH
```

Solo el **2% de los paquetes npm** realmente necesitan estos scripts para funcionar. El 98% restante los usa por conveniencia — pero npm los ejecuta todos sin preguntarte.

---

## El ataque "Mini Shai-Hulud" (Mayo 2026)

Este fue el incidente que motivó esta documentación. El grupo **TeamPCP** comprometió 42 paquetes `@tanstack/router-*` publicando 84 versiones maliciosas en solo **6 minutos**.

No robaron contraseñas. En cambio:
1. Abrieron un PR falso al repo de TanStack
2. Envenenaron el caché de GitHub Actions durante ese PR
3. Cuando un mantenedor legítimo hizo merge después, el código del atacante ya estaba en el runner
4. Desde ahí extrajeron el token OIDC de publicación
5. Publicaron versiones maliciosas usando la **identidad legítima** de TanStack

El malware usó un hook `binding.gyp` — un archivo de compilación C++ que npm ejecuta automáticamente, **sin que ningún `ignore-scripts` lo bloquee**.

### ¿Afectó a este proyecto?

No. Solo los paquetes de `@tanstack/router-*` fueron comprometidos. `@tanstack/react-query` (que usamos) no fue afectado.

---

## La diferencia filosófica: npm vs pnpm

| | npm | pnpm v10+ |
|---|---|---|
| Scripts de dependencias | Ejecuta todo por defecto | **Bloquea todo por defecto** |
| Control | Toggle todo-o-nada (`--ignore-scripts`) | Allowlist explícita por paquete (`allowBuilds`) |
| En CI | Sin protección especial | Detecta `CI=true` y bloquea scripts automáticamente |
| Hook `binding.gyp` | **No protege** | Bloquea también |
| Caché compartido | Carpeta por proyecto | Caché global (más rápido, menos espacio) |

pnpm v10 (enero 2025) fue el primer gestor de paquetes en bloquear lifecycle scripts **por defecto**. Si un paquete no está en tu allowlist explícita, sus scripts simplemente no corren — aunque sea malicioso.

---

## Cómo migrar de npm a pnpm

### Paso 1 — Instalar pnpm globalmente

```bash
npm install -g pnpm
```

### Paso 2 — En el proyecto, borrar artefactos de npm

```bash
rm package-lock.json
rm -rf node_modules
```

### Paso 3 — Instalar con pnpm

```bash
pnpm install
```

Esto genera `pnpm-lock.yaml` en lugar de `package-lock.json`. Todos los comandos son equivalentes:

```bash
npm install          →   pnpm install
npm install react    →   pnpm add react
npm run dev          →   pnpm dev  (o pnpm run dev)
npm run build        →   pnpm build
```

### Paso 4 — Configurar allowBuilds para paquetes que sí necesitan compilar

Algunos paquetes legítimos necesitan scripts de build (típicamente paquetes nativos como `sharp`, `better-sqlite3`, o herramientas que compilan código C). Se declaran explícitamente en `package.json`:

```json
{
  "pnpm": {
    "allowBuilds": ["@vite/rollup-linux-x64-gnu", "esbuild"]
  }
}
```

---

## ¿Deberías migrar ahora?

Para este proyecto (ESLIDER Ministry Manager): sí, es el momento ideal. El proyecto es nuevo, no hay scripts de CI que adaptar, y la migración toma menos de 2 minutos.

En proyectos grandes ya establecidos, la migración requiere más coordinación (actualizar CI/CD, lockfile nuevo, revisar scripts de package.json).

---

## Recursos

- [pnpm: Mitigating supply chain attacks](https://pnpm.io/supply-chain-security)
- [GitHub Security Advisory del ataque TanStack](https://github.com/TanStack/router/security/advisories/GHSA-g7cv-rxg3-hmpx)
- [TanStack postmortem oficial](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem)
- Ver también: este proyecto migró de npm a pnpm en el Sprint 1 (ver CHANGELOG.md)
