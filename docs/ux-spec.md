# UX y comportamiento — Tela (paridad con el prototipo)

Cómo se estructura y cómo se comporta la interfaz. Objetivo: que la app funcione **igual que el prototipo**. Acompaña a `design-system.md` (apariencia). No cambiar la lógica de datos; sí la capa de presentación e interacción.

## 1. Layout general

- Dos columnas: **sidebar** (~230px) + **área principal**.
- Área principal: **topbar** (~54px) fija arriba + **escenario** (la vista activa) ocupando el resto.
- **Inspector** de nota: panel que entra deslizándose desde la derecha (no empuja el contenido; se superpone).
- **Modo Presentar:** colapsa el sidebar a 0 para trabajar limpio frente a un cliente.
- Responsive: en pantallas estrechas el sidebar se vuelve un panel superpuesto.

## 2. Logo / marca

- Wordmark **"Tela"** en *Instrument Serif* (~30px) con un **punto azul** (`--blue`, ~7px) ligeramente elevado, pegado a la derecha del texto.
- Va arriba del sidebar. Hacerlo un **componente reutilizable** (`<Logo />`) por si aparece también en login/landing.
- Reutilizar el mismo wordmark en la pantalla de login y como nombre/título de la app. (Favicon e icono pueden derivarse del punto azul sobre papel.)

## 3. Sidebar (estructura y comportamiento)

De arriba a abajo:

1. **Logo** "Tela" + punto azul.
2. **Selector de proyecto** (debajo del logo): botón con un **avatar** (cuadrado redondeado con la inicial del proyecto sobre su color), el **nombre** del proyecto y un chevron.
   - Al pulsarlo abre un **menú desplegable**: etiqueta "Proyectos · Empresas", **lista** de proyectos (cada uno con su avatar de color, nombre, contador de notas y un check en el activo), separador, y acciones **Renombrar actual** y **Eliminar actual**.
   - Clic en un proyecto de la lista **cambia** a ese proyecto (todas las vistas pasan a sus datos). Clic fuera cierra el menú.
   - **Crear proyecto NO está aquí** (está en la topbar). Eliminar no permite quedarse sin proyectos.
3. **Navegación** (4 vistas, con icono y etiqueta): **Embudo · Lienzo · Tablero · Documentos**. El ítem activo va resaltado (fondo de tarjeta, icono azul). Embudo es la vista por defecto. (La vista Grafo está deshabilitada en el MVP; ver sección 11.)
4. **Separador** + etiqueta "Espacio".
5. **Línea de estado:** "{N} notas · {M} conexiones" del proyecto activo (se actualiza en vivo).
6. **Pie:** botones **Exportar proyecto** e **Importar proyecto**.

## 4. Topbar

De izquierda a derecha:

- **Título de la vista** activa con su icono (en azul).
- **Buscador** ("Buscar notas…"): filtra las notas de la vista activa por título y etiquetas, en vivo. Atajo `Cmd/Ctrl+K` para enfocarlo.
- Espaciador.
- **Presentar** (botón sutil, alterna el modo presentación; el texto cambia a "Salir").
- **Nuevo proyecto** (botón sutil): abre el diálogo para nombrarlo y crea un proyecto **vacío**, cambiando a él.
- **Nueva nota** (botón primario azul): disponible en la topbar del Lienzo. En otras vistas la creación es per-vista (ver sección 17). Tras crear, abre el inspector enfocando el título.

## 5. Inspector de nota (panel lateral derecho)

Se abre al **seleccionar** una nota (clic en su tarjeta/nodo) o al crear una. Panel superpuesto desde la derecha; no empuja el contenido.

El inspector tiene **3 pestañas**; no requiere scroll dentro de ninguna pestaña:

**Pestaña Info**
- **Título** (input, con foco al crear una nota nueva).
- **Capa del negocio:** botones de las 6 capas (cada uno con su punto de color) + "Sin capa". El activo queda marcado.
- **Estado:** Por hacer / En curso / Hecho / Idea.
- **Etiquetas:** input separado por comas.
- **Eliminar nota** (acción peligrosa, con confirmación): borra también sus conexiones.

**Pestaña Content**
- **Contenido:** textarea o editor, con la pista "usa [[Título]] para enlazar".

**Pestaña Links**
- Panel **"Enlaza a"** (wikilinks salientes) y **"Le enlazan"** (backlinks): chips clicables.

Cualquier cambio se refleja **en vivo** en la vista activa (el título en la tarjeta, el color de capa, etc.). `Esc` cierra el inspector. La tecla `Delete` elimina la nota seleccionada cuando el foco no está en un campo de texto.

## 6. Diálogos (modales propios)

