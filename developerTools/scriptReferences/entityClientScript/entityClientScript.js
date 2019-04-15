//
// entityClientScript.js
//
// Adapted from script https://github.com/robin-k-wilson/hifi-dev-utils/blob/master/client_entity_all_events.js
// Updated by Robin Wilson 4/15/2019
//
// Generic client entity methods and signals that are triggered by mouse or controller interactions
// Use as a template for your client entity scripts
//
// Client entity scripts are run on a interface instance. Meaning each avatar connected
// to a domain have one instance of this script running locally and one client controls
// an entity at one time called "ownership over that entity".
// Best for physics changes.
//
// Copyright 2019 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var I_AM_STATIC_VARIABLE = 200;
    var _this = null;
    var _entityID = null;

    function Entity() {
        _this = this;
    }

    Entity.prototype = {
        // REQUIRED FUNCTIONS
        preload: function(entityID) {
            // runs when this script is refreshed or a
            // client connects to a domain where this entity is present
            _entityID = entityID;
        },

        unload: function() {
            // triggered when avatar leaves the domain where entity is present
            // clear any intervals
            // clear any listeners
            // reset anything else that needs to be
        },

        // EVENT LISTENERS FOR THE ENTITY

        // Entity Event Listener Notes: 
        //     For mouse/trigger click on an entity to do an action
        //         Use: startNearTrigger + startFarTrigger + clickReleaseOnEntity

        // MOUSECLICK METHODS - not triggered by controller
        // params are: entityID, event PointerEvent (https://docs.highfidelity.com/api-reference/globals#PointerEvent)
        // https://docs.highfidelity.com/api-reference/namespaces/entities#.clickDownOnEntity
        clickReleaseOnEntity: function(entityID, pointerEvent) {
            if (pointerEvent.isPrimaryButton) {} // will only work on left mouse click release event (see PointerEvent)
        },
        clickDownOnEntity: function(entityID, pointerEvent) {},
        holdingClickOnEntity: function(entityID, pointerEvent) {},
        
        mouseMoveOnEntity: function(entityID, pointerEvent) {},
        mousePressOnEntity: function(entityID, event) {},
        mouseReleaseOnEntity: function(entityID, event) {},
        mouseDoublePressOffEntity: function(pointerEvent) {},

        hoverEnterEntity: function(entityID, pointerEvent) {},
        hoverLeaveEntity: function(entityID, pointerEvent) {},
        hoverOverEntity: function(entityID, pointerEvent) {},

        // triggered when a script in a Web entity's web page script sends and event over hte script's eventbridge
        webEventReceived: function(entityID, message) {}, // https://docs.highfidelity.com/api-reference/namespaces/entities#.webEventReceived

        // COLLISION METHODS
        // Avatar collision with this entity
        leaveEntity: function(userID) {},
        enterEntity: function(userID) {}, // https://docs.highfidelity.com/api-reference/namespaces/entities#.enterEntity

        // Entity (idB) collision with this entity (idA)
        // Collision properties https://docs.highfidelity.com/api-reference/globals#Collision
        collisionWithEntity: function(idA, idB, collision) {}, // https://docs.highfidelity.com/api-reference/namespaces/entities#.collisionWithEntity

        // DELETE
        // triggered when entity is deleted
        deletingEntity: function(entityID) {},

        // CONTROLLER METHODS
        // params are: entityID, string "<"left" || "right">,<MyAvatar.UUID>" ex "left,userID"
        // https://docs.highfidelity.com/api-reference/namespaces/controller

        // Far Trigger Entity methods
        startFarTrigger: function(entityID, handUserID) {},
        continueFarTrigger: function(entityID, handUserID) {},
        stopFarTrigger: function(entityID, handUserID) {},

        // Near trigger Entity methods
        startNearTrigger: function(entityID, handUserID) {},
        continueNearTrigger: function(entityID, handUserID) {},
        stopNearTrigger: function(entityID, handUserID) {},

        // distanceGrab
        startDistanceGrab: function(entityID, handUserID) {},
        continueDistanceGrab: function(entityID, handUserID) {},

        // distanceGrab
        startNearGrab: function(entityID, handUserID) {},
        continueNearGrab: function(entityID, handUserID) {},

        // releases the trigger
        releaseGrab: function(entityID, handUserID) {},

        // Equip
        startEquip: function(entityID, handUserID) {},
        continueEquip: function(entityID, handUserID) {},
        releaseEquip: function(entityID, handUserID) {},
    }

    return new Entity();
});