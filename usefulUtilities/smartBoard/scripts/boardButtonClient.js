'use strict';
//  boardButtonClient.js
//
//  Created by Milad Nazeri and Zach Fox 10/30/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals Screenshare */

(function() {
    var DEBUG = false;

    function getScreenshareZoneID() {
        var props = Entities.getEntityProperties(_this.entityID, ["parentID"]);
        var children = Entities.getChildrenIDs(props.parentID);
        for (var i = 0; i < children.length; i++) {
            var name = Entities.getEntityProperties(children[i], 'name').name;
            if (name && name === "Smartboard Zone") {
                _this.screenshareZoneID = children[i];
                break;
            }
        }
    }


    // ENTITY SIGNALS
    var MAX_SCREENSHARE_ZONE_ID_RETRIES = 10;
    function preload(entityID) {
        if (DEBUG) {
            console.log("boardButtonClient.js: " + entityID + ": `preload()`.");
        }
        _this.entityID = entityID;

        var screenshareZoneIDRetries = 0;
        while (!_this.screenshareZoneID) {
            if (screenshareZoneIDRetries >= MAX_SCREENSHARE_ZONE_ID_RETRIES) {
                console.log("boardButtonClient.js: " + _this.entityID + "Couldn't get Screenshare Zone ID. Screenshare won't function.");
                return;
            }
            getScreenshareZoneID();
            screenshareZoneIDRetries++;
        }
        
        Entities.callEntityMethod(_this.screenshareZoneID, "buttonPreloadComplete");
    }


    // Check to see what the button should display based on if there is an active sharer. 
    var ACTIVE_SCREENSHARE_MODEL_URL = Script.resolvePath("../resources/models/button-stop-screen-share.fbx");
    var INACTIVE_SCREENSHARE_MODEL_URL = Script.resolvePath("../resources/models/button-start-screen-share.fbx");
    function updateModelURL() {
        var newModelURL = !_this.activePresenterUUID ? INACTIVE_SCREENSHARE_MODEL_URL : ACTIVE_SCREENSHARE_MODEL_URL;

        if (DEBUG) {
            console.log("boardButtonClient.js: " + _this.entityID + "`updateModelURL()`." +
                "\n`newModelURL`: " + newModelURL + "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }
        Entities.editEntity(_this.entityID, {
            modelURL: newModelURL,
            visible: true
        });
    }


    // UI
    // When the zone client sends who is the current presenter,
    // call updateModelURL to update the start/stop screenshare button with the new state
    function setActivePresenterUUID(id, args) {
        _this.currentBoardState = args[0];
        _this.activePresenterUUID = args[1];

        if (_this.currentBoardState === "whiteboard") {
            _this.activePresenterUUID = "";
        }

        if (DEBUG) {
            console.log("args:", args, "\nboardButtonClient.js: " + _this.entityID + "`setActivePresenterUUID()`." +
                "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }

        updateModelURL();
    }


    // When the button is pressed, call the Smartboard zone server script to update the
    // current board state and send in the requested presenter if there is one
    function mousePressOnEntity() {
        if (DEBUG) {
            console.log("boardButtonClient.js: " + _this.entityID + ": `mousePressOnEntity()`." +
                "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID + "\n");
        }
        if (_this.activePresenterUUID && _this.activePresenterUUID !== MyAvatar.sessionUUID) {
            return;
        }
        var newState = _this.currentBoardState === "screenshare" ? "whiteboard": "screenshare";
        if (newState === "whiteboard") {
            Screenshare.stopScreenshare();
        } else {
            if (!_this.screenshareZoneID) {
                getScreenshareZoneID();
            }

            if (!_this.screenshareZoneID) {
                console.log("boardButtonClient.js: " + _this.entityID + ": `mousePressOnEntity()`." +
                    "\nCouldn't get `screenshareZoneID`. Screenshare will not function. Please try clicking again.");
                    return;
            }

            Entities.callEntityServerMethod(_this.screenshareZoneID,
                "updateCurrentBoardState", [newState, MyAvatar.sessionUUID]);
        }
    }


    // SMARTBOARD BUTTON OBJECT
    var _this;
    function SmartboardButtonClient() {
        _this = this;
        this.currentBoardState = "whiteboard";
        this.activePresenterUUID = "";
        this.screenshareZoneID;
        this.entityID;
        this.remotelyCallable = [
            "setActivePresenterUUID"
        ];
    }

    SmartboardButtonClient.prototype = {
        preload: preload,
        mousePressOnEntity: mousePressOnEntity,
        updateModelURL: updateModelURL,
        setActivePresenterUUID: setActivePresenterUUID
    };

    return new SmartboardButtonClient();
});