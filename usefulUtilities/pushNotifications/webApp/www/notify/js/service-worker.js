//
// service-worker.js
// Created by Zach Fox on 2019-03-26
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

self.addEventListener('push', (event) => {
    console.log('Received a push event', event);

    const options = {
        "title": 'High Fidelity Ping!',
        "body": 'A user in High Fidelity has requested your presence!',
        "vibrate": [400, 100, 400, 100, 400],
        "tag": 'hifi-ping'
    };

    event.waitUntil(
        self.registration.showNotification('High Fidelity Ping!', options)
    );
});