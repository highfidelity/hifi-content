//
//  triviaZone.js
//
//  Created by Rebecca Stankus on 08/01/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var ZONE_COLOR_INDEX = 12;
    var DISQUALIFIED_POSITION = { x: -59.8319, y: -76.5082, z: 53.2938 };
    var HALF_MULTIPLIER = 0.5;
    var MIN_SCRIPT_TIMESTAMP = 100;
    var ZONE_SQUARE_RADIUS = 1.5;

    var myColor;
    var currentZoneOverlayPosition;
    var currentZoneOverlay;
    var finalAnswer;
    var zoneProperties;
    var _this;
    var preloadWhileInZone = false;

    var TriviaZone = function() {
        _this = this;
    };

    TriviaZone.prototype = {
        disqualifiedPosition: null,

        preload: function(entityID) {
            _this.entityID = entityID;
            zoneProperties = Entities.getEntityProperties(_this.entityID, 
                ['name', 'parentID', 'rotation', 'position', 'dimensions']);
            var name = zoneProperties.name;
            _this.color = name.substr(ZONE_COLOR_INDEX);
            if (_this.color !== "Game Protection") {
                var zoneMarker = zoneProperties.parentID;
                var zoneMarkerPosition = Entities.getEntityProperties(zoneMarker, 'position').position;
                zoneMarkerPosition.y += 0.01;
                currentZoneOverlayPosition = zoneMarkerPosition;
            }
            if (_this.isAvatarInsideZone()) {
                _this.enterEntity();
                preloadWhileInZone = true;
            }
        },

        isAvatarInsideZone: function() {
            var localPosition = Vec3.multiplyQbyV(Quat.inverse(zoneProperties.rotation),
                Vec3.subtract(MyAvatar.position, zoneProperties.position));
            var halfDimensions = Vec3.multiply(zoneProperties.dimensions, HALF_MULTIPLIER);
            return -halfDimensions.x <= localPosition.x &&
                    halfDimensions.x >= localPosition.x &&
                   -halfDimensions.y <= localPosition.y &&
                    halfDimensions.y >= localPosition.y &&
                   -halfDimensions.z <= localPosition.z &&
                    halfDimensions.z >= localPosition.z;
        },

        isPositionInsideZone: function(position, boxProperties) {
            var localPosition = Vec3.multiplyQbyV(Quat.inverse(boxProperties.rotation),
                Vec3.subtract(position, boxProperties.position));
                console.log(JSON.stringify("Distance is: ", JSON.stringify(Vec3.distance(position, boxProperties.position))));
            var halfDimensions = Vec3.multiply(boxProperties.dimensions, HALF_MULTIPLIER);
            return -halfDimensions.x <= localPosition.x &&
                    halfDimensions.x >= localPosition.x &&
                   -halfDimensions.y <= localPosition.y &&
                    halfDimensions.y >= localPosition.y &&
                   -halfDimensions.z <= localPosition.z &&
                    halfDimensions.z >= localPosition.z;
        },

        createChoiceOverlay: function() {
            currentZoneOverlay = Overlays.addOverlay("model", {
                url: Script.resolvePath("assets/models/highlight.fbx"),
                dimensions: { x: 4, y: 0.01, z: 4 },
                position: currentZoneOverlayPosition,
                rotation: zoneProperties.rotation,
                glow: 1
            });
        },

        deleteOverlay: function() {
            if (currentZoneOverlay) {
                Overlays.deleteOverlay(currentZoneOverlay);
                currentZoneOverlay = null;
            }
        },

        triviaListener: function(channel, message, sender) {
            if (channel === "TriviaChannel") {
                message = JSON.parse(message);
                if (message.type === 'newQuestion') {
                    _this.newQuestion(message.question, message.choices);
                } else if (channel === "TriviaChannel" && message.type === 'timeUp') {
                    finalAnswer = myColor;
                } else if (channel === "TriviaChannel" && message.type === 'check') {
                    _this.showIfCorrect(message.correct);
                }
            }
        },

        enterEntity: function() {
            Messages.messageReceived.connect(_this.triviaListener);
            myColor = _this.color;
            if (_this.color !== "Game Protection") {
                if (!preloadWhileInZone || !currentZoneOverlay) {
                    _this.createChoiceOverlay();
                } else {
                    preloadWhileInZone = false;
                }
            }   
        },

        newQuestion: function() {
            finalAnswer = null;
            myColor = _this.color;
        },

        isAnyAvatarCorrect: function(correctColor) {
            var result = false;
            console.log(correctColor, " is the correct color");
            switch(correctColor){
                case "Red":
                    zoneColorID = Entities.findEntitiesByName("Trivia Zone Red", MyAvatar.position, 50);
                    break;
                case "Green":
                    zoneColorID = Entities.findEntitiesByName("Trivia Zone Green", MyAvatar.position, 50);
                    break;
                case "Yellow":
                    zoneColorID = Entities.findEntitiesByName("Trivia Zone Yellow", MyAvatar.position, 50);
                    break;
                case "Blue":
                    zoneColorID = Entities.findEntitiesByName("Trivia Zone Blue", MyAvatar.position, 50);
                    break;
            }
            var correctColorZoneProperties = Entities.getEntityProperties(zoneColorID[0], ["position", "dimensions", "rotation"]);
            var correctAvatarsList = AvatarList.getAvatarsInRange(correctColorZoneProperties.position, ZONE_SQUARE_RADIUS);
            console.log(JSON.stringify(correctAvatarsList.length)," avatars within 1.5m of the ", correctColor, " zone.");
            var i = 0;
            while ( i < correctAvatarsList.length){
                var correctAvatarPosition = AvatarList.getAvatar(correctAvatarsList[i]).position;
                console.log(JSON.stringify("The correct avatar position is: ", JSON.stringify(correctAvatarPosition)));
                result = _this.isPositionInsideZone(correctAvatarPosition, correctColorZoneProperties) ? true : false;
                if ( result === true ) { 
                    console.log("The ", i, "th element was actually in the right zone, which means someone was right.");
                    return result;
                }
                else { i++; }
            }
            return result;
        },

        showIfCorrect: function(correctColor) {
            console.log(correctColor, " is the correct color");
            var someOneIsCorrect = _this.isAnyAvatarCorrect(correctColor) ? true : false;
            if(someOneIsCorrect){
                console.log( "Someone has the right answer", JSON.stringify(someOneIsCorrect));
                if (finalAnswer !== correctColor) {
                    console.log("...But it isn't me.");
                    MyAvatar.orientation = { x: 0, y: 0, z: 0 };
                    MyAvatar.position = DISQUALIFIED_POSITION;
                }
                else{
                    console.log("...And it's ME!");
                }
            }
            else {
                console.log("Nobody got the right answer, keep playing");
            }
        },

        leaveEntity: function() {
            try {
                Messages.messageReceived.disconnect(_this.triviaListener);
            } catch (err) {
                print("could not disconnect from messages");
            }
            _this.deleteOverlay();
        },

        unload: function() {
            if (_this.isAvatarInsideZone()) {
                _this.leaveEntity();
            }
        }
    };

    return new TriviaZone;
});
