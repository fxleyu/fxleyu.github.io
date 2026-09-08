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
    var topicList = document.querySelector('.archive-primary-topics');
    var tagList = document.querySelector('.js-tags');
    var result = document.querySelector('.js-result');
    if (!topicList || !tagList || !result) return;

    var topicButtons = Array.prototype.slice.call(topicList.querySelectorAll('button[data-topic]'));
    var tagButtons = Array.prototype.slice.call(tagList.querySelectorAll('button[data-encode]'));
    var yearLinks = Array.prototype.slice.call(document.querySelectorAll('.archive-year-link'));
    var sections = Array.prototype.map.call(result.querySelectorAll('section.archive-year'), function(section) {
      return {
        element: section,
        year: section.getAttribute('data-year'),
        articles: Array.prototype.map.call(section.querySelectorAll('.item[data-tags]'), function(article) {
          return {
            element: article,
            topic: article.getAttribute('data-topic'),
            tags: (article.getAttribute('data-tags') || '').split(',').map(decodeTag)
          };
        })
      };
    });
    var count = document.getElementById('archive-count');
    var tagFilter = document.getElementById('archive-tag-filter');
    var tagSelection = document.getElementById('archive-tag-selection');
    var defaultTagLabel = tagSelection ? tagSelection.textContent : '';

    function buttonTag(button) {
      return decodeTag(button.getAttribute('data-encode'));
    }

    function markSelected(button, selected) {
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      button.classList.toggle('is-active', selected);
    }

    function markCurrentYear() {
      yearLinks.forEach(function(link) {
        if (!link.hidden && link.getAttribute('href') === window.location.hash) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    function showFilter(requestedTopic, requestedTag) {
      // A tag is a narrower alternative to a topic, never a hidden second filter.
      // Existing tag URLs take precedence if both query parameters are supplied.
      var tag = tagButtons.some(function(button) {
        return buttonTag(button) === requestedTag;
      }) ? requestedTag : '';
      var topic = !tag && topicButtons.some(function(button) {
        return button.getAttribute('data-topic') === requestedTopic;
      }) ? requestedTopic : '';
      var articleCount = 0;
      var visibleYears = {};

      sections.forEach(function(section) {
        var visibleCount = 0;
        section.articles.forEach(function(article) {
          var visible = tag ? article.tags.indexOf(tag) !== -1 : !topic || article.topic === topic;
          article.element.hidden = !visible;
          if (visible) visibleCount++;
        });
        section.element.hidden = visibleCount === 0;
        visibleYears[section.year] = visibleCount;
        articleCount += visibleCount;
      });

      var label = '';
      topicButtons.forEach(function(button) {
        var selected = !tag && button.getAttribute('data-topic') === topic;
        markSelected(button, selected);
        if (selected && topic) label = button.getAttribute('data-label') || topic;
      });
      tagButtons.forEach(function(button) {
        markSelected(button, !!tag && buttonTag(button) === tag);
      });
      yearLinks.forEach(function(link) {
        var year = link.getAttribute('data-year');
        var total = visibleYears[year] || 0;
        link.hidden = total === 0;
        link.setAttribute('aria-label', year + '年，' + total + '篇文章');
      });
      markCurrentYear();

      if (tag) label = '标签「' + tag + '」';
      if (count) count.textContent = (label ? label + ' · ' : '') + '共 ' + articleCount + ' 篇文章';
      if (tagSelection) tagSelection.textContent = tag || defaultTagLabel;
      if (tag && tagFilter) tagFilter.open = true;
    }

    function readLocation() {
      var params = new URLSearchParams(window.location.search);
      showFilter(params.get('topic') || '', params.get('tag') || '');
    }

    function selectFilter(kind, value) {
      var url = new URL(window.location.href);
      url.searchParams.delete('topic');
      url.searchParams.delete('tag');
      if (value) url.searchParams.set(kind, value);
      url.hash = '';
      if (url.href !== window.location.href) {
        window.history.pushState(null, '', url.pathname + url.search);
      }
      showFilter(kind === 'topic' ? value : '', kind === 'tag' ? value : '');
    }

    topicButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        selectFilter('topic', button.getAttribute('data-topic'));
      });
    });
    tagButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        selectFilter('tag', buttonTag(button));
      });
    });
    window.addEventListener('popstate', readLocation);
    window.addEventListener('hashchange', markCurrentYear);
    readLocation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArchive);
  } else {
    initArchive();
  }
})();
