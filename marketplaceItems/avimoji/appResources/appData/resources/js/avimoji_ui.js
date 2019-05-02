/*

    Avimoji
    avimoji_ui.js
    Created by Milad Nazeri on 2019-04-26
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

*/

// *************************************
// START utiltiy
// *************************************
// #region utiltiy


// custom logging function
const PREPEND = "\n##Logger:Avimoji:Web::\n";
const DEBUG = false;
const OFF = "off";
const ON = "on";
const PRINT = "PRINT";
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


// grab a random number from an array ring
function findValue(index, array, offset) {
    offset = offset || 0;
    return array[(index + offset) % array.length];
}


// the interval function to play in the intro
let counter = 0;
function playIntroInterval(){
    let emojiPicture = document.getElementById("firstRunPicture");
    let emoji = findValue(counter, emojiList);

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
}


// play the intro emoji animation on the first run
const AUTOMATIC_CLOSE_TIMEOUT_MS = 5000;
const INTRO_ANIMATION_SWITCH_MS = 350;
let playIntroAnimationInterval = null;
function playIntroAnimation(){
    playIntroAnimationInterval = setInterval(playIntroInterval, INTRO_ANIMATION_SWITCH_MS);

    setTimeout( () => {
        changeEmojiState(CLOSE_FIRST_RUN);
        closeIntroScreen();
    }, AUTOMATIC_CLOSE_TIMEOUT_MS);
}


// stop the intro animation 
function maybeClearPlayIntroAnimation(){
    if (playIntroAnimationInterval){
        clearInterval(playIntroAnimationInterval);
        playIntroAnimationInterval = null;
    }
}

// helper to update the play/stop button
function updatePlayLabel(playState) {
    let playStopButton = document.getElementById("playStopButton");
    isPlaying = playState;
    let playLabel = isPlaying ? "Stop" : "Play";
    playStopButton.value = playLabel;
}


// #endregion
// *************************************
// END utiltiy
// *************************************

// *************************************
// START render
// *************************************
// #region render


