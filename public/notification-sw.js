/* eslint-disable no-restricted-globals */

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const { type, title, options } = event.data;

  if (type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(title, {
      ...options,
      actions: [
        {
          action: 'open',
          title: 'Open',
        },
      ],
    });
  }
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return (client as WindowClient).focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

self.addEventListener('notificationclose', () => {
  // Handle notification close if needed
});
