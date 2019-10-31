//
//  boardButtonClient.js
//
//  Additional code by Milad Nazeri 10/30/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function(){
// ENTITY SIGNALS
    // Grab the current color, set the button type, get the zone ID, and send a buttonLoaded signal to the zone
    function preload(entityID){
        _this.entityID = entityID;
        var props = Entities.getEntityProperties(entityID, ["name", "position", "color"]);
        _this.entityName = props.name;
        _this.color = props.color
        var entityPosition = props.position;
        if (_this.entityName === "Screenshare_whiteboard_button") {
            _this.buttonType = "whiteboard";
        } else {
            _this.buttonType = "screenshare"
        }
        _this.screenshareZone = Entities.findEntitiesByName("Screenshare_Zone", entityPosition, 0.5)[0];
        Entities.callEntityMethod(_this.screenshareZone, "buttonLoaded")
    }


// UI
    // update the button's look, called from the zone client
    var buttonSelectedColor = {r: 255, g: 155, b:255};
    function updateButtonState(id, args){
        var buttonOnOffState = args[0];
        _this.activePresenterUUID = args[1]
        if (buttonOnOffState === "isOn") {
            Entities.editEntity(_this.entityID, {color: buttonSelectedColor});
        } else {
            Entities.editEntity(_this.entityID, {color: _this.color});                
        }
    }


    // When the mouse is pressed, call the zone server to update the current board state and send in the requested presenter if there is one
    function mousePressOnEntity(){
        if (_this.activePresenterUUID == "") {
            Entities.callEntityServerMethod(_this.screenshareZone, "updateCurrentBoardState", [_this.buttonType, MyAvatar.sessionUUID])
        } else if (_this.activePresenterUUID === MyAvatar.sessionUUID) {
            _this.activePresenterUUID = "";
            Entities.callEntityServerMethod(_this.screenshareZone, "updateCurrentBoardState", ["whiteboard", ""]);
        }
    }


// SMARTBOARD BUTTON OBJECT
    var _this;
    function smartBoardButtonClient(){
        _this = this;
        this.activePresenterUUID = "";
        this.screenshareZone;
        this.entityID;
        this.buttonType;
        this.color;
        this.entityName;
        this.remotelyCallable = [
            "updateButtonState"
        ];
    }

    smartBoardButtonClient.prototype = {
        preload: preload,
        mousePressOnEntity: mousePressOnEntity,
        unload: unload,
        updateButtonState: updateButtonState
    }

    return new smartBoardButtonClient();
})