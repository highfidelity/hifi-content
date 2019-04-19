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
    
    var that = null;
    function SitServer() {
        that = this;
        this.isOccupied = null;
        this.entityID = null;
        this.currentClientSessionID = null;
        this.resolved = false;
        this.heartbeatInterval = null;
    }

    function checkClient() {
        Entities.callEntityClientMethod(
            that.currentClientSessionID, 
            that.entityID, 
            "check"
        );

        // If the check call to the client script does not return checkResolved
        // Will open the chair to other avatars to sit
        Script.setTimeout(function () {
            if (that.resolved === true){
                // Seat is occupied
                that.resolved = false;
            } else {
                // Seat is not occupied
                that.isOccupied = false;
                that.currentClientSessionID = null;
            }
        }, RESOLVED_TIMEOUT_TIME_MS);
    }

    SitServer.prototype = {

        remotelyCallable: [
            "onSitDown",
            "onStandUp",
            "checkResolved"
        ],

        preload: function (id) {
            that.entityID = id;
            that.isOccupied = false;
            that.resolved = false;

            // Every 10 seconds will check the client that was sitting in the chair
            that.heartbeatInterval = Script.setInterval(function () {
                if (that.isOccupied) {
                    checkClient();
                }
            }, HEARTBEAT_INTERVAL_TIME_MS);
        },

        checkResolved: function () {
            // Called by remote client script
            // indicating avatar is still sitting in chair
            that.resolved = true;
        },

        // Called from client to check if chair is occupied
        // If seat is not occupied, server script calls the client method that begins the sit down process
        onSitDown: function (id, param) {
            if (that.isOccupied === false){
                that.currentClientSessionID = param[0];
                that.isOccupied = true;

                Entities.callEntityClientMethod(
                    param[0], 
                    that.entityID, 
                    "startSitDown"
                );
            }
        },

        // Called from client to open the chair to other avatars
        onStandUp: function () {
            that.isOccupied = false;
        },

        unload: function () {
            that.isOccupied = false;
            Script.clearInterval(that.heartbeatInterval);
        }
    };

    return new SitServer();
});