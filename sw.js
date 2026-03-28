// MandarinPro Service Worker for PWA functionality
const CACHE_NAME = 'mandarin-pro-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ MandarinPro PWA: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ MandarinPro PWA: Resources cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ MandarinPro PWA: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ MandarinPro PWA: Activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        console.log('📱 MandarinPro PWA: Serving offline content');
        return caches.match('/');
      })
  );
});

// Background sync for offline progress (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgressData());
  }
});

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('MandarinPro', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('📱 MandarinPro PWA: Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Function to sync progress data (placeholder for future implementation)
async function syncProgressData() {
  console.log('📱 MandarinPro PWA: Syncing progress data...');
  // This would sync any offline progress data to the server
  // For now, it's a placeholder for future enhancement
}

// Function to update cache (for future updates)
function updateCache() {
  return caches.open(CACHE_NAME)
    .then((cache) => {
      return cache.addAll(urlsToCache);
    });
}

console.log('📱 MandarinPro PWA: Service Worker loaded successfully!');