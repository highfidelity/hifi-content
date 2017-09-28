//
//  spawnStockedShelf.js
//
//  Created by Rebecca Stankus on 8/28/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This script creates 600 items on shelves for the purposes of testing performance with a large number of nearby items

(function(){
    var _entityImport = Script.require('https://hifi-content.s3.amazonaws.com/rebecca/entityImport.js');


    var jsonUrl = "https://hifi-content.s3.amazonaws.com/rebecca/allShelves.json";

    // get position in front of avatar for stocked shelves
    function getPosition() {
        var direction = Quat.getFront(MyAvatar.orientation);
        var distance = 5;
        var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
        position.y -= 0.55;
        return position;
    }

    // import JSON data and lock items
    var entityTree = _entityImport.importEntitiesJSON(jsonUrl, {
        position: getPosition()
    }, {
        locked: true,
        name: "Test_Attach",
        script: "https://hifi-content.s3.amazonaws.com/liv/avatar_shopping_demo/attachmentItemScript.js"
    });

    var shelfEntities = _entityImport.createEntitiesFromTree([
        entityTree
    ])[0].childEntities;

    var cleanup = function(){
        Entities.findEntities(MyAvatar.position, 1000).forEach(function(entity) {
            try {
                var name = Entities.getEntityProperties(entity).name;
                if (name === "Test_Attach") {
                    Entities.editEntity(entity, {locked : false});
                    Entities.deleteEntity(entity);
                }
            } catch (e) {
                print("Error cleaning up.");
            }
        }); 
    };

    Script.scriptEnding.connect(cleanup);
})();
