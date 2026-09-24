# UC-04 — Consultar el avance en la ruta

## Resultado

Desde **Reportes → Avance en la Ruta**, el usuario consulta los manuales de la ruta del ciclo activo y el avance de las personas. Puede abrir la vista individual, revisar sus lecciones y registrar su finalización o una nota opcional. La ficha de una persona también enlaza directamente con su avance.

## Condiciones

- Existe una ruta asociada al ciclo en curso. La ruta define los manuales; el ciclo selecciona cuáles cursará.
- Las personas, manuales y lecciones relevantes están registrados en Supabase.
- El usuario ha iniciado sesión.

## Flujo

1. Abrir **Reportes** y elegir **Avance en la Ruta**.
2. Consultar el mapa de manuales y seleccionar una persona.
3. Revisar el progreso por manual y lección. Marcar una lección como completada o registrar una nota y observaciones si corresponde.
4. Volver al mapa o abrir la ficha completa de la persona.

El progreso por lección vive en `person_lesson_progress`. Las notas de lección son opcionales y se distinguen del **Cuaderno de notas**, que registra los resultados del plan de evaluación por manual. **Matrícula** se administra desde Formación; las rutas, los ciclos y el plan de notas se administran desde Configuración.

## Enlaces

- [Arquitectura](../architecture.md)
- [Base de datos](../database.md)
