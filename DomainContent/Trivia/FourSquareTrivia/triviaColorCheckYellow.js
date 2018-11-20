// triviaColorCheck.js

//  Created by Mark Brosche on 11/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global EventBridge Users AccountServices */

(function(){
    var _this,
        bubble,
        gameOn,
        gameZone;
    
    var DISQUALIFIED_POSITION = { x: -69.4697, y: -19, z: 6.3204 },
        HALF_MULTIPLIER = 0.5,
        ZONE_SQUARE_RADIUS = 1.5,
        RADIUS = 50,
        RANGE = 5;

    var ColorCheck = function(){
        _this = this;
    };

    ColorCheck.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
            gameZone = Entities.getEntityProperties(
                Entities.findEntitiesByName("Trivia Player Game Zone", MyAvatar.position, RADIUS)[0], ['position', 'rotation', 'dimensions']);
            bubble = Entities.getEntityProperties(
                Entities.findEntitiesByName("Trivia Bubble", MyAvatar.position, RADIUS)[0], ['visible']);
            if (Settings.getValue("activeTriviaColor") !== "Yellow") {
                console.log("I'm wrong");
                _this.ejectUser();
            } else {
                console.log("I'm right");
            }
            Script.setTimeout(function(){
                _this.unload();
            }, 15000);
        },
        
        isAvatarInsideZone: function(position, zoneProperties) {
            var localPosition = Vec3.multiplyQbyV(Quat.inverse(zoneProperties.rotation),
                Vec3.subtract(position, zoneProperties.position));
            var halfDimensions = Vec3.multiply(zoneProperties.dimensions, HALF_MULTIPLIER);
            return -halfDimensions.x <= localPosition.x &&
                    halfDimensions.x >= localPosition.x &&
                   -halfDimensions.y <= localPosition.y &&
                    halfDimensions.y >= localPosition.y &&
                   -halfDimensions.z <= localPosition.z &&
                    halfDimensions.z >= localPosition.z;
        },

        isAnyAvatarCorrect: function(correctColor) {
            var result = false;
            var correctZoneColorID = null;
            switch (correctColor){
                case "Red":
                    correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Red", MyAvatar.position, RADIUS);
                    break;
                case "Green":
                    correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Green", MyAvatar.position, RADIUS);
                    break;
                case "Yellow":
                    correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Yellow", MyAvatar.position, RADIUS);
                    break;
                case "Blue":
                    correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Blue", MyAvatar.position, RADIUS);
                    break;
            }
            var correctColorZoneProperties = Entities.getEntityProperties(
                correctZoneColorID[0], 
                ["position", "dimensions", "rotation"]);
            var correctAvatarsList = AvatarList.getAvatarsInRange(correctColorZoneProperties.position, ZONE_SQUARE_RADIUS);
            var i = 0;
            while ( i < correctAvatarsList.length){
                var correctAvatarPosition = AvatarList.getAvatar(correctAvatarsList[i]).position;
                result = _this.isAvatarInsideZone(correctAvatarPosition, correctColorZoneProperties) ? true : false;
                if ( result === true ) { 
                    return result;
                } else { 
                    i++; 
                }
            }
            return result;
        },

        ejectUser: function() {
            gameOn = bubble.visible;
            if (gameOn === true && _this.isAvatarInsideZone(MyAvatar.position, gameZone)) {
                MyAvatar.orientation = { x: 0, y: 0, z: 0 };
                MyAvatar.position = DISQUALIFIED_POSITION;
                try {
                    var playerValidator = Entities.findEntitiesByName(MyAvatar.sessionUUID, gameZone.position, RANGE);
                    for (var i = 0; i < playerValidator.length; i++){
                        Entities.callEntityServerMethod(_this.entityID, "deleteValidator", [playerValidator[i]]);
                    }
                    playerValidator = null;
                } catch (e) {
                    console.log("Error finding validator, nothing to delete", e);
                }
            }
        },

        unload: function(){
            Entities.editEntity(_this.entityID, {
                script: null
            });
        }
    };

    return new ColorCheck;
});