//
// service-worker.js
// Created by Zach Fox on 2019-03-26
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

self.addEventListener('push', (event) => {
    console.log('Received a push event', event)

    const options = {
        title: 'I got a message for you!',
        body: 'Here is the body of the message',
        icon: '/img/icon-192x192.png',
        tag: 'tag-for-this-notification',
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
    )
});