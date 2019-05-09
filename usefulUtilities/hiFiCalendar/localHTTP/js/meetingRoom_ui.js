// meetingRoom_ui.js
//
//  Created by Mark Brosche on 4-24-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
// Load the API's client and auth2 modules.
// Call the initClient function after the modules load.

var YOUR_SECRET = 'QowY-iVRTn-lJzKcCD9PwlIZ';
var YOUR_CLIENT_ID = '813544734011-8eo219koe6a7r35uk3hjv8e44d2d0a6c.apps.googleusercontent.com';
var YOUR_REDIRECT_URI = 'http://127.0.0.1:90/localHTTP/meetingRoom_ui.html';
var SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
var fragmentString = location.search;
// Parse query string to see if page request is coming from OAuth 2.0 server.
var params = {};
var regex = /([^&=]+)=([^&]*)/g, m;
while (m = regex.exec(fragmentString)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
}
if (Object.keys(params).length > 0) {
    sessionStorage.setItem('oauth2-params', JSON.stringify(params));
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
        'scope': SCOPES,
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
                    response.valid_since = Date.now();
                    sessionStorage.setItem('response', JSON.stringify(response));
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
    sessionStorage.clear();
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
    var params = JSON.parse(sessionStorage.getItem('response'));
    sessionStorage.removeItem('resources');
    completedConnections = [];
    calendarList = [];
    resources = [];
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
                    sessionStorage.setItem('resources', JSON.stringify(resources));
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
    document.getElementById('linkedspaces').innerHTML = '';
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
            showHidePages(0);
            loginButton.addEventListener('click', getCalendars);
            break;
        case "SEE AVAILABLE":
            showHidePages(1);
            helpButton.addEventListener('click', errorPage);
            revokeButton.addEventListener('click', revokeAccess);
            logoutButton.addEventListener('click', signOut);
            linkerButton.addEventListener('click', connectionSuccess);
            finishButton.addEventListener('click', editSpaces);
            break;
        case "FINALIZE CHOICES":
            showHidePages(2);
            finalizeButton.addEventListener('click', editSpaces);
            resetRoomsButton.onclick = (function (x) {
                return function(e) {
                    for (var i = 0; i < x.length; i++) {
                        roomInfo.push({
                            name: x[i].hifiName,
                            id: x[i].uuid
                        })
                    }
                    getCalendars();
                };
            })(completedConnections);
            revokeButton2.addEventListener('click', revokeAccess);
            logoutButton2.addEventListener('click', signOut);
            break;
        case "EDIT":
            showHidePages(3);
            resetRoomsButton2.onclick = (function (x) {
                return function(e) {
                    for (var i = 0; i < x.length; i++) {
                        roomInfo.push({
                            name: x[i].hifiName,
                            id: x[i].uuid
                        })
                    }
                    getCalendars();
                };
            })(completedConnections);
            revokeButton3.addEventListener('click', revokeAccess);
            logoutButton3.addEventListener('click', signOut);
            break;
        case "ERROR":
            showHidePages(4);
            backButton.addEventListener('click', getCalendars);
            revokeButton4.addEventListener('click', revokeAccess);
            logoutButton4.addEventListener('click', signOut);
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
        id: "{33341-123412-16789123-314123}"
    },
    {
        name: "NARNIA",
        id: "{323241-678982-1234123-314123}"
    },
    {
        name: "OZ",
        id: "{39941-123412-123678923-314123}"
    },
    {
        name: "PANDORA",
        id: "{38841-1789612-1234123-314123}"
    },
    {
        name: "GOTHAM",
        id: "{77741-123412-1234123-777123}"
    }
];
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
    for (var i = 0; i < calendarDropDown.length; i++) {
        calendarDropDown.options[i] = null;    
    }
    calendarInfo.sort(compare);
    roomInfo.sort(compare);
    for (i = 0; i < calendarInfo.length; i++) {
        calendarDropDown.options[i] = new Option(calendarInfo[i].name, calendarInfo[i].address);
        calendarDropDown.options[i].classList.add("dropdown-content");
    }
    for (i = 0; i < roomDropDown.length; i++) {
        roomDropDown.options[i] = null;    
    }
    for (i = 0; i < roomInfo.length; i++) {
        roomDropDown.options[i] = new Option(roomInfo[i].name, roomInfo[i].id);
        roomDropDown.options[i].classList.add("dropdown-content");
    }
    if (edit) {
        calendarDropDown.selectedIndex = edit.name;
        roomDropDown.selectedIndex = edit.hifiName;
    }
    changePages(lastPage, "SEE AVAILABLE");
}


var DELAY_MS = 1000;
var completedConnections = [];
function connectionSuccess(lastPage) {
    var dl = document.getElementById('linkedspaces');
    dl.innerHTML = '';
    completedConnections.push({
        "address": calendarDropDown.value,
        "uuid": roomDropDown.value,
        "name": calendarDropDown.options[calendarDropDown.selectedIndex].textContent,
        "hifiName": roomDropDown.options[roomDropDown.selectedIndex].textContent
    });
    var resources = JSON.parse(sessionStorage.getItem('resources'));
    for (var i=0; i < resources.length; i++) {
        var str = JSON.stringify(resources[i]);
        if (str.indexOf(calendarDropDown.value) > -1) {
            resources.splice(i,1);
            i--;
        }
    }
    for (i=0; i < roomInfo.length; i++) {
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


function errorPage(lastPage) {
    changePages(lastPage, "ERROR");
}


function confirmConnections() {
    var response = JSON.parse(sessionStorage.getItem('response'));
    var zone = new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2];
    EventBridge.emitWebEvent(JSON.stringify({
        type: "SETUP COMPLETE",
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        client_id: YOUR_CLIENT_ID,
        secret: YOUR_SECRET,
        expireTime: response.expires_in,
        validSince: response.valid_since,
        timeZoneName: zone,
        connectionData: completedConnections
    }));
}


function onScriptEventReceived(data) {
    data = JSON.parse(data);
    switch (data.type) {
        case "NO DATA":
            errorPage("LOGIN");
        case "AVAILABLE ROOMS":
            roomInfo = data.roomInfo;
            getCalendars();
            break;
        case "ALREADY SET":
            completedConnections = data.completedConnections;
            editSpaces("LOGIN");
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


// Set the text of the button to either On or Off 
// // when opening the tablet app, based on the app script status.
var EVENT_BRIDGE_SETUP_DELAY = 100; 
function onLoad(){
    // setTimeout(() => {
    EventBridge.scriptEventReceived.connect(onScriptEventReceived);    
    EventBridge.emitWebEvent(JSON.stringify({
        type: "EVENT_BRIDGE_OPEN_MESSAGE"
    }));   
    // }, EVENT_BRIDGE_SETUP_DELAY);
}
onLoad();