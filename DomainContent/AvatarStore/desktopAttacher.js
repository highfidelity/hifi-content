//
//  desktopAttacher.js
//
//  This is a script to provide desktop support for attaching attachments.
//
//  Created by Thijs Wenker on 10/10/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var _entityID;
    this.preload = function(entityID) {
        _entityID = entityID;
    };
    this.clickDownOnEntity = function() {
        print('clicked down on entity');
        var childIDs = Entities.getChildrenIDs(_entityID);
        if (childIDs.length === 0) {
            print('no child entities found..');
            return;
        }
        Entities.callEntityMethod(childIDs[0], 'desktopAttach');
        Entities.callEntityServerMethod(_entityID, 'spawnNewEntity'); // Replace child entity
    };
});
