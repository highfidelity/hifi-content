//
//  userLocationTextLocalEntity.js
//
//  Created by Zach Fox on 2019-04-02
//  Copyright 2019 High Fidelity, Inc.
//
//  See accompanying README.md for usage instructions.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function () {
    this.mousePressOnEntity = function(entityID, event) {
        if (!event.button === "Primary") {
            return;
        }

        var parentID = Entities.getEntityProperties(entityID, ["parentID"]).parentID;
        Entities.callEntityMethod(parentID, "mousePressOnEntity", event);
    };
});
