import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import vm from 'node:vm';
import { buildAssets, watchAssets } from './assets.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'fxleyu-build-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'assets/css'), { recursive: true });
  await mkdir(path.join(root, 'assets/js'), { recursive: true });
  await writeFile(path.join(root, 'assets/css/site.css'), '@import "./reading.css";\nbody { color: #123456; }\n');
  await writeFile(path.join(root, 'assets/css/reading.css'), '.reading-column { max-width: 700px; }\n');
  for (const name of ['site', 'archive', 'sw-registration']) {
    await writeFile(path.join(root, `assets/js/${name}.js`), `window.${name.replace('-', '_')} = true;\n`);
  }
  await writeFile(path.join(root, 'assets/js/snackbar.js'), 'window.createSnackbar = function (message) { return message; };\n');
  return root;
}

async function until(predicate, message) {
  const end = Date.now() + 6000;
  while (Date.now() < end) {
    if (await predicate()) return;
    await delay(40);
  }
  assert.fail(message);
}

function isAlive(pid) {
  try { process.kill(pid, 0); return true; }
  catch (error) { if (error.code === 'ESRCH') return false; throw error; }
}

test('build emits five browser assets, preserves globals and avoids unchanged writes', async t => {
  const root = await fixture(t);
  const first = await buildAssets({ root });
  assert.equal(first.changed.length, 5);
  assert.deepEqual(first.files.map(file => path.basename(file)).sort(), [
    'archive.min.js', 'site.min.css', 'site.min.js', 'snackbar.min.js', 'sw-registration.min.js'
  ]);
  const before = await Promise.all(first.files.map(file => stat(file).then(info => info.mtimeMs)));
  assert.equal((await buildAssets({ root })).changed.length, 0);
  const after = await Promise.all(first.files.map(file => stat(file).then(info => info.mtimeMs)));
  assert.deepEqual(after, before);
  await buildAssets({ root, check: true });
  const stylesheet = await readFile(path.join(root, 'assets/dist/site.min.css'), 'utf8');
  assert.match(stylesheet, /\.reading-column\{max-width:700px\}/);
  assert.doesNotMatch(stylesheet, /@import/);
  const browser = { window: {} };
  vm.runInNewContext(await readFile(path.join(root, 'assets/dist/snackbar.min.js'), 'utf8'), browser);
  assert.equal(browser.window.createSnackbar('hello'), 'hello');
});

test('check reports stale artifacts and a syntax error leaves existing outputs intact', async t => {
  const root = await fixture(t);
  await buildAssets({ root });
  const output = path.join(root, 'assets/dist/site.min.js');
  const previous = await readFile(output);
  await writeFile(path.join(root, 'assets/js/site.js'), 'window.site = false;');
  await assert.rejects(buildAssets({ root, check: true }), /outdated/);
  assert.deepEqual(await readFile(output), previous);
  await writeFile(path.join(root, 'assets/js/site.js'), 'function {');
  await assert.rejects(buildAssets({ root }), /Build failed/);
  assert.deepEqual(await readFile(output), previous);
});

test('watch rebuilds a source edit without watching its own generated output', async t => {
  const root = await fixture(t);
  let builds = 0;
  const context = await watchAssets({ root, onBuild: () => { builds++; } });
  t.after(() => context.dispose());
  await delay(400);
  const settled = builds;
  const generated = path.join(root, 'assets/dist/site.min.js');
  await writeFile(generated, '// edited output\n');
  await delay(400);
  assert.equal(builds, settled, 'generated output must not be a watch input');
  await writeFile(path.join(root, 'assets/js/site.js'), 'window.site = "updated";');
  await until(async () => (await readFile(generated, 'utf8')).includes('updated'), 'source edit did not rebuild');
  const updated = builds;
  await delay(400);
  assert.equal(builds, updated, 'rebuilding the output must not trigger a loop');
  await writeFile(path.join(root, 'assets/css/reading.css'), '.reading-column { max-width: 740px; }');
  const stylesheet = path.join(root, 'assets/dist/site.min.css');
  await until(async () => (await readFile(stylesheet, 'utf8')).includes('740px'), 'imported CSS edit did not rebuild');
});

test('dev forwards termination to the Jekyll process tree and exits cleanly', { timeout: 12000 }, async t => {
  if (process.platform === 'win32') return t.skip('process group assertions apply to macOS and Linux');
  const root = await fixture(t);
  const fake = path.join(root, 'fake-jekyll.mjs');
  const launcher = path.join(root, 'launcher.mjs');
  const pids = path.join(root, 'pids.json');
  await writeFile(fake, `import { spawn } from 'node:child_process';\nimport { writeFileSync } from 'node:fs';\nconst child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });\nwriteFileSync(${JSON.stringify(pids)}, JSON.stringify([process.pid, child.pid]));\nsetInterval(() => {}, 1000);\n`);
  await writeFile(launcher, `import { runSite } from ${JSON.stringify(new URL('./site.mjs', import.meta.url).href)};\nprocess.exitCode = await runSite('dev', { root: ${JSON.stringify(root)}, command: process.execPath, commandArgs: [${JSON.stringify(fake)}] });\n`);
  const parent = spawn(process.execPath, [launcher], { stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  parent.stdout.on('data', chunk => { logs += chunk; });
  parent.stderr.on('data', chunk => { logs += chunk; });
  const exited = new Promise(resolve => parent.once('exit', (code, signal) => resolve({ code, signal })));
  let descendants = [];
  t.after(() => {
    parent.kill('SIGKILL');
    for (const pid of descendants) {
      try { process.kill(pid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
    }
  });
  await until(async () => {
    try { descendants = JSON.parse(await readFile(pids, 'utf8')); return true; }
    catch (error) { if (error.code === 'ENOENT') return false; throw error; }
  }, `dev did not launch the child: ${logs}`);
  assert.ok(descendants.every(isAlive));
  parent.kill('SIGTERM');
  const result = await exited;
  assert.deepEqual(result, { code: 143, signal: null });
  await until(() => descendants.every(pid => !isAlive(pid)), 'dev left a child process running');
});
