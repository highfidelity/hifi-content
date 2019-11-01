//
//  boardButtonClient.js
//
//  Additional code by Milad Nazeri 10/30/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals Screenshare */

(function(){
    // ENTITY SIGNALS
    // Grab the current color, set the button type, get the zone ID, and send a buttonPreloadComplete signal to the zone
    function preload(entityID) {
        _this.entityID = entityID;
        var props = Entities.getEntityProperties(entityID, ["name", "color", "parentID"]);
        console.log("Props.parentID", props.parentID);
        _this.entityName = props.name;
        _this.inactiveButtonColor = props.color;
        if (_this.entityName === "SmartBoard - Whiteboard Button") {
            _this.buttonType = "whiteboard";
        } else {
            _this.buttonType = "screenshare";
        }

        _this.screenshareZone = props.parentID;
        Entities.callEntityMethod(_this.screenshareZone, "buttonPreloadComplete");
    }


    // UI
    // update the button's look, called from the zone client
    var ACTIVE_BUTTON_COLOR = { r: 255, g: 155, b: 255 };
    function updateButtonState(id, args) {
        var buttonIsInOnState = args[0];
        _this.activePresenterUUID = args[1];

        if (buttonIsInOnState) {
            Entities.editEntity(_this.entityID, {color: ACTIVE_BUTTON_COLOR});
        } else {
            Entities.editEntity(_this.entityID, {color: _this.inactiveButtonColor});                
        }
    }


    // When the button is pressed, call the SmartBoard zone server script to update the
    // current board state and send in the requested presenter if there is one
    function mousePressOnEntity() {
        console.log("Mouse press on enitty");
        if (_this.activePresenterUUID === "") {
            Entities.callEntityServerMethod(_this.screenshareZone,
                "updateCurrentBoardState", [_this.buttonType, MyAvatar.sessionUUID]);
        } else if (_this.activePresenterUUID === MyAvatar.sessionUUID) {
            _this.activePresenterUUID = "";
            Entities.callEntityServerMethod(_this.screenshareZone, "updateCurrentBoardState", ["whiteboard", ""]);
            Screenshare.stopScreenshare();
        }
    }


    // SMARTBOARD BUTTON OBJECT
    var _this;
    function SmartBoardButtonClient() {
        _this = this;
        this.activePresenterUUID = "";
        this.screenshareZone;
        this.entityID;
        this.buttonType;
        this.inactiveButtonColor;
        this.entityName;
        this.remotelyCallable = [
            "updateButtonState"
        ];
    }

    SmartBoardButtonClient.prototype = {
        preload: preload,
        mousePressOnEntity: mousePressOnEntity,
        updateButtonState: updateButtonState
    };

    return new SmartBoardButtonClient();
})