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

    var DEBUG = 0;
    var HALF = 0.5;
    var DEGREES_ON_AXIS = 360;
    var NUMBER_OF_AXES = 3;

    var SpawnPointZone = function() {
        _this = this;
    };

    SpawnPointZone.prototype = {
        /* This utility handles users falling through the floor when first loading into a domain. When the user 
        loads this zone script, they will be moved to random position within a cube whose position and dimensions 
        are specified in the `userData` of the  attached zone. */
        preload: function(entityID) {
            _this.entityID = entityID;
            try {
                var userData = JSON.parse(Entities.getEntityProperties(_this.entityID, 'userData').userData);
                var spawnAreaProperties = userData.spawnArea;
                if (DEBUG) {
                    print("SPAWN AREA PROPERTIES: ", JSON.stringify(spawnAreaProperties));
                }
            } catch (err) {
                print("ERROR: COULD NOT GET ZONE USER DATA");
                return;
            }
            if (!spawnAreaProperties.position || Object.keys(spawnAreaProperties.position).length !== NUMBER_OF_AXES 
                || !spawnAreaProperties.dimensions || Object.keys(spawnAreaProperties.dimensions).length !== NUMBER_OF_AXES) {
                if (DEBUG) {
                    print("INCORRECT POSITION OR DIMENSIONS SPECIFIED");
                }
                return;
            }
            var shouldMove = true;
            if (spawnAreaProperties.usernameWhitelist && Array.isArray(spawnAreaProperties.usernameWhitelist)) {
                (spawnAreaProperties.usernameWhitelist).forEach(function (newUsername) {
                    if (newUsername.toLowerCase() === AccountServices.username.toLowerCase()) {
                        if (DEBUG) {
                            print("USER NAME ", newUsername, " IS ON WHITELIST. RETURNING", newUsername);
                        }
                        shouldMove = false;
                    }
                });
            }
            if (shouldMove) {
                _this.moveUser(spawnAreaProperties);
            }
        },

        moveUser: function(spawnAreaProperties) {
            if (spawnAreaProperties.avatarRotation && Object.keys(spawnAreaProperties.avatarRotation).length === NUMBER_OF_AXES) {
                if (DEBUG) {
                    print("SPECIFIED AVATAR ROTATION: ", JSON.stringify(spawnAreaProperties.avatarRotation));
                }
                MyAvatar.orientation = Quat.fromVec3Degrees(spawnAreaProperties.avatarRotation);
            } else {
                var randomYDegrees = Math.random() * DEGREES_ON_AXIS;
                var newOrientation = Quat.fromVec3Degrees({x: 0, y: randomYDegrees, z: 0 });
                MyAvatar.orientation = newOrientation;
                if (DEBUG) {
                    print("RANDOM AVATAR ROTATION: ", JSON.stringify(newOrientation));
                }
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
