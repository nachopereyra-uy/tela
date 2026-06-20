# Plan de implementación — Tela MVP
> Guía de ejecución para Codex (o cualquier agente de código). Leer AGENTS.md y docs/tasks.md como fuente de verdad complementaria.

## Contexto

Tela es un espacio de trabajo visual para documentar y operar negocios sobre un embudo de 6 capas. Una nota es la entidad central y se ve simultáneamente en 5 vistas (Embudo, Tablero, Documentos, Lienzo, Grafo). El proyecto está en fase de especificación pura: existe documentación completa pero **cero código**.

**Decisiones técnicas ya tomadas:**
- Formato del contenido de las notas: **Markdown** (con `[[wikilinks]]`), no TipTap JSON.
- Etiquetas: `text[]` array en Postgres.
- Autorización: `owner_id` único (sin equipos en MVP).
- Posiciones del lienzo: guardadas en la nota (`x`, `y` en BD).
- Estado UI: un único store/Context por proyecto para las 5 vistas.

---

## PASO 0 — Prerequisitos (manuales, antes de escribir código)

1. **Crear proyecto en Supabase** en supabase.com:
   - Anotar: `Project URL`, `anon key`, `service_role key`, `DATABASE_URL` (connection string directo, no pooler, para Drizzle).
2. **Crear repositorio en GitHub** para conectar CI (T0.6) y despliegue en Vercel (T7.4).
3. Tener Node.js ≥ 20 y npm instalados.

---

## Etapa 0 · Fundaciones

### T0.1 — Inicializar proyecto Next.js

```bash
npx create-next-app@latest . \
  --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --no-git
```

Añadir al `package.json` los scripts que faltan:
```json
"typecheck": "tsc --noEmit",
"test": "vitest run",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate"
```

Instalar dependencias adicionales:
```bash
npm install vitest @vitejs/plugin-react
npm install drizzle-orm drizzle-kit pg @types/pg
npm install @supabase/supabase-js @supabase/ssr
npm install zod
npm install @xyflow/react
npm install @dnd-kit/core @dnd-kit/sortable
```

Crear `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
export default defineConfig({ test: { environment: 'node' } })
```

**Hecho cuando:** `npm run dev` levanta la app en localhost:3000.

---

### T0.2 — Variables de entorno

Crear `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres
```

Añadir `.env.local` a `.gitignore` (ya debería estar; verificar).

**Hecho cuando:** `.env.example` existe y README lo documenta.

---

### T0.3 — Clientes de Supabase

`src/lib/supabase/server.ts` — cliente para Server Components y Server Actions (usa cookies):
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}
```

`src/lib/supabase/client.ts` — cliente para Client Components:
```ts
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
```

**Hecho cuando:** leer `(await createClient()).auth.getUser()` en un Server Component no da error.

---

### T0.4 — Configurar Drizzle

`drizzle.config.ts`:
```ts
import { defineConfig } from 'drizzle-kit'
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
})
```

**Hecho cuando:** `npx drizzle-kit generate` no da error de configuración.

---

### T0.5 — Esquema inicial y migración

`src/db/schema.ts`:
```ts
import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  owner_id: uuid('owner_id').notNull(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#6366f1'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  archived_at: timestamp('archived_at', { withTimezone: true }),
}, (t) => [index('projects_owner_idx').on(t.owner_id)])

export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  project_id: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Sin título'),
  content: text('content').notNull().default(''),
  status: text('status').notNull().default('none'), // todo | doing | done | idea | none
  layer: text('layer').notNull().default('none'),   // marketing | ventas | cierre | onboarding | entrega | posventa | none
  x: integer('x').notNull().default(0),
  y: integer('y').notNull().default(0),
  tags: text('tags').array().notNull().default([]),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [index('notes_project_idx').on(t.project_id)])

