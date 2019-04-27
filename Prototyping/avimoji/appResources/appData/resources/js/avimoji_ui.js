/*

    Avimoji
    avimoji_ui.js
    Created by Milad Nazeri on 2019-04-26
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

*/

var OFF = "off";
var ON = "on";
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
let shouldTimeoutDelete = document.getElementById('shouldTimeoutDelete');
let currentSwitchIntervalInput = document.getElementById('currentSwitchIntervalInput');


// #endregion
// *************************************
// END html
// *************************************

// *************************************
// START utiltiy
// *************************************
// #region utiltiy


var PREPEND = "\n##Logger:Avimoji:Web::\n";
var DEBUG = false;
function log(label, data, overrideDebug){
    if (!DEBUG) {
        return;
    } else {
        if (overrideDebug === "off") {
            return;
        }
    }

    data = typeof data === "undefined" ? "" : data;
    data = typeof data === "string" ? data :  (JSON.stringify(data, null, 4) || "");
    data = data + " " || "";
    console.log(PREPEND + label + ": " + data +"\n");
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
    // log("in render", null, "off");
    if (!isChunk){
        emojiContainer.innerHTML = ""
    }
    let listDivMap = list.map( (emoji, index) => {
        let div;
        let emojiLength = 18;
        let emojiStyle = ` width: ${emojiLength}px; height: ${emojiLength}px; 
        background-size: ${emoji.small.sourceDimensions.x}px ${emoji.small.sourceDimensions.y}px; 
        background-position: -${emoji.small.frame.x}px -${emoji.small.frame.y}px;
        background-image: url('./images/emojis/${emoji.small.source}');
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
                data-code="${emoji.code[0]}"
            >
            </div>
        `
        } else {
            div = document.createElement("div");
            div.innerHTML = `
                <p>
                    <div draggable="false" class="normal emoji" style="width: ${emojiLength}px; height: ${emojiLength}px;
                    background-image: url('./images/emojis/${emoji.normal.source}');
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
    // log("== in render selected ==", null, OFF)
    // log("allChunksReceived", allChunksReceived, OFF)
    // log("emoji", emoji, OFF)
    if (!allChunksReceived || !emoji) {
        selectedContainer.style.display = "none";
        return;
    }
    selectedContainer.style.display = "block";
    selectedContainer.innerHTML = "";
    let div = document.createElement('div');
    let emojiLength = 144;
    div.setAttribute("style","display: flex; flex-direction: column; justify-content: center; align-items: center;")
    div.draggable = false;
    // log("render emoji", emoji, "off")
    let buttonHTML = `
        <div>
            <input id="removeEmoji" class="buttonControls" style="width: 50px; margin-top: 0px;" type="button" value="Remove" onclick="handleDeleteSelected()">
        </div>
    `
    div.innerHTML += `
        <div draggable="false"
            onclick="clickEmoji(this)"
            data-number="${emoji.number}" 
            data-shortName="${emoji.shortName}" 
            data-code=${emoji.code[0]}
            style="width: ${emojiLength}px; height: ${emojiLength}px; align-self: center;
            background-position: -${emoji.massive.frame.x}px -${emoji.massive.frame.y}px; 
            background-image: url('./images/emojis/${emoji.massive.source}');
            margin-bottom: 20px;">
        </div>
        ${currentSelectedEmoji && !isSequenceMode ? buttonHTML : ""}
        <div id="selectedText">
            ${emoji.shortName.toUpperCase()}
        </div>
        <div id="selectedTextKeywords">
            ${emoji.keywords.join(" | ").replace(" | " + emoji.shortName, "")}
        </div>
    `
    selectedContainer.appendChild(div);
}


function renderEmojiSequence(){
    var elem = document.getElementById('emojiSequenceContent')
    if (elem) {
        elem.parentNode.removeChild(elem);
    }
    if (currentEmojiSequence.length === 0 || !isSequenceMode) {
        return;
    }


    let imageString = "";
    let emojiLength = 18;
    currentEmojiSequence.forEach((emoji, index) => {
        imageString += `
        <div style="width: calc(1/20*100% - (1 - 1/20)*1px); display: inline-block;">
            <span 
                style="
                    width: ${emojiLength}px; height: ${emojiLength}px;
                    background-position: -${emoji.small.frame.x}px -${emoji.small.frame.y}px; 
                    background-image: url('./images/emojis/${emoji.small.source}');"
                data-index="${index}" 
                data-code="${emoji.code[0]}" 
                draggable="false" 
                class="emoji" 
                onmouseover="hoverEmoji(this, true)"
                onmouseout="hoverEmoji(this)"
                onclick="clickEmoji(this, true)"
            >
            </span>
        </div>`
    })

    let div = document.createElement('div');
    div.innerHTML = `
        <div id="emojiSequenceContent">
            <div style="margin-bottom: 2px;">
                <span class="mainTextColor" style="font-size: 10px;" id="emojiSequenceText">
                    Emoji Sequence
                </span>
            </div>
            <div id="emojiSequence" class ="gridRowLeftJustify">
                ${imageString}
            </div>
            <div class="gridRowCenter">
                <input id="playStopButton" style="width: 90px; margin: 0px 5px" class="buttonControls" type="button" value="Play" onclick="handleUpdateIsPlaying()">
                <input id="resetButton" style="width: 90px; margin: 0px 5px" class="buttonControls" type="button" value="Reset" onclick="handleResetList()">
            </div>
        </div>
    `
    emojiSequenceContainer.appendChild(div);
    updatePlayLabel(isPlaying);
}


function renderFavorites(){
    // log("in render favorites");
    var elem = document.getElementById('emojiFavoriteContent')
    if (elem){
        elem.parentNode.removeChild(elem);
    }

    if (favoritesArray.length === 0) {
        // log("render favorites length is 0", null, OFF)
        return;
    }


    let imageString = "";
    favoritesArray.forEach((emoji, index) => {
        if (emoji && emojiMap[emoji.code]){
            emoji = emojiMap[emoji.code]
            let emojiLength = 36;
            let emojiStyle = ` 
                width: ${emojiLength}px; height: ${emojiLength}px; 
                background-size: ${emoji.normal.sourceDimensions.x}px ${emoji.normal.sourceDimensions.y}px; 
                background-position: -${emoji.normal.frame.x}px -${emoji.normal.frame.y}px;
                background-image: url('./images/emojis/${emoji.normal.source}');
                pointer-events: auto;
                transform: scale(1);`
            imageString += `
            <span style="width: calc(1/10*100% - (1 - 1/10)*1px)">
                <div
                    onclick="clickEmoji(this)"
                    class="favoriteEmojis"
                    onmouseover="hoverEmoji(this, true)"
                    onmouseout="hoverEmoji(this)"
                    draggable="false" 
                    style="${emojiStyle}" 
                    data-number="${emoji.number}" 
                    data-shortName="${emoji.shortName}" 
                    data-code=${emoji.code[0]}>
                </div>
            </span>`
        }
    })

    let div = document.createElement('div');
    div.innerHTML = `
        <div id="emojiFavoriteContent">
            <div>
                <span class="mainTextColor" id="favoriteEmojiText">Favorite Emojis</span>
            </div>
            <div id="emojiFavoriteList" class ="gridRowLeftJustify">
                ${imageString}
            </div>
            <div class="gridRowCenter">
                <input id="resetFavorites" 
                    style="width: 50px;margin: 0px 0px; position: relative; bottom: 70px; right: 80px" class="buttonControls" type="button" value="Reset" onclick="handleResetFavorites()">
            </div>
        </div>

    `
    
    emojiFavoritesContainer.appendChild(div);
}


function getNumberFromString(string, suffix){
    return +string.split(suffix)[0];
}

function addToHeightAndMarginString(baseString, addString){
    baseString = getNumberFromString(baseString, "px");
    addString = getNumberFromString(addString, "px");
    let sum = baseString + addString;
    let finalHeightString = sum + "px";
    return finalHeightString;
}

const LOG_STATES = ON;
const NOSELECT_SEQUENCE_ADVANCED = "250px"
const NOSELECT_NOSEQUENCE_HOVER_ADVANCED = "430px";
const NOSELECT_HOVER_SEQUENCE_ADVANCED = "470px";
const SEQUENCE_MODE_PLAYING_ADVANCED = "500px";
const WITH_REMOVE_ADVANCED = "455px";
const NOSELECT_HOVER_ADVANCED = "430px";
const NOSELECT_ADVANCED = "200px";
const ADVANCED = "520px";

const NOSELECT_SIMPLE = "130px";
const WITH_REMOVE_SIMPLE = "370px";
const HOVER_SIMPLE= "345px";
const SIMPLE = "430px";

let heightAndMarginString = "";
let EMOJI_FAVORITES_CONTAINER_HEIGHT = "50px";
let SEQUENCE_ROW_HEIGHT = "22px";
let EMOJI_LIST_MARGIN_BUFFER = "10px";
function renderUI(){
    heightAndMarginString = "";
    if (favoritesArray) {
        // log("rendering favorites", favoritesArray.length, OFF)
        if (favoritesArray.length > 0) {
            // log("adding favorites height to base", null, OFF)
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, EMOJI_FAVORITES_CONTAINER_HEIGHT);
        }
    }

    if (isSequenceMode) {
        var rows = Math.ceil(currentEmojiSequence.length / EMOJIS_PER_ROW);
        var rowHeight = getNumberFromString(SEQUENCE_ROW_HEIGHT, "px") * rows + "px";
        // log("rowheight", rowHeight, OFF)
        heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, rowHeight);
    }

    if (advancedModeOn){
        advancedContainer.style.display = "block"

        if (isSequenceMode && currentEmojiSequence && currentEmojiSequence.length > 0 && !isHovering && !currentSelectedEmoji && !lastHoveredEmoji) {
            // log("UI State: 1 in sequence mode: NOSELECT_SEQUENCE_ADVANCED", null, LOG_STATES)
            let addToString = NOSELECT_SEQUENCE_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            stickyContainer.style.height = heightAndMarginString;
            emojiContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_MARGIN_BUFFER);
            return
        }

        if (isSequenceMode && currentEmojiSequence && currentEmojiSequence.length === 0 && (isHovering || lastHoveredEmoji)){
            // log('UI State: 2 advanced - Sequence Mode: NOSELECT_NOSEQUENCE_HOVER_ADVANCED', null, LOG_STATES)
            let addToString = NOSELECT_NOSEQUENCE_HOVER_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            stickyContainer.style.height = heightAndMarginString;
            emojiContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_MARGIN_BUFFER);
            renderSelected(lastHoveredEmoji);
            return
        } 

        if (isSequenceMode && currentEmojiSequence && currentEmojiSequence.length === 0 && lastHoveredEmoji){
            // log('UI State: 3 advanced - Sequence Mode: NOSELECT_NOSEQUENCE_HOVER_ADVANCED', null, LOG_STATES)
            let addToString = NOSELECT_NOSEQUENCE_HOVER_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            stickyContainer.style.height = heightAndMarginString;
            emojiContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_MARGIN_BUFFER);
            renderSelected(lastHoveredEmoji);
            return
        } 

        if (isSequenceMode && isPlaying){
            // log('UI State: 6 advanced - Sequence Mode: WITH_REMOVE_ADVANCED', null, LOG_STATES)
            let addToString = SEQUENCE_MODE_PLAYING_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            stickyContainer.style.height = heightAndMarginString;
            emojiContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_MARGIN_BUFFER);
            renderSelected(currentSelectedEmoji);
            return
        }

        if (isSequenceMode && currentEmojiSequence && currentEmojiSequence.length > 0 && (isHovering || lastHoveredEmoji)){
            // log('UI State: 4 advanced - Sequence Mode: NOSELECT_HOVER_ADVANCED', null, LOG_STATES)
            // log("currentSelectedEmoji", currentSelectedEmoji, OFF)
            // log("isHovering", isHovering, OFF)
            let addToString = NOSELECT_HOVER_SEQUENCE_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            stickyContainer.style.height = heightAndMarginString;
            emojiContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_MARGIN_BUFFER);
            renderSelected(lastHoveredEmoji);
            return
        } 
        
        if (isSequenceMode && currentSelectedEmoji){
            // log('UI State: 5 advanced - Sequence Mode: WITH_REMOVE_ADVANCED', null, LOG_STATES)
            let addToString = WITH_REMOVE_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            stickyContainer.style.height = heightAndMarginString;
            emojiContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_MARGIN_BUFFER);
            renderSelected(currentSelectedEmoji);
            return
        }

        if (currentSelectedEmoji){
            // log('UI State: 7 advanced - currently selected: WITH_REMOVE_ADVANCED', null, LOG_STATES)
            let addToString = WITH_REMOVE_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            stickyContainer.style.height = heightAndMarginString;
            emojiContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_MARGIN_BUFFER);
            renderSelected(currentSelectedEmoji);
            return;
        }

        if ((isHovering || lastHoveredEmoji)){
            // log('UI State: 8 advanced - emojiHovered: NOSELECT_HOVER_ADVANCED', null, LOG_STATES)
            let addToString = NOSELECT_HOVER_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            stickyContainer.style.height = heightAndMarginString;
            emojiContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_MARGIN_BUFFER);
            renderSelected(lastHoveredEmoji);
            return;
        }

        // log('UI State: 9 advanced - not selected: NOSELECT_ADVANCED', null, LOG_STATES)
        let addToString = NOSELECT_ADVANCED;
        heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
        selectedContainer.innerHTML = "";
        stickyContainer.style.height = heightAndMarginString;
        emojiContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_MARGIN_BUFFER);
        
    } else {
        advancedContainer.style.display = "none"
        if (currentSelectedEmoji){
            // log('UI State: 10 simple - currently selected: WITH_REMOVE_SIMPLE', null, LOG_STATES)
            let addToString = WITH_REMOVE_SIMPLE;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            stickyContainer.style.height = heightAndMarginString;
            emojiContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_MARGIN_BUFFER);
            renderSelected(currentSelectedEmoji);
            return;
        }

        if (isHovering) {
            // log('UI State: 11 simple - hovered: HOVER_SIMPLE', null, LOG_STATES)
            let addToString = HOVER_SIMPLE;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            stickyContainer.style.height = heightAndMarginString;
            emojiContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_MARGIN_BUFFER);
            renderSelected(lastHoveredEmoji);
            return;
        }


        if (lastHoveredEmoji){
            // log("UI State: 12 simple - last hovered: WITH_REMOVE_SIMPLE", LOG_STATES)
            let addToString = HOVER_SIMPLE;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            stickyContainer.style.height = heightAndMarginString;
            emojiContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_MARGIN_BUFFER);
            renderSelected(lastHoveredEmoji);
            return;
        }


        // log('UI State: 13 simple - nothing: NOSELECT_SIMPLE', null, LOG_STATES)
        let addToString = NOSELECT_SIMPLE;
        heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
        selectedContainer.innerHTML = "";
        stickyContainer.style.height = heightAndMarginString;
        emojiContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_MARGIN_BUFFER);
    
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
    // log("shouldWearMask",shouldWearMask, OFF)
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleShouldWearMask",
        shouldWearMask: shouldWearMask
    }))
}


let hasFavorites = false;
function handleResetFavorites(){
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleResetFavorites",
    }))
    var elem = document.getElementById('emojiFavoriteContent')
    if (elem) {
        elem.parentNode.removeChild(elem);
    }
    hasFavorites = false;
    favoritesArray = [];
    renderUI();
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
    renderEmojiSequence();
    // if(isSequenceMode) {
    //     var elem = document.getElementById('emojiSequenceContent')
    //     if (elem) {
    //         elem.parentNode.removeChild(elem);
    //     }
    //     renderUI();
    // }
    
}


function handleAdvancedModeChange(checkbox){
    advancedModeOn = checkbox.checked;
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleAdvancedMode",
        newAdvancedModeState: advancedModeOn
    }))
    if (isSequenceMode) {
        isSequenceMode = false;
        EventBridge.emitWebEvent(JSON.stringify({
            app: "avimoji",
            method: "handleSequenceModeChange",
            isSequenceMode: isSequenceMode
        }))
        document.getElementById("sequenceMode").checked = false;
    }

    renderUI();
}


function handleShouldTimeoutDelete(checkbox){
    let shouldTimeoutDelete = checkbox.checked;
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleShouldTimeoutDelete",
        newTimeoutDeleteState: shouldTimeoutDelete
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

// Handle the slider being changed
function handleAnimationDistance(slider) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleAnimationDistance",
        animationDistance: slider.value
    }));
}

// Handle the slider being changed
function handleAnimationSpeed(slider) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleAnimationSpeed",
        animationSpeed: slider.value
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
            if (emojiMap[shortnameMap[keyword.toLowerCase()]]){
                let emoji = emoji && emojiMap[shortnameMap[keyword.toLowerCase()]];
                EventBridge.emitWebEvent(JSON.stringify({
                    app: "avimoji",
                    method: "handleEmojiSelected",
                    emoji: emoji
                }))
                input.value = "";
                renderEmojiList(emojiList);
                return;
            }
        }
    }
    let filteredEmojiList = emojiList.filter((emoji, index) => {
        let joinedKeywords = emoji.keywords.join(" ");
        return joinedKeywords.indexOf(keyword) > -1; 
    });
    renderEmojiList(filteredEmojiList);
}


function clickEmoji(clickedEmoji, isSequenceDelete){
    if (isSequenceDelete){
        clickSequenceEmoji(clickedEmoji);
    } else {
        let code = clickedEmoji.getAttribute('data-code');
        // log("in clickEmoji", code);
        if (code && code.length > 0) {
            if (emojiMap[code]) {
                let emoji = emojiMap[code];
                EventBridge.emitWebEvent(JSON.stringify({
                    app: "avimoji",
                    method: "handleEmojiSelected",
                    emoji: emoji
                }))
            }
        }
    }
  
}


function handleResetList(){
    // log("in handle reset ", null, OFF)
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleResetList"
    }))
    updatePlayLabel();
}


function clickSequenceEmoji(emoji){
    // log("in clickSequence");
    if (emoji.getAttribute('data-index')){
        let index = +event.target.getAttribute('data-index');
        // log("index", index);
        EventBridge.emitWebEvent(JSON.stringify({
            app: "avimoji",
            method: "deleteEmojiInSequence",
            index: index
        }))
    }
}


let lastHoveredEmoji = null;
let isHovering = null;
function hoverEmoji(emoji, onHover){
    if (onHover) {
        emoji.style.outline = "3px solid white";
        isHovering = true;
        let code = emoji.getAttribute('data-code');
        if (code && code.length > 0) {
            if (emoji && emojiMap[code]) {
                let emoji = emojiMap[code];
                lastHoveredEmoji = emoji;
                renderUI();
            }
        }
    } else {
        isHovering = false;
        emoji.style.outline = "";
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

let emojiMap = {};
let emojiList = [];
let allChunksReceived = false;
let favoritesArray = []
let shortnameMap = {};
let advancedModeOn = false;
let emojiSequence = [];
let currentSelectedEmoji = null;
let currentEmojiSequence = null;
// Handle incoming tablet messages
function onScriptEventReceived(message) {
    try {
        message = JSON.parse(message);
    } catch (e) {
        log("error in script", e);
        return;
    }

    if (message.app !== "avimoji") {
        return; 
    }

    // log("message", message, "off")

    switch (message.method) {
        case "updateUI":
            // log("in update ui", null, OFF)
            document.getElementById("loadingContainer").style.display = "none";
            advancedMode.checked = advancedModeOn = message.advancedModeOn || false;
            wearAsMask.checked = message.shouldWearMask || false;
            local.checked = message.isLocal || false;
            allEmojis.checked = isAllEmojis = message.isLocal || false;
            shouldTimeoutDelete.checked = message.shouldTimeoutDelete || false;
            sequenceMode.checked = isSequenceMode = message.isSequenceMode || false;
            document.getElementById("emojiScaler").value = message.emojiScaler;
            document.getElementById("animationDistance").value = message.animationDistance;
            document.getElementById("animationSpeed").value = message.animationSpeed;
            isPlaying = message.isPlaying
            currentSelectedEmoji = message.selectedEmoji || null;
            currentEmojiSequence = message.emojiSequence || [];
            favoritesArray = message.favorites || [];

            // log("emoji sequence length", message.emojiSequence.length);
            // log("RENDER UI -> updateUI", null, OFF);
            renderUI()

            input.focus();   
            break;

        case "sendChunk":
            emojiList = emojiList.concat(message.chunk);
            emojiMap = Object.assign({}, emojiMap, ...message.chunk.map(emoji => ({[emoji.code[0]]: emoji})))
            shortnameMap = Object.assign({}, shortnameMap, ...message.chunk.map(emoji => ({[emoji.shortName]: emoji.code[0]})))
            renderEmojiList(message.chunk, true);
            renderEmojiSequence();
            renderFavorites();
            if (message.chunkNumber >= message.totalChunks -1){
                // log("about to make favorites now that chunks are good", null, OFF)
                allChunksReceived = true;
                renderUI();
                renderEmojiSequence();
                renderFavorites();
            }
            break;

        case "updateEmojiPicks":
            currentSelectedEmoji = message.selectedEmoji;
            currentEmojiSequence = message.emojiSequence || [];
            // log("RENDER UI -> updateEmojiPicks", null, OFF);
            renderUI();
            renderEmojiSequence();
            renderFavorites();
            break;

        case "updateCurrentEmoji":
            currentSelectedEmoji = message.selectedEmoji;
            // log("RENDER UI -> updateCurrentEmoji", null, OFF);
            renderUI();
            break;

        case "updateFavorites":
            // log("IN update favorites", null, OFF)
            favoritesArray = message.favorites;
            renderFavorites();
            break;

        case "reRenderUI":
            renderUI();
            break;

        default:
            log("Unknown message received from avimoji.js!", JSON.stringify(message));
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
    // log("in onload", null, OFF)
    setTimeout(function() {
        // log("emiting event", null, OFF)
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