// render the main emojis group.  Could be a chunk, a basic set, or all the emojis
const EMOJIS_PER_ROW = 10;
function renderEmojiList(list, isChunk){
    // Clear it out if it isn't a chunk, if it is then keep adding to the render.  
    // This helps with the initial load.
    if (!isChunk){
        document.getElementById("emojisContent").innerHTML = "";
    }

    let listDivMap = list;
    
    // Filter out the advanced set of emojis
    if (!allEmojis){
        listDivMap = list.filter( emoji => {
            return emoji.mainCategory === "Smileys & Emotion" || 
            emoji.mainCategory === "People & Body" ||
            emoji.mainCategory === "Animals & Nature" ||
            emoji.mainCategory === "Food & Drink";
        })
    };

    // Go through each emoji in our list and just the information on the sprite sheet to supply the correct width, height, source dimension of the sprite sheet, location on the sprite sheet, and where the image is located
    listDivMap = listDivMap.map( (emoji, index) => {
        let div;
        // create the dynamic style first to not clutter up the below div
        let emojiStyle = `
            width: 
                ${emoji.normal.frame.w}px; 
            height: 
                ${emoji.normal.frame.h}px; 
            background-size: 
                ${emoji.normal.sourceDimensions.x}px ${emoji.normal.sourceDimensions.y}px; 
            background-position: 
                -${emoji.normal.frame.x}px -${emoji.normal.frame.y}px;
            background-image: 
                url('./images/emojis/${emoji.normal.source}');`

        div = `
            <div
                onclick="handleEmojiClicked(this)"
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
        return div;
    })

    // Make the rows of emojis making sure to handle the last row slightly differnt class wise depending on how many are in the row
    let gridDivItems = [];
    let totalRows = Math.ceil(listDivMap.length / EMOJIS_PER_ROW);
    let currentRow = 0;

    listDivMap.forEach((emojiDiv, index) => {
        if ((index + 1) % EMOJIS_PER_ROW === 0 && index + 1 >= EMOJIS_PER_ROW || 
            currentRow === totalRows - 1 &&  index + 1 >= listDivMap.length) {
            let gridDiv = document.createElement('div');
            gridDivItems.push(emojiDiv);

            let gridClass = 
                list.length < EMOJIS_PER_ROW || currentRow === totalRows-1 
                ? "gridRowLeftJustify" 
                : "gridRow";

            gridDiv.classList.add(gridClass)
            gridDiv.innerHTML = gridDivItems.join("\n");
            
            document.getElementById("emojisContent").appendChild(gridDiv);

            gridDivItems = [];
            currentRow++;
        } else {
            gridDivItems.push(emojiDiv);
        };
    })

    document.getElementById("filter_emojis").focus();
}


// render the selected/hoverd on emoji
let isSelected = false;
function renderSelected(){
    if (!allChunksReceived) {
        return;
    }
    let selectedEmojiPicture = document.getElementById('selectedEmojiPicture')
    if (selectedEmojiPicture) {
        selectedEmojiPicture.parentNode.removeChild(selectedEmojiPicture);
    } else {
        return;
    }
    let emoji = null;

    if (lastHoveredEmoji && isHovering) {
        emoji = lastHoveredEmoji;
    } else if (selectedEmoji) {
        emoji = selectedEmoji;
    } else {
        emoji = findValue(0, emojiList);
    }

    let emojiPicture = document.createElement('div');
    let emojiStyle = `
        align-items: center;
        align-self: center;
        width: 
            ${emoji.massive.frame.w}px; 
        height: 
            ${emoji.massive.frame.h}px; 
        background-size: 
            ${emoji.massive.sourceDimensions.x}px ${emoji.massive.sourceDimensions.y}px; 
        background-position: 
            -${emoji.massive.frame.x}px -${emoji.massive.frame.y}px;
        background-image: 
            url('./images/emojis/${emoji.massive.source}');`

    emojiPicture.innerHTML = `
        <div
            id="selectedEmojiPicture"
            onclick="handleEmojiClicked(this)"
            onmouseover="hoverEmoji(this, true)"
            onmouseout="hoverEmoji(this)"
            draggable="false" 
            style="${emojiStyle}" 
            data-number="${emoji.number}" 
            data-shortName="${emoji.shortName}" 
            data-code="${emoji.code[0]}">
        </div>
    `
    
    let keywordString =
        emoji.mainCategory.toUpperCase() + 
        " | " + 
        emoji.subCategory + 
        " | " + 
        emoji.keywords
        .join(" | ")
        .replace(" | " + emoji.shortName, "")

    document.getElementById("selectedShortname").innerHTML = emoji.shortName.toUpperCase();
    document.getElementById("selectedKeywords").innerHTML = keywordString;
    document.getElementById("selectedContentContainer").prepend(emojiPicture, selectedShortname);
}


// render the top 10 favorites being tracked
function renderFavorites(){
    let emojiFavoritesListContentContainer = document.getElementById('emojiFavoritesListContentContainer')
    emojiFavoritesListContentContainer.innerHTML = "";

    let imageString = "";
    favoritesArray.forEach(favoriteItem => {
        if (favoriteItem && emojiMap[favoriteItem.code]){
            emoji = emojiMap[favoriteItem.code]
            let emojiLength = 36;
            let emojiStyle = ` 
                width: ${emojiLength}px; height: ${emojiLength}px; 
                background-size: ${emoji.normal.sourceDimensions.x}px ${emoji.normal.sourceDimensions.y}px; 
                background-position: -${emoji.normal.frame.x}px -${emoji.normal.frame.y}px;
                background-image: url('./images/emojis/${emoji.normal.source}');
                pointer-events: auto;`

            imageString += `
                <div
                    onclick="handleEmojiClicked(this)"
                    onmouseover="hoverEmoji(this, true)"
                    onmouseout="hoverEmoji(this)"
                    draggable="false" 
                    style="${emojiStyle}" 
                    data-number="${emoji.number}" 
                    data-shortName="${emoji.shortName}" 
                    data-code=${emoji.code[0]}>
                </div>`
        }
    })

    emojiFavoritesListContentContainer.innerHTML = imageString;
    if (favoritesArray.length === 0) {
        changeEmojiState(HIDE_FAVORITES_BUTTON);
    } else {
        changeEmojiState(SHOW_FAVORITES_BUTTON);

    }
}

// render the current emoji sequence. 40 is the max.
function renderEmojiSequence(){
    if (emojiSequence.length === 0) {
        document.getElementById("emojiSequenceListButtonContentContainer").style.display = "none";
        return;
    }
    log("in render emoji seuence")
    let emojiSequenceListContentContainer = document.getElementById('emojiSequenceListContentContainer')
    emojiSequenceListContentContainer.innerHTML = "";

    let imageString = "";
    emojiSequence.forEach((sequenceItem, index) => {
        if (sequenceItem && emojiMap[sequenceItem.code]){
            emoji = emojiMap[sequenceItem.code]
            let emojiLength = 18;
            let emojiStyle = ` 
                width: ${emojiLength}px; height: ${emojiLength}px; 
                background-size: ${emoji.small.sourceDimensions.x}px ${emoji.small.sourceDimensions.y}px; 
                background-position: -${emoji.small.frame.x}px -${emoji.small.frame.y}px;
                background-image: url('./images/emojis/${emoji.small.source}');
                pointer-events: auto;`

            imageString += `
                <div
                    onclick="handleEmojiClicked(this, true)"
                    onmouseover="hoverEmoji(this, true)"
                    onmouseout="hoverEmoji(this)"
                    draggable="false" 
                    style="${emojiStyle}" 
                    data-number="${emoji.number}" 
                    data-index="${index}"
                    data-shortName="${emoji.shortName}" 
                    data-code=${emoji.code[0]}>
                </div>`
        }
    })

    emojiSequenceListContentContainer.innerHTML = imageString;
    document.getElementById("emojiSequenceListButtonContentContainer").style.display = "block";
    updatePlayLabel(isPlaying);
}


// #endregion
// *************************************
// END render
// *************************************

// *************************************
// START event_handlers
// *************************************
// #region handlers


// handle play state change
let isPlaying = false;
function handleUpdateIsPlaying(button) {
    isPlaying = button.value === "Play" ? true : false;
    emitAppSpecificEvent("handleUpdateIsPlaying", {
        isPlaying: isPlaying
    })
    updatePlayLabel(isPlaying);
}


// wear the emoji as a mask
function handleMask(checkbox){
    let mask = checkbox.checked;

    emitAppSpecificEvent("handleMask", {
        mask: mask
    })
}


// start over with a fresh favorites array
function handleResetFavoritesList(){
    favoritesArray = [];
    emitAppSpecificEvent("handleResetFavoritesList")
}


// change the mode from avatar to local for preview mode
function handleLocal(checkbox){
    let local = checkbox.checked;
    emitAppSpecificEvent("handleLocal", {
        local: local
    })
}


// show the emoji overlays at the top
function handleEZFavorites(checkbox){
    let ezFavorites = checkbox.checked;
    emitAppSpecificEvent("handleEZFavorites", {
        ezFavorites: ezFavorites
    })
}


// turn off the basic and full set of emojis
let allEmojis = true;
function handleAllEmojis(checkbox){
    allEmojis = checkbox.checked;
    emitAppSpecificEvent("handleAllEmojis", {
        allEmojis: allEmojis
    })
    renderEmojiList(emojiList);
}


// enables a custom emoji sequence animation
let sequenceMode = false;
function handleSequenceMode(checkbox){
    sequenceMode = checkbox.checked;
    emitAppSpecificEvent("handleSequenceMode", {
        sequenceMode: sequenceMode
    })
    if (sequenceMode){
        changeEmojiState(ENABLE_SEQUENCE_MODE);
    } else {
        changeEmojiState(DISABLE_SEQUENCE_MODE);
    }
}


// switch mode to advanced for more options
function handleAdvanced(checkbox){
    advanced = checkbox.checked;
    emitAppSpecificEvent("handleAdvanced", {
        advanced: advanced
    })
    if (sequenceMode) {
        sequenceMode = false;
        emitAppSpecificEvent("handleSequenceMode", {
            sequenceMode: sequenceMode
        })
        document.getElementById("sequenceMode").checked = false;
    }

    changeEmojiState(SHOW_MAIN_CONTAINER);
}


// toggles the emoji deleting by default
function handleShouldTimeoutDelete(checkbox){
    let shouldTimeoutDelete = checkbox.checked;
    emitAppSpecificEvent("handleShouldTimeoutDelete", {
        shouldTimeoutDelete: shouldTimeoutDelete
    })
}


// handle the slider being changed
function handleEmojiSize(slider) {
    emitAppSpecificEvent("handleEmojiSize", {
        emojiSize: slider.value
    })
}


// handle the slider being changed
function handleAnimationDistance(slider) {
    emitAppSpecificEvent("handleAnimationDistance", {
        animationDistance: slider.value
    })
}


// handle the slider being changed
function handleAnimationSpeed(slider) {
    emitAppSpecificEvent("handleAnimationSpeed", {
        animationSpeed: slider.value
    })
}


// get out of the intro menu
function closeIntroScreen(){
    emitAppSpecificEvent("closeIntroScreen")
    changeEmojiState(CLOSE_FIRST_RUN);
}


// close the info window
function handleClosePopup(event){
    event.stopPropagation();

    changeEmojiState(CLOSE_POPUP_HELP);
}


// open the info window
function handleOpenPopup(event){
    event.stopPropagation();

    changeEmojiState(SHOW_POPUP_HELP);
}


// the user has just clicked an emoji so add it as the hero emoji
function handleEmojiClicked(clickedEmoji, sequenceEmoji){
    if (sequenceEmoji){
        deleteSequenceEmoji(clickedEmoji);
    } else {
        let code = clickedEmoji.getAttribute('data-code');
        if (code && code.length > 0) {
            if (emojiMap[code]) {
                let emoji = emojiMap[code];
                emitAppSpecificEvent("handleSelectedEmoji", {
                    emoji: emoji
                })
            }
        }
    }
}


// clear the favorites object so that the top 10 favorites array is empty
function handleResetSequenceList(){
    emitAppSpecificEvent("handleResetSequenceList");
}


// remove the selected emoji you are wearing
function handleSelectedRemoved(){
    emitAppSpecificEvent("handleSelectedRemoved")
    changeEmojiState(HIDE_REMOVE_BUTTON);
}


// filter out the emoji list for the search
let filteredEmojiList = null;
function filterEmojis(event){
    let input = document.getElementById("filter_emojis");
    let keyword = input.value.toLowerCase();
    if (keyword.length === 0){
        filteredEmojiList = null;
        changeEmojiState(SHOW_EMOJI_LIST);
    }
    // if you type in a matching shortname and press enter, then you will get the emoji
    if (event.keyCode === 13) {
        event.preventDefault();
        if(shortnameMap[keyword.toLowerCase()]){
            if (emojiMap[shortnameMap[keyword.toLowerCase()]]){
                let emoji = emojiMap[shortnameMap[keyword.toLowerCase()]];
                emitAppSpecificEvent("handleSelectedEmoji", {
                    emoji: emoji
                })
                input.value = "";
                filteredEmojiList = 0;
                changeEmojiState(SHOW_EMOJI_LIST);
                return;
            }
        }
    }
    filteredEmojiList = emojiList.filter((emoji, index) => {
        let joinedKeywords = emoji.keywords
            .join(" ").toLowerCase() + 
            " " + emoji.mainCategory.toLowerCase() +
            " " + emoji.subCategory.toLowerCase() + 
            " " + emoji.shortName.toLowerCase();
        return joinedKeywords.indexOf(keyword) > -1; 
    });
    changeEmojiState(SHOW_EMOJI_LIST);
}


// remove an emoji in the sequence
function deleteSequenceEmoji(emoji){
    if (emoji.getAttribute('data-index')){
        let emojiSequenceIndex = +event.target.getAttribute('data-index');
        emitAppSpecificEvent("deleteSequenceEmoji", {
            emojiSequenceIndex: emojiSequenceIndex
        })
    }
}


// what to do when you are hovering over an emoji
// switch back to the selected emoji on the way out
let lastHoveredEmoji = null;
let isHovering = null;
function hoverEmoji(emoji, onHover){
    log("emoji", emoji, OFF)
    if (onHover) {
        isHovering = true;
        // grab the utf code which is also the name of the picture and hashmap keys
        let code = emoji.getAttribute('data-code');
        if (code && code.length > 0) {
            if (emoji && emojiMap[code]) {
                let emoji = emojiMap[code];
                lastHoveredEmoji = emoji;
                if(allChunksReceived){
                    changeEmojiState(SHOW_NEW_HERO_EMOJI);
                    changeEmojiState(HIDE_REMOVE_BUTTON);
                }
            }
        }
    } else {
        // Leaving hovering over an icon.  If we have a selected emoji, then render that one again.
        isHovering = false;
        if(allChunksReceived){
            changeEmojiState(SHOW_NEW_HERO_EMOJI);
            if (selectedEmoji) {
                changeEmojiState(SHOW_REMOVE_BUTTON);
            }
        }
    }
}


// #endregion
// *************************************
// END event_handlers
// *************************************

// *************************************
// START state_machine
// *************************************
// #region state_machine


const UI_LOG_STATE = OFF;
const CLOSE_LOADING = "CLOSE_LOADING";
const ALL_CHUNKS_RECEIVED = "ALL_CHUNKS_RECEIVED";

const SHOW_FIRST_RUN = "SHOW_FIRST_RUN";
const CLOSE_FIRST_RUN = "CLOSE_FIRST_RUN";

const SHOW_POPUP_HELP = "SHOW_POPUP_HELP";
const CLOSE_POPUP_HELP = "CLOSE_POPUP_HELP";

const SHOW_MAIN_CONTAINER = "SHOW_MAIN_CONTAINER";

const SHOW_BASIC_MODE = "SHOW_BASIC_MODE";
const SHOW_ADVANCED_MODE = "SHOW_ADVANCED_MODE";

const HIDE_REMOVE_BUTTON = "HIDE_REMOVE_BUTTON";
const SHOW_REMOVE_BUTTON = "SHOW_REMOVE_BUTTON";

const SHOW_FAVORITES = "SHOW_FAVORITES";
const HIDE_FAVORITES_BUTTON = "HIDE_FAVORITES_BUTTON";
const SHOW_FAVORITES_BUTTON = "SHOW_FAVORITES_BUTTON";

const ENABLE_SEQUENCE_MODE = "ENABLE_SEQUENCE_MODE";
const DISABLE_SEQUENCE_MODE = "DISABLE_SEQUENCE_MODE";
const SHOW_EMOJI_SEQUENCE = "SHOW_EMOJI_SEQUENCE";
const HIDE_EMOJI_SEQUENCE = "HIDE_EMOJI_SEQUENCE";

const SHOW_NEW_HERO_EMOJI = "SHOW_NEW_HERO_EMOJI";

const SHOW_EMOJI_LIST = "SHOW_EMOJI_LIST";
function changeEmojiState(state){
    switch(state){
        
        case CLOSE_LOADING:
            log("UI STATE: CLOSE_LOADING", SHOW_FIRST_RUN, UI_LOG_STATE);

            document.getElementById("loadingContainer").style.display = "none";
            break;

        case SHOW_FIRST_RUN:
            log("UI STATE: SHOW_FIRST_RUN", SHOW_FIRST_RUN, UI_LOG_STATE);

            document.getElementById("firstRunContainer").style.display = "block";
            playIntroAnimation();
            
            break;

        case CLOSE_FIRST_RUN:
            log("UI STATE: SHOW_FIRST_RUN", SHOW_FIRST_RUN, UI_LOG_STATE);
            const FADE_OUT_TIMEOUT_MS = 1500;
            let firstRunContainer = document.getElementById("firstRunContainer");
            firstRunContainer.classList.add("fadeOut");
            document.getElementById("mainContainer").classList.add("fadeIn")

            setTimeout(() => {
                maybeClearPlayIntroAnimation();

                firstRunContainer.style.display = "none";
                changeEmojiState(SHOW_MAIN_CONTAINER);
            }, FADE_OUT_TIMEOUT_MS)
            break;    
            
        case SHOW_MAIN_CONTAINER:
            log("UI STATE: SHOW_MAIN_CONTAINER", SHOW_MAIN_CONTAINER, UI_LOG_STATE);

            document.getElementById("mainContainer").style.display = "block";

            if (selectedEmoji) {
                changeEmojiState(HIDE_REMOVE_BUTTON);
            }

            if (advanced){
                changeEmojiState(SHOW_ADVANCED_MODE);
            } else {
                changeEmojiState(SHOW_BASIC_MODE);
            }

            if (sequenceMode){
                changeEmojiState(ENABLE_SEQUENCE_MODE);
            }

            changeEmojiState(SHOW_FAVORITES);
            changeEmojiState(SHOW_EMOJI_LIST);
            break;

        case ALL_CHUNKS_RECEIVED:
            log("UI STATE: ALL_CHUNKS_RECEIVED", ALL_CHUNKS_RECEIVED, UI_LOG_STATE);
            allChunksReceived = true;
            // create the map of main categories to help with sorting now that we've got all the chunks
            emojiList.forEach(function(emoji){
                if (!mainCategoryMap[emoji.mainCategory]){
                    mainCategoryMap[emoji.mainCategory] = true;
                }
            });
            if (showingFirstRun) {
                return;
            }
            changeEmojiState(SHOW_MAIN_CONTAINER);
            break;

        case HIDE_REMOVE_BUTTON:
            document.getElementById("selectedRemoveButtonContainer").style.display = "none";
            break;

        case SHOW_REMOVE_BUTTON:
            document.getElementById("selectedRemoveButtonContainer").style.display = "block";
            break;

        case SHOW_POPUP_HELP:
            log("UI STATE: SHOW POP UP HELP",  null, UI_LOG_STATE);

            document.getElementById("popupBackground").style.display = "block";
            break;

        case CLOSE_POPUP_HELP:
            log("UI STATE: CLOSE POP UP HELP", null, UI_LOG_STATE);

            document.getElementById("popupBackground").style.display = "none";
            break;

        case SHOW_BASIC_MODE:
            log("UI STATE: SHOW_BASIC_MODE", null, UI_LOG_STATE);

            document.getElementById("advancedOptionsContainer").style.display = "none";
            document.getElementById("emojisContainer").style.height = "calc(100% - 375px)";
            break;
        
        case SHOW_ADVANCED_MODE:
            log("UI STATE: SHOW_ADVANCED_MODE", null, UI_LOG_STATE);

            document.getElementById("advancedOptionsContainer").style.display = "block";
            document.getElementById("emojisContainer").style.height = "calc(100% - 540px)";

            if (emojiSequence.length >= 1) {
                changeEmojiState(SHOW_EMOJI_SEQUENCE);
            } else {
                changeEmojiState(HIDE_EMOJI_SEQUENCE);
            }
            break;

        case SHOW_NEW_HERO_EMOJI:
            renderSelected();
            break;

        case SHOW_FAVORITES:
            if (favoritesArray.length === 0) {
                changeEmojiState(HIDE_FAVORITES_BUTTON);
            } else {
                changeEmojiState(SHOW_FAVORITES_BUTTON);
            }

            renderFavorites();
            break;
        
        case HIDE_FAVORITES_BUTTON:
            document.getElementById("emojiFavoritesListButton").style.display = "none";
            break;

        case SHOW_FAVORITES_BUTTON:
            document.getElementById("emojiFavoritesListButton").style.display = "block";
            break;

        case ENABLE_SEQUENCE_MODE:
            document.getElementById("emojiSequenceDisable").style.display = "none";
            break;

        case DISABLE_SEQUENCE_MODE:
            document.getElementById("emojiSequenceDisable").style.display = "block";
            break;

        case SHOW_EMOJI_LIST:
            if (advanced){
                changeEmojiState(SHOW_ADVANCED_MODE);
            } else {
                changeEmojiState(SHOW_BASIC_MODE);
            }
            if (filteredEmojiList) {
                renderEmojiList(filteredEmojiList);
            } else {
                renderEmojiList(emojiList);
            }
            break;

        case SHOW_EMOJI_SEQUENCE:
            document.getElementById("emojiSequenceListContentContainer").style.display = "block"
            document.getElementById("emojiSequenceListButtonContentContainer").style.display = "block";
            renderEmojiSequence();
            break;

        case HIDE_EMOJI_SEQUENCE:
            document.getElementById("emojiSequenceListContentContainer").style.display = "none";
            document.getElementById("emojiSequenceListButtonContentContainer").style.display = "none";
            break;
        default:
            log("State Change not found", null, "PRINT");
    }
}


// #endregion
// *************************************
// END state_machine
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
let advanced = false;
let selectedEmoji = null;
let emojiSequence = null;
let mainCategoryMap = {};
let showingFirstRun = false;
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

            document.getElementById("mask").checked = message.mask || false;
            document.getElementById("ezFavorites").checked = message.ezFavorites || false;
            document.getElementById("advanced").checked = advanced = message.advanced || false;
            document.getElementById("emojiSize").value = message.emojiSize;

            document.getElementById("local").checked = message.local || false;
            document.getElementById("allEmojis").checked = allEmojis = message.allEmojis || false;
            document.getElementById("shouldTimeoutDelete").checked = message.shouldTimeoutDelete || false;
            document.getElementById("sequenceMode").checked = sequenceMode = message.sequenceMode || false;

            document.getElementById("animationDistance").value = message.animationDistance;
            document.getElementById("animationSpeed").value = message.animationSpeed;

            isPlaying = message.isPlaying
            selectedEmoji = message.selectedEmoji || null;
            emojiSequence = message.emojiSequence || [];
            favoritesArray = message.favorites || [];

            changeEmojiState(CLOSE_LOADING);

            if (message.firstRun) {
                showingFirstRun = true;
                changeEmojiState(SHOW_FIRST_RUN);
            } else {
                changeEmojiState(SHOW_MAIN_CONTAINER);
            }
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

        case "updateEmojiPicks":
            selectedEmoji = message.selectedEmoji;
            emojiSequence = message.emojiSequence || [];
            log("selectedEmoji", null, selectedEmoji);
            if (selectedEmoji) {
                log("selectedEmoji", null, selectedEmoji)
                isSelected = true;
                changeEmojiState(SHOW_REMOVE_BUTTON);
                changeEmojiState(SHOW_NEW_HERO_EMOJI);
            } else {
                changeEmojiState(HIDE_REMOVE_BUTTON);
            }
            if (advanced && emojiSequence.length >= 1) {
                changeEmojiState(SHOW_EMOJI_SEQUENCE);
            } else {
                changeEmojiState(HIDE_EMOJI_SEQUENCE);
                updatePlayLabel(isplaying);
            }
            break;

        case "updateCurrentEmoji":
            selectedEmoji = message.selectedEmoji;
            break;

        case "updateFavorites":
            favoritesArray = message.favorites;
            changeEmojiState(SHOW_FAVORITES);
            break;
        
        case "updatePlay":
            isplaying = message.isPlaying;

            updatePlayLabel(isplaying);
            break;

        default:
            log("Unknown message received from avimoji.js!", JSON.stringify(message));
            break;
    }
}

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
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        emitAppSpecificEvent("eventBridgeReady");
    }, EVENTBRIDGE_SETUP_DELAY);
    document.getElementById("filter_emojis").addEventListener('keyup', filterEmojis);
}


// Call onLoad() once the DOM is ready
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});


// #endregion
// *************************************
// END tablet
// *************************************