export const edges = pgTable('edges', {
  id: uuid('id').primaryKey().defaultRandom(),
  project_id: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  from_note_id: uuid('from_note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  to_note_id: uuid('to_note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  label: text('label'),
})
```

```bash
npm run db:generate
npm run db:migrate
```

**Hecho cuando:** las 3 tablas existen en Supabase.

---

### T0.6 — CI básica

`.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
```

**Hecho cuando:** el workflow pasa en verde.

---

## Etapa 1 · Auth y proyectos

### Estructura de rutas
```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
└── projects/
    ├── page.tsx
    └── [id]/
        └── layout.tsx
```

### T1.1 — Login y registro
Formularios con `<form>` + Server Action → `supabase.auth.signInWithPassword()` / `signUp()`. Redirigir a `/projects` en éxito; error inline (sin `alert()`).

### T1.2 — Logout
`src/server/auth.ts` → `signOut()` que llama a `supabase.auth.signOut()` y redirige a `/login`.

### T1.3 — Middleware
`middleware.ts` en la raíz: verificar sesión con `supabase.auth.getUser()`; redirigir a `/login` si no hay sesión y la ruta empieza por `/projects`.

### T1.4 — Funciones de servidor para proyectos
`src/server/projects.ts` — filtrar siempre por `owner_id`:
- `listProjects(userId)`
- `createProject(userId, name, color)` — validar con Zod
- `renameProject(userId, projectId, newName)`
- `deleteProject(userId, projectId)`

### T1.5 — Pantalla `/projects`
Server Component con lista + `CreateProjectDialog` (Client Component con `<dialog>` nativo, sin `prompt()`).

### T1.6 — Renombrar y eliminar
Menú desplegable en cada proyecto; diálogos de confirmación propios.

**Hecho cuando:** usuario puede registrarse, login, crear proyectos y navegar a `/projects/[id]`.

---

## Etapa 2 · core/ y notas

> **Regla crítica:** `src/core/` es puro — sin imports de Next.js, React, Supabase ni Drizzle. Testeable en aislamiento.

### T2.1 — Tipos y capas
`src/core/types.ts`: tipos `Note`, `Edge`, `Project`, `Layer`, `Status`.
`src/core/layers.ts`: constante `LAYERS` con las 6 capas, número y pregunta guía.

### T2.2 — Funciones de notas (con tests)
`src/core/notes.ts`:
- `outgoingLinks(note): string[]` — extrae títulos de `[[Título]]`
- `findByTitle(notes, title): Note | undefined`
- `backlinks(notes, target): Note[]`
- `wikilinkEdges(notes): Array<{from, to}>`

`src/core/notes.test.ts` — cubrir casos normales, wikilinks con espacios, sin wikilinks.

### T2.3 — markdownToHtml (con tests)
`src/core/markdown.ts`:
- `# → <h1>`, `## → <h2>`, ..., `#### → <h4>`
- `**bold** → <strong>`, `*italic* → <em>`
- `- item → <ul><li>`
- `` `code` → <code> ``, bloque ` ``` → <pre><code>`
- `[[Título]] → <a data-wikilink="Título">Título</a>`
- Escapar `<`, `>`, `&` en texto para prevenir XSS

`src/core/markdown.test.ts` — incluir test de no-inyección: `<script>alert(1)</script>` debe aparecer escapado.

### T2.4 — Funciones de servidor para notas
`src/server/notes.ts` — verificar ownership via project en todas las operaciones:
- `listNotes(userId, projectId)`
- `createNote(userId, projectId, data)` — Zod validate
- `updateNote(userId, noteId, data)` — JOIN con projects
- `deleteNote(userId, noteId)`

### T2.5 — Inspector de nota
`src/app/projects/[id]/NoteInspector.tsx` (Client Component):
- Campos: título, capa, estado, contenido (textarea), etiquetas
- Guardar al blur → Server Action `updateNote`
- Eliminar → diálogo propio → `deleteNote`
- Backlinks al pie con `backlinks()` de `core/`

**Hecho cuando:** `npm run test` verde; editar una nota persiste tras recargar.

---

## Etapa 3 · Vista Embudo

`src/app/projects/[id]/funnel/FunnelView.tsx` — 6 columnas con `FunnelColumn`.

Cada columna: número, nombre, pregunta guía, notas de esa capa, botón "+".

Drag & drop con dnd-kit → `onDragEnd` → Server Action `updateNote({ layer })` → actualizar store.

**Hecho cuando:** arrastrar entre capas persiste y sobrevive a recarga.

---

## Etapa 4 · Vista Tablero

`src/app/projects/[id]/board/BoardView.tsx` — columnas: `todo`, `doing`, `done`, `idea`.

Mismo patrón que el embudo pero por `status`.

---

## Etapa 5 · Vista Documentos

`src/app/projects/[id]/docs/DocsView.tsx`:
- Lista de notas izquierda / editor (textarea) + preview derecha
- Preview usa `markdownToHtml`; los `<a data-wikilink>` tienen click handler → busca en store o abre diálogo de creación
- Backlinks al pie del inspector

---

## Etapa 6 · Lienzo y Grafo

### T6.1 — Lienzo (React Flow / @xyflow/react)
`src/app/projects/[id]/canvas/CanvasView.tsx`:
- Nodos = notas (x, y de BD); pan y zoom
- Al soltar → `updateNote({ x, y })`

### T6.2 — Conexiones
`src/server/edges.ts`: `createEdge`, `deleteEdge` (verificar ownership vía project).
Conectar nodos → `createEdge` → store. Eliminar → `deleteEdge`.

### T6.3 — Grafo
`src/app/projects/[id]/graph/GraphView.tsx`:
- Nodos + aristas explícitas + `wikilinkEdges()` de `core/`
- Clic en nodo → abre inspector

---

## Etapa 7 · Pulido y lanzamiento

### T7.1 — Exportar JSON
Server Action → descarga `{ project, notes, edges }`.

### T7.2 — Importar JSON
Diálogo → subir JSON → validar con Zod → `importProject` en transacción.

### T7.3 — Búsqueda y modo Presentar
- Búsqueda: filtrar notas en el store por título/tags (sin llamada al servidor)
- Toggle Presentar: ocultar chrome con CSS

### T7.4 — Despliegue en Vercel
1. Conectar repo GitHub a Vercel
2. Configurar variables de entorno
3. `npm run build` debe pasar limpio

---

## Estado global por proyecto (Regla de oro #3)

`src/app/projects/[id]/layout.tsx`:
- Server Component: carga notas + edges
- Pasa a `ProjectProvider` (Client Component) que expone un Context
- Las 5 vistas leen del mismo Context; nunca duplicar estado
- Mutaciones: Server Action → `router.refresh()` o actualización optimista del Context

---

## Verificación final

```bash
npm run typecheck   # sin errores
npm run lint        # sin warnings
npm run test        # tests de core/ en verde
npm run build       # build de producción limpio
```

Flujo end-to-end:
1. Registro → Login → `/projects`
2. Crear proyecto → `/projects/[id]`
3. Crear nota en Embudo → verla en Tablero, Documentos, Lienzo y Grafo
4. Editar con `[[Otro título]]` → ver backlink en la otra nota
5. Exportar JSON → importar como proyecto nuevo
6. App funcional en URL pública de Vercel
