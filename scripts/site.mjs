import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAssets, projectRoot, watchAssets } from './assets.mjs';

function terminateTree(child, signal) {
  if (!child?.pid) return;
  try {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      process.kill(-child.pid, signal);
    }
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
}

async function stopChild(child, closed) {
  terminateTree(child, 'SIGTERM');
  let timeout;
  await Promise.race([
    closed,
    new Promise(resolve => { timeout = setTimeout(resolve, 2000); })
  ]);
  clearTimeout(timeout);
  // Also remove descendants when the command exited before its own children.
  terminateTree(child, 'SIGKILL');
}

export async function runSite(mode, {
  root = projectRoot,
  args = [],
  command = 'bundle',
  commandArgs = ['exec', 'jekyll']
} = {}) {
  if (!['build', 'start', 'dev'].includes(mode)) {
    throw new Error('Usage: node scripts/site.mjs <build|start|dev> [Jekyll options]');
  }
  let context;
  let child;
  let closed;
  let requestedExit;
  let signalStop;
  const interrupted = new Promise(resolve => { signalStop = resolve; });
  const requestStop = code => {
    requestedExit ??= code;
    signalStop(requestedExit);
  };
  const onInterrupt = () => requestStop(130);
  const onTerminate = () => requestStop(143);
  process.on('SIGINT', onInterrupt);
  process.on('SIGTERM', onTerminate);

  try {
    if (mode === 'dev') context = await watchAssets({ root });
    else await buildAssets({ root });
    if (requestedExit !== undefined) return requestedExit;

    const jekyllArgs = mode === 'build' ? ['build'] : ['serve', '--host', '127.0.0.1'];
    child = spawn(command, [...commandArgs, ...jekyllArgs, ...args], {
      cwd: root,
      stdio: 'inherit',
      detached: process.platform !== 'win32'
    });
    closed = new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('close', (code, signal) => resolve(code ?? (signal === 'SIGINT' ? 130 : 1)));
    });
    return await Promise.race([closed, interrupted]);
  } finally {
    try {
      if (context) await context.dispose();
      if (child) await stopChild(child, closed.catch(() => {}));
    } finally {
      process.off('SIGINT', onInterrupt);
      process.off('SIGTERM', onTerminate);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = await runSite(process.argv[2], { args: process.argv.slice(3) });
  } catch (error) {
    console.error(error.code === 'ENOENT' ? 'Bundler was not found. Install the Ruby dependencies described in README.md first.' : error.message);
    process.exitCode = 1;
  }
}
