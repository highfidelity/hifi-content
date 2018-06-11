//
// busTriggersUnblockPathByCafe.js
// 
// Created by Rebecca Stankus on 03/07/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {
    var AMBULANCE_BLOCKING_PATH_BY_CAFE = "{3f1e4501-622d-44c9-a353-7278a98b2142}";
    
    this.enterEntity = function() {
        if (Entities.getEntityProperties(AMBULANCE_BLOCKING_PATH_BY_CAFE,'visible').visible) {
            Entities.editEntity(AMBULANCE_BLOCKING_PATH_BY_CAFE, {
                visible: false,
                collisionless: true
            });
        }
    };
});
