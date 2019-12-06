'use strict';
//  smartBoardZoneServer.js
//
//  Milad Nazeri and Zach Fox 10/30/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    var DEBUG = false;
 
    // BOARD UI
    // send a message to all registered clients on the state of the board
    var WHITEBOARD_STATUS_ICON = Script.resolvePath("../resources/models/button-state-whiteboard.fbx");
    var SCREENSHARE_STATUS_ICON = Script.resolvePath("../resources/models/button-state-screen-share.fbx");
    function updateCurrentBoardState(id, args) {
        // If there's an active presenter, only the active presenter can update the current board state.
        if (_this.activePresenterUUID !== "" && _this.activePresenterUUID !== args[1]) {
            return;
        }

        _this.currentBoardState = args[0];
        _this.activePresenterUUID = args[1];
        
        Entities.editEntity(_this.entityID, { userData: JSON.stringify({ currentBoardState: _this.currentBoardState })});
        // Reset the active presenter UUID if the new current board state is "whiteboard".
        if (_this.currentBoardState === "whiteboard") {
            _this.activePresenterUUID = "";
        }

        var smartboardStatusIcon = _this.currentBoardState === "screenshare" ? SCREENSHARE_STATUS_ICON : WHITEBOARD_STATUS_ICON;
        if (!_this.smartboardStatusIconID) {
            getSmartboardStatusIconID();
        }
        if (_this.smartboardStatusIconID) {
            Entities.editEntity(_this.smartboardStatusIconID, {modelURL: smartboardStatusIcon});
        } else {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `smartboardStatusIconID` not set. Status icon won't change.");
        }
        
        if (DEBUG) {
            console.log("args:", args, "smartBoardZoneServer.js: " + _this.entityID + ": `updateCurrentBoardState()`." +
                "\n`_this.currentBoardState`: " + _this.currentBoardState +
                "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID +
                "\nparticipants:" + JSON.stringify(_this.participants, null, 4));
        }

        var participants = Object.keys(_this.participants);
        for (var i = 0; i < participants.length; i++) {
            Entities.callEntityClientMethod(participants[i], _this.entityID,
                "receiveBoardState", [_this.currentBoardState, _this.activePresenterUUID]);
        }
        setVisibilityOfSmartboardWhiteboardComponents();
    }

    // The following Smartboard Whiteboard components should be visible/invisible:
    // 1. Whiteboard palette circle background
    // 2. Whiteboard palette circles
    // 3. Whiteboard "reset" button
    // 4. Whiteboard polylines
    var HIDE_POLYLINES_IN_SCREENSHARE_MODE = false;
    function setVisibilityOfSmartboardWhiteboardComponents() {
        if (!_this.smartboard) {
            getSmartboardID();
        }

        if (!_this.smartboard) {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `smartboard` not set. Whiteboard component visibility won't change.");
            return;
        }
        
        var smartboardChildrenIDs = Entities.getChildrenIDs(_this.smartboard);
        var entityNamesToShowOrHide = ["reset", "palette", "erase"];
        if (HIDE_POLYLINES_IN_SCREENSHARE_MODE) {
            entityNamesToShowOrHide.push("polyline");
        }
        smartboardChildrenIDs.forEach(function(smartboardPiece) {
            var entityName = Entities.getEntityProperties(smartboardPiece, 'name').name;
            if (!entityName) {
                return;
            }

            var lowerCaseName = entityName.toLowerCase();
            var foundWhiteBoardComponent = false;
            for (var i = 0; i < entityNamesToShowOrHide.length; i++) {
                if (lowerCaseName.indexOf(entityNamesToShowOrHide[i]) === -1) {
                    continue;
                } else {
                    foundWhiteBoardComponent = true;
                    break;
                }
            }
            if (foundWhiteBoardComponent) {
                Entities.editEntity(smartboardPiece, {visible: _this.currentBoardState === "whiteboard"});
            }
        });
    }


    // PARTICIPANTS
    // When a client first enters the zone, register them and send them the state of the board
    function registerParticipant(id, args) {
        var UUID = args[0];

        if (DEBUG) {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `registerParticipant()`." +
                "\n`UUID`: " + UUID + "\n`_this.currentBoardState`: " +
                _this.currentBoardState + "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }

        _this.participants[UUID] = {
            displayName: AvatarList.getAvatar(UUID).displayName
        };

        // Eventually, we'll want to hook up the `Avatar.displayNameChanged()` signal to a handler that
        // changes the Display Name of the broadcaster that is shown to viewers on the Smartboard.
        // That's too advanced for now, so we'll not worry about it yet.

        Entities.callEntityClientMethod(UUID, _this.entityID, "receiveBoardState",
            [_this.currentBoardState, _this.activePresenterUUID]);
    }
    
    
    // Remove a particpant from the screenshare.  If they are the presenter, then end screenshare for everyone
    function removeParticipant(id, args) {
        var UUID = args[0];

        if (DEBUG) {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `removeParticipant()`." +
                "\n`UUID`: " + UUID +
                "\n`_this.currentBoardState`: " + _this.currentBoardState +
                "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }

        if (_this.participants[UUID]) {
            delete _this.participants[UUID];

            if (_this.activePresenterUUID === UUID) {
                if (DEBUG) {
                    console.log("smartBoardZoneServer.js: " + _this.entityID + ": `removeParticipant()`." +
                        "The removed participant was the active presenter. Updating current board state to 'smartboard'...");
                }

                // `updateCurrentBoardState()` will reset `_this.activePresenterUUID` to "".
                updateCurrentBoardState(_this.entityID, ["whiteboard", _this.activePresenterUUID]);
            }
        }
    }


    // When the ESS detects that an avatar has been removed from the participants group, call removeParticipant().
    function onAvatarRemovedEvent(UUID) {
        if (DEBUG) {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `onAvatarRemovedEvent()`." +
                "\n`UUID`: " + UUID);
        }

        if (UUID in _this.participants) {
            removeParticipant(_this.entityID, [UUID]);
        }
    }


    function getSmartboardID() {
        var props = Entities.getEntityProperties(_this.entityID, ["parentID"]);
        _this.smartboard = props.parentID;
    }


    function getSmartboardStatusIconID() {
        var smartboardChildrenIDS = Entities.getChildrenIDs(_this.smartboard);
        for (var i = 0; i < smartboardChildrenIDS.length; i++) {
            var childID = smartboardChildrenIDS[i];
            var name = Entities.getEntityProperties(childID, "name").name;
            if (name === "Smartboard Status Icon") {
                _this.smartboardStatusIconID = childID;
                break;
            }
        }
    }


    // ENTITY SIGNALS
    // check to see if this is a whiteboardOnly zone
    // connect the avatar removed event
    var signalsConnected = false;
    function preload(entityID) {
        _this.entityID = entityID;

        if (DEBUG) {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `preload()`.");
        }

        getSmartboardID();

        Entities.editEntity(_this.entityID, { userData: JSON.stringify({ currentBoardState: "whiteboard" })});

        var props = Entities.getEntityProperties(entityID, ["userData"]);
        var userData = props.userData;
        var parsedData = {};
        try {
            parsedData = JSON.parse(userData);
            _this.whiteboardOnlyZone = parsedData.whiteboardOnlyZone;
        } catch (e) {
            console.log("Error reading userData in smartBoardZoneServer.js: " + e);
        }

        if (_this.whiteboardOnlyZone) {
            updateCurrentBoardState(_this.entityID, ["whiteboard", ""]);
        }
        
        if (!signalsConnected) {
            AvatarList.avatarRemovedEvent.connect(onAvatarRemovedEvent);
            signalsConnected = true;
        }

        getSmartboardStatusIconID();
    }

    // update the board back to whiteboard only
    // might be unnessary, but maybe help clear left over local entities
    function unload() {
        if (DEBUG) {
            console.log("smartBoardZoneServer.js: " + _this.entityID + ": `unload()`.");
        }

        updateCurrentBoardState(_this.entityID, ["whiteboard", ""]);
        
        if (signalsConnected) {
            AvatarList.avatarRemovedEvent.disconnect(onAvatarRemovedEvent);
        }
        signalsConnected = false;
    }


    // SMARTBOARD OBJECT
    var _this;
    function SmartboardZoneServer() {
        _this = this;
        this.entityID;
        this.smartboard;
        this.activePresenterUUID = "";
        this.currentBoardState = "whiteboard";
        this.participants = {};
        this.whiteboardOnlyZone = false;
        this.smartboardStatusIconID;
        this.remotelyCallable = [
            "updateCurrentBoardState",
            "registerParticipant",
            "removeParticipant"
        ];
    }


    SmartboardZoneServer.prototype = {
        preload: preload,
        unload: unload,
        updateCurrentBoardState: updateCurrentBoardState,
        registerParticipant: registerParticipant,
        removeParticipant: removeParticipant
    };


    return new SmartboardZoneServer();
});
