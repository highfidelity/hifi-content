// *************************************
// START UTILITY FUNCTIONS
// *************************************
// #region Utilty

var debug = true;
var FALSE = "false";

// Easy log function checking for message, an object to stringify, and whether it should be enabled or not
function log(message, object, enabled){
    if (!debug || enabled === FALSE) {
        return;
    }

    var finalMessage;

    finalMessage = "\n\n\t" + message + ":" + "\n\n";

    if (object) {
        finalMessage += "\n\t\t" + JSON.stringify(object, null, 4) + "\n";
    }

    print(finalMessage);
}

// #endregion
// *************************************
// END UTILITY FUNCTIONS
// *************************************

var UPDATE_SOLO = "UPDATE_SOLO";
var CLEAR_LIST = "CLEAR_LIST";

var avatarList = document.getElementById("avatar-list");
var soloNames = document.getElementById("solo-names");

// Create the button to reset the sololist
function createButton(){
    var button = document.createElement("button");
    button.innerHTML = "Clear the list";
    button.setAttribute("id", "soloButton");
    soloNames.appendChild(button);
    button.addEventListener("click", function(){
        EventBridge.emitWebEvent(JSON.stringify({
            type: CLEAR_LIST
        }));
    })
}


function onScriptEventReceived(message) {
    print(message);
    var data;
    try {
        data = JSON.parse(message);
        switch (data.type) {
            case UPDATE_SOLO:
                log("in update solo");
                var buttonSearch = document.getElementById("soloButton");
                var finalList = data.value.map(function(avatar){
                    return `<li>${avatar}</li>`;
                }).join("");
                
                if (finalList.length > 0) {
                    
                    if (!buttonSearch) {
                        createButton();
                    }

                } else {

                    if (buttonSearch) {
                        buttonSearch.remove();
                    }

                }

                avatarList.innerHTML = finalList;
                
                break;
            default:
        }
    } catch (e) {
        console.log(e)
        return;
    }
}

var EVENTBRIDGE_SETUP_DELAY = 500;
var EVENT_BRIDGE_OPEN_MESSAGE = "EVENT_BRIDGE_OPEN_MESSAGE";


// Run when the JS is loaded and give enough time to for EventBridge to come back
function onLoad() {
            
    setTimeout(function () {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            type: EVENT_BRIDGE_OPEN_MESSAGE
        }));
    }, EVENTBRIDGE_SETUP_DELAY);
}


// *************************************
// START MAIN
// *************************************
// #region Main
onLoad();

// #endregion
// *************************************
// END MAIN 
// *************************************
