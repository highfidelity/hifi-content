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

var el = document.getElementById("avatar-list");

function onScriptEventReceived(message) {
    print(message);
    var data;
    try {
        data = JSON.parse(message);
        switch (data.type) {
            case UPDATE_SOLO:
                log("in update solo");
                var finalList = data.value.map(function(avatar){
                    return `<li>${avatar}</li>`;
                }).join("");
                el.innerHTML = finalList;
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
function onLoad() {
            
    // Initial button active state is communicated via URL parameter.
    // isActive = location.search.replace("?active=", "") === "true";

    setTimeout(function () {
        // Open the EventBridge to communicate with the main script.
        // Allow time for EventBridge to become ready.
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            type: EVENT_BRIDGE_OPEN_MESSAGE
        }));
    }, EVENTBRIDGE_SETUP_DELAY);
}

// Main
// /////////////////////////////////////////////////////////////////////////    
onLoad();