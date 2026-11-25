const VERSION = "2.80.4";
const CACHE_PREFIX = "autonomy-technologies-site-v";
const CACHE = CACHE_PREFIX + VERSION;
// Visited pages and opened PDFs live outside the versioned cache, so a release does not wipe them.
const SAVED = "autonomy-technologies-pages";
const SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./assets/search.json",
  "./assets/graph-orb.json",
  "./assets/favicon.svg",
  "./assets/favicon-32.png",
  "./assets/apple-touch-icon.png",
  "./assets/fonts/hanken-grotesk-latin.woff2",
  "./css/guide.css",
  "./css/index.css",
  "./css/lab.css",
  "./css/sheet.css",
  "./css/system.css",
  "./js/concept-map.js",
  "./js/guide.js",
  "./js/hud.js",
  "./js/index.js",
  "./js/lab.js",
  "./js/nav.js",
  "./js/offline.js",
  "./js/orb.js",
  "./js/progress.js",
  "./js/search.js",
  "./js/settings.js",
  "./js/tooltip.js",
  "./js/whatsnew.js",
];

self.addEventListener("install", (event) => {
  // "reload" skips the browser's HTTP cache, so a new version never stores the previous release's files.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => keepSaved(key).then(() => caches.delete(key)))))
      .then(() => self.clients.claim())
  );
});

function isSaved(url) {
  return url.pathname.endsWith(".html") || url.pathname.endsWith(".pdf");
}

// Moves visited pages and PDFs out of an old versioned cache before it is deleted.
function keepSaved(key) {
  return Promise.all([caches.open(key), caches.open(SAVED)]).then(([old, saved]) => old.keys().then((requests) =>
    Promise.all(requests.filter((request) => isSaved(new URL(request.url))).map((request) =>
      saved.match(request).then((have) => have || old.match(request).then((response) => response && saved.put(request, response)))
    ))
  ));
}

function pagesAvailable() {
  return Promise.all([CACHE, SAVED].map((key) => caches.open(key).then((cache) => cache.keys()))).then((lists) => {
    const scope = new URL(self.registration.scope),
      seen = new Set();
    return lists.flat().map((request) => new URL(request.url)).filter((url) => {
      if (seen.has(url.href)) return false;
      seen.add(url.href);
      return url.origin === scope.origin && url.pathname.startsWith(scope.pathname) && url.pathname.endsWith(".html") && !url.pathname.endsWith("/offline.html");
    });
  });
}

function tellClients() {
  return pagesAvailable().then((pages) => self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => client.postMessage({ type: "offline-count", count: pages.length }));
  }));
}

function fetchPage(request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  return fetch(new Request(request, { signal: controller.signal })).finally(() => clearTimeout(timeout));
}

function pageResponse(request, event) {
  return caches.open(SAVED).then((cache) => fetchPage(request).then((response) => {
    if (!response.ok) return caches.match(request).then((saved) => saved || response);
    event.waitUntil(cache.put(request, response.clone()).then(tellClients));
    return response;
  }).catch(() => caches.match(request).then((saved) => saved || Response.redirect(new URL("offline.html", self.registration.scope).href, 302))));
}

function assetResponse(request, event) {
  return caches.open(isSaved(new URL(request.url)) ? SAVED : CACHE).then((cache) => cache.match(request).then((saved) => {
    const update = fetch(request).then((response) => {
      if (!response.ok) return response;
      return cache.put(request, response.clone()).then(() => response);
    });
    if (saved) {
      event.waitUntil(update.catch(() => {}));
      return saved;
    }
    return update.catch(() => new Response("", { status: 503, statusText: "Offline" }));
  }));
}

self.addEventListener("message", (event) => {
  if (event.data && (event.data.type === "offline-count" || event.data.type === "offline-pages") && event.ports[0]) {
    event.waitUntil(pagesAvailable().then((pages) => event.ports[0].postMessage({
      count: pages.length,
      pages: event.data.type === "offline-pages" ? pages.map((url) => url.href) : undefined,
    })));
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url),
    scope = new URL(self.registration.scope);
  if (request.method !== "GET" || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (request.mode === "navigate" || url.pathname.endsWith(".html")) event.respondWith(pageResponse(request, event));
  else event.respondWith(assetResponse(request, event));
});
