//  PinSetterEntity.js
//  Copyright 2016 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() { 
    var TIMEOUT = 7000;
    var _this;
    var _canRez = true;

    function ResetButton() {
        _this = this;
    }

    ResetButton.prototype = {
        entityID: null,
        resetConsoleID: null,
        bowlingAlleyID: null,
        getPinJointLocation: function() {
            var entProperties = Entities.getEntityProperties(_this.bowlingAlleyID, ['position', 'rotation']);              
            print("Calling getPinJointLocation()");
            var jointIndex = Entities.getJointIndex(_this.bowlingAlleyID, 'pinLocatorJoint');
            var jointLocInObjectFrame =
            Entities.getAbsoluteJointTranslationInObjectFrame(_this.bowlingAlleyID, jointIndex);
            var jointLocInWorld = Vec3.sum(entProperties.position, Vec3.multiplyQbyV(entProperties.rotation, jointLocInObjectFrame)); 
            Messages.sendMessage("BowlingGameChannel", JSON.stringify({
                type: "get-pin-location", 
                location: jointLocInWorld 
            }));
            print("Sent pin location: " + jointLocInWorld);
        },
        getBallJointLocation: function() {
            var entProperties = Entities.getEntityProperties(_this.bowlingAlleyID, ['position', 'rotation']);              
            print("Calling getBallJointLocation");
            var ballJointIndex = Entities.getJointIndex(_this.bowlingAlleyID,
            'ballLocatorJoint');
            var jointLocInObjectFrame = Entities.getAbsoluteJointTranslationInObjectFrame(_this.bowlingAlleyID, ballJointIndex);
            var jointLocInWorld = Vec3.sum(entProperties.position, Vec3.multiplyQbyV(entProperties.rotation, jointLocInObjectFrame));
            Messages.sendMessage("BowlingGameChannel", JSON.stringify({
                type: "get-ball-location",
                location: jointLocInWorld
            }));
            print("Sent ball location: " + jointLocInWorld);    
        },
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.resetConsoleID = Entities.getEntityProperties(_this.entityID, ['parentID']).parentID;
            _this.bowlingAlleyID = Entities.getEntityProperties(_this.resetConsoleID, ['parentID']).parentID;
            print('preload(' + entityID + ')');
            Messages.subscribe("BowlingGameChannel");
            Script.setTimeout(function(){
                _this.getPinJointLocation();
                _this.getBallJointLocation();
            }, 2000);

        },
        unload: function() {
            // this would remove the pins when someone random is leaving (not what we intend)
            //    _this.clearPins();
        },
        startNearTrigger: function(entityID) {
            if (_canRez) {
                _canRez = false;
                Messages.sendMessage("BowlingGameChannel", JSON.stringify({
                    type: "reset-hit",
                    entityID: this.entityID 
                }));
            }
            Script.setTimeout(function(){_canRez = true}, TIMEOUT);
           
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