# ADR-002 — Supabase en lugar de Firebase

**Fecha:** 2026-06-26
**Estado:** Aceptado

## Contexto
Necesitamos un backend con base de datos, autenticación y API. Las opciones consideradas fueron Supabase (PostgreSQL) y Firebase (Firestore NoSQL).

## Decisión
Usamos **Supabase**.

## Razones
- Los datos son relacionales: personas ↔ ministerios ↔ lecciones ↔ progreso ↔ asistencia. PostgreSQL modela esto con llaves foráneas, JOINs e integridad referencial.
- En Firestore (NoSQL) estas relaciones se modelan con colecciones anidadas o referencias manuales, lo que complica las consultas y los reportes
- Supabase tiene RLS nativo en PostgreSQL — seguridad a nivel de fila sin código adicional
- Las queries SQL para reportes (promedios, alertas) son directas en PostgreSQL; en Firestore requieren múltiples requests o Cloud Functions
- Supabase genera tipos TypeScript automáticamente desde el schema

## Consecuencias
- Se requiere conocimiento básico de SQL para modificar el schema
- Las migraciones son scripts SQL explícitos (ventaja: versionado claro)
- El plan gratuito de Supabase tiene límites de storage y conexiones (suficiente para el MVP)
