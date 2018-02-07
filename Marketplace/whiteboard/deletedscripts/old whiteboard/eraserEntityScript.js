//
//  eraserEntityScript.js
//
//  Created by Eric Levin on 2/17/15.
//  Additions by James B. Pollack @imgntn 6/9/2016
//  Copyright 2016 High Fidelity, Inc.
//
//  This entity script provides logic for an object with attached script to erase nearby marker strokes
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    Script.include(Script.resolvePath('utils.js'));

    var _this;

    Eraser = function() {
        _this = this;
        _this.equipped = false;
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
        _this.ERASER_TO_STROKE_SEARCH_RADIUS = 0.1;
    };

    Eraser.prototype = {

        continueNearGrab: function() {
            _this.eraserPosition = Entities.getEntityProperties(_this.entityID, "position").position;
            _this.continueHolding();
        },

        continueHolding: function() {
            var results = Entities.findEntities(_this.eraserPosition, _this.ERASER_TO_STROKE_SEARCH_RADIUS);
            // Create a map of stroke entities and their positions

            results.forEach(function(stroke) {
                var props = Entities.getEntityProperties(stroke, ["position", "name"]);
                if (props.name === _this.STROKE_NAME && Vec3.distance(_this.eraserPosition, props.position) < _this.ERASER_TO_STROKE_SEARCH_RADIUS) {
                    Entities.deleteEntity(stroke);
                    var vibrated = Controller.triggerHapticPulse(1, 70, 2);
                }
            });
        },

        preload: function(entityID) {
            _this.entityID = entityID;
        },

        startEquip: function() {
            _this.equipped = true;
            _this.startEquipTime = Date.now();
            _this.startNearGrab();
        },

        continueEquip: function() {
            _this.continueNearGrab();
        },

        releaseEquip: function() {
            // FIXME: it seems to release quickly while auto-attaching, added this to make sure it doesn't delete the entity at that time
            var MIN_CLEANUP_TIME = 1000;
            if (_this.equipped && (Date.now() - _this.startEquipTime) > 1000) {
                Entities.deleteEntity(_this.entityID);
            }
            _this.equipped = false;
        }

    };

    return new Eraser();
});
