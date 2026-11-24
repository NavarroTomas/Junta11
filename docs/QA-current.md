# Junta11 — aceptación del circuito de acceso

Evidencia reunida el 23/11/2026 UTC. Código publicado revisado: 27d56696acdf11edbe46245dd7aaceb6b1970474. Producción: https://junta11.vercel.app. Este informe distingue observación técnica y confirmación de Navarro.

## Comprobado

- Supabase ilkkqynzvwskpwjgtapi está ACTIVE_HEALTHY.
- Auth público responde 200: registro y correo habilitados, confirmación obligatoria.
- Verificación con tokens ficticios inválidos devuelve 303 hacia /crear-liga y /recuperar en junta11.vercel.app. No se usaron tokens de usuarios ni se enviaron correos en esta prueba.
- Navarro confirmó que recibió el correo de registro y pudo ingresar. No se solicitó su contraseña.
- Navegador publicado: nombre de usuario, propósito, modalidad, nombre de liga, cantidad opcional, formato, colores y datos de cuenta. Se llegó al resumen sin enviar el formulario de alta.
- La cantidad puede quedar Sin definir mediante Definir después.
- El ojo alterna Mostrar/Ocultar contraseña sin enviar el formulario.
- Recargar /registro con el borrador completo vuelve al nombre de usuario; no salta las preguntas.
- /mis-ligas sin sesión vuelve a /login.
- Recuperación desde login muestra el formulario de correo; /recuperar sin sesión ofrece Pedir enlace y no permite cambiar contraseña.
- TypeScript estricto, registration-regressions.cjs y presentation-regressions.cjs pasaron. Incluyen creación progresiva, resultados históricos de retirados y fichas públicas.
- Las diez tablas del esquema public tienen RLS habilitado. Esto no acredita por sí solo autorización correcta para cada operación.

## Pendiente de aceptación

- Correo de recuperación real, cambio de contraseña por el usuario y posterior ingreso.
- Reenvío de confirmación y enlace realmente vencido. La verificación con token inválido no acredita vencimiento real ni el mensaje mostrado por la web.
- Recorrido CRUD con sesión real, otra cuenta y dos sesiones simultáneas.
- Auditoría final de políticas/RPC/Storage, teclado y encuadre en celular real.

## GitHub

Al momento de la verificación, el repositorio NavarroTomas/Junta11 se podía leer y main estaba en 4c426d8ee237cdd11ac7c366d097ebcdf84f46df, anterior a la web publicada.

La integración de GitHub rechazó con HTTP 403 (Resource not accessible by integration) la creación de sync/junta11-published-web. La sesión correspondía a NavarroTomas, pero la integración solo enumeró la instalación de MonzonSantiago y no ofreció instalaciones administrables. La rama no se creó y el código no se subió.

## Continuación

1. Cerrar recuperación real y CRUD autenticado.
2. Responsive, accesibilidad y auditoría de permisos.
3. Dataset ficticio identificado, manual y documentación para entrega.
4. App móvil pausada por decisión de Navarro.

## Repetir verificaciones

`node scripts/check-auth-public.cjs` comprueba configuración y destinos usando exclusivamente tokens ficticios inválidos. No envía correos.

Desde la raíz, ejecutá `npm run typecheck:platform` y `npm test`. Las instrucciones de instalación y Vercel están en [README.md](../README.md).
