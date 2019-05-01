/*

    Avimoji
    avimoji_ui.js
    Created by Milad Nazeri on 2019-04-26
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

*/


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
let mainContainer = document.getElementById("mainContainer");
let categoriesContainer = document.getElementById("categoriesContainer");

let input = document.getElementById('filter_emojis');
let wearAsMask = document.getElementById('wearAsMask');
let local = document.getElementById('local');
let sequenceMode = document.getElementById('sequenceMode');
let allEmojis = document.getElementById('allEmojis');
let easyFavorite = document.getElementById('easyFavorite');

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
var OFF = "off";
var ON = "on";
var PRINT = "PRINT";
function log(label, data, overrideDebug){
    if (!DEBUG) {
        if (overrideDebug !== "PRINT") {
            return;
        }
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


// #endregion
// *************************************
// END utiltiy
// *************************************

// *************************************
// START render
// *************************************
// #region render


const BASIC_EMOJIS = ["Smileys & Emotion", "People & Body"];
const EMOJIS_PER_ROW = 10;
const RENDER_JUST_EMOJIS = true;
const EMOJI_LIST_DIMENSION = 36;
function renderEmojiList(list, isChunk){
    if (!isChunk){
        document.getElementById("emojisContent").innerHTML = "";
    }

    let listDivMap = list;
    
    if (!isAllEmojis){
        listDivMap = list.filter( emoji => {
            return emoji.mainCategory === "Smileys & Emotion" || 
            emoji.mainCategory === "People & Body" ||
            emoji.mainCategory === "Animals & Nature" ||
            emoji.mainCategory === "Food & Drink";
        })
    };

    listDivMap = listDivMap.map( (emoji, index) => {
        let div;
        let emojiStyle = `
            width: 
                ${EMOJI_LIST_DIMENSION}px; height: ${EMOJI_LIST_DIMENSION}px; 
            background-size: 
                ${emoji.normal.sourceDimensions.x}px ${emoji.normal.sourceDimensions.y}px; 
            background-position: 
                -${emoji.normal.frame.x}px -${emoji.normal.frame.y}px;
            background-image: 
                url('./images/emojis/${emoji.normal.source}');`

        div = `
            <div
                onclick="clickEmoji(this)"

                draggable="false" 
                style="${emojiStyle}" 
                data-number="${emoji.number}" 
                data-shortName="${emoji.shortName}" 
                data-code="${emoji.code[0]}"
            >
            </div>
        `
        return div;
    })
    // onmouseover="hoverEmoji(this, true)"
    // onmouseout="hoverEmoji(this)"
    
    let gridDivItems = [];
    let totalRows = Math.ceil(listDivMap.length / EMOJIS_PER_ROW);
    let currentRow = 0;

    let emojisContainer = document.getElementById("emojisContainer");
    log("emoji Container:", emojisContainer.id, "PRINT");
    let emojisContent = document.getElementById("emojisContent");
    log("emoji content:", emojisContent.id, "PRINT");
    listDivMap.forEach((emojiDiv, index) => {
        // check to see if we are at the start of a row or if we are on the last row
        // and handle the different flex formating
        if ((index + 1) % EMOJIS_PER_ROW === 0 && index + 1 >= EMOJIS_PER_ROW || 
            currentRow === totalRows - 1 &&  index + 1 >= listDivMap.length) {
            let gridDiv = document.createElement('div');
            gridDivItems.push(emojiDiv);

            let gridClass = 
                list.length < EMOJIS_PER_ROW || currentRow === totalRows-1 
                ? "gridRowLeftJustify" 
                : "gridRow";

            gridDiv.classList.add(gridClass)
            gridDiv.innerHTML = gridDivItems.join("\t\n");
            

            document.getElementById("emojisContent").appendChild(gridDiv);

            gridDivItems = [];
            currentRow++;
        } else {
            gridDivItems.push(emojiDiv);
        };
    })

    input.focus();   
}


function renderSelected(emoji){
    if (!allChunksReceived || !emoji) {
        selectedContainer.style.display = "none";
        return;
    }
    selectedContainer.style.display = "block";
    selectedContainer.innerHTML = "";
    let div = document.createElement('div');
    let emojiLength = 144;
    // div.setAttribute("style","display: flex; flex-direction: column; justify-content: center; align-items: center;")
    div.draggable = false;
    let buttonHTML = `

    `
    // let keywordHTML = `
    //     <div id="selectedTextKeywords">
    //         ${emoji.mainCategory.toUpperCase() + " | " + emoji.subCategory + " | " + emoji.keywords
    //             .join(" | ")
    //             .replace(" | " + 
    //             emoji.shortName, "")}
    //     </div>
    // `
    // div.innerHTML += `
    //     <div draggable="false"
    //         onclick="clickEmoji(this)"
    //         data-number="${emoji.number}" 
    //         data-shortName="${emoji.shortName}" 
    //         data-code=${emoji.code[0]}
    //         style="width: ${emojiLength}px; height: ${emojiLength}px; align-self: center;
    //         background-position: -${emoji.massive.frame.x}px -${emoji.massive.frame.y}px; 
    //         background-image: url('./images/emojis/${emoji.massive.source}');
    //         margin-bottom: 20px;">
    //     </div>        
    //     <div id="selectedText">
    //         ${emoji.shortName.toUpperCase()}
    //     </div>
    //     ${currentSelectedEmoji && !isSequenceMode ? buttonHTML : keywordHTML}
    // `
    selectedContainer.appendChild(div);
}

/*
function renderEmojiSequence(){
    var emojiSequenceContent = document.getElementById('emojiSequenceContent')
    if (emojiSequenceContent) {
        emojiSequenceContent.parentNode.removeChild(emojiSequenceContent);
    }
    if (currentEmojiSequence.length === 0 || !isSequenceMode) { 
        document.getElementById('animationDistanceContainer').style.display = "none";
        document.getElementById('animationSpeedContainer').style.display = "none";
        return;
    }
    document.getElementById('animationDistanceContainer').style.display = "block";
    document.getElementById('animationSpeedContainer').style.display = "block";

    let imageString = "";
    let emojiLength = 18;
    currentEmojiSequence.forEach((emoji, index) => {
        imageString += `
        <div style="width: calc(1/20*100% - (1 - 1/20)*1px); display: inline-block;">
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
            onclick="clickEmoji(this, true)">
        </div>`
    })

    let div = document.createElement('div');
    div.innerHTML = `
        ${imageString}  
    `
    emojiSequenceContainer.appendChild(div);
    updatePlayLabel(isPlaying);
}
*/


function renderFavorites(){
    var emojiFavoriteContent = document.getElementById('emojiFavoriteContent')
    if (emojiFavoriteContent){
        emojiFavoriteContent.parentNode.removeChild(emojiFavoriteContent);
        emojiFavoritesContainer.style.display = "none";
    }

    if (favoritesArray.length === 0) {
        emojiFavoritesContainer.style.display = "none";
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
            <div id="emojiFavoriteList" class ="gridRowLeftJustify" style="margin-top: 10px;">
                ${imageString}
            </div>
            <div class="gridRowCenter">
                <input id="resetFavorites" 
                    style="width: 50px; margin: 0px 0px; position: relative; bottom: 75px; right: 80px" class="buttonControls" type="button" value="Reset" onclick="handleResetFavorites()">
            </div>
        </div>
    `

    emojiFavoritesContainer.appendChild(div);
    emojiFavoritesContainer.style.display = "block";
}

const LOG_STATES = "PRINT";
const NOSELECT_SEQUENCE_ADVANCED = "250px"
const NOSELECT_NOSEQUENCE_HOVER_ADVANCED = "375px";
const NOSELECT_HOVER_SEQUENCE_ADVANCED = "450px";
const SEQUENCE_MODE_PLAYING_ADVANCED = "500px";
const WITH_REMOVE_ADVANCED = "375px";
const NOSELECT_HOVER_ADVANCED = "375px";
const NOSELECT_ADVANCED = "200px";
const ADVANCED = "520px";

const NOSELECT_SIMPLE = "120px";
const WITH_REMOVE_SIMPLE = "312px";
const HOVER_SIMPLE= "312px";
const SIMPLE = "430px";

let heightAndMarginString = "";
let EMOJI_FAVORITES_CONTAINER_HEIGHT = "70px";
let SEQUENCE_ROW_HEIGHT = "22px";
let EMOJI_LIST_TOP_MARGIN_BUFFER = "10px";
function renderUI(){
    stickyContainer.style.minHeight = "300px";
    stickyContainer.style.maxHeight = "300px";
    heightAndMarginString = "";
    if (favoritesArray) {
        if (favoritesArray.length > 0) {
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, EMOJI_FAVORITES_CONTAINER_HEIGHT);
        }
    }

    if (isSequenceMode) {
        var rows = Math.ceil(currentEmojiSequence.length / EMOJIS_PER_ROW);
        var rowHeight = getNumberFromString(SEQUENCE_ROW_HEIGHT, "px") * rows + "px";
        heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, rowHeight);
    }

    if (advancedModeOn){
        advancedContainer.style.display = "block"

        if (isSequenceMode && currentEmojiSequence && currentEmojiSequence.length > 0 && !isHovering && !currentSelectedEmoji && !lastHoveredEmoji) {
            log("UI State: 1 in sequence mode: NOSELECT_SEQUENCE_ADVANCED", null, LOG_STATES)
            let addToString = NOSELECT_SEQUENCE_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            emojisContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_TOP_MARGIN_BUFFER);
            return
        }

        if (isSequenceMode && currentEmojiSequence && currentEmojiSequence.length === 0 && (isHovering || lastHoveredEmoji)){
            log('UI State: 2 advanced - Sequence Mode: NOSELECT_NOSEQUENCE_HOVER_ADVANCED', null, LOG_STATES)
            let addToString = NOSELECT_NOSEQUENCE_HOVER_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            emojisContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_TOP_MARGIN_BUFFER);
            renderSelected(lastHoveredEmoji);
            return
        } 

        if (isSequenceMode && currentEmojiSequence && currentEmojiSequence.length === 0 && lastHoveredEmoji){
            log('UI State: 3 advanced - Sequence Mode: NOSELECT_NOSEQUENCE_HOVER_ADVANCED', null, LOG_STATES)
            let addToString = NOSELECT_NOSEQUENCE_HOVER_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            emojisContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_TOP_MARGIN_BUFFER);
            renderSelected(lastHoveredEmoji);
            return
        } 

        if (isSequenceMode && isPlaying){
            log('UI State: 4 advanced - Sequence Mode: WITH_REMOVE_ADVANCED', null, LOG_STATES)
            let addToString = SEQUENCE_MODE_PLAYING_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            emojisContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_TOP_MARGIN_BUFFER);
            renderSelected(currentSelectedEmoji);
            return
        }

        if (isSequenceMode && currentEmojiSequence && currentEmojiSequence.length > 0 && (isHovering || lastHoveredEmoji)){
            log('UI State: 5 advanced - Sequence Mode: NOSELECT_HOVER_ADVANCED', null, LOG_STATES)
            let addToString = NOSELECT_HOVER_SEQUENCE_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            emojisContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_TOP_MARGIN_BUFFER);
            renderSelected(lastHoveredEmoji);
            return
        } 
        
        if (isSequenceMode && currentSelectedEmoji){
            log('UI State: 6 advanced - Sequence Mode: WITH_REMOVE_ADVANCED', null, LOG_STATES)
            let addToString = WITH_REMOVE_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            emojisContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_TOP_MARGIN_BUFFER);
            renderSelected(currentSelectedEmoji);
            return
        }

        if (currentSelectedEmoji){
            log('UI State: 7 advanced - currently selected: WITH_REMOVE_ADVANCED', null, LOG_STATES)
            let addToString = WITH_REMOVE_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            emojisContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_TOP_MARGIN_BUFFER);
            renderSelected(currentSelectedEmoji);
            return;
        }

        if ((isHovering || lastHoveredEmoji)){
            log('UI State: 8 advanced - emojiHovered: NOSELECT_HOVER_ADVANCED', null, LOG_STATES)
            let addToString = NOSELECT_HOVER_ADVANCED;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            emojisContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_TOP_MARGIN_BUFFER);
            renderSelected(lastHoveredEmoji);
            return;
        }

        log('UI State: 9 advanced - not selected: NOSELECT_ADVANCED', null, LOG_STATES)
        let addToString = NOSELECT_ADVANCED;
        heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
        selectedContainer.innerHTML = "";
        stickyContainer.style.minHeight = "130px";
        stickyContainer.style.maxHeight = "130px";
        emojisContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_TOP_MARGIN_BUFFER);
        
    } else {
        advancedContainer.style.display = "none"
        if (currentSelectedEmoji){
            log('UI State: 10 simple - currently selected: WITH_REMOVE_SIMPLE', null, LOG_STATES)
            let addToString = WITH_REMOVE_SIMPLE;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            emojisContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_TOP_MARGIN_BUFFER);
            renderSelected(currentSelectedEmoji);
            return;
        }

        if (isHovering) {
            log('UI State: 11 simple - hovered: HOVER_SIMPLE', null, LOG_STATES)
            let addToString = HOVER_SIMPLE;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            emojisContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_TOP_MARGIN_BUFFER);
            renderSelected(lastHoveredEmoji);
            return;
        }


        if (lastHoveredEmoji){
            log("UI State: 12 simple - last hovered: WITH_REMOVE_SIMPLE", LOG_STATES)
            let addToString = HOVER_SIMPLE;
            heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
            emojisContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_TOP_MARGIN_BUFFER);
            renderSelected(lastHoveredEmoji);
            return;
        }


        log('UI State: 13 simple - nothing: NOSELECT_SIMPLE', null, LOG_STATES)
        let addToString = NOSELECT_SIMPLE;
        heightAndMarginString = addToHeightAndMarginString(heightAndMarginString, addToString);
        if (selectedContainer) {
            selectedContainer
        }
        selectedContainer.innerHTML = "";
        stickyContainer.style.height = heightAndMarginString;
        emojisContainer.style.marginTop = addToHeightAndMarginString(heightAndMarginString, EMOJI_LIST_TOP_MARGIN_BUFFER);
        stickyContainer.style.minHeight = "130px";
        stickyContainer.style.maxHeight = "130px";
    }
}

const UI_LOG_STATE = "PRINT"
const ALL_CHUNKS_RECEIVED = "ALL_CHUNKS_RECEIVED";
const SHOW_FIRST_RUN = "SHOW_FIRST_RUN";
const CLOSE_FIRST_RUN = "SHOW_FIRST_RUN";
const SHOW_MAIN_CONTAINER = "SHOW_MAIN_CONTAINER";
const SHOW_POPUP_HELP = "SHOW_POPUP_HELP";
const CLOSE_POPUP_HELP = "CLOSE_POPUP_HELP";
const SHOW_SIMPLE_MODE = "SHOW_SIMPLE_MODE";
const SHOW_ADVANCED_MODE = "SHOW_ADVANCED_MODE";
function changeEmojiState(state){
    switch(state){
        
        case SHOW_FIRST_RUN:
            log("UI STATE: SHOW_FIRST_RUN", SHOW_FIRST_RUN, UI_LOG_STATE);
            document.getElementById("firstRunContainer").style.display = "block";
            document.getElementById("mainContainer").style.display = "none";
            break;

        case SHOW_MAIN_CONTAINER:
            log("UI STATE: SHOW_MAIN_CONTAINER", SHOW_MAIN_CONTAINER, UI_LOG_STATE);
            document.getElementById("firstRunContainer").style.display = "none"; 
            document.getElementById("mainContainer").style.display = "block";
            maybeClearPlayIntroAnimation();
            break;

        case ALL_CHUNKS_RECEIVED:
            log("UI STATE: ALL_CHUNKS_RECEIVED", ALL_CHUNKS_RECEIVED, UI_LOG_STATE);
            // renderUI();
            // renderEmojiSequence();
            // renderFavorites();
            renderEmojiList(emojiList);

            // create the map of main categories now that we've got all the chunks
            emojiList.forEach(function(emoji){
                if (!mainCategoryMap[emoji.mainCategory]){
                    mainCategoryMap[emoji.mainCategory] = true;
                }
            });

            break;

        case SHOW_POPUP_HELP:
            log("UI STATE: SHOW POP UP HELP", SHOW_POPUP_HELP, UI_LOG_STATE);

            document.getElementById("popupBackground").style.display = "block";
            break;

        case CLOSE_POPUP_HELP:
            log("UI STATE: CLOSE POP UP HELP", SHOW_POPUP_HELP, UI_LOG_STATE);

            document.getElementById("popupBackground").style.display = "none";
            break;

        case SHOW_SIMPLE_MODE:
            break;
        
        case SHOW_ADVANCED_MODE:
            break;
            
        default:
            log("State Change not found", null, "PRINT");
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
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleShouldWearMask",
        shouldWearMask: shouldWearMask
    }))
}


let hasFavorites = false;
function handleResetFavorites(){
    var emojiFavoriteContent = document.getElementById('emojiFavoriteContent')
    if (emojiFavoriteContent) {
        emojiFavoriteContent.parentNode.removeChild(emojiFavoriteContent);
    }
    hasFavorites = false;
    favoritesArray = [];
    renderFavorites();
    renderUI();
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleResetFavorites",
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


function handleEasyFavorites(checkbox){
    let showEasyFavorite = checkbox.checked;
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleEasyFavorites",
        showEasyFavorite: showEasyFavorite
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
    renderEmojiList(emojiList);
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


// Get out of tutorial mode
function handleGotIt(){
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "onGotItClicked"
    }));
    changeEmojiState(SHOW_MAIN_CONTAINER);
}


function handleClosePopup(event){
    event.stopPropagation();

    changeEmojiState(CLOSE_POPUP_HELP);
}

function handleOpenPopup(event){
    event.stopPropagation();

    changeEmojiState(SHOW_POPUP_HELP);
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
                let emoji = emojiMap[shortnameMap[keyword.toLowerCase()]];
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
        let joinedKeywords = emoji.keywords
            .join(" ").toLowerCase() + 
            " " + emoji.mainCategory.toLowerCase() +
            " " + emoji.subCategory.toLowerCase() + 
            " " + emoji.shortName.toLowerCase();
            // log("joingKeyords", joinedKeywords, "PRINT")
            // log("keyword", keyword, "PRINT")
        return joinedKeywords.indexOf(keyword) > -1; 
    });
    if (keyword.length >= 2){
        // log("filteredEmojiList", filteredEmojiList.forEach(emoji => console.log(emoji.shortName)), "PRINT")
        // log("filteredEmojiList", filteredEmojiList.length, "")
    }
    renderEmojiList(filteredEmojiList);
}


function clickEmoji(clickedEmoji, isSequenceDelete){
    if (isSequenceDelete){
        clickSequenceEmoji(clickedEmoji);
    } else {
        let code = clickedEmoji.getAttribute('data-code');
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
    EventBridge.emitWebEvent(JSON.stringify({
        app: "avimoji",
        method: "handleResetList"
    }))
    renderEmojiSequence();
    renderUI();
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
                renderSelected(lastHoveredEmoji);
                renderUI();
            }
        }
    } else {
        isHovering = false;
        emoji.style.outline = "";
        if (currentSelectedEmoji) {
            renderSelected(currentSelectedEmoji);
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

function findValue(index, array, offset) {
    offset = offset || 0;
    return array[(index + offset) % array.length];
}

let playIntroAnimationInterval = null;
function playIntroAnimation(){
    let emojiPicture = document.querySelector("#firstRunPictureContent > div");
    let counter = 0;
    playIntroAnimationInterval = setInterval(()=>{
        let emoji = findValue(counter, emojiList);
        log("emoji shortname", emoji.shortName, "PRINT")
        log("counter", counter, "PRINT")
        emojiPicture.style.width = 
            `${emoji.biggest.frame.w}px`;

        emojiPicture.style.height = 
            `${emoji.biggest.frame.h}px`;

        emojiPicture.style.backgroundSize = 
            `${emoji.biggest.sourceDimensions.x}px ${emoji.biggest.sourceDimensions.y}px`;

        emojiPicture.style.backgroundPosition = 
            `-${emoji.biggest.frame.x}px -${emoji.biggest.frame.y}px`;

        emojiPicture.style.backgroundImage = 
            `url(./images/emojis/${emoji.biggest.source})`;

        counter++;
    }, 650);
}

function maybeClearPlayIntroAnimation(){
    if (playIntroAnimationInterval){
        clearInterval(playIntroAnimationInterval);
        playIntroAnimationInterval = null;
    }
}


let emojiMap = {};
let emojiList = [];
let allChunksReceived = false;
let favoritesArray = []
let shortnameMap = {};
let advancedModeOn = false;
let emojiSequence = [];
let currentSelectedEmoji = null;
let currentEmojiSequence = null;
var mainCategoryMap = {};
var subCategoryMap = {};
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

    switch (message.method) {
        case "updateUI":
            // changeEmojiState(SHOW_MAIN_CONTAINER);
            // changeEmojiState(FIRST_RUN_ON);
            // document.getElementById("loadingContainer").style.display = "none";
            // if (message.isFirstRun) {
            // document.getElementById("firstRunContainer").style.display = "block";

            // } 
            // else {
                // document.getElementById("mainContainer").style.display = "block";
            // }

            // advancedMode.checked = advancedModeOn = message.advancedModeOn || false;
            // wearAsMask.checked = message.shouldWearMask || false;
            // local.checked = message.isLocal || false;
            // easyFavorite.checked = message.showEasyFavorite || false;
            // allEmojis.checked = isAllEmojis = message.isAllEmojis || false;
            // shouldTimeoutDelete.checked = message.shouldTimeoutDelete || false;
            // sequenceMode.checked = isSequenceMode = message.isSequenceMode || false;
            // document.getElementById("emojiScaler").value = message.emojiScaler;
            // document.getElementById("animationDistance").value = message.animationDistance;
            // document.getElementById("animationSpeed").value = message.animationSpeed;
            // isPlaying = message.isPlaying
            // currentSelectedEmoji = message.selectedEmoji || null;
            // currentEmojiSequence = message.emojiSequence || [];
            // favoritesArray = message.favorites || [];
            // renderUI()

            // input.focus();   
            break;

        case "sendChunk":
            emojiList = emojiList.concat(message.chunk);

            // make a map of just the unicode names
            emojiMap = Object.assign({}, emojiMap, ...message.chunk.map(emoji => ({[emoji.code[0]]: emoji})))

            // map to help figure out if you typed in a short name for a fast pick
            shortnameMap = Object.assign({}, shortnameMap, ...message.chunk.map(emoji => ({[emoji.shortName]: emoji.code[0]})))

            if (message.chunkNumber >= message.totalChunks -1){
                allChunksReceived = true;
                changeEmojiState(ALL_CHUNKS_RECEIVED);
            }
            break;

        case "gotItClicked":
            document.getElementById("firstRunContainer").style.display = "none";
            document.getElementById("mainContainer").style.display = "block";
            break;

        case "updateEmojiPicks":
            currentSelectedEmoji = message.selectedEmoji;
            currentEmojiSequence = message.emojiSequence || [];
            renderEmojiSequence();
            renderFavorites();
            renderUI();
            break;

        case "updateCurrentEmoji":
            currentSelectedEmoji = message.selectedEmoji;
            renderUI();
            break;

        case "updateFavorites":
            favoritesArray = message.favorites;
            renderFavorites();
            renderUI();
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
let EVENTBRIDGE_SETUP_DELAY = 200;
function onLoad() {
    // log("in onload", null, OFF)
    setTimeout(function() {
        // log("emiting event", null, OFF)
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        emitAppSpecificEvent("eventBridgeReady");
    }, EVENTBRIDGE_SETUP_DELAY);
    // input.addEventListener('keyup', filterEmojis);
}


// Call onLoad() once the DOM is ready
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});


// #endregion
// *************************************
// END tablet
// *************************************

// *************************************
// START temp-code
// *************************************
// #region temp-code







// #endregion
// *************************************
// END temp-code
// *************************************