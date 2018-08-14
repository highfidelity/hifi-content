//
//  laser.js
//
//  Created by David Rowe on 21 Jul 2017.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global Laser:true */

Laser = function (side) {
    // Draws hand lasers.
    // May intersect with overlays or entities, or bounding box of other hand's selection.
    // Laser dot is always drawn on UI entities.

    "use strict";

    var isLaserEnabled = true,
        isLaserOn = false,

        laserLine = null,
        laserSphere = null,

        searchDistance = 0.0,

        SEARCH_SPHERE_SIZE = 0.013, // Per farActionGrabEntity.js multiplied by 1.2 per farActionGrabEntity.js.
        MINUMUM_SEARCH_SPHERE_SIZE = 0.006,
        SEARCH_SPHERE_FOLLOW_RATE = 0.5,
        COLORS_GRAB_SEARCHING_HALF_SQUEEZE = { red: 10, green: 10, blue: 255 }, // Per controllerDispatcherUtils.js.
        COLORS_GRAB_SEARCHING_FULL_SQUEEZE = { red: 250, green: 10, blue: 10 }, // Per controllerDispatcherUtils.js.

        GRAB_POINT_SPHERE_OFFSET = { x: 0.04, y: 0.13, z: 0.039 }, // Per HmdDisplayPlugin.cpp and controllers.js.

        PICK_MAX_DISTANCE = 500, // Per controllerDispatcherUtils.js.
        PRECISION_PICKING = true,
        NO_INCLUDE_IDS = [],
        NO_EXCLUDE_IDS = [],
        VISIBLE_ONLY = true,

        laserLength,
        specifiedLaserLength = null,

        LEFT_HAND = 0,

        uiOverlayIDs = [],

        intersection;

    if (!(this instanceof Laser)) {
        return new Laser(side);
    }

    if (side === LEFT_HAND) {
        GRAB_POINT_SPHERE_OFFSET.x = -GRAB_POINT_SPHERE_OFFSET.x;
    }

    laserLine = Overlays.addOverlay("line3d", {
        alpha: 0.9,
        glow: 0.5,
        lineWidth: 0.02,
        ignoreRayIntersection: true,
        drawInFront: true,
        parentID: Uuid.SELF,
        parentJointIndex: MyAvatar.getJointIndex(side === LEFT_HAND
            ? "_CAMERA_RELATIVE_CONTROLLER_LEFTHAND"
            : "_CAMERA_RELATIVE_CONTROLLER_RIGHTHAND"),
        visible: false
    });
    laserSphere = Overlays.addOverlay("sphere", {
        solid: true,
        alpha: 0.9,
        ignoreRayIntersection: true,
        drawInFront: true,
        visible: false
    });

    function updateLine(start, end, color) {
        Overlays.editOverlay(laserLine, {
            parentID: Uuid.SELF, // Re-parent in case have changed domains.
            start: start,
            end: end,
            color: color,
            visible: true
        });
    }

    function updateSphere(location, size, color) {
        Overlays.editOverlay(laserSphere, {
            position: location,
            color: color,
            dimensions: { x: size, y: size, z: size },
            visible: true
        });
    }

    function display(origin, direction, distance, isPressed, isClicked) {
        var searchTarget,
            sphereSize,
            color;

        searchDistance = SEARCH_SPHERE_FOLLOW_RATE * searchDistance + (1.0 - SEARCH_SPHERE_FOLLOW_RATE) * distance;
        searchTarget = Vec3.sum(origin, Vec3.multiply(searchDistance, direction));
        sphereSize = Math.max(SEARCH_SPHERE_SIZE * searchDistance, MINUMUM_SEARCH_SPHERE_SIZE);
        color = isClicked ? COLORS_GRAB_SEARCHING_FULL_SQUEEZE : COLORS_GRAB_SEARCHING_HALF_SQUEEZE;

        if (isPressed) {
            updateLine(origin, searchTarget, color);
        } else {
            Overlays.editOverlay(laserLine, { visible: false });
        }
        updateSphere(searchTarget, sphereSize, color);
    }

    function hide() {
        Overlays.editOverlay(laserLine, { visible: false });
        Overlays.editOverlay(laserSphere, { visible: false });
    }

    function setUIOverlays(overlayIDs) {
        uiOverlayIDs = overlayIDs;
    }

    function update(hand) {
        var handPosition,
            handOrientation,
            deltaOrigin,
            pickRay;

        if (!isLaserEnabled) {
            intersection = {};
            return;
        }

        handPosition = hand.position();
        handOrientation = hand.orientation();
        deltaOrigin = Vec3.multiplyQbyV(handOrientation, GRAB_POINT_SPHERE_OFFSET);
        pickRay = {
            origin: Vec3.sum(handPosition, deltaOrigin),
            direction: Quat.getUp(handOrientation),
            length: PICK_MAX_DISTANCE
        };

        if (hand.triggerPressed()) {

            // Normal laser operation with trigger.
            intersection = Overlays.findRayIntersection(pickRay, PRECISION_PICKING, NO_INCLUDE_IDS, NO_EXCLUDE_IDS,
                VISIBLE_ONLY);
            var tabletIDs = [];
            if (HMD.tabletID) {
                tabletIDs.push(HMD.tabletID);
            }
            if (HMD.tabletScreenID) {
                tabletIDs.push(HMD.tabletScreenID);
            }
            if (HMD.homeButtonID) {
                tabletIDs.push(HMD.homeButtonID);
            }
            if (Reticle.visible && Reticle.pointingAtSystemOverlay || (intersection.overlayID
                    && tabletIDs.indexOf(intersection.overlayID) !== -1)) {
                // No laser if pointing at HUD overlay or tablet; system provides lasers for these cases.
                if (isLaserOn) {
                    isLaserOn = false;
                    hide();
                }
            } else {
                if (!intersection.intersects) {
                    intersection = Entities.findRayIntersection(pickRay, PRECISION_PICKING, NO_INCLUDE_IDS, NO_EXCLUDE_IDS,
                        VISIBLE_ONLY);
                    intersection.editableEntity = intersection.intersects && Entities.hasEditableRoot(intersection.entityID);
                    intersection.overlayID = null;
                }
                intersection.laserIntersected = intersection.intersects;
                laserLength = (specifiedLaserLength !== null)
                    ? specifiedLaserLength
                    : (intersection.intersects ? intersection.distance : PICK_MAX_DISTANCE);
                isLaserOn = true;
                display(pickRay.origin, pickRay.direction, laserLength, true, hand.triggerClicked());
            }

        } else if (uiOverlayIDs.length > 0) {

            // Special UI cursor.
            intersection = Overlays.findRayIntersection(pickRay, PRECISION_PICKING, uiOverlayIDs, NO_EXCLUDE_IDS,
                VISIBLE_ONLY);
            if (intersection.intersects) {
                intersection.laserIntersected = true;
                laserLength = (specifiedLaserLength !== null)
                    ? specifiedLaserLength
                    : (intersection.intersects ? intersection.distance : PICK_MAX_DISTANCE);
                if (!isLaserOn) {
                    // Start laser dot at UI distance.
                    searchDistance = laserLength;
                }
                isLaserOn = true;
                display(pickRay.origin, pickRay.direction, laserLength, false, false);
            } else if (isLaserOn) {
                isLaserOn = false;
                hide();
            }

        } else {
            intersection = { intersects: false };
            if (isLaserOn) {
                isLaserOn = false;
                hide();
            }
        }
    }

    function getIntersection() {
        return intersection;
    }

    function setLength(length) {
        specifiedLaserLength = length;
        laserLength = length;
    }

    function clearLength() {
        specifiedLaserLength = null;
    }

    function getLength() {
        return laserLength;
    }

    function handOffset() {
        return GRAB_POINT_SPHERE_OFFSET;
    }

    function clear() {
        isLaserOn = false;
        hide();
    }

    function enable() {
        isLaserEnabled = true;
    }

    function disable() {
        isLaserEnabled = false;
        if (isLaserOn) {
            hide();
        }
        isLaserOn = false;
    }

    function destroy() {
        Overlays.deleteOverlay(laserLine);
        Overlays.deleteOverlay(laserSphere);
    }

    return {
        setUIOverlays: setUIOverlays,
        update: update,
        intersection: getIntersection,
        setLength: setLength,
        clearLength: clearLength,
        length: getLength,
        enable: enable,
        disable: disable,
        handOffset: handOffset,
        clear: clear,
        destroy: destroy
    };
};

Laser.prototype = {};
