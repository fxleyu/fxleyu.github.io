/*!
 * FXLEYU site interactions, maintained independently in native JavaScript.
 * Derived portions copyright 2016 @huxpro, Apache-2.0; see NOTICE.
 */
(function () {
    'use strict';

    function watchMedia(query, callback) {
        var media = window.matchMedia(query);
        callback(media);
        if (media.addEventListener) media.addEventListener('change', callback);
        else media.addListener(callback);
        return media;
    }

    function setupNavigation() {
        var nav = document.querySelector('.site-nav');
        var toggle = document.querySelector('.site-nav-toggle');
        var links = document.getElementById('site-nav-links');
        if (!nav || !toggle || !links) return;
        var mobile;
        function closeMenu(restoreFocus) {
            if (!mobile.matches) return;
            links.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
            if (restoreFocus) toggle.focus();
        }
        mobile = watchMedia('(max-width: 640px)', function (media) {
            links.hidden = media.matches;
            toggle.setAttribute('aria-expanded', 'false');
        });
        toggle.addEventListener('click', function () {
            var open = toggle.getAttribute('aria-expanded') !== 'true';
            links.hidden = !open;
            toggle.setAttribute('aria-expanded', String(open));
        });
        nav.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeMenu(true);
        });
        nav.addEventListener('focusout', function (event) {
            if (event.relatedTarget && !nav.contains(event.relatedTarget)) closeMenu(false);
        });
        links.addEventListener('click', function (event) {
            if (event.target.closest('a, button')) closeMenu(false);
        });
        document.addEventListener('click', function (event) {
            if (!nav.contains(event.target)) closeMenu(false);
        });
    }

    function setupSearch() {
        var page = document.getElementById('site-search');
        var input = document.getElementById('search-input');
        var results = document.getElementById('search-results');
        var status = document.getElementById('search-status');
        if (!page || !input || !results || !status) return;
        var index = null;
        var loading = null;
        var limit = 50;

        function showResults() {
            var query = input.value.trim().toLowerCase();
            results.replaceChildren();
            if (!query) {
                status.textContent = '输入关键词，找一篇想读的文章。';
                return;
            }
            if (!index) return;
            // Keep the previous index scope: title, subtitle, tags, URL and date.
            var matches = index.filter(function (post) {
                return Object.keys(post).some(function (key) {
                    return typeof post[key] === 'string' && post[key].toLowerCase().indexOf(query) !== -1;
                });
            });
            status.textContent = matches.length ? '找到 ' + matches.length + ' 篇文章' + (matches.length > limit ? '，显示前 ' + limit + ' 篇。' : '。') : '没有找到相关文章，试试其他关键词。';
            var fragment = document.createDocumentFragment();
            matches.slice(0, limit).forEach(function (post) {
                var item = document.createElement('article');
                item.className = 'search-result';
                var link = document.createElement('a');
                link.href = post.url;
                var title = document.createElement('h2');
                title.textContent = post.title;
                link.appendChild(title);
                item.appendChild(link);
                if (post.subtitle) {
                    var subtitle = document.createElement('p');
                    subtitle.textContent = post.subtitle;
                    item.appendChild(subtitle);
                }
                var meta = document.createElement('div');
                meta.className = 'search-result-meta';
                meta.textContent = [String(post.date || '').slice(0, 10), post.tags].filter(Boolean).join(' · ');
                item.appendChild(meta);
                fragment.appendChild(item);
            });
            results.appendChild(fragment);
        }

        function loadIndex() {
            if (index) {
                showResults();
                return;
            }
            if (loading) return;
            status.textContent = '正在加载文章索引……';
            loading = fetch(page.getAttribute('data-search-index'))
                .then(function (response) {
                    if (!response.ok) throw new Error('Search index unavailable');
                    return response.json();
                })
                .then(function (posts) {
                    if (!Array.isArray(posts)) throw new Error('Invalid search index');
                    index = posts;
                    showResults();
                })
                .catch(function () {
                    if (input.value.trim()) status.textContent = '暂时无法加载文章，请检查网络后点击“搜索”重试。';
                })
                .finally(function () { loading = null; });
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
            // Keep a shareable query without creating a history entry per keystroke.
            window.history.replaceState(null, '', url);
            search();
        }

        function restoreQuery() {
            input.value = new URLSearchParams(window.location.search).get('q') || '';
            search();
        }

        input.addEventListener('input', function (event) {
            if (!event.isComposing) updateQuery();
        });
        input.addEventListener('compositionend', updateQuery);
        page.querySelector('form').addEventListener('submit', function (event) {
            event.preventDefault();
            input.value = input.value.trim();
            updateQuery();
        });
        window.addEventListener('popstate', restoreQuery);
        restoreQuery();
    }

    function setupResponsiveContent() {
        document.querySelectorAll('.post-container .highlight').forEach(function (block) {
            if (block.parentElement.closest('.highlight')) return;
            block.tabIndex = 0;
            block.setAttribute('role', 'region');
            block.setAttribute('aria-label', '代码，可横向滚动');
        });
        document.querySelectorAll('.post-container table').forEach(function (table) {
            if (table.classList.contains('rouge-table') || table.closest('.highlight') || table.parentElement.classList.contains('table-responsive')) return;
            var wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            wrapper.tabIndex = 0;
            wrapper.setAttribute('role', 'region');
            wrapper.setAttribute('aria-label', '可横向滚动的表格');
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
        document.querySelectorAll('.post-container iframe[src*="youtube.com"], .post-container iframe[src*="vimeo.com"]').forEach(function (frame) {
            if (frame.parentElement.classList.contains('video-embed')) return;
            var wrapper = document.createElement('div');
            wrapper.className = 'video-embed';
            frame.parentNode.insertBefore(wrapper, frame);
            wrapper.appendChild(frame);
        });
    }

    function generateCatalog(selector) {
        var container = document.querySelector('div.post-container');
        var catalogs = document.querySelectorAll(selector);
        if (!container || !catalogs.length) return;
        var headings = Array.prototype.filter.call(container.querySelectorAll('h1, h2, h3, h4, h5, h6'), function (heading) { return heading.id; });
        catalogs.forEach(function (catalog) {
            catalog.replaceChildren();
            headings.forEach(function (heading) {
                var item = document.createElement('li');
                item.className = heading.tagName.toLowerCase() + '_nav';
                var link = document.createElement('a');
                link.href = '#' + encodeURIComponent(heading.id);
                var title = heading.cloneNode(true);
                title.querySelectorAll('.heading-anchor').forEach(function (anchor) { anchor.remove(); });
                link.textContent = title.textContent;
                item.appendChild(link);
                catalog.appendChild(item);
            });
            var aside = catalog.closest('.article-catalog');
            if (aside) aside.hidden = headings.length === 0;
        });
    }

    function setupCatalog() {
        generateCatalog('.catalog-body');
        watchMedia('(min-width: 1280px)', function (media) {
            document.querySelectorAll('details.side-catalog').forEach(function (details) { details.open = media.matches; });
        });
    }

    function setupHeadingAnchors() {
        if (document.body.getAttribute('data-heading-anchors') !== 'true') return;
        document.querySelectorAll('.post-container h1[id], .post-container h2[id], .post-container h3[id], .post-container h4[id], .post-container h5[id], .post-container h6[id]').forEach(function (heading) {
            if (heading.querySelector('.heading-anchor')) return;
            var anchor = document.createElement('a');
            anchor.className = 'heading-anchor';
            anchor.href = '#' + encodeURIComponent(heading.id);
            anchor.setAttribute('aria-label', '链接到：' + heading.textContent);
            anchor.textContent = '#';
            heading.appendChild(anchor);
        });
    }

    function init() {
        setupNavigation();
        setupSearch();
        setupResponsiveContent();
        setupCatalog();
        setupHeadingAnchors();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());
