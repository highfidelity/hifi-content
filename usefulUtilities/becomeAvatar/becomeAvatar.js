//
//  becomeAvatar.js
//
//  Created by Zach Fox on 2019-03-15
//  Copyright 2019 High Fidelity, Inc.
//
//  See accompanying README.md for usage instructions.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function () {
    function changeAvatar(entityID) {
        var modelURL = Entities.getEntityProperties(entityID, ["modelURL"]).modelURL;

        MyAvatar.skeletonModelURL = modelURL;
    }

    this.mousePressOnEntity = function(entityID, mouseEvent) {
        if (!mouseEvent.button === "Primary") {
            return;
        }
        changeAvatar(entityID);
    };
});
