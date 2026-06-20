# PRD — Tela

## Visión

Espacio de trabajo visual e integrado para documentar y operar negocios a partir de un embudo universal de 6 capas. Combina documentos y propiedades (Notion/Coda), notas enlazadas y grafo (Obsidian) y lienzo visual (Miro/Mural). La diferencia central: **una nota es una sola entidad** que se ve simultáneamente en cinco vistas; no son módulos separados, es la misma información en distintas lentes.

## Problema

Quien diseña o documenta procesos de negocio salta entre herramientas: el diagrama en una, las tareas en otra, la documentación en otra. La información se duplica y se desincroniza, y no hay una estructura común que obligue a pensar el negocio como un sistema completo (de la captación a la retención).

## Usuarios objetivo

Consultores y estrategas que diagnostican negocios; fundadores y operadores que mapean su propio embudo; agencias que documentan procesos de clientes. Perfil común: piensan en procesos, valoran lo visual y necesitan documentar y operar a la vez.

## Núcleo conceptual: las 6 capas

| # | Capa | Pregunta guía |
|---|------|---------------|
| 1 | Marketing | ¿Cómo un desconocido puede saber que existes? |
| 2 | Ventas | ¿Cómo conviertes a ese desconocido en alguien interesado? |
| 3 | Cierre | ¿Cómo conviertes a ese interesado en alguien que paga? |
| 4 | Onboarding | ¿Cómo recibes a ese cliente nuevo? |
| 5 | Entrega | ¿Cómo le entregas el producto o servicio que compró? |
| 6 | Posventa | ¿Cómo lo retienes y aumentas su LTV? |

Principio rector: **el embudo es universal; lo que cambia es la ejecución.**

## La nota (entidad central)

Tiene título, contenido (markdown con enlaces `[[Título]]`), **capa** (una de las 6 o ninguna), **estado** (Por hacer / En curso / Hecho / Idea), **etiquetas** y **posición** (x, y) para el lienzo.

## Las cinco vistas

- **Embudo:** las 6 capas con su pregunta guía; mover notas entre capas.
- **Tablero:** kanban por estado.
- **Documentos:** editor con mini-markdown, enlaces `[[ ]]` y backlinks.
- **Lienzo:** nodos posicionables y conexiones dirigidas.
- **Grafo:** nodos y aristas (conexiones explícitas + wikilinks).

Todo dentro de un **proyecto/empresa** aislado; el usuario puede tener varios.

## Alcance del MVP (Fase 1)

Cuentas (registro/login), multi-proyecto, CRUD de notas con capa/estado/etiquetas, las cinco vistas sobre datos persistentes en la nube, e importar/exportar JSON. **Sin tiempo real, sin equipos, sin facturación** (ver `roadmap.md`).

## Métricas de éxito

- Registrarse, crear un proyecto y modelar el embudo en menos de 10 minutos.
- La información persiste en la nube y es accesible desde cualquier dispositivo.
- Una nota creada en una vista aparece correctamente en las demás.

## Fuera de alcance (por ahora)

Colaboración en tiempo real, equipos/roles, facturación, adjuntos, automatizaciones.
