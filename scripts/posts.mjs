import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const outputDirectory = 'assets/posts';
// Historical image URLs remain available for saved articles and RSS readers.
const legacyImages = {
  'img/2019-05/Thread_State.jpg': '2017/2017-01-11-explore-java-concurrency/images/Thread_State.jpg',
  'img/2019-05/AQS_field.jpg': '2019/2019-05-12-AQS-and-synchronization-aids/images/AQS_field.jpg',
  'img/2019-05/AQS_struct.jpg': '2019/2019-05-12-AQS-and-synchronization-aids/images/AQS_struct.jpg',
  'img/2020-05/ca.png': '2020/2020-05-16-learn-clean-architecture/images/ca.png'
};

async function filesIn(directory) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith('.')) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(target));
    else if (entry.isFile()) files.push(target);
  }
  return files;
}

async function sameBytes(file, content) {
  try { return (await readFile(file)).equals(content); }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

export async function buildPostAssets({ root = projectRoot, check = false } = {}) {
  const sourceDirectory = path.join(root, '_posts');
  const sources = new Map();
  for (const file of await filesIn(sourceDirectory)) {
    const relative = path.relative(sourceDirectory, file).split(path.sep).join('/');
    if (/^\d{4}\/[^/]+\/images\/.+/.test(relative)) sources.set(relative, await readFile(file));
  }
  const expected = new Map([...sources].map(([name, bytes]) => [path.join(root, outputDirectory, name), bytes]));
  for (const [legacy, source] of Object.entries(legacyImages)) {
    if (sources.has(source)) expected.set(path.join(root, legacy), sources.get(source));
  }
  const existing = await filesIn(path.join(root, outputDirectory));
  for (const legacy of Object.keys(legacyImages)) {
    const file = path.join(root, legacy);
    try { await readFile(file); existing.push(file); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  const removed = existing.filter(file => !expected.has(file));
  const changed = [];
  for (const [file, bytes] of expected) if (!await sameBytes(file, bytes)) changed.push(file);
  if (check && (changed.length || removed.length)) {
    throw new Error('Generated post images are missing or outdated. Run npm run build:posts.');
  }
  if (!check) {
    for (const file of changed) {
      await mkdir(path.dirname(file), { recursive: true });
      const temporary = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.tmp`);
      await writeFile(temporary, expected.get(file));
      await rename(temporary, file);
    }
    for (const file of removed) await rm(file);
  }
  return { files: [...expected.keys()], changed, removed };
}

export async function watchPostAssets({ root = projectRoot, onError = error => console.error(error.message) } = {}) {
  await buildPostAssets({ root });
  let pending = Promise.resolve();
  let running = false;
  // Polling also detects new year/bundle directories on platforms where native
  // recursive file watchers may miss a newly-created nested directory.
  const timer = setInterval(() => {
    if (running) return;
    running = true;
    pending = buildPostAssets({ root }).catch(onError).finally(() => { running = false; });
  }, 750);
  return {
    async dispose() {
      clearInterval(timer);
      await pending;
    }
  };
}

export async function createPost({ root = projectRoot, slug, title, date = new Date().toLocaleDateString('en-CA') }) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) throw new Error('Use a lowercase slug such as learning-java.');
  if (!title?.trim()) throw new Error('An article title is required.');
  const parsedDate = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== date) {
    throw new Error('Use a valid publication date in YYYY-MM-DD format.');
  }
  const year = path.join(root, '_posts', date.slice(0, 4));
  const bundle = path.join(year, `${date}-${slug}`);
  await mkdir(year, { recursive: true });
  // A bundle may contain only one post; never overwrite existing writing.
  await mkdir(bundle);
  await mkdir(path.join(bundle, 'images'));
  await writeFile(path.join(bundle, 'images', '.gitkeep'), '');
  const file = path.join(bundle, `${date}-${slug}.md`);
  // Match existing front matter: Jekyll applies the site's configured timezone.
  await writeFile(file, `---\nlayout: post\ntitle: ${JSON.stringify(title.trim())}\ndate: ${date} 00:00:00\ntags: []\n---\n\n`);
  return file;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args[0] === 'new' && args.length >= 3 && args.length <= 4) {
      console.log(await createPost({ slug: args[1], title: args[2], date: args[3] }));
    } else if (args.length === 0 || (args.length === 1 && args[0] === '--check')) {
      const result = await buildPostAssets({ check: args.includes('--check') });
      console.log(`Post images ${args.includes('--check') ? 'verified' : 'built'}: ${result.files.length} files, ${result.changed.length} changed, ${result.removed.length} removed.`);
    } else {
      throw new Error('Usage: node scripts/posts.mjs [--check] | new <slug> <title> [YYYY-MM-DD]');
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
