/* Register the offline worker and refresh a page when its existing worker updates. */
(function () {
  if (!('serviceWorker' in navigator)) return;

  var hadController = Boolean(navigator.serviceWorker.controller);
  var refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (hadController && !refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  // Resolve from this script so a Jekyll baseurl keeps the correct worker scope.
  var workerUrl = new URL('../../sw.js', document.currentScript.src);
  navigator.serviceWorker.register(workerUrl.href, { updateViaCache: 'none' })
    .then(function (registration) {
      registration.addEventListener('updatefound', function () {
        var worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', function () {
          if (worker.state === 'installed' && !hadController && typeof window.createSnackbar === 'function') {
            window.createSnackbar({ message: '已支持离线阅读，访问过的文章可在断网后继续查看。', duration: 4000 });
          }
        });
      });
    })
    .catch(function (error) { console.warn('Offline support is unavailable:', error); });
})();
