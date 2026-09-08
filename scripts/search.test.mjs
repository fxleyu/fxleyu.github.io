import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// Load the browser's ES module without changing the site's package-wide module type.
const source = await readFile(new URL('../assets/js/search.js', import.meta.url), 'utf8');
const { searchPosts, searchExcerpt, highlightedParts, setupSearch } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

const posts = [
    { title: '学习并发', tags: 'Java', content: '线程共享变量需要考虑缓存的一致性。', url: '/blog/concurrency/', date: '2020-01-01' },
    { title: '数据访问', tags: '缓存, Java', content: '数据访问层。', url: '/blog/data/', date: '2019-01-01' },
    { title: '缓存', tags: '系统', content: 'Java 服务中的缓存。', url: '/blog/cache/', date: '2018-01-01' }
];

test('full-text hits rank behind title and tags, with case-insensitive multiword matching', () => {
    assert.deepEqual(searchPosts(posts, '缓存').map(post => post.title), ['缓存', '数据访问', '学习并发']);
    assert.equal(searchPosts(posts, '缓存 JAVA').length, 3);
    assert.equal(searchPosts(posts, '缓存 未知').length, 0);
    assert.equal(searchPosts(posts, '2020')[0].title, '学习并发');
    assert.deepEqual(searchPosts(posts, '  '), []);
});

test('body-only hits include nearby context and literal query highlighting preserves source text', () => {
    const post = { summary: '并发技术笔记', content: '背景介绍。'.repeat(100) + '缓存一致性决定了线程如何读取数据。' + '补充说明。'.repeat(100) };
    const excerpt = searchExcerpt(post, '缓存');
    assert.match(excerpt, /缓存一致性决定了线程如何读取数据/);
    assert.ok(excerpt.length <= 152);
    assert.ok(excerpt.startsWith('…') && excerpt.endsWith('…'));
    const hostileText = '<img src=x onerror=alert(1)> A+B 与 C++';
    const parts = highlightedParts(hostileText, 'a+b c++ <img');
    assert.equal(parts.map(part => part.text).join(''), hostileText);
    assert.deepEqual(parts.filter(part => part.match).map(part => part.text), ['<img', 'A+B', 'C++']);
});

class Element {
    constructor(tag = 'div') { this.tagName = tag; this.children = []; this.events = {}; this.attributes = {}; this.value = ''; this.hidden = false; }
    appendChild(child) { if (child.tagName === '#fragment') this.children.push(...child.children); else this.children.push(child); }
    replaceChildren(...children) { this.children = children; this.valueText = ''; }
    set textContent(value) { this.children = []; this.valueText = value; }
    get textContent() { return (this.valueText || '') + this.children.map(child => child.textContent).join(''); }
    set innerHTML(_) { throw new Error('Search must not interpret HTML from the index'); }
    setAttribute(name, value) { this.attributes[name] = value; }
    getAttribute(name) { return this.attributes[name]; }
    removeAttribute(name) { delete this.attributes[name]; }
    addEventListener(name, callback) { (this.events[name] ||= []).push(callback); }
    fire(name, event = {}) { for (const callback of this.events[name] || []) callback({ preventDefault() {}, ...event }); }
}

function browserFixture(t, fetchIndex, query = '') {
    const original = { document: globalThis.document, window: globalThis.window, fetch: globalThis.fetch };
    t.after(() => { for (const [key, value] of Object.entries(original)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } });
    const ids = Object.fromEntries(['site-search', 'search-input', 'search-results', 'search-status', 'search-discovery'].map(id => [id, new Element()]));
    const form = new Element('form');
    ids['site-search'].querySelector = () => form;
    ids['site-search'].setAttribute('data-search-index', '/blog/search.json');
    const window = new Element();
    window.location = new URL('https://example.org/blog/search/' + query);
    const history = [];
    window.history = { replaceState(_state, _title, url) { history.push(String(url)); window.location = new URL(url); } };
    globalThis.document = {
        getElementById: id => ids[id],
        createElement: tag => new Element(tag),
        createTextNode(text) { const node = new Element('#text'); node.textContent = text; return node; },
        createDocumentFragment: () => new Element('#fragment')
    };
    globalThis.window = window;
    globalThis.fetch = fetchIndex;
    setupSearch();
    return { ids, form, history, window };
}

const settle = () => new Promise(resolve => setImmediate(resolve));
const response = data => ({ ok: true, json: async () => data });

test('IME, concurrent index loading, clearing and browser history restore the current query', async t => {
    let resolveIndex;
    const calls = [];
    const fixture = browserFixture(t, url => { calls.push(url); return new Promise(resolve => { resolveIndex = resolve; }); });
    const input = fixture.ids['search-input'];
    input.fire('compositionstart');
    input.value = '缓存';
    input.fire('input', { isComposing: true });
    assert.equal(calls.length, 0);
    assert.equal(fixture.history.length, 0);
    input.fire('compositionend');
    assert.deepEqual(calls, ['/blog/search.json']);
    input.value = 'Java';
    input.fire('input');
    assert.equal(calls.length, 1);
    input.value = '';
    input.fire('input');
    resolveIndex(response(posts));
    await settle();
    assert.equal(fixture.ids['search-results'].children.length, 0);
    assert.equal(fixture.ids['search-discovery'].hidden, false);
    assert.match(fixture.ids['search-status'].textContent, /输入关键词/);
    fixture.window.location = new URL('https://example.org/blog/search/?q=缓存');
    fixture.window.fire('popstate');
    assert.equal(input.value, '缓存');
    assert.equal(fixture.ids['search-results'].children.length, 3);
    assert.match(fixture.ids['search-results'].textContent, /缓存的一致性/);
    assert.equal(calls.length, 1);
});

test('failed index requests can retry; results are capped and unsafe destinations are omitted', async t => {
    let attempts = 0;
    const fixture = browserFixture(t, async () => {
        if (++attempts === 1) throw new Error('offline');
        return response([
            ...Array.from({ length: 51 }, (_, index) => ({ title: '缓存 <img onerror=alert(1)> ' + index, url: '/blog/' + index + '/' })),
            { title: '缓存脚本', url: 'javascript:alert(1)' },
            { title: '缓存站外', url: '//elsewhere.example/' }
        ]);
    }, '?q=缓存');
    await settle();
    assert.match(fixture.ids['search-status'].textContent, /重试/);
    fixture.form.fire('submit');
    await settle();
    assert.equal(attempts, 2);
    assert.match(fixture.ids['search-status'].textContent, /找到 51 篇文章/);
    assert.equal(fixture.ids['search-results'].children.length, 50);
    assert.match(fixture.ids['search-results'].textContent, /<img onerror=alert\(1\)>/);
    assert.equal(fixture.ids['search-discovery'].hidden, true);
    const titleLink = fixture.ids['search-results'].children[0].children[0].children[0];
    assert.equal(titleLink.children[0].tagName, 'mark');
    assert.equal(titleLink.children[0].textContent, '缓存');
    assert.equal(titleLink.children[1].tagName, '#text');
    fixture.ids['search-input'].value = '没有这样的词';
    fixture.ids['search-input'].fire('input');
    assert.equal(fixture.ids['search-discovery'].hidden, false);
});
