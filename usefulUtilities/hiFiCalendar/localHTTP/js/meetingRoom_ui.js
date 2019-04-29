// meetingRoom_ui.js
//
//  Created by Mark Brosche on 4-24-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

var YOUR_CLIENT_ID = '';
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
    localStorage.setItem('oauth2-test-params', JSON.stringify(params));
    getCalendars();
}

// If there's an access token, try an API request.
// Otherwise, start OAuth 2.0 flow.
var calendarList;
var resources = [];
function getCalendars() {
    var params = JSON.parse(localStorage.getItem('oauth2-test-params'));
    if (params && params['access_token']) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET',
            'https://www.googleapis.com/calendar/v3/users/me/calendarList?' +
            'access_token=' + params['access_token']);
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    calendarList = JSON.parse(xhr.response);
                    for (var i = 0; i < calendarList.items.length; i++) {
                        resources.push({
                            "address": calendarList.items[i].id,
                            "name": calendarList.items[i].summary
                        });                    
                    }
                    localStorage.setItem('resources', JSON.stringify(resources));
                    connectorPage("LOGIN");
                } catch (e) {
                    console.log(e, " FAILED PARSING");
                }
            } else if (xhr.readyState === 4 && xhr.status === 401) {
            // Token invalid, so prompt for user permission.
                oauth2SignIn();
            }
        };
        xhr.send(null);
    } else {
        oauth2SignIn();
    }
}
var LOGIN_PAGE = document.getElementById("loginPage");
var CONNECTOR_PAGE = document.getElementById("connectorPage");
var SUCCESS_PAGE = document.getElementById('linkSuccessPage');
var VIEW_ALL_PAGE = document.getElementById('allLinksPage');
var ERROR_PAGE = document.getElementById('errorPage');
var pages = [
    LOGIN_PAGE,
    CONNECTOR_PAGE,
    SUCCESS_PAGE,
    VIEW_ALL_PAGE,
    ERROR_PAGE
];

function changePages(currentPage, newPage) {
    switch (currentPage) {
        case "LOGIN":
            console.log("login");
            loginButton.removeEventListener('click', getCalendars);
            break;
        case "CONNECT":
            console.log("connect");
            helpButton.removeEventListener('click', errorPage);
            revokeButton.removeEventListener('click', revokeAccess);
            logoutButton.removeEventListener('click', signOut);
            linkerButton.removeEventListener('click', connectionSuccess);
            break;
        case "SUCCESS":
            viewAllButton.removeEventListener('click', viewLinkedSpaces);
            connectAgainButton.removeEventListener('click', connectorPage);
            revokeButton2.removeEventListener('click', revokeAccess);
            logoutButton2.removeEventListener('click', signOut);
            break;
        case "VIEW":
            connectAgainButton2.removeEventListener('click', connectorPage);
            revokeButton3.removeEventListener('click', revokeAccess);
            logoutButton3.removeEventListener('click', signOut);
            for (var i = 0; i < trashButtons.length; i++) {
                trashButtons[i].removeEventListener('click', deleteTableRow);
                editButtons[i].removeEventListener('click', editTableRow);
            }
            trashButtons = [];
            editButtons = [];
            break;
        case "ERROR":
            backButton.removeEventListener('click', getCalendars);
            break;  
    }
    switch (newPage) {
        case "LOGIN":
            console.log("login");
            showHidePages(0);
            loginButton.addEventListener('click', getCalendars);
            break;
        case "CONNECT":
            console.log("connect");
            showHidePages(1);
            helpButton.addEventListener('click', errorPage);
            revokeButton.addEventListener('click', revokeAccess);
            logoutButton.addEventListener('click', signOut);
            linkerButton.addEventListener('click', connectionSuccess);
            break;
        case "SUCCESS":
            showHidePages(2);
            viewAllButton.addEventListener('click', viewLinkedSpaces);
            connectAgainButton.addEventListener('click', connectorPage);
            revokeButton2.addEventListener('click', revokeAccess);
            logoutButton2.addEventListener('click', signOut);
            break;
        case "VIEW":
            showHidePages(3);
            connectAgainButton2.addEventListener('click', connectorPage);
            revokeButton3.addEventListener('click', revokeAccess);
            logoutButton3.addEventListener('click', signOut);
            break;
        case "ERROR":
            showHidePages(4);
            backButton.addEventListener('click', getCalendars);
            break; 
    }
}

function showHidePages(arg) {
    for (var i = 0; i < pages.length; i++) {
        if (i === arg) {
            pages[i].style.display = 'initial';
        } else {
            pages[i].style.display = 'none';
        }
    }
}

var roomInfo = [
    {
        name: "ATLANTIS",
        id: "{11141-123412-1234123-314123}"
    },
    {
        name: "FANTASIA",
        id: "{55541-123412-1234123-314123}"
    },
    {
        name: "CAPITOL",
        id: "{88841-123412-1234123-314123}"
    },
    {
        name: "JAKKU",
        id: "{33341-123412-1234123-314123}"
    }
];
function connectorPage(lastPage) {
    console.log("connector page from ", lastPage);
    var calendarInfo = JSON.parse(localStorage.getItem('resources'));
    if (calendarInfo.length < 1) {
        errorPage("CONNECT");
        return;
    }
    if (roomInfo.length < 1) {
        viewLinkedSpaces("CONNECT");
        return;
    }
    for (var i = 0; i < selectedCalendarButton.length; i++) {
        selectedCalendarButton.options[i] = null;    
    }
    for (i = 0; i < calendarInfo.length; i++) {
        selectedCalendarButton.options[i] = new Option(calendarInfo[i].name, calendarInfo[i].address);
    }
    for (i = 0; i < selectedRoomButton.length; i++) {
        selectedRoomButton.options[i] = null;    
    }
    for (i = 0; i < roomInfo.length; i++) {
        selectedRoomButton.options[i] = new Option(roomInfo[i].name, roomInfo[i].id);
    }
    changePages(lastPage, "CONNECT");
}

