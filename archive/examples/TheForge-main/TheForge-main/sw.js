// Service Worker for GRUDGE NFT Island Catalog
// Provides offline caching and performance improvements

const CACHE_NAME = 'grudge-catalog-v2.0.0';
const urlsToCache = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    './items_data.json',
    './crafting_data.json',
    // Cache some common icons
    './icons/armor/Belt_01.png',
    './icons/armor/Chest_01.png',
    './icons/weapons/Sword_01.png',
    './icons/resources/Loot_01.png',
    './icons/misc/Core.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching app resources');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.warn('⚠️ Cache install failed:', error);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
            .catch(() => {
                // If both cache and network fail, return offline page
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
