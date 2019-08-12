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
        // Called by remote client script
        // indicating avatar is still sitting in chair
        _this.heartbeatValid = true;
    }

    // Remotely callable
    // Called from client to check if chair is occupied
    // If seat is not occupied, server script calls the client method that begins the sit down process
    var HEARTBEAT_INTERVAL_TIME_MS = 10000; // ms
    var HEARTBEAT_TIMEOUT_MS = 2500; // ms
    function onMousePressOnEntity(id, param) {
        if (DEBUG) {
            console.log("server onMousePressOnEntity");
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
                "checkBeforeSitDown"
            );

            if (_this.heartbeatInterval) {
                Script.clearInterval(_this.heartbeatInterval);
                _this.heartbeatInterval = false;
            }

            if (_this.heartbeatTimeout) {
                Script.clearTimeout(_this.heartbeatTimeout);
                _this.heartbeatTimeout = false;
            }

            // Every 10 seconds will heartbeatRequest the client that was sitting in the chair
            _this.heartbeatInterval = Script.setInterval(function () {
                if (DEBUG) {
                    console.log("server heartbeat");
                }
                if (_this.isOccupied) {
                    if (DEBUG) {
                        console.log("server isOccupied");
                    }

                    _this.heartbeatValid = false;

                    Entities.callEntityClientMethod(
                        _this.currentClientSessionID,
                        _this.entityID,
                        "heartbeatRequest"
                    );

                    if (_this.heartbeatTimeout) {
                        Script.clearTimeout(_this.heartbeatTimeout);
                        _this.heartbeatTimeout = false;
                    }
            
                    // If the heartbeatRequest call to the client script does not return heartbeatResponse
                    // Will open the chair to other avatars to sit
                    _this.heartbeatTimeout = Script.setTimeout(function () {
                        _this.heartbeatTimeout = false;

                        if (_this.heartbeatValid) {
                            // Seat is occupied
                            _this.heartbeatValid = false;
                        } else {
                            // Seat is not occupied
                            _this.isOccupied = false;
                            _this.currentClientSessionID = false;

                            // FIXME: This won't restore the sit overlay for other users.
                        }
                    }, HEARTBEAT_TIMEOUT_MS);
                } else {
                    if (_this.heartbeatInterval) {
                        Script.clearInterval(_this.heartbeatInterval);
                        _this.heartbeatInterval = false;
                    }
                    if (_this.heartbeatTimeout) {
                        Script.clearInterval(_this.heartbeatTimeout);
                        _this.heartbeatTimeout = false;
                    }
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
        if (_this.heartbeatTimeout) {
            Script.clearInterval(_this.heartbeatTimeout);
            _this.heartbeatTimeout = false;
        }
    }


    // Remotely callable
    // Remove sittable local entities from every client in range passed in by sitClient
    function removeThisSittableOverlayForEveryone(id, params) {
        for (var i = 0; i < params.length; i++) {
            Entities.callEntityClientMethod(
                params[i],
                _this.entityID,
                "deleteClickToSitOverlay"
            );
        }
    }


    // Remotely callable
    // Add sittable local entities for this chair to every client in range passed in by sitClient
    function addThisSittableOverlayForEveryone(id, params) {
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
                    "createClickToSitOverlay"
                );
            }
        }
    }  
    // Preload entity lifetime method
    function preload(id) {
        _this.entityID = id;
        _this.isOccupied = false;
        _this.heartbeatValid = false;
    }


    // Unload entity lifetime method
    function unload() {
        _this.isOccupied = false;
        if (_this.heartbeatInterval) {
            Script.clearInterval(_this.heartbeatInterval);
            _this.heartbeatInterval = false;
        }
        if (_this.heartbeatTimeout) {
            Script.clearInterval(_this.heartbeatTimeout);
            _this.heartbeatTimeout = false;
        }
    }


    // Constructor
    var _this = null;
    function SitServer() {
        _this = this;
        this.isOccupied = false;
        this.entityID = null;
        this.currentClientSessionID = null;
        this.heartbeatValid = false;
        this.heartbeatInterval = null;
        this.heartbeatTimeout = null;
        this.canSitZoneID = false;
    }


    // Entity methods
    SitServer.prototype = {
        remotelyCallable: [
            "onMousePressOnEntity",
            "onStandUp",
            "heartbeatResponse",
            "removeThisSittableOverlayForEveryone",
            "addThisSittableOverlayForEveryone"
        ],
        preload: preload,
        heartbeatResponse: heartbeatResponse,
        onMousePressOnEntity: onMousePressOnEntity,
        onStandUp: onStandUp,
        removeThisSittableOverlayForEveryone: removeThisSittableOverlayForEveryone,
        addThisSittableOverlayForEveryone: addThisSittableOverlayForEveryone,
        unload: unload
    };

    return new SitServer();
});