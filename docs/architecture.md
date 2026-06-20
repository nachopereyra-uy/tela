# Arquitectura — Tela

## Stack

| Capa | Elección | Por qué |
|------|----------|---------|
| Lenguaje | TypeScript | Un solo lenguaje cliente+servidor; tipos compartidos. |
| Framework | Next.js (App Router) + React | SSR, rutas, server actions; despliegue directo en Vercel. |
| Estilos | Tailwind CSS | Rápido y consistente. |
| Base de datos | Supabase (PostgreSQL) | Postgres gestionado. |
| Auth | Supabase Auth (`@supabase/ssr`) | Misma plataforma; sesión SSR. |
| ORM / migraciones | Drizzle ORM | Consultas tipadas y migraciones versionadas. |
| Lienzo y grafo | React Flow | Hecho para nodos + conexiones. |
| Documentos | TipTap (ProseMirror) | Editor rico, `[[wikilinks]]` como nodo, listo para colaboración futura. |
| Validación | Zod | Validar entradas en el servidor. |
| Tests | Vitest (+ Playwright opcional) | Cubrir `core/` y flujos críticos. |
| Hosting | Vercel | CI/CD y previews. |

Reservado para **Fase 2** (no instalar aún): Yjs + Liveblocks/PartyKit para tiempo real.

## Diagrama (Fase 1, sin tiempo real)

```
Navegador · Next.js + React
  Vistas: Embudo · Lienzo (React Flow) · Tablero · Documentos (TipTap) · Grafo
  Estado de UI en React (una fuente de verdad por proyecto)
        │ Server Actions / Route Handlers (Zod)      │ Sesión (cookies)
        ▼                                            ▼
  Servidor (Next en Vercel)                     Supabase Auth
   - validación (Zod)                            - registro / login / sesión SSR
   - autorización (ownership)
   - acceso a datos (Drizzle)
        │ SQL
        ▼
  Supabase · PostgreSQL  →  projects · notes · edges

  [ src/core/ puro: capas, enlaces, backlinks, markdown — cliente y servidor ]
```

## Capas de código

- **`src/core/` (dominio):** tipos y funciones puras (6 capas, `outgoingLinks`, `backlinks`, `markdownToHtml`). Sin framework ni BD. Testeable en aislamiento.
- **`src/db/` (datos):** esquema Drizzle + migraciones.
- **`src/server/` (acceso a datos):** funciones de servidor que leen/escriben con Drizzle, validando sesión y propiedad.
- **`src/app/` (interfaz):** rutas y componentes por vista. Sin reglas de negocio: las toma de `core/`.

## Reglas de arquitectura

1. La lógica de negocio vive en `core/`, no en los componentes.
2. Toda consulta valida autorización en el servidor; nunca se confía en el cliente.
3. Una sola fuente de verdad por proyecto en la UI: las cinco vistas leen del mismo estado.
4. El servidor valida entradas con Zod antes de tocar la base de datos.
5. Las posiciones del lienzo (x, y) se guardan en la nota, para consistencia entre dispositivos.

## Flujo típico (crear nota)

UI llama a `createNote(projectId, datos)` → el servidor valida sesión y propiedad del proyecto, valida con Zod e inserta con Drizzle → devuelve la nota → la UI actualiza el estado y todas las vistas la reflejan.

## Autorización

MVP con dueño único: `projects.owner_id` referencia al usuario de Supabase Auth. Cada función de servidor filtra por el usuario en sesión. Opcional como defensa en profundidad: políticas RLS en Postgres (ver `decisions.md`).

## Notas

- Websockets no encajan en el modelo serverless de Vercel; el tiempo real (Fase 2) irá en un proveedor dedicado.
- Decidir pronto el formato del contenido de las notas (markdown vs JSON de TipTap) — afecta esquema y editor. Ver `decisions.md`.
