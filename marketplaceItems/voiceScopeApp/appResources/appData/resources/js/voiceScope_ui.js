
// Send an event to the app script to 
// toggle it on/off when the button is clicked
var button = document.getElementById("checkbox1");
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
            button.value = "ON";
        } else {
            button.value = "OFF";
        }
        break;
    }
}


// Set the text of the button to either On or Off 
// when opening the tablet app, based on the app script status.
// The delay shouldn't be necessary in RC78. this is currently necessary because of this bug:
// https://highfidelity.manuscript.com/f/cases/20253/screenChanged-signal-is-emitted-before-the-screen-has-actually-changed
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