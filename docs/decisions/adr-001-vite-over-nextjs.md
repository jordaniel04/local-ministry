# ADR-001 — Vite + React SPA en lugar de Next.js

**Fecha:** 2026-06-26
**Estado:** Aceptado

## Contexto
Necesitamos un framework para construir la app. Las dos opciones principales son Vite + React (SPA) y Next.js (SSR/SSG).

## Decisión
Usamos **Vite + React** como SPA pura.

## Razones
- La app es de uso interno — no necesita SEO ni indexación por buscadores
- Next.js agrega complejidad (Server Components, routing de archivos, deploy con Node.js) que no aporta valor aquí
- Vite es significativamente más rápido en desarrollo (HMR instantáneo)
- Un host de archivos estáticos es suficiente para el deploy (Vercel, Netlify, Cloudflare Pages)

## Consecuencias
- El deploy es más simple: solo archivos estáticos
- Sin server-side rendering — el primer load puede ser ligeramente más lento (mitigado con la PWA)
- Si en el futuro se necesita SEO, habría que migrar
