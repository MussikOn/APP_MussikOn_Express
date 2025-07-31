// Service Worker para Notificaciones Push
// MussikOn Admin System

const CACHE_NAME = 'mussikon-admin-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Instalación completada');
        return self.skipWaiting();
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activación completada');
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devolver cache si existe, sino hacer fetch
        return response || fetch(event.request);
      })
  );
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notificación push recibida');
  
  let notificationData = {
    title: 'MussikOn',
    body: 'Nueva notificación',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'mussikon-notification',
    data: {
      url: '/dashboard',
      timestamp: new Date().toISOString()
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-192x192.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };

  // Si hay datos en la notificación push, usarlos
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (error) {
      console.error('Error al parsear datos de notificación push:', error);
    }
  }

  const notificationPromise = self.registration.showNotification(
    notificationData.title,
    notificationData
  );

  event.waitUntil(notificationPromise);
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notificación clickeada');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Abrir la aplicación cuando se hace clic en la notificación
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }

      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        const urlToOpen = event.notification.data?.url || '/dashboard';
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notificación cerrada');
  
  // Aquí puedes enviar analytics o hacer otras acciones cuando se cierra la notificación
  const notificationData = {
    notificationId: event.notification.tag,
    timestamp: new Date().toISOString(),
    action: 'close'
  };

  // Enviar datos de analytics (opcional)
  if (self.registration.pushManager) {
    // Enviar datos al servidor si es necesario
    console.log('Analytics: Notificación cerrada', notificationData);
  }
});

// Manejar errores del Service Worker
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error:', event.error);
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('Service Worker: Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Función para mostrar notificación local
function showLocalNotification(title, options = {}) {
  const defaultOptions = {
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'mussikon-local-notification',
    requireInteraction: false,
    silent: false
  };

  return self.registration.showNotification(title, {
    ...defaultOptions,
    ...options
  });
}

// Función para obtener suscripciones activas
async function getActiveSubscriptions() {
  try {
    const registration = await self.registration;
    const subscriptions = await registration.pushManager.getSubscriptions();
    return subscriptions;
  } catch (error) {
    console.error('Error al obtener suscripciones:', error);
    return [];
  }
}

// Función para suscribirse a notificaciones push
async function subscribeToPushNotifications(vapidPublicKey) {
  try {
    const registration = await self.registration;
    
    // Convertir VAPID public key
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    
    // Suscribirse
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    });

    console.log('Suscripción push creada:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error al suscribirse a notificaciones push:', error);
    throw error;
  }
}

// Función para cancelar suscripción
async function unsubscribeFromPushNotifications() {
  try {
    const registration = await self.registration;
    const subscriptions = await registration.pushManager.getSubscriptions();
    
    for (const subscription of subscriptions) {
      await subscription.unsubscribe();
    }

    console.log('Suscripciones push canceladas');
    return true;
  } catch (error) {
    console.error('Error al cancelar suscripciones:', error);
    return false;
  }
}

// Función auxiliar para convertir VAPID public key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = self.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Función auxiliar para convertir ArrayBuffer a base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return self.btoa(binary);
}

console.log('Service Worker: Cargado correctamente'); 