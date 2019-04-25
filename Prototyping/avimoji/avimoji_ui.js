let renderJustEmojis = true;
let emojiList = [];
let emojiMap = {};
let favorites = {};
let shortnameMap = {};

// let searchContainer = document.getElementById("searchContainer");
let selectedContainer = document.getElementById("selectedContainer");
let emojiSequenceContainer = document.getElementById("emojiSequenceContainer");
let emojiFavoritesContainer = document.getElementById("emojiFavoritesContainer");
let emojiFavoriteList = document.getElementById("emojiFavoriteList");

let input = document.getElementById('filter_emojis');
let wearAsMask = document.getElementById('wearAsMask');
let advancedMode = document.getElementById('advancedMode');
let currentSwitchIntervalInput = document.getElementById('currentSwitchIntervalInput');
let oneShotMode = document.getElementById('oneShotMode');


let baseURL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/mnt/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/Prototyping/avimoji/images/emojis/"

let currentSelectedEmoji = null;
let currentEmojiSequence = null;


// logging function for the browser
let PREPEND = "\n!!Logger:Avimoji:Web::\n";
let DEBUG = true;
function l(label, data, overrideDebug, i){
    if (!overrideDebug === "temp") {
        if (!DEBUG) {
            if (overrideDebug !== true) {
                return;
            }
        }
    }

    if (overrideDebug === "off") {
        return;
    }

    data = typeof data === "undefined" ? "" : data;
    data = typeof data === "string" ? data
     :  (JSON.stringify(data, null, 4) || "");
    data = data + " " || "";
    if (typeof(i) === "number"){
        i = i;
    } else {
        i = "";
    }
    console.log(PREPEND + label + ": " + data + i +"\n");
}

const EMOJIS_PER_ROW = 20;
function renderEmojiList(list, isChunk){
    let emojiContainer = document.getElementById("emojiContainer");
    l("in render", null, "off");
    if (!isChunk){
        emojiContainer.innerHTML = ""
    }
    l("list.length", list.length, "off")
    let listDivMap = list.map( (emoji, index) => {
        let div;
        let emojiLength = 18;
        let emojiStyle = ` width: ${emojiLength}px; height: ${emojiLength}px; 
        background-size: ${emoji.small.sourceDimensions.x}px ${emoji.small.sourceDimensions.y}px; 
        background-position: -${emoji.small.frame.x}px -${emoji.small.frame.y}px;
        background-image: url('./images/emojis2/${emoji.small.source}');
        transform: scale(1);`
        if(renderJustEmojis){
            div = `
            <div
                onclick="clickEmoji(this)"
                onmouseover="hoverEmoji(this, true)"
                onmouseout="hoverEmoji(this)"
                draggable="false" 
                style="${emojiStyle}" 
                data-number="${emoji.number}" 
                data-shortName="${emoji.shortName}" 
                data-code=${emoji.code[0]}>
            </div>
        `
        } else {
            div = document.createElement("div");
            div.innerHTML = `
                <p>
                    <div draggable="false" class="normal emoji" style="width: ${emojiLength}px; height: ${emojiLength}px;
                    background-image: url('./images/emojis2/${emoji.normal.source}');
                    background-position: -${emoji.normal.frame.x}px -${emoji.normal.frame.y}px; transform: scale(1); display: inline-block;
                    background-size: ${emoji.normal.sourceDimensions.x}px ${emoji.normal.sourceDimensions.y}px;"></div>
                    ${emoji.number} : ${emoji.shortName} : ${emoji.keywords} : ${emoji.code}
                </p>
            `
        }

        return div;
    })
    if (!isChunk){
        l("list idv map", listDivMap, "off")
    }

    let gridDivItems = [];
    let totalRows = Math.ceil(list.length / EMOJIS_PER_ROW);
    let currentRow = 0;
    l("totalRows", totalRows, "off")
    listDivMap.forEach((emojiDiv, index) => {
        l("index", index, "off")
        l("index % EMOJIS_PER_ROW", index % EMOJIS_PER_ROW, "off")
        if ((index % EMOJIS_PER_ROW === 0 && index >= EMOJIS_PER_ROW) || 
            (currentRow === totalRows-1 && index === list.length-1)){
            gridDivItems.push(emojiDiv);
            let gridDiv = document.createElement('div');
            let gridClass = list.length < EMOJIS_PER_ROW ? "gridRowLeftJustify" : "gridRow";
            gridDiv.classList.add(gridClass)
            gridDiv.innerHTML = gridDivItems.join("\t\n");
            emojiContainer.appendChild(gridDiv);
            if (!isChunk){
                l("gridDivItems", gridDivItems.length, "off")
            }
            gridDivItems = [];
            currentRow++;
        } else {
            gridDivItems.push(emojiDiv);
        }
    })

    input.focus();   
}

