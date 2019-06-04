//  meetingRoom_ui.js
//
//  Created by Mark Brosche on 4-24-2019
//  Handed off to Milad Nazeri on 5-10-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//  Load the API's client and auth2 modules.
//  Call the initClient function after the modules load.


var YOUR_CLIENT_ID = 'Your Client ID';
var YOUR_REDIRECT_URI = 'Your redirect URI';
var SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
var HIFI_API_BASE = "Your API Base";

var fragmentString = location.search;
var roomInfo;

// *************************************
// START utility
// *************************************
// #region utility


// Utility function for the UI render
function showHidePages(arg) {
    for (var i = 0; i < pages.length; i++) {
        if (i === arg) {
            pages[i].style.display = 'initial';
        } else {
            pages[i].style.display = 'none';
        }
    }
}


// from https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
function compare(a, b) {
    // Use toUpperCase() to ignore character casing
    var nameA = a.name.toUpperCase();
    var nameB = b.name.toUpperCase();
  
    var comparison = 0;
    if (nameA > nameB) {
      comparison = 1;
    } else if (nameA < nameB) {
      comparison = -1;
    }
    return comparison;
}


// #endregion
// *************************************
// END utility
// *************************************

// *************************************
// START oAuth
// *************************************
// #region oAuth


// Parse query string to see if page request is coming from OAuth 2.0 server.
var params = {};
var regex = /([^&=]+)=([^&]*)/g, m;
while (m = regex.exec(fragmentString)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
}
if (Object.keys(params).length > 0) {
    // # There is no other mention of oauth2-params
    sessionStorage.setItem('oauth2-params', JSON.stringify(params));
    exchangeCode(params);
}


// Use an invisible form to get to the google sign in page
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
        'scope': SCOPES,
        'state': 'try_sample_request',
        'include_granted_scopes': 'true',
        'response_type': 'code',
        'access_type': 'offline',
        'prompt': 'consent'
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


