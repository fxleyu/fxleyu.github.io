(function() {
  'use strict';

  // Liquid's url_encode writes spaces as +. Decode data attributes once so
  // existing links using either + or %20 select the same tag.
  function decodeTag(value) {
    try {
      return decodeURIComponent((value || '').replace(/\+/g, ' '));
    } catch (error) {
      return value || '';
    }
  }

  function initArchive() {
    var tagList = document.querySelector('.js-tags');
    var result = document.querySelector('.js-result');
    if (!tagList || !result) return;

    var buttons = Array.prototype.slice.call(tagList.querySelectorAll('button.tag-button, button.tag-button--all'));
    var sections = Array.prototype.map.call(result.querySelectorAll('section'), function(section) {
      return {
        element: section,
        articles: Array.prototype.map.call(section.querySelectorAll('.item[data-tags]'), function(article) {
          return {
            element: article,
            tags: (article.getAttribute('data-tags') || '').split(',').map(decodeTag)
          };
        })
      };
    });
    var count = document.getElementById('archive-count');

    function buttonTag(button) {
      return decodeTag(button.getAttribute('data-encode'));
    }

    function showTag(requestedTag) {
      var tag = buttons.some(function(button) {
        return buttonTag(button) === requestedTag;
      }) ? requestedTag : '';
      var articleCount = 0;

      sections.forEach(function(section) {
        var visibleCount = 0;
        section.articles.forEach(function(article) {
          var visible = !tag || article.tags.indexOf(tag) !== -1;
          article.element.hidden = !visible;
          article.element.classList.remove('d-none');
          if (visible) visibleCount++;
        });
        section.element.hidden = visibleCount === 0;
        section.element.classList.remove('d-none');
        articleCount += visibleCount;
      });

      buttons.forEach(function(button) {
        var selected = buttonTag(button) === tag;
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        button.classList.toggle('is-active', selected);
        button.classList.toggle('focus', selected);
      });
      result.classList.remove('d-none');
      if (count) count.textContent = '共 ' + articleCount + ' 篇文章';
    }

    function readLocation() {
      showTag(new URLSearchParams(window.location.search).get('tag') || '');
    }

    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        var tag = buttonTag(button);
        var url = new URL(window.location.href);
        if (tag) {
          url.searchParams.set('tag', tag);
        } else {
          url.searchParams.delete('tag');
        }
        if (url.href !== window.location.href) {
          window.history.pushState(null, '', url.pathname + url.search + url.hash);
        }
        showTag(tag);
      });
    });

    window.addEventListener('popstate', readLocation);
    readLocation();

    var topicsToggle = document.getElementById('archive-topics-toggle');
    if (topicsToggle) {
      function setTopicsExpanded(expanded) {
        tagList.classList.toggle('is-expanded', expanded);
        topicsToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        topicsToggle.textContent = expanded ? '收起主题' : '展开全部主题';
      }

      topicsToggle.addEventListener('click', function() {
        setTopicsExpanded(topicsToggle.getAttribute('aria-expanded') !== 'true');
      });
      setTopicsExpanded(false);
      tagList.classList.add('is-collapsible');
      topicsToggle.hidden = false;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArchive);
  } else {
    initArchive();
  }
})();
