//
//  highlight.js
//
//  Created by Rebecca Stankus on 9/11/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This script creates highlighting effect
/* globals utils, Selection */

(function () {
    var _this = this;
    var prevID = 0;
    var listName = "contextOverlayHighlightList";
    var listType = "entity";

    _this.startNearGrab = function(entityID){
        if (prevID !== entityID) {
            Selection.addToSelectedItemsList(listName, listType, entityID);
            prevID = entityID;
        }
    };
    
    _this.releaseGrab = function(entityID){
        if (prevID !== 0) {
            Selection.removeFromSelectedItemsList("contextOverlayHighlightList", listType, prevID);
            prevID = 0;
        }
    };


    var cleanup = function(){
        Entities.findEntities(MyAvatar.position, 1000).forEach(function(entity) {
            try {
                Selection.removeListFromMap(listName);
            } catch (e) {
                print("Error cleaning up.");
            }
        }); 
    };

    Script.scriptEnding.connect(cleanup);
});
