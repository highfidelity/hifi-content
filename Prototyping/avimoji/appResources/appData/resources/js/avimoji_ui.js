/*

    Avimoji
    avimoji_ui.js
    Created by Milad Nazeri on 2019-04-26
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

*/

// *************************************
// START vars
// *************************************
// #region vars

let emojiList = [];
let emojiMap = {};
let favoritesArray = []
let shortnameMap = {};
let advancedModeOn = false;
let emojiSequence = [];
let firstOpened = true;

let currentSelectedEmoji = null;
let lastHoveredEmoji = null;
let currentEmojiSequence = null;
let isHovering = null;

// #endregion
// *************************************
// END vars
// *************************************

// *************************************
// START html
// *************************************
// #region html


let selectedContainer = document.getElementById("selectedContainer");
let emojiSequenceContainer = document.getElementById("emojiSequenceContainer");
let emojiFavoritesContainer = document.getElementById("emojiFavoritesContainer");
let emojiFavoriteList = document.getElementById("emojiFavoriteList");
let advancedContainer = document.getElementById("advancedContainer");
let stickyContainer = document.getElementById("stickyContainer");
let emojiContainer = document.getElementById("emojiContainer");

let input = document.getElementById('filter_emojis');
let wearAsMask = document.getElementById('wearAsMask');
let local = document.getElementById('local');
let sequenceMode = document.getElementById('sequenceMode');
let allEmojis = document.getElementById('allEmojis');

let advancedMode = document.getElementById('advancedMode');
let currentSwitchIntervalInput = document.getElementById('currentSwitchIntervalInput');
let oneShotMode = document.getElementById('oneShotMode');


// #endregion
// *************************************
// END html
// *************************************

// *************************************
// START utiltiy
// *************************************
// #region utiltiy


