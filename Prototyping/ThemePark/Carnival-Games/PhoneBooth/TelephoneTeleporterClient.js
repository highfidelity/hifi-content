//
//  TelephoneTeleporterClient.js
//
//  Created by Liv Erickson on 12/11/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
(function(){
    var TELEPORTER_CHANNEL = "UnleashTheTeleporter";    
    var LOCATION_HREF = "hifi://dev-content";
    var TIMEOUT = 100000;

    var canTeleport = false;
    var TelephoneTeleporterClient = function() {
    
    };

    var disableTeleport = function() {
        canTeleport = false;
    };

    var enableTeleportMode = function(){
        canTeleport = true;
        Script.setTimeout(disableTeleport, TIMEOUT);
    };

    TelephoneTeleporterClient.prototype = {
        preload: function(entityID) {
            Messages.subscribe(TELEPORTER_CHANNEL);
            Messages.messageReceived.connect(enableTeleportMode);
        },
        unload: function() {
            Messages.messageReceived.disconnect(enableTeleportMode);
        },
        startNearGrab: function() {
            if (canTeleport) {
                Window.location.handleLookupString(LOCATION_HREF);
            }
        }
    };
    return new TelephoneTeleporterClient();
});
