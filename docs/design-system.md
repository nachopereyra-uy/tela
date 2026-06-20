# Sistema de diseño — Tela ("Blueprint Atelier")

Identidad visual del prototipo, para aplicarla en toda la app. Sensación: una mesa de dibujo técnico que se encuentra con una app de notas tranquila. Papel cálido, retícula de puntos, azul de plano, serif solo en el logo.

> Implementar como **sistema de diseño** (variables CSS + theme de Tailwind), no estilos sueltos. **No cambiar funcionalidad; solo presentación.**

## 1. Tokens

Definir en `globals.css` dentro de `:root` y mapear en `tailwind.config` a nombres semánticos (`bg-paper`, `text-ink`, `border-line`, `text-blue`, etc.).

```css
:root{
  --paper:#FAF8F3;        /* fondo principal (NO blanco) */
  --paper-2:#F3EFE6;      /* barras laterales / columnas */
  --card:#FFFFFF;         /* tarjetas */
  --ink:#1E1B16;          /* texto principal */
  --ink-soft:#6B6458;     /* texto secundario */
  --ink-faint:#9A9384;    /* texto tenue / metadatos */
  --line:#E5DFD2;         /* bordes suaves */
  --line-strong:#D6CEBC;  /* bordes / puntos de la retícula */
  --blue:#3457D5;         /* acento (conexiones, primario, selección) */
  --blue-deep:#2742A8;    /* hover del primario */
  --blue-soft:#E9EDFC;    /* fondos suaves, tags, anillo de selección */

  /* estados */
  --todo:#C98A2B; --doing:#3457D5; --done:#3E9D6B; --idea:#8A5BD6;

  /* 6 capas del negocio (progresión cálido→frío) */
  --l-marketing:#E0653E;
  --l-ventas:#DD933E;
  --l-cierre:#C7A93A;
  --l-onboarding:#4FA06B;
  --l-entrega:#2F8FA3;
  --l-posventa:#5B6AD0;

  --shadow: 0 1px 2px rgba(30,27,22,.05), 0 6px 18px rgba(30,27,22,.06);
  --shadow-lift: 0 8px 28px rgba(30,27,22,.14);
  --radius:12px;
}
```

## 2. Tipografía

Cargar dos fuentes de Google Fonts: **Instrument Serif** e **Inter**.

- **Inter** para absolutamente todo: UI, cuerpo, títulos de sección. Pesos 400/500/600/700.
- **Instrument Serif** SOLO para el wordmark "Tela" y, como mucho, títulos display grandes (p. ej. el encabezado del embudo). No usarla en UI general.
- Antialiasing activado; tracking ligeramente negativo en títulos grandes (`-0.01em`).

## 3. Reglas globales

- Fondo de la app: `--paper` (cálido), nunca blanco puro. Las tarjetas sí son blancas.
- Radios: tarjetas y contenedores 12px; botones e inputs 9–10px; pills y tags 20px.
- Sombras: usar `--shadow` en reposo y `--shadow-lift` en hover de elementos interactivos.
- Selección de texto: fondo `--blue-soft`.
- Transiciones suaves (~120ms) en hover/estado.

## 4. Marca

- Wordmark "Tela" en Instrument Serif (~30px) + un **punto azul** (`--blue`, 7px) ligeramente elevado a la derecha del texto.
- Tono general: profesional pero cálido; transmite precisión (plano técnico).

## 5. Componentes

### Sidebar
Fondo `--paper-2`, borde derecho `--line`, ancho ~230px. Ítems de navegación con icono a la izquierda; el activo va sobre fondo `--card` con `--shadow` y su icono en `--blue`.

### Topbar
Alto ~54px, fondo papel translúcido con `backdrop-filter: blur(6px)`, borde inferior `--line`. Contiene título de vista (icono en azul), buscador y acciones a la derecha.

### Botones
- **Primario:** fondo `--blue`, texto blanco, sombra sutil azulada; hover `--blue-deep`.
- **Sutil:** transparente, borde `--line-strong`, texto `--ink-soft`; hover fondo `--card`.
- Icono + etiqueta, radio 9px, peso 500.

### Inputs y buscador
Fondo `--paper` (o `--card`), borde `--line`, radio 9–10px; foco con borde `--blue` y fondo blanco.

