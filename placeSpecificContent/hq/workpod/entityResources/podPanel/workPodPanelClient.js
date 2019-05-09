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

    var OWNERSHIP_UPDATE_INTERVAL_MS = 5000;
    // eslint-disable-next-line no-magic-numbers
    var LINE_HEIGHTS = [0.07, 0.06, 0.05];
    // eslint-disable-next-line no-magic-numbers
    var MAX_CHAR_CUT_OFFS = [6, 9, 12];
    var NEUTRAL_1_COLOR = { red: 241, green: 243, blue: 238 };
    var NEUTRAL_4_COLOR = { red: 126, green: 140, blue: 129 };
    var DEFAULT_POD_SETTINGS = {
        deskImageURL: Script.resolvePath("resources/images/podAppThumbPortrait.png"),
        wallImageURL: Script.resolvePath("resources/images/podAppThumbLandscape.png"),
        roomAccentColor: { red: 138, green: 199, blue: 115 },
        lightColor: { red: 240, green: 233, blue: 103 },
        windowTint: false,
        podPanelID: "null"
    };

    var availabilityInfo;
    var availabilityButton;
    var username;
    var updateOwnershipDataInterval;
    var podOwnerUsername;
    var podOwnerDisplayName;
    var occupantInfo;
    var presetButtonTexts = [];
    var presetNames = [];
    var numberOfPresets;

    var PodPanelClient = function() {
        _this = this;
    };

    PodPanelClient.prototype = {
        remotelyCallable: ['ownerInfoReceived', 'changeEntity'],

        /* Store this, connect signals, and request thisuser's username. Begin an interval to update the ownership 
        info of this pod and get the names for the pods presets from the user data of this panel. */
        preload: function(entityID){
            _this.entityID = entityID;
            Users.usernameFromIDReply.connect(_this.usernameFromIDReply);
            Users.requestUsernameFromID(MyAvatar.sessionUUID);
            updateOwnershipDataInterval = Script.setInterval(function() {
                Entities.callEntityServerMethod(_this.entityID, 'getOwnerInfo', [MyAvatar.sessionUUID]);
            }, OWNERSHIP_UPDATE_INTERVAL_MS);
            var userData = JSON.parse(Entities.getEntityProperties(_this.entityID, 'userData').userData);
            numberOfPresets = userData.roomPresets.length;
            for (var i = 0; i < numberOfPresets; i++) {
                presetNames.push(userData.roomPresets[i].name);
            }
        },

        /* Receive the user's username via signal and store it */
        usernameFromIDReply: function(nodeID, name, machineFingerprint, isAdmin) {
            username = name;
        },

        /* If the buttons already exist , return. If some preset buttons exist, but not the correct amount, delete them all.
            Rez a preset button for each name in the array of preset names. */
        showPresetButtons: function() {
            if (presetButtonTexts.length === numberOfPresets) { // the 3 buttons already exist
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

        /* Delete all preset buttons */
        clearPresetButtons: function() {
            if (presetButtonTexts.length > 0) { // something is wrong, start fresh
                presetButtonTexts.forEach(function(presetButton) {
                    Entities.deleteEntity(presetButton);
                });
                presetButtonTexts = [];
            }
        },

        /* Set the line height for occupant info depending on how long their username is. Edit the text entity 
            with their name or rez it if necessary */
        showOccupantInfo: function(ownerName) {
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

        /* Update the availability info text to show pod ownership status. Rez it if it does not exist. */
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

        /* Update the availability button to allow claiming or releasing the pod. Rez it if it does not exist. */
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

        /* CHECK IF A USER IS RUNNING THE CARD APP: Get a list of running scripts using the script discovery service API. 
        Search that list for the card app script and return whether or not it was found */
        isRunningPodApp: function() {
            var isRunning = false;
            if (JSON.stringify(ScriptDiscoveryService.getRunning()).indexOf("pod_app.js") !== -1) {
                isRunning = true;
            }
            return isRunning;
        },

        /* This is called from the pod panel server script when this script's update interval has requested pod ownership 
            data or the panel server has carried out a request to claim or release the pod for this user. If there is no 
            username stored for this user, request it again and return. If ownership data has not changed, return. Set the 
            new username and display name and get this user's pod prefereneces. If the pod has another owner and this owner 
            is claiming it in their settings, delete their podPanelID setting. Set the pod panel to display the name of the 
            owner and get rid of extra buttons. If the pod is owned by this user, load the app if it is not running. It this
             user has another pod checked out, release it then show the preset options. If the pod has no owner and this 
             user is claiming it in their settings, they have just released it. Clear the setting for podPanelID and reset 
             the panel info. Save the user's settings including any changes. */
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
            var personalPodSettings = Settings.getValue("workSpace");
            if (!personalPodSettings) {
                personalPodSettings = DEFAULT_POD_SETTINGS;
            }
            print("POD SETTINGS BEFORE: ", JSON.stringify(Settings.getValue("workSpace")));
            print("------------------POD ID: ", personalPodSettings.podPanelID);
            if (podOwnerUsername && podOwnerUsername !== "undefined" && podOwnerUsername !== "null" 
                && podOwnerUsername !== username) { // pod has other owner
                print("POD IS OWNED BY SOMEONE ELSE: ", podOwnerDisplayName);
                if (personalPodSettings.podPanelID === _this.entityID) {
                    personalPodSettings.podPanelID = "null";
                }
                availabilityText = "IN USE";
                claimOrReleaseText = "";
                buttonScript = "";
                _this.showOccupantInfo(podOwnerDisplayName);
                _this.clearPresetButtons();
            } else if (podOwnerUsername && podOwnerUsername !== "undefined" && podOwnerUsername !== "null" 
                && podOwnerUsername === username) { // pod is owned by this user
                print("POD SETTINGS AFTER: ", JSON.stringify(personalPodSettings));
                print("------------------POD ID: ", personalPodSettings.podPanelID);
                if (!_this.isRunningPodApp()) {
                    print("STARTING POD APP");
                    ScriptDiscoveryService.loadScript(Script.resolvePath('../../appResources/pod_app.js'));
                }
                if (personalPodSettings.podPanelID !== "null" && personalPodSettings.podPanelID !== _this.entityID) {
                    // user has another pod checked out
                    print("I AM CHECKING OUT A POD BUT MUST FIRST RELEASE THE OLD ONE");
                    print("OLD POD: ", personalPodSettings.podPanelID, " AND NEW ONE: ", _this.entityID);
                    Entities.callEntityServerMethod(personalPodSettings.podPanelID, 'setOwnerInfo', 
                        [MyAvatar.sessionUUID, username, null, "true"]);
                }
                personalPodSettings.podPanelID = _this.entityID;
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
                print("POD HAS NO OWNER");
                if (personalPodSettings.podPanelID === _this.entityID) {
                    print("CLEARING POD ID IN SETTINGS");
                    personalPodSettings.podPanelID = "null";
                    if (_this.isRunningPodApp()) {
                        print("STOPPING POD APP");
                        ScriptDiscoveryService.stopScript(Script.resolvePath('../../appResources/pod_app.js'));
                    }
                }
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
            Settings.setValue("workSpace", personalPodSettings);
            _this.setAvailabilityInfo(availabilityText, textDimensions);
            _this.setAvailabilityButton(claimOrReleaseText, buttonDimensions, buttonScript);
        },

        /* Disconnect signals, delete buttons on panel, and clear intervals */
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
