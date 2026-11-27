# Privacidad de ligas y baja de accesos

La preview de Vercel usa las variables JUNTA11_TEST_SUPABASE_URL y JUNTA11_TEST_SUPABASE_PUBLISHABLE_KEY. Usar un proyecto independiente con el esquema del núcleo de Junta11 y datos ficticios. Si el legado necesita NEXT_PUBLIC_SUPABASE_URL en la preview, debe ser la misma URL de pruebas. El build local sin configuración permite el modo demo y apunta a loopback. Vercel selecciona producción mediante VERCEL_ENV.

En Flutter, usar las mismas variables con --dart-define en flutter run. El modo predeterminado es test. Para una compilación explícita del entorno real, usar --dart-define=JUNTA11_ENV=production.

## Ensayo en preview

1. Inventariar y respaldar el esquema, las referencias de imágenes y los objetos. Verificar que el bucket league-images y las políticas existentes de carga y descarga por administrador estén presentes. La migración usa la función de Storage allow_only_operation.
2. Aplicar 20261126190000_league_privacy.sql en una transacción y desplegar el cliente compatible en la preview. La migración cambia las referencias de imágenes subidas y la visibilidad del bucket. Mantiene el valor de visibilidad de las ligas existentes. Una referencia antigua de formato inesperado interrumpe la migración para su revisión.
3. Crear una liga, dos titulares de ligas distintas y un administrador de prueba. Probar publicación, lectura en incógnito, borradores, carga de una imagen nueva, retirada de publicación y revocación con el panel abierto. Repetir una descarga nueva del archivo con la URL pública anterior desde un navegador limpio. Verificar caché del CDN y enlaces firmados previos antes de considerar cerrada la retirada. Las copias ya descargadas quedan fuera del control de acceso.
4. Construir Flutter para el proyecto de prueba y verificar que el resultado cargado en la preview solo aparece en ese entorno.

Para producción, coordinar el cambio de cliente y base en la misma ventana, suspender temporalmente escrituras de imágenes desde clientes antiguos y volver a cargar los paneles al finalizar. Si falla la aplicación después de la migración, mantener los archivos privados y recuperar el cliente compatible. Evitar una reversión que publique todo el bucket.

## Regresiones

El workflow Quality reproduce la migración en una base desechable con los scripts de tests/league-privacy. La prueba modela los roles y el contexto de operación de Storage. La aceptación HTTP, la caché y el dispositivo físico requieren la preview.
