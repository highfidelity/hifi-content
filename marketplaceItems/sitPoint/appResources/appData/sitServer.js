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
//

/* globals Entities Script */

(function() {

    var isOccupied;
    var entityID = null;
    var currentClientSessionID = null;

    var TEN_SECONDS = 10000;
    var ONE_SECOND = 1000;
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