// Get the tokens from the backend
function exchangeCode(params) {
    if (params && params["code"]) {
        fetch(HIFI_API_BASE + "exchangeCode", {
            method: "POST",
            body: JSON.stringify({
                code: params["code"]
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(response => {
            response.valid_since = Date.now();
            sessionStorage.setItem('response', JSON.stringify(response));
            EventBridge.emitWebEvent(JSON.stringify({
                type: "GET AVAILABLE ROOMS",
            }));
            setTimeout(function(){
                getCalendars();
            }, 100)
        })
        .catch(error => console.log('Error:' + error));
    } else {
        oauth2SignIn();
    }
}


// Clear out the current token in case we need a new token/refresh token
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
    location.assign(YOUR_REDIRECT_URI);
    sessionStorage.clear();
}


// Go back to the original log in screen
function signOut() {
    location.assign(YOUR_REDIRECT_URI);
}


// #endregion
// *************************************
// END oAuth
// *************************************

// *************************************
// START UI
// *************************************
// #region UI


// Handle rendering different states and their transitions
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
var PAGE_LOGIN = 0;
var PAGE_SEE_AVAILABLE = 1;
var PAGE_FINALIZE_CHOICES = 2;
var PAGE_EDIT = 3;
var PAGE_ERROR = 4;
function changePages(origin, destination) {
    switch (origin) {
        case "LOGIN":
            loginButton.removeEventListener('click', getCalendars);
            break;
        case "SEE AVAILABLE":
            helpButton.removeEventListener('click', errorPage);
            revokeButton.removeEventListener('click', revokeAccess);
            logoutButton.removeEventListener('click', signOut);
            linkerButton.removeEventListener('click', connectionSuccess);
            break;
        case "FINALIZE CHOICES":
            finalizeButton.removeEventListener('click', editSpaces);
            resetRoomsButton.onclick = null;
            revokeButton2.removeEventListener('click', revokeAccess);
            logoutButton2.removeEventListener('click', signOut);
            break;
        case "EDIT":
            resetRoomsButton2.onclick = null;
            revokeButton3.removeEventListener('click', revokeAccess);
            logoutButton3.removeEventListener('click', signOut);
            break;
        case "ERROR":
            backButton.removeEventListener('click', getCalendars);
            revokeButton4.removeEventListener('click', revokeAccess);
            logoutButton4.removeEventListener('click', signOut);
            break;  
    }
    switch (destination) {
        case "LOGIN":
            showHidePages(PAGE_LOGIN);
            loginButton.addEventListener('click', getCalendars);
            break;
        case "SEE AVAILABLE":
            showHidePages(PAGE_SEE_AVAILABLE);
            helpButton.addEventListener('click', errorPage);
            revokeButton.addEventListener('click', revokeAccess);
            logoutButton.addEventListener('click', signOut);
            linkerButton.addEventListener('click', connectionSuccess);
            finishButton.addEventListener('click', editSpaces);
            break;
        case "FINALIZE CHOICES":
            showHidePages(PAGE_FINALIZE_CHOICES);
            finalizeButton.addEventListener('click', editSpaces);
            resetRoomsButton.onclick = (function (connections) {
                return function(e) {
                    for (var i = 0; i < connections.length; i++) {
                        roomInfo.push({
                            name: connections[i].hifiName,
                            id: connections[i].uuid
                        })
                    }
                    getCalendars();
                };
            })(completedConnections);
            revokeButton2.addEventListener('click', revokeAccess);
            logoutButton2.addEventListener('click', signOut);
            break;
        case "EDIT":
            showHidePages(PAGE_EDIT);
            resetRoomsButton2.onclick = (function (connections) {
                return function(e) {
                    for (var i = 0; i < connections.length; i++) {
                        roomInfo.push({
                            name: connections[i].hifiName,
                            id: connections[i].uuid
                        })
                    }
                    getCalendars();
                };
            })(completedConnections);
            revokeButton3.addEventListener('click', revokeAccess);
            logoutButton3.addEventListener('click', signOut);
            break;
        case "ERROR":
            showHidePages(PAGE_ERROR);
            backButton.addEventListener('click', getCalendars);
            revokeButton4.addEventListener('click', revokeAccess);
            logoutButton4.addEventListener('click', signOut);
            break; 
    }
}


// Add a table to your connections list
function addTableRow(row, object) {
    var table = document.getElementById("completed");
    var newRow = table.insertRow(row);
    var cell1 = newRow.insertCell(0);
    var cell2 = newRow.insertCell(1);
    var cell3 = newRow.insertCell(2);
    cell1.innerHTML = object[row].hifiName + '<br>' + object[row].name + '    <br>';
    cell2.innerHTML = '<input type="button" class="trash">';
    cell3.innerHTML = '<input type="button" class="edit">';
    trashButtons.push(document.getElementById("completed").rows[row].cells[1]);
    document.getElementById("completed").rows[row].cells[1].onclick = (function (x) {
        return function(e) {
            deleteTableRow(x, e);
        };
    })(row);
    editButtons.push(document.getElementById("completed").rows[row].cells[1]);
    document.getElementById("completed").rows[row].cells[2].onclick = (function (x) {
        return function(e) {
            editTableRow(x, e);
        };
    })(row);
}


// Remove a table from your connections list
function deleteTableRow(row) {
    var resources = JSON.parse(sessionStorage.getItem('resources'));
    sessionStorage.removeItem('resources');
    var tempObj = completedConnections.splice(row, 1)[0];
    resources.push({
        address: tempObj.address,
        name: tempObj.name
    });
    sessionStorage.setItem('resources', JSON.stringify(resources));
    roomInfo.push({
        name: tempObj.hifiName,
        id: tempObj.uuid
    });
    editSpaces("EDIT");
}


// Edit a current table row in the connections list
function editTableRow(row) {
    var resources = JSON.parse(sessionStorage.getItem('resources'));
    sessionStorage.removeItem('resources');
    var tempObj = completedConnections.splice(row, 1)[0];
    resources.push({
        address: tempObj.address,
        name: tempObj.name
    });
    sessionStorage.setItem('resources', JSON.stringify(resources));
    roomInfo.push({
        name: tempObj.hifiName,
        id: tempObj.uuid
    });
    connectorPage("EDIT", tempObj);
}


// Render the editing ui
function editSpaces(lastPage) {
    trashButtons = [];
    editButtons = [];
    var table = document.getElementById("completed");
    table.innerHTML = '';
    for (var i = 0; i < completedConnections.length; i++) {
        addTableRow(i, completedConnections);
    }
    confirmConnections();
    changePages(lastPage, "EDIT");
}


// Render the error page
function errorPage(lastPage) {
    changePages(lastPage, "ERROR");
}


// Render the page that shows your calendars and your hifi meeting rooms
function connectorPage(lastPage, edit) {
    var calendarInfo = JSON.parse(sessionStorage.getItem('resources'));
    if (calendarInfo.length < 1) {
        errorPage("SEE AVAILABLE");
        return;
    }
    if (roomInfo.length < 1) {
        editSpaces("SEE AVAILABLE");
        return;
    }
    calendarInfo.sort(compare);
    roomInfo.sort(compare);
    for (i = 0; i < calendarInfo.length; i++) {
        calendarDropDown.options[i] = null;    
        calendarDropDown.options[i] = new Option(calendarInfo[i].name, calendarInfo[i].address);
        calendarDropDown.options[i].classList.add("dropdown-content");
    }
    for (i = 0; i < roomInfo.length; i++) {
        roomDropDown.options[i] = null;    
        roomDropDown.options[i] = new Option(roomInfo[i].name, roomInfo[i].id);
        roomDropDown.options[i].classList.add("dropdown-content");
    }
    if (edit) {
        calendarDropDown.selectedIndex = edit.name;
        roomDropDown.selectedIndex = edit.hifiName;
    }
    changePages(lastPage, "SEE AVAILABLE");
}


// Render the page that shows you have connected rooms and cals together
var DELAY_MS = 1000;
var completedConnections = [];
function connectionSuccess(lastPage) {
    var dl = document.getElementById('linkedspaces');
    dl.innerHTML = '';
    var calendarObject = {
        "address": calendarDropDown.value,
        "uuid": roomDropDown.value,
        "name": calendarDropDown.options[calendarDropDown.selectedIndex].textContent,
        "hifiName": roomDropDown.options[roomDropDown.selectedIndex].textContent
    }
    completedConnections.push(calendarObject);
    var resources = JSON.parse(sessionStorage.getItem('resources'));
    for (var i=0; i < resources.length; i++) {
        var str = JSON.stringify(resources[i]);
        if (str.indexOf(calendarDropDown.value) > -1) {
            resources.splice(i,1);
            i--;
        }
    }
    for (i = 0; i < roomInfo.length; i++) {
        str = JSON.stringify(roomInfo[i]);
        if (str.indexOf(roomDropDown.value) > -1) {
            roomInfo.splice(i,1);
            i--;
        }
    }
    sessionStorage.setItem('resources', JSON.stringify(resources));
    if (resources.length === 0 || roomInfo.length === 0) {
        for (i = 0; i < completedConnections.length; i++) {
            var dt = document.createElement('dt');
            dt.innerHTML = completedConnections[i].hifiName; 
            dl.appendChild(dt);
            var dd = document.createElement('dd');
            dd.innerHTML = completedConnections[i].name;
            dd.style.color = '#009ee0';
            dl.appendChild(dd);
            dl.style.overflow = "auto";
        }
        changePages(lastPage, "FINALIZE CHOICES");
    } else {
        var popup = document.getElementById("myPopup");
        popup.classList.toggle("show");
        setTimeout(() => {
            popup.classList.toggle("show");
            connectorPage("FINALIZE CHOICES");
        }, DELAY_MS);
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
var calendarDropDown = document.getElementById('selectedCalendar');
var roomDropDown = document.getElementById('selectedRoom');
var finishButton = document.getElementById('finished1');
// Connection Successful Page
var finalizeButton = document.getElementById('viewAll');
var resetRoomsButton = document.getElementById('reset1');
var revokeButton2 = document.getElementById('revoke2');
var logoutButton2 = document.getElementById('logout2');

// View Links Page
var trashButtons = [];
var editButtons = [];
var resetRoomsButton2 = document.getElementById('reset2');
var revokeButton3 = document.getElementById('revoke3');
var logoutButton3 = document.getElementById('logout3');

// Error Page
var backButton = document.getElementById('tryAgain');
var revokeButton4 = document.getElementById('revoke4');
var logoutButton4 = document.getElementById('logout4');


// #endregion
// *************************************
// END UI
// *************************************

// *************************************
// START Data-Transfer
// *************************************
// #region Data-Transfer

// If there's an access token, try an API request.
// Otherwise, start OAuth 2.0 flow.
var calendarList;
var resources = [];
function getCalendars() {
    var params = JSON.parse(sessionStorage.getItem('response'));
    sessionStorage.removeItem('resources');
    completedConnections = [];
    calendarList = [];
    resources = [];
    if (params && params['access_token']) {
        fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=${params['access_token']}`)
        .then(response => response.json())
        .then(response => {
            calendarList = response;
            if (calendarList.items && calendarList.items.length && calendarList.items.length > 0) {
                var listLength = calendarList.items.length;
                for (var i = 0; i < listLength; i++) {
                    resources.push({
                        "address": calendarList.items[i].id,
                        "name": calendarList.items[i].summary
                    });                    
                }
                sessionStorage.setItem('resources', JSON.stringify(resources));
                connectorPage("LOGIN");
            }
        })
        .catch(error => {
            console.log('Error:' + error);
            oauth2SignIn();
        });
    } else {
        console.log("unauthed");
        oauth2SignIn();
    }
    document.getElementById('linkedspaces').innerHTML = '';
}


// Send the connection data to the app to send to the token server
function confirmConnections() {
    var response = JSON.parse(sessionStorage.getItem('response'));
    var zone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2];
    EventBridge.emitWebEvent(JSON.stringify({
        type: "SETUP COMPLETE",
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expireTime: response.expires_in,
        validSince: response.valid_since,
        timeZoneName: zone,
        connectionData: completedConnections
    }));
}


// #endregion
// *************************************
// END Data-Transfer
// *************************************


// handle messages from APP UI
function onScriptEventReceived(data) {
    data = JSON.parse(data);
    switch (data.type) {
        case "AVAILABLE ROOMS":
            roomInfo = data.roomConfig;
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
            type: "EVENT_BRIDGE_OPEN_MESSAGE"
        }));  
    }, EVENTBRIDGE_SETUP_DELAY);
}


// Call onLoad() once the DOM is ready
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});