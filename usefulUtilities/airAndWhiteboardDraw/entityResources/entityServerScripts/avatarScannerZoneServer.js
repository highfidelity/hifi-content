//
//  avatarScannerZoneServer.js
//
//  created by Rebecca Stankus on 03/19/19
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _this;

    var AvatarScannerZone = function() {
        _this = this;
    };

    AvatarScannerZone.prototype = {
        remotelyCallable: ['createAvatarCopy'],
        /* ON PRELOAD: Save a reference to this */
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        /*  */
        createAvatarCopy: function(id, params) {
            print("CREATING AVATAR COPY OF ", params[0], " AT ", params[1]);
            Entities.addEntity({
                type: 'Model',
                name: "Avatar Scanner Copy",
                modelURL: params[0],
                position: JSON.parse(params[1]),
                lifetime: 300, // backup just in case
            });
        },

        /* ON UNLOADING THE SCRIPT: Make sure the avatar leaves the zone so extra entities are deleted and intervals ended */
        unload: function(){
        }
    };

    return new AvatarScannerZone();
});
