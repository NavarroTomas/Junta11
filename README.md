# Junta11

Junta11 reúne una landing de once escenas y una plataforma para organizar ligas de fútbol amateur. La versión publicada está en https://junta11.vercel.app. La experiencia original de Gestioná tu Liga sigue disponible en `/local`, con sus ligas de prueba, tutorial, datos del navegador y acceso a las pantallas de APA.

## Ejecutar en Windows

Desde la raíz del repositorio, con Node.js 22 o posterior:

```powershell
npm ci
npm run dev
```

Abrí http://localhost:3000. Usá `/demo` para recorrer una liga con datos de ejemplo y `/local/login` para crear y administrar ligas guardadas en el navegador. La portada original está en `/local` y las ligas locales existentes se encuentran en `/local/mis-ligas`.

`npm run dev` compila la plataforma del navegador al iniciar. Para reflejar cambios en `src/platform`, `src/components/platform-v1` o `src/lib/platform` con el servidor encendido, ejecutá `npm run build:browser` y recargá el navegador.

```powershell
npm run typecheck
npm test
npm run build
npm start
```

`npm test` ejecuta las regresiones de seguridad, ligas locales, adaptador APA, registro y presentación. `npm run typecheck:platform` verifica los tipos con los adaptadores de navegador. `npm run test:platform` verifica el Worker de la publicación anterior. Para servir ese Worker localmente, ejecutá `npm run build:platform` seguido de `npm run start:platform`.

## Rutas y datos

- La plataforma publicada usa `/login`, `/registro`, `/crear-liga`, `/recuperar`, `/mis-ligas` y `/panel/:id`. Las ligas públicas conservan `/liga/:slug`, el alias `/l/:slug` y sus fichas.
- La experiencia original conserva `/liga`, `/liga/login`, `/liga/registro`, `/admin` y el resto de sus rutas. Los enlaces anteriores a `/mis-ligas/:leagueId` siguen abriendo la liga local.
- La plataforma publicada se conecta al proyecto de Supabase declarado en `src/platform/public-config.json`. El archivo contiene la URL y la clave pública del navegador. Las operaciones con una sesión real modifican esa base. Las credenciales y variables del código de servidor se configuran aparte.
- Los retornos de registro y recuperación usan el origen desde el que se abrió la plataforma. Para probar esos correos en localhost, ese origen debe estar autorizado en Supabase Auth. La migración incremental está en `supabase/migrations`.
- La app móvil sigue pausada.

Consultá [QA vigente](docs/QA-current.md), [historial de publicación](docs/published-release-history.md) y [demo local sobre APA](docs/local-league-demo.md).

## Vercel

Configurá **Root Directory** en la raíz del repositorio, **Framework Preset** en Next.js y dejá **Output Directory** con el valor predeterminado del framework. [Configuración de Vercel](https://vercel.com/docs/builds/configure-a-build).

El `vercel.json` de la raíz usa `npm run build`, que genera el bundle del navegador antes de compilar Next. `next.config.ts` conserva las rutas públicas de Junta11 y aplica los encabezados de seguridad para ambas experiencias.

[Documentación de Next.js](https://nextjs.org/docs) · [Tutorial de Next.js](https://nextjs.org/learn)
