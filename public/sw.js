/* ============================================================
   LISA Service Worker - PWA Offline, Cache, Background Sync, Push
   ============================================================ */

const SW_VERSION = "lisa-sw-v1.1.0";

// Static assets to cache immediately on install
const STATIC_CACHE = "lisa-static-v1";
const DYNAMIC_CACHE = "lisa-dynamic-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icon.png",
  "/hero.jpg",
  "/as1.png",
  "/as2.png",
  "/as3.png",
  "/as4.png",
];

// Background Sync queue names
const SYNC_LESSON_PROGRESS = "lisa-lesson-progress-sync";
const SYNC_EXERCISE_RESULTS = "lisa-exercise-results-sync";

// Hosts that should use network-first strategy
const NETWORK_FIRST_HOSTS = [
  "supabase.co",
  "googleapis.com",
  "google.com",
];

// Cache-first hosts (CDN assets, fonts, external scripts)
const CACHE_FIRST_HOSTS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "code.responsivevoice.org",
];

/* ============================================================
   INSTALL - Pre-cache static shell
   ============================================================ */
self.addEventListener("install", (event) => {
  console.log("[SW] Installing", SW_VERSION);
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn("[SW] Pre-cache failed:", err))
  );
});

/* ============================================================
   ACTIVATE - Clean up old caches
   ============================================================ */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating", SW_VERSION);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ============================================================
   FETCH - Intelligent caching strategies
   ============================================================ */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (those go through Background Sync)
  if (request.method !== "GET") return;

  // Skip browser-extension requests
  if (!url.protocol.startsWith("http")) return;

  // Skip Supabase auth/realtime WebSocket
  if (url.pathname.includes("/realtime/")) return;

  // ── Strategy: Cache-First (fonts, CDN, external static assets) ──
  const isCacheFirst = CACHE_FIRST_HOSTS.some((h) => url.hostname.includes(h));
  if (isCacheFirst) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── Strategy: Network-First (Supabase API, Gemini API) ──
  const isNetworkFirst = NETWORK_FIRST_HOSTS.some((h) =>
    url.hostname.includes(h)
  );
  if (isNetworkFirst) {
    event.respondWith(networkFirst(request));
    return;
  }

  // ── Strategy: Stale-While-Revalidate for app shell (SPA routes) ──
  if (url.pathname.startsWith("/") || url.pathname === "/index.html") {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // ── Default: Network-first with cache fallback ──
  event.respondWith(networkFirst(request));
});

/* ============================================================
   Cache Strategies
   ============================================================ */

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Resource unavailable offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // For navigation requests, return offline page
    if (request.mode === "navigate") {
      return caches.match("/offline.html");
    }
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // Return cached immediately; update in background
  if (cached) {
    // Trigger background revalidation
    networkFetch;
    return cached;
  }

  // No cache — wait for network
  const response = await networkFetch;
  if (response) return response;

  // Fallback to app shell
  const shell = await cache.match("/index.html");
  if (shell) return shell;

  return caches.match("/offline.html");
}

/* ============================================================
   BACKGROUND SYNC - Replay queued offline requests
   ============================================================ */
self.addEventListener("sync", (event) => {
  console.log("[SW] Background Sync:", event.tag);

  if (event.tag === SYNC_LESSON_PROGRESS) {
    event.waitUntil(replayQueue(SYNC_LESSON_PROGRESS));
  }
  if (event.tag === SYNC_EXERCISE_RESULTS) {
    event.waitUntil(replayQueue(SYNC_EXERCISE_RESULTS));
  }
});

async function replayQueue(queueName) {
  const db = await openDB();
  const items = await getAllFromStore(db, queueName);

  for (const item of items) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      });
      if (response.ok) {
        await deleteFromStore(db, queueName, item.id);
        console.log(`[SW] Synced queued item: ${item.id}`);
      }
    } catch (err) {
      console.warn(`[SW] Failed to sync item ${item.id}:`, err);
    }
  }
}

/* ============================================================
   PUSH NOTIFICATIONS - Receive & display
   ============================================================ */
self.addEventListener("push", (event) => {
  console.log("[SW] Push received");

  let payload = {
    title: "LISA Learning Reminder",
    body: "Time for today's lesson! Keep your streak alive 🔥",
    icon: "/icon.png",
    badge: "/icon.png",
    tag: "lisa-reminder",
    data: { url: "/" },
  };

  if (event.data) {
    try {
      const data = event.data.json();
      payload = { ...payload, ...data };
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || "/icon.png",
    badge: payload.badge || "/icon.png",
    tag: payload.tag || "lisa-notification",
    data: payload.data || { url: "/" },
    vibrate: [200, 100, 200],
    actions: [
      { action: "open", title: "Open LISA" },
      { action: "dismiss", title: "Later" },
    ],
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

/* ============================================================
   NOTIFICATION CLICK - Navigate app on click
   ============================================================ */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing tab if open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Open new tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

/* ============================================================
   NOTIFICATION CLOSE
   ============================================================ */
self.addEventListener("notificationclose", () => {
  console.log("[SW] Notification dismissed by user");
});

/* ============================================================
   MESSAGE from main thread (e.g. queue offline request)
   ============================================================ */
self.addEventListener("message", (event) => {
  const { type, queueName, payload, title, options } = event.data || {};

  // Show a notification from the main thread (reliable on mobile PWA)
  if (type === "SHOW_NOTIFICATION") {
    event.waitUntil(
      self.registration.showNotification(title || "LISA", options || {})
    );
    return;
  }

  if (type === "QUEUE_REQUEST") {
    openDB().then((db) => {
      addToStore(db, queueName, {
        id: Date.now() + Math.random(),
        url: payload.url,
        method: payload.method,
        headers: payload.headers,
        body: payload.body,
        timestamp: Date.now(),
      });
    });
  }

  if (type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* ============================================================
   IndexedDB helpers for offline queue persistence
   ============================================================ */
const DB_NAME = "lisa-offline-queue";
const DB_VERSION = 1;
const STORES = [SYNC_LESSON_PROGRESS, SYNC_EXERCISE_RESULTS];

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      STORES.forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function addToStore(db, storeName, item) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function deleteFromStore(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
