import { setupSearch } from './search.js';
import { setupReading } from './reading.js';

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
            if (open) links.querySelector('a')?.focus();
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

    function init() {
        setupNavigation();
        setupSearch();
        setupReading();
        document.querySelectorAll('[data-retry]').forEach(button => {
            button.addEventListener('click', () => window.location.reload());
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());
