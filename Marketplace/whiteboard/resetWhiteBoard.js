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
        _this.RESET_STROKE_SEARCH_RADIUS = 5;
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
        _this.WHITEBOARD_NAME = "Whiteboard";
        _this.WHITEBOARD_SEARCH_RADIUS = 2;
        _this.whiteboard = null;
    };

    ResetBoard.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
        },        
        clearBoard: function() {
            _this.resetPosition = Entities.getEntityProperties(_this.entityID, "position").position;
            var results = Entities.findEntities(_this.resetPosition, _this.RESET_STROKE_SEARCH_RADIUS);
            _this.findWhiteboard();
            var serverID = _this.whiteboard;

            Audio.playSound(RESET_SOUND, {
                position: _this.resetPosition,
                volume: 1
            });
            
            results.forEach(function(stroke) {
                var props = Entities.getEntityProperties(stroke, ["position", "name"]);
                if (props.name === _this.STROKE_NAME && 
                    Vec3.distance(_this.resetPosition, props.position) < _this.RESET_STROKE_SEARCH_RADIUS) {
                    // Calling server to delete stroke 
                    // Server side equivalent of Entities.deleteEntity(stroke);
                    Entities.callEntityServerMethod(serverID, 'erase', [stroke]);
                }
            });
            
            // Calling server to clear board and reset markers and erasers
            Entities.callEntityServerMethod(serverID, 'clearBoard', []);            
        },
        findWhiteboard: function() {
            var results = Entities.findEntities(
                Entities.getEntityProperties(_this.entityID, "position").position,
                _this.WHITEBOARD_SEARCH_RADIUS
            );
            results.forEach(function(entity) {
                var entityName = Entities.getEntityProperties(entity, "name").name;
                if (entityName === _this.WHITEBOARD_NAME) {
                    _this.whiteboard = entity;
                    return;
                }
            });
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