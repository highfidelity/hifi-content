"use strict";

// support.js
// 
// Originally chat.js
// By Don Hopkins (dhopkins@donhopkins.com)
//
// Copyright High Fidelity Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function () {

    var webPageURL = Script.resolvePath("html/ChatPage.html"); // URL of tablet web page.
    var randomizeWebPageURL = true; // Set to true for debugging.
    var lastWebPageURL = ""; // Last random URL of tablet web page.
    var onChatPage = false; // True when chat web page is opened.
    var webHandlerConnected = false; // True when the web handler has been connected.
    var channelName = "Support"; // Unique name for channel that we listen to.
    var tabletButtonName = "SUPPORT"; // Tablet button label.
    var tabletButtonIcon = Script.resolvePath("resources/support-i.svg"); // Icon for chat button.
    var tabletButtonActiveIcon = Script.resolvePath("resources/support-a.svg"); // Active icon for chat button.
    var tabletButtonMessageIcon = Script.resolvePath("resources/support-msg.svg"); // Message Waiting Icon for chat button.
    var tabletButtonMessageBlinkTimerDelay = 750; // The timer's speed for message waiting
    var tabletButtonMessageBlinkActive = false; // Do we have a message waiting?
    var tabletButtonMessageBlinkState = 0; // Which icon should we show for message waiting (if active)
    var tabletButtonMessageBlinkTimer = null; // The timer for changing the tablet icon for message waiting
    var tabletButton = null; // The button we create in the tablet.
    var tabletButtonSortOrder = 11; // The sort order of the button in the tablet
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system"); // The awesome tablet.
    var chatLog = []; // Array of chat messages in the form of [avatarID, displayName, message, data].
    var speechBubbleShowing = false; // Is the speech bubble visible?
    var speechBubbleMessage = null; // The message shown in the speech bubble.
    var speechBubbleTextID = null; // The id of the speech bubble local text entity.
    var speechBubbleTimer = null; // The timer to pop down the speech bubble.
    var speechBubbleParams = null; // The params used to create or edit the speech bubble.

    // Persistent variables saved in the Settings.
    var chatName = ''; // The user's name shown in chat.
    var chatLogMaxSize = 100; // The maximum number of chat messages we remember.
    var sendTyping = true; // Send typing begin and end notification.
    var speechBubbleDuration = 10; // How long to leave the speech bubble up, in seconds.
    var speechBubbleTextColor = { red: 255, green: 255, blue: 255 }; // The text color of the speech bubble.
    var speechBubbleBackgroundColor = { red: 0, green: 0, blue: 0 }; // The background color of the speech bubble.
    var speechBubbleOffset = { x: 0, y: 0.3, z: 0.0 }; // The offset from the joint to which the speech bubble is attached.
    var speechBubbleJointName = 'Head'; // The name of the joint to which the speech bubble is attached.
    var speechBubbleLineHeight = 0.05; // The height of a line of text in the speech bubble.

    // Load the persistent variables from the Settings, with defaults.
    function loadSettings() {
        chatName = Settings.getValue('Support_chatName', MyAvatar.displayName);
        if (!chatName) {
            chatName = randomAvatarName();
        }
        chatLogMaxSize = Settings.getValue('Support_chatLogMaxSize', 100);
        sendTyping = Settings.getValue('Support_sendTyping', true);
        speechBubbleDuration = Settings.getValue('Support_speechBubbleDuration', 10);
        speechBubbleTextColor = Settings.getValue('Support_speechBubbleTextColor', { red: 255, green: 255, blue: 255 });
        speechBubbleBackgroundColor = Settings.getValue('Support_speechBubbleBackgroundColor', { red: 0, green: 0, blue: 0 });
        speechBubbleOffset = Settings.getValue('Support_speechBubbleOffset', { x: 0.0, y: 0.3, z: 0.0 });
        speechBubbleJointName = Settings.getValue('Support_speechBubbleJointName', 'Head');
        speechBubbleLineHeight = Settings.getValue('Support_speechBubbleLineHeight', 0.05);

        saveSettings();
    }

    // Save the persistent variables to the Settings.
    function saveSettings() {
        Settings.setValue('Support_chatName', chatName);
        Settings.setValue('Support_chatLogMaxSize', chatLogMaxSize);
        Settings.setValue('Support_sendTyping', sendTyping);
        Settings.setValue('Support_speechBubbleDuration', speechBubbleDuration);
        Settings.setValue('Support_speechBubbleTextColor', speechBubbleTextColor);
        Settings.setValue('Support_speechBubbleBackgroundColor', speechBubbleBackgroundColor);
        Settings.setValue('Support_speechBubbleOffset', speechBubbleOffset);
        Settings.setValue('Support_speechBubbleJointName', speechBubbleJointName);
        Settings.setValue('Support_speechBubbleLineHeight', speechBubbleLineHeight);
    }

    // Reset the Settings and persistent variables to the defaults.
    function resetSettings() {
        Settings.setValue('Support_chatName', null);
        Settings.setValue('Support_chatLogMaxSize', null);
        Settings.setValue('Support_sendTyping', null);
        Settings.setValue('Support_speechBubbleDuration', null);
        Settings.setValue('Support_speechBubbleTextColor', null);
        Settings.setValue('Support_speechBubbleBackgroundColor', null);
        Settings.setValue('Support_speechBubbleOffset', null);
        Settings.setValue('Support_speechBubbleJointName', null);
        Settings.setValue('Support_speechBubbleLineHeight', null);

        loadSettings();
    }

    // Update anything that might depend on the settings.
    function updateSettings() {
        updateSpeechBubble();
        trimChatLog();
        updateChatPage();
    }

    // Trim the chat log so it is no longer than chatLogMaxSize lines.
    function trimChatLog() {
        if (chatLog.length > chatLogMaxSize) {
            chatLog.splice(0, chatLogMaxSize - chatLog.length);
        }
    }

    // Clear the local chat log.
    function clearChatLog() {
        chatLog = [];
        updateChatPage();
    }

    // We got a chat message from the channel. 
    // Trim the chat log, save the latest message in the chat log, 
    // and show the message on the tablet, if the chat page is showing.
    function handleTransmitChatMessage(avatarID, displayName, message, data) {
        trimChatLog();
        chatLog.push([avatarID, displayName, message, data]);
        tabletButtonMessageBlinkActive = true;

        if (onChatPage) {
            tablet.emitScriptEvent(
                JSON.stringify({
                    type: "ReceiveChatMessage",
                    avatarID: avatarID,
                    displayName: displayName,
                    message: message,
                    data: data
                }));
        }
    }

    // Trim the chat log, save the latest log message in the chat log, 
    // and show the message on the tablet, if the chat page is showing.
    function logMessage(message, data) {
        trimChatLog();
        chatLog.push([null, null, message, data]);

        if (onChatPage) {
            tablet.emitScriptEvent(
                JSON.stringify({
                    type: "LogMessage",
                    message: message,
                    data: data
                }));
        }
    }

    // An empty chat message was entered.
    // Hide our speech bubble.
    function emptyChatMessage(data) {
        popDownSpeechBubble();
    }

    // Notification that we typed a keystroke.
    function type() {
    }

    // Notification that we began typing. 
    // Notify everyone that we started typing.
    function beginTyping() {
        if (!sendTyping) {
            return;
        }

        Messages.sendMessage(
            channelName,
            JSON.stringify({
                type: 'AvatarBeginTyping',
                avatarID: MyAvatar.sessionUUID,
                displayName: chatName
            }));
    }

    // Notification that somebody started typing.
    function handleAvatarBeginTyping(avatarID, displayName) {
    }

    // Notification that we stopped typing.
    // Notify everyone that we stopped typing.
    function endTyping() {
        if (!sendTyping) {
            return;
        }

        Messages.sendMessage(
            channelName,
            JSON.stringify({
                type: 'AvatarEndTyping',
                avatarID: MyAvatar.sessionUUID,
                displayName: chatName
            }));
    }

    // Notification that somebody stopped typing.
    function handleAvatarEndTyping(avatarID, displayName) {
    }

    // Turn to face another avatar.
    function faceAvatar(yourAvatarID, displayName) {

        var myAvatarID = MyAvatar.sessionUUID;
        if (yourAvatarID === myAvatarID) {
            // You clicked on yourself.
            return;
        }

        var yourAvatar = AvatarList.getAvatar(yourAvatarID);
        if (!yourAvatar) {
            logMessage(displayName + ' is not here!', null);
            return;
        }

        // Project avatar positions to the floor and get the direction between those points,
        // then face my avatar towards your avatar.
        var yourPosition = yourAvatar.position;
        yourPosition.y = 0;
        var myPosition = MyAvatar.position;
        myPosition.y = 0;
        var myOrientation = Quat.lookAtSimple(myPosition, yourPosition);
        MyAvatar.orientation = myOrientation;
    }

    // Make a hopefully unique random anonymous avatar name.
    function randomAvatarName() {
        return 'Anon_' + Math.floor(Math.random() * 1000000);
    }

    // Send out a "Who" message, including our avatarID as myAvatarID,
    // which will be sent in the response, so we can tell the reply
    // is to our request.
    function transmitWho() {
        logMessage("Who is here?", null);
        Messages.sendMessage(
            channelName,
            JSON.stringify({
                type: 'Who',
                myAvatarID: MyAvatar.sessionUUID
            }));
    }

    // Send a reply to a "Who" message, with a friendly message, 
    // our avatarID and our displayName. myAvatarID is the id
    // of the avatar who send the Who message, to whom we're
    // responding.
    function handleWho(myAvatarID) {
        var avatarID = MyAvatar.sessionUUID;
        if (myAvatarID === avatarID) {
            // Don't reply to myself.
            return;
        }

        var message = "I'm here!";
        var data = {};

        Messages.sendMessage(
            channelName,
            JSON.stringify({
                type: 'ReplyWho',
                myAvatarID: myAvatarID,
                avatarID: avatarID,
                displayName: chatName,
                message: message,
                data: data
            }));
    }

    // Receive the reply to a "Who" message. Ignore it unless we were the one
    // who sent it out (if myAvatarIS is our avatar's id).
    function handleReplyWho(myAvatarID, avatarID, displayName, message, data) {
        if (myAvatarID !== MyAvatar.sessionUUID) {
            return;
        }

        handleTransmitChatMessage(avatarID, displayName, message, data);
    }

    // Handle input form the user, possibly multiple lines separated by newlines.
    // Each line may be a chat command starting with "/", or a chat message.
    function handleChatMessage(message, data) {

        var messageLines = message.trim().split('\n');

        for (var i = 0, n = messageLines.length; i < n; i++) {
            var messageLine = messageLines[i];

            if (messageLine.substr(0, 1) === '/') {
                handleChatCommand(messageLine, data);
            } else {
                transmitChatMessage(messageLine, data);
            }
        }

    }

    // Handle a chat command prefixed by "/".
    function handleChatCommand(message, data) {

        var commandLine = message.substr(1);
        var tokens = commandLine.trim().split(' ');
        var command = tokens[0];
        var rest = commandLine.substr(command.length + 1).trim();
        switch (command) {

            case '?':
            case 'help':
                logMessage('Type "/?" or "/help" for help', null);
                logMessage('Type "/name <name>" to set your chat name, or "/name" to use your display name.'
                    + 'If your display name is not defined, a random name will be used.', null);
                logMessage('Type "/close" to close your overhead chat message.', null);
                logMessage('Type "/say <something>" to display a new message.', null);
                logMessage('Type "/clear" to clear your chat log.', null);
                logMessage('Type "/who" to ask who is in the chat session.', null);
                break;

            case 'name':
                if (rest === '') {
                    if (MyAvatar.displayName) {
                        chatName = MyAvatar.displayName;
                        saveSettings();
                        logMessage('Your chat name has been set to your display name "' + chatName + '".', null);
                    } else {
                        chatName = randomAvatarName();
                        saveSettings();
                        logMessage('Your avatar\'s display name is not defined, so your chat name has been set to "' +
                            chatName + '".', null);
                    }
                } else {
                    chatName = rest;
                    saveSettings();
                    logMessage('Your chat name has been set to "' + chatName + '".', null);
                }
                break;

            case 'close':
                popDownSpeechBubble();
                logMessage('Overhead chat message closed.', null);
                break;

            case 'say':
                if (rest === '') {
                    emptyChatMessage(data);
                } else {
                    transmitChatMessage(rest, data);
                }
                break;

            case 'who':
                transmitWho();
                break;

            case 'clear':
                clearChatLog();
                break;

            case 'resetsettings':
                resetSettings();
                updateSettings();
                break;

            case 'speechbubbleheight':
                var y = parseInt(rest);
                if (!isNaN(y)) {
                    speechBubbleOffset.y = y;
                }
                saveSettings();
                updateSettings();
                break;

            case 'speechbubbleduration':
                var duration = parseFloat(rest);
                if (!isNaN(duration)) {
                    speechBubbleDuration = duration;
                }
                saveSettings();
                updateSettings();
                break;

            default:
                logMessage('Unknown chat command. Type "/help" or "/?" for help.', null);
                break;

        }

    }

    // Send out a chat message to everyone.
    function transmitChatMessage(message, data) {

        popUpSpeechBubble(message, data);

        Messages.sendMessage(
            channelName,
            JSON.stringify({
                type: 'TransmitChatMessage',
                avatarID: MyAvatar.sessionUUID,
                displayName: chatName,
                message: message,
                data: data
            }));

    }

    // Show the speech bubble.
    function popUpSpeechBubble(message, data) {
        popDownSpeechBubble();

        speechBubbleShowing = true;
        speechBubbleMessage = message;

        updateSpeechBubble();

        if (speechBubbleDuration > 0) {
            speechBubbleTimer = Script.setTimeout(
                function () {
                    popDownSpeechBubble();
                },
                speechBubbleDuration * 1000);
        }
    }

    // Update the speech bubble. 
    // This is factored out so we can update an existing speech bubble if any settings change.
    var WAIT_BEFORE_EDITING_MS = 500;
    function updateSpeechBubble() {
        if (!speechBubbleShowing) {
            return;
        }

        var jointIndex = MyAvatar.getJointIndex(speechBubbleJointName);
        var dimensions = {
            x: 0.1,
            y: 0.1,
            z: 0.1
        };

        speechBubbleParams = {
            type: "Text",
            lifetime: speechBubbleDuration,
            parentID: MyAvatar.sessionUUID,
            jointIndex: jointIndex,
            dimensions: dimensions,
            lineHeight: speechBubbleLineHeight,
            leftMargin: 0,
            topMargin: 0,
            rightMargin: 0,
            bottomMargin: 0,
            faceCamera: true,
            drawInFront: true,
            ignoreRayIntersection: true,
            text: speechBubbleMessage,
            textColor: speechBubbleTextColor,
            color: speechBubbleTextColor,
            backgroundColor: speechBubbleBackgroundColor,
            "grab": {
                "grabbable": false
            }
        };

        var headRotation =
            Quat.multiply(
                MyAvatar.orientation,
                MyAvatar.getAbsoluteJointRotationInObjectFrame(jointIndex));
        var headPosition =
            Vec3.sum(
                MyAvatar.position,
                Vec3.multiplyQbyV(
                    MyAvatar.orientation,
                    MyAvatar.getAbsoluteJointTranslationInObjectFrame(jointIndex)));
        var rotatedOffset =
            Vec3.multiplyQbyV(
                headRotation,
                speechBubbleOffset);
        var position =
            Vec3.sum(
                headPosition,
                rotatedOffset);
        speechBubbleParams.position = position;

        if (!speechBubbleTextID) {
            speechBubbleTextID =
                Entities.addEntity(speechBubbleParams, true);

            Script.setTimeout(function() {
                var textSize = Entities.textSize(speechBubbleTextID, speechBubbleMessage);
                var fudge = 0.02;
                var width = textSize.width + fudge;
                var height = textSize.height + fudge;
                Entities.editEntity(speechBubbleTextID, {
                    "dimensions": {
                        "x": width,
                        "y": height,
                        "z": 0.1
                    }
                });
            }, WAIT_BEFORE_EDITING_MS);
        } else {
            Entities.editEntity(speechBubbleTextID, speechBubbleParams);
        }

    }

    // Hide the speech bubble.
    function popDownSpeechBubble() {
        cancelSpeechBubbleTimer();

        speechBubbleShowing = false;

        if (speechBubbleTextID) {
            try {
                Entities.deleteEntity(speechBubbleTextID);
            } catch (e) {
                // catch
            }
            speechBubbleTextID = null;
        }
    }

    // Cancel the speech bubble popup timer.
    function cancelSpeechBubbleTimer() {
        if (speechBubbleTimer) {
            Script.clearTimeout(speechBubbleTimer);
            speechBubbleTimer = null;
        }
    }

    // Show the tablet web page and connect the web handler.
    function showTabletWebPage() {
        var url = Script.resolvePath(webPageURL);
        if (randomizeWebPageURL) {
            url += '?rand=' + Math.random();
        }
        lastWebPageURL = url;
        onChatPage = true;
        tablet.gotoWebScreen(lastWebPageURL);
        tabletButton.editProperties({ isActive: true });
        // Connect immediately so we don't miss anything.
        connectWebHandler();
    }

    // Update the tablet web page with the chat log.
    function updateChatPage() {
        if (!onChatPage) {
            return;
        }

        tablet.emitScriptEvent(
            JSON.stringify({
                type: "Update",
                chatLog: chatLog
            }));
    }

    function onChatMessageReceived(channel, message, senderID) {

        // Ignore messages to any other channel than mine.
        if (channel !== channelName) {
            return;
        }

        // Parse the message and pull out the message parameters.
        var messageData = JSON.parse(message);
        var messageType = messageData.type;

        switch (messageType) {

            case 'TransmitChatMessage':
                handleTransmitChatMessage(messageData.avatarID, messageData.displayName, messageData.message, messageData.data);
                break;

            case 'AvatarBeginTyping':
                handleAvatarBeginTyping(messageData.avatarID, messageData.displayName);
                break;

            case 'AvatarEndTyping':
                handleAvatarEndTyping(messageData.avatarID, messageData.displayName);
                break;

            case 'Who':
                handleWho(messageData.myAvatarID);
                break;

            case 'ReplyWho':
                handleReplyWho(messageData.myAvatarID, messageData.avatarID, messageData.displayName,
                    messageData.message, messageData.data);
                break;

            default:
                break;

        }

    }

    // Handle events from the tablet web page.
    function onWebEventReceived(event) {
        if (!onChatPage) {
            return;
        }


        var eventData = JSON.parse(event);
        var eventType = eventData.type;

        switch (eventType) {

            case 'Ready':
                updateChatPage();
                break;

            case 'Update':
                updateChatPage();
                break;

            case 'HandleChatMessage':
                var message = eventData.message;
                var data = eventData.data;
                handleChatMessage(message, data);
                break;

            case 'PopDownSpeechBubble':
                popDownSpeechBubble();
                break;

            case 'EmptyChatMessage':
                emptyChatMessage();
                break;

            case 'Type':
                type();
                break;

            case 'BeginTyping':
                beginTyping();
                break;

            case 'EndTyping':
                endTyping();
                break;

            case 'FaceAvatar':
                faceAvatar(eventData.avatarID, eventData.displayName);
                break;

            case 'ClearChatLog':
                clearChatLog();
                break;

            case 'Who':
                transmitWho();
                break;

            default:
                break;

        }
    }

    function onScreenChanged(type, url) {

        if ((type === "Web") &&
            (url === lastWebPageURL)) {
            if (!onChatPage) {
                onChatPage = true;
                connectWebHandler();
            }
        } else {
            if (onChatPage) {
                onChatPage = false;
                tabletButton.editProperties({ isActive: false });
                disconnectWebHandler();
            }
        }

    }

    function connectWebHandler() {
        if (webHandlerConnected) {
            return;
        }

        try {
            tablet.webEventReceived.connect(onWebEventReceived);
        } catch (e) {
            print("connectWebHandler: error connecting: " + e);
            return;
        }

        webHandlerConnected = true;
        updateChatPage();
    }

    function disconnectWebHandler() {
        if (!webHandlerConnected) {
            return;
        }

        try {
            tablet.webEventReceived.disconnect(onWebEventReceived);
        } catch (e) {
            print("disconnectWebHandler: error disconnecting web handler: " + e);
            return;
        }
        webHandlerConnected = false;

    }

    // Show the tablet web page when the chat button on the tablet is clicked.
    // Also, set tabletButtonMessageBlinkActive to false and set the icon back to normal
    function onTabletButtonClicked() {
        showTabletWebPage();
        turnOffMessageWaiting();
    }

    // Shut down the chat application when the tablet button is destroyed.
    function onTabletButtonDestroyed() {
        shutDown();
        turnOffMessageWaiting();
    }

    // If we have a message waiting, blink our tablet button icon
    function onMessageWaitingCheck() {
        if (tabletButtonMessageBlinkActive) {
            // Toggle the state (1->0->1->0...)
            tabletButtonMessageBlinkState = 1 - tabletButtonMessageBlinkState;
            // Change the icon accordingly
            tabletButton.editProperties({
                icon: tabletButtonMessageBlinkState ? tabletButtonMessageIcon : tabletButtonIcon
                // No need for a different activeIcon, because we set tabletButtonMessageBlinkActive
                // to false when the button goes active anyway.
            });
        }
    }

    // Turn off everything if we open or close the chat application
    function turnOffMessageWaiting() {
        tabletButtonMessageBlinkActive = false;
        tabletButtonMessageBlinkState = 0;
        tabletButton.editProperties({
            icon: tabletButtonIcon
        });
    }

    // Start up the chat application.
    function startUp() {
        loadSettings();

        tabletButton = tablet.addButton({
            icon: tabletButtonIcon,
            activeIcon: tabletButtonActiveIcon,
            text: tabletButtonName,
            sortOrder: tabletButtonSortOrder
        });

        Messages.subscribe(channelName);

        tablet.screenChanged.connect(onScreenChanged);

        Messages.messageReceived.connect(onChatMessageReceived);

        tabletButton.clicked.connect(onTabletButtonClicked);

        tabletButtonMessageBlinkTimer = Script.setInterval(onMessageWaitingCheck, tabletButtonMessageBlinkTimerDelay);

        Script.scriptEnding.connect(onTabletButtonDestroyed);

        logMessage('Type "/?" or "/help" for help with chat.', null);

    }

    // Shut down the chat application.
    function shutDown() {

        popDownSpeechBubble();
        disconnectWebHandler();

        if (onChatPage) {
            tablet.gotoHomeScreen();
            onChatPage = false;
        }

        tablet.screenChanged.disconnect(onScreenChanged);

        Messages.messageReceived.disconnect(onChatMessageReceived);

        Script.clearInterval(tabletButtonMessageBlinkTimer);

        // Clean up the tablet button we made.
        tabletButton.clicked.disconnect(onTabletButtonClicked);
        tablet.removeButton(tabletButton);
        tabletButton = null;
    }

    // Kick off the chat application!
    startUp();

}());
