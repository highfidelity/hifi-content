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

    var DEBUG = true;

    // Remotely callable
    // Resolves heartbeat called from sitClient
    function heartbeatResponse() {
        if (DEBUG) {
            console.log("sitServer.js: Heartbeat reply received!");
        }
        // Called by remote client script
        // indicating avatar is still sitting in chair
        if (_this.heartbeatRequestTimeout) {
            Script.clearTimeout(_this.heartbeatRequestTimeout);
            _this.heartbeatRequestTimeout = false;
        }
        if (_this.nextHeartbeatTimeout) {
            Script.clearTimeout(_this.nextHeartbeatTimeout);
            _this.nextHeartbeatTimeout = false;
        }
        _this.nextHeartbeatTimeout = Script.setTimeout(sendHeartbeatRequest, HEARTBEAT_INTERVAL_TIME_MS);
    }


    function sendHeartbeatRequest() {
        _this.nextHeartbeatTimeout = false;

        if (_this.isOccupied) {
            if (DEBUG) {
                console.log("sitServer.js: heartbeat: `isOccupied` is set to `true`. Sending heartbeatRequest to sitting client...");
            }

            Entities.callEntityClientMethod(
                _this.currentClientSessionID,
                _this.entityID,
                "heartbeatRequest"
            );

            if (_this.heartbeatRequestTimeout) {
                Script.clearTimeout(_this.heartbeatRequestTimeout);
                _this.heartbeatRequestTimeout = false;
            }
    
            // If the heartbeatRequest call to the client script does not return heartbeatResponse
            // Will open the chair to other avatars to sit
            _this.heartbeatRequestTimeout = Script.setTimeout(function () {
                if (DEBUG) {
                    console.log("sitServer.js: Heartbeat request timed out! Resetting seat occupied status...");
                }
                _this.heartbeatRequestTimeout = false;
                // Seat is not occupied
                _this.isOccupied = false;
                _this.currentClientSessionID = false;

                // FIXME: This won't restore the sit overlay for other users.
            }, HEARTBEAT_TIMEOUT_MS);
        } else {
            if (DEBUG) {
                console.log("sitServer.js: We went to send a heartbeat, but the seat wasn't occupied. Aborting...");
            }

            _this.currentClientSessionID = false;
            
            if (_this.nextHeartbeatTimeout) {
                Script.clearTimeout(_this.nextHeartbeatTimeout);
                _this.nextHeartbeatTimeout = false;
            }
            if (_this.heartbeatRequestTimeout) {
                Script.clearTimeout(_this.heartbeatRequestTimeout);
                _this.heartbeatRequestTimeout = false;
            }
        }
    }

    // Remotely callable
    // Called from client to check if chair is occupied
    // If seat is not occupied, server script calls the client method that begins the sit down process
    var HEARTBEAT_INTERVAL_TIME_MS = 10000; // ms
    var HEARTBEAT_TIMEOUT_MS = 2500; // ms
    function onMousePressOnEntity(id, param) {
        if (DEBUG) {
            console.log("sitServer.js: Entering onMousePressOnEntity()..");
        }
        if (!_this.isOccupied) {
            if (DEBUG) {
                console.log("sitServer.js: `isOccupied` is set to `false`");
            }
            _this.currentClientSessionID = param[0];
            _this.isOccupied = true;

            Entities.callEntityClientMethod(
                _this.currentClientSessionID,
                _this.entityID,
                "checkBeforeSitDown"
            );

            if (_this.nextHeartbeatTimeout) {
                Script.clearTimeout(_this.nextHeartbeatTimeout);
                _this.nextHeartbeatTimeout = false;
            }
            
            sendHeartbeatRequest();
        }
    }


    // Remotely callable
    // Called from client to open the chair to other avatars
    function onStandUp(id, params) {
        if (DEBUG) {
            console.log("sitServer.js: Entering `onStandUp()` for seat ID: " + id + "...");
        }

        _this.isOccupied = false;
        _this.currentClientSessionID = false;
        if (_this.nextHeartbeatTimeout) {
            Script.clearTimeout(_this.nextHeartbeatTimeout);
            _this.nextHeartbeatTimeout = false;
        }
        if (_this.heartbeatRequestTimeout) {
            Script.clearTimeout(_this.heartbeatRequestTimeout);
            _this.heartbeatRequestTimeout = false;
        }

        if (DEBUG) {
            console.log("Calling 'createClickToSitOverlay' on entity " + id + " for all avatars...");
        }
        if (_this.isOccupied === false) {
            for (var i = 0; i < params.length; i++) {
                Entities.callEntityClientMethod(
                    params[i],
                    _this.entityID,
                    "createClickToSitOverlay"
                );
            }
        }
    }


    // Remotely callable
    // Remove sittable local entities from every client in range passed in by sitClient
    function removeThisSittableOverlayForEveryoneElse(id, params) {
        if (DEBUG) {
            console.log("sitServer.js: Calling `deleteClickToSitOverlay()` on entity " + id + " for all avatars...");
        }
        for (var i = 0; i < params.length; i++) {
            Entities.callEntityClientMethod(
                params[i],
                _this.entityID,
                "deleteClickToSitOverlay"
            );
        }
    }


    // Preload entity lifetime method
    function preload(id) {
        _this.entityID = id;
        _this.isOccupied = false;
    }


    // Unload entity lifetime method
    function unload() {
        _this.isOccupied = false;
        _this.currentClientSessionID = false;
        if (_this.nextHeartbeatTimeout) {
            Script.clearTimeout(_this.nextHeartbeatTimeout);
            _this.nextHeartbeatTimeout = false;
        }
        if (_this.heartbeatRequestTimeout) {
            Script.clearTimeout(_this.heartbeatRequestTimeout);
            _this.heartbeatRequestTimeout = false;
        }
    }


    // Constructor
    var _this = null;
    function SitServer() {
        _this = this;
        this.isOccupied = false;
        this.entityID = null;
        this.currentClientSessionID = null;
        this.nextHeartbeatTimeout = null;
        this.heartbeatRequestTimeout = null;
        this.canSitZoneID = false;
    }


    // Entity methods
    SitServer.prototype = {
        remotelyCallable: [
            "onMousePressOnEntity",
            "onStandUp",
            "heartbeatResponse",
            "removeThisSittableOverlayForEveryoneElse"
        ],
        preload: preload,
        heartbeatResponse: heartbeatResponse,
        onMousePressOnEntity: onMousePressOnEntity,
        onStandUp: onStandUp,
        removeThisSittableOverlayForEveryoneElse: removeThisSittableOverlayForEveryoneElse,
        unload: unload
    };

    return new SitServer();
});