const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const groups = {
  build: ['scripts/build-browser-platform.cjs', 'scripts/build-worker.cjs'],
  test: [
    'tests/security-regressions.mjs',
    'tests/local-league-regressions.cjs',
    'tests/original-league-adapter.cjs',
    'tests/registration-regressions.cjs',
    'tests/presentation-regressions.cjs',
  ],
};
const files = groups[process.argv[2]];
if (!files) throw new Error('Unknown check');

let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, [path.join(root, file)], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  failed ||= result.status !== 0;
}
process.exitCode = Number(failed);
