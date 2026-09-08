import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { buildPostAssets, createPost, watchPostAssets } from './posts.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'fxleyu-post-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, '_posts'), { recursive: true });
  return root;
}

async function until(predicate, message) {
  const end = Date.now() + 5000;
  while (Date.now() < end) {
    try { if (await predicate()) return; }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    await delay(40);
  }
  assert.fail(message);
}

test('post assets preserve bytes and legacy URLs, detect drift, and remove only generated images', async t => {
  const root = await fixture(t);
  const relative = '2017/2017-01-11-explore-java-concurrency/images/Thread_State.jpg';
  const source = path.join(root, '_posts', relative);
  const output = path.join(root, 'assets/posts', relative);
  const legacy = path.join(root, 'img/2019-05/Thread_State.jpg');
  await mkdir(path.dirname(source), { recursive: true });
  await writeFile(source, Buffer.from([0, 1, 128, 255]));
  await writeFile(path.join(path.dirname(source), '.gitkeep'), '');
  await writeFile(path.join(path.dirname(source), '../2017-01-11-explore-java-concurrency.md'), 'private Markdown source');
  const first = await buildPostAssets({ root });
  assert.equal(first.files.length, 2);
  assert.deepEqual(await readFile(output), await readFile(source));
  assert.deepEqual(await readFile(legacy), await readFile(source));
  const originalMtime = (await stat(output)).mtimeMs;
  await buildPostAssets({ root });
  assert.equal((await stat(output)).mtimeMs, originalMtime);
  await writeFile(source, 'revised image');
  await assert.rejects(buildPostAssets({ root, check: true }), /outdated/);
  assert.notEqual(await readFile(output, 'utf8'), 'revised image', 'check must not write files');
  await buildPostAssets({ root });
  assert.equal(await readFile(legacy, 'utf8'), 'revised image');
  const avatar = path.join(root, 'img/avatar.png');
  await writeFile(avatar, 'shared avatar');
  await rm(source);
  await assert.rejects(buildPostAssets({ root, check: true }), /outdated/);
  assert.equal((await buildPostAssets({ root })).removed.length, 2);
  await assert.rejects(readFile(output), { code: 'ENOENT' });
  assert.equal(await readFile(avatar, 'utf8'), 'shared avatar');
  await buildPostAssets({ root, check: true });
});

test('watch syncs new nested images, edits and deletions, then stops cleanly', async t => {
  const root = await fixture(t);
  const errors = [];
  const context = await watchPostAssets({ root, onError: error => errors.push(error) });
  t.after(() => context.dispose());
  const source = path.join(root, '_posts/2026/2026-09-08-new-article/images/diagram.png');
  const output = path.join(root, 'assets/posts/2026/2026-09-08-new-article/images/diagram.png');
  await mkdir(path.dirname(source), { recursive: true });
  await writeFile(source, 'first image');
  await until(async () => (await readFile(output, 'utf8')) === 'first image', 'new image was not published');
  await writeFile(source, 'updated image');
  await until(async () => (await readFile(output, 'utf8')) === 'updated image', 'image edit was not published');
  await rm(source);
  await until(async () => {
    try { await stat(output); return false; }
    catch (error) { if (error.code === 'ENOENT') return true; throw error; }
  }, 'deleted image was not removed');
  await context.dispose();
  await writeFile(source, 'after disposal');
  await delay(250);
  await assert.rejects(readFile(output), { code: 'ENOENT' });
  assert.deepEqual(errors, []);
});

test('new posts use year bundles, validate dates and preserve existing writing', async t => {
  const root = await fixture(t);
  const file = await createPost({ root, slug: 'learning-java', title: 'Java: "记录"', date: '2026-09-08' });
  assert.equal(path.relative(root, file), '_posts/2026/2026-09-08-learning-java/2026-09-08-learning-java.md');
  assert.match(await readFile(file, 'utf8'), /title: "Java: \\"记录\\""/);
  assert.match(await readFile(file, 'utf8'), /^date: 2026-09-08 00:00:00$/m);
  assert.ok((await stat(path.join(path.dirname(file), 'images'))).isDirectory());
  await writeFile(file, 'writing in progress');
  await assert.rejects(createPost({ root, slug: 'learning-java', title: 'Again', date: '2026-09-08' }), { code: 'EEXIST' });
  assert.equal(await readFile(file, 'utf8'), 'writing in progress');
  await assert.rejects(createPost({ root, slug: 'bad-date', title: 'Invalid', date: '2026-02-30' }), /valid publication date/);
  await assert.rejects(createPost({ root, slug: '../escape', title: 'Invalid' }), /lowercase slug/);
});
