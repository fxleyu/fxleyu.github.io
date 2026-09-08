import * as esbuild from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const entries = [
  'assets/css/site.css',
  'assets/js/site.js',
  'assets/js/archive.js',
  'assets/js/snackbar.js',
  'assets/js/sw-registration.js'
];

function options(root) {
  return {
    absWorkingDir: root,
    entryPoints: entries,
    outdir: 'assets/dist',
    entryNames: '[name].min',
    bundle: true,
    format: 'iife',
    minify: true,
    charset: 'utf8',
    legalComments: 'inline',
    target: ['es2020', 'chrome90', 'firefox90', 'safari15'],
    write: false,
    logLevel: 'warning'
  };
}

async function differs(output) {
  try {
    return !(await readFile(output.path)).equals(output.contents);
  } catch (error) {
    if (error.code === 'ENOENT') return true;
    throw error;
  }
}

async function publish(outputs, check = false) {
  const changed = [];
  for (const output of outputs) {
    if (!(await differs(output))) continue;
    changed.push(output.path);
    if (!check) {
      await mkdir(path.dirname(output.path), { recursive: true });
      await writeFile(output.path, output.contents);
    }
  }
  if (check && changed.length) {
    throw new Error(`Generated assets are missing or outdated: ${changed.map(file => path.basename(file)).join(', ')}. Run npm run build:assets.`);
  }
  return changed;
}

export async function buildAssets({ root = projectRoot, check = false } = {}) {
  const result = await esbuild.build(options(root));
  const changed = await publish(result.outputFiles, check);
  return { files: result.outputFiles.map(file => file.path), changed };
}

export async function watchAssets({ root = projectRoot, onBuild = () => {} } = {}) {
  const context = await esbuild.context({
    ...options(root),
    plugins: [{
      name: 'publish-changed-assets',
      setup(build) {
        build.onEnd(async result => {
          if (result.errors.length) return;
          const changed = await publish(result.outputFiles);
          onBuild(changed);
        });
      }
    }]
  });
  try {
    await context.rebuild();
    await context.watch();
    return context;
  } catch (error) {
    await context.dispose();
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arguments_ = process.argv.slice(2);
  if (arguments_.some(argument => argument !== '--check')) {
    console.error('Usage: node scripts/assets.mjs [--check]');
    process.exitCode = 2;
  } else {
    try {
      const result = await buildAssets({ check: arguments_.includes('--check') });
      console.log(`Assets ${arguments_.includes('--check') ? 'verified' : 'built'}: ${result.files.length} files, ${result.changed.length} changed.`);
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
