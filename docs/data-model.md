# Modelo de datos — Tela

PostgreSQL (Supabase). Sistema de registro del MVP. La autenticación la gestiona Supabase Auth (`auth.users`); aquí solo referenciamos su `id`.

> Cualquier cambio en estas tablas debe reflejarse aquí y en una migración de Drizzle.

## `projects` — Proyecto / Empresa

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid (PK) | Identificador. |
| owner_id | uuid | Dueño → `auth.users.id`. |
| name | text | Nombre. |
| color | text | Color (hex). |
| created_at | timestamptz | Creación. |
| archived_at | timestamptz null | Archivado. |

## `notes` — Nota (entidad central)

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid (PK) | Identificador. |
| project_id | uuid (FK → projects.id) | Proyecto. |
| title | text | Título. |
| content | text | Contenido (markdown con `[[wikilinks]]`). |
| status | text | `todo` · `doing` · `done` · `idea` · `none`. |
| layer | text | `marketing` · `ventas` · `cierre` · `onboarding` · `entrega` · `posventa` · `none`. |
| x | integer | Posición horizontal (lienzo). |
| y | integer | Posición vertical (lienzo). |
| tags | text[] | Etiquetas (ver `decisions.md` D2). |
| created_at | timestamptz | Creación. |
| updated_at | timestamptz | Actualización. |

## `edges` — Conexión del lienzo

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid (PK) | Identificador. |
| project_id | uuid (FK → projects.id) | Proyecto. |
| from_note_id | uuid (FK → notes.id) | Origen. |
| to_note_id | uuid (FK → notes.id) | Destino. |
| label | text null | Etiqueta opcional. |

## Relaciones y borrado

- Un proyecto tiene muchas notas y muchas conexiones.
- Una conexión une dos notas del mismo proyecto.
- Borrar una nota borra en cascada sus conexiones; borrar un proyecto borra sus notas y conexiones.

## Índices sugeridos

- `notes(project_id)`, `edges(project_id)` para cargar un proyecto.
- `projects(owner_id)` para listar los proyectos de un usuario.

## Datos derivados (no se guardan)

Backlinks y aristas de wikilinks se **calculan** del contenido (`[[ ]]`) con `src/core/`. No se almacenan.

## Valores por defecto al crear

`status = "todo"` (o el de la columna), `layer = "none"` (o la capa de creación), `x`/`y` razonables, `tags = []`.

## Preparado para el futuro (no implementar aún)

- Equipos (Fase 2): tablas `organizations`, `memberships`; mover `owner_id` a `org_id` + rol.
- Tiempo real (Fase 2): `yjs_documents(project_id, state bytea, updated_at)` materializado a estas tablas.
