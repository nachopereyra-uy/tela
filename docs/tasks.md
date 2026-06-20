# Tareas — Tela

Lista de trabajo para agentes. Reglas: una tarea a la vez, en orden; implementar **solo** su alcance; correr `typecheck` y `test`; verificar el "Hecho cuando"; marcar la casilla y commitear.

Leyenda: `- [ ]` pendiente · `- [x]` hecha.

## Etapa 0 · Fundaciones

- [x] **T0.1 — Inicializar proyecto.** Next.js (App Router) + TypeScript + ESLint + Tailwind, con scripts `dev/build/lint/typecheck/test`. *Hecho cuando:* `npm run dev` levanta la app.
- [x] **T0.2 — Variables de entorno.** `.env.example` con claves de Supabase (URL, anon key, service role, database URL) documentadas en el README. *Hecho cuando:* existe `.env.example` y está documentado.
- [x] **T0.3 — Clientes de Supabase.** Clientes de servidor y navegador con `@supabase/ssr`. *Hecho cuando:* se lee la sesión en un componente de servidor sin error.
- [x] **T0.4 — Configurar Drizzle.** Drizzle + driver Postgres + `drizzle.config` hacia Supabase. *Hecho cuando:* `drizzle-kit` conecta y genera migraciones.
- [x] **T0.5 — Esquema inicial.** Tablas `projects`, `notes`, `edges` según `data-model.md` + primera migración. *Hecho cuando:* la migración corre en Supabase y las tablas existen.
- [x] **T0.6 — CI básica.** GitHub Actions: install + typecheck + lint + test. *Hecho cuando:* el workflow pasa en verde.

## Etapa 1 · Auth y proyectos

- [x] **T1.1 — Login y registro.** Formularios email + contraseña con Supabase Auth. *Hecho cuando:* un usuario puede registrarse e iniciar sesión.
- [x] **T1.2 — Cerrar sesión.** Logout que limpia sesión y redirige a `/login`. *Hecho cuando:* se pierde el acceso a rutas protegidas.
- [x] **T1.3 — Middleware de sesión.** Refrescar sesión y proteger rutas privadas. *Hecho cuando:* entrar a `/projects` sin sesión redirige a login.
- [x] **T1.4 — Datos de proyectos.** `listProjects`, `createProject`, `renameProject`, `deleteProject` filtrando por `owner_id`. *Hecho cuando:* solo se devuelven proyectos del usuario actual.
- [x] **T1.5 — Pantalla de proyectos.** `/projects` con lista y diálogo de creación; el proyecto nace vacío. *Hecho cuando:* crear un proyecto lo muestra y lleva a `/projects/[id]`.
- [x] **T1.6 — Renombrar y eliminar.** Acciones con diálogo de confirmación propio. *Hecho cuando:* persisten.

## Etapa 2 · core y notas

- [x] **T2.1 — `core/layers` y `core/types`.** 6 capas con preguntas y tipos `Note`/`Edge`/`Project`/estados. *Hecho cuando:* compila en estricto.
- [x] **T2.2 — `core/notes` con tests.** `outgoingLinks`, `findByTitle`, `backlinks`, `wikilinkEdges` + Vitest. *Hecho cuando:* tests en verde.
- [x] **T2.3 — `core/markdown` con tests.** `markdownToHtml` (títulos, negrita, listas, código, `[[ ]]`, escape) + tests, incluido el de no-inyección. *Hecho cuando:* tests en verde.
- [x] **T2.4 — Datos de notas.** `listNotes`, `createNote`, `updateNote`, `deleteNote` (borra sus edges), validando propiedad. *Hecho cuando:* CRUD respeta autorización.
- [x] **T2.5 — Inspector de nota.** Editar título, capa, estado, contenido y etiquetas; eliminar con confirmación. *Hecho cuando:* editar persiste y se refleja.

## Etapa 3 · Embudo

- [x] **T3.1 — Render del embudo.** 6 capas con número, nombre, pregunta y sus notas. *Hecho cuando:* se ven las 6 capas con las notas correctas.
- [ ] **T3.2 — Mover entre capas.** Arrastrar cambia `layer` y persiste. *Hecho cuando:* sobrevive a recarga.
- [ ] **T3.3 — Añadir en una capa.** Botón por capa que crea nota asignada. *Hecho cuando:* aparece en esa capa.

## Etapa 4 · Tablero

- [ ] **T4.1 — Render del tablero.** Columnas por estado con sus notas. *Hecho cuando:* se agrupan por estado.
- [ ] **T4.2 — Mover entre columnas.** Arrastrar cambia `status` y persiste. *Hecho cuando:* sobrevive a recarga.

## Etapa 5 · Documentos

- [ ] **T5.1 — Editor + vista previa.** Contenido con preview usando `markdownToHtml`. *Hecho cuando:* lo escrito se previsualiza con formato.
- [ ] **T5.2 — Wikilinks navegables.** `[[Título]]` abre la nota; si no existe, ofrece crearla. *Hecho cuando:* el clic abre o crea.
- [ ] **T5.3 — Backlinks.** Enlaces salientes y backlinks calculados con `core/`. *Hecho cuando:* reflejan los enlaces reales.

## Etapa 6 · Lienzo y grafo

- [ ] **T6.1 — Lienzo (React Flow).** Nodos posicionables, pan y zoom. *Hecho cuando:* la posición persiste.
- [ ] **T6.2 — Conexiones.** Crear y borrar; persistir en `edges`. *Hecho cuando:* sobreviven a recarga.
- [ ] **T6.3 — Grafo.** Nodos + aristas (conexiones y wikilinks); clic lleva al documento. *Hecho cuando:* se ven ambos tipos y navega.

## Etapa 7 · Pulido

- [ ] **T7.1 — Exportar JSON.** Descargar el proyecto activo. *Hecho cuando:* el archivo contiene notas y conexiones.
- [ ] **T7.2 — Importar JSON.** Subir un JSON (incluye formato del prototipo) como proyecto nuevo. *Hecho cuando:* un export del prototipo se importa sin pérdida.
- [ ] **T7.3 — Búsqueda y modo Presentar.** Búsqueda por título/etiqueta y toggle que oculta el cromo. *Hecho cuando:* funcionan en todas las vistas.
- [ ] **T7.4 — Despliegue en Vercel.** Conectar repo, variables y desplegar. *Hecho cuando:* la app está en una URL pública con Supabase.
