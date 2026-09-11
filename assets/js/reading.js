/*!
 * FXLEYU reading enhancements, maintained in native JavaScript.
 * Catalog and responsive-content foundations derived from @huxpro; see NOTICE.
 */

const headingSelector = 'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]';

function headingText(heading) {
    const copy = heading.cloneNode(true);
    copy.querySelectorAll('.heading-anchor').forEach(anchor => anchor.remove());
    return copy.textContent.replace(/\s+/g, ' ').trim();
}

function setupResponsiveContent(container) {
    container.querySelectorAll('table').forEach(table => {
        if (table.classList.contains('rouge-table') || table.closest('.highlight') || table.parentElement.classList.contains('table-responsive')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        wrapper.tabIndex = 0;
        wrapper.setAttribute('role', 'region');
        wrapper.setAttribute('aria-label', '可横向滚动的表格');
        table.before(wrapper);
        wrapper.append(table);
    });
    container.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="vimeo.com"]').forEach(frame => {
        if (frame.parentElement.classList.contains('video-embed')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'video-embed';
        frame.before(wrapper);
        wrapper.append(frame);
    });
}

function setupCode(container) {
    container.querySelectorAll('.highlight').forEach(block => {
        if (block.parentElement.closest('.highlight') || block.dataset.readingCode) return;
        block.dataset.readingCode = 'true';
        block.tabIndex = 0;
        block.setAttribute('role', 'region');
        block.setAttribute('aria-label', '代码，可横向滚动');

        // Rouge nests line numbers and source in the same <code> element.
        const source = block.querySelector('.rouge-code pre') || block.querySelector('.rouge-code') || block.querySelector('code, pre');
        if (!source) return;
        const languageNode = block.closest('[class*="language-"]') || block.querySelector('[class*="language-"]');
        const languageMatch = languageNode && languageNode.className.match(/(?:^|\s)language-([^\s]+)/);
        const language = languageMatch ? languageMatch[1] : 'text';
        const labels = { plaintext: 'TEXT', text: 'TEXT', java: 'Java', javascript: 'JavaScript', js: 'JavaScript', typescript: 'TypeScript', ts: 'TypeScript', html: 'HTML', css: 'CSS', json: 'JSON', xml: 'XML', sql: 'SQL', bash: 'Bash', shell: 'Shell', sh: 'Shell', python: 'Python', ruby: 'Ruby', markdown: 'Markdown' };
        const label = labels[language] || language;
        const toolbar = document.createElement('div');
        toolbar.className = 'code-toolbar';
        const languageLabel = document.createElement('span');
        languageLabel.className = 'code-language';
        languageLabel.textContent = label;
        const status = document.createElement('span');
        status.className = 'code-copy-status';
        status.setAttribute('role', 'status');
        const button = document.createElement('button');
        button.className = 'code-copy';
        button.type = 'button';
        button.textContent = '复制';
        button.setAttribute('aria-label', '复制 ' + label + ' 代码');
        let resetTimer;
        button.addEventListener('click', async () => {
            window.clearTimeout(resetTimer);
            button.disabled = true;
            status.textContent = '';
            try {
                if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
                await navigator.clipboard.writeText(source.textContent);
                button.textContent = '已复制';
                status.textContent = '代码已复制';
            } catch {
                button.textContent = '复制失败';
                status.textContent = '复制失败，请手动选择代码。';
            } finally {
                button.disabled = false;
                resetTimer = window.setTimeout(() => { button.textContent = '复制'; }, 2400);
            }
        });
        toolbar.append(languageLabel, status, button);
        // Keep controls outside the horizontally scrolling code region.
        block.before(toolbar);
    });
}

function meaningfulAlt(image) {
    const alt = (image.getAttribute('alt') || '').replace(/\s+/g, ' ').trim();
    if (!alt || /^(?:image|img|picture|photo|test|out|input|图|图片|图像|截图)(?:[\s_-]*\d+)?$/i.test(alt)) return '';
    if (/^(?:https?:\/\/|data:)/i.test(alt) || /\.(?:png|jpe?g|gif|webp|svg)$/i.test(alt)) return '';
    return alt;
}

