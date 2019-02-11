// Happy-Kiosk_Button_Server.js
// 
// Further Edited by Milad Nazeri on 07/31-2018 from Zombie-Gate Button
// Edited by Rebecca Stankus on 03/07/2018
// from button1.js by Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// Controls visual actions of the button presses.  Is routed through the zone kiosk.

/* global Pointers */

(function () {

    // Helper Functions
    var Util = Script.require("../../Utilities/Helper.js?");

    // Log Setup
    var LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE, 
        LOG_CONFIG = {
            "Log_Enter": false,
            "Log_Update": false,
            "Log_Error": false,
            "Log_Value": false,
            "LOG_ARCHIVE": false
        },
        log = Util.Debug.log(LOG_CONFIG);

    // Init 
    var entityID,
        name,
        localPosition,
        kioskZoneID,
        self,
        onTexture,
        offTexture,
        rating = 1,
        materialEntity;

    // Const
    var BUTTON_PRESS_OFFSET = 0.04,
        DOWN_TIME_MS = 2000;

    // Collections
    var currentProperties = {},
        userData = {},
        userdataProperties = {},
        materialEntityProps = {
            type: "Material",
            materialURL: "materialData",
            parentMaterialName: "1",
            materialMappingMode: "uv",
            priority: 1,
            materialData: {}
        };

    // Create the proper texture name for the materialDataMaker
    function urlTextureMaker(buttonNumber){
        // url: "https://hifi-content.s3.amazonaws.com/alan/dev/button-2.fbx/button-2.fbm/button2-on.jpg"
        var BASE_URL = "https://hifi-content.s3.amazonaws.com/alan/dev/";
        var mainButtonName =
            BASE_URL +
            "button-" +
            buttonNumber +
            ".fbx/button-" +
            buttonNumber +
            ".fbm/button" +
            buttonNumber +
            "-"
        ;
        onTexture = mainButtonName + "on.jpg";
        offTexture = mainButtonName + "off.jpg";
    }

    // Create the proper materialData JSON string
    function materialDataMaker(type){
        var materialData = {
            materialVersion: 1,
            materials: {
                "model": "hifi_pbr"
            }
        };
        if (type === "on") {
            materialData.materials.albedoMap = onTexture;
            materialData.materials.emissiveMap = onTexture;
        } else {
            materialData.materials.albedoMap = offTexture;
            materialData.materials.emissiveMap = offTexture;
        }

        var materials =  JSON.stringify(materialData);
        return materials;
    }

    // Entity Definition
    function HappyKiosk_Button() {
        self = this;
    }

    HappyKiosk_Button.prototype = {
        remotelyCallable: [
            "pressButton"
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID, ["name", "parentID", "userData", "originalTextures"]);
            name = currentProperties.name;
            kioskZoneID = currentProperties.parentID;
            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                rating = userdataProperties.kiosk.rating;
                materialEntityProps.name = name + " Material Entity";
                materialEntityProps.parentID = entityID;
                urlTextureMaker(rating);                
                materialEntityProps.materialData = materialDataMaker("off");
                
                materialEntity = Entities.addEntity(materialEntityProps);
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }
        },
        lowerButton: function() {
            log(LOG_ENTER, name + " lowerButton");

            Entities.editEntity(entityID, {
                localPosition: Vec3.sum(localPosition, [0, -BUTTON_PRESS_OFFSET, 0])
            });
            
            Entities.editEntity(materialEntity, {
                materialData: materialDataMaker("on")
            });
        },
        pressButton: function(id, param) {
            log(LOG_ENTER, name + " pressButton");
            localPosition = Entities.getEntityProperties(entityID, ["localPosition"]).localPosition;
            Entities.callEntityMethod(kioskZoneID, "sendInput", [new Date(), rating]);

            self.lowerButton();
            Script.setTimeout(function() {
                self.raiseButton();
            }, DOWN_TIME_MS);
            return;
        },
        raiseButton: function() {
            log(LOG_ENTER, name + " raiseButton");
            var textureData = {};
            textureData["button" + rating + "-off"] = offTexture;
            localPosition = Entities.getEntityProperties(entityID, ["localPosition"]).localPosition;

            Entities.editEntity(entityID, {
                localPosition: Vec3.sum(localPosition, [0, BUTTON_PRESS_OFFSET, 0])
            });

            Entities.editEntity(materialEntity, {
                materialData: materialDataMaker("off")
            });

        },
        unload: function () {
            Entities.deleteEntity(materialEntity);
        }
    };

    return new HappyKiosk_Button();
});