function renderSelected(emoji){
    // l("in render selected")
    selectedContainer.innerHTML = "";
    let div = document.createElement('div');
    let emojiLength = 144;
    div.setAttribute("style","display: flex; flex-direction: column; justify-content: center; align-items: center;")
    div.draggable = false;
    l("render emoji", emoji, "off")
    div.innerHTML = `
        <div draggable="false"
            onclick="clickEmoji(this)"
            data-number="${emoji.number}" 
            data-shortName="${emoji.shortName}" 
            data-code=${emoji.code[0]}
            style="width: ${emojiLength}px; height: ${emojiLength}px; align-self: center;
            background-position: -${emoji.massive.frame.x}px -${emoji.massive.frame.y}px; 
            background-image: url('./images/emojis2/${emoji.massive.source}');
            margin-bottom: 20px;">
        </div>
        <div id="selectedText">
            ${emoji.shortName.toUpperCase()}
        </div>
        <div id="selectedTextKeywords">
            ${emoji.keywords.join(" | ").replace(" | " + emoji.shortName, "")}
        </div>
    `
    selectedContainer.appendChild(div);
}

function renderEmojiSequence(emojiSequence){
    emojiSequenceContainer.innerHTML = "";
    let div = document.createElement('div');
    let imageString = "";
    let emojiLength = 18;
    emojiSequence.forEach((emoji, index) => {
        imageString += `<span data-index="${index}" data-code="${emoji.code[0]}" draggable="false" class="emoji" style="width: ${emojiLength}px; height: ${emojiLength}px;
        background-position: -${emoji.small.frame.x}px -${emoji.small.frame.y}px; 
        background-image: url('./images/emojis2/${emoji.small.source}');
        onmouseover="hoverEmoji(this, true)"
        onmouseout="hoverEmoji(this)"
        >
        </span>`
        // imageString += `<img draggable="false" class="emojiSequence" data-index="${index}" src="${baseURL}${emoji.code[0]}.png">`
    })
    imageString += `
    <div>
        <input id="playStopButton" class="buttonControls" type="button" value="Play" onclick="updateIsPlaying()">
        <input id="resetButton" class="buttonControls" type="button" value="Reset" onclick="resetList()">
    </div>
    `
    div.innerHTML = imageString;
    // emojiSequenceContainer.appendChild(div);
    // updatePlayLabel(isPlaying);
}

function renderFavorites(list){
    emojiFavoriteList.innerHTML = "";
    let div = document.createElement('div');
    div.classList.add("gridRowLeftJustify")
    let imageString = "";
    list.forEach((emoji, index) => {
        l("emoji in code", emoji.code, "off"),
        emoji = emojiMap[emoji.code]
        let emojiLength = 36;
        let emojiStyle = ` width: ${emojiLength}px; height: ${emojiLength}px; 
        background-size: ${emoji.normal.sourceDimensions.x}px ${emoji.normal.sourceDimensions.y}px; 
        background-position: -${emoji.normal.frame.x}px -${emoji.normal.frame.y}px;
        background-image: url('./images/emojis2/${emoji.normal.source}');
        transform: scale(1);`
        imageString += `
        <span>
            <div
                onclick="clickEmoji(this)"
                onmouseover="hoverEmoji(this, true)"
                onmouseout="hoverEmoji(this)"
                draggable="false" 
                style="${emojiStyle}" 
                data-number="${emoji.number}" 
                data-shortName="${emoji.shortName}" 
                data-code=${emoji.code[0]}>
            </div>
        </span>`
    })
    div.innerHTML = imageString;
    emojiFavoriteList.appendChild(div);
}


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




