//  PinSetterEntity.js
//  Copyright 2016 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() { 

    var _this;

    function ResetButton() {
        _this = this;
    }

    ResetButton.prototype = {
        entityID: null,
        resetConsoleID: null,
        bowlingAlleyID: null,
        preload: function(entityID) { 
            Messages.subscribe("BowlingGameChannel");
            print('preload(' + entityID + ')');
            _this.entityID = entityID;
            _this.resetConsoleID  = Entities.getEntityProperties(_this.entityID, ['parentID']).parentID;
            _this.bowlingAlleyID = Entities.getEntityProperties(_this.resetConsoleID, ['parentID']).parentID; // get the bowling alley's parent ID     
        },
        unload: function() {
            // this would remove the pins when someone random is leaving (not what we intend)
            //    _this.clearPins();
        },
        clearPins: function() {
            Entities.findEntities(MyAvatar.position, 1000).forEach(function(entity) {
                try {
                    var userData = JSON.parse(Entities.getEntityProperties(entity, ['userData']).userData);
                    if (userData.isBowlingPin && userData.bowlingAlley === _this.bowlingAlleyID) {
                        print("Found pin, deleting it: " + entity);
                        Entities.deleteEntity(entity);
                    }
                } catch(e) {}
            }); 
        },
        startNearTrigger: function(entityID) {        
            Messages.sendMessage("BowlingGameChannel", JSON.stringify({
                type: "reset-hit",
                entityID: this.entityID 
            }));
        },
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                Messages.sendMessage("BowlingGameChannel", JSON.stringify({
                    type: "reset-hit",
                    entityID: this.entityID 
                }));
            }
        }
    };
    return new ResetButton();
});