# Junta11 — historial de la versión publicada

Los comandos y rutas de archivos de este historial corresponden a la publicación original. Para trabajar en el repositorio integrado, usá [README.md](../README.md).

La versión publicada se registró en https://junta11.vercel.app. El repositorio de GitHub fue renombrado a NavarroTomas/Junta11 y el intento de sincronización de ese período quedó registrado en QA. Registro y correo de confirmación con posterior ingreso fueron confirmados por Navarro. Los retornos de Auth a /crear-liga y /recuperar se comprobaron. La app móvil continúa pausada.

Consultar [QA-current.md](QA-current.md) para la aceptación actual, pruebas realizadas y pendientes. Las secciones siguientes conservan el historial y sus bloqueos pueden haber sido resueltos.

Relato minimalista de once escenas con scroll: fondo blanco, logo centrado en header transparente y menú lateral negro a pantalla completa. Ilustraciones locales con transparencia, sin marcos ni numeración de la grilla. Cambios por cortes, sin animación continua de los personajes.

La landing conserva su HTML/CSS/JS. Las rutas de plataforma usan los componentes React reales de la tesis, compilados para el navegador. Un Worker sirve rutas y recursos; las operaciones y los permisos siguen en Supabase. Flutter y el legado APA no se incluyen.

Los botones de acceso permanecen en Sites. Login, registro guiado, recuperación, Mis ligas y panel usan el cliente real de Supabase. Solo se compilan URL y clave pública; nunca claves de servidor. Falta verificar entrega de emails y autorización del dominio como redirect en Auth.

Ver QA-published-history.md para procedencia exacta del recurso, alcance de las pruebas y límites. La vista previa de Sites tenía visibilidad owner-only y se identificaba mediante `.openai/hosting.json` en el proyecto de Sites.


### Ajuste visual del 21/11
El relato ahora mantiene título, descripción y CTA centrados. Cada una de las once escenas cambia la ilustración de posición, el contenido y la acción mediante un desvanecimiento. Datos de escenas/CTA y posiciones: `dist/story.js`; geometría y transiciones: `dist/story.css`. Detalles de validación y límites: `QA-published-history.md`.


### Vistas de producto y mensajes útiles — 21/11
Cada escena tiene ahora una vista ilustrativa de la plataforma, ubicada al lado contrario del personaje y sincronizada con el texto y el CTA. Las once ilustraciones SVG están en dist/guides; el generador reproducible es scripts/generate-guide-images.cjs. No son capturas reales ni formularios interactivos: el pie dice Vista de ejemplo y los textos alternativos aclaran que los datos son ficticios. Se basan en los módulos actuales PublicLeague, LeagueViews, Settings y Onboarding del proyecto Next.js.

Los mensajes explican qué organiza la página y qué problemas evita: mensajes perdidos, listas dispersas, confusiones de horario, resultados mezclados y cálculo manual de posiciones/estadísticas. Datos de relato y sincronización: dist/story.js. Distribución, móvil y movimiento reducido: dist/story.css. En móvil las imágenes se apilan alrededor del texto por falta de espacio lateral.


### Cierre visual provisional — 21/11
Por decisión de Navarro, se retiraron las once vistas ilustrativas, sus recursos y su generador. La landing queda con el personaje original, los textos informativos y CTA del relato, sus transiciones y menú. Se recupera la distribución centrada previa a las guías.


### Variación editorial — 21/11
Se mantiene el primer título y se alternan cuatro composiciones (hero original, párrafo mediano protagonista, frase breve y bloque editorial alineado a la izquierda) y cinco entradas (fade, izquierda, derecha, desde abajo y escritura). presentations en dist/story.js define diseño, efecto y posición de cada escena; scenes conserva los textos y poses el personaje/CTA. CSS usa data-layout para la composición. El texto explica usos concretos: identidad, planteles, temporadas, modalidad, calendario, acceso público, estadísticas, posiciones y noticias.

La escritura reserva el espacio completo para evitar saltos; una copia accesible contiene la información completa y la capa que se escribe se oculta de lectores de pantalla. Al cambiar de escena se cancelan escritura y animación previas. Movimiento reducido muestra todo inmediatamente. No se reincorporan las vistas ilustrativas.


### Composiciones con posición y escala — 21/11
La tabla compositions en dist/story.js define por escena: centro X/Y y ancho del texto; centro X/Y y tamaño del personaje; y coordenadas/tamaño alternativos para móvil. Los cambios de posición y escala se aplican juntos durante el desvanecimiento, conservando los estilos de entrada y escritura anteriores. Hay distribuciones a izquierda/derecha y arriba/abajo. El personaje crece o se reduce según la composición. Las variables CSS se interpretan en dist/story.css; en móvil/tablet hasta 800px se usan posiciones más cercanas al centro y el personaje se distribuye en la franja inferior. Se conservan textos, CTA, imagen transparente y primer título.


### Limpieza y centrado — 21/11
Se retiran los números 01–05 del menú, su frase inferior y el contador de escenas. Se conservan los accesos del menú. Las escenas 6 y 11 tienen el texto centrado (X/Y 50%, alineación al centro) en escritorio y móvil; se ajusta la ilustración hacia el lateral en escritorio y debajo en móvil. compositions y data-centered controlan estos cambios.


### Modo oscuro y limpieza final — 21/11
Se elimina el aviso inferior de scroll y su flecha. El botón theme-toggle se ubica junto al menú, con luna/sol y etiquetas accesibles dinámicas. La preferencia junta11-theme se guarda localmente; por defecto se conserva el fondo claro. Un script pequeño en head aplica la preferencia antes de cargar CSS. Si localStorage está bloqueado, el cambio de tema sigue funcionando durante la visita. Las reglas dark al final de dist/story.css usan carbón, crema y naranja y cubren cuerpo, párrafos, etiquetas, CTA, iconos y contenido sin JS. No se altera el sprite, composiciones ni centrado6/11.