// logging function for the browser
let PREPEND = "\n!!Logger:Avimoji:Web::\n";
let DEBUG = false;
function l(label, data, overrideDebug){
    if (!DEBUG) {
        if (overrideDebug === "temp" || overrideDebug =="off") {
            return;
    } else {
        if (overrideDebug =="off") {
            return;
        }
    }

    data = typeof data === "undefined" ? "" : data;
    data = typeof data === "string" ? data :  (JSON.stringify(data, null, 4) || "");
    data = data + " " || "";
    console.log(PREPEND + label + ": " + data + "\n");
}


// #endregion
// *************************************
// END utiltiy
// *************************************

// *************************************
// START render
// *************************************
// #region render


const EMOJIS_PER_ROW = 20;
const RENDER_JUST_EMOJIS = true;
function renderEmojiList(list, isChunk){
    l("in render", null, "off");
    if (!isChunk){
        emojiContainer.innerHTML = ""
    }
    let listDivMap = list.map( (emoji, index) => {
        let div;
        let emojiLength = 18;
        let emojiStyle = ` width: ${emojiLength}px; height: ${emojiLength}px; 
        background-size: ${emoji.small.sourceDimensions.x}px ${emoji.small.sourceDimensions.y}px; 
        background-position: -${emoji.small.frame.x}px -${emoji.small.frame.y}px;
        background-image: url('./images/emojis2/${emoji.small.source}');
        transform: scale(1);`
        if(RENDER_JUST_EMOJIS){
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

    let gridDivItems = [];
    let totalRows = Math.ceil(list.length / EMOJIS_PER_ROW);
    let currentRow = 0;
    listDivMap.forEach((emojiDiv, index) => {
        if ((index % EMOJIS_PER_ROW === 0 && index >= EMOJIS_PER_ROW) || 
            (currentRow === totalRows-1 && index === list.length-1)){
            gridDivItems.push(emojiDiv);
            let gridDiv = document.createElement('div');
            let gridClass = list.length < EMOJIS_PER_ROW ? "gridRowLeftJustify" : "gridRow";
            gridDiv.classList.add(gridClass)
            gridDiv.innerHTML = gridDivItems.join("\t\n");
            emojiContainer.appendChild(gridDiv);
            gridDivItems = [];
            currentRow++;
        } else {
            gridDivItems.push(emojiDiv);
        }
    })

    input.focus();   
}


function renderSelected(emoji){
    selectedContainer.innerHTML = "";
    let div = document.createElement('div');
    let emojiLength = 144;
    div.setAttribute("style","display: flex; flex-direction: column; justify-content: center; align-items: center;")
    div.draggable = false;
    l("render emoji", emoji, "off")
    if (currentSelectedEmoji) {
        div.innerHTML += `
        <div>
            <input id="removeEmoji" class="buttonControls" style="width: 90px" type="button" value="Remove" onclick="handleDeleteSelected()">
        </div>
        `
    }
    div.innerHTML += `
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
        imageString += `
            <span 
                data-index="${index}" 
                data-code="${emoji.code[0]}" 
                draggable="false" 
                class="emoji" 
                style="width: ${emojiLength}px; height: ${emojiLength}px;
                background-position: -${emoji.small.frame.x}px -${emoji.small.frame.y}px; 
                background-image: url('./images/emojis2/${emoji.small.source}');
                onmouseover="hoverEmoji(this, true)"
                onmouseout="hoverEmoji(this)"
            >
            </span>`
    })
    imageString += `
        <div>
            <input id="playStopButton" class="buttonControls" type="button" value="Play" onclick="handleUpdateIsPlaying()">
            <input id="resetButton" class="buttonControls" type="button" value="Reset" onclick="handleResetList()">
        </div>
    `
    div.innerHTML = imageString;
    emojiSequenceContainer.appendChild(div);
    updatePlayLabel(isPlaying);
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


const STICKY_MENU_NOSELECT_ADVANCED_HEIGHT = "250px";
const EMOJI_LIST_NOSELECT_ADVANCED_MARGIN_TOP = "250px";

const STICKY_MENU_WITH_REMOVE_ADVANCED_HEIGHT = "500px";
const EMOJI_LIST_WITH_REMOVE_ADVANCED_MARGIN_TOP = "500px";

const STICKY_MENU_ADVANCED_HEIGHT = "520px";
const EMOJI_LIST_ADVANCED_MARGIN_TOP = "521px";

const STICKY_MENU_NOSELECT_SIMPLE_HEIGHT = "200px";
const EMOJI_LIST_NOSELECT_SIMPLE_MARGIN_TOP = "200px";

const STICKY_MENU_SIMPLE_HEIGHT = "430px";
const EMOJI_LIST_SIMPLE_MARGIN_TOP = "430px";

const STICKY_MENU_WITH_REMOVE_SIMPLE_HEIGHT = "430px";
const EMOJI_LIST_WITH_REMOVE_SIMPLE_MARGIN_TOP = "430px";

function renderUI(){
    if (advancedModeOn){
        advancedContainer.style.display = "block"
        l("currentSelectedEmoji", currentSelectedEmoji, "off")

        if (isSequenceMode){
            l('advanced - Sequence Mode')
            renderEmojiSequence(currentEmojiSequence);
        } else {
            emojiSequenceContainer.innerHTML = "";
        }

        if (isHovering){
            l('advanced - emojiHovered || !firstOpen')
            selectedContainer.innerHTML = "";
            stickyContainer.style.height = STICKY_MENU_ADVANCED_HEIGHT;
            emojiContainer.style.marginTop = EMOJI_LIST_ADVANCED_MARGIN_TOP;
            renderSelected(lastHoveredEmoji);
            return;
        }

        if (currentSelectedEmoji){
            l('advanced - currently selected')
            stickyContainer.style.height = STICKY_MENU_WITH_REMOVE_ADVANCED_HEIGHT;
            emojiContainer.style.marginTop = EMOJI_LIST_WITH_REMOVE_ADVANCED_MARGIN_TOP;
            renderSelected(currentSelectedEmoji);
            return;
        }

        if (lastHoveredEmoji){
            l('advanced - currently selected')
            stickyContainer.style.height = STICKY_MENU_WITH_REMOVE_ADVANCED_HEIGHT;
            emojiContainer.style.marginTop = EMOJI_LIST_WITH_REMOVE_ADVANCED_MARGIN_TOP;
            renderSelected(lastHoveredEmoji);
            return;
        }

        l('advanced - not selected')
        selectedContainer.innerHTML = "";
        stickyContainer.style.height = STICKY_MENU_NOSELECT_ADVANCED_HEIGHT;
        emojiContainer.style.marginTop = EMOJI_LIST_NOSELECT_ADVANCED_MARGIN_TOP;
        
    } else {
        
        advancedContainer.style.display = "none"
        emojiSequenceContainer.innerHTML = "";

        if (isHovering) {
            l('simple - hovered or not first opened')
            stickyContainer.style.height = STICKY_MENU_WITH_REMOVE_SIMPLE_HEIGHT;
            emojiContainer.style.marginTop = EMOJI_LIST_WITH_REMOVE_SIMPLE_MARGIN_TOP;
            renderSelected(lastHoveredEmoji);
            return;
        }

        if (currentSelectedEmoji){
            l('simple - currently selected')
            stickyContainer.style.height = STICKY_MENU_WITH_REMOVE_SIMPLE_HEIGHT;
            emojiContainer.style.marginTop = EMOJI_LIST_WITH_REMOVE_SIMPLE_MARGIN_TOP;
            renderSelected(currentSelectedEmoji);
            return;
        }

        if (lastHoveredEmoji){
            l('simple - last hovered')
            stickyContainer.style.height = STICKY_MENU_WITH_REMOVE_SIMPLE_HEIGHT;
            emojiContainer.style.marginTop = EMOJI_LIST_WITH_REMOVE_SIMPLE_MARGIN_TOP;
            renderSelected(lastHoveredEmoji);
            return;
        }


        l('simple - nothing')
        selectedContainer.innerHTML = "";
        stickyContainer.style.height = STICKY_MENU_NOSELECT_SIMPLE_HEIGHT;
        emojiContainer.style.marginTop = EMOJI_LIST_NOSELECT_SIMPLE_MARGIN_TOP;
    
    }
    if (firstOpened) {
        firstOpened = false;
    }
}


// #endregion
// *************************************
// END render
// *************************************

// *************************************
// START dom_manipulations
// *************************************
// #region dom_manipulations


function updatePlayLabel(playState) {
    let playStopButton = document.getElementById("playStopButton");
    isPlaying = playState;
    let playLabel = isPlaying ? "Stop" : "Play";
    playStopButton.value = playLabel;
}


// #endregion
// *************************************
// END dom_manipulations
// *************************************

// *************************************
// START handlers
// *************************************
// #region handlers


// Handle play state change
let isPlaying = false;
function handleUpdateIsPlaying() {
    isPlaying = !isPlaying;
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleUpdateIsPlaying",
        isPlaying: isPlaying
    }));
    updatePlayLabel(isPlaying);
}


function handleDeleteSelected(){
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleDeleteSelected"
    }));
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

function handleLocalChange(checkbox){
    let isLocal = checkbox.checked;
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleLocalChange",
        isLocal: isLocal
    }))
}


let isAllEmojis = true;
function handleAllEmojis(checkbox){
    isAllEmojis = checkbox.checked;
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleAllEmojis",
        isAllEmojis: isAllEmojis
    }))
}


let isSequenceMode = false;
function handleSequenceModeChange(checkbox){
    isSequenceMode = checkbox.checked;
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleSequenceModeChange",
        isSequenceMode: isSequenceMode
    }))
    renderUI();
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
    advancedModeOn = checkbox.checked;
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleAdvancedMode",
        newAdvancedModeState: advancedModeOn
    }))
    renderUI();
}


// Handle the slider being changed
function handleEmojiScalerChanged(slider) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleUpdateEmojiScaler",
        emojiScaler: slider.value
    }));
}


// #endregion
// *************************************
// END handlers
// *************************************

// *************************************
// START event_handlers
// *************************************
// #region event_handlers


function filterEmojis(event){
    let keyword = input.value.toLowerCase();
    if (event.keyCode === 13) {
        event.preventDefault();
        if(shortnameMap[keyword.toLowerCase()]){
            let emoji = emojiMap[shortnameMap[keyword.toLowerCase()]];
            EventBridge.emitWebEvent(JSON.stringify({
                app: "avimoji",
                method: "emojiSelected",
                emoji: emoji
            }))
            input.value = "";
            renderEmojiList(emojiList);
            return;
        }
    }
    let filteredEmojiList = emojiList.filter((emoji, index) => {
        let joinedKeywords = emoji.keywords.join(" ");
        return joinedKeywords.indexOf(keyword) > -1; 
    });
    renderEmojiList(filteredEmojiList);
}


function clickEmoji(clickedEmoji){
    let code = clickedEmoji.getAttribute('data-code');
    if (code && code.length > 0) {
        let emoji = emojiMap[code];
        EventBridge.emitWebEvent(JSON.stringify({
            app: "avimoji",
            method: "emojiSelected",
            emoji: emoji
        }))
    }
}


function resetList(){
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "resetList"
    }))
    updatePlayLabel();
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


function hoverEmoji(emoji, onHover){
    if (onHover) {
        isHovering = true;
        let code = emoji.getAttribute('data-code');
        if (code && code.length > 0 && allChunksReceived) {
            let emoji = emojiMap[code];
            lastHoveredEmoji = emoji;
            renderUI();
        }
    } else {
        isHovering = false;
        if (currentSelectedEmoji) {
            renderUI();
        }
    }
}


// #endregion
// *************************************
// END event_handlers
// *************************************

// *************************************
// START tablet
// *************************************
// #region tablet


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

    l("message", message, "off")

    switch (message.method) {
        case "updateUI":
            l("in update ui")
            document.getElementById("loadingContainer").style.display = "none";
            advancedMode.checked = advancedModeOn = message.advancedModeOn || false;
            wearAsMask.checked = message.shouldWearMask || false;
            local.checked = message.isLocal || false;
            allEmojis.checked = isAllEmojis = message.isLocal || false;
            sequenceMode.checked = isSequenceMode = message.isSequenceMode || false;
            document.getElementById("emojiScaler").value = message.emojiScaler;
            isPlaying = message.isPlaying
            currentSelectedEmoji = message.selectedEmoji || null;

            if (message.emojiSequence.length > 0){
                currentEmojiSequence = message.emojiSequence || [];
            }
            if (message.favorites){
                favoritesArray = message.favorites;
            }

            l("RENDER UI -> updateUI");
            renderUI()

            input.focus();   
            break;
        case "sendChunk":
            emojiList = emojiList.concat(message.chunk);
            emojiMap = Object.assign({}, emojiMap, ...message.chunk.map(emoji => ({[emoji.code[0]]: emoji})))
            shortnameMap = Object.assign({}, shortnameMap, ...message.chunk.map(emoji => ({[emoji.shortName]: emoji.code[0]})))
            renderEmojiList(message.chunk, true);
            if (message.chunkNumber >= message.totalChunks -1){
                l("about to make favorites now that chunks are good")
                allChunksReceived = true;
                renderFavorites(favoritesArray);
            }
            break;
        case "updateEmojiPicks":
            currentSelectedEmoji = message.selectedEmoji;
            currentEmojiSequence = message.emojiSequence || [];
            l("RENDER UI -> updateEmojiPicks");
            renderUI();
            break;
        case "updateCurrentEmoji":
            currentSelectedEmoji = message.selectedEmoji;
            l("RENDER UI -> updateCurrentEmoji");
            renderUI();
            break;
        case "updateFavorites":
            favoritesArray = message.favorites;
            break;
        default:
            l("Unknown message received from avimoji.js!", JSON.stringify(message));
            break;
    }
}


// Emit an event specific to the `multiConApp` over the EventBridge.
let APP_NAME = "avimoji";
function emitAppSpecificEvent(method, data) {
    let event = {
        app: APP_NAME,
        method: method,
        data: data
    };
    EventBridge.emitWebEvent(JSON.stringify(event));
}

// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
let EVENTBRIDGE_SETUP_DELAY = 110;
function onLoad() {
    l("in onload")
    setTimeout(function() {
        l("emiting event")
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        emitAppSpecificEvent("eventBridgeReady");
    }, EVENTBRIDGE_SETUP_DELAY);
    input.addEventListener('keyup', filterEmojis);
}


// Call onLoad() once the DOM is ready
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});


// #endregion
// *************************************
// END tablet
// *************************************


/*
// Update the emoji switch interval
function updateSwitchIntervalTimeInput(input) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "updateSwitchIntervalTime",
        switchIntervalTime: input.value
    }));
}

 // currentSwitchIntervalInput.value = message.emojiSwitch_ms || 500;

*/