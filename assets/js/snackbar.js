/* Native status notification for offline support. */
(function () {
  'use strict';
  var current = null;
  var timeout = null;

  window.createSnackbar = function (config) {
    if (current) current.remove();
    window.clearTimeout(timeout);
    var notice = document.createElement('div');
    notice.className = 'site-notice';
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-live', 'polite');
    notice.textContent = config.message;
    document.body.appendChild(notice);
    current = notice;
    timeout = window.setTimeout(function () {
      notice.remove();
      if (current === notice) current = null;
    }, config.duration || 5000);
  };
}());
