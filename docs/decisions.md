# Decisiones — Tela

Registro de decisiones técnicas. Las **pendientes** deben resolverse antes de que un agente improvise; las **decididas** son vinculantes.

## Resumen

| ID | Decisión | Estado | Resolución MVP |
|----|----------|--------|----------------|
| D1 | Formato del contenido de las notas | Pendiente | Markdown |
| D2 | Etiquetas: array vs tabla | Pendiente | Array (`text[]`) |
| D3 | Autorización: dueño único vs equipos | Diferido | Dueño único (`owner_id`) |
| D4 | RLS en Supabase | Diferido | Validar en servidor; RLS luego |
| D5 | Posiciones del lienzo | Decidido | En la base de datos |
| D6 | Fuente de verdad entre vistas | Decidido | Un store único por proyecto |
| D7 | Modo de los agentes (sin AI agent mode de Cursor) | Decidido | Claude Code + Codex en terminal |

## Detalle

**D1 — Formato del contenido.** ¿Markdown (simple, portable, buscable) o JSON de TipTap (más rico, mejor para colaboración)? *Recomendación:* markdown en el MVP; migrar a TipTap si hace falta edición rica/colaboración. Afecta esquema y editor: decidir pronto.

**D2 — Etiquetas.** `text[]` (simple) vs tabla `note_tags` (mejores consultas/conteos). *Recomendación:* array en el MVP; normalizar si las etiquetas crecen en importancia.

**D3 — Autorización.** MVP con `owner_id` (un dueño por proyecto); equipos en Fase 2. *Mitigación:* aislar el acceso a datos en `src/server/` para que migrar a organizaciones sea un cambio local.

**D4 — RLS (Row Level Security).** Reforzar autorización con políticas en Postgres además del servidor. *Recomendación:* validar siempre en servidor; añadir RLS como defensa en profundidad cuando exista compartición.

**D5 — Posiciones del lienzo.** Guardar `x, y` por nota en la BD para consistencia multi-dispositivo. **Decidido.**

**D6 — Fuente de verdad.** Un único store de proyecto del que leen las cinco vistas, para no desincronizar. **Decidido.**

**D7 — Agentes.** El desarrollo se hace con Claude Code y Codex integrados en la terminal (no el modo agente de Cursor). Por eso `AGENTS.md` es la fuente de verdad y `CLAUDE.md` la importa. **Decidido.**

## Preguntas abiertas de producto

- ¿El MVP es solo de uso personal o ya con clientes invitados (read-only)?
- ¿Hace falta web pública de marketing desde el inicio o solo la app?
- ¿Plantillas de embudo por nicho (agencia, e-commerce) más adelante?
- ¿Se cobrará? Si sí, ¿en qué fase entra la facturación?

## Cómo registrar una decisión nueva

Añade una fila al resumen y un bloque en "Detalle" con: contexto, opciones, decisión y consecuencias. No cambies una decisión "Decidida" sin actualizar este archivo.
