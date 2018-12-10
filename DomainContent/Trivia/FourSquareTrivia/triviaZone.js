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
    var DISQUALIFIED_POSITION = { x: 2.57328, y: 5, z: -47.86263 };
    var HALF_MULTIPLIER = 0.5;
    // var MIN_SCRIPT_TIMESTAMP = 100;
    var ZONE_SQUARE_RADIUS = 1.5;
    var RADIUS = 50;

    var myColor;
    var currentZoneOverlayPosition;
    var currentZoneOverlay;
    var finalAnswer;
    var zoneProperties;
    var _this;
    //var preloadWhileInZone = false;

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
            //if (_this.isAvatarInsideZone(MyAvatar.position, zoneProperties)) {
                //_this.enterEntity();
                //preloadWhileInZone = true;
            //}
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
                //if (!preloadWhileInZone || !currentZoneOverlay) {
                    _this.createChoiceOverlay();
                //} else {
                //    preloadWhileInZone = false;
                //}
            }   
        },

        newQuestion: function() {
            finalAnswer = null;
            myColor = _this.color;
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

        showIfCorrect: function(correctColor) {
            var someOneIsCorrect = _this.isAnyAvatarCorrect(correctColor) ? true : false;
            if (someOneIsCorrect){
                if (finalAnswer !== correctColor) {
                    MyAvatar.orientation = { x: 0, y: 0, z: 0 };
                    MyAvatar.position = DISQUALIFIED_POSITION;
                } 
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
            if (_this.isAvatarInsideZone(MyAvatar.position, zoneProperties)) {
                _this.leaveEntity();
            }
        }
    };

    return new TriviaZone;
});