var completedConnections = [];
function connectionSuccess(lastPage) {
    completedConnections.push({
        "address": selectedCalendarButton.value,
        "uuid": selectedRoomButton.value,
        "name": selectedCalendarButton.options[selectedCalendarButton.selectedIndex].textContent,
        "hifiName": selectedRoomButton.options[selectedRoomButton.selectedIndex].textContent
    });
    console.log(JSON.stringify(completedConnections));
    var resources = JSON.parse(localStorage.getItem('resources'));
    for (var i=0; i < resources.length; i++) {
        var str = JSON.stringify(resources[i]);
        if (str.indexOf(selectedCalendarButton.value) > -1) {
            console.log("SPLICING ", str);
            resources.splice(i,1);
            i--;
        }
    }
    for (i=0; i < roomInfo.length; i++) {
        str = JSON.stringify(roomInfo[i]);
        if (str.indexOf(selectedRoomButton.value) > -1) {
            console.log("SPLICING", str);
            roomInfo.splice(i,1);
            i--;
        }
    }
    if (roomInfo.length < 1 && completedConnections.length > 0) {
        connectAgainButton2.removeEventListener('click', connectorPage("SUCCESS"));
        connectAgainButton2.disabled = true;
    }
    console.log(resources.length);
    localStorage.setItem('resources', JSON.stringify(resources));
    document.getElementById('cal').innerHTML = selectedCalendarButton[selectedCalendarButton.selectedIndex].textContent;
    document.getElementById('room').innerHTML = selectedRoomButton[selectedRoomButton.selectedIndex].textContent;
    changePages(lastPage, "SUCCESS");
}


function addTableRow(row, object) {
    var table = document.getElementById("completed");
    var newRow = table.insertRow(row);
    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    cell1.innerHTML = object[row].name;
    cell2.innerHTML = '<input type="button" class="trash">';
    cell3.innerHTML = '<input type="button" class="edit">';
    trashButtons.push(document.getElementById("completed").rows[row].cells[1]);
    document.getElementById("completed").rows[row].cells[1].addEventListener('click', deleteTableRow);
    editButtons.push(document.getElementById("completed").rows[row].cells[1]);
    document.getElementById("completed").rows[row].cells[2].addEventListener('click', editTableRow);
}


function deleteTableRow(row) {
    if (trashButtons.length > 0) {
        for (var i = 0; i < trashButtons.length; i++) {
            trashButtons[i].removeEventListener('click', deleteTableRow);
            editButtons[i].removeEventListener('click', editTableRow);
        }
        trashButtons = [];
        editButtons = [];
    }
    var resources = JSON.parse(localStorage.getItem('resources'));
    var tempObj = completedConnections.splice(row, 1);
    resources.push({
        address: tempObj.address,
        name: tempObj.name
    });
    localStorage.setItem('resources', JSON.stringify(resources));
    roomInfo.push({
        name: tempObj.hifiName,
        id: tempObj.uuid
    });
    viewLinkedSpaces("VIEW");
}


function editTableRow(row) {
    for (var i = 0; i < trashButtons.length; i++) {
        trashButtons[i].removeEventListener('click', deleteTableRow(row));
        editButtons[i].removeEventListener('click', editTableRow(row));
    }
    trashButtons = [];
    editButtons = [];
    var resources = JSON.parse(localStorage.getItem('resources'));
    var tempObj = completedConnections.splice(row, 1);
    resources.push({
        address: tempObj.address,
        name: tempObj.name
    });
    localStorage.setItem('resources', JSON.stringify(resources));
    roomInfo.push({
        name: tempObj.hifiName,
        id: tempObj.uuid
    });
    connectorPage("VIEW");
}


function viewLinkedSpaces(lastPage) {
    var table = document.getElementById("completed");
    table.innerHTML = '';
    for (var i = 0; i < completedConnections.length; i++) {
        addTableRow(i, completedConnections);
    }
    if (roomInfo.length < 1) {
        connectAgainButton2.innerHTML = "Confirm these spaces.";
        connectAgainButton2.disabled = true;
    }
    changePages(lastPage, "VIEW");
}

function errorPage(lastPage) {
    changePages(lastPage, "ERROR");
}

function confirmConnections() {
    // write completedConnections to Drive JSON.
    // close tablet
}

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
    location.reload();
}

function signOut() {
    // do things
    location.reload();
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
        case "AVAILABLE ROOMS":
            roomInfo = data.roomInfo;
            break;
        case "SETUP MEETING ROOM":
            break;
    }
}


// Buttons by Page
// Login Page
var loginButton = document.getElementById("login");
loginButton.addEventListener('click', getCalendars);
// Connector Page
var helpButton = document.getElementById('help');
var revokeButton = document.getElementById('revoke1');
var logoutButton = document.getElementById('logout1');
var linkerButton = document.getElementById('linker');
var selectedCalendarButton = document.getElementById('selectedCalendar');
var selectedRoomButton = document.getElementById('selectedRoom');

// Connection Successful Page
var viewAllButton = document.getElementById('viewAll');
var connectAgainButton = document.getElementById('connector');
var revokeButton2 = document.getElementById('revoke2');
var logoutButton2 = document.getElementById('logout2');

// View Links Page
var trashButtons = [];
var editButtons = [];
var connectAgainButton2 = document.getElementById('connector2');
var revokeButton3 = document.getElementById('revoke3');
var logoutButton3 = document.getElementById('logout3');

// Error Page
var backButton = document.getElementById('tryAgain');


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