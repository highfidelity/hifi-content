// meetingRoom_ui.js
//
//  Created by Mark Brosche on 4-24-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
// Load the API's client and auth2 modules.
// Call the initClient function after the modules load.

var YOUR_CLIENT_ID = '';
var YOUR_SECRET = '';
var YOUR_REDIRECT_URI = 'http://127.0.0.1:90/localHTTP/meetingRoom_ui.html';
var SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/drive.file'
];

var fragmentString = location.search;

// Parse query string to see if page request is coming from OAuth 2.0 server.
var params = {};
var regex = /([^&=]+)=([^&]*)/g, m;
while (m = regex.exec(fragmentString)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
}
if (Object.keys(params).length > 0) {
    localStorage.setItem('oauth2-params', JSON.stringify(params));
    exchangeCode(params);
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
        'scope': SCOPES.join(' '),
        'state': 'try_sample_request',
        'include_granted_scopes': 'true',
        'response_type': 'code',
        'access_type': 'offline'
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


function exchangeCode(params) {
    if (params && params['code']) {
        var xhr = new XMLHttpRequest();
        var data= 'code=' + params['code'] + 
            '&client_id=' + YOUR_CLIENT_ID + 
            '&client_secret=' + YOUR_SECRET + 
            '&redirect_uri=' + YOUR_REDIRECT_URI +
            '&grant_type=authorization_code';
        xhr.open('POST','https://www.googleapis.com/oauth2/v4/token', true);
        xhr.setRequestHeader(
            'Content-Type', "application/x-www-form-urlencoded",
            'Content-Length', data.length
        );
        xhr.onreadystatechange = function (e) {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    var response = JSON.parse(xhr.response);
                    localStorage.setItem('response', JSON.stringify(response));
                    getCalendars();
                } catch (e) {
                    console.log(e, " FAILED PARSING");
                }
            } else if (xhr.readyState === 4 && xhr.status === 401) {
            // Token invalid, so prompt for user permission.
                oauth2SignIn();
            }
        };
        xhr.send(data);
    } else {
        oauth2SignIn();
    }

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
    location.assign(YOUR_REDIRECT_URI);
    localStorage.clear();
}


function signOut() {
    // do things
    location.assign(YOUR_REDIRECT_URI);
}


// If there's an access token, try an API request.
// Otherwise, start OAuth 2.0 flow.
var calendarList;
var resources = [];
function getCalendars() {
    var params = JSON.parse(localStorage.getItem('response'));
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
            finishButton.addEventListener('click', viewLinkedSpaces);
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
    calendarInfo.sort(compare);
    roomInfo.sort(compare);
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


var DELAY_MS = 2000;
var completedConnections = [];
function connectionSuccess(lastPage) {
    var ul = document.getElementById('linkedspaces');
    ul.innerHTML = '';
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
            resources.splice(i,1);
            i--;
        }
    }
    for (i=0; i < roomInfo.length; i++) {
        str = JSON.stringify(roomInfo[i]);
        if (str.indexOf(selectedRoomButton.value) > -1) {
            roomInfo.splice(i,1);
            i--;
        }
    }
    if (roomInfo.length < 1 && completedConnections.length > 0) {
        connectAgainButton2.removeEventListener('click', connectorPage("SUCCESS"));
        connectAgainButton2.disabled = true;
    }
    localStorage.setItem('resources', JSON.stringify(resources));
    if (resources.length === 0 || roomInfo.length === 0) {
        for (i = 0; i < completedConnections.length; i++) {
            var li=document.createElement('li');
            li.innerHTML=completedConnections[i].hifiName + '<br>' + completedConnections[i].name;
            ul.appendChild(li);
        }
        changePages(lastPage, "SUCCESS");
    } else {
        var popup = document.getElementById("myPopup");
        popup.classList.toggle("show");
        setTimeout(() => {
            popup.classList.toggle("show");
            connectorPage("SUCCESS");
        }, DELAY_MS);
    }
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
    var response = JSON.parse(localStorage.getItem('response'));
    var resources = JSON.parse(localStorage.getItem('resources'));
    EventBridge.emitWebEvent({

    });
    var xhr = new XMLHttpRequest();
    var data= 'code=' + params['code'] + 
        '&client_id=' + YOUR_CLIENT_ID + 
        '&client_secret=' + YOUR_SECRET + 
        '&redirect_uri=' + YOUR_REDIRECT_URI +
        '&grant_type=authorization_code';
    xhr.open('POST','https://www.googleapis.com/upload/drive/v3/files?uploadType=media', true);
    xhr.setRequestHeader(
        'Content-Type', "application/json",
        'Content-Length', data.length,
        'Authorization', 'Bearer' 
    );
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                var response = JSON.parse(xhr.response);
                localStorage.setItem('response', JSON.stringify(response));
                getCalendars();
            } catch (e) {
                console.log(e, " FAILED PARSING");
            }
        } else if (xhr.readyState === 4 && xhr.status === 401) {
        // Token invalid, so prompt for user permission.
            oauth2SignIn();
        }
    };
    xhr.send(data);
}


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
var finishButton = document.getElementById('finished1');
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