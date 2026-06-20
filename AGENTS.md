# AGENTS.md

Instrucciones operativas para cualquier agente de código (Claude Code, Codex, Cursor, etc.) que trabaje en este repositorio. **Léelo antes de tocar nada.** Para el contexto de producto, ver `docs/`.

---

## Qué es Tela

Espacio de trabajo visual e integrado para **documentar y operar negocios** sobre un embudo universal de 6 capas (Marketing, Ventas, Cierre, Onboarding, Entrega, Posventa). **Una nota es una sola entidad** que se ve a la vez como embudo, lienzo, tablero, documento y grafo.

Detalle completo: `docs/prd.md`.

## Stack

TypeScript de extremo a extremo. Next.js (App Router) + React · Tailwind · Supabase (Postgres + Auth) · Drizzle ORM · React Flow (lienzo/grafo) · TipTap (documentos) · Zod · Vitest. Despliegue en Vercel. **Sin tiempo real en el MVP.**

## Comandos

> Los scripts deben existir en `package.json` (tarea T0.1). Hasta entonces, son la convención objetivo.

```bash
npm install          # instalar dependencias
npm run dev          # desarrollo local
npm run build        # build de producción
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest (unitarios)
npm run db:generate  # generar migración Drizzle desde el esquema
npm run db:migrate   # aplicar migraciones a Supabase
```

## Estructura del proyecto

```
.
├─ AGENTS.md            # este archivo (fuente de verdad para agentes)
├─ CLAUDE.md            # importa AGENTS.md (para Claude Code)
├─ README.md            # documentación para humanos
├─ docs/                # contexto del producto
│  ├─ prd.md            # qué construimos y por qué
│  ├─ architecture.md   # stack, capas de código y reglas
│  ├─ data-model.md     # tablas de la base de datos
│  ├─ roadmap.md        # etapas del desarrollo
│  ├─ tasks.md          # tareas pequeñas (la lista de trabajo)
│  └─ decisions.md      # decisiones tomadas y pendientes
└─ src/
   ├─ core/             # dominio puro: capas, enlaces, backlinks, markdown (con tests)
   ├─ db/               # esquema Drizzle + migraciones
   ├─ server/           # acceso a datos + autorización (solo servidor)
   └─ app/              # Next.js App Router: rutas y componentes por vista
```

## Reglas de oro (no negociables)

1. **La lógica de negocio vive en `src/core/`,** nunca en los componentes. `core/` es puro: sin DOM, sin framework, sin acceso a red.
2. **Toda consulta valida autorización en el servidor.** Comprobar siempre que el recurso pertenece al usuario en sesión. Nunca confiar en el cliente.
3. **Una sola fuente de verdad por proyecto** en la UI. Las cinco vistas leen del mismo estado; no duplicar estado por vista.
4. **Validar entradas con Zod** en el servidor antes de tocar la base de datos.
5. **TypeScript en estricto.** Sin `any` salvo justificación explícita.
6. **Diálogos propios dentro de la app.** No usar `prompt()`, `confirm()` ni `alert()` del navegador (se bloquean en iframes).
7. **Commits pequeños:** una tarea = un commit coherente.
8. **El código de `core/` se entrega con tests.**

## Flujo de trabajo del agente

1. Abre `docs/tasks.md` y toma la **primera tarea sin marcar** (o la que te indique el usuario).
2. Implementa **solo** el alcance de esa tarea. No toques archivos fuera de su ámbito.
3. Ejecuta `npm run typecheck` y `npm run test`. Si la tarea es de `core/`, añade o actualiza tests.
4. Verifica el criterio **"Hecho cuando"** de la tarea.
5. Marca la casilla en `docs/tasks.md` y deja un commit con mensaje claro (`feat: …`, `chore: …`).

## Definición de "hecho"

- Compila (`typecheck` en verde) y pasa `lint` y `test`.
- Cumple el "Hecho cuando" de la tarea.
- No rompe otras vistas ni introduce estado duplicado.
- Sin secretos en el código; las claves van en variables de entorno.

## Qué NO hacer

- No construir un motor de colaboración en tiempo real (es Fase 2, con Yjs + proveedor gestionado).
- No meter lógica de negocio en componentes React.
- No usar websockets en Vercel para el MVP.
- No exponer la `service_role` de Supabase al cliente.
- No cambiar el esquema de datos sin actualizar `docs/data-model.md` y crear su migración.
- No ampliar el alcance del MVP por tu cuenta (ver `docs/roadmap.md`).
