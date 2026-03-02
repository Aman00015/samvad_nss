const CACHE_VERSION = 2;
const STATIC_CACHE = `samvaad-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `samvaad-dynamic-v${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Static assets to pre-cache — these are available offline immediately after install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
];

// App routes to pre-cache for offline navigation
const APP_ROUTES = [
  '/citizen',
  '/citizen/complaints',
  '/citizen/new-complaint',
  '/volunteer',
  '/volunteer/tasks',
  '/volunteer/verify',
  '/admin',
  '/admin/analytics',
  '/admin/complaints',
  '/admin/social',
  '/admin/volunteers',
];

// Install event - pre-cache static assets + app shell routes
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      console.log('[SW] Pre-caching static assets');
      await cache.addAll(STATIC_ASSETS);
      // Pre-cache app routes individually (don't fail install if one route fails)
      for (const route of APP_ROUTES) {
        try {
          await cache.add(route);
          console.log('[SW] Cached route:', route);
        } catch (e) {
          console.warn('[SW] Failed to cache route:', route, e);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - intelligent caching strategies per resource type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests (except CDN assets like fonts/tiles)
  if (url.origin !== location.origin) return;

  // --- Navigation requests (HTML pages) — Network first, cache fallback, then offline page ---
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache every successful navigation for future offline use
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(async () => {
          // Try dynamic cache first, then static cache, then offline fallback
          const cached =
            (await caches.match(request)) ||
            (await caches.match(url.pathname)) ||
            (await caches.match('/'));
          return cached || caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // --- Next.js build assets (/_next/) — Cache first (they're content-hashed) ---
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // --- Static assets (icons, images, CSS, JS) — Stale while revalidate ---
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // --- All other requests — Network first with cache fallback ---
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background sync for offline complaint submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-complaints') {
    console.log('[SW] Background sync: sync-complaints triggered');
    event.waitUntil(syncComplaints());
  }
});

async function syncComplaints() {
  // In production, this would read from IndexedDB syncQueue
  // and POST each item to the server
  console.log('[SW] Syncing pending complaints...');
  // Notify all clients that sync is complete
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_COMPLETE', timestamp: Date.now() });
  });
}

// Push notification support
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Samvaad Update';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});
