
// Send an event to the app script to 
// toggle it on/off when the button is clicked
var button = document.getElementById("toggle");
function buttonClicked(){
    EventBridge.emitWebEvent(JSON.stringify({
        type: "TOGGLE_APP"
    }));
}
button.addEventListener("click", buttonClicked);


// EventBridge message from App script.
function onScriptEventReceived(data){
    var data = JSON.parse(data);
    switch (data.type) {
        case "buttonStatus":
        if (data.value) {
            document.getElementById("toggle").value = "ON";
        } else {
            document.getElementById("toggle").value = "OFF";
        }
        break;
    }
}


// Set the text of the button to either On or Off 
// when opening the tablet app, based on the app script status.
var EVENT_BRIDGE_SETUP_DELAY = 100;
function onLoad(){
    setTimeout(() => {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);    
        EventBridge.emitWebEvent(JSON.stringify({
            type: "EVENT_BRIDGE_OPEN_MESSAGE"
        }));   
    }, EVENT_BRIDGE_SETUP_DELAY);
}
onLoad();