### Tarjetas / pills / tags
- Tarjeta: `--card`, borde `--line`, radio 12px, `--shadow`; hover `--shadow-lift`.
- Tag/etiqueta: texto `--blue` sobre `--blue-soft`, radio 20px, 10px, peso 600.
- Etiqueta de capa ("layerpill"): mayúsculas pequeñas (9.5px), punto del color de la capa + nombre, fondo `--paper-2`.

### Diálogos (modales propios)
Overlay oscuro translúcido con leve blur; tarjeta blanca centrada, radio 16px, `--shadow-lift`. Botón de acción peligrosa en rojo `#B4452E`. **No usar `prompt`/`confirm`/`alert` del navegador.**

### Vista Embudo (núcleo)
- **Indicador de progreso horizontal** en la parte superior: una barra delgada (~4px) dividida en 6 segmentos (uno por capa), cada uno con su color de capa. El segmento correspondiente a las capas que tienen al menos una nota se rellena al 100%; las vacías se muestran en `--line`. Permite ver de un vistazo en qué etapas del negocio hay trabajo.
- Una banda por capa. A la izquierda, una **espina vertical** con un degradado que recorre los 6 colores de capa (marketing→posventa) y un **círculo numerado** por capa (borde del color de la capa).
- Cabecera de banda: nombre con una pequeña barra del color de la capa, la **pregunta guía** en `--ink-soft`, y un contador de notas en pill.
- Botón **"Añadir nota"** por capa, alineado a la derecha de la cabecera de banda; estilo sutil (borde `--line-strong`).
- Tarjetas de la capa con **borde izquierdo** del color de la capa.

### Vista Lienzo (React Flow)
- Fondo con **retícula de puntos**: usar el componente `Background` de React Flow con variante de puntos (gap 24, tamaño ~1.1, color `--line-strong`). Equivalente CSS: `radial-gradient(var(--line-strong) 1.1px, transparent 1.1px); background-size:24px 24px;` sobre `--paper`.
- **Nodo** (custom node de React Flow) con el aspecto de la tarjeta: ancho ~218px, blanco, radio 12px, `--shadow`. Arriba una **franja de estado** de 4px (color por estado), debajo la layerpill, luego título y un extracto del contenido, y los tags.
- Selección: anillo `0 0 0 2px var(--blue-soft)` + borde `--blue`.
- **Conexiones (edges):** trazo bezier, color `--blue`, grosor 2, con punta de flecha, opacidad ~0.85. Estilar `.react-flow__edge-path { stroke: var(--blue); }`.
- Controlador de conexión (handle): pequeño círculo blanco con borde azul que aparece al pasar el cursor.
- **Panel de herramientas (izquierda):** barra vertical flotante sobre el lienzo, pegada al lado izquierdo (~12px del borde), fondo `--card`, radio 12px, `--shadow`. Contiene iconos de herramientas apilados verticalmente con separador entre grupos:
  - Grupo 1 — **Seleccionar** (cursor) y **Pan** (mano).
  - Grupo 2 — Formas: **Rectángulo**, **Rombo**, **Círculo**, **Anotación de texto**, **Nota adhesiva**.
  - La herramienta activa: fondo `--blue-soft`, icono `--blue`, radio 8px.
  - Tamaño de icono 18px; botón 36×36px; padding vertical 8px entre grupos.
  - Tooltip al pasar el cursor (etiqueta de la herramienta + atajo si aplica).

### Vista Tablero (Kanban)
Columnas con fondo `--paper-2`, borde `--line`, radio 14px. Cabecera con punto de color del estado, nombre y contador. Tarjetas blancas (mismo lenguaje que el nodo, sin franja superior pero con layerpill).

### Vista Documentos
- **Área de dos columnas:** árbol de páginas a la izquierda (~220px, fondo `--paper-2`, borde derecho `--line`) + editor a la derecha (ancho completo disponible, fondo crema `#FCFBF8`).
- **Árbol de páginas:** lista de notas con punto de color por estado; la nota abierta va resaltada (fondo `--card`). Buscador en la parte superior del árbol; botón "Nueva nota" debajo.
- **Editor (TipTap):**
  - Título grande editable arriba (30px, peso 700). Pill de estado y tags bajo el título.
  - **Barra de formato flotante** que aparece al seleccionar texto: botones Negrita, Cursiva, H1, H2, H3, lista con viñetas, lista numerada, código en línea, wikilink. Fondo `--card`, radio 10px, `--shadow-lift`.
  - Tipos de bloque soportados: párrafo, título (H1–H3), lista con viñetas, lista numerada, código en línea, divisor horizontal.
  - **Vista previa en vivo:** split horizontal o lado a lado que renderiza el markdown; se puede alternar.
  - Botón **Exportar .md** en la topbar de la vista (icono de descarga, estilo sutil).
