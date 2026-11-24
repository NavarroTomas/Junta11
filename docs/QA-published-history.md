# Comprobación de la vista de Sites — 21/11/2026

Este documento conserva la evidencia de la versión publicada antes de integrarla al repositorio. Consultá [README.md](../README.md) para los comandos actuales.

Se actualiza el Site privado existente de avance de landing, sin cambiar su audiencia. Es una vista estática equivalente al relato de la implementación local, identificada como b238446. El alcance es la landing estática de Sites.

Se recuperó el PNG original editado desde el archivo compartido: 633518 bytes, SHA256 b486ba12270c26628b5144f3f0ef85cf157727f516da081f479a22dac4077116. No se regeneró ni volvió a editar. Se adaptaron el markup, estilos y lógica del relato a HTML/CSS/JS sin build para esta vista alojada. La verificación se acotó a la vista de Sites, sin acceso al checkout de Windows ni al commit completo sin publicar.

Archivos: dist/index.html, dist/story.css, dist/story.js, dist/story-sprite.png. La configuración de hosting conserva el mismo project_id. Las fuentes de Google tienen alternativas del sistema. Las imágenes son locales y transparentes.

Verificación realizada en Chrome sobre la vista interna: título JUNTA11 y escena inicial presentes; imagen de puerta sin marco ni fondo visibles; menú abre y recibe foco en cerrar; pulsar Cómo funciona cierra el menú y permite recorrer las escenas; scroll posterior mostró las escenas 6 y 9 con texto e imagen correctos. Captura de escena9 mostró jugador con pelota sin fondo/marco y logo centrado. No se certifican todos los tamaños móviles ni las once escenas mediante interacción individual.

Las acciones de crear cuenta, ingresar y demo abren la plataforma base de Vercel en otra pestaña. Esos recorridos no se probaron en este bloque y pueden requerir acceso a Vercel. No se simuló registro dentro de Sites ni se cargaron credenciales. No se hizo push al GitHub de la tesis; el push de este flujo corresponde exclusivamente al repositorio propio de Sites.


## 21/11/2026 — Relato centrado y transiciones

Alcance visual: título y descripción en el centro de la pantalla, personaje que cambia de lugar al avanzar, información y CTA por etapa, desvanecimiento y aparición.

Implementación: `dist/story.css` fija el bloque de texto en el centro del viewport y separa su posición de la ilustración. `dist/story.js` define once posiciones y CTA, desvanece la escena saliente durante 160 ms, actualiza al último paso solicitado tras 180 ms y muestra la siguiente durante 280 ms. Si el usuario desplaza rápido, no queda una cola de escenas atrasadas. La preferencia de movimiento reducido elimina la transición. En anchos móviles la ilustración se coloca debajo del texto para evitar superposición. Se conserva el sprite transparente original, sin fondo, bordes ni numeración.

Verificación realizada: sintaxis JavaScript correcta (`node --check`); Chrome de escritorio, escena inicial centrada, scroll a pasos 3 y 6 con nueva descripción, CTA e imagen, personaje alternando derecha/izquierda; salto al final muestra paso 11; vuelta al inicio muestra paso 1. Captura intermedia confirma desvanecimiento. Reglas móviles revisadas en código; falta revisión visual en dispositivo móvil real. No se probó registro/login remoto ni se modificó la base de datos.

Alcance: esta versión adapta la vista de Sites. La integración de estos cambios al proyecto Next.js de la tesis sigue pendiente de sincronización; no se hizo push a GitHub de la tesis.


## 21/11 — Guías de producto al lado opuesto
- Once SVG originales de interfaz ilustrativa, con datos ficticios coherentes con exampleLeague: cuatro equipos, ocho jugadores, Los Pinos 2-1 Barrio Norte, La Ribera 1-1 El Cruce. No se generaron imágenes con IA ni se presentan como capturas reales.
- Cada escena tiene título y descripción sobre una función, utilidad o problema resuelto. Los enlaces CTA existentes conservan sus destinos.
- Validación: node --check; XML válido en 11/11 SVG; ejecución del controlador en Node VM con DOM simulado, comprobando once escenas, título/descripcion/CTA, imagen correspondiente, posiciones opuestas (suma de coordenadas X = 100), scroll rápido al último paso y movimiento reducido. Todas las comprobaciones pasan.
- Pendiente de revisión visual en navegador: encuadre en escritorio/tablet/móvil real y legibilidad de las miniaturas. SVG e imágenes pueden ampliarse con el zoom del navegador. No se verificó la aplicación externa ni auth.
- Alcance: vista de Sites; Next.js y GitHub de tesis no modificados por esta entrega.


