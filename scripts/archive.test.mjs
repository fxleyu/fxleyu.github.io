import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../assets/js/archive.js', import.meta.url), 'utf8');

function element(attributes = {}, children = []) {
  return {
    attributes: { ...attributes }, children, hidden: false, textContent: '', listeners: {},
    classList: { toggle() {} },
    getAttribute(name) { return this.attributes[name] ?? null; },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    querySelectorAll() { return this.children; },
    addEventListener(name, handler) { this.listeners[name] = handler; },
    click() { this.listeners.click(); }
  };
}

function archive(url = 'https://example.com/archive/') {
  const topics = ['', 'tech', 'reading', 'life'].map((topic, index) => element({
    'data-topic': topic, 'data-label': ['全部', '技术', '阅读', '生活'][index]
  }));
  const tags = ['Java', 'Design+Pattern', '随笔'].map(tag => element({ 'data-encode': tag }));
  const articles = [
    element({ 'data-topic': 'tech', 'data-tags': 'Java,Design+Pattern' }),
    element({ 'data-topic': 'reading', 'data-tags': '随笔' }),
    element({ 'data-topic': 'life', 'data-tags': '随笔' })
  ];
  const sections = [
    element({ 'data-year': '2020' }, articles.slice(0, 2)),
    element({ 'data-year': '2019' }, articles.slice(2))
  ];
  const years = ['2020', '2019'].map(year => element({ 'data-year': year, href: '#archive-year-' + year }));
  const ids = {
    'archive-count': element(),
    'archive-tag-filter': element(),
    'archive-tag-selection': { textContent: '3 个标签' }
  };
  const selectors = {
    '.archive-primary-topics': element({}, topics),
    '.js-tags': element({}, tags),
    '.js-result': element({}, sections)
  };
  const browser = {
    location: new URL(url), listeners: {}, pushed: [],
    addEventListener(name, handler) { this.listeners[name] = handler; }
  };
  browser.history = {
    pushState(state, title, path) {
      browser.location = new URL(path, browser.location);
      browser.pushed.push(browser.location.href);
    }
  };
  vm.runInNewContext(source, {
    URL, URLSearchParams, window: browser,
    document: {
      readyState: 'complete',
      querySelector(selector) { return selectors[selector]; },
      querySelectorAll() { return years; },
      getElementById(id) { return ids[id]; }
    }
  });
  return { topics, tags, articles, sections, years, ids, browser };
}

const shown = items => items.filter(item => !item.hidden).length;

test('topic links filter articles and year shortcuts while retaining the entire archive', () => {
  const page = archive('https://example.com/archive/?topic=tech');
  assert.equal(shown(page.articles), 1);
  assert.equal(shown(page.sections), 1);
  assert.equal(shown(page.years), 1);
  assert.equal(page.topics[1].getAttribute('aria-pressed'), 'true');
  assert.equal(page.ids['archive-count'].textContent, '技术 · 共 1 篇文章');
  page.topics[0].click();
  assert.equal(shown(page.articles), 3);
  assert.equal(shown(page.years), 2);
  assert.equal(page.browser.location.search, '');
});

test('legacy tags decode spaces, expand details and replace an active topic without intersecting it', () => {
  const page = archive('https://example.com/archive/?topic=life&tag=Design%20Pattern');
  assert.equal(shown(page.articles), 1);
  assert.equal(page.tags[1].getAttribute('aria-pressed'), 'true');
  assert.equal(page.ids['archive-tag-filter'].open, true);
  assert.equal(page.ids['archive-count'].textContent, '标签「Design Pattern」 · 共 1 篇文章');
  page.topics[3].click();
  assert.equal(page.browser.location.search, '?topic=life');
  assert.equal(page.articles[2].hidden, false);
  assert.equal(page.tags[1].getAttribute('aria-pressed'), 'false');
  page.tags[0].click();
  assert.equal(page.browser.location.search, '?tag=Java');
  assert.equal(page.articles[0].hidden, false);
  assert.equal(page.topics[3].getAttribute('aria-pressed'), 'false');
});

test('back and forward restore filtering; unsupported filters leave all articles readable', () => {
  const page = archive('https://example.com/archive/?topic=unknown&tag=unknown');
  assert.equal(shown(page.articles), 3);
  page.topics[2].click();
  assert.equal(page.browser.pushed.length, 1);
  page.browser.location = new URL('https://example.com/archive/?tag=Java#archive-year-2020');
  page.browser.listeners.popstate();
  assert.equal(shown(page.articles), 1);
  assert.equal(page.tags[0].getAttribute('aria-pressed'), 'true');
  assert.equal(page.years[0].getAttribute('aria-current'), 'location');
  page.browser.location = new URL('https://example.com/archive/');
  page.browser.listeners.popstate();
  assert.equal(shown(page.articles), 3);
  assert.equal(page.years[0].getAttribute('aria-current'), null);
});
