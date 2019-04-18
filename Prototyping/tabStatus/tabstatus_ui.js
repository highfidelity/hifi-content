var allPeople = [];
let input = document.getElementById('filter_members');
let currentlySearching = false;
let currentlySorted = false;
let sortType = null;
let previousSortType = null;

function l(label, data, i){
    data = JSON.stringify(data) + " " || "";
    if (typeof(i) === "number"){
        i = i;
    } else {
        i = "";
    }
    console.log("\n" + label + ": " + data + i +"\n");
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
        setTimeout(getEmployeeData, 10000);
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


function filterMembers(event){
    let keyword = input.value.toLowerCase();

    // there isn't anything in the search so render everything again
    if (keyword.length === 0) {
        currentlySearching = false
        return renderTeam(allPeople);
    }
    currentlySearching = true;

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
        
        // we want to return the right person in all people
        // but we wanted the string version to compare with
        member = concatMemberInfo[index];
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


// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 150;
function onLoad() {
    setTimeout(function() {
        // EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        // emitAppSpecificEvent("eventBridgeReady");
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
