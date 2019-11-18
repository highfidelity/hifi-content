'use strict';
//  screenshareClient.js
//
//  Created by Milad Nazeri and Zach Fox 10/30/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

// Helpers
function handleError(error) {
    if (error) {
        console.error(error);
    }
}

// Tokbox

// Needed to create the session from Tokbox.
// 1. Uses the projectAPIKey and sessionID to init a tokbox session
// 2. Once someone creats a stream to that sessionID, we subscribe to it using
// options from the tokbox configuration.
var session;
function initializeTokboxSession() {
    session = OT.initSession(projectAPIKey, sessionID);
    session.on('streamCreated', function streamCreated(event) {
        var subscriberOptions = {
            insertMode: 'append',
            width: '100%',
            height: '100%'
        };
        session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
    });

    session.on('sessionDisconnected', function sessionDisconnected(event) {
        console.log('You were disconnected from the session.', event.reason);
    });

    // Connect to the session
    session.connect(token, function callback(error) {
        if (error) {
            handleError(error);
        }
    });
}


// main
var projectAPIKey;
var sessionID;
var token;
function onScriptEventReceived(message){    
    if (message.app !== "screenshare") {
        return;
    }
    var data = message.data;

    switch (message.method) {
        case "receiveConnectionInfo":
            projectAPIKey = data.projectAPIKey;
            sessionID = data.sessionID;
            token = data.token;
            initializeTokboxSession();
            break;
        default:
            console.log("screenshareClient.js: Unrecognized command from on script event received")
            break;
    }
}

// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            app: "screenshare",
            method: "eventBridgeReady"
        }));
    }, EVENTBRIDGE_SETUP_DELAY);

}

onLoad();

