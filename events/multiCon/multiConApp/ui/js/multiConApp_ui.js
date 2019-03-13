//
//  multiConApp_ui.js
//
//  Created by Robin Wilson and Zach Fox on 2019-03-11
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals document EventBridge setTimeout */

// Emit an event specific to the `multiConApp` over the EventBridge.
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

    emitMultiConVoteEvent("changeActiveTabName", tabName);
}

function modifyVoteButton(username, votedFor) {
    var confirmVoteText = document.getElementById("confirmVoteText");
    var confirmVoteContainer = document.getElementById("confirmVoteContainer");

    confirmVoteContainer.classList = "";

    if (votedFor) {
        confirmVoteText.innerHTML = `You voted for <span style="font-weight:700;">${username}</span>!`;
        confirmVoteContainer.classList.add("votedFor");
        confirmVoteContainer.onclick = function(){};
    } else {
        confirmVoteText.innerHTML = `Vote for <span style="font-weight:700;">${username}</span>`;
        confirmVoteContainer.onclick = function() { confirmVote(); };
    }
}


function openVotingModal(element, username, fullImageURL) {
    var votingModalContainer = document.getElementById("votingModalContainer");
    votingModalContainer.setAttribute("data-username", username);
    votingModalContainer.style.display = "block";

    var votingModalImage = document.getElementById("votingModalImage");
    votingModalImage.style.backgroundImage = `url('${fullImageURL}')`;

    modifyVoteButton(username, element.classList.contains("voted"));
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

    var confirmVoteText = document.getElementById("confirmVoteText");
    confirmVoteText.innerHTML = `Voting...`;
    
    emitMultiConVoteEvent("vote", {
        usernameToVoteFor: usernameToVoteFor
    });
}

function voteError() {
    var confirmVoteText = document.getElementById("confirmVoteText");
    confirmVoteText.innerHTML = `Your vote failed! Your vote hasn't changed.`;
}


function voteSuccess(usernameVotedFor) {
    var votingModalContainer = document.getElementById("votingModalContainer");
    var usernameToVoteFor = votingModalContainer.getAttribute("data-username");

    modifyVoteButton(usernameToVoteFor, true);

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


function hashCode(inputString) {
    var hash = 0;
    for (var i = 0; i < inputString.length; i++) {
        var character = inputString.charCodeAt(i);
        hash = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}


var seed = 1;
function randomNumberSeeded() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}


function shuffleArray(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(randomNumberSeeded() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


function initializeUI(myUsername, voteData) {
    seed = hashCode(myUsername);
    voteData = shuffleArray(voteData);

    document.getElementById("loadingContainer").style.display = "none";

    var voteContainer = document.getElementById("voteContainer");
    var currentParticipantHTML;
    var currentFullImageURL;
    for (var i = 0; i < voteData.length; i++) {
        currentFullImageURL = "https://highfidelity.co/events/multiCon/images/" + voteData[i].username + ".jpg";

        var currentClassList = "participantContainer";
        var extraDiv = "";
        if (voteData[i].votedFor) {
            currentClassList += " voted";
            extraDiv = "<div id='votedOverlay'><img src='images/check.svg'></img></div>"
        }
        currentParticipantHTML = `
<div data-username="${voteData[i].username}" class="${currentClassList}" onclick="openVotingModal(this, '${voteData[i].username}', '${currentFullImageURL}')">
    <div class="participantImage" style="background-image: url('${currentFullImageURL}')">
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
            initializeUI(scriptEvent.myUsername, scriptEvent.voteData);
            selectTab(scriptEvent.activeTabName);
            break;

        case "voteError":
            voteError();
            break;

        case "voteSuccess":
            voteSuccess(scriptEvent.usernameVotedFor);
            break;

        default:
            console.log("Unknown message from multiConApp_app.js: " + JSON.stringify(scriptEvent));
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