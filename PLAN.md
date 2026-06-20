# Estado del proyecto — Tela MVP

> Documento de estado para cualquier agente que retome el trabajo. La fuente de verdad operativa es **`AGENTS.md`** (reglas y flujo) + **`docs/tasks.md`** (progreso de tareas).

---

## Estado actual (2026-06-20)

El proyecto está **100% implementado**. Todas las tareas del MVP están completas.

### URL de producción

https://tela-pi.vercel.app

### Tareas completadas

Todas las tareas T0.1 → T7.4 están marcadas en `docs/tasks.md`.

### Infraestructura configurada

- **Supabase**: proyecto creado, tablas migradas (`projects`, `notes`, `edges`), RLS activo.
- **Credenciales**: en `.env.local` (no commitear). Ver `.env.example` para las claves necesarias.
- **GitHub**: repositorio conectado, CI en verde (typecheck + lint + test).

---

## Decisiones técnicas vigentes

- Contenido de notas: **Markdown** con `[[wikilinks]]` (no TipTap JSON).
- Etiquetas: `text[]` en Postgres.
- Auth: email + contraseña (sin OAuth en MVP).
- Estado UI: un único Context/store por proyecto compartido entre las 5 vistas.
- Autorización: `owner_id` en cada consulta de servidor. Sin equipos en MVP.

---

## Cómo retomar el trabajo

1. Leer `AGENTS.md` (reglas de oro, stack, estructura).
2. Abrir `docs/tasks.md` y tomar la **primera tarea sin marcar** (actualmente T7.3).
3. Seguir el flujo definido en `AGENTS.md`: implementar → typecheck → test → marcar → commit.
