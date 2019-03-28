//
// service-worker.js
// Created by Zach Fox on 2019-03-26
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

self.addEventListener('push', (event) => {
    console.log('Received a push event with data:', JSON.stringify(event.data.json()));

    // I would love to have the "image" option show the hero image associated
    // with the domain you'd go to if you clicked the notification, but, because
    // the High Fidelity Metaverse API doesn't have CORS headers set, I can't request
    // data from https://metaverse.highfidelity.com/api/v1/places/* from highfidelity.co
    const options = {
        "title": 'High Fidelity Ping!',
        "body": 'A user in High Fidelity has requested your presence!',
        "vibrate": [400, 400, 400, 400, 400],
        "tag": 'hifi-ping',
        "renotify": true,
        "requireInteraction": true,
        "badge": "https://highfidelity.co/notify/images/hifi.png",
        "icon": "https://highfidelity.co/notify/images/hifi.png"
    };

    event.waitUntil(
        self.registration.showNotification(options.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    return clients.openWindow('hifi://valefox');
});