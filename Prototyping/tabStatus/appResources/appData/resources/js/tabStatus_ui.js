/*

    tab status
    tabstatus_ui.js
    Created by Milad Nazeri on 2019-04-19
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

*/


// *************************************
// START UTILITY
// *************************************
// #region UTILITY


// logging function for the browser
function l(label, data, i){
    data = JSON.stringify(data) + " " || "";
    if (typeof(i) === "number"){
        i = i;
    } else {
        i = "";
    }
    console.log("\n" + label + ": " + data + i +"\n");
}


// turn the first letter of each word into uppercase
function makeUpperCase(text){
    text = text.toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
    return text;
}


// replace the api call with the new information
let statusURL = "https://highfidelity.co/api/statusIndicator?type=heartbeat&username=<username>&displayName=<display name>&status=<status, 150 char max>&teamName=<team name>"
let replaceUserName = "<username>";
let replaceDisplayName = "<display name>";
let replaceStatus = "<status, 150 char max>";
let replaceTeamName = "<team name>";
function replaceURL(status, teamName){
    statusURL = statusURL.replace(replaceUserName, username)
    statusURL = statusURL.replace(replaceDisplayName, displayName)
    statusURL = statusURL.replace(replaceStatus, status)
    statusURL = statusURL.replace(replaceTeamName, teamName)
    return statusURL;
}


// Helper function to see which index has a certain phrase
function hasInArray(array, string){
    for (i = 0; i < array.length; i++){
        if (array[i].indexOf(string) > -1) {
            return i;
        }
    }
    return -1
}


// Gets items in an array of objects and turns them into an array of strings
function objectToStringArrayMap(list){
    let stringList = list.map(item => {
        // l("item", item)
        let fullString = "";
        for (let key in item){
            fullString += " " + String(item[key]).toLowerCase();
        }
        return fullString;
    })
    return stringList
}


// #endregion
// *************************************
// END UTILITY
// *************************************

// *************************************
// START handlers
// *************************************
// #region handlers


// handle the user submiting a status update
function handleFormSubmit() {
    let statusForm = document.getElementById('statusForm');
    let status = document.getElementById('status');
    let input = document.getElementById('filter_members');

    let formData = new FormData(statusForm);
    var formObject = {};
    for (var pair of formData.entries()) {
        formObject[pair[0]] = pair[1];
    }
    
    let url = replaceURL(formObject.status, formObject.teamname);
    fetch(url)
        .catch(error => {
            console.log(error)
        });


    showList()    
    renderUI();
}


// handle the user submitting a go back request
function handleGoBack(){
    showList();
}


// handle the user changing the team name 
function handleTeamChange(input){
    // make sure the team name is capitalized
    input.value = teamname = makeUpperCase(input.value);
    emitAppSpecificEvent("onChange", {
        teamname: teamname
    })
}


// Handle if someone clicked on the headers to sort
function handleTableClick(event){
    let type;
    if (event.target.tagName === "TH") {
        type = event.target.innerHTML;
        if (previousSortType) {
            previousSortType = sortType;
        }
        sortType = type;
        sortArray();
        filterMembers();
        previousSortType = sortType;
        sendSortState();
    }
}


// Get out of tutorial mode
function handleGotIt(){
    emitAppSpecificEvent("onGotItClicked")
}

// #endregion
// *************************************
// END handlers
// *************************************

// *************************************
// START date-transfers
// *************************************
// #region date-transfers


// Emit an event specific to the `multiConApp` over the EventBridge.
var APP_NAME = "tabStatus";
function emitAppSpecificEvent(method, data) {
    var event = {
        app: APP_NAME,
        method: method,
        data: data
    };
    EventBridge.emitWebEvent(JSON.stringify(event));
}


// send sort related details to save state
let currentlySearching = false;
let currentlySorted = false;
let sortType = null;
let previousSortType = null;
function sendSortState(){
    emitAppSpecificEvent("onSortSettingsChange", {
        sortType: sortType,
        currentlySorted: currentlySorted,
        currentlySearching: currentlySearching,
        previousSortType: previousSortType
    })    
}


// Get the actual employee data
let allPeople = [];
const REFRESH_TIME_MS = 10000;
function getEmployeeData(){
    fetch('https://highfidelity.co/api/statusIndicator/?type=getAllEmployees')
    .then(response => { 
        return response.json() 
    })
    .then(data => {
        allPeople = [];
        data.teams.forEach(team => {
            team.members.forEach(member =>{
                allPeople.push(
                    new WorkerMaker(
                        member.displayName, 
                        member.status, 
                        member.location,
                        team.name
                    )
                )
            })
        })
        setTimeout(getEmployeeData, REFRESH_TIME_MS);
        renderUI();
    })
    .catch(error => { console.error(error) })
}


