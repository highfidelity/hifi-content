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

    var TWO_HOURS_MS = 7200000;
    var MOD_POD_ENTITIES = Script.require("../resources/JSONs/podMod129.json");
    var SURF_SHACK_ENTITIES = Script.require("../resources/JSONs/podSurf7.json");
    var GARDEN_ENTITIES = Script.require("../resources/JSONs/podGarden5.json");
    var DICTIONARY = {
        "Mod Pod": MOD_POD_ENTITIES,
        "Surf Shack": SURF_SHACK_ENTITIES,
        "Garden": GARDEN_ENTITIES
    };
    var DEFAULT_PRESET_NAME = "Mod Pod";
    var RGB_MAX_VALUE = 255;
    var DECIMAL_PLACES = 2;
    var DEFAULT_ACCENT_MATERIAL_DATA = {
        "materialVersion": 1,
        "materials": {
            "roughness": 0.5,
            "albedo": {
                "red": 0.54,
                "green": 0.78,
                "blue": 0.45
            }
        }
    };
    var CURRENT_POD_PREFERENCES_DEFAULT = JSON.stringify({
        deskImageURL: Script.resolvePath("../../appResources/resources/images/podAppThumbPortrait.png"),
        wallImageURL: Script.resolvePath("../../appResources/resources/images/podAppThumbLandscape.png"),
        roomAccentColor: { red: 138, green: 199, blue: 115 },
        lightColor: { red: 240, green: 233, blue: 103 },
        windowTint: false,
        podPanelID: "null"
    });

    var podOwnerUsername;
    var podOwnerDisplayName;
    var podReleaseTimeout;
    var currentPodPreferences = CURRENT_POD_PREFERENCES_DEFAULT;
    var deskImage;
    var wallImage;
    var podAccentMaterial;
    var podLight;
    var podWindowTintMaterial;
    var currentPodID;

    var PodPanelServer = function() {
        _this = this;
    };

    PodPanelServer.prototype = {
        remotelyCallable: ['changeContentSet', 'updatePod', 'getOwnerInfo', 'setOwnerInfo', 'setPodReleaseTimeout',
            'clearPodReleaseTimeout'],
        
        /* Store this and rez the default pod content set */
        preload: function(entityID){
            _this.entityID = entityID;
            _this.changeContentSet(_this.entityID, [DEFAULT_PRESET_NAME]);
        },

        /* Convert RGB value to 0-1 scale */
        rgbConversion: function(rgbColor) {
            rgbColor.red = (rgbColor.red/RGB_MAX_VALUE).toFixed(DECIMAL_PLACES);
            rgbColor.green = (rgbColor.green/RGB_MAX_VALUE).toFixed(DECIMAL_PLACES);
            rgbColor.blue = (rgbColor.blue/RGB_MAX_VALUE).toFixed(DECIMAL_PLACES);
            return rgbColor;
        },

        /* Find the passed in pod preset name in this script's dictionary to get the URL of the JSON we will be 
            rezzing from. Sort the entities in the JSON and rez the pod which will be the child of the panel. Next, 
            rez items that will be parented to the pod that are not chairs or materials. The desk will be in this 
            group. After it is rezzed, rez it's children. Next, rez the pod materials. Finally, iterate through 
            the array of chairs, rezzing each one and also the associated sit cube.
        */
        changeContentSet: function(id, params) {
            if (currentPodID) {
                Entities.deleteEntity(currentPodID);
            }
            var presetName = params[0];
            var presetEntities = DICTIONARY[presetName].Entities;
            var podMaterials = [];
            var sitCubes = [];
            var chairs = [];
            var parentedToDesk = [];
            var parentedToPod = [];
            var desk;
            
            presetEntities.forEach(function(presetEntity) {
                if (presetEntity.name === "Pod") {
                    presetEntity.parentID = _this.entityID;
                    currentPodID = Entities.addEntity(presetEntity);
                    delete presetEntity.id;
                } else if (presetEntity.name.indexOf("Material") > -1) {
                    podMaterials.push(presetEntity);
                } else if (presetEntity.name.indexOf("Chair") > -1) {
                    var chairIndex = presetEntity.name.substr(presetEntity.name.length -1);
                    chairs[chairIndex] = presetEntity;
                } else if (presetEntity.name.indexOf("SitCube") > -1) {
                    var sitCubeIndex = presetEntity.name.substr(presetEntity.name.length -1);
                    sitCubes[sitCubeIndex] = presetEntity;
                } else if (presetEntity.name.indexOf("Desk Image") > -1) {
                    parentedToDesk.push(presetEntity);
                } else if (presetEntity.name.indexOf("Desk-Web") > -1) {
                    parentedToDesk.push(presetEntity);
                } else {
                    parentedToPod.push(presetEntity);
                }
            });

            parentedToPod.forEach(function(podChild) {
                podChild.parentID = currentPodID;
                var id = Entities.addEntity(podChild);
                if (podChild.name.indexOf("Wall Image") > -1) {
                    wallImage = id;
                } else if (podChild.type === "Light") {
                    podLight = id;
                } else if (podChild.name.indexOf("Desk") > -1) {
                    desk = id;
                    parentedToDesk.forEach(function(deskChild) {
                        deskChild.parentID = desk;
                        var childId = Entities.addEntity(deskChild);
                        if (deskChild.name.indexOf("Desk Image") > -1) {
                            deskImage = childId;
                        }
                    });
                }
            });

            podMaterials.forEach(function(podMaterial) {
                podMaterial.parentID = currentPodID;
                var id = Entities.addEntity(podMaterial);
                if (podMaterial.name.indexOf("Window Tint Material") > -1) {
                    podMaterial.parentMaterialName = "",
                    podWindowTintMaterial = id;
                } else if (podMaterial.name.indexOf("Accent Material") > -1) {
                    podAccentMaterial = id;
                }
            });

            chairs.forEach(function(chair) {
                chair.parentID = currentPodID;
                var index = chair.name.substr(chair.name.length -1);
                var id = Entities.addEntity(chair);
                if (sitCubes[index]) {
                    sitCubes[index].parentID = id;
                    Entities.addEntity(sitCubes[index]);
                }
            });
            currentPodPreferences = CURRENT_POD_PREFERENCES_DEFAULT;
        },

        /* Check each item in the passed in preferences against the current pod entity preferences. If any changes are 
            being requested, update the entities with those changes */
        updatePod: function(entityID, params) {
            print("UPDATE POD: ", params[0]);
            var personalPodSettings = JSON.parse(params[0]);
            if (personalPodSettings.deskImageURL !== currentPodPreferences.deskImageURL) {
                Entities.editEntity(deskImage, { imageURL: personalPodSettings.deskImageURL });
            }
            if (personalPodSettings.wallImageURL !== currentPodPreferences.wallImageURL) {
                Entities.editEntity(wallImage, { imageURL: personalPodSettings.wallImageURL });
            }
            if (personalPodSettings.roomAccentColor !== currentPodPreferences.roomAccentColor) {
                var accentColor = _this.rgbConversion(personalPodSettings.roomAccentColor);
                var accentMaterialData = DEFAULT_ACCENT_MATERIAL_DATA;
                accentMaterialData.materials.albedo = accentColor;
                Entities.editEntity(podAccentMaterial, { materialData: JSON.stringify(accentMaterialData) });
            }
            if (personalPodSettings.lightColor !== currentPodPreferences.lightColor) {
                Entities.editEntity(podLight, { color: personalPodSettings.lightColor });
            }
            if (personalPodSettings.windowTint !== currentPodPreferences.windowTint) {
                if (personalPodSettings.windowTint) {
                    Entities.editEntity(podWindowTintMaterial, { parentMaterialName: "[mat::Glass]" });
                } else {
                    Entities.editEntity(podWindowTintMaterial, { parentMaterialName: "" });
                }
            }
            currentPodPreferences = personalPodSettings;
        },

        /* Send the pod owner data back to the pod panel client script of the user who requested this info */
        getOwnerInfo: function(id, clientSessionIDParams) {
            var clientSessionID = clientSessionIDParams[0];
            Entities.callEntityClientMethod(clientSessionID, _this.entityID, 'ownerInfoReceived', 
                [podOwnerUsername, podOwnerDisplayName]);
        },

        /* A user has requested to own or release this pod. If this a release request and the user owns the pod, release it 
            and change it back to the default pod. If this a request to own the pod and the pod does not have a current owner,
            set the current owner to this user and update the pod with their preferences which were passed in. In any case,
            send the pod ownership info back to the pod panel client script for this user after any changes have been made.
            OWNER INFO PARAMS:
            0: (string) client session ID
            1: (string) user name
            2: (string) user display name
            3: (boolean) releasing the pod
            4: (string) user pod preferences
        */
        setOwnerInfo: function(id, ownerInfoParams) {
            print("SET OWNER INFO: ", JSON.stringify(ownerInfoParams));
            if (ownerInfoParams[3] === "true") {
                print("POD RELEASE ATTEMPT. CURRENT USERNAME: ", podOwnerUsername, " MY USERNAME: ", ownerInfoParams[1]);
                if (ownerInfoParams[1] === podOwnerUsername) {
                    podOwnerUsername = null;
                    podOwnerDisplayName = null;
                    print("I AM THE SERVER AND I RELEASE YOU POD");
                    _this.changeContentSet(_this.entityID, [DEFAULT_PRESET_NAME]);
                    currentPodPreferences = CURRENT_POD_PREFERENCES_DEFAULT;
                }
            } else {
                print("POD CLAIM ATTEMPT");
                if (!podOwnerUsername) {
                    print("SUCCESS! MY POD! POD OWNER USERNAME IS ", ownerInfoParams[2]);
                    podOwnerUsername = ownerInfoParams[1];
                    podOwnerDisplayName = ownerInfoParams[2];
                    _this.updatePod(_this.entityID, [ownerInfoParams[4]]);
                }
            }
            Entities.callEntityClientMethod(ownerInfoParams[0], _this.entityID, 'ownerInfoReceived', 
                [podOwnerUsername, podOwnerDisplayName]);
        },

        /* A user has left the pod zone. If this user owns the pod, set a timer for 2 hours after which the 
            pod will be released */
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
                podOwnerUsername = null;
                podOwnerDisplayName = null;
                podReleaseTimeout = null;
            }, TWO_HOURS_MS);
        },

        /* A user has entered the pod zone. If this user owns the pod, clear the release timer */
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

        /* Delete children of this panel by deleting the pod */
        unload: function() {
            Entities.deleteEntity(currentPodID);
        }
    };

    return new PodPanelServer();
});
