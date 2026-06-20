# Tela

> Lienzo, tablero y notas en una sola tela.

Espacio de trabajo visual e integrado (mezcla de Notion, Coda, Obsidian y Miro/Mural) para **documentar y operar negocios**. La idea central: **una nota es una sola entidad** que se ve a la vez como embudo, lienzo, tablero, documento y grafo. El **embudo de 6 capas del negocio** es la columna vertebral.

## Las 6 capas

Marketing → Ventas → Cierre → Onboarding → Entrega → Posventa.
El embudo es universal; lo que cambia es la ejecución.

## Stack

Next.js (App Router) + TypeScript · Tailwind · Supabase (Postgres + Auth) · Drizzle ORM · React Flow · TipTap · Zod · Vitest · Vercel.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completar con las claves de Supabase
npm run db:migrate           # aplicar el esquema
npm run dev                  # http://localhost:3000
```

Variables de entorno requeridas:

- `NEXT_PUBLIC_SUPABASE_URL`: URL pública del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon key pública para clientes web y SSR.
- `SUPABASE_SERVICE_ROLE_KEY`: service role key para tareas de servidor que la necesiten; no exponer al cliente.
- `DATABASE_URL`: connection string directo de Postgres para Drizzle.

Ver valores de ejemplo en `.env.example`.

## Estructura

```
docs/        Documentación del proyecto (PRD, arquitectura, modelo, roadmap, tareas, decisiones)
src/core/    Lógica de dominio pura (con tests)
src/db/      Esquema Drizzle y migraciones
src/server/  Acceso a datos y autorización
src/app/     Interfaz (Next.js App Router)
AGENTS.md    Instrucciones para agentes de código
CLAUDE.md    Entrada para Claude Code (importa AGENTS.md)
```

## Documentación

- [PRD](./docs/prd.md) · qué construimos y por qué
- [Arquitectura](./docs/architecture.md) · stack, capas y reglas
- [Modelo de datos](./docs/data-model.md) · tablas
- [Roadmap](./docs/roadmap.md) · etapas
- [Tareas](./docs/tasks.md) · lista de trabajo
- [Decisiones](./docs/decisions.md) · qué está decidido y qué falta

## Estado

En desarrollo · MVP (Fase 1: nube con login y base de datos, sin tiempo real).