// #endregion
// *************************************
// END date-transfers
// *************************************

// *************************************
// START render
// *************************************
// #region render


// handles rendering differnt ui states
function renderUI(){
    if (currentlySorted){
        // handles making sure the sort order is the correct direction
        if (previousSortType === sortType){
            previousSortType = null;
            sendSortState();
            sortArray();
        } else {
            sortArray();
        }
    }

    // if you are in the middle of the search then keep your filter going
    if (currentlySearching) {
        filterMembers();
        return;
    }

    if (!currentlySearching){
        renderTeam(allPeople)
        return;
    }
    
    // clean render
    if (!currentlySorted && !currentlySearching){
        renderTeam(allPeople)
        return;
    }


}


// render the actual team table 
function renderTeam(list){
    let teamContainer = document.getElementById('teamContainer');
    let input = document.getElementById('filter_members');

    teamContainer.innerHTML = "";
    let teamMembers = "";

    list.forEach(member => {
        teamMembers += `
            <tr>
                <td>${member.displayName}</td>
                <td>${member.status}</td> 
                <td>${member.location}</td>
                <td>${member.team}</td>
            </tr>
        `
    })

    let div = document.createElement('div');
    div.innerHTML = `
        <table style="width:100%">
            <tr>
                <th>displayName</th>
                <th>status</th> 
                <th>location</th>
                <th>team</th>
            </tr>
            ${teamMembers}
        </table>
    `
    teamContainer.appendChild(div);
    input.focus();   
}


// show the status state
function showStatus(){
    let formContainer = document.getElementById('formContainer');
    let teamContainer = document.getElementById('teamContainer');
    let status = document.getElementById('status');
    let input = document.getElementById('filter_members');
    
    formContainer.style.display = "block";
    teamContainer.style.display = "none";
    input.style.display = "none";

    status.focus();
}


// show the table list state
function showList(){
    let input = document.getElementById('filter_members');
    let formContainer = document.getElementById('formContainer');
    let teamContainer = document.getElementById('teamContainer');
    let status = document.getElementById('status');

    formContainer.style.display = "none";
    teamContainer.style.display = "block";
    input.style.display = "block";

    input.value = previousSearch;
    status.value = "";
    renderUI();
}



// #endregion
// *************************************
// END render
// *************************************

// *************************************
// START constructors
// *************************************
// #region constructors


// Worker Maker to help sort employees 
function WorkerMaker(displayName, status, location, team) {
    this.displayName = displayName;
    this.status = status;
    this.location = location;
    this.team = team;
}


// #endregion
// *************************************
// END constructors
// *************************************

// *************************************
// START filter-sort
// *************************************
// #region filter-sort


// Check to see if we need to combine terms when we split the keyword up
// This is only used if you want to exclude a term like Client and Engine. 
// You have to use !(Client and engine)
// this finds the first index of ( and the index with) and combines them together
function handleKeywordArraySplit(keyword){
    let keywordArray = keyword.split(" ");

    let firstPar = hasInArray(keywordArray, "(");
    let secondPar = hasInArray(keywordArray, ")");
    if (firstPar > -1) {
        let combined = keywordArray.slice(firstPar, secondPar+1).join(" ");

        keywordArray = [
            ...keywordArray.slice(0, firstPar),
            combined,
            ...keywordArray.slice(secondPar + 1)
        ]
    }

    return keywordArray;
}

// O(1) check to see if the status keyword is being typed
const statusObject = {
    "s": true,
    "st": true,
    "sta": true,
    "stat": true,
    "statu": true,
    "status": true
}
function statusCheckerForSearchStateSave(keyword){
    let testKeyword = keyword.split(" ")[0]
    // The keyword is greater than status so save and move on
    if (testKeyword.length > 6) {
        previousSearch = keyword;
        emitAppSpecificEvent("onSearchChange", {
            currentSearch: previousSearch
        })
        return;
    }

    // We might be writing status so don't save yet
    if (statusObject[testKeyword]){
        return;
    }

    // We aren't writing status
    previousSearch = keyword;
    emitAppSpecificEvent("onSearchChange", {
        currentSearch: previousSearch
    })
}


