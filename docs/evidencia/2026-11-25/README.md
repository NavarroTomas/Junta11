# Prueba de aceptación de Junta11

Entorno: web pública en Vercel, 25/11/2026. Se utilizó un navegador Chromium con perfiles de escritorio (1280 × 800) y celular (390 × 844). Las peticiones de la aplicación se enviaron a los servicios reales.

| Recorrido | Evidencia |
|---|---|
| Registro: nombre de usuario, propósito, modalidad, nombre de liga, cantidad opcional, formato y colores hasta el formulario de cuenta | [Formulario antes de enviar](01-registro.png) |
| Acceso anónimo a Mis ligas | Redirección a login verificada |
| Liga de ejemplo y navegación por Partidos, Posiciones, Jugadores, Equipos y Noticias | [Portada pública](02-liga-publica.png) |
| Calendario público a 390 px de ancho, sin desbordamiento horizontal del documento | [Calendario móvil](03-calendario-movil.png) |

El flujo público de ejemplo usa los datos de demostración. El alta de correo de prueba se solicitó por la API real de autenticación; respondió HTTP 200 con fecha de envío de confirmación. No se incluyen direcciones de correo, contraseñas ni enlaces de autenticación en la evidencia.
