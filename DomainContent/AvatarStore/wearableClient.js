//
//  wearableClient.js
//
//  Creates invisible clones to be used so people can attach entities without rez rights
//  Copyright 2017 High Fidelity, Inc.
//
//  Version 2: Requires Entities.callEntityClientMethod() functionality (RC 58 or later)
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _entityID;
    var Wearable = function () {
    
    };
    Wearable.prototype = {
        preload: function (entityID) {
            _entityID = entityID;
        },
        startNearGrab: function () {
            Entities.callEntityServerMethod(_entityID, 'spawnNewChild', [_entityID]);
            Entities.editEntity(_entityID, {
                'script' : Script.resolvePath('attachmentItemScript.js'),
                'serverScripts' : ""
            });     
        }
    };
    return new Wearable();
});
