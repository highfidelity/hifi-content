//
// sitServer.js
//
// Created by Robin Wilson 1/17/2019
//
// Copyright 2017 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
// 
// sitServer.js is the gate to allow an avatar to sit. Multiple avatars can not sit in the same chair.
// Spawns the canSitZone per chair
//

/* globals Entities Script */

(function () {

    var DEBUG = false;

    // Remotely callable
    // Resolves heartbeat called from sitClient
    function checkResolved() {
        // Called by remote client script
        // indicating avatar is still sitting in chair
        _this.resolved = true;
    }

    // Remotely callable
    // Called from client to check if chair is occupied
    // If seat is not occupied, server script calls the client method that begins the sit down process
    var HEARTBEAT_INTERVAL_TIME_MS = 10000; // ms
    var RESOLVED_TIMEOUT_TIME_MS = 1000; // ms
    function onSitDown(id, param) {
        if (DEBUG) {
            console.log("server onSitDown");
        }
        if (_this.isOccupied === false) {
            if (DEBUG) {
                console.log("server isOccupied false");
            }
            _this.currentClientSessionID = param[0];
            _this.isOccupied = true;

            Entities.callEntityClientMethod(
                _this.currentClientSessionID,
                _this.entityID,
                "startSitDown"
            );

            // Every 10 seconds will check the client that was sitting in the chair
            _this.heartbeatInterval = Script.setInterval(function () {
                if (DEBUG) {
                    console.log("server heartbeat");
                }
                if (_this.isOccupied) {
                    if (DEBUG) {
                        console.log("server isOccupied");
                    }
                    Entities.callEntityClientMethod(
                        _this.currentClientSessionID,
                        _this.entityID,
                        "check"
                    );
            
                    // If the check call to the client script does not return checkResolved
                    // Will open the chair to other avatars to sit
                    Script.setTimeout(function () {
                        if (_this.resolved === true) {
                            // Seat is occupied
                            _this.resolved = false;
                        } else {
                            // Seat is not occupied
                            _this.isOccupied = false;
                            _this.currentClientSessionID = false;
                        }
                    }, RESOLVED_TIMEOUT_TIME_MS);
                }
            }, HEARTBEAT_INTERVAL_TIME_MS);
        }
    }


    // Remotely callable
    // Called from client to open the chair to other avatars
    function onStandUp() {
        _this.isOccupied = false;
        _this.currentClientSessionID = false;
        if (_this.heartbeatInterval) {
            Script.clearInterval(_this.heartbeatInterval);
            _this.heartbeatInterval = false;
        }
    }


    // Remotely callable
    // Remove sittable local entities from every client in range passed in by sitClient
    function removeAllOtherSittableOverlays(id, params) {
        for (var i = 0; i < params.length; i++) {
            Entities.callEntityClientMethod(
                params[i],
                _this.entityID,
                "onLeaveCanSitZone"
            );
        }
    }


    // Remotely callable
    // Add sittable local entities for this chair to every client in range passed in by sitClient
    function addAllOtherSittableOverlays(id, params) {
        if (DEBUG) {
            console.log("ADD ALL OTHER SITTABLE OVERLAYS");
        }
        if (_this.isOccupied === false) {
            for (var i = 0; i < params.length; i++) {
                if (DEBUG) {
                    console.log("avatar1");
                }
                Entities.callEntityClientMethod(
                    params[i],
                    _this.entityID,
                    "onEnterCanSitZone"
                );
            }
        }
    }

    // #region CAN SIT ZONE

    // Create can sit zone
    var CAN_SIT_M = 5;
    function createCanSitZone() {
        var properties = Entities.getEntityProperties(_this.entityID);
        _this.canSitZoneID = Entities.addEntity({
            name: "canSitZone-" + _this.entityID,
            type: "Zone",
            shapeType: "sphere",
            position: properties.position,
            parentID: _this.entityID,
            script: Script.resolvePath("./resources/canSitZoneClient.js") + "?" + Math.random(),
            serverScripts: Script.resolvePath("./resources/empty.js"),
            locked: false,
            dimensions: { x: CAN_SIT_M, y: CAN_SIT_M, z: CAN_SIT_M },
            keyLightMode: "inherit",
            interactive: false
        });
    }

    // Delete zone
    function deleteCanSitZone() {
        if (_this.canSitZoneID) {
            Entities.deleteEntity(_this.canSitZoneID);
            _this.canSitZoneID = false;
        }
    }

    // #endregion CAN SIT ZONE

    /* Check children of the sit cube to make sure there is only one zone. If more are found, delete them */
    function checkForExtraZones() {
        var canSitZones = [];
        Entities.getChildrenIDs(_this.entityID).forEach(function(childOfSitCube) {
            var name = Entities.getEntityProperties(childOfSitCube, 'name').name;
            if (name && name.indexOf("canSitZone") > -1) {
                canSitZones.push(childOfSitCube);
            }
        });
        if (canSitZones.length > 1) {
            canSitZones.pop();
            canSitZones.forEach(function(canSitZone) {
                Entities.deleteEntity(canSitZone);
            });
        }
    }

    /* Set a random timeout with exponential growth to check for extra zones */
    var ONE_SECOND_MS = 1000;
    var ONE_TENTH_SECOND_MS = 100;
    var EXPONENT = 2;
    var timeUntilNextSound = Math.floor((Math.random() * ONE_SECOND_MS) + ONE_TENTH_SECOND_MS);
    function setNextTimeout() {
        timeUntilNextSound *= EXPONENT;
        Script.setTimeout(function() {
            checkForExtraZones();
            setNextTimeout();
        }, timeUntilNextSound);
    }
    
    // Preload entity lifetime method
    function preload(id) {
        _this.entityID = id;
        _this.isOccupied = false;
        _this.resolved = false;
        createCanSitZone();
        setNextTimeout();
    }


    // Unload entity lifetime method
    function unload() {
        _this.isOccupied = false;
        if (_this.heartbeatInterval) {
            Script.clearInterval(_this.heartbeatInterval);
            _this.heartbeatInterval = false;
        }
        deleteCanSitZone();
    }


    // Constructor
    var _this = null;
    function SitServer() {
        _this = this;
        this.isOccupied = false;
        this.entityID = null;
        this.currentClientSessionID = null;
        this.resolved = false;
        this.heartbeatInterval = null;
        this.canSitZoneID = false;
    }


    // Entity methods
    SitServer.prototype = {
        remotelyCallable: [
            "onSitDown",
            "onStandUp",
            "checkResolved",
            "removeAllOtherSittableOverlays",
            "addAllOtherSittableOverlays"
        ],
        preload: preload,
        checkResolved: checkResolved,
        onSitDown: onSitDown,
        onStandUp: onStandUp,
        removeAllOtherSittableOverlays: removeAllOtherSittableOverlays,
        addAllOtherSittableOverlays: addAllOtherSittableOverlays,
        unload: unload
    };

    return new SitServer();
});