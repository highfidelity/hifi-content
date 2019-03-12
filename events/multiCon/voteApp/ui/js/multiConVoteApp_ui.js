//
//  multiConVoteApp_ui.js
//
//  Created by Robin Wilson and Zach Fox on 2019-03-11
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals document EventBridge setTimeout */

// Emit an event specific to the `multiConVoteApp` over the EventBridge.
function emitMultiConVoteEvent(type, data) {
    var event = {
        app: 'multiConVote',
        type: type,
        data: data
    };
    EventBridge.emitWebEvent(JSON.stringify(event));
}


function selectTab(tabName) {
    var tabBarContainer = document.getElementById("tabBarContainer");
    for (var i = 0; i < tabBarContainer.children.length; i++) {
        tabBarContainer.children[i].classList.remove("selected");
    }

    var contentContainer = document.getElementById("contentContainer");
    for (i = 0; i < contentContainer.children.length; i++) {
        contentContainer.children[i].classList.remove("selected");
    }

    var selectedTab = document.getElementById(tabName + "Tab");
    selectedTab.classList.add("selected");

    var selectedContainer = document.getElementById(tabName + "Container");
    selectedContainer.classList.add("selected");
}


function openVotingModal(element, username, fullImageURL) {
    var votingModalContainer = document.getElementById("votingModalContainer");
    votingModalContainer.setAttribute("data-username", username);
    votingModalContainer.style.display = "block";

    var votingModalImage = document.getElementById("votingModalImage");
    votingModalImage.style.backgroundImage = `url('${fullImageURL}')`;

    var confirmVoteText = document.getElementById("confirmVoteText");

    if (element.classList.contains("voted")) {
        confirmVoteText.innerHTML = `You voted for ${username}!`;
    } else {
        confirmVoteText.innerHTML = `Vote for ${username}`;
    }
}


function closeVotingModal() {
    var votingModalContainer = document.getElementById("votingModalContainer");
    votingModalContainer.setAttribute("data-username", "");
    votingModalContainer.style.display = "none";
}


function confirmVote() {
    var votingModalContainer = document.getElementById("votingModalContainer");
    var usernameToVoteFor = votingModalContainer.getAttribute("data-username");

    if (!usernameToVoteFor) {
        console.log("No username to vote for!");
        return;
    }

    document.getElementById("loadingContainer").style.display = "block";
    
    emitMultiConVoteEvent("vote", {
        usernameToVoteFor: usernameToVoteFor
    });
}

function voteError() {
    document.getElementById("loadingContainer").style.display = "none";

    var confirmVoteText = document.getElementById("confirmVoteText");
    confirmVoteText.innerHTML = `Your vote failed! Your vote hasn't changed.`;
}


function voteSuccess(usernameVotedFor) {
    document.getElementById("loadingContainer").style.display = "none";

    var votingModalContainer = document.getElementById("votingModalContainer");
    var usernameToVoteFor = votingModalContainer.getAttribute("data-username");

    var confirmVoteText = document.getElementById("confirmVoteText");
    confirmVoteText.innerHTML = `You voted for ${usernameToVoteFor}!`;


    var voteContainer = document.getElementById("voteContainer");
    for (i = 0; i < voteContainer.children.length; i++) {
        var currentChild = voteContainer.children[i];
        currentChild.classList.remove("voted");

        if (currentChild.getAttribute("data-username") === usernameVotedFor) {
            currentChild.classList.add("voted");

            // Remove the "voted overlay" div from the DOM
            var votedOverlay = document.getElementById("votedOverlay");
            votedOverlay.parentNode.removeChild(votedOverlay);
            currentChild.appendChild(votedOverlay);
        }
    }
}


function initializeUI(voteData) {
    document.getElementById("loadingContainer").style.display = "none";

    var voteContainer = document.getElementById("voteContainer");
    var currentParticipantHTML;
    var currentFullImageURL;
    for (var i = 0; i < voteData.length; i++) {
        currentFullImageURL = voteData[i].imageURL;
        currentFullImageURL.replace("-thumbnail", "");

        var currentClassList = "participantContainer";
        var extraDiv = "";
        if (voteData[i].votedFor) {
            currentClassList += " voted";
            extraDiv = "<div id='votedOverlay'><img src='images/check.svg'></img></div>"
        }
        currentParticipantHTML = `
<div data-username="${voteData[i].username}" class="${currentClassList}" onclick="openVotingModal(this, '${voteData[i].username}', '${currentFullImageURL}')">
    <div class="participantImage" style="background-image: url('${voteData[i].imageURL}')">
    </div>
    <div class="participantName">
        ${voteData[i].username}
    </div>
    ${extraDiv}
</div>
        `;
        voteContainer.innerHTML += currentParticipantHTML;
    }
}


// Handle incoming events over the EventBridge.
// Possible events include updating the "status text" area of the Boss app.
function onScriptEventReceived(scriptEvent) {
    try {
        scriptEvent = JSON.parse(scriptEvent);
    } catch (error) {
        console.log("ERROR parsing scriptEvent: " + error);
        return;
    }

    if (scriptEvent.app !== "multiConVote") {
        return;
    }

    
    switch (scriptEvent.method) {
        case "initializeUI":
            initializeUI(scriptEvent.voteData);
            break;

        case "voteError":
            voteError();
            break;

        case "voteSuccess":
            voteSuccess(scriptEvent.usernameVotedFor);
            break;

        default:
            console.log("Unknown message from multiConVoteApp_app.js: " + JSON.stringify(scriptEvent));
            break;
    }
}


// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        emitMultiConVoteEvent("eventBridgeReady");
    }, EVENTBRIDGE_SETUP_DELAY);
}


// Wait for the DOM to be ready before calling onLoad().
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});