### Tipografía aprobada — 22/11
Referencia exacta: título Sumate al plantel de Asteri publicado, selector .ap-recruit-copy h1, Bricolage Grotesque 700, tracking -.035em y line-height 1.08. Se aplica a títulos de la landing; Inter pasa a ser la fuente de lectura/UI. La marca conserva su tratamiento tipográfico. Se mantiene la variación editorial y el modo oscuro. Misma actualización en src/components/junta11/story.module.css de Next.

## Plataforma publicada — 22/11/2026

Preguntas: nombre del organizador; propósito; equipos o jugadores; nombre e idea de liga; cantidad estimada; formato; colores; revisión y cuenta. Se conserva el borrador sin contraseña, la confirmación de correo y la creación real mediante RPC. Cada pregunta usa TypedText y las opciones/campos aparecen con fade; reduced-motion desactiva movimiento.

Fuente exacta y hashes: docs/platform-source-manifest.json. Adaptadores de navegación e imágenes: platform/router.tsx y image.tsx. El router mantiene identidad estable para no repetir efectos de consultas. Build: GTL_SOURCE=<checkout tesis> node scripts/build-platform.cjs; node scripts/build-worker.cjs; GTL_SOURCE=<checkout tesis> node scripts/validate-platform.cjs. Evidencia: QA-platform.json. Sin navegador real, email ni CRUD autenticado verificados por esta publicación.

### Autenticación minimalista — 22/11
Registro, login y recuperación usan acciones transparentes pequeñas con borde y forma redondeada. Registro sin pie, barra, numeración visible ni explicaciones repetidas; opciones compactas transparentes con borde y check de selección. Se conservan errores, validaciones y confirmación de correo.
Build independiente del checkout de tesis: `npm ci --prefix platform`; `PLATFORM_RUNTIME=$PWD/platform/node_modules node scripts/build-browser-platform.cjs`; `node scripts/build-worker.cjs`. La configuración pública del navegador está en platform/public-config.json; no contiene claves de servidor. Las dependencias quedan fijadas con platform/package-lock.json.

El campo PasswordInput comparte el ojo integrado entre login, registro y recuperación. Botón accesible con etiqueta dinámica, aria-pressed y área de 44 px; nunca envía el formulario ni cambia el valor.

### Corrección del registro y del backend público
/registro siempre empieza en la primera pregunta después del nombre, incluso con un borrador completo anterior. Solo /crear-liga con sesión válida y una marca explícita de preguntas completadas del mismo borrador reanuda la revisión. Correo validado antes de signUp; la confirmación de correo conserva la configuración. Se corrigió la URL de ejemplo que se había extraído accidentalmente de un comentario del bundle y se añadió un bloqueo de compilación para otros destinos.
Verificación: tests/registration-regressions.cjs; GET auth/settings 200 (email enabled, signup enabled, confirmation required); POST token con cuenta inexistente devuelve invalid_credentials en el proyecto real. No se crearon cuentas ni se enviaron emails de prueba.

### JUNTA11 — navegación y dominio
Dominio asignado: https://junta11.vercel.app. Proyecto Vercel: junta11 (mismo ID). Enlaces públicos /liga/:slug, manteniendo /l/:slug compatible. Menú de administración ocupa la ventana, con grilla de módulos y regreso a Administración; sin sidebar. Botones transparentes con hover inverso, sin flechas ni frases decorativas. Registro: Nombre de usuario separado de Nombre de la liga. Selector oculto con una sola temporada y competencia; con múltiples competencias de la misma temporada conserva selección de competencia. Footer con marca.
Comprobaciones: presentation-regressions.cjs y registration-regressions.cjs. Pendiente administrativo: renombrar GitHub y configurar Site URL/redirects de Auth para el nuevo dominio, que actualmente vuelve a localhost; ambas pantallas necesitan sesión.

### Creación progresiva de ligas
Cantidad estimada opcional (0 = sin definir). La página se crea sin equipos ni partidos; los equipos se cargan después. Equipos puede mostrar activos o retirados y permite reactivación. Retirar conserva jugadores, encuentros y resultados; excluye al equipo de nuevos partidos y de la generación del fixture. Los partidos existentes permanecen para gestión explícita. Las posiciones conservan equipos retirados con resultados, identificados como Retirado.
Migración incremental_league_setup: check de estimación opcional, teams.is_active, fixture con equipos activos y trigger para impedir nuevos partidos con retirados. RLS y permisos sin cambios.
Verificación transaccional como authenticated: creación vacía, agregar, retirar/reactivar, exclusión del fixture y preservación de un resultado. Datos de prueba revertidos. También pasan registration-regressions.cjs y presentation-regressions.cjs.

### Pantallas y fichas públicas
Sistema visual común aplicado a listados, formularios, tablas, calendario, noticias, temporadas y configuración. Fichas de equipos, jugadores, partidos y noticias en /liga/:slug/{equipos,jugadores,partidos,noticias}/:id. Versiones demostrativas en /demo/{tipo}/:id. Los perfiles no requieren cuentas de jugador: el administrador conserva la gestión. Estadísticas del jugador calculadas solo sobre partidos finalizados, con desglose por temporada cuando hay más de una. Noticias no publicadas y registros inexistentes no producen fichas públicas.
Verificación: typecheck-platform.cjs, presentation-regressions.cjs (incluye fichas y visibilidad), registration-regressions.cjs. App móvil pospuesta por pedido de Navarro para consultar React Native/Expo frente a Flutter; no se entrega ni publica una app móvil en esta iteración.
