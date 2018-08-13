//
//  resetWhiteBoard.js
//
//  Modified by Daniela Fontes (Mimicry) 2/23/2018
//  Copyright 2018 High Fidelity, Inc.
//
//  This entity script provides logic for an object with attached script to erase nearby marker strokes
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var _this;

    var RESET_SOUND = SoundCache.getSound(Script.resolvePath('sfx/reset_whiteboard.wav'));
    
    var ResetBoard = function() {
        _this = this;
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
        _this.WHITEBOARD_NAME = "Whiteboard";
        _this.whiteboard = null;
    };

    ResetBoard.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
        },        
        clearBoard: function() {
            _this.whiteboard = Entities.getEntityProperties(_this.entityID, "parentID").parentID;
            _this.resetPosition = Entities.getEntityProperties(_this.entityID, "position").position;

            // bounding box is too big
            var boundingBox = Entities.getEntityProperties(_this.whiteboard, "boundingBox").boundingBox; 
            var halfDimensions = Entities.getEntityProperties(_this.whiteboard, "dimensions").dimensions;
            halfDimensions = Vec3.multiply(0.5, halfDimensions);
            var position = Entities.getEntityProperties(_this.whiteboard, "position").position;
            var rotation = Entities.getEntityProperties(_this.whiteboard, "rotation").rotation;
            var front = Quat.getFront(rotation);
            var up = Quat.getUp(rotation);
            var right = Quat.getRight(rotation);
            var results = Entities.findEntitiesInBox(boundingBox.brn, boundingBox.dimensions);
            
            var serverID = _this.whiteboard;

            Audio.playSound(RESET_SOUND, {
                position: _this.resetPosition,
                volume: 1
            });
            
            results.forEach(function(stroke) {
                var props = Entities.getEntityProperties(stroke, ["position", "name"]);
                if (props.name === _this.STROKE_NAME) {
                    if (Math.abs(Vec3.dot(Vec3.subtract(props.position, position), right)) <= halfDimensions.x) {
                        if (Math.abs(Vec3.dot(Vec3.subtract(props.position, position), up)) <= halfDimensions.y) {
                            if (Math.abs(Vec3.dot(Vec3.subtract(props.position, position), front)) <= halfDimensions.z) {
                                // Calling server to delete stroke 
                                // Server side equivalent of Entities.deleteEntity(stroke);
                                Entities.callEntityServerMethod(serverID, 'erase', [stroke]);
                            }
                        }
                    }
                }
            });
            
            // Calling server to clear board and reset markers and erasers
            Entities.callEntityServerMethod(serverID, 'clearBoard', []);            
        },
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            _this.clearBoard();
        },
        startNearTrigger: function(entityID) {      
            _this.clearBoard();
        },
        startFarTrigger: function(entityID) {      
            _this.clearBoard();
        }
    };

    return new ResetBoard();
});