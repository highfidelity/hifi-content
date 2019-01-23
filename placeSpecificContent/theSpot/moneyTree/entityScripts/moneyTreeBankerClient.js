// moneyTreeBankerClient.js

//  Created by Mark Brosche on 11-8-2018
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* global EventBridge Users AccountServices Agent Avatar */

(function (){
    // get userData
    // spawn Overlays for clients with ID == giverID
    // delete after overlay after click event or after timer expires.
    // send data to google sheet
    var SECRETS = Script.require(Script.resolvePath('../moneyTreeURLs.json'));
    var MONEY_TREE_CHANNEL = SECRETS.OPERATOR_CHANNEL;
    var HALF_SECOND = 500;

    var _this,
        spawnerProperties,
        power,
        powerMaterial,
        userData,
        materialID,
        bankerID,
        powerOverlay,
        clicked,
        modelURL = Script.resolvePath("../resources/models/symbol-power.fbx");

    var MoneyTree = function(){
        _this = this;
    };

    MoneyTree.prototype = {

        preload: function(entityID){
            _this.entityID = entityID;
            _this.getEntityData();
            Messages.subscribe(MONEY_TREE_CHANNEL);
            Messages.messageReceived.connect(_this.moneyListener);
            Overlays.mousePressOnOverlay.connect(_this.mousePressOnOverlay);
            _this.spawnPowerOverlay();
        },
        
        moneyListener: function (channel, message, sender) {
            if (channel === MONEY_TREE_CHANNEL) {
                message = JSON.parse(message);
                if (message.type === 'tree power') {
                    power = message.state;
                    var material = _this.powerMaterial();
                    Entities.editEntity(materialID, material);                        
                } else if (message.type === 'delete power') {
                    _this.deleteOverlay();
                } else if (message.type === 'time') {
                    if (MyAvatar.sessionUUID === bankerID){
                        Window.announcement(message.message);
                    }
                } else if (message.type === 'coins') {
                    if (MyAvatar.sessionUUID === bankerID){
                        Window.announcement(JSON.stringify("Now spawning coins for " + message.giver));
                    }
                } else if (message.type === 'given') {
                    if (MyAvatar.sessionUUID === bankerID){
                        Window.announcement(JSON.stringify(message.receiver + " just got paid by the Money Tree."));
                    }
                }
            }
        },

        powerMaterial: function() {
            if (power){
                var materials = {
                    albedo: [0, 0.5, 0.5],
                    emissive: [0, 1, 0.5],
                    roughness: 0.1,
                    metallic: 1,
                    scattering: 0
                };
                return {
                    materialURL: "materialData",
                    materialData: JSON.stringify({
                        materialVersion: 1,
                        materials: materials
                    })
                };
            } else {
                materials = {
                    albedo: [0.5, 0, 0],
                    emissive: [1, 0.2, 0],
                    roughness: 0.1,
                    metallic: 1,
                    scattering: 0
                };
                return {
                    materialURL: "materialData",
                    materialData: JSON.stringify({
                        materialVersion: 1,
                        materials: materials
                    })
                };
            }
        },

        getEntityData: function() {     
            spawnerProperties = Entities.getEntityProperties(_this.entityID, ["position", "rotation", "userData", "parentID"]);
            if (!spawnerProperties.userData || spawnerProperties.userData === "{}") {
                print("spawner ", _this.entityID, " is missing user data.");
                return;
            }
            try {
                userData = JSON.parse(spawnerProperties.userData);
                bankerID = userData.bankerID;
                power = userData.power;
                // verify that settings are legit
            } catch (e) {
                print("Error in retrieving entity Data");
                return;
            }
        },

        deleteOverlay: function() {
            if (powerOverlay) {
                Overlays.deleteOverlay(powerOverlay);
                powerOverlay = null;
            }
            Entities.deleteEntity(powerMaterial);
        },

        spawnPowerOverlay: function() {
            if (MyAvatar.sessionUUID === bankerID){ 
                powerOverlay = Overlays.addOverlay("model", {
                    name: "POWER OVERLAY",
                    url: modelURL,
                    dimensions: { x: 0.75, y: 0.05, z: 0.75 },
                    position: { x: -19.8590, y: -8.2439, z: -10.9606 },
                    rotation: Quat.fromPitchYawRollDegrees(-90, 90, 0 ),
                    isSolid: true,
                    grabbable: true
                });  
                powerMaterial = _this.powerMaterial();
                materialID = Entities.addEntity({
                    name: "Power Button Material",
                    type: "Material",
                    parentID: powerOverlay,
                    materialURL: "materialData",
                    priority: 1,
                    userData: JSON.stringify({bankerID : bankerID}),
                    materialData: JSON.stringify({
                        materialVersion: 1,
                        materials: {
                            albedo: [0, 0, 0]
                        }
                    })
                });
                Entities.editEntity(materialID, powerMaterial);                      
            }
        },

        mousePressOnOverlay: function(id, event) {
            if (!clicked) {
                clicked = !clicked;
                if (id === powerOverlay && !power) {
                    console.log("clicked on overlay", power);
                    power = true;
                    Messages.sendMessage(MONEY_TREE_CHANNEL, JSON.stringify({
                        type: "tree power",
                        state: true
                    }));
                    var material = _this.powerMaterial();
                    Entities.editEntity(materialID, material);  
                } else if (id === powerOverlay && power) {
                    console.log("clicked on overlay", power);
                    power = false;
                    Messages.sendMessage(MONEY_TREE_CHANNEL, JSON.stringify({
                        type: "tree power",
                        state: false
                    }));
                    material = _this.powerMaterial();
                    Entities.editEntity(materialID, material);  
                }
            }
            Script.setTimeout(function(){
                clicked = !clicked;
            }, HALF_SECOND);
        },

        unload: function(){
            _this.deleteOverlay();
            Messages.unsubscribe(MONEY_TREE_CHANNEL);
            Messages.messageReceived.disconnect(_this.moneyListener);
        }
    };
    
    Messages.subscribe(MONEY_TREE_CHANNEL);
    return new MoneyTree;
});