// Main filter function
function filterMembers(event){
    let input = document.getElementById('filter_members');
    let keyword = input.value.toLowerCase();
    // l("length", keyword.length)
    // Handle Commands
    if (keyword.length !== 0){
        if (keyword === "status") {
            showStatus();
            return;
        }
            statusCheckerForSearchStateSave(keyword)
    }

    // there isn't anything in the search so render everything again
    if (keyword.length === 0) {
        currentlySearching = false
        sendSortState();
        renderUI()
        return;
    }
    currentlySearching = true;
    sendSortState();

    // Split up the search for different terms
    let keywordArray = handleKeywordArraySplit(keyword);

    // Turn all the people into one simple lower case string
    let concatMemberInfo = objectToStringArrayMap(allPeople);

    // Check if we got a regex search
    let regex = false    
    if (keyword[0] === "/" && keyword[keyword.length-1] === "/"){
        regex = true
    }

    // the actual filter
    let filteredMemberList = allPeople.filter((member, index) => {
        // if (index > 1) return;
        // we want to return the right person in all people
        // but we wanted the string version to compare with
        member = concatMemberInfo[index];
        // check the member for the regex if povided
        if (regex){
            let reg = RegExp(keyword.slice(1,-1));
            let doesMemberMatch = reg.test(member);
            if (doesMemberMatch) {
                return true;
            }
            return false;
        }

        for (var i = 0; i < keywordArray.length; i++){
            let word = keywordArray[i]
            // check to see if the search term is a negation
            if (word[0] === "!"){
                
                // check to see if this negation is a multi-word 
                if (word[1] === "("){
                    if (member.indexOf(word.slice(2, -1)) > -1){
                        return false;
                    }
                }

                if (member.indexOf(word.slice(1)) > -1){
                    return false;
                }
            } else {
                if (member.indexOf(word) === -1){
                    return false;
                }
            }
        }
        return true;
    });    
    renderTeam(filteredMemberList);
}


// Either sort by the type or reverse if same type clicked again
function sortArray(){
    currentlySorted = true;
    sendSortState();
    if (previousSortType === sortType){
        allPeople.reverse();
    } else {
        allPeople.sort((a, b) => {
            if (String(a[sortType]).toUpperCase().trim() > String(b[sortType]).toUpperCase().trim()){
                return 1;
            }
            if (String(a[sortType]).toUpperCase().trim() < String(b[sortType]).toUpperCase().trim()){
                return -1;
            }
            return 0;
        })
    }
}


// #endregion
// *************************************
// END filter-sort
// *************************************

// *************************************
// START event-bridge
// *************************************
// #region event-bridge



let username = "";
let displayName = "";
let teamname = "";
let previousSearch ="";
function onScriptEventReceived(message) {
    try {
        message = JSON.parse(message);
    } catch (error) {
        console.log("Couldn't parse script event message: " + error);
        return;
    }

    if (message.app !== "tabStatus") {
        return;
    }

    // l("message", message)
    switch (message.method) {
        case "updateUI":
            // l("message", message)
            if (message.isFirstRun) {
                document.getElementById("firstRun").style.display = "block";
            }
            teamname = message.teamname;
            displayName = message.displayName;
            username = message.username;
            message.sortSettings = 
                message.sortSettings 
                ? message.sortSettings
                : { currentlySearching: false, currentlySorted: false, sortType: null, previousSortType: null} 
            currentlySearching = message.sortSettings.currentlySearching || false;
            currentlySorted = message.sortSettings.currentlySorted || false;
            sortType = message.sortSettings.sortType || null;
            previousSortType = message.sortSettings.previousSortType || null;
            document.getElementById("loadingContainer").style.display = "none";

            document.getElementById('teamname').value = teamname;
            document.getElementById('filter_members').value = message.currentSearch;
            renderUI();
            break;
            
        case "gotItClicked":
            document.getElementById("firstRun").style.display = "none"; 
            break;

        default:
            console.log("Unknown message received from tabStatus.js! " + JSON.stringify(message));
            break;
    }
}


// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 150;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        emitAppSpecificEvent("eventBridgeReady");
    }, EVENTBRIDGE_SETUP_DELAY);
    let input = document.getElementById('filter_members');
    let teamContainer = document.getElementById('teamContainer');
    
    input.addEventListener('keyup', filterMembers);
    teamContainer.addEventListener('click', handleTableClick);
    getEmployeeData();
}


// Call onLoad() once the DOM is ready
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});

onLoad();


// #endregion
// *************************************
// END event-bridge
// *************************************
