/* Full-text search stays local to the browser and uses the Jekyll-built index. */
function termsFor(query) {
    return [...new Set(String(query).trim().toLowerCase().split(/\s+/).filter(Boolean))];
}

function textOf(value) {
    return typeof value === 'string' ? value : '';
}

export function searchPosts(posts, query) {
    var terms = termsFor(query);
    if (!terms.length) return [];
    var fields = { title: 120, tags: 80, subtitle: 40, summary: 24, content: 8, url: 2, date: 2 };
    return posts.map(function (post, order) {
        var values = Object.keys(fields).map(function (field) {
            return { text: textOf(post[field]).toLowerCase(), weight: fields[field] };
        });
        var score = 0;
        for (var term of terms) {
            var weight = values.reduce(function (best, field) {
                return field.text.includes(term) ? Math.max(best, field.weight) : best;
            }, 0);
            if (!weight) return null;
            score += weight;
        }
        var title = textOf(post.title).toLowerCase();
        var phrase = String(query).trim().toLowerCase();
        if (title === phrase) score += 200;
        else if (title.startsWith(phrase)) score += 60;
        return { post: post, score: score, order: order };
    }).filter(Boolean).sort(function (a, b) {
        // Jekyll's newest-first order breaks relevance ties consistently.
        return b.score - a.score || a.order - b.order;
    }).map(function (match) { return match.post; });
}

export function searchExcerpt(post, query, length = 100) {
    var terms = termsFor(query);
    var candidates = [post.subtitle, post.summary, post.content].map(textOf).filter(Boolean);
    var source = candidates.find(function (candidate) {
        return terms.some(function (term) { return candidate.toLowerCase().includes(term); });
    }) || candidates[0] || '';
    var positions = terms.map(function (term) { return source.toLowerCase().indexOf(term); }).filter(function (position) { return position >= 0; });
    var hit = positions.length ? Math.min(...positions) : 0;
    var start = Math.max(0, hit - 30);
    if (source.length - start < length) start = Math.max(0, source.length - length);
    if (start && /[\uDC00-\uDFFF]/.test(source[start])) start -= 1;
    // Array.from avoids cutting an emoji or other surrogate pair in half.
    var prefix = source.slice(0, start);
    var characters = Array.from(source.slice(start));
    return (prefix ? '…' : '') + characters.slice(0, length).join('').trim() + (characters.length > length ? '…' : '');
}

export function highlightedParts(value, query) {
    var text = textOf(value);
    var terms = termsFor(query).sort(function (a, b) { return b.length - a.length; });
    if (!terms.length) return [{ text: text, match: false }];
    var escaped = terms.map(function (term) { return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    var expression = new RegExp(escaped.join('|'), 'giu');
    var parts = [];
    var cursor = 0;
    for (var match of text.matchAll(expression)) {
        if (match.index > cursor) parts.push({ text: text.slice(cursor, match.index), match: false });
        parts.push({ text: match[0], match: true });
        cursor = match.index + match[0].length;
    }
    if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
    return parts;
}

function appendHighlighted(element, text, query) {
    highlightedParts(text, query).forEach(function (part) {
        var node = part.match ? document.createElement('mark') : document.createTextNode(part.text);
        if (part.match) node.textContent = part.text;
        element.appendChild(node);
    });
}

export function setupSearch() {
    var page = document.getElementById('site-search');
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    var status = document.getElementById('search-status');
    var discovery = document.getElementById('search-discovery');
    if (!page || !input || !results || !status) return;
    var index = null;
    var loading = null;
    var composing = false;
    var limit = 50;

    function showResults() {
        var query = input.value.trim();
        results.replaceChildren();
        if (!query) {
            status.textContent = '输入关键词，找一篇想读的文章。';
            if (discovery) discovery.hidden = false;
            return;
        }
        if (!index) return;
        var matches = searchPosts(index, query);
        if (discovery) discovery.hidden = matches.length > 0;
        status.textContent = matches.length ? '找到 ' + matches.length + ' 篇文章' + (matches.length > limit ? '，显示相关度最高的 ' + limit + ' 篇。' : '。') : '没有找到相关文章，试试其他关键词，或从下面的主题开始。';
        var fragment = document.createDocumentFragment();
        matches.slice(0, limit).forEach(function (post) {
            var item = document.createElement('article');
            item.className = 'search-result';
            var title = document.createElement('h2');
            var link = document.createElement('a');
            link.href = post.url;
            appendHighlighted(link, post.title, query);
            title.appendChild(link);
            item.appendChild(title);
            var excerpt = searchExcerpt(post, query);
            if (excerpt) {
                var snippet = document.createElement('p');
                snippet.className = 'search-result-snippet';
                appendHighlighted(snippet, excerpt, query);
                item.appendChild(snippet);
            }
            var meta = document.createElement('div');
            meta.className = 'search-result-meta';
            appendHighlighted(meta, [textOf(post.date).slice(0, 10), post.tags].filter(Boolean).join(' · '), query);
            item.appendChild(meta);
            fragment.appendChild(item);
        });
        results.appendChild(fragment);
    }

    function loadIndex() {
        status.textContent = '正在加载文章索引……';
        results.setAttribute('aria-busy', 'true');
        if (discovery) discovery.hidden = true;
        if (loading) return;
        loading = fetch(page.getAttribute('data-search-index'))
            .then(function (response) {
                if (!response.ok) throw new Error('Search index unavailable');
                return response.json();
            })
            .then(function (posts) {
                if (!Array.isArray(posts)) throw new Error('Invalid search index');
                index = posts.filter(function (post) {
                    if (!post || typeof post.title !== 'string' || typeof post.url !== 'string') return false;
                    try {
                        var url = new URL(post.url, window.location.href);
                        return url.origin === window.location.origin && /^https?:$/.test(url.protocol);
                    } catch (_) { return false; }
                });
                // Read the current input after loading; a previous query may have changed.
                showResults();
            })
            .catch(function () {
                if (input.value.trim()) status.textContent = '暂时无法加载文章，请检查网络后点击“搜索”重试。';
                if (discovery) discovery.hidden = false;
            })
            .finally(function () {
                loading = null;
                results.removeAttribute('aria-busy');
            });
    }

    function search() {
        if (!input.value.trim() || index) showResults();
        else loadIndex();
    }

    function updateQuery() {
        var url = new URL(window.location.href);
        var query = input.value.trim();
        if (query) url.searchParams.set('q', query);
        else url.searchParams.delete('q');
        // A shareable query without a separate history entry for each keystroke.
        window.history.replaceState(null, '', url);
        search();
    }

    function restoreQuery() {
        input.value = new URLSearchParams(window.location.search).get('q') || '';
        search();
    }

    input.addEventListener('compositionstart', function () { composing = true; });
    input.addEventListener('input', function (event) {
        if (!composing && !event.isComposing) updateQuery();
    });
    input.addEventListener('compositionend', function () {
        composing = false;
        updateQuery();
    });
    page.querySelector('form').addEventListener('submit', function (event) {
        event.preventDefault();
        if (composing) return;
        input.value = input.value.trim();
        updateQuery();
    });
    window.addEventListener('popstate', restoreQuery);
    restoreQuery();
}
