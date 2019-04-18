var allPeople = [];
let input = document.getElementById('filter_members');
let currentlySearching = false;
let currentlySorted = false;
let sortType = null;
let previousSortType = null;
var username = "";
var displayName = "";
var teamname = "";
var status = "";
var previousSearch =""

function l(label, data, i){
    data = JSON.stringify(data) + " " || "";
    if (typeof(i) === "number"){
        i = i;
    } else {
        i = "";
    }
    console.log("\n" + label + ": " + data + i +"\n");
}

let statusURL = "https://highfidelity.co/api/statusIndicator?type=heartbeat&username=<username>&displayName=<display name>&status=<status, 150 char max>&teamName=<team name>"
replaceUserName = "<username>";
replaceDisplayName = "<display name>";
replaceStatus = "<status, 150 char max>";
replaceTeamName = "<team name>";

function replaceURL(status, teamName){
    statusURL = statusURL.replace(replaceUserName, username)
    statusURL = statusURL.replace(replaceDisplayName, displayName)
    statusURL = statusURL.replace(replaceStatus, status)
    statusURL = statusURL.replace(replaceTeamName, teamName)
    return statusURL;
}

function makeUppercase(text){
    text = text.toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
    return text;
}

var text = "foo bar loo zoo moo";


function handleFormSubmit() {
    let statusForm = document.getElementById('statusForm');
    let formContainer = document.getElementById('formContainer');
    let formData = new FormData(statusForm);
    formContainer.style.display = "none";
    input.style.display = "block";
    teamContainer.style.display = "block";
    input.value = "";
    var formObject = {};
    for (var pair of formData.entries()) {
        formObject[pair[0]] = pair[1];
    }
    let url = replaceURL(formObject.status, formObject.teamname);
    // l("url", url);
    // l("formObject", formObject);// Display the key/value pairs

    fetch(url)
        .catch(error => {
            console.log(error)
        });
    let status = document.getElementById('status');
    status.value = "";
    renderTypes();
}

function goback(){
    formContainer.style.display = "none";
    input.style.display = "block";
    teamContainer.style.display = "block";
    input.value = previousSearch;
    status.value = "";
}


function handleTeamChange(input){
    input.value = teamname = makeUppercase(input.value);
    emitAppSpecificEvent("onChange", {
        teamname: teamname
    })
}


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

function renderTypes(){
    if (currentlySorted){
        // handles making sure the sort order is the correct direction
        if (previousSortType === sortType){
            previousSortType = null;
            sortArray();
        } else {
            sortArray();
        }
    }
    // if you are in the middle of the search then keep your filter going
    if (currentlySearching) {
        filterMembers();
    }
    // first time
    if (!currentlySorted && !currentlySearching){
        renderTeam(allPeople)
    }
}

function getEmployeeData(){
    fetch('https://highfidelity.co/api/statusIndicator/?type=getAllEmployees')
    .then(function(response) { 
        return response.json() })
    .then(function(data){
        allPeople = [];
        data.teams.forEach(function(team){
            team.members.forEach(function(member){
                allPeople.push(
                    new WorkerMaker(member.displayName, member.status, member.location, team.name)
                )
            })
        })
        // setTimeout(getEmployeeData, 10000);
        renderTypes();
    })
    .catch(function(error){ console.error(error) })
}


function WorkerMaker(displayName, status, location, team) {
    this.displayName = displayName;
    this.status = status;
    this.location = location;
    this.team = team;
}


function renderTeam(list){
    let teamContainer = document.getElementById('teamContainer');
    teamContainer.innerHTML = "";
    let teamMembers = "";

    list.forEach(function(member){
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


// Helper function to see which index has a certain phrase
function hasInArray(array, string){
    for (i = 0; i < array.length; i++){
        if (array[i].indexOf(string) > -1) {
            return i;
        }
    }
    return -1
}

// Helper function to see which index has a certain phrase
function hasReg(array, string){
    for (i = 0; i < array.length; i++){
        if (array[i].indexOf(string) > -1) {
            return i;
        }
    }
    return -1
}

var statusObject = {
    "s": true,
    "st": true,
    "sta": true,
    "stat": true,
    "statu": true,
    "status": true
}

function filterMembers(event){
    let keyword = input.value.toLowerCase();
    if (keyword.length !== 0){
        let testKeyword = keyword.split(" ")[0]
        if (testKeyword.length > 6) {
            previousSearch = keyword;
            emitAppSpecificEvent("onSearchChange", {
                currentSearch: previousSearch
            })
        } else {
            for (var i = 0; i < testKeyword.length; i++){
                if (statusObject[testKeyword.substring(0, i+1)]){
                    // l("statusObject[testKeyword.substring(0, i+1)]", statusObject[testKeyword.substring(0, i+1)])
                    break;
                } else {
                    previousSearch = keyword;
                    emitAppSpecificEvent("onSearchChange", {
                        currentSearch: previousSearch
                    })
                }
            }
        }

        
    }
    let regex = false;
    // there isn't anything in the search so render everything again
    if (keyword.length === 0) {
        currentlySearching = false
        return renderTeam(allPeople);
    }

    if (keyword[0] === "/" && keyword[keyword.length-1] === "/"){
        regex = true
    }
    // l("regex true", regex);
    currentlySearching = true;

    if (keyword === "status") {
        let formContainer = document.getElementById('formContainer');
        let teamContainer = document.getElementById('teamContainer');
        let status = document.getElementById('status');

        formContainer.style.display = "block";
        status.focus();
        input.style.display = "none";
        teamContainer.style.display = "none";

        return;
    }
    // Split up the search for different terms
    let keywordArray = keyword.split(" ");

    // This is only used if you want to exclude a term like Client and Engine.  You have to use !(Client and engine)
    // this finds the first index of ( and the index with) and combines them together
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

    // Turn all the people into one simple lower case string
    let concatMemberInfo = allPeople.map(member => {
        let memberInfo = "";
        for (var key in member){
            memberInfo += " " + member[key].toLowerCase();
        }
        return memberInfo;
    })

    // the actual filter
    let filteredMemberList = allPeople.filter((member, index) => {
        // if (index > 1) return;
        // we want to return the right person in all people
        // but we wanted the string version to compare with
        member = concatMemberInfo[index];
        for (var i = 0; i < keywordArray.length; i++){
            if (regex){
                let reg = RegExp(keyword.slice(1,-1));
                reg = reg.test(member);
                if (!reg) {
                    return false;
                }
            } else {
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
            
        }
        return true;
    });
    
    renderTeam(filteredMemberList);
}


function sortArray(){
    currentlySorted = true;

    if (previousSortType === sortType){
        allPeople.reverse();
    } else {
        allPeople.sort((a, b) => {
            if (a[sortType].toUpperCase().trim() > b[sortType].toUpperCase().trim()){
                return 1;
            }
            if (a[sortType].toUpperCase().trim() < b[sortType].toUpperCase().trim()){
                return -1;
            }
            return 0;
        })
    }
}


function tableClick(event){
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
    }
}

// Handle EventBridge messages from *_app.js.
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

    switch (message.method) {
        case "updateUI":
            teamname = message.teamname;
            displayName = message.displayName;
            username = message.username;
            
            document.getElementById('teamname').value = teamname;
            document.getElementById('filter_members').value = message.currentSearch;
            filterMembers();
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
    input.addEventListener('keyup', filterMembers);
    teamContainer.addEventListener('click', tableClick);
    getEmployeeData();
}


// Call onLoad() once the DOM is ready
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});

onLoad();
