const clearCaches = async () => {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
};

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await clearCaches();
      await self.registration.unregister();

      const clientsList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      await Promise.all(
        clientsList.map((client) => {
          if ('navigate' in client) {
            return client.navigate(client.url);
          }
          return Promise.resolve();
        }),
      );
    })(),
  );
});
