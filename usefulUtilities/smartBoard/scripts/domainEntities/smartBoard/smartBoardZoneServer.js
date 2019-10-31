//
//  smartBoardZoneServer.js
//
//  Additional code by Milad Nazeri 10/30/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function(){
 
// BOARD UI
    // send a message to all registered clients on the state of the board
    function updateCurrentBoardState(id, args){
        _this.currentBoardState = args[0];
        _this.activePresenterUUID = args[1];
        var participants = Object.keys(_this.participants);
        for (var i = 0; i < participants.length; i++) {
            Entities.callEntityClientMethod(participants[i], _this.entityID, "receiveBoardState", [_this.currentBoardState, _this.activePresenterUUID])
        }
    }


// PARTICIPANTS
    // When a client first enters the zone, register them and send them the state of the board
    function registerParticipant(id, args, UUID, userName, displayName){
        var UUID = args[0];
        var userName = args[1];
        var displayName = args[2];

        _this.participants[UUID] = { userName: userName, displayName: displayName};

        Entities.callEntityClientMethod(UUID, _this.entityID, "receiveBoardState", [_this.currentBoardState]);
    }


    // when the ess detects that an avatar has been removed from the participants group, then call removeParticipant
    function onAvatarRemovedEvent(sessionUUID){
        if (sessionUUID in participants) {
            removeParticipant(_this.entityID, [sessionUUID]);
        }
    }
    
    
    // Remove a particpant from the screenshare.  If they are the presenter, then end screenshare for everyone
    function removeParticipant(id, args){
        var sessionUUID = args[0];
        if (_this.participants[sessionUUID]) {
            delete _this.participants[sessionUUID];
            if (_this.activePresenterUUID === sessionUUID) {
                updateCurrentBoardState(_this.entityID,["whiteboard"]);
                Object.keys(_this.participants).forEach(function(id){
                    Entities.callEntityClientMethod(id, _this.entityID, "receiveBoardState", ["whiteboard"]);
                })
                _this.activePresenterUUID = "";
            }
        }
    }


// ENTITY SIGNALS
    // check to see if this is a whiteboardOnly zone
    // connect the avatar removed event
    function preload(entityID){
        _this.entityID = entityID;
        var userData = Entities.getEntityProperties(entityID, ["userData"]).userData;
        var parsedData = {};
        try {
            parsedData = JSON.parse(userData);
            _this.whiteboardOnlyZone = parsedData.whiteboardOnlyZone;
            if (_this.whiteboardOnlyZone) {
                updateCurrentBoardState(_this.entityID, ["whiteboard"]);
            }

        } catch (e) {
            console.log("error reading userData in smartBoardZoneServer.js", error);
        }

        
        AvatarList.avatarRemovedEvent.connect(onAvatarRemovedEvent);

    }


    // update the board back to whiteboard only
    // might be unnessary, but maybe help clear left over local entities
    function unload(){
        updateCurrentBoardState(_this.entityID,["whiteboard"]);
    }


// SMARTBOARD OBJECT
    var _this;
    function SmartBoardZoneServer(){
        _this = this;
        this.activePresenterUUID;
        this.currentBoardState = 'whiteboard';
        this.entityID;
        this.participants = {};
        this.whiteboardOnlyZone;

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
    }


    return new SmartBoardZoneServer();
})

