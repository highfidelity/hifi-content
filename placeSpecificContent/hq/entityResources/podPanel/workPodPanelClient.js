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

    var availabilityText;
    var availabilityButton;
    var username;
    var displayName;

    var PodPanelClient = function() {
        _this = this;
    };

    PodPanelClient.prototype = {
        remotelyCallable: ['ownerInfoReceived', 'changeEntity'],
        preload: function(entityID){
            _this.entityID = entityID;
            Users.usernameFromIDReply.connect(_this.usernameFromIDReply);
            Users.requestUsernameFromID(MyAvatar.sessionUUID);
            // check if app is loaded, load if necessary
            // start listening for event bridge messages
        },

        usernameFromIDReply: function(nodeID, userName, machineFingerprint, isAdmin) {
            print("USERNAME REPLY: ", userName);
            username = userName;
            Entities.callEntityServerMethod(_this.entityID, 'getOwnerInfo', [MyAvatar.sessionUUID]);
        },

        showPresets: function() {
        },

        ownerInfoReceived: function(id, ownerInfoParams) {
            if (!username) {
                print("TRYING TO GET USERNAME AGAIN");
                Users.requestUsernameFromID(MyAvatar.sessionUUID);
                return;
            }
            print("OWNER INFO: ", JSON.stringify(ownerInfoParams));
            var podOwnerUsername = ownerInfoParams[0];
            var podOwnerDisplayName = ownerInfoParams[1];
            var textDimensions = { x: 0.2207, y: 0.09, z: 0.01 };
            var buttonDimensions = { x: 0.375, y: 0.09, z: 0.01 };
            if (podOwnerUsername && podOwnerUsername !== username) {
                var availability = "IN USE";
                var claimOrRelease = "";
            } else if (podOwnerUsername && podOwnerUsername === username) {
                claimOrRelease = "Release this pod";
                buttonDimensions.x = 0.3971;
            } else {
                availability = "AVAILABLE";
                claimOrRelease = "Claim this pod";
                textDimensions.x = 0.375;
            }
            if (availabilityText) {
                Entities.editEntity(availabilityText, {
                    text: availability,
                    dimensions: textDimensions
                });
            } else {
                print("ADDING AV TEXT");
                availabilityText = Entities.addEntity({
                    type: "Text",
                    name: "Pod Availability Text",
                    entityHostType: "local",
                    parentID: _this.entityID,
                    localPosition: { x: 0, y: 0.3094, z: -0.0250 },
                    localRotation: Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 }),
                    dimensions: textDimensions,
                    lineHeight: 0.08,
                    text: availability
                });
            }
            if (availabilityButton) {
                Entities.editEntity(availabilityButton, {
                    text: claimOrRelease,
                    dimensions: textDimensions
                    // script
                });
            } else {
                availabilityButton = Entities.addEntity({
                    type: "Text",
                    name: "Pod Availability Button",
                    entityHostType: "local",
                    parentID: _this.entityID,
                    localPosition: { x: 0, y: 0.226, z: -0.0250 },
                    localRotation: Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 }),
                    dimensions: { x: 0.375, y: 0.09, z: 0.01 },
                    lineHeight: 0.06,
                    // script
                    text: claimOrRelease
                });
            }
        //     If the room is not checked out:
        //     The Availability Button will be edited to read "Claim This Pod".
        //     The Availability Button will be edited to contain the "Claim This Pod Button Client Script" (see below)
        // If the room is checked out:
        //     If the current user is the user who checked out the Room:
        //         The Availability Button will be edited to read "IN USE - Release This Pod".
        //         The Availability Button will be edited to contain the "Release This Pod Button Client Script" (see below)
        //         The Client Script will rez N Text Local Entity/Entities that display all of the preset names stored in this entity's User Data. The name of those Text Local Entities will match the name of the Preset associated with it.
        //     If the current user is not the user who checked out the Room:
        //         The Client Script will rez a Text Local Entity at the top of the panel that reads "IN USE"
        //         The Availability Button will be edited to read "IN USE - <Occupant> is using this pod."
        //         The Availability Button will be edited to have NO attached client script.
        },

        //         When this client script receives an Event Bridge message from the Personal Workspace App containing the user's Room preferences:
        //     It will send the associated Server Script those preferences AND the current user's UUID.
        // When this client script receives a message from a Button client script containing the user's selected preset:
        //     It will send the associated Server Script the user's saved Preferences (from Settings) AND that selected preset.


        hidePresets: function() {
        },

        changeContentSet: function(id, params) {
            var presetJSONURL = params[0];
            var userConfigurationData = JSON.parse(params[1]);
            print("CHANGE CONTENT SET TO ", presetJSONURL);
            // use config data to update entities if it exists
        },

        changeEntity: function(entityID, changeType, newData) {
            print("CHANGE ENTITY ", entityID, " TO NEW ", changeType, " OF ", newData);
        },

        unload: function() {
            Users.usernameFromIDReply.disconnect(_this.usernameFromIDReply);
            if (availabilityButton) {
                Entities.deleteEntity(availabilityButton);
            }
            if (availabilityText) {
                Entities.deleteEntity(availabilityText);
            }
        }
    };

    return new PodPanelClient();
});