function imageFigure(media) {
    if (media.parentElement.tagName === 'FIGURE') {
        media.parentElement.classList.add('article-image');
        return media.parentElement;
    }
    const figure = document.createElement('figure');
    figure.className = 'article-image';
    const paragraph = media.parentElement;
    if (paragraph.tagName === 'P') {
        // Old posts mix prose and multiple images in one paragraph. Split it
        // around the original image without losing inline markup or text order.
        const remainder = paragraph.cloneNode(false);
        remainder.removeAttribute('id');
        while (media.nextSibling) remainder.append(media.nextSibling);
        paragraph.after(figure);
        figure.append(media);
        if (remainder.childNodes.length) figure.after(remainder);
        if (!paragraph.textContent.trim() && !paragraph.children.length && !paragraph.id) paragraph.remove();
        return figure;
    }
    // These containers accept flow content, including a figure.
    if (/^(?:DIV|SECTION|ARTICLE|LI|TD|TH|BLOCKQUOTE|DD)$/.test(paragraph.tagName)) {
        media.before(figure);
        figure.append(media);
        return figure;
    }
    return null;
}

function setupImages(container) {
    container.querySelectorAll('img').forEach(image => {
        if (image.dataset.readingImage) return;
        image.dataset.readingImage = 'true';
        const source = image.getAttribute('src');
        if (!source) return;
        image.decoding = 'async';
        const bounds = image.getBoundingClientRect();
        image.loading = bounds.top < window.innerHeight && bounds.bottom >= 0 ? 'eager' : 'lazy';
        function setDimensions() {
            if (!image.naturalWidth || !image.naturalHeight) return;
            const width = Number(image.getAttribute('width'));
            const height = Number(image.getAttribute('height'));
            if (!width) image.setAttribute('width', String(height ? Math.round(height * image.naturalWidth / image.naturalHeight) : image.naturalWidth));
            if (!height) image.setAttribute('height', String(width ? Math.round(width * image.naturalHeight / image.naturalWidth) : image.naturalHeight));
        }
        image.addEventListener('load', setDimensions, { once: true });
        if (image.complete) setDimensions();
        if (image.closest('a')) return;

        let url;
        try { url = new URL(image.currentSrc || source, document.baseURI); } catch { return; }
        if (!['http:', 'https:'].includes(url.protocol)) return;
        const original = document.createElement('a');
        original.className = 'image-original';
        original.href = url.href;
        original.textContent = '查看原图 ↗';
        original.target = '_blank';
        original.rel = 'noopener';
        const media = image.closest('picture') || image;
        const figure = imageFigure(media);
        const captionText = meaningfulAlt(image);
        if (figure) {
            let caption = Array.from(figure.children).find(child => child.tagName === 'FIGCAPTION');
            if (caption) {
                caption.classList.add('image-caption');
                caption.append(' ', original);
            } else {
                caption = document.createElement('figcaption');
                caption.className = 'image-caption';
                if (captionText) {
                    const description = document.createElement('span');
                    description.textContent = captionText;
                    caption.append(description);
                }
                caption.append(original);
                figure.append(caption);
            }
        } else {
            // Leave an unusual inline image in place rather than inserting an
            // invalid figure into a span, heading, or another phrasing element.
            media.after(original);
        }
    });
}

function setupHeadings(container) {
    const headings = Array.from(container.querySelectorAll(headingSelector));
    const pageTitle = document.querySelector('.article-heading h1');
    const title = pageTitle ? headingText(pageTitle) : '';
    const catalogHeadings = headings.filter(heading => {
        const text = headingText(heading);
        const repeatedTitle = Boolean(title && text === title);
        const introductory = /^(?:摘要|关键词|关键字|导读|abstract|key\s*words?)(?:\s*[:：].*)?$/i.test(text);
        heading.classList.toggle('reading-title-repeat', repeatedTitle);
        heading.classList.toggle('reading-intro-heading', introductory);
        return Boolean(text) && !repeatedTitle && !introductory;
    });
    if (document.body.getAttribute('data-heading-anchors') === 'true') {
        headings.forEach(heading => {
            if (!headingText(heading) || heading.classList.contains('reading-title-repeat') || heading.querySelector('.heading-anchor')) return;
            const anchor = document.createElement('a');
            anchor.className = 'heading-anchor';
            anchor.href = '#' + encodeURIComponent(heading.id);
            anchor.setAttribute('aria-label', '链接到：' + headingText(heading));
            anchor.textContent = '#';
            heading.append(anchor);
        });
    }
    return catalogHeadings;
}

