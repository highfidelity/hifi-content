//
//  spawnAttachmentRemovalZone.js
//
//  Created by Rebecca Stankus on 9/28/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This script creates a zone where avatar entities will be deleted if they are attached.

(function () {
    var ENTITY_IMPORT = Script.require('https://hifi-content.s3.amazonaws.com/rebecca/entityImport.js');
    var JSON_URL = "https://hifi-content.s3.amazonaws.com/rebecca/attachmentRemovalZone/detachmentZone.json";

    // get position in front of avatar for laundry basket
    function getPosition() {
        var direction = Quat.getFront(MyAvatar.orientation);
        var distance = 5;
        var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
        var distanceToFloor = 1.1;
        position.y -= distanceToFloor;
        return position;
    }

    // import JSON data and lock items
    var entityTree = _entityImport.importEntitiesJSON(JSON_URL, {
        position: getPosition()
    });

    var laundryBasketParts = _entityImport.createEntitiesFromTree([entityTree])[0].childEntities;

    Script.scriptEnding.connect(cleanup);
})();
