//
// spawnPointZone.js
// 
// Created by Rebecca Stankus on 05/21/2019
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function () {
    var _this;

    var DEBUG = 1;
    var HALF = 0.5;

    var SpawnPointZone = function() {
        _this = this;
    };

    SpawnPointZone.prototype = {
        /* When the user loads this zone, they will be moved to random position within a cube specified by its 
            position and dimensions in the userData of this zone.*/
        preload: function(entityID) {
            _this.entityID = entityID;
            var userData = Entities.getEntityProperties(_this.entityID, 'userData').userData;
            if (!userData || !JSON.parse(userData).spawnArea.dimensions || !JSON.parse(userData).spawnArea.position) {
                if (DEBUG) {
                    print("COULD NOT GET ZONE USER DATA");
                }
                return;
            }
            var spawnAreaProperties = JSON.parse(userData).spawnArea;
            if (DEBUG) {
                print("SPAWN AREA PROPERTIES: ", JSON.stringify(spawnAreaProperties));
            }
            var minX = spawnAreaProperties.position.x - spawnAreaProperties.dimensions.x * HALF;
            var maxX = spawnAreaProperties.position.x + spawnAreaProperties.dimensions.x * HALF;
            if (minX > maxX) {
                var tempX = minX;
                maxX = minX;
                minX = tempX;
            }
            if (DEBUG) {
                print("MIN X: ", minX, "MAX X: ", maxX);
            }
            var minY = spawnAreaProperties.position.y - spawnAreaProperties.dimensions.y * HALF;
            var maxY = spawnAreaProperties.position.y + spawnAreaProperties.dimensions.y * HALF;
            if (minY > maxY) {
                var tempY = minY;
                maxY = minY;
                minY = tempY;
            }
            if (DEBUG) {
                print("MIN Y: ", minY, "MAX Y: ", maxY);
            }
            var minZ = spawnAreaProperties.position.z - spawnAreaProperties.dimensions.z * HALF;
            var maxZ = spawnAreaProperties.position.z + spawnAreaProperties.dimensions.z * HALF;
            if (minZ > maxZ) {
                var tempZ = minZ;
                maxZ = minZ;
                minZ = tempZ;
            }
            if (DEBUG) {
                print("MIN Z: ", minZ, "MAX Z: ", maxZ);
            }
            var spawnX = Math.random() * (maxX - minX) + minX;
            var spawnY = Math.random() * (maxY - minY) + minY;
            var spawnZ = Math.random() * (maxZ - minZ) + minZ;
            var newPosition = { x: spawnX, y: spawnY, z: spawnZ };
            if (DEBUG) {
                print("MOVING TO POSITION: ", JSON.stringify(newPosition));
            }
            MyAvatar.position = newPosition;
        }
    };

    return new SpawnPointZone();
});
