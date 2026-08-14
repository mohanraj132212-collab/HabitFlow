/* HabitFlow Offline Service Worker */

const CACHE_NAME = 'habitflow-v7-final';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/logo/logo.png',
  './css/variables.css',
  './css/style.css',
  './css/layout.css',
  './css/auth.css',
  './css/cropper.css',
  './css/dashboard.css',
  './css/habits.css',
  './css/habit-library.css',
  './css/calendar.css',
  './css/analytics.css',
  './css/goals.css',
  './css/journal.css',
  './css/achievements.css',
  './css/settings.css',
  './css/responsive.css',
  './js/app.js',
  './js/router.js',
  './js/state.js',
  './js/ui.js',
  './js/auth.js',
  './js/firestore.js',
  './js/storage.js',
  './js/cropper.js',
  './js/firebase.js',
  './js/dashboard.js',
  './js/habits.js',
  './js/habit-library.js',
  './js/habit-library-view.js',
  './js/calendar.js',
  './js/analytics.js',
  './js/goals.js',
  './js/journal.js',
  './js/achievements.js',
  './js/date-utils.js',
  './js/duplicate-prevention.js',
  './js/data-validation.js',
  './components/sidebar.js',
  './components/header.js',
  './components/bottom-nav.js',
  './components/auth-form.js',
  './components/cropper-modal.js',
  './components/habit-card.js',
  './components/habit-library-card.js',
  './components/habit-grid.js',
  './components/modal.js',
  './components/empty-state.js',
  './components/svg-icons.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request).catch(() => caches.match('./index.html'));
    })
  );
});
