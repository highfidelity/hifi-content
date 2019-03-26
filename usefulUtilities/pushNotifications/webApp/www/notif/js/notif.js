//
// notif.js
// Created by Zach Fox on 2019-03-26
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

function registerServiceWorker() {
    return navigator.serviceWorker.register('service-worker.js')
        .then(function (registration) {
            console.log(`Service worker successfully registered with scope: ${registration.scope}`);
        })
        .catch(function (err) {
            console.error('Unable to register service worker.', err);
        });
}

function askPermission() {
    return new Promise(function (resolve, reject) {
        const permissionResult = Notification.requestPermission(function (result) {
            resolve(result);
        });

        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    })
        .then(function (permissionResult) {
            if (permissionResult !== 'granted') {
                throw new Error('Permission denied!');
            }
        });
}

const PUSH_SERVER_PUBLIC_KEY = "BMfhiU0kwGPOkrgrmprsHCZILXnOjymrkb6Gfyg7b_Y0Z0EfWW0ztp_ctG9NQzctN6dTvPqEVgWNBvSg9fHVAYI";
function subscribeUserToPush() {
    return navigator.serviceWorker.register('service-worker.js')
        .then(function (registration) {
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(PUSH_SERVER_PUBLIC_KEY)
            };

            return registration.pushManager.subscribe(subscribeOptions);
        })
        .then(function (pushSubscription) {
            console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
            return pushSubscription;
        });
}


const SUBSCRIPTION_ENDPOINT = "https://localhost:8000/api/subscription";
function sendSubscriptionToServer(subscription) {
    return fetch(SUBSCRIPTION_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error('An error occurred')
            }
            return res.json();
        })
        .then((resData) => {
            if (!(resData.data && resData.data.success)) {
                throw new Error('An error occurred');
            }
        })
}

if (!('serviceWorker' in navigator)) {
    // Service Worker isn't supported on this browser, disable or hide UI.
    return;
}

if (!('PushManager' in window)) {
    // Push isn't supported on this browser, disable or hide UI.
    return;
}

document.addEventListener("DOMContentLoaded", function (event) {
    registerServiceWorker()
        .then((registration) => {
            askPermission()
                .then(() => {
                    subscribeUserToPush()
                        .then((pushSubscription) => {
                            sendSubscriptionToServer(JSON.stringify(pushSubscription));
                        })
                })
        }, (err) => {
            console.log(`Service Worker registration failed: ${err}`)
        });
});