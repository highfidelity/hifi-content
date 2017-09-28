//
//  laundry.js
//
//  Created by Rebecca Stankus on 9/28/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This script creates a laundry basket to get rid of attachments after trying them on.
(function () {
    var _entityImport = Script.require('https://hifi-content.s3.amazonaws.com/rebecca/entityImport.js');


    var jsonUrl = "https://hifi-content.s3.amazonaws.com/rebecca/Laundry/laundryBox.json";

    // get position in front of avatar for laundry basket
    function getPosition() {
        var direction = Quat.getFront(MyAvatar.orientation);
        var distance = 5;
        var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
        var distanceToFloor = 0.78;
        position.y -= distanceToFloor;
        return position;
    }

    // import JSON data and lock items
    var entityTree = _entityImport.importEntitiesJSON(jsonUrl, {
        position: getPosition()
    });

    var laundryBasketParts = _entityImport.createEntitiesFromTree([
        entityTree
    ])[0].childEntities;

    Script.scriptEnding.connect(cleanup);
})();
