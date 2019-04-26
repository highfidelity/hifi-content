//
//  workPodPanelClient.js
//
//  Created by Rebecca Stankus on 04/23/19.
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {

    var _this;

    var WAIT_FOR_USERNAME_REQUEST_MS = 300;
    var NEGATIVE = -1;
    var GREEN = {red:0,green:255,blue:0};
    var YELLOW = {red:255,green:255,blue:0};
    var RED = {red:255,green:0,blue:0};
    var OWNERSHIP_UPDATE_INTERVAL_MS = 5000;
    var NUMBER_OF_PRESETS = 3;
    var LINE_HEIGHTS = [0.07, 0.06, 0.05];
    var MAX_CHAR_CUT_OFFS = [6, 9, 12];
    var NEUTRAL_1_COLOR = { red: 241, green: 243, blue: 238 };
    var NEUTRAL_4_COLOR = { red: 126, green: 140, blue: 129 };

    var availabilityInfo;
    var availabilityButton;
    var username;
    var displayName;
    var updateOwnershipDataInterval;
    var podOwnerUsername;
    var podOwnerDisplayName;
    var occupantInfo;
    var presetButtonTexts = [];
    var presetNames = [];

    var PodPanelClient = function() {
        _this = this;
    };

    PodPanelClient.prototype = {
        remotelyCallable: ['ownerInfoReceived', 'changeEntity'],
        preload: function(entityID){
            _this.entityID = entityID;
            Users.usernameFromIDReply.connect(_this.usernameFromIDReply);
            Users.requestUsernameFromID(MyAvatar.sessionUUID);
            updateOwnershipDataInterval = Script.setInterval(function() {
                Entities.callEntityServerMethod(_this.entityID, 'getOwnerInfo', [MyAvatar.sessionUUID]);
            }, OWNERSHIP_UPDATE_INTERVAL_MS);
            var userData = JSON.parse(Entities.getEntityProperties(_this.entityID, 'userData').userData);
            var numberPresets = userData.roomPresets.length;
            for (var i = 0; i < numberPresets; i++) {
                presetNames.push(userData.roomPresets[i].name);
            }
            // check if pod is furnished, rez default if needed
            // check if app is loaded, load if necessary
            // start listening for event bridge messages
        },

        usernameFromIDReply: function(nodeID, userName, machineFingerprint, isAdmin) {
            username = userName;
            Entities.callEntityServerMethod(_this.entityID, 'getOwnerInfo', [MyAvatar.sessionUUID]);
        },

        showPresetButtons: function() {
            if (presetButtonTexts.length === NUMBER_OF_PRESETS) { // the 3 buttons already exist
                return;
            } else {
                _this.clearPresetButtons();
            }
            var localPosition = { x: 0, y: 0.1, z: -0.028 };
            presetNames.forEach(function(presetName) {
                var presetButtonText = Entities.addEntity({
                    type: "Text",
                    name: "Pod Preset Name Text",
                    parentID: _this.entityID,
                    localPosition: localPosition,
                    localRotation: Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 }),
                    dimensions: { x: 0.394, y: 0.06, z: 0.01 },
                    lineHeight: 0.06,
                    leftMargin: 0.1,
                    text: presetName,
                    script: Script.resolvePath("presetButtons/workPodPresetClient.js"),
                    textColor: NEUTRAL_4_COLOR,
                    backgroundAlpha: 0
                }, 'local');
                var buttonColor = presetName === "Mod Pod" ? NEUTRAL_1_COLOR : NEUTRAL_4_COLOR;
                Entities.addEntity({
                    type: "Shape",
                    shape: "Cylinder",
                    name: "Pod Preset Button",
                    parentID: presetButtonText,
                    localPosition: { x: -0.15, y: 0, z: -0.005 },
                    localRotation: Quat.fromVec3Degrees({ x: 90, y: 0, z: 0 }),
                    dimensions: { x: 0.04, y: 0.001, z: 0.04 },
                    color: buttonColor
                }, 'local');
                presetButtonTexts.push(presetButtonText);
                localPosition.y -= 0.1;
            });
        },

        clearPresetButtons: function() {
            if (presetButtonTexts.length > 0) { // something is wrong, start fresh
                presetButtonTexts.forEach(function(presetButton) {
                    Entities.deleteEntity(presetButton);
                });
                presetButtonTexts = [];
            }
        },

        showOccupantInfo: function() {
            var ownerName = podOwnerDisplayName;
            var lineHeight;
            if (ownerName.length <= MAX_CHAR_CUT_OFFS[0]) {
                lineHeight = LINE_HEIGHTS[0];
            } else if (ownerName.length <= MAX_CHAR_CUT_OFFS[1]) {
                lineHeight = LINE_HEIGHTS[1];
            } else if (ownerName.length <= MAX_CHAR_CUT_OFFS[2]) {
                lineHeight = LINE_HEIGHTS[2];
            } else {
                ownerName = ownerName.slice(0, MAX_CHAR_CUT_OFFS[2] + 1);
                lineHeight = LINE_HEIGHTS[2];
            }
            var occupantText = ownerName + " is using this pod.";
            if (occupantInfo) {
                Entities.editEntity(occupantInfo, {
                    text: occupantText,
                    lineHeight: lineHeight
                });
            } else {
                occupantInfo = Entities.addEntity({
                    type: "Text",
                    name: "Pod Occupant Info Text",
                    parentID: _this.entityID,
                    localPosition: { x: 0, y: -0.1, z: -0.0250 },
                    localRotation: Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 }),
                    dimensions: { x: 0.394, y: 0.5, z: 0.01 },
                    lineHeight: lineHeight,
                    text: occupantText,
                    textColor: NEUTRAL_4_COLOR,
                    backgroundAlpha: 0
                }, 'local');
            }
        },

        setAvailabilityInfo: function(availabilityText, textDimensions) {
            if (availabilityInfo) {
                Entities.editEntity(availabilityInfo, {
                    text: availabilityText,
                    dimensions: textDimensions
                });
            } else {
                availabilityInfo = Entities.addEntity({
                    type: "Text",
                    name: "Pod Availability Text",
                    parentID: _this.entityID,
                    localPosition: { x: 0, y: 0.3094, z: -0.0250 },
                    localRotation: Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 }),
                    dimensions: textDimensions,
                    lineHeight: 0.08,
                    text: availabilityText,
                    textColor: NEUTRAL_4_COLOR,
                    backgroundAlpha: 0
                }, 'local');
            }
        },

        setAvailabilityButton: function(claimOrReleaseText, buttonDimensions, buttonScript) {
            if (availabilityButton) {
                Entities.editEntity(availabilityButton, {
                    text: claimOrReleaseText,
                    dimensions: buttonDimensions,
                    script: buttonScript
                });
            } else {
                availabilityButton = Entities.addEntity({
                    type: "Text",
                    name: "Pod Availability Button",
                    parentID: _this.entityID,
                    localPosition: { x: 0, y: 0.226, z: -0.0250 },
                    localRotation: Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 }),
                    dimensions: buttonDimensions,
                    lineHeight: 0.06,
                    script: buttonScript,
                    text: claimOrReleaseText,
                    textColor: NEUTRAL_4_COLOR,
                    backgroundAlpha: 0
                }, 'local');
            }
        },

        ownerInfoReceived: function(id, ownerInfoParams) {
            if (!username) {
                Users.requestUsernameFromID(MyAvatar.sessionUUID);
                return;
            }
            if (ownerInfoParams[0] === podOwnerUsername && ownerInfoParams[1] === podOwnerDisplayName) {
                return;
            }
            podOwnerUsername = ownerInfoParams[0];
            podOwnerDisplayName = ownerInfoParams[1];
            var textDimensions = { x: 0.2207, y: 0.09, z: 0.01 };
            var buttonDimensions = { x: 0.375, y: 0.09, z: 0.01 };
            var availabilityText, claimOrReleaseText, buttonScript;
            if (podOwnerUsername && podOwnerUsername !== "undefined" && podOwnerUsername !== "null" 
                && podOwnerUsername !== username) { // pod has other owner
                availabilityText = "IN USE";
                claimOrReleaseText = "";
                buttonScript = "";
                _this.showOccupantInfo();
                _this.clearPresetButtons();
            } else if (podOwnerUsername && podOwnerUsername !== "undefined" && podOwnerUsername !== "null" 
                && podOwnerUsername === username) { // pod is owned by this user
                availabilityText = "IN USE";
                claimOrReleaseText = "Release this pod";
                buttonDimensions.x = 0.394;
                buttonScript = Script.resolvePath("availabilityButton/workPodReleaseClient.js?2");
                if (occupantInfo) {
                    Entities.deleteEntity(occupantInfo);
                    occupantInfo = null;
                }
                _this.showPresetButtons();
            } else { // pod has no owner
                availabilityText = "AVAILABLE";
                claimOrReleaseText = "Claim this pod";
                buttonScript = Script.resolvePath("availabilityButton/workPodClaimClient.js?1") ;
                textDimensions.x = 0.375;
                if (occupantInfo) {
                    Entities.deleteEntity(occupantInfo);
                    occupantInfo = null;
                }
                _this.clearPresetButtons();
            }
            _this.setAvailabilityInfo(availabilityText, textDimensions);
            _this.setAvailabilityButton(claimOrReleaseText, buttonDimensions, buttonScript);
        },
       
        // When this client script receives an Event Bridge message from the Personal Workspace App containing the user's Room preferences:
        // It will send the associated Server Script those preferences AND the current user's UUID.
        // When this client script receives a message from a Button client script containing the user's selected preset:
        // It will send the associated Server Script the user's saved Preferences (from Settings) AND that selected preset.

        unload: function() {
            Users.usernameFromIDReply.disconnect(_this.usernameFromIDReply);
            if (availabilityButton) {
                Entities.deleteEntity(availabilityButton);
                availabilityButton = null;
            }
            if (availabilityInfo) {
                Entities.deleteEntity(availabilityInfo);
                availabilityInfo = null;
            }
            if (occupantInfo) {
                Entities.deleteEntity(occupantInfo);
                occupantInfo = null;
            }
            if (updateOwnershipDataInterval) {
                Script.clearInterval(updateOwnershipDataInterval);
            }
            _this.clearPresetButtons();
        }
    };

    return new PodPanelClient();
});
