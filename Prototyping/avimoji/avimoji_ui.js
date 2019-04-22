let renderJustEmojis = true;
let emojiList;

let emojiContainer = document.getElementById("emojiContainer");
let searchContainer = document.getElementById("searchContainer");
let selectedContainer = document.getElementById("selectedContainer");
let emojiSequenceContainer = document.getElementById("emojiSequenceContainer");
let input = document.getElementById('filter_emojis');
let wearAsMask = document.getElementById('wearAsMask');
let currentSwitchIntervalInput = document.getElementById('currentSwitchIntervalInput');
let oneShotMode = document.getElementById('oneShotMode');


let baseURL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/mnt/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/Prototyping/avimoji/images/emojis/"

let currentSelectedEmoji = null;
let currentEmojiSequence = null;

function renderEmojiList(list){
    emojiContainer.innerHTML = ""
    let listDivMap = list.map( emoji => {
        let div = document.createElement('div');
        if (renderJustEmojis){
            div.innerHTML = `
            <span class="emoji" draggable="false" data-number="${emoji.number}">&#x${emoji.code[0]};</span>
            <!-- <img class="emoji" draggable="false" data-number="${emoji.number}" src="${baseURL}${emoji.code[0]}.png"> -->
        `
        } else {
            div.innerHTML = `
            <p>
                <img draggable="false" class="emoji" src="${baseURL}${emoji.code[0]}.png">
                ${emoji.number} : ${emoji.shortName} : ${emoji.keywords} : ${emoji.code}
            </p>
        `
        }

        return div;
    })

    listDivMap.forEach(div => {
        emojiContainer.appendChild(div);
    })
    if (renderJustEmojis) {
        emojiContainer.classList.add('grid')
    }
    input.focus();   
}


function renderSelected(emoji){
    selectedContainer.innerHTML = "";
    let div = document.createElement('div');
    div.innerHTML = `
        <span draggable="false" id="selectedEmoji">&#x${emoji.code[0]};</span>
        <!-- <img draggable="false" id="selectedEmoji" src="${baseURL}${emoji.code[0]}.png"> -->
        <div id="selectedText">
            ${emoji.shortName}
        </div>
    `
    selectedContainer.appendChild(div);
}

// Change the play/stop button label
function updatePlayLabel(playState) {
    let playStopButton = document.getElementById("playStopButton");
    isPlaying = playState;
    var playLabel = isPlaying ? "Stop" : "Play";
    playStopButton.value = playLabel;
}

// Handle play state change
var isPlaying = false;
function updateIsPlaying() {
    isPlaying = !isPlaying;
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "updateIsPlaying",
        isPlaying: isPlaying
    }));
    updatePlayLabel(isPlaying);
}


function renderEmojiSequence(emojiSequence){
    emojiSequenceContainer.innerHTML = "";
    let div = document.createElement('div');
    let imageString = "";
    emojiSequence.forEach((emoji, index) => {
        imageString += `<span draggable="false" class="emojiSequence" data-index="${index}">&#x${emoji.code[0]};</span>`
        // imageString += `<img draggable="false" class="emojiSequence" data-index="${index}" src="${baseURL}${emoji.code[0]}.png">`
    })
    imageString += `
    <div>
        <input id="playStopButton" class="buttonControls" type="button" value="Play" onclick="updateIsPlaying()">
        <input id="resetButton" class="buttonControls" type="button" value="Reset" onclick="resetList()">
    </div>
    `
    div.innerHTML = imageString;
    emojiSequenceContainer.appendChild(div);
    updatePlayLabel(isPlaying);

}


function filterEmojis(event){
  let keyword = input.value.toLowerCase();
  filteredEmojiList = emojiList.filter(emoji => {
       return emoji.keywords.join(" ").indexOf(keyword) > -1; 
  });
  
  renderEmojiList(filteredEmojiList);
}

// Update the emoji switch interval
function updateSwitchIntervalTimeInput(input) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "updateSwitchIntervalTime",
        switchIntervalTime: input.value
    }));
}

function clickEmoji(event){
    let number = +event.target.getAttribute('data-number');
    if (number > 0) {``
       var emoji = emojiList[number-1];
        EventBridge.emitWebEvent(JSON.stringify({
            app: "avimoji",
            method: "emojiSelected",
            emoji: emoji
        }))
    }
}

function handleWearAsMask(checkbox){
    let shouldWearMask = checkbox.checked;
    console.log("shouldWearMask:" + shouldWearMask)
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleShouldWearMask",
        shouldWearMask: shouldWearMask
    }))
}

