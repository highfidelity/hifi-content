//
// entityClientScript.js
//
// Adapted from script https://github.com/robin-k-wilson/hifi-dev-utils/blob/master/client_entity_all_events.js
// Updated by Robin Wilson 4/15/2019
//
// Copyright 2019 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    // example static variable
    var I_AM_STATIC_VARIABLE = 200; 
    var that = null;

    function EntityClientScript() {
        that = this;
        // dynamic variables for each instance of the script
        this.entityID;
    }

    EntityClientScript.prototype = {
        // REQUIRED FUNCTIONS
        preload: function(entityID) {
            // runs when this script is refreshed or a
            // client connects to a domain where this entity is present
            that.entityID = entityID;
        },

        unload: function() {
            // triggered when avatar leaves the domain where entity is present
            // clear any intervals
            // clear any listeners
            // reset anything else that needs to be
        },

        // EVENT LISTENERS FOR THE ENTITY
        
        // Triggered by mouse only
        // params are: entityID, event PointerEvent (https://apidocs.highfidelity.com/global.html#PointerEvent)
        // https://apidocs.highfidelity.com/Entities.html#.clickDownOnEntity
        clickReleaseOnEntity: function(entityID, pointerEvent) {
            if (pointerEvent.isPrimaryButton) { // will only work on left mouse click release event (see PointerEvent)
                console.log("EntityClientScript: clickReleaseOnEntity");
            } 
        },
        clickDownOnEntity: function(entityID, pointerEvent) { console.log("EntityClientScript: clickDownOnEntity"); },
        holdingClickOnEntity: function(entityID, pointerEvent) { console.log("EntityClientScript: holdingClickOnEntity"); },
        
        // Triggered by mouse and controllers
        mouseMoveOnEntity: function(entityID, pointerEvent) { console.log("EntityClientScript: mouseMoveOnEntity"); },
        mousePressOnEntity: function(entityID, event) { console.log("EntityClientScript: mousePressOnEntity"); },
        mouseReleaseOnEntity: function(entityID, event) { console.log("EntityClientScript: mouseReleaseOnEntity"); },
        
        mouseDoublePressOffEntity: function(pointerEvent) { console.log("EntityClientScript: mouseDoublePressOffEntity"); },

        // Triggered by mouse and controllers
        hoverEnterEntity: function(entityID, pointerEvent) { console.log("EntityClientScript: hoverEnterEntity"); },
        hoverLeaveEntity: function(entityID, pointerEvent) { console.log("EntityClientScript: hoverLeaveEntity"); },
        hoverOverEntity: function(entityID, pointerEvent) { console.log("EntityClientScript: hoverOverEntity"); },

        // Triggered when a script in a Web entity's web page script sends and event over the script's eventbridge
        webEventReceived: function(entityID, message) { console.log("EntityClientScript: webEventReceived"); }, // https://apidocs.highfidelity.com/Entities.html#.webEventReceived

        // COLLISION METHODS
        // Avatar collision with this entity
        leaveEntity: function(userID) { console.log("EntityClientScript: leaveEntity"); },
        enterEntity: function(userID) { console.log("EntityClientScript: enterEntity"); }, // https://apidocs.highfidelity.com/Entities.html#.enterEntity

        // Entity (idB) collision with this entity (idA)
        // Collision properties https://apidocs.highfidelity.com/global.html#Collision
        collisionWithEntity: function(idA, idB, collision) { console.log("EntityClientScript: collisionWithEntity"); }, // https://apidocs.highfidelity.com/Entities.html#.collisionWithEntity

        // DELETE
        // triggered when entity is deleted
        deletingEntity: function(entityID) { console.log("EntityClientScript: deletingEntity"); },

        // CONTROLLER METHODS
        // params are: entityID, string "<"left" || "right">,<MyAvatar.UUID>" ex "left,userID"
        // https://apidocs.highfidelity.com/Controller.html

        // Far trigger Entity methods
        // Triggered by controllers only
        startFarTrigger: function(entityID, handUserID) { console.log("EntityClientScript: startFarTrigger"); },
        continueFarTrigger: function(entityID, handUserID) { console.log("EntityClientScript: continueFarTrigger"); },
        stopFarTrigger: function(entityID, handUserID) { console.log("EntityClientScript: stopFarTrigger"); },

        // Near trigger Entity methods
        // Triggered by controllers only
        startNearTrigger: function(entityID, handUserID) { console.log("EntityClientScript: startNearTrigger"); },
        continueNearTrigger: function(entityID, handUserID) { console.log("EntityClientScript: continueNearTrigger"); },
        stopNearTrigger: function(entityID, handUserID) { console.log("EntityClientScript: stopNearTrigger"); },
        
        // NearGrab
        // Triggered by controllers only
        startNearGrab: function(entityID, handUserID) { console.log("EntityClientScript: startNearGrab"); },
        continueNearGrab: function(entityID, handUserID) { console.log("EntityClientScript: continueNearGrab"); },
        continueDistanceGrab: function(entityID, handUserID) { console.log("EntityClientScript: continueDistanceGrab"); },
        
        // Triggered by mouse only
        startDistanceGrab: function(entityID, handUserID) { console.log("EntityClientScript: startDistanceGrab"); },

        // Triggered by mouse and controllers
        releaseGrab: function(entityID, handUserID) { console.log("EntityClientScript: releaseGrab"); },

        // Equip
        startEquip: function(entityID, handUserID) { console.log("EntityClientScript: startEquip"); },
        continueEquip: function(entityID, handUserID) { console.log("EntityClientScript: continueEquip"); },
        releaseEquip: function(entityID, handUserID) { console.log("EntityClientScript: releaseEquip"); },
    }

    return new EntityClientScript();
});