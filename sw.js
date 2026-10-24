/* Still Here service worker: saves every file of the app on first visit, so it opens with no signal. */
const CACHE = "stillhere-v10";
const FILES = [
  "./", "index.html", "lite.html", "lite-hi.html", "cockpit.html", "manifest.webmanifest",
  "css/app.css", "css/cockpit.css",
  "css/apple/apple-system-colors.css", "css/apple/apple-buttons.css", "css/apple/apple-materials.css", "css/apple/apple-feedback.css",
  "js/icons.js", "js/geo.js", "js/data.js", "js/model.js", "js/map.js", "js/app.js", "js/cockpit.js", "js/sw-register.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"
];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("stillhere-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first, so a fix reaches every phone at once. With no signal, or after 3 seconds, the saved copy answers.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const net = fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then(res => { if (res && res.ok) c.put(req, res.clone()); return res; });
    const late = new Promise(r => setTimeout(r, 3000, null));
    try { const res = await Promise.race([net, late]); if (res) return res; } catch (err) {}
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try { return await net; } catch (err) {}
    if (req.mode === "navigate") return (await c.match("lite.html")) || (await c.match("index.html"));
    return new Response("", { status: 504 });
  }));
});