function handleOneShotMode(checkbox){
    let oneShotMode = checkbox.checked;
    console.log("oneShotMode:" + oneShotMode)
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleOneShotMode",
        oneShotMode: oneShotMode
    }))
}

function resetList(){
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "resetList"
    }))
}

function clickSequenceEmoji(event){
    if (event.target.getAttribute('data-index')){
        let index = +event.target.getAttribute('data-index');
        EventBridge.emitWebEvent(JSON.stringify({
            app: "avimoji",
            method: "deleteEmojiInSequence",
            index: index
        }))
    }
}
function str(el) {
    if (!el) return "null"
    return el.className || el.tagName;
}

function hoverEmoji(event){
    if (str(event.target) === "DIV") {
        if (currentSelectedEmoji) {
            renderSelected(currentSelectedEmoji)
        }
    } else {
        let number = +event.target.getAttribute('data-number');
        if (number > 0) {``
            var emoji = emojiList[number-1];
            renderSelected(emoji)
        }
    }
}

function hoverEmojiSequence(event){
    if (str(event.target) === "DIV") {
        if (currentSelectedEmoji) {
            renderSelected(currentSelectedEmoji)
        }
    } else {
        if (event.target.getAttribute('data-index')){
            let index = +event.target.getAttribute('data-index');
            var emoji = currentEmojiSequence[index];
            renderSelected(emoji)
        }
    }
}

// Handle the slider being changed
function userSliderChanged(slider) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "updateEmojiScaler",
        emojiScaler: slider.value
    }));
}

// Handle incoming tablet messages
function onScriptEventReceived(message) {
    try {
        message = JSON.parse(message);
    } catch (e) {
        console.log(e);
        return;
    }

    if (message.app !== "avimoji") {
        return; 
    }

    console.log(message.method)
    switch (message.method) {
        case "updateUI":
            console.log("in update ui")
            // document.getElementById("nameTagSwitch").checked = message.nameTagEnabled;
            // document.getElementById("sizeSlider").value = message.currentUserScaler;            
            // document.getElementById("loadingContainer").style.display = "none";
            emojiList = message.emojiList;
            console.log("sequenceLength: " + message.emojiSequence.length)
            isPlaying = message.isPlaying
            console.log("isPlaying:" + isPlaying)        
            renderEmojiList(emojiList);
            if (message.emojiSequence.length > 0){
                currentEmojiSequence = message.emojiSequence;
                renderEmojiSequence(message.emojiSequence);
            }
            if (message.selectedEmoji){
                renderSelected(message.selectedEmoji);
                currentSelectedEmoji = message.selectedEmoji;
            }
            wearAsMask.value = message.shouldWearMask;
            oneShotMode.value = message.oneShotMode;
            input.focus();   
            document.getElementById("emojiScaler").value = message.emojiScaler;
            currentSwitchIntervalInput.value = message.emojiSwitch_ms;
            break;
        case "updateEmojiPicks":
            renderSelected(message.selectedEmoji);
            currentSelectedEmoji = message.selectedEmoji;
            renderEmojiSequence(message.emojiSequence);
            break;
        case "updateCurrentEmoji":
            renderSelected(message.selectedEmoji);
            currentSelectedEmoji = message.selectedEmoji;
            break;
        default:
            console.log("Unknown message received from avimoji.js! " + JSON.stringify(message));
            break;
    }
}


// This is how much time to give the Eventbridge to wake up.  This won't be needed in RC78 and will be removed.
// Run when the JS is loaded and give enough time to for EventBridge to come back
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {


    
}

// Emit an event specific to the `multiConApp` over the EventBridge.
var APP_NAME = "avimoji";
function emitAppSpecificEvent(method, data) {
    var event = {
        app: APP_NAME,
        method: method,
        data: data
    };
    EventBridge.emitWebEvent(JSON.stringify(event));
}

// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 150;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        emitAppSpecificEvent("eventBridgeReady");
    }, EVENTBRIDGE_SETUP_DELAY);
    input.addEventListener('keyup', filterEmojis);
    emojiContainer.addEventListener('click', clickEmoji);
    emojiContainer.addEventListener('mouseover', hoverEmoji);
    emojiContainer.addEventListener('mouseout', hoverEmoji);
    emojiSequenceContainer.addEventListener('click', clickSequenceEmoji)
    emojiSequenceContainer.addEventListener('mouseover', hoverEmojiSequence);
    emojiSequenceContainer.addEventListener('mouseout', hoverEmojiSequence);
}


// Call onLoad() once the DOM is ready
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});

onLoad();