function filterEmojis(event){
    let keyword = input.value.toLowerCase();
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        l('detected enter')
        event.preventDefault();
        if(shortnameMap[keyword.toLowerCase()]){
            l('found emoji')
            var emoji = emojiMap[shortnameMap[keyword.toLowerCase()]];
            EventBridge.emitWebEvent(JSON.stringify({
                app: "avimoji",
                method: "emojiSelected",
                emoji: emoji
            }))
            input.value = "";
            l("emojilist.length after enter", emojiList.length)
            renderEmojiList(emojiList);
            return;
        }
    }
    let filteredEmojiList = emojiList.filter((emoji, index) => {
        l("emoji.keywords", emoji.keywords, "off")
        let joinedKeywords = emoji.keywords.join(" ");
        l("joinedKeywords", joinedKeywords, "off");
        l("keyword", keyword, "off");
        return joinedKeywords.indexOf(keyword) > -1; 
    });
    l("emoji list: ", filteredEmojiList, "off")
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

function clickEmoji(clickedEmoji){
    let code = clickedEmoji.getAttribute('data-code');
    if (code && code.length > 0) {
        var emoji = emojiMap[code];
        EventBridge.emitWebEvent(JSON.stringify({
            app: "avimoji",
            method: "emojiSelected",
            emoji: emoji
        }))
    }
}

function handleWearAsMask(checkbox){
    let shouldWearMask = checkbox.checked;
    l("shouldWearMask",shouldWearMask)
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleShouldWearMask",
        shouldWearMask: shouldWearMask
    }))
}

function handleOneShotMode(checkbox){
    let oneShotMode = checkbox.checked;
    l("oneShotMode", oneShotMode)
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleOneShotMode",
        oneShotMode: oneShotMode
    }))
}

function handleAdvancedModeChange(checkbox){
    let newAdvancedModeState = checkbox.checked;
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleAdvancedMode",
        newAdvancedModeState: newAdvancedModeState
    }))
}

function resetList(){
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "resetList"
    }))
}

