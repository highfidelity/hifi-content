
// Send an event to the app script to 
// toggle it on/off when the button is clicked
var button = document.getElementById("checkbox1");
var drawFrontCheck = document.getElementById("checkbox2"); 
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
  sliderEvent();
};

function buttonClicked(){ 
    EventBridge.emitWebEvent(JSON.stringify({
        type: "TOGGLE_APP"
    }));
}
button.addEventListener("click", buttonClicked);
function drawButtonClicked(){ 
    EventBridge.emitWebEvent(JSON.stringify({
        type: "TOGGLE_DRAW",
        value: drawFrontCheck.checked
    }));
}
drawFrontCheck.addEventListener("click", drawButtonClicked);
function sliderEvent(){
    EventBridge.emitWebEvent(JSON.stringify({
        type: "HEIGHT_SLIDER",
        value: output.innerHTML
    }));
}
// slider.addEventListener("slider", sliderEvent);
// EventBridge message from App script.
function onScriptEventReceived(data){
    var data = JSON.parse(data);
    switch (data.type) {
        case "buttonStatus":
        if (data.value) {
            button.checked = true;
        } else {
            button.checked = false;
        }
        break;
    case "drawButtonStatus":
        if (data.value) {
            drawFrontCheck.checked = true;
        } else {
            drawFrontCheck.checked = false;
        }
        break;
    case "heightStatus":
        if (data.value) {
            slider.value = data.value;
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