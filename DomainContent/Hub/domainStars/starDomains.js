"use strict";

//  starDomains.js
//
//  a teleportable domain constellation 
//
//  Created by Thijs Wenker on 04/22/2018.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {

    var EDIT_SETTING = "io.highfidelity.isEditing";
    
    var HEX_NUMBER_BASE = 16;
    var UUID_FULL_LENGTH = 32;
    var UUID_HALF_LENGTH = UUID_FULL_LENGTH * 0.5;
    var UUID_STRIP_REGEX = /[-{}]/g;
    var USER_STORIES_API_URL = Account.metaverseServerURL + '/api/v1/user_stories';
    
    var COLOR_HEX_LENGTH = 10;
    var RED_START = 1;
    var RED_END = RED_START + COLOR_HEX_LENGTH;
    var GREEN_START = RED_END + COLOR_HEX_LENGTH;
    var GREEN_END = GREEN_START + COLOR_HEX_LENGTH;
    var BLUE_START = GREEN_END + COLOR_HEX_LENGTH;
    var BLUE_END = BLUE_START + COLOR_HEX_LENGTH;
    
    var SECONDS_PER_MILLISECOND = 1000;
    var UPDATE_TIMEOUT = 30 * SECONDS_PER_MILLISECOND; // update every 30 seconds
    var MAXIMUM_STARS = 100;
   
    var PROTOCOL = {
        RC65: "jWMeM1PU6wCJjCiLLERaWQ%3D%3D",
        RC66: "Fah%2FlDA1xHOxUYlVAWsiFQ%3D%3D",
        CURRENT: encodeURIComponent(Window.protocolSignature())
    };
    
    var ENCODED_PROTOCOL = PROTOCOL.CURRENT;
    
    var ASSETS_PATH = Script.resolvePath('Star-sprite.png');
    
    var PROJECTION_MODE = {
        STELLAR: 1,
        PLANAR: 2
    };
  
    var SKY_ANGLE = 140;
    var STAR_DISTANCE = 2000;
    
    var STAR_SIZE = 1.5;
    
    var HALF = 0.5;
  
    var MIN_COLOR_VALUE = 40; // was 128, but trying lower to see if I get a better variety of colors
    var MAX_COLOR_VALUE = 255;
 
    var SELECTED_PROJECTION_MODE = PROJECTION_MODE.PLANAR;
    
    var triggerMapping = null;
    
    var request = Script.require('./modules/request.js').request;
    var controllerUtils = Script.require('./modules/controllerUtils.js');
    
    function percentageToColor(percentage) {
        return ((MAX_COLOR_VALUE - MIN_COLOR_VALUE) * percentage) + MIN_COLOR_VALUE;
    }
    
    function reverseString(inputString) {
        return inputString.split("").reverse().join("");
    }
    
    function stripUuid(uuid) {
        if (Uuid.fromString(uuid) === null) {
            return null;
        }
        return uuid.replace(UUID_STRIP_REGEX, '');
    }
    
    // FIXME: it seems that the 2nd and 3th parts of the uuid are not really random
    function getUuidPartToPercentage(strippedUuid, start, end) {
        var hexValue = reverseString(strippedUuid.substr(start, end));
        var value = parseInt(hexValue, HEX_NUMBER_BASE);
        var maxDigits = end - start;
        var maxHexValue = Array(maxDigits + 1).join('f');
        var maxValue = parseInt(maxHexValue, HEX_NUMBER_BASE);

        return value / maxValue;
    }

    function convertUuidToUV(uuid) {
        var strippedUuid = stripUuid(uuid);
        if (strippedUuid === null) {
            return null;
        }

        return {
            u: getUuidPartToPercentage(strippedUuid, 0, UUID_HALF_LENGTH),
            v: getUuidPartToPercentage(strippedUuid, UUID_HALF_LENGTH, UUID_HALF_LENGTH * 2)
        };
    }
    
    function convertUuidToColor(uuid) {
        var strippedUuid = stripUuid(uuid);
        if (strippedUuid === null) {
            return null;
        }
        
        return {
            red: percentageToColor(getUuidPartToPercentage(strippedUuid, RED_START, RED_END)),
            green: percentageToColor(getUuidPartToPercentage(strippedUuid, GREEN_START, GREEN_END)),
            blue: percentageToColor(getUuidPartToPercentage(strippedUuid, BLUE_START, BLUE_END))
        };
    }

    function getStarLocationPosition(parentID, domainID) {
        
        var uvPosition = convertUuidToUV(domainID);

        if (SELECTED_PROJECTION_MODE === PROJECTION_MODE.STELLAR) {
            var starPitchAngle = (uvPosition.u - HALF) * SKY_ANGLE;
            var starRollAngle = (uvPosition.v - HALF) * SKY_ANGLE;

            var localStarDirection = Quat.fromPitchYawRollDegrees(starPitchAngle, 0, starRollAngle);

            return Vec3.multiplyQbyV(localStarDirection, {x: 0, y: STAR_DISTANCE, z: 0});
        }
      
        if (SELECTED_PROJECTION_MODE === PROJECTION_MODE.PLANAR) {
            // TODO only get properties once per batch
            var dimensions = Entities.getEntityProperties(parentID, 'dimensions').dimensions;
            
            return {
                x: dimensions.x * (uvPosition.u - HALF),
                y: HALF * dimensions.y,
                z: dimensions.z * (uvPosition.v - HALF)
            };
        }
        return Vec3.ZERO;
    }
    
    var StarOverlay = (function() {

        function StarOverlay(starOverlayManager, userStory) {

            print(JSON.stringify(userStory));

            var MAX_CONCURRENCY_GROWTH = 10; // stop growing at 10 users
            var MAX_ADDED_STAR_SIZE = STAR_SIZE * 2;

            var calculatedUsers = Math.min(userStory.details.concurrency, MAX_CONCURRENCY_GROWTH);
            var addedUserSize = (calculatedUsers / MAX_CONCURRENCY_GROWTH) * MAX_ADDED_STAR_SIZE;

            this._starOverlayManager = starOverlayManager;
            this.userStory = userStory;
            var parentID = starOverlayManager.getParentID();
            this.localPosition = getStarLocationPosition(parentID, userStory.domain_id);
            var parentProperties = Entities.getEntityProperties(parentID, ['position', 'rotation']);
            this.position = Vec3.sum(parentProperties.position,
                Vec3.multiplyQbyV(parentProperties.rotation, this.localPosition));
            this.id = Overlays.addOverlay("image3d", {
                url: ASSETS_PATH + 'Star-sprite.png',
                position: this.position,
                size: 1,
                scale: STAR_SIZE + addedUserSize,
                color: convertUuidToColor(userStory.domain_id),
                alpha: 1,
                solid: true,
                isFacingAvatar: true,
                drawInFront: false,
                emissive: true
            });
        }

        StarOverlay.prototype = {
            _starOverlayManager: null,
            id: null,
            userStory: null,
            localPosition: null
        };
    
        return StarOverlay;
    })();
    
    var StarOverlayManager = (function() {
        function StarOverlayManager(entityID) {
            this._parentEntityID = entityID;
        }

        StarOverlayManager.prototype = {
            _parentEntityID: null,
            _starOverlays: [],
            _isInTeleportMode: false,
            _placeNameOverlay: null,
            _teleportButtonOverlay: null,
            _selectedLocation: null,
            _parentPropertiesCache: {},
            getParentID: function() {
                return this._parentEntityID;
            },
            cancelTeleportMode: function() {
                if (this._isInTeleportMode) {
                    Overlays.deleteOverlay(this._placeNameOverlay);
                    Overlays.deleteOverlay(this._teleportButtonOverlay);
                    this._isInTeleportMode = false;
                }
            },
            setupTeleportMode: function(overlayID) {
                if (this._isInTeleportMode) {
                    this.cancelTeleportMode();
                }
                var starOverlay = this._starOverlays[overlayID];
                var userStory = starOverlay.userStory;
                this._selectedLocation = 'hifi://' + userStory.place_name + userStory.path;
                
                this._placeNameOverlay = Overlays.addOverlay("text3d", {
                    text: userStory.place_name,
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
                    text: "Go there",
                    dimensions: { x: 4, y: 1 },
                    parentID: starOverlay.id,
                    localPosition: {x: 0, y: -0.5, z: 0},
                    color: { red: 255, green: 255, blue: 255 },
                    alpha: 0.9,
                    lineHeight: 1,
                    backgroundAlpha: 0.2,
                    isFacingAvatar: true,
                    drawInFront: true
                });
                
                this._isInTeleportMode = true;
            },
            handlePickRay: function(pickRay) {
                if (this._isInTeleportMode) {
                    var overlayResult = Overlays.findRayIntersection(pickRay, true, [this._teleportButtonOverlay]);
                    if (overlayResult.intersects) {
                        location = this._selectedLocation;
                        return;
                    }
                }
                
                var overlayResult = Overlays.findRayIntersection(pickRay, true, Object.keys(this._starOverlays));
                if (!overlayResult.intersects) {
                    this.cancelTeleportMode();
                    return;
                }
                
                this.setupTeleportMode(overlayResult.overlayID);
            },
            
            updateStars: function() {
                if (this._isInTeleportMode) {
                    // don't update the stars while in teleport mode
                    return;
                }
                var starOverlayManager = this;
                request(USER_STORIES_API_URL + '?now=' + (new Date()).toISOString() +
                    '&include_actions=concurrency&restriction=open,hifi&require_online=true' +
                    '&protocol=' + ENCODED_PROTOCOL + '&page=1&per_page=' + MAXIMUM_STARS, function (error, data) {
                    starOverlayManager.cleanUp();
                    
                    data.user_stories.forEach(function(userStory) {
                        var newStarOverlay = new StarOverlay(starOverlayManager, userStory);
                        starOverlayManager._starOverlays[newStarOverlay.id] = newStarOverlay;
                    });
                    // delete data.user_stories;
                    // print(JSON.stringify(data));
                });
            },
            cleanUp: function() {
                Object.keys(this._starOverlays).forEach(function(starOverlayID) {
                    Overlays.deleteOverlay(starOverlayID);
                });
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
            triggerMapping.from(trigger).peek().to(function(value) {
                if (value === 1.0) {
                    var hand = (trigger === Controller.Standard.LT ? 
                        Controller.Standard.LeftHand : Controller.Standard.RightHand);
                    var pickRay = controllerUtils.controllerComputePickRay(hand);
                    if (pickRay === null) {
                        console.error('There was a problem computing the pickRay');
                        return;
                    }
                    starOverlayManager.handlePickRay(pickRay);
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
