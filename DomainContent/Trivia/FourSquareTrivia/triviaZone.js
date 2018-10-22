//
//  triviaZone.js
//
//  Created by Rebecca Stankus on 08/01/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

// show choices as overlays
// on clicking/triggering an overlay, the choice is saved
// on time up, the choice is shown as an entity on the front of the podium

(function() {
    var ZONE_COLOR_INDEX = 12;
    var SEARCH_RADIUS_M = 100;

    var myColor;
    var currentZoneOverlayPosition;
    var currentZoneOverlayRotation;
    var currentZoneOverlay;
    var finalAnswer;

    var _this;

    var TriviaZone = function() {
        _this = this;
    };

    TriviaZone.prototype = {
        disqualifiedPosition: null,

        preload: function(entityID) {
            _this.entityID = entityID;
            var properties = Entities.getEntityProperties(_this.entityID, ['name', 'parentID', 'rotation']);
            currentZoneOverlayRotation = properties.rotation;
            var zoneMarker = properties.parentID;
            var zoneMarkerPosition = Entities.getEntityProperties(zoneMarker, 'position').position;
            zoneMarkerPosition.y += 0.01;
            currentZoneOverlayPosition = zoneMarkerPosition;
            var name = properties.name;
            _this.color = name.substr(ZONE_COLOR_INDEX);
        },

        createChoiceOverlay: function() {
            currentZoneOverlay = Overlays.addOverlay("model", {
                url: Script.resolvePath("assets/models/highlight.fbx"),
                dimensions: { x: 4, y: 0.01, z: 4 },
                position: currentZoneOverlayPosition,
                rotation: currentZoneOverlayRotation,
                glow: 1
            });
        },

        deleteOverlay: function() {
            if (currentZoneOverlay) {
                Overlays.deleteOverlay(currentZoneOverlay);
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
            _this.createChoiceOverlay();
            Entities.findEntities(MyAvatar.position, SEARCH_RADIUS_M).forEach(function(entity) {
                var properties = Entities.getEntityProperties(entity, ['name', 'position']);
                if (properties.name === "Trivia Zone Out Marker") {
                    _this.disqualifiedPosition = properties.position;
                    _this.disqualifiedPosition.y++;
                }
            });   
        },

        newQuestion: function() {
            finalAnswer = null;
            myColor = _this.color;
        },

        showIfCorrect: function(correctColor) {
            if (finalAnswer !== correctColor) {
                MyAvatar.position = _this.disqualifiedPosition;
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
            _this.leaveEntity();
        }
    };

    return new TriviaZone;
});
