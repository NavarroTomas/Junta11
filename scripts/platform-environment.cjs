const production = require('../src/platform/public-config.json');

function platformEnvironment(env = process.env) {
  // On Vercel only the platform's environment classification is authoritative.
  const target = env.VERCEL_ENV || env.JUNTA11_ENV || 'development';
  if (target === 'production') return production;
  const url = env.JUNTA11_TEST_SUPABASE_URL;
  const key = env.JUNTA11_TEST_SUPABASE_PUBLISHABLE_KEY;
  if (!url && !key && target === 'development') {
    // Local builds without a backend can still render the offline demo.
    return { NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_local_unconfigured' };
  }
  if (!url || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key || '')) {
    throw new Error('Configurá el proyecto Supabase de pruebas y su clave publicable.');
  }
  const origin = new URL(url);
  if (!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(origin.origin) ||
      origin.href !== origin.origin + '/' || origin.origin === production.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('La URL de pruebas debe pertenecer a otro proyecto de Supabase.');
  }
  if (target === 'preview' && env.NEXT_PUBLIC_SUPABASE_URL &&
      env.NEXT_PUBLIC_SUPABASE_URL !== origin.origin) {
    throw new Error('El cliente legado de preview apunta a un proyecto diferente del entorno de prueba.');
  }
  return { NEXT_PUBLIC_SUPABASE_URL: origin.origin, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key };
}
module.exports = { platformEnvironment };
