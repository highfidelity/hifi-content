//
//  smartBoardZoneServer.js
//
//  Additional code by Milad Nazeri 10/30/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
 
    // BOARD UI
    // send a message to all registered clients on the state of the board
    function updateCurrentBoardState(id, args) {
        _this.currentBoardState = args[0];
        _this.activePresenterUUID = args[1];
        var participants = Object.keys(_this.participants);
        for (var i = 0; i < participants.length; i++) {
            Entities.callEntityClientMethod(participants[i], _this.entityID,
                "receiveBoardState", [_this.currentBoardState, _this.activePresenterUUID]);
        }
    }


    // PARTICIPANTS
    // When a client first enters the zone, register them and send them the state of the board
    function registerParticipant(id, args) {
        var UUID = args[0];

        _this.participants[UUID] = {
            displayName: AvatarList.getAvatar(UUID).displayName
        };

        // Eventually, we'll want to hook up the `Avatar.displayNameChanged()` signal to a handler that
        // changes the Display Name of the broadcaster that is shown to viewers on the SmartBoard.
        // That's too advanced for now, so we'll not worry about it yet.

        Entities.callEntityClientMethod(UUID, _this.entityID, "receiveBoardState",
            [_this.currentBoardState, _this.activePresenterUUID]);
    }
    
    
    // Remove a particpant from the screenshare.  If they are the presenter, then end screenshare for everyone
    function removeParticipant(id, args) {
        var sessionUUID = args[0];
        if (_this.participants[sessionUUID]) {
            delete _this.participants[sessionUUID];

            if (_this.activePresenterUUID === sessionUUID) {
                _this.activePresenterUUID = "";
                updateCurrentBoardState(_this.entityID, ["whiteboard", ""]);
            }
        }
    }


    // When the ESS  detects that an avatar has been removed from the participants group, call removeParticipant().
    function onAvatarRemovedEvent(sessionUUID) {
        if (sessionUUID in _this.participants) {
            removeParticipant(_this.entityID, [sessionUUID]);
        }
    }


    // ENTITY SIGNALS
    // check to see if this is a whiteboardOnly zone
    // connect the avatar removed event
    var signalsConnected = false;
    function preload(entityID) {
        _this.entityID = entityID;
        var userData = Entities.getEntityProperties(entityID, ["userData"]).userData;
        var parsedData = {};
        try {
            parsedData = JSON.parse(userData);
            _this.whiteboardOnlyZone = parsedData.whiteboardOnlyZone;
        } catch (e) {
            console.log("Error reading userData in smartBoardZoneServer.js: " + e);
        }

        if (_this.whiteboardOnlyZone) {
            updateCurrentBoardState(_this.entityID, ["whiteboard"]);
        }
        
        if (!signalsConnected) {
            AvatarList.avatarRemovedEvent.connect(onAvatarRemovedEvent);
            signalsConnected = true;
        }
    }


    // update the board back to whiteboard only
    // might be unnessary, but maybe help clear left over local entities
    function unload() {
        updateCurrentBoardState(_this.entityID, ["whiteboard"]);
        
        if (signalsConnected) {
            AvatarList.avatarRemovedEvent.disconnect(onAvatarRemovedEvent);
        }
        signalsConnected = false;
    }


    // SMARTBOARD OBJECT
    var _this;
    function SmartBoardZoneServer() {
        _this = this;
        this.entityID;
        this.activePresenterUUID = "";
        this.currentBoardState = "whiteboard";
        this.participants = {};
        this.whiteboardOnlyZone = false;

        this.remotelyCallable = [
            "updateCurrentBoardState",
            "registerParticipant",
            "removeParticipant"
        ];
    }


    SmartBoardZoneServer.prototype = {
        preload: preload,
        unload: unload,
        updateCurrentBoardState: updateCurrentBoardState,
        registerParticipant: registerParticipant,
        removeParticipant: removeParticipant
    };


    return new SmartBoardZoneServer();
});
