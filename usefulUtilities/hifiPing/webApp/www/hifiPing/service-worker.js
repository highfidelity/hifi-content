//
// service-worker.js
// Created by Zach Fox on 2019-03-26
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

// Handles push notification events!
self.addEventListener('push', (event) => {
    var eventData = event.data.json();

    // I would love to have the "image" option show the hero image associated
    // with the domain you'd go to if you clicked the notification, but, because
    // the High Fidelity Metaverse API doesn't have CORS headers set, I can't request
    // data from https://metaverse.highfidelity.com/api/v1/places/* from highfidelity.co
    const options = {
        "title": 'High Fidelity Ping',
        "body": `${eventData.senderDisplayName} in High Fidelity has requested your presence.`,
        "vibrate": [400, 400, 400, 400, 400],
        "tag": 'hifi-ping',
        "renotify": true,
        "requireInteraction": true,
        "badge": "https://highfidelity.co/hifiPing/images/hifi.png",
        "icon": "https://highfidelity.co/hifiPing/images/hifi.png",
        "actions": [{
            "action": "go",
            "title": "Go There Now"
        }],
        "data": eventData.senderHref
    };

    event.waitUntil(
        self.registration.showNotification(options.title, options)
    );
});


// Handles the case when the user clicks the notification
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === "go") {
        clients.openWindow(event.notification.data);
    }
});