import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../assets/js/reading.js', import.meta.url), 'utf8');
const { setupReading } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

class Element {
    constructor(tag = 'div', text = '') {
        this.tagName = tag.toUpperCase();
        this.textContent = text;
        this.children = [];
        this.attributes = {};
        this.dataset = {};
        const classes = new Set();
        this.classList = {
            toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); },
            contains(name) { return classes.has(name); }
        };
    }
    append(child) { this.children.push(child); }
    replaceChildren(...children) { this.children = children; }
    setAttribute(name, value) { this.attributes[name] = value; }
    getAttribute(name) { return this.attributes[name]; }
    removeAttribute(name) { delete this.attributes[name]; }
    querySelectorAll() { return []; }
    querySelector() { return null; }
    closest() { return null; }
    cloneNode() { return new Element(this.tagName, this.textContent); }
    getBoundingClientRect() { return { top: 120, height: 60 }; }
}

function fixture(t, entries, { catalog = true, wide = true } = {}) {
    const originals = { document: globalThis.document, window: globalThis.window };
    t.after(() => {
        for (const [key, value] of Object.entries(originals)) {
            if (value === undefined) delete globalThis[key];
            else globalThis[key] = value;
        }
    });
    const container = new Element();
    const reader = new Element();
    const grid = new Element();
    const aside = new Element('aside');
    const list = new Element('ul');
    const details = new Element('details');
    const headings = entries.map(([text, id]) => Object.assign(new Element('h2', text), { id }));
    container.querySelectorAll = selector => selector.startsWith('h1[id]') ? headings : [];
    container.closest = selector => selector === '.apple-reader' ? reader : selector === '.apple-reading-grid' ? grid : null;
    list.closest = () => aside;
    const media = { matches: wide, addEventListener(_event, callback) { this.change = callback; } };
    globalThis.document = {
        body: new Element('body'),
        querySelector: selector => selector === '.article-heading h1' ? new Element('h1', '文章标题') : null,
        querySelectorAll: selector => ({ '.post-container': [container], '.catalog-body': catalog ? [list] : [], 'details.side-catalog': catalog ? [details] : [] })[selector] || [],
        createElement: tag => new Element(tag),
        getElementById: () => null
    };
    globalThis.window = {
        location: { hash: '' },
        matchMedia: () => media,
        addEventListener() {},
        requestAnimationFrame: callback => callback()
    };
    setupReading();
    return { reader, grid, aside, list, details, media };
}

test('chapter outline retains Chinese anchors, opens on wide screens, and collapses on narrow screens', t => {
    const view = fixture(t, [['文章标题', '文章标题'], ['摘要', '摘要'], ['并发原理', '并发原理'], ['实践', '实践']]);
    assert.deepEqual(view.list.children.map(item => item.children[0].href), ['#' + encodeURIComponent('并发原理'), '#' + encodeURIComponent('实践')]);
    assert.equal(view.reader.classList.contains('reader-no-outline'), false);
    assert.equal(view.grid.classList.contains('without-outline'), false);
    assert.equal(view.aside.hidden, false);
    assert.equal(view.details.open, true);
    view.media.matches = false;
    view.media.change();
    assert.equal(view.details.open, false);
});

test('articles with only a repeated title or introduction retain a single reading column', t => {
    const view = fixture(t, [['文章标题', '文章标题'], ['关键词：Java', '关键词']]);
    assert.equal(view.list.children.length, 0);
    assert.equal(view.aside.hidden, true);
    assert.equal(view.reader.classList.contains('reader-no-outline'), true);
    assert.equal(view.grid.classList.contains('without-outline'), true);
});

test('an explicitly disabled outline keeps the article in one column despite its headings', t => {
    const view = fixture(t, [['章节', '章节']], { catalog: false });
    assert.equal(view.reader.classList.contains('reader-no-outline'), true);
    assert.equal(view.grid.classList.contains('without-outline'), true);
});
