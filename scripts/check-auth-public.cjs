/** Read-only checks. Never creates users, sends mail or consumes real tokens. */
const assert = require('node:assert/strict');
const path = require('node:path');
const config = require(path.join(__dirname, '../src/platform/public-config.json'));
const origin = 'https://junta11.vercel.app';
const api = config.NEXT_PUBLIC_SUPABASE_URL + '/auth/v1';
async function check() {
  const response = await fetch(api + '/settings', {
    headers: { apikey: config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
    signal: AbortSignal.timeout(20000),
  });
  assert.equal(response.status, 200, 'Auth settings must be reachable');
  const settings = await response.json();
  assert.equal(settings.disable_signup, false, 'Signup must be enabled');
  assert.equal(settings.external.email, true, 'Email login must be enabled');
  assert.equal(settings.mailer_autoconfirm, false, 'Email confirmation must remain required');
  console.log('PASS public Auth settings: signup/email enabled, confirmation required');
  for (const [type, route] of [['signup', '/crear-liga'], ['recovery', '/recuperar']]) {
    const query = new URLSearchParams({ type, token: 'qa-invalid-token-not-a-user', redirect_to: origin + route });
    const result = await fetch(api + '/verify?' + query, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
    assert.equal(result.status, 303, 'Invalid-token verification must redirect');
    const location = new URL(result.headers.get('location'));
    assert.equal(location.origin, origin, type + ' must return to Junta11');
    assert.equal(location.pathname, route, type + ' must preserve the intended route');
    assert.ok(location.hash.includes('error=') || location.searchParams.has('error'), 'Invalid tokens must not authenticate');
    console.log('PASS ' + type + ' redirect: ' + location.origin + location.pathname + ' (invalid token rejected)');
  }
  console.log('NOT VERIFIED: delivery, resend, real expiry, password changes, authenticated CRUD or concurrent sessions');
}
check().catch(error => { console.error(error.message); process.exitCode = 1; });
