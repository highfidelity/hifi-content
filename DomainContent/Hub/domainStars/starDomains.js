"use strict";

//  starDomains.js
//
//  A teleportable domain constellation 
//  Each star represents a domain placename. The star size will grow up to three times the size for crowded places.
//  Stars that point to the same domain will be clustered together. Can you see your constellation up there?
//
//  Created by Thijs Wenker on 04/22/2018.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {

    var md5 = Script.require('./node_modules/blueimp-md5/js/md5.min.js');

    var EDIT_SETTING = "io.highfidelity.isEditing";
    
    // replace placeNames with their color values
    var DEBUG_COLOR = false;

    var HALF = 0.5;

    var HEX_NUMBER_BASE = 16;
    var HASH_FULL_LENGTH = 32;
    var HASH_HALF_LENGTH = HASH_FULL_LENGTH * HALF;
    var UUID_STRIP_REGEX = /[-{}]/g;
    var USER_STORIES_API_URL = Account.metaverseServerURL + '/api/v1/user_stories';
    
    var COLOR_HEX_LENGTH = 10;
    var RED_START = 1;
    var RED_END = RED_START + COLOR_HEX_LENGTH;
    var GREEN_START = RED_END;
    var GREEN_END = GREEN_START + COLOR_HEX_LENGTH;
    var BLUE_START = GREEN_END;
    var BLUE_END = BLUE_START + COLOR_HEX_LENGTH;
    
    var SECONDS_PER_MILLISECOND = 1000;
    var UPDATE_TIMEOUT = 30 * SECONDS_PER_MILLISECOND; // update every 30 seconds
    var MAXIMUM_STARS = 100;
   
    var PROTOCOL = {
        RC65: "jWMeM1PU6wCJjCiLLERaWQ%3D%3D",
        RC66: "Fah%2FlDA1xHOxUYlVAWsiFQ%3D%3D",
        CURRENT: encodeURIComponent(Window.protocolSignature())
    };

    var DOMAIN_RESTRICTIONS = 'open,hifi';
    
    var ENCODED_PROTOCOL = PROTOCOL.CURRENT;
    
    var STAR_SPRITE_PATH = Script.resolvePath('Star-sprite-sm.png');
    
    var PROJECTION_MODE = {
        STELLAR: 1,
        PLANAR: 2
    };
  
    var SKY_ANGLE = 140;
    var STAR_DISTANCE = 2000;

    var STAR_SIZE = 0.5;

    var MAX_CONCURRENCY_GROWTH = 10; // stop growing at 10 users
    var MAX_ADDED_STAR_SIZE = STAR_SIZE * 2;

    var MAX_CLUSTER_WIDTH = 1;

    var MIN_COLOR_VALUE = 144;
    var MAX_COLOR_VALUE = 255;

    var SKIP_OWN_DOMAIN = true;
 
    var SELECTED_PROJECTION_MODE = PROJECTION_MODE.PLANAR;
    
    var triggerMapping = null;
    
    var request = Script.require('./modules/request.js').request;
    var controllerUtils = Script.require('./modules/controllerUtils.js');
    
    function percentageToColor(percentage) {
        return ((MAX_COLOR_VALUE - MIN_COLOR_VALUE) * percentage) + MIN_COLOR_VALUE;
    }
    
    function stripUuid(uuid) {
        if (Uuid.fromString(uuid) === null) {
            return null;
        }
        return uuid.replace(UUID_STRIP_REGEX, '');
    }
    
    function getHashPartToPercentage(hash, start, end) {
        var maxDigits = end - start;
        var hexValue = hash.substr(start, maxDigits);
        var value = parseInt(hexValue, HEX_NUMBER_BASE);
        
        var maxHexValue = Array(maxDigits + 1).join('f');
        var maxValue = parseInt(maxHexValue, HEX_NUMBER_BASE);
        return value / maxValue;
    }

    function convertHashToUV(hash) {
        return {
            u: getHashPartToPercentage(hash, 0, HASH_HALF_LENGTH),
            v: getHashPartToPercentage(hash, HASH_HALF_LENGTH, HASH_FULL_LENGTH)
        };
    }
    
    function convertHashToColor(hash) {
        return {
            red: percentageToColor(getHashPartToPercentage(hash, RED_START, RED_END)),
            green: percentageToColor(getHashPartToPercentage(hash, GREEN_START, GREEN_END)),
            blue: percentageToColor(getHashPartToPercentage(hash, BLUE_START, BLUE_END))
        };
    }

    function getStarLocationPosition(starOverlayManager, domainIDHash, placeNameHash) {
        
        var uvPosition = convertHashToUV(domainIDHash);
        var clusterUVPosition = convertHashToUV(placeNameHash);

        if (SELECTED_PROJECTION_MODE === PROJECTION_MODE.STELLAR) {
            var starPitchAngle = (uvPosition.u - HALF) * SKY_ANGLE;
            var starRollAngle = (uvPosition.v - HALF) * SKY_ANGLE;

            var localStarDirection = Quat.fromPitchYawRollDegrees(starPitchAngle, 0, starRollAngle);

            return Vec3.multiplyQbyV(localStarDirection, {x: 0, y: STAR_DISTANCE, z: 0});
        }
      
        if (SELECTED_PROJECTION_MODE === PROJECTION_MODE.PLANAR) {
            var dimensions = starOverlayManager.getProperties.call(starOverlayManager, ['dimensions']).dimensions;
            return {
                x: ((dimensions.x - MAX_CLUSTER_WIDTH) * (uvPosition.u - HALF)) +
                    ((clusterUVPosition.u - HALF) * MAX_CLUSTER_WIDTH),
                y: HALF * dimensions.y,
                z: (dimensions.z - MAX_CLUSTER_WIDTH) * (uvPosition.v - HALF)
                    + ((clusterUVPosition.v - HALF) * MAX_CLUSTER_WIDTH)
            };
        }
        return Vec3.ZERO;
    }

    var getStarHash = function(domainID, placeName) {
        return md5(domainID + placeName);
    };
    
    var StarOverlay = (function() {

        var _getScale = function(userConcurrency) {
            var calculatedUsers = Math.min(userConcurrency, MAX_CONCURRENCY_GROWTH);
            var addedUserSize = (calculatedUsers / MAX_CONCURRENCY_GROWTH) * MAX_ADDED_STAR_SIZE;
            return STAR_SIZE + addedUserSize;
        };

        function StarOverlay(starOverlayManager, userStory) {
            var strippedUuid = stripUuid(userStory.domain_id);
            if (strippedUuid === null) {
                throw "Failed to strip domain_id for StarOverlay creation";
            }

            var domainIDHash = md5(strippedUuid);
            var placeNameHash = md5(userStory.place_name);

            this._starOverlayManager = starOverlayManager;
            this.userStory = userStory;
            this.localPosition = getStarLocationPosition(starOverlayManager, domainIDHash, placeNameHash);

            var parentProperties = starOverlayManager.getProperties.call(starOverlayManager, ['position', 'rotation']);
            this.position = Vec3.sum(parentProperties.position,
                Vec3.multiplyQbyV(parentProperties.rotation, this.localPosition));
            this.id = Overlays.addOverlay("image3d", {
                url: STAR_SPRITE_PATH,
                position: this.position,
                size: 1,
                scale: _getScale(userStory.details.concurrency),
                color: convertHashToColor(placeNameHash),
                alpha: 1,
                solid: true,
                isFacingAvatar: true,
                drawInFront: false,
                emissive: true
            });

            // Let the star manager know that this star has been updated successfully to prevent removal.
            this._hasBeenUpdated = true;
        }

        StarOverlay.prototype = {
            _starOverlayManager: null,
            _hasBeenUpdated: null,
            id: null,
            userStory: null,
            localPosition: null,
            hasBeenUpdated: function() {
                return this._hasBeenUpdated;
            },
            prepareUpdate: function() {
                this._hasBeenUpdated = false;
            },
            update: function(userStory) {
                this.userStory = userStory;
                Overlays.editOverlay(this.id, {
                    scale: _getScale(userStory.details.concurrency)
                });
                this._hasBeenUpdated = true;
            },
            cleanUp: function() {
                Overlays.deleteOverlay(this.id);
            }
        };
    
        return StarOverlay;
    })();
    
    var StarOverlayManager = (function() {
        function StarOverlayManager(entityID) {
            this._parentEntityID = entityID;
            this._starOverlays = {};
            this._starOverlayIDsToStarHash = {};
            this._parentPropertiesCache = {};
        }

        StarOverlayManager.prototype = {
            _parentEntityID: null,
            _starOverlays: null,
            _starOverlayIDsToStarHash: null,
            _isInTeleportMode: false,
            _placeNameOverlay: null,
            _teleportButtonOverlay: null,
            _selectedLocation: null,
            _parentPropertiesCache: null,
            getParentID: function() {
                return this._parentEntityID;
            },
            getProperties: function(properties) {
                var propertiesToFetch = [];
                properties.forEach(function(property) {
                    if (!(property in this._parentPropertiesCache)) {
                        propertiesToFetch.push(property);
                    }
                }, this);
                if (propertiesToFetch.length > 0) {
                    var fetchedProperties = Entities.getEntityProperties(this._parentEntityID, propertiesToFetch);
                    propertiesToFetch.forEach(function(property) {
                        if (!(property in fetchedProperties)) {
                            console.error('Property ' + property + ' could not be retrieved from starDomains parent entity.');
                            return;
                        }
                        this._parentPropertiesCache[property] = fetchedProperties[property];
                    }, this);
                }
                var returnedProperties = {};
                properties.forEach(function(property) {
                    if (!(property in this._parentPropertiesCache)) {
                        console.error('Property ' + property + ' could not be retrieved from starDomains properties cache.');
                        return;
                    }
                    returnedProperties[property] = this._parentPropertiesCache[property];
                }, this);
                return returnedProperties;
            },
            cancelTeleportMode: function() {
                if (this._isInTeleportMode) {
                    Overlays.deleteOverlay(this._placeNameOverlay);
                    Overlays.deleteOverlay(this._teleportButtonOverlay);
                    this._isInTeleportMode = false;
                }
            },
            setupTeleportMode: function(starHash) {
                if (this._isInTeleportMode) {
                    this.cancelTeleportMode();
                }
                var starOverlay = this._starOverlays[starHash];
                var userStory = starOverlay.userStory;
                this._selectedLocation = 'hifi://' + userStory.place_name + userStory.path;
                
                var debugColor = Overlays.getProperty(starOverlay.id, 'color');
                var text = userStory.place_name;
                if (DEBUG_COLOR) {
                    text = [debugColor.red, debugColor.green, debugColor.blue].map(function(colorValue) {
                        return Math.floor(colorValue);
                    }).join(',');
                }
                this._placeNameOverlay = Overlays.addOverlay("text3d", {
                    text: text,
                    dimensions: { x: 4, y: 1 },
                    parentID: starOverlay.id,
                    localPosition: {x: 0, y: 0.5, z: 0},
                    color: { red: 255, green: 255, blue: 255 },
                    alpha: 0.9,
                    lineHeight: 1,
                    backgroundAlpha: 0,
                    ignoreRayIntersection: true,
                    isFacingAvatar: true,
                    drawInFront: true
                });
                
                this._teleportButtonOverlay = Overlays.addOverlay("text3d", {
                    text: "GO THERE",
                    dimensions: { x: 2.8, y: 0.7 },
                    parentID: starOverlay.id,
                    localPosition: {x: 0, y: -0.5, z: 0},
                    color: { red: 0, green: 180, blue: 239 },
                    alpha: 1,
                    lineHeight: 0.5,
                    backgroundAlpha: 0.2,
                    isFacingAvatar: true,
                    drawInFront: true
                });
                
                this._isInTeleportMode = true;
            },
            handlePickRay: function(pickRay) {
                if (this._isInTeleportMode) {
                    var buttonRayResult = Overlays.findRayIntersection(pickRay, true, [this._teleportButtonOverlay]);
                    if (buttonRayResult.intersects) {
                        location = this._selectedLocation;
                        return;
                    }
                }
                
                var starRayResult = Overlays.findRayIntersection(pickRay, true, Object.keys(this._starOverlayIDsToStarHash));
                if (!starRayResult.intersects) {
                    this.cancelTeleportMode();
                    return;
                }
                
                this.setupTeleportMode(this._starOverlayIDsToStarHash[starRayResult.overlayID]);
            },
            /**
             * Prepare the star update
             * empties properties cache and prepares the stars overlays for update
             */
            prepareUpdate: function() {
                // empty the properties cache before update
                this._parentPropertiesCache = {};
                Object.keys(this._starOverlays).forEach(function(starHash) {
                    var starOverlay = this._starOverlays[starHash];
                    starOverlay.prepareUpdate.call(starOverlay);
                }, this);
            },
            /**
             * Finalize the star update
             * removes stars that have not been received in the update.
             */
            finalizeUpdate: function() {
                // refresh overlays translations map
                this._starOverlayIDsToStarHash = {};

                Object.keys(this._starOverlays).forEach(function(starHash) {
                    var starOverlay = this._starOverlays[starHash];

                    if (!starOverlay.hasBeenUpdated.call(starOverlay)) {
                        // remove starOverlays that have not been addressed in this update
                        starOverlay.cleanUp.call(starOverlay);
                        delete this._starOverlays[starHash];
                        return;
                    }

                    this._starOverlayIDsToStarHash[starOverlay.id] = starHash;
                }, this);
            },
            updateStars: function() {
                if (this._isInTeleportMode) {
                    // don't update the stars while in teleport mode
                    return;
                }
                var starOverlayManager = this;
                request(USER_STORIES_API_URL + '?now=' + (new Date()).toISOString() +
                    '&include_actions=concurrency&restriction=' + DOMAIN_RESTRICTIONS + '&require_online=true' +
                    '&protocol=' + ENCODED_PROTOCOL + '&page=1&per_page=' + MAXIMUM_STARS, function (error, data) {

                    starOverlayManager.prepareUpdate.call(starOverlayManager);
                    
                    data.user_stories.forEach(function(userStory) {
                        if (SKIP_OWN_DOMAIN && Uuid.isEqual(location.domainID, userStory.domain_id)) {
                            // avoid placing stars up that point to the current domain.
                            return;
                        }
                        starOverlayManager.updateStar.call(starOverlayManager, userStory);
                    });

                    starOverlayManager.finalizeUpdate.call(starOverlayManager);
                });
            },
            updateStar: function(userStory) {
                var starHash = getStarHash(userStory.domain_id, userStory.place_name);
                if (starHash in starOverlayManager._starOverlays) {
                    var starOverlay = starOverlayManager._starOverlays[starHash];
                    starOverlay.update.call(starOverlay, userStory);
                    return;
                }
                var newStarOverlay = new StarOverlay(starOverlayManager, userStory);
                starOverlayManager._starOverlays[starHash] = newStarOverlay;
            },
            cleanUp: function() {
                Object.keys(this._starOverlays).forEach(function(starHash) {
                    var starOverlay = this._starOverlays[starHash];
                    starOverlay.cleanUp.call(starOverlay);
                }, this);
                this.cancelTeleportMode();
            }
        };
        
        return StarOverlayManager;
    })();
    
    var starOverlayManager = null;
    
    var updateInterval = null;
    
    var mousePressEvent = function(event) {
        if (!event.isLeftButton || Settings.getValue(EDIT_SETTING, false)) {
            return;
        }
        var pickRay = Camera.computePickRay(event.x, event.y);
        starOverlayManager.handlePickRay(pickRay);
    };

    this.preload = function(entityID) {
        Controller.mousePressEvent.connect(mousePressEvent);
        
        starOverlayManager = new StarOverlayManager(entityID);
        starOverlayManager.updateStars();
        updateInterval = Script.setInterval(function() {
            starOverlayManager.updateStars.call(starOverlayManager);
        }, UPDATE_TIMEOUT);
        
        triggerMapping = Controller.newMapping(entityID + '-click');
        [Controller.Standard.RT, Controller.Standard.LT].map(function(trigger) {
            var triggered = false;
            var MIN_TRIGGER_VALUE = 0.8;
            triggerMapping.from(trigger).peek().to(function(value) {
                if (!triggered && value >= MIN_TRIGGER_VALUE) {
                    triggered = true;
                    var hand = (trigger === Controller.Standard.LT ? 
                        Controller.Standard.LeftHand : Controller.Standard.RightHand);
                    var pickRay = controllerUtils.controllerComputePickRay(hand);
                    if (pickRay === null) {
                        console.error('There was a problem computing the pickRay');
                        return;
                    }
                    starOverlayManager.handlePickRay(pickRay);
                } else if (triggered && value < MIN_TRIGGER_VALUE) {
                    triggered = false;
                }
            });
        });
        triggerMapping.enable();
    };
    
    this.unload = function() {
        starOverlayManager.cleanUp.call(starOverlayManager);
        Script.clearInterval(updateInterval);
        Controller.mousePressEvent.disconnect(mousePressEvent);
        triggerMapping.disable();
    };
});