function setupFragmentReveal(container) {
    function revealTarget() {
        const hash = window.location.hash;
        let id;
        try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
        const target = id && document.getElementById(id);
        if (!target || !container.contains(target)) return;
        const closed = [];
        for (let parent = target.parentElement; parent; parent = parent.parentElement) {
            if (parent.tagName === 'DETAILS' && !parent.open) closed.push(parent);
        }
        if (!closed.length) return;
        closed.reverse().forEach(details => { details.open = true; });
        // Give revealed content a layout before restoring an old deep link.
        // Ordinary heading links retain their native scrolling behavior.
        window.requestAnimationFrame(() => {
            if (window.location.hash === hash) target.scrollIntoView({ block: 'start', behavior: 'auto' });
        });
    }
    window.addEventListener('hashchange', revealTarget);
    revealTarget();
}

function setupCatalog(container, headings) {
    const catalogs = document.querySelectorAll('.catalog-body');
    const hasOutline = catalogs.length > 0 && headings.length > 0;
    container.closest('.apple-reader')?.classList.toggle('reader-no-outline', !hasOutline);
    container.closest('.apple-reading-grid')?.classList.toggle('without-outline', !hasOutline);
    if (!catalogs.length) return;
    const links = [];
    catalogs.forEach(catalog => {
        catalog.replaceChildren();
        headings.forEach(heading => {
            const item = document.createElement('li');
            item.className = heading.tagName.toLowerCase() + '_nav';
            const link = document.createElement('a');
            link.href = '#' + encodeURIComponent(heading.id);
            link.textContent = headingText(heading);
            item.append(link);
            catalog.append(item);
            links.push({ heading, link });
        });
        const aside = catalog.closest('.article-catalog');
        if (aside) aside.hidden = headings.length === 0;
    });
    const wide = window.matchMedia('(min-width: 1280px)');
    function updateDisclosure() {
        document.querySelectorAll('details.side-catalog').forEach(details => { details.open = wide.matches; });
    }
    updateDisclosure();
    if (wide.addEventListener) wide.addEventListener('change', updateDisclosure);
    else wide.addListener(updateDisclosure);
    if (!headings.length) return;

    let current;
    function select(heading) {
        if (current === heading) return;
        current = heading;
        links.forEach(entry => {
            if (entry.heading === heading) entry.link.setAttribute('aria-current', 'location');
            else entry.link.removeAttribute('aria-current');
        });
    }
    function readingOffset() {
        const nav = document.querySelector('.site-nav');
        return (nav ? nav.getBoundingClientRect().height : 72) + 28;
    }
    function updateCurrent() {
        const offset = readingOffset();
        let active = headings[0];
        for (const heading of headings) {
            if (heading.getBoundingClientRect().top > offset + 1) break;
            active = heading;
        }
        select(active);
    }
    function selectHash() {
        let id;
        try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
        const target = id && document.getElementById(id);
        if (!target || !container.contains(target)) return;
        let active = headings[0];
        for (const heading of headings) {
            if (heading === target || (heading.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)) active = heading;
            else break;
        }
        select(active);
    }
    let observer;
    function observeHeadings() {
        if (!('IntersectionObserver' in window)) return;
        if (observer) observer.disconnect();
        observer = new IntersectionObserver(updateCurrent, { rootMargin: '-' + readingOffset() + 'px 0px -55% 0px', threshold: [0, 1] });
        headings.forEach(heading => observer.observe(heading));
    }
    observeHeadings();
    let scheduled = false;
    function scheduleCurrent() {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(() => { scheduled = false; updateCurrent(); });
    }
    // Also cover long gaps between headings and browsers without the observer.
    window.addEventListener('scroll', scheduleCurrent, { passive: true });
    window.addEventListener('resize', () => { observeHeadings(); scheduleCurrent(); });
    window.addEventListener('hashchange', selectHash);
    window.addEventListener('load', () => { updateCurrent(); selectHash(); }, { once: true });
    updateCurrent();
    selectHash();
}

export function setupReading() {
    document.querySelectorAll('.post-container').forEach(container => {
        if (container.dataset.readingReady) return;
        container.dataset.readingReady = 'true';
        setupResponsiveContent(container);
        setupCode(container);
        setupImages(container);
        setupCatalog(container, setupHeadings(container));
        setupFragmentReveal(container);
    });
}
