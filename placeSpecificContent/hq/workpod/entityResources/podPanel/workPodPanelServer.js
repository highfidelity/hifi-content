//
//  workPodPanelServer.js
//
//  Created by Rebecca Stankus on 04/22/19.
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {

    var _this;

    var WAIT_FOR_ENTITIES_TO_LOAD_MS = 500;
    var NEGATIVE = -1;
    var GREEN = {red:0,green:255,blue:0};
    var YELLOW = {red:255,green:255,blue:0};
    var RED = {red:255,green:0,blue:0};
    var TWO_HOURS_MS = 7200000;
    var MOD_POD_ENTITIES = Script.require("../resources/JSONs/podMod.json? + Date.now()");
    var SURF_SHACK_ENTITIES = Script.require("../resources/JSONs/podSurf.json? + Date.now()");
    var GARDEN_ENTITIES = Script.require("../resources/JSONs/podGarden.json? + Date.now()");
    var DICTIONARY = {
        "Mod Pod": MOD_POD_ENTITIES,
        "Surf Shack": SURF_SHACK_ENTITIES,
        "Garden": GARDEN_ENTITIES
    };
    var DEFAULT_PRESET_NAME = "Mod Pod";

    var podOwnerUsername;
    var podOwnerDisplayName;
    var podReleaseTimeout;
    var customEntities = [];
    var currentPodIDs = [];
    var currentZoneID;

    var PodPanelServer = function() {
        _this = this;
    };

    PodPanelServer.prototype = {
        remotelyCallable: ['changeContentSet', 'changeEntity', 'getOwnerInfo', 'setOwnerInfo', 'setPodReleaseTimeout',
            'clearPodReleaseTimeout'],
        preload: function(entityID){
            _this.entityID = entityID;
            _this.changeContentSet(_this.entityID, [DEFAULT_PRESET_NAME]);
        },

        changeContentSet: function(id, params) {
            if (currentZoneID) {
                Entities.deleteEntity(currentZoneID);
            }
            currentPodIDs = [];
            currentZoneID = null;
            var presetName = params[0];
            var presetEntities = DICTIONARY[presetName].Entities;
            
            presetEntities.forEach(function(presetEntity) {
                var name = presetEntity.name;
                if (name === "Pod Zone") {
                    delete presetEntity.id;
                    presetEntity.parentID = _this.entityID;
                    presetEntity.position = { x: 1.8786, y: -0.0005, z: 2.3164 };
                    presetEntity.localPosition = { x: 1.8786, y: -0.0005, z: 2.3164 };
                    currentZoneID = Entities.addEntity(presetEntity);
                    print("....................CURRENT ZONE: ", currentZoneID);
                }
            });
            
            presetEntities.forEach(function(presetEntity) {
                var name = presetEntity.name;
                if (name === "Pod Zone") {
                    return;
                } else {
                    
                    // var position = presetEntity.position;
                    // // delete presetEntity.position;
                    // presetEntity.localPosition = position;
                    presetEntity.parentID = currentZoneID;
                    var id = Entities.addEntity(presetEntity);
                    currentPodIDs.push(id);
                }
            });
            print(JSON.stringify(presetEntities));
            // // use config data to update entities if it exists
            // Call changeEntities to modify the properties of relevant entities according to the passed User Preferences.
        },

        changeEntity: function(entityID, changeType, newData) {
            print("CHANGE ENTITY ", entityID, " TO NEW ", changeType, " OF ", newData);
        },

        getOwnerInfo: function(id, clientSessionIDParams) {
            var clientSessionID = clientSessionIDParams[0];
            Entities.callEntityClientMethod(clientSessionID, _this.entityID, 'ownerInfoReceived', 
                [podOwnerUsername, podOwnerDisplayName]);
        },

        setOwnerInfo: function(id, ownerInfoParams) {
            var clientSessionID = ownerInfoParams[0];
            podOwnerUsername = ownerInfoParams[1];
            podOwnerDisplayName = ownerInfoParams[2];
            if (podOwnerUsername === "null") {
                _this.changeContentSet(_this.entityID, [DEFAULT_PRESET_NAME]);
            }
            Entities.callEntityClientMethod(clientSessionID, _this.entityID, 'ownerInfoReceived', 
                [podOwnerUsername, podOwnerDisplayName]);
        },

        setPodReleaseTimeout: function(id, ownerInfoParams) {
            var usernameInPod = ownerInfoParams[0];
            if (usernameInPod !== podOwnerUsername) {
                return;
            }
            if (podReleaseTimeout) {
                Script.clearTimeout(podReleaseTimeout);
                podReleaseTimeout = null;
            }
            podReleaseTimeout = Script.setTimeout(function() {
                print("2 HOUR POD RELEASE TIMEOUT");
                podOwnerUsername = null;
                podOwnerDisplayName = null;
                podReleaseTimeout = null;
            }, TWO_HOURS_MS);
        },

        clearPodReleaseTimeout: function(id, ownerInfoParams) {
            var usernameLeftPod = ownerInfoParams[0];
            if (usernameLeftPod !== podOwnerUsername) {
                return;
            }
            if (podReleaseTimeout) {
                Script.clearTimeout(podReleaseTimeout);
                podReleaseTimeout = null;
            }
        },

        unload: function() {
            Entities.deleteEntity(currentZoneID);
        }
    };

    return new PodPanelServer();
});
