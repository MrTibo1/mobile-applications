const CACHE_NAME = 'household-pwa-v3';
const APP_SHELL = [
  '',
  'manifest.json',
  'household-icon.svg',
  'household-icon-192.png',
  'household-icon-512.png',
];
const APP_ROUTES = [
  '',
  'tasks',
  'shopping',
  'household',
  'login',
  'register',
  '_sitemap',
  '+not-found',
  'shopping/[id]',
  'details/[id]',
];

function appUrl(path) {
  return new URL(path, self.registration.scope);
}

function cacheResponse(request, response) {
  if (!response.ok) {
    return Promise.resolve(response);
  }

  return caches.open(CACHE_NAME)
    .then((cache) => cache.put(request, response.clone()))
    .then(() => response)
    .catch((error) => {
      console.error('Unable to cache an app resource.', error);
      return response;
    });
}

function getLocalAssets(html) {
  const assetUrls = new Set();
  const tags = html.match(/<(?:script|link)\b[^>]*>/gi) || [];

  for (const tag of tags) {
    const isScript = /^<script\b/i.test(tag);
    const isPreload = /^<link\b/i.test(tag) &&
      /\brel=["'](?:preload|stylesheet|modulepreload|icon|apple-touch-icon)["']/i.test(tag);
    if (!isScript && !isPreload) continue;

    const urlMatch = tag.match(/\b(?:src|href)=["']([^"']+)["']/i);
    if (!urlMatch) continue;

    try {
      const url = new URL(urlMatch[1], self.registration.scope);
      if (url.origin === self.location.origin) assetUrls.add(url.href);
    } catch (error) {
      console.warn('Skipping an invalid app asset URL.', error);
    }
  }

  return assetUrls;
}

async function precacheRoute(cache, route, assetUrls) {
  const htmlPaths = route === '' ? ['', 'index.html'] : [route, `${route}.html`];
  let routeCached = false;

  for (const path of htmlPaths) {
    try {
      const response = await fetch(appUrl(path), { cache: 'reload' });
      if (!response.ok) continue;

      if (!routeCached) {
        await cache.put(appUrl(route), response.clone());
        routeCached = true;
      }

      const pageAssets = getLocalAssets(await response.text());
      for (const assetUrl of pageAssets) assetUrls.add(assetUrl);
    } catch (error) {
      console.warn(`Unable to precache app route "${path}".`, error);
    }
  }

  if (!routeCached) console.warn(`No offline page could be cached for route "${route}".`);
}

async function precacheAsset(cache, assetUrl) {
  try {
    const response = await fetch(assetUrl, { cache: 'reload' });
    if (!response.ok) {
      console.warn(`Unable to precache app asset "${assetUrl}": ${response.status}.`);
      return;
    }
    await cache.put(assetUrl, response);
  } catch (error) {
    console.warn(`Unable to precache app asset "${assetUrl}".`, error);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL.map(appUrl));

      const assetUrls = new Set();
      for (const route of APP_ROUTES) {
        await precacheRoute(cache, route, assetUrls);
      }
      await Promise.all([...assetUrls].map((assetUrl) => precacheAsset(cache, assetUrl)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('household-pwa-') && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);
  const appScope = new URL(self.registration.scope);

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    if (!requestUrl.pathname.startsWith(appScope.pathname)) return;
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(async () =>
          (await caches.match(request)) || (await caches.match(appUrl(''))) || Response.error()),
    );
    return;
  }

  if (!['script', 'style', 'image', 'font'].includes(request.destination)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => cacheResponse(request, response));
    }),
  );
});
