//
// notif.js
// Created by Zach Fox on 2019-03-26
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

// Tons of logic in here!
// 1. Registers the service worker JS with the browser's Navigator
// 2. Registers that service worker information with the push manager
// 3. Sends the subscription information to the server
// 4. Updates the UI based on error/success
function registerServiceWorker() {
    return navigator.serviceWorker.register('service-worker.js')
        .then(function () {
            return navigator.serviceWorker.ready;
        })
        .then(function (registration) {
            registerWithPushManager(registration)
                .then((pushSubscription) => {
                    sendSubscriptionToServer(username.value, pushSubscription)
                        .then((response) => {
                            return response.json();
                        })
                        .then((responseJson) => {
                            var formContainer = document.getElementById("formContainer");
                            if (responseJson.data && responseJson.data.success) {
                                formContainer.innerHTML = `
                                    <p>You're all set! You'll receive High Fidelity Ping
                                    notifications on this device wherever you normally receive browser notifications.</p>
                                `;
                            } else {
                                formContainer.innerHTML = `
                                    <p>There was an error during registration. Please try again later.</p>
                                `;
                            }
                        })
                })
        })
        .catch(function (err) {
            console.error('Unable to register service worker.', err);
        });
}


// Updates the UI to show that they need to enable notifications for this site
function updateDisallowedPush() {
    var formContainer = document.getElementById("formContainer");
    formContainer.innerHTML = `
        <p>Please allow notifications! If you don't, High Fidelity Ping won't work.</p>
        <p>Refresh this page and try again, or use your browser's settings to enable notifications on this site.</p>
    `;
}


// Asks permission to show notifications to the user via browser push notifications
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
                updateDisallowedPush();
                return false;
            }
            return true;
        });
}


// Needed to ensure that the public key associated with the push manager subscription
// is sent in the right format
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')
        ;
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}


// Registers the service worker registration information with the push manager (remote server)
const PUSH_SERVER_PUBLIC_KEY = "BMfhiU0kwGPOkrgrmprsHCZILXnOjymrkb6Gfyg7b_Y0Z0EfWW0ztp_ctG9NQzctN6dTvPqEVgWNBvSg9fHVAYI";
function registerWithPushManager(registration) {
    const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUSH_SERVER_PUBLIC_KEY)
    };

    return registration.pushManager.subscribe(subscribeOptions)
        .catch(function (err) {
            console.error('Unable to register with push manager. Error: ' + err);
        });
}


// Sends the subscription information to the server for storage
// const SUBSCRIPTION_ENDPOINT = "http://localhost:3004/api/hifiPing/subscription";
const SUBSCRIPTION_ENDPOINT = "https://highfidelity.co/api/hifiPing/subscription";
function sendSubscriptionToServer(username, subscription) {
    var postBody = {
        "username": username,
        "subscription": subscription
    };

    return fetch(SUBSCRIPTION_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postBody)
    });
}


// Does simple form validation, then kicks off the push notification subscription process!
function submitForm() {
    var username = document.getElementById("username");
    if (username.value.length === 0) {
        return;
    }
    
    var submitButton = document.getElementById("submitButton");
    submitButton.disabled = true;

    askPermission()
        .then((retval) => {
            if (retval) {
                registerServiceWorker();
            }
        });
};


// Updates the UI to show that they can't use this browser for High Fidelity Ping
function updateNotCompatible() {
    var formContainer = document.getElementById("formContainer");
    formContainer.innerHTML = `
        <p>Your device does not support the technologies required for High Fidelity Ping. Please try a different browser.</p>
        <p>iOS does not currently support push notifications via a browser.</p>
    `;
}


// Kicks all of the logic off when the DOM loads.
// The "SUBMIT" button starts off disabled.
document.addEventListener("DOMContentLoaded", function (event) {
    if (!('serviceWorker' in navigator)) {
        updateNotCompatible();
        return;
    }

    if (!('PushManager' in window)) {
        updateNotCompatible();
        return;
    }

    var submitButton = document.getElementById("submitButton");
    submitButton.disabled = false;
});