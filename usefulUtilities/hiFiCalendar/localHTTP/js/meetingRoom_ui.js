// meetingRoom_ui.js
//
//  Created by Mark Brosche on 4-24-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

var YOUR_CLIENT_ID = '813544734011-9jocg5lgsttogf5gnr45pb4kgpie3brg.apps.googleusercontent.com';
var YOUR_REDIRECT_URI = 'http://127.0.0.1:90/localHTTP/meetingRoom_ui.html';
var SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/drive.file'
];
var fragmentString = location.hash.substring(1);

// Parse query string to see if page request is coming from OAuth 2.0 server.
var params = {};
var regex = /([^&=]+)=([^&]*)/g, m;
while (m = regex.exec(fragmentString)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
}
if (Object.keys(params).length > 0) {
    localStorage.setItem('oauth2-test-params', JSON.stringify(params) );
    getCalendars();
}

// If there's an access token, try an API request.
// Otherwise, start OAuth 2.0 flow.
var calendarList;
function getCalendars() {
    var params = JSON.parse(localStorage.getItem('oauth2-test-params'));
    if (params && params['access_token']) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET',
            'https://www.googleapis.com/calendar/v3/users/me/calendarList?' +
            'access_token=' + params['access_token']);
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
                calendarList = xhr.response;
                console.log(calendarList);
            } else if (xhr.readyState === 4 && xhr.status === 401) {
            // Token invalid, so prompt for user permission.
                oauth2SignIn();
            }
        };
        xhr.send(null);
    } else {
        oauth2SignIn();
    }
    connectorPage();
}

function connectorPage() {
    document.getElementById("loginPage").style.display = 'none';
    document.getElementById("connectorPage").style.display = 'initial';
}

function connectionSuccess() {

}

function viewLinkedSpaces() {

}

function errorPage() {
    
}

/*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
function oauth2SignIn() {
    // Google's OAuth 2.0 endpoint for requesting an access token
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Create element to open OAuth 2.0 endpoint in new window.
    var form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    var params = {
        'client_id': YOUR_CLIENT_ID,
        'redirect_uri': YOUR_REDIRECT_URI,
        'scope': 'https://www.googleapis.com/auth/calendar.readonly',
        'state': 'try_sample_request',
        'include_granted_scopes': 'true',
        'response_type': 'token'
    };

    // Add form parameters as hidden input values.
    for (var p in params) {
        var input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p]);
        form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
}

function revokeAccess(accessToken) {
    // Google's OAuth 2.0 endpoint for revoking access tokens.
    var revokeTokenEndpoint = 'https://accounts.google.com/o/oauth2/revoke';
  
    // Create <form> element to use to POST data to the OAuth 2.0 endpoint.
    var form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', revokeTokenEndpoint);
  
    // Add access token to the form so it is set as value of 'token' parameter.
    // This corresponds to the sample curl request, where the URL is:
    //      https://accounts.google.com/o/oauth2/revoke?token={token}
    var tokenField = document.createElement('input');
    tokenField.setAttribute('type', 'hidden');
    tokenField.setAttribute('name', 'token');
    tokenField.setAttribute('value', accessToken);
    form.appendChild(tokenField);
  
    // Add form to page and submit it to actually revoke the token.
    document.body.appendChild(form);
    form.submit();
}
/*
// Load the API's client and auth2 modules.
// Call the initClient function after the modules load.
var API_KEY = '';
var CLIENT_ID = '';
var CLIENT_SECRET = '';
var SCOPE = 'https://www.googleapis.com/auth/calendar.events.readonly'; //need more of these
var authCode = false;
var GoogleAuth;
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}


function initClient() {
    var discoveryUrlCalendar = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
    var discoveryUrlDrive = 'https://www.googleapis.com/discovery/v1/apis/drive/v2/rest'; //check if this is right
    gapi.client.init({
        'apiKey': API_KEY,
        'discoveryDocs': [discoveryUrlCalendar, discoveryUrlDrive],
        'clientId': CLIENT_ID,
        'scope': SCOPE
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();

        // Listen for sign-in state changes.
        GoogleAuth.isSignedIn.listen(updateSigninStatus);
        GoogleAuth.grantOfflineAccess().then(function (response) {
            authCode = response.code;
            var zone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2];
            EventBridge.emitWebEvent(JSON.stringify({
                type: "AUTHCODE",
                authCode: authCode,
                clientID: CLIENT_ID,
                secret: CLIENT_SECRET,
                timezone: zone,
                calendars: JSON.stringify({
                    calendarId: id,
                    roomID: uuid // clearly not finished!
                })
            }));
        });
        // Handle initial sign-in state. (Determine if user is already signed in.)
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        var user = GoogleAuth.currentUser.get();
        setSigninStatus();

        // Call handleAuthClick function when user clicks on
        //      "Sign In/Authorize" button.
        $('#sign-in-or-out-button').click(function() {
            handleAuthClick();
        }); 
        $('#revoke-access-button').click(function() {
            revokeAccess();
        }); 
    });
}


function handleAuthClick() {
    if (GoogleAuth.isSignedIn.get()) {
        // User is authorized and has clicked 'Sign out' button.
        GoogleAuth.signOut();
    } else {
        // User is not signed in. Start Google auth flow.
        GoogleAuth.signIn();
    }
}


function revokeAccess() {
    GoogleAuth.disconnect();
}


function setSigninStatus() {
    var user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(SCOPE);

    if (isAuthorized) {
        $('#sign-in-or-out-button').html('Sign out');
        $('#revoke-access-button').css('display', 'inline-block');
        $('#auth-status').html('You are currently signed in and have granted ' +
            'access to this app.');                
    } else {
        $('#sign-in-or-out-button').html('Sign In/Authorize');
        $('#revoke-access-button').css('display', 'none');
        $('#auth-status').html('You have not authorized this app or you are ' +
            'signed out.');
    }
}


function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}
*/

function onScriptEventReceived(data) {
    data = JSON.parse(data);
    switch (data.type) {
        case "buttonStatus":
            loginButton.checked = data.value;
            break;
        case "SETUP MEETING ROOM":
            break;
    }
}

// Buttons by Page
// Login Page
var loginButton = document.getElementById("login");
loginButton.addEventListener("click", getCalendars);
// Connector Page
var calendarDropdownButton = document.getElementById('selectedCalendar');
var helpButton = document.getElementById('help');
var roomDropdownButton = document.getElementById('selectedRoom');
var revokeButton = document.getElementById('revoke');
var linkerButton = document.getElementById('linker');
calendarDropdownButton.addEventListener('click');
helpButton.addEventListener('click');
roomDropdownButton.addEventListener('click');
revokeButton.addEventListener('click', revokeAccess);
linkerButton.addEventListener('click');
// Connection Successful Page
var viewAllButton = document.getElementById('viewAll');
var connectAgainButton = document.getElementById('connector');
viewAllButton.addEventListener('click');
connectAgainButton.addEventListener('click');
// View Links Page

// Error Page


// Set the text of the button to either On or Off 
// when opening the tablet app, based on the app script status.
// var EVENT_BRIDGE_SETUP_DELAY = 100; 
// function onLoad(){
//     // setTimeout(() => {
//     EventBridge.scriptEventReceived.connect(onScriptEventReceived);    
//     EventBridge.emitWebEvent(JSON.stringify({
//         type: "EVENT_BRIDGE_OPEN_MESSAGE"
//     }));   
//     // }, EVENT_BRIDGE_SETUP_DELAY);
// }
// onLoad();