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
    var DEBUG = true;

    // ENTITY SIGNALS
    // Grab the current color, set the button type, get the zone ID, and send a buttonPreloadComplete signal to the zone
    var INITIAL_WHITEBOARD_BUTTON_COLOR = {r: 15, g: 50, b: 25};
    var INITIAL_SCREENSHARE_BUTTON_COLOR = {r: 60, g: 44, b: 150};
    function preload(entityID) {
        if (DEBUG) {
            console.log("boardButtonClient.js: " + entityID + ": `preload()`.");
        }
        _this.entityID = entityID;
        var props = Entities.getEntityProperties(entityID, ["name", "color", "parentID"]);
        console.log("Props.parentID", props.parentID);
        _this.entityName = props.name;
        _this.inactiveButtonColor = props.color;

        if (_this.entityName === "Smartboard Whiteboard Button") {
            _this.buttonType = "whiteboard";
            _this.inactiveButtonColor = INITIAL_WHITEBOARD_BUTTON_COLOR;
        } else if (_this.entityName === "Smartboard Screenshare Button") {
            _this.buttonType = "screenshare";
            _this.inactiveButtonColor = INITIAL_SCREENSHARE_BUTTON_COLOR;
        } else {
            _this.buttonType = "selection";
        }

        Entities.getChildrenIDs(props.parentID).forEach(function(smartboardChild) {
            var name = Entities.getEntityProperties(smartboardChild, 'name').name;
            if (name === "Smartboard Zone") {
                _this.screenshareZone = smartboardChild;
            }

        });
        Entities.callEntityMethod(_this.screenshareZone, "buttonPreloadComplete");
    }


    // UI
    // update the button's look, called from the zone client
    var ACTIVE_BUTTON_COLOR = { r: 255, g: 155, b: 255 };
    function updateButtonState(id, args) {
        var buttonIsInOnState = args[0];
        _this.activePresenterUUID = args[1];

        var newColor = buttonIsInOnState === "true" ? ACTIVE_BUTTON_COLOR : _this.inactiveButtonColor;

        if (DEBUG) {
            console.log("boardButtonClient.js: " + _this.entityID + " (" + _this.buttonType + "): `updateButtonState()`." +
                "\n`buttonIsInOnState`: " + buttonIsInOnState + "\n`newColor`: " + JSON.stringify(newColor) + 
                "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }

        Entities.editEntity(_this.entityID, {color: newColor});
    }


    // When the button is pressed, call the Smartboard zone server script to update the
    // current board state and send in the requested presenter if there is one
    function mousePressOnEntity() {
        if (DEBUG) {
            console.log("boardButtonClient.js: " + _this.entityID + ": `mousePressOnEntity()`." +
                "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }

        var presenterUUID = _this.activePresenterUUID ? _this.activePresenterUUID : "";
        Entities.callEntityServerMethod(_this.screenshareZone, "updateCurrentBoardState", [_this.buttonType, presenterUUID]);
    }


    // SMARTBOARD BUTTON OBJECT
    var _this;
    function SmartboardButtonClient() {
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

    SmartboardButtonClient.prototype = {
        preload: preload,
        mousePressOnEntity: mousePressOnEntity,
        updateButtonState: updateButtonState
    };

    return new SmartboardButtonClient();
});