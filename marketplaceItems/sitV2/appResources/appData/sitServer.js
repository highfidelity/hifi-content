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
//

/* globals Entities Script */

(function() {
    var HEARTBEAT_INTERVAL_TIME_MS = 10000; // ms
    var RESOLVED_TIMEOUT_TIME_MS = 1000; // ms
    
    function preload(id) {
        _this.entityID = id;
        _this.isOccupied = false;
        _this.resolved = false;

        // Every 10 seconds will check the client that was sitting in the chair
        _this.heartbeatInterval = Script.setInterval(function () {
            if (_this.isOccupied) {
                checkClient();
            }
        }, HEARTBEAT_INTERVAL_TIME_MS);
    }

    function checkResolved() {
        // Called by remote client script
        // indicating avatar is still sitting in chair
        _this.resolved = true;
    }

    // Called from client to check if chair is occupied
    // If seat is not occupied, server script calls the client method _this begins the sit down process
    function onSitDown(id, param) {
        if (_this.isOccupied === false){
            _this.currentClientSessionID = param[0];
            _this.isOccupied = true;

            Entities.callEntityClientMethod(
                param[0], 
                _this.entityID, 
                "startSitDown"
            );
        }
    }
    
    // Called from client to open the chair to other avatars
    function onStandUp() {
        _this.isOccupied = false;
    }

    function unload() {
        _this.isOccupied = false;
        Script.clearInterval(_this.heartbeatInterval);
    }


    var _this = null;
    function SitServer() {
        _this = this;
        this.isOccupied = null;
        this.entityID = null;
        this.currentClientSessionID = null;
        this.resolved = false;
        this.heartbeatInterval = null;
    }

    function checkClient() {
        Entities.callEntityClientMethod(
            _this.currentClientSessionID, 
            _this.entityID, 
            "check"
        );

        // If the check call to the client script does not return checkResolved
        // Will open the chair to other avatars to sit
        Script.setTimeout(function () {
            if (_this.resolved === true){
                // Seat is occupied
                _this.resolved = false;
            } else {
                // Seat is not occupied
                _this.isOccupied = false;
                _this.currentClientSessionID = null;
            }
        }, RESOLVED_TIMEOUT_TIME_MS);
    }

    SitServer.prototype = {
        remotelyCallable: [
            "onSitDown",
            "onStandUp",
            "checkResolved"
        ],
        preload: preload,
        checkResolved: checkResolved,
        onSitDown: onSitDown,
        onStandUp: onStandUp,
        unload: unload
    };

    return new SitServer();
});