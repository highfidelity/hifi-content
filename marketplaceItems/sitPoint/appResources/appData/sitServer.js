//
// sitServer.js
//
// Created by Robin Wilson June 2018
//
// Copyright 2017 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// See sit.js for setup instructions. 
// SitServer.js is the gate to allow an avatar to sit. Multiple avatars can not sit in the same chair.
//

/* globals Entities Script */

(function() {

    var isOccupied;
    var entityID = null;
    var currentClientSessionID = null;

    var TEN_SECONDS = 10000; // ms
    var ONE_SECOND = 1000; // ms
    var resolved = false;

    var heartbeatInterval = null;

    function SitServer() {

    }

    function checkClient() {
        Entities.callEntityClientMethod(
            currentClientSessionID, 
            entityID, 
            "check"
        );

        // If the check call to the client script does not return checkResolved
        // Will open the chair to other avatars to sit
        Script.setTimeout(function (){
            if (resolved === true){
                // Seat is occupied
                resolved = false;
            } else {
                // Seat is not occupied
                isOccupied = false;
                currentClientSessionID = null;
            }
        }, ONE_SECOND);
    }

    SitServer.prototype = {

        remotelyCallable: [
            "onSitDown",
            "onStandUp",
            "checkResolved"
        ],

        preload: function (id) {
            entityID = id;
            isOccupied = false;
            resolved = false;

            // Every 10 seconds will check the client that was sitting in the chair
            heartbeatInterval = Script.setInterval(function () {
                if (isOccupied) {
                    checkClient();
                }
            }, TEN_SECONDS);
        },

        checkResolved: function () {
            // Called by remote client script
            // indicating avatar is still sitting in chair
            resolved = true;
        },

        // Called from client to check if chair is occupied
        // If seat is not occupied, server script calls the client method that begins the sit down process
        onSitDown: function (id, param) {
            var clientSessionID = param[0];

            if (isOccupied === false){

                currentClientSessionID = clientSessionID;
                isOccupied = true;

                Entities.callEntityClientMethod(
                    clientSessionID, 
                    entityID, 
                    "startSitDown"
                );
            }
        },

        // Called from client to open the chair to other avatars
        onStandUp: function () {
            isOccupied = false;
        },

        unload: function () {
            isOccupied = false;
            Script.clearInterval(heartbeatInterval);
        }
    };

    return new SitServer();
});