Todo "preguntar nombre" o "confirmar" usa un **modal propio** centrado (overlay con leve blur), nunca `prompt`/`confirm`/`alert`. Dos tipos:
- **askText**: título + input + Cancelar/Crear. Enter confirma, Esc cancela, clic fuera cancela.
- **askConfirm**: título + mensaje + Cancelar/Eliminar (acción en rojo).

Usado en: crear/renombrar/eliminar proyecto, eliminar nota, eliminar conexión, y crear nota desde un `[[enlace]]` inexistente.

## 7. Vista Embudo (interacciones)

- Muestra las **6 capas** en orden, cada una con número, nombre, **pregunta guía** y un contador de notas.
- Las notas de cada capa se muestran como tarjetas dentro de su banda.
- **Arrastrar** una tarjeta a otra capa cambia su `layer` (y persiste).
- Botón **"Añadir"** por capa: crea una nota ya asignada a esa capa.
- Clic en una tarjeta abre el inspector.

## 8. Vista Lienzo (interacciones)

- **Pan:** arrastrar el fondo desplaza el lienzo cuando la herramienta activa es Pan (mano), o con la rueda del ratón. **Zoom:** controles `+ / – / centrar` (abajo a la izquierda) con indicador de porcentaje.
- **Mover nodo:** arrastrar una tarjeta (herramienta Seleccionar activa) cambia su posición (x, y) y persiste.
- **Crear nota:** doble clic en el fondo crea una nota en ese punto y abre el inspector con el foco en el título. También disponible mediante el botón **"Nueva nota"** en la topbar.
- **Conectar:** cada nodo tiene un **punto de conexión** (handle) que aparece al pasar el cursor; arrastrar desde él hasta otro nodo crea una **conexión** dirigida.
- **Borrar conexión:** clic sobre una flecha pide confirmación y la elimina.
- Seleccionar un nodo lo resalta y abre el inspector.
- Pista visible en el fondo vacío: "Doble clic para crear · arrastra el punto azul para conectar".

### Panel de herramientas (izquierda)

Barra vertical flotante sobre el lienzo, pegada al borde izquierdo. Herramientas disponibles:

| Herramienta | Icono | Comportamiento |
|-------------|-------|----------------|
| Seleccionar | cursor | Selecciona y mueve nodos; es la herramienta por defecto. |
| Pan | mano | Desplaza el lienzo al arrastrar el fondo (sin seleccionar). |
| Rectángulo | cuadrado | Dibuja un nodo de forma rectangular. |
| Rombo | diamante | Dibuja un nodo en forma de rombo (decisión). |
| Círculo | elipse | Dibuja un nodo circular. |
| Anotación | T | Crea un bloque de texto libre (sin borde de tarjeta). |
| Nota adhesiva | post-it | Crea una nota estilo sticky con fondo `--todo` suave. |

- Al activar una herramienta de forma, el cursor cambia a cruz. Un clic en el lienzo instancia el nodo en ese punto con tamaño por defecto; arrastrar define el tamaño.
- Presionar `Esc` o hacer clic en Seleccionar vuelve a la herramienta por defecto.
- Tooltip sobre cada botón muestra el nombre de la herramienta.

## 9. Vista Tablero (Kanban)

- Columnas por estado: **Por hacer · En curso · Hecho · Ideas**, cada una con punto de color y contador.
- **Arrastrar** una tarjeta a otra columna cambia su `status` (y persiste).
- Botón **"Añadir nota"** por columna.
- Cada tarjeta muestra su **etiqueta de capa**. Clic abre el inspector.

## 10. Vista Documentos

Enfoque tipo Notion: árbol de páginas a la izquierda, editor de ancho completo a la derecha.

### Árbol de páginas (izquierda, ~220px)

- Lista todas las notas del proyecto con punto de color por estado.
- La nota actualmente abierta va resaltada (fondo `--card`).
- Buscador en la parte superior para filtrar por título.
- Botón **"Nueva nota"** debajo del buscador: crea y abre la nota nueva.

### Editor (derecha, ancho completo)

- **Título** grande editable arriba (30px, peso 700). Pill de estado y tags editables bajo el título.
- **Tipos de bloque soportados:** párrafo, título H1, título H2, título H3, lista con viñetas, lista numerada, código en línea, divisor horizontal.
- **Barra de formato flotante:** aparece al seleccionar texto. Botones: Negrita (`Cmd+B`), Cursiva (`Cmd+I`), H1, H2, H3, Lista con viñetas, Lista numerada, Código en línea, Wikilink. Fondo `--card`, `--shadow-lift`.
- **Vista previa en vivo:** panel dividido que renderiza el markdown resultante. Se puede alternar entre modo edición solo, vista previa solo, o split.
- **Exportar como .md:** botón en la topbar de la vista; descarga el contenido de la nota activa como archivo Markdown.

### Wikilinks

- `[[Título]]` se renderiza como enlace en azul (`--blue`) con subrayado tenue.
- Clic en el enlace navega a esa nota dentro de la vista Documentos.
- Si la nota referenciada no existe, aparece en morado (`--idea`) y al hacer clic el modal ofrece crearla.

### Paneles de enlaces

- **"Enlaza a"** (salientes): chips clicables con las notas que esta nota referencia.
- **"Le enlazan"** (backlinks): chips clicables con las notas que referencian a esta. Se muestran debajo del editor o en la pestaña "Links" del inspector.

La lista muestra un punto de color por estado y marca la nota abierta.

## 11. Vista Grafo _(deshabilitada temporalmente)_

La vista Grafo no aparece en la navegación del MVP. Especificación preservada para la Fase 2:

- Nodos = notas (color por estado); aristas = conexiones del lienzo (sólidas) + enlaces `[[ ]]` (punteadas en morado).
- Clic en un nodo abre su **documento** (cambia a la vista Documentos con esa nota).
- Leyenda en una esquina explicando ambos tipos de arista.

## 12. Modo Presentar

Alterna desde la topbar. Oculta el sidebar (y deja el lienzo/vista a pantalla casi completa) para sesiones en vivo. El botón cambia a "Salir".

## 13. Búsqueda

El buscador filtra **dentro de la vista activa** por título y etiquetas, atenuando o quitando lo que no coincide. Es por proyecto.

## 14. Toasts

Mensajes breves abajo y al centro (fondo oscuro, texto blanco) tras acciones: "Proyecto creado", "Conexión creada", "Nota eliminada", "Importado…", etc.

## 15. Atajos de teclado

**Globales**
- `Cmd/Ctrl + K`: enfocar el buscador.
- `Esc`: cerrar el inspector o el modal activo.
- `Delete`: eliminar la nota seleccionada (si el foco no está en un campo de texto).

**En el editor de Documentos** (barra de formato flotante)
- `Cmd/Ctrl + B`: Negrita.
- `Cmd/Ctrl + I`: Cursiva.
- `Cmd/Ctrl + Shift + 1/2/3`: H1 / H2 / H3.

**En el Lienzo**
- `Esc`: volver a la herramienta Seleccionar desde cualquier herramienta de forma.

## 16. Estado y persistencia

- **Una sola fuente de verdad por proyecto**: las cuatro vistas activas leen del mismo estado; un cambio en una se ve en todas.
- Cada proyecto **recuerda su última vista** y el estado del lienzo (pan/zoom).
- Todo persiste en la base de datos por cuenta.

## 17. Estados vacíos / proyecto nuevo

- Un proyecto nuevo nace **vacío**, pero el Embudo ya muestra las **6 capas con sus preguntas** listas para llenar.
- Documentos vacío muestra un mensaje ("Ningún documento abierto"); Lienzo vacío muestra su fondo de puntos sin nodos.

## 18. Creación de notas por vista

Cada vista es autosuficiente para crear notas; no hay un único punto de entrada global. Esto reduce el número de pasos y mantiene al usuario en contexto.

| Vista | Cómo se crea una nota |
|-------|-----------------------|
| Embudo | Botón **"Añadir"** en la cabecera de cada capa. La nota se crea ya asignada a esa capa. |
| Lienzo | **Doble clic** en el fondo en cualquier punto, o botón **"Nueva nota"** en la topbar. |
| Tablero | Botón **"Añadir nota"** en la cabecera de cada columna. La nota se crea con el estado de esa columna. |
| Documentos | Botón **"Nueva nota"** en el árbol de páginas (panel izquierdo). |

En todos los casos, tras crear la nota el inspector se abre con el foco en el campo título.

## 19. Actualizaciones en tiempo real (optimistic UI)

No hay colaboración en tiempo real en el MVP (sin websockets). Los cambios se aplican de la siguiente forma:

- **Actualización optimista:** el estado local (React) se actualiza inmediatamente al confirmar la acción. La UI no espera la respuesta del servidor para reflejar el cambio.
- **Sincronización con el servidor:** tras la mutación, se llama a `router.refresh()` (Next.js App Router) para revalidar el segmento y obtener los datos actualizados desde la base de datos.
- Si el servidor devuelve un error, se muestra un toast de error y se revierte el cambio local.
- Las cuatro vistas activas comparten el mismo estado de proyecto; un cambio en una vista se refleja al navegar a otra sin recargar la página.
