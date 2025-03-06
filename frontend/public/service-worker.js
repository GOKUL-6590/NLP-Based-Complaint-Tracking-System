self.addEventListener('push', (event) => {
    console.log('Push event received:', event);
    let data;
    try {
        data = event.data.json();  // Try parsing as JSON
        console.log('Parsed push data:', data);
    } catch (error) {
        console.error('Error parsing push data as JSON:', error);
        // Fallback: Treat as plain text if JSON fails
        data = { title: 'Notification', message: event.data.text() || 'No message' };
        console.log('Falling back to plain text:', data);
    }

    const title = data.title || 'Tikify Notification';
    const options = {
        body: data.message || 'No message provided',
        icon: './favicon3.png',
        data: { url: data.link_url || '/' }
    };
    console.log('Notification options:', options);

    event.waitUntil(
        self.registration.showNotification(title, options)
            .then(() => console.log('Notification shown successfully'))
            .catch((error) => console.error('Error showing notification:', error))
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.notification.data);
    event.notification.close();
    const url = event.notification.data.url || '/';
    event.waitUntil(clients.openWindow(url));
});