function clickSequenceEmoji(event){
    l("in clickSequence");
    if (event.target.getAttribute('data-index')){
        let index = +event.target.getAttribute('data-index');
        l("index", index);
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

function hoverEmoji(emoji, onHover){
    if (onHover) {
        let code = emoji.getAttribute('data-code');
        if (code && code.length > 0 && allChunksReceived) {
            var emoji = emojiMap[code];
            renderSelected(emoji)
        }
    } else {
        if (currentSelectedEmoji) {
            renderSelected(currentSelectedEmoji)
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

function hoverFavorites(event){
    if (str(event.target) === "DIV") {
        if (currentSelectedEmoji) {
            renderSelected(currentSelectedEmoji)
        }
    } else {
        if (event.target.getAttribute('data-index')){
            let index = +event.target.getAttribute('data-index');
            var emoji = favorites[index];
            renderSelected(emoji)
        }
    }
}

// Handle the slider being changed
function emojiScalerChanged(slider) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "updateEmojiScaler",
        emojiScaler: slider.value
    }));
}


const MAX_FAVORITES = 12;
function makeFavoritesArray(){
    l("in favorites array", null, "off")
    let i = 0, favoritesArray = [];
    for (var ob in favorites){
        favoritesArray[i++] = favorites[ob];
    }

    favoritesArray.sort((a,b) =>{
        if (a.count > b.count) {
            return -1
        }

        if (a.count < b.count) {
            return 1;
        }
        
        return 0;
    })
    favoritesArray = favoritesArray.slice(0, MAX_FAVORITES);
    l("favorites", favorites, "off");
    renderFavorites(favoritesArray);
}

let allChunksReceived = false;
// Handle incoming tablet messages
function onScriptEventReceived(message) {
    try {
        message = JSON.parse(message);
    } catch (e) {
        l("error in script", e);
        return;
    }

    if (message.app !== "avimoji") {
        return; 
    }

    switch (message.method) {
        case "updateUI":
            l("in update ui")
            l("message", message, "on")
            document.getElementById("loadingContainer").style.display = "none";
            isPlaying = message.isPlaying
            if (message.emojiSequence.length > 0){
                currentEmojiSequence = message.emojiSequence;
                renderEmojiSequence(message.emojiSequence);
            }
            if (message.selectedEmoji){
                renderSelected(message.selectedEmoji);
                currentSelectedEmoji = message.selectedEmoji;
            }
            if (message.favorites){
                favorites = message.favorites;
            }
            advancedMode.checked = message.advancedModeOn || false;
            wearAsMask.checked = message.shouldWearMask || false;
            document.getElementById("emojiScaler").value = message.emojiScaler;
            // oneShotMode.value = message.oneShotMode || false;

            // currentSwitchIntervalInput.value = message.emojiSwitch_ms || 500;
            input.focus();   
            break;
        case "sendChunk":
            // l("got chunk")
            emojiList = emojiList.concat(message.chunk);
            emojiMap = Object.assign({}, emojiMap, ...message.chunk.map(emoji => ({[emoji.code[0]]: emoji})))
            shortnameMap = Object.assign({}, shortnameMap, ...message.chunk.map(emoji => ({[emoji.shortName]: emoji.code[0]})))
            renderEmojiList(message.chunk, true);
            if (!currentSelectedEmoji) {
                currentSelectedEmoji = emojiList[0];
                renderSelected(currentSelectedEmoji);
            }
            if (message.chunkNumber >= message.totalChunks -1){
                l("about to make favorites now that chunks are good")
                allChunksReceived = true;
                makeFavoritesArray();
                // l("shortnamemap", shortnameMap)
            }
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
        case "updateFavorites":
            favorites = message.favorites;
            makeFavoritesArray();
            break;
        default:
            l("Unknown message received from avimoji.js!", JSON.stringify(message));
            break;
    }
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
var EVENTBRIDGE_SETUP_DELAY = 50;
function onLoad() {
    l("in onload")
    let emojiContainer = document.getElementById("emojiContainer");
    setTimeout(function() {
        l("emiting event")
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        emitAppSpecificEvent("eventBridgeReady");
    }, EVENTBRIDGE_SETUP_DELAY);
    input.addEventListener('keyup', filterEmojis);
    // emojiContainer.addEventListener('click', clickEmoji);
    // emojiContainer.addEventListener('mouseover', hoverEmoji);
    // emojiContainer.addEventListener('mouseout', hoverEmoji);
    // emojiSequenceContainer.addEventListener('click', clickSequenceEmoji)
    // emojiSequenceContainer.addEventListener('mouseover', hoverEmoji);
    // emojiSequenceContainer.addEventListener('mouseout', hoverEmoji);
    // emojiFavoritesContainer.addEventListener('click', clickEmoji);
    // emojiFavoritesContainer.addEventListener('mouseover', hoverEmoji);
    // emojiFavoritesContainer.addEventListener('mouseout', hoverEmoji);
}


// Call onLoad() once the DOM is ready
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});




/*

        <span>
            <div
                onclick="clickEmoji(this)"
                onmouseover="hoverEmoji(this, true)"
                onmouseout="hoverEmoji(this)"
                draggable="false" 
                style="${emojiStyle}" 
                data-number="${emoji.number}" 
                data-shortName="${emoji.shortName}" 
                data-code=${emoji.code[0]}>
            </div><span style="color: white; font-size: 45px;">${favorites[emoji.code[0]].count}</span>
        </span>`



*/