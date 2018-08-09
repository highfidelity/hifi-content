// GrabbableLifetime.js
//
// Copyright 2018 High Fidelity, Inc.
// Created by Robin Wilson 7/5/2018
//
// Set this script on a spawner for cloneable grabbable entities.
// Will set clone lifetime on pickup and on release to default values
// or by user specified values in userData.
// 
// To customize, add below property to userData object:
// 
// "lifetimeOnGrab": {
//     "pickup": <INT SECONDS> ,
//     "release": <INT SECONDS> 
// }
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {

    var LIFETIME_ON_PICKUP = 18;
    var LIFETIME_ON_RELEASE = 8;
    var PROPERTY_NAME = "lifetimeOnGrab";
    var DEBUG = true;

    function GrabbableLifetime() {
        this.entityID;
        this.pickupLifetime = LIFETIME_ON_PICKUP;
        this.releaseLifetime = LIFETIME_ON_RELEASE;
    }

    GrabbableLifetime.prototype = {

        preload: function (entityID) {

            this.entityID = entityID;
            var properties = Entities.getEntityProperties(this.entityID, ["name", "age", "userData"]);
            
            try {

                var userData = JSON.parse(properties.userData);
                print(JSON.stringify(userData));
                
                if (userData && userData[PROPERTY_NAME]) {
                    this.pickupLifetime = userData[PROPERTY_NAME].pickup || LIFETIME_ON_PICKUP;
                    this.releaseLifetime = userData[PROPERTY_NAME].release || LIFETIME_ON_RELEASE;
                }
                
            } catch (error) {
                console.error("Error parsing userData :", error);
            }
            
            if (properties.name && properties.name.indexOf("clone") !== -1){
                this.setAge(this.pickupLifetime, "preload");
            }

        },

        startNearGrab: function () {
            this.setAge(this.pickupLifetime, "startNearGrab");
        },

        releaseGrab: function () {
            this.setAge(this.releaseLifetime, "releaseGrab");
        },

        setAge: function(secondsToDespawn, functionName) {

            if (DEBUG) {
                this.printDebug("Start " + functionName);
            }

            var currentAge = Entities.getEntityProperties(this.entityID, "age").age;
            Entities.editEntity(this.entityID, { lifetime: currentAge + secondsToDespawn });
        
            if (DEBUG) {
                this.printDebug("End " + functionName);
            }

        },

        printDebug: function (message) {
            var debugProperties = Entities.getEntityProperties(this.entityID, ["lifetime"]);
            print(message + debugProperties.lifetime);
        }

    };

    return new GrabbableLifetime();

});