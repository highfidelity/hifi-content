//
// sitServer.js
//
// Created by Robin Wilson 1/17/2019
//
// Copyright 2019 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals Entities Script */

(function () {
    var DEBUG = false;

    // Remotely callable
    // Resolves heartbeat called from sitClient
    function heartbeatResponse() {
        if (DEBUG) {
            console.log("sitServer.js: " + _this.entityID + ": Heartbeat reply received!");
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
                console.log("sitServer.js: " + _this.entityID + ": heartbeat: `isOccupied` is set to `true`. Sending heartbeatRequest to sitting client...");
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
                    console.log("sitServer.js: " + _this.entityID + ": Heartbeat request timed out! Resetting seat occupied status...");
                }
                _this.heartbeatRequestTimeout = false;
                // Seat is not occupied
                _this.isOccupied = false;
                _this.currentClientSessionID = false;

                // FIXME: This won't restore the sit overlay for other users.
            }, HEARTBEAT_TIMEOUT_MS);
        } else {
            if (DEBUG) {
                console.log("sitServer.js: " + _this.entityID + ": We went to send a heartbeat, but the seat wasn't occupied. Aborting...");
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

    function requestSitData(id, args) {
        var requestingID = args[0];

        if (DEBUG) {
            console.log("sitServer.js: " + _this.entityID + ": Request for sit data received from:" + requestingID);
        }

        var replyData = {
            "isOccupied": _this.isOccupied
        }

        replyData = JSON.stringify(replyData);

        Entities.callEntityClientMethod(
            requestingID,
            _this.entityID,
            "requestSitDataReply",
            [replyData]
        );
    }

    // Remotely callable
    // Called from client to check if chair is occupied
    // If seat is not occupied, server script calls the client method that begins the sit down process
    var HEARTBEAT_INTERVAL_TIME_MS = 10000; // ms
    var HEARTBEAT_TIMEOUT_MS = 2500; // ms
    function onMousePressOnEntity(id, param) {
        if (DEBUG) {
            console.log("sitServer.js: " + _this.entityID + ": Entering onMousePressOnEntity()..");
        }
        if (!_this.isOccupied) {
            if (DEBUG) {
                console.log("sitServer.js: " + _this.entityID + ": `isOccupied` is set to `false`");
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
        }
    }


    // Remotely callable
    // Called from client to open the chair to other avatars
    function onStandUp(id, params) {
        if (DEBUG) {
            console.log("sitServer.js: " + _this.entityID + ": Entering `onStandUp()` for seat ID: " + id + "...");
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
            console.log("sitServer.js: " + _this.entityID + ": Calling `createClickToSitOverlay()` for all avatars...");
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
    function afterBeginSit(id, params) {
        if (DEBUG) {
            console.log("sitServer.js: " + _this.entityID + ": Calling `deleteAllClickToSitOverlays()` for all avatars, then sending heartbeat request...");
        }
        for (var i = 0; i < params.length; i++) {
            Entities.callEntityClientMethod(
                params[i],
                _this.entityID,
                "deleteAllClickToSitOverlays"
            );
        }
            
        sendHeartbeatRequest();
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
    }


    // Entity methods
    SitServer.prototype = {
        remotelyCallable: [
            "requestSitData",
            "onMousePressOnEntity",
            "onStandUp",
            "heartbeatResponse",
            "afterBeginSit"
        ],
        preload: preload,
        requestSitData: requestSitData,
        heartbeatResponse: heartbeatResponse,
        onMousePressOnEntity: onMousePressOnEntity,
        onStandUp: onStandUp,
        afterBeginSit: afterBeginSit,
        unload: unload
    };

    return new SitServer();
});