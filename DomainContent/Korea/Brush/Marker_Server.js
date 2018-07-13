// Marker_Server.js
//
// Copyright 2018 High Fidelity, Inc.
// Created by Milad Nazeri and Robin Wilson 7/5/2018
// Expands on fingerPaint.js created by David Rowe 15 Feb 2017
// 
// Server script to the marker. Creates lines server side to allow users without rez rights to draw polylines.
// Listens to Marker_Client for marker positions. Works with Marker_Client.js.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {
    var STROKE_COLOR = {
            red: 250,
            green: 0,
            blue: 0
        },
        ERASE_SEARCH_RADIUS = 0.1, // m
        isDrawingLine = false,
        entityID,
        basePosition,
        strokePoints,
        strokeNormals,
        strokeWidths,
        timeOfLastPoint,
        MIN_STROKE_LENGTH = 0.005, // m
        MIN_STROKE_INTERVAL = 66, // ms
        MAX_POINTS_PER_LINE = 70, // Hard-coded limit in PolyLineEntityItem.h.
        currentAvatarOrientation;

    function strokeNormal() {
        return Vec3.multiplyQbyV(currentAvatarOrientation, Vec3.UNIT_NEG_Z);
    }

    function MarkerServer() {

    }

    MarkerServer.prototype = {
        remotelyCallable: [
            "startLine",
            "drawLine",
            "finishLine",
            "cancelLine",
            "eraseClosestLine",
            "tearDown"
        ],
        preload: function (id) {

        },
        startLine: function (id, params) {

            if (!params && params.length < 3) {
                return;
            }

            var position;
            var width;
            var orientation; 

            try {
                position = JSON.parse(params[0]);
                width = Number(params[1]);
                orientation = JSON.parse(params[2]); 
            } catch (err) {
                console.error("Error in startLine: ", err);
            }

            currentAvatarOrientation = orientation;
            // Start drawing a polyline.
            if (isDrawingLine) {
                print("ERROR: startLine() called when already drawing line");
                // Nevertheless, continue on and start a new line.
            }

            basePosition = position;

            strokePoints = [Vec3.ZERO];
            strokeNormals = [strokeNormal()];
            strokeWidths = [width];
            timeOfLastPoint = Date.now();

            var properties = {
                type: "PolyLine",
                name: "fingerPainting",
                color: STROKE_COLOR,
                position: position,
                linePoints: strokePoints,
                normals: strokeNormals,
                strokeWidths: strokeWidths,
                collisionless: true,
                dimensions: {
                    x: 10,
                    y: 10,
                    z: 10
                }
            };

            entityID = Entities.addEntity(properties);

            isDrawingLine = true;
        },
        drawLine: function (id, params) {

            if (!params && params.length < 2) {
                return;
            }

            var position;
            var width;

            try {
                position = JSON.parse(params[0]);
                width = Number(params[1]);
            } catch (err) {
                console.error("Error in drawLine: ",err);
            }

            // Add a stroke to the polyline if stroke is a sufficient length.
            var localPosition,
                distanceToPrevious,
                MAX_DISTANCE_TO_PREVIOUS = 1.0;

            if (!isDrawingLine) {
                print("ERROR: drawLine() called when not drawing line");
                return;
            }

            localPosition = Vec3.subtract(position, basePosition);
            distanceToPrevious = Vec3.distance(localPosition, strokePoints[strokePoints.length - 1]);

            if (distanceToPrevious > MAX_DISTANCE_TO_PREVIOUS){ // > MAX_DISTANCE_TO_PREVIOUS) {
                // Ignore occasional spurious finger tip positions.
                return;
            }

            if (distanceToPrevious >= MIN_STROKE_LENGTH &&
                (Date.now() - timeOfLastPoint) >= MIN_STROKE_INTERVAL &&
                strokePoints.length < MAX_POINTS_PER_LINE) {
                strokePoints.push(localPosition);
                strokeNormals.push(strokeNormal());
                strokeWidths.push(width);
                timeOfLastPoint = Date.now();

                var properties = {
                    linePoints: strokePoints,
                    normals: strokeNormals,
                    strokeWidths: strokeWidths
                };

                Entities.editEntity(entityID, properties);

            }
        },
        finishLine: function (id, params) {
            // Finish drawing polyline; delete if it has only 1 point.

            if (!isDrawingLine) {
                print("ERROR: finishLine() called when not drawing line");
                return;
            }

            if (strokePoints.length === 1) {
                // Delete "empty" line.
                Entities.deleteEntity(entityID);
            }

            isDrawingLine = false;
        },
        cancelLine: function (id) {
            // Cancel any line being drawn.
            if (isDrawingLine) {
                Entities.deleteEntity(entityID);
                isDrawingLine = false;
            }
        },
        eraseClosestLine: function (id, params) {

            if (!params || params.length < 2) {
                return;
            }

            var position;
            var polyLines;

            try {
                position = JSON.parse(params[0]);
                polyLines = JSON.parse(params[1]);
            } catch (err) {
                console.error("Error in eraseClosestLine: ",err);
            }

            // Erase closest line that is within search radius of finger tip.
            var pointsLength,
                j,
                distance,
                found = false,
                foundID,
                foundDistance = ERASE_SEARCH_RADIUS;

            polyLines.forEach(function (polyLine) {
                basePosition = polyLine.position;
                for (j = 0, pointsLength = polyLine.linePoints.length; j < pointsLength; j += 1) {
                    distance = Vec3.distance(position, Vec3.sum(basePosition, polyLine.linePoints[j]));
                    if (distance <= foundDistance) {
                        found = true;
                        foundID = polyLine.id;
                        foundDistance = distance;
                    }
                }

                // Delete found entity.
                if (found) {
                    Entities.deleteEntity(foundID);
                }
            });

        },
        tearDown: function (id) {
            this.cancelLine();
        }
    };

    return new MarkerServer();
});