// Nombre del caché para esta versión de la aplicación
const CACHE_NAME = 'finanzas-app-v1';

// Lista de todos los archivos que deben ser cacheados para uso offline
const urlsToCache = [
  'index.html',
  'manifest.json',
  // Si usas un service worker, también deberías cachear tus scripts y librerías clave.
  'https://cdn.tailwindcss.com' 
];

// Evento: Instalar Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker instalado: Cacheando archivos.');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento: Activar Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Elimina cachés viejos
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento: Fetch (Manejo de solicitudes de red)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Intentamos obtener las transacciones (GET)
  // Siempre vamos a la red para la conexión con Apps Script, pero devolvemos la respuesta de caché 
  // para todos los demás archivos estáticos (HTML, CSS, etc.).
  if (url.pathname.includes('/exec')) {
      // Para Apps Script, intentar la red y luego el caché (si falla la red)
      event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
      return;
  }


  // Para todos los demás archivos (HTML, librerías, etc.), usamos la estrategia Cache-First
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve el archivo cacheados si existe
        if (response) {
          return response;
        }
        // Si no está en caché, va a la red
        return fetch(event.request);
      })
  );
});
