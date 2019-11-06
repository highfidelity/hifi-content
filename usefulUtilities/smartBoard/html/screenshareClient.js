/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

// Helpers
function handleError(error) {
    if (error) {
        console.error(error);
    }
}

// Tokbox
var apiKey;
var sessionId;
var token;


var session;

function initializeTokboxSession() {
    session = OT.initSession(apiKey, sessionId);
    session.on('streamCreated', function streamCreated(event) {
        if (event.stream.id === sessionId) {
            console.log("EVENT FROM STREAM CREATED", JSON.stringify(event));
        }
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
function onScriptEventReceived(message){
    try {
        message = JSON.parse(message);
        var data = message.data;
        switch (message.type) {
            case "receiveConnectionInfo":
                apiKey = data.apiKey;
                sessionId = data.sessionId;
                token = data.token;
                initializeTokboxSession();
                break;
            default:
                console.log("screenshareClient.js: Unrecognized command from on script event received")
                break;
        }
    } catch (e) {
        console.log("screenshareClient.js: error parsing incoming message");
    }
}

// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            app: "appreciate",
            method: "eventBridgeReady"
        }));
    }, EVENTBRIDGE_SETUP_DELAY);

}

onLoad();