- **Wikilinks `[[Título]]`:** renderizados en `--blue` con subrayado tenue; si la nota no existe, en `--idea` (morado).
- Paneles **"Enlaza a"** y **"Le enlazan"** (backlinks) en bloques `--paper-2` debajo del editor o en el inspector.

### Vista Grafo (deshabilitada temporalmente)
La vista Grafo ha sido deshabilitada en la versión actual del MVP. Su entrada en la navegación no se muestra. La especificación de diseño se preserva para la Fase 2:
- Nodos coloreados por estado (mismos colores de estado), etiquetas en `--ink`.
- Aristas: conexiones del lienzo en línea sólida `--line-strong`; enlaces de wikilinks en línea **punteada** color `--idea`.

### Toasts
Fondo `--ink`, texto blanco, radio 10px, aparición desde abajo.

## 6. Estados (colores)

| Estado | Color |
|--------|-------|
| Por hacer | `--todo` (ámbar) |
| En curso | `--doing` (azul) |
| Hecho | `--done` (verde) |
| Idea | `--idea` (morado) |

## 7. Heurísticas UX aplicadas (Nielsen, adaptadas a Tela)

Referencia de decisiones de diseño. Cada punto describe la heurística y cómo se aplica en la UI.

| # | Heurística | Aplicación en Tela |
|---|-----------|-------------------|
| 1 | **Visibilidad del estado del sistema** | Toasts confirman cada acción relevante ("Nota creada", "Guardado"). La franja de estado de 4px en las tarjetas comunica el estado de la nota de un vistazo. El indicador de progreso horizontal del Embudo muestra cobertura por capa. |
| 2 | **Correspondencia con el mundo real** | Los nombres de las 6 capas (Marketing, Ventas, Cierre, Onboarding, Entrega, Posventa) reflejan el vocabulario real de un equipo de negocio. Las preguntas guía por capa orientan sin jerga técnica. |
| 3 | **Control y libertad del usuario** | `Esc` cierra el inspector o el modal desde cualquier estado. Los modales incluyen siempre "Cancelar". La acción eliminar requiere confirmación explícita. |
| 4 | **Consistencia y estándares** | Pills de capa con el mismo patrón de color en todas las vistas. Los botones primarios siempre en `--blue`. Los estados siempre con los mismos 4 colores. Mismo estilo de tarjeta en Tablero, Lienzo y Documentos. |
| 5 | **Prevención de errores** | Eliminar nota o proyecto siempre pide confirmación (`askConfirm`). No existe botón de "Eliminar" visible durante la edición normal; está dentro del inspector, fuera del flujo principal. |
| 6 | **Reconocimiento en lugar de recuerdo** | Cada ítem de navegación lleva icono + etiqueta de texto. Las herramientas del lienzo tienen tooltips. Las preguntas guía en el Embudo recuerdan para qué sirve cada capa sin que el usuario tenga que recordarlo. |
| 7 | **Flexibilidad y eficiencia** | Doble clic en el fondo del Lienzo crea una nota en ese punto. `Cmd/Ctrl+K` enfoca el buscador. `Delete` elimina la nota seleccionada sin abrir menús. Cada vista tiene su propio botón de creación para no interrumpir el flujo. |
| 8 | **Diseño estético y minimalista** | Paleta cálida sobre `--paper`, sin colores de fondo que compitan con el contenido. Sombras mínimas. Inspector como panel superpuesto (no empuja el layout). Sin información irrelevante en la vista activa. |
| 9 | **Ayuda al usuario a reconocer y recuperarse de errores** | Los formularios muestran mensajes de validación claros (ej. "El nombre no puede estar vacío"). Los wikilinks a notas inexistentes aparecen en morado y ofrecen crear la nota, en lugar de fallar en silencio. |
| 10 | **Ayuda y documentación** | Las preguntas guía por capa en el Embudo funcionan como onboarding contextual. Los estados vacíos tienen texto orientativo. No hay manual separado: la UI explica su propio uso. |

## 8. Restricciones

- Mantener accesibilidad: contraste suficiente, foco visible, objetivos táctiles cómodos (mínimo 36×36px).
- Si se usa Tailwind, exponer los tokens en el theme y usarlos de forma consistente; evitar valores mágicos repetidos.
- No alterar la lógica ni la estructura de datos: este documento es **solo** sobre apariencia.
