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
function startup() {
    // Make an Ajax request to get the OpenTok API key, session ID, and token from the server
    fetch("https://hifi-test.herokuapp.com" + '/room/test')
        .then(function (res) {
            return res.json();
        })
        .then(function fetchJson(json) {
            apiKey = json.apiKey;
            sessionId = json.sessionId;
            token = json.token;

            initializeTokboxSession();
        })
        .catch(function catchErr(error) {
            handleError(error);
            alert('Failed to get opentok sessionId and token. Make sure you have updated the config.js file.');
        });
}
startup();

document.