## 21/11 — Retiro de vistas y cierre provisional
Se elimina el bloque product-guide de HTML, sus selectores/preloads/actualización en JS y su CSS. Se retiran once SVG y el generador de guías. Se conservan el sprite transparente original, once escenas, textos explicativos, CTA, menú y desvanecimientos. Se recupera el diseño centrado previo a las guías. Verificación: node --check y comprobación de ausencia de referencias a las guías en HTML/CSS/JS. La revisión visual quedó pendiente. Navarro dio por cerrada esta etapa de la landing.


## 21/11 — Variedad de textos y entradas
Primer título conservado: Tu liga, en un solo lugar. Se usan cuatro composiciones y cinco entradas, con textos de valor de distinta extensión. Verificaciones: node --check aprobado; controlador ejecutado con DOM/reloj/animación simulados en Node VM. Once escenas recorridas; primer título y entrada inicial sin cambios; cuatro layouts/cinco efectos; CTA conservados; escritura termina y se cancela al cambiar de escena; scroll rápido usa último paso; movimiento reducido cancela temporizadores. Las trece animaciones iniciadas durante la prueba quedaron canceladas al cambiar de escena; sin temporizadores pendientes al finalizar.

Límite: quedó pendiente comprobar encuadres, animaciones, tipografía, rendimiento y lectura en dispositivo real. Sitio estático Sites; no cambia GitHub de tesis, Next.js ni Supabase.


## 21/11 — Posiciones y tamaños coordinados
Once composiciones, ocho valores X del texto, nueve valores Y y ocho tamaños del personaje. Prueba Node VM aprobada para sincronización de las once escenas, variables de posición/tamaño y modo de movimiento reducido. Prueba matemática de separación horizontal de los rectángulos de texto e imagen a anchos 960/1280/1440 (altura de referencia 900px); límites laterales del texto comprobados a anchos móviles 360/390/600/800. node --check aprobado.

Quedó pendiente medir el alto real de la tipografía, comprobar posibles superposiciones verticales en móviles y revisar el encuadre y la animación en navegador. No se cambiaron destinos CTA, contenido de producto, acceso de Sites ni GitHub de tesis.


## 21/11 — Elementos señalados y centrado
Se comprueba ausencia en HTML de números del menú, menu-foot y contador, y ausencia de referencias JS al contador eliminado. node --check aprobado. Controlador en Node VM recorre once escenas sin los nodos del contador y comprueba centrado X/Y50% y data-centered en escenas 6/11, incluyendo variables móviles. Sin revisión visual en navegador disponible; pendiente confirmar alto real del texto y encuadre. Se conservan los enlaces y el personaje.


## 21/11 — Modo oscuro y retiro del aviso inferior
Sintaxis JS aprobada. Node VM ejecuta inicializador de tema y controlador con preferencia clara, oscura, inexistente, inválida y almacenamiento bloqueado: alternancia en ambos sentidos, persistencia cuando está disponible, etiquetas aria/title y estado pressed correctos. Ausencia de scroll-hint/caption/footer comprobada y un solo botón de tema. Quedó pendiente revisar contraste, miniaturas y encuadres en navegador. Se mantienen el menú, las once escenas y el personaje transparente.


## 22/11 — Bricolage e Inter
Referencia verificada en CSS publicado de Asteri y correspondencia con título de la captura: .ap-recruit-copy h1. CSS parseado con PostCSS en la copia Next; fuente y pesos declarados, menú ajustado al mayor ancho y títulos sin uppercase forzado. La revisión visual en navegador quedó pendiente. No se modifican datos, Auth ni la lógica de scroll.
