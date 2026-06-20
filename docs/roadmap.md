# Roadmap — Tela

Cada etapa es un incremento desplegable. El orden minimiza el riesgo: cimientos → bucle de datos → vistas → pulido. Las tareas concretas de cada etapa están en `tasks.md`.

## MVP — Fase 1 (nube, login y BD, sin tiempo real)

**Etapa 0 · Fundaciones**
Repo (Next.js + TS + Tailwind), proyecto Supabase, Drizzle conectado, esquema inicial (`projects`, `notes`, `edges`) y CI. → Repo limpio, base creada, pipeline en verde.

**Etapa 1 · Auth y proyectos**
Login/registro/logout (Supabase SSR), rutas protegidas, CRUD de proyectos. → Usuario entra, crea proyectos aislados y navega entre ellos.

**Etapa 2 · core y notas**
Portar `core/` (capas, tipos, enlaces, backlinks, markdown) con tests; CRUD de notas; inspector de edición. → Notas persistentes editables.

**Etapa 3 · Vista Embudo**
6 capas con pregunta guía; arrastrar entre capas; añadir en una capa. → Núcleo del producto sobre datos reales.

**Etapa 4 · Vista Tablero**
Columnas por estado; arrastrar para cambiar de estado. → Segunda lente.

**Etapa 5 · Vista Documentos**
Editor + vista previa; `[[ ]]` navegables; backlinks. → Documentación enlazada.

**Etapa 6 · Lienzo y Grafo**
React Flow: nodos y conexiones, pan/zoom, persistir posiciones; grafo con conexiones + wikilinks. → Cinco vistas integradas.

**Etapa 7 · Pulido y lanzamiento**
Importar/Exportar JSON (incluye migración del prototipo), búsqueda, modo Presentar, estados vacíos, despliegue en Vercel. → MVP en producción.

## Fase 2 — Colaboración (post-MVP)

Tiempo real con Yjs + proveedor gestionado (lienzo y documentos), presencia/cursores, compartir con permisos, equipos/organizaciones.

## Fase 3 — Negocio y escala

Facturación (Stripe), observabilidad (Sentry/PostHog), backups probados, endurecimiento de seguridad, adjuntos, plantillas, automatizaciones.
