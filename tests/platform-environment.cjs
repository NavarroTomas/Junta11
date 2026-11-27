const assert = require('node:assert/strict');
const { platformEnvironment } = require('../scripts/platform-environment.cjs');
const prod = platformEnvironment({ VERCEL_ENV: 'production' });
const preview = {
  VERCEL_ENV: 'preview',
  JUNTA11_TEST_SUPABASE_URL: 'https://testing.supabase.co',
  JUNTA11_TEST_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fixture',
};
assert.equal(platformEnvironment({}).NEXT_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:54321');
assert.equal(platformEnvironment(preview).NEXT_PUBLIC_SUPABASE_URL, preview.JUNTA11_TEST_SUPABASE_URL);
assert.throws(() => platformEnvironment({ VERCEL_ENV: 'preview', JUNTA11_ENV: 'production' }));
assert.throws(() => platformEnvironment({ ...preview, JUNTA11_TEST_SUPABASE_URL: prod.NEXT_PUBLIC_SUPABASE_URL }));
assert.throws(() => platformEnvironment({ ...preview, NEXT_PUBLIC_SUPABASE_URL: prod.NEXT_PUBLIC_SUPABASE_URL }));
assert.throws(() => platformEnvironment({ ...preview, JUNTA11_TEST_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_fixture' }));
console.log('PASS isolated preview configuration');
