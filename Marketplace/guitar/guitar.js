//
//  guitar.js
//
//  created by Rebecca Stankus on 01/24/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _this;

    var AUDIO_VOLUME_LEVEL = 0.5;
    var MIN_DISTANCE_TO_FINGERTIP = 0.001;
    var FINGER_ENTITY_DIMENSIONS = {x: 0.005,y: 0.005,z: 0.005};
    var POSITION_CHECK_INTERVAL_MS = 100;
    var POSITION_CHECK_TIMEOUT_MS = 3000;
    var STILL_PLAYING_TIMEOUT_MS = 3000;
    var STOP_SOUND_DELAY = 5000;
    var NECK_COLOR_INDEX = 20;
    var RIFF_NUMBER_INDEX = 20;
    var SEARCH_RADIUS = 100;

    var fingerEntities = [];
    var overlays = [];
    var colors = [];
    var distance;
    var interval;
    var ampLeftPosition;
    var ampRightPosition;
    var colorsShowing = false;
    var numberHandsGrabbing = 0;
    var neckGrabColor = "Red";
    var sounds = {};
    var injectorL;
    var injectorR;
    var timeout = null;

    var Guitar = function() {
        _this = this;
    };
    Guitar.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            Overlays.mousePressOnOverlay.connect(this.mousePress);
            Entities.findEntities(_this.entityID, SEARCH_RADIUS).forEach(function(element) {
                var name = Entities.getEntityProperties(element, 'name').name;
                if (name === "Guitar Amp Left CC-BY Poly by Google") {
                    ampLeftPosition = Entities.getEntityProperties(element, 'position').position;
                } else if (name === "Guitar Amp Right CC-BY Poly by Google") {
                    ampRightPosition = Entities.getEntityProperties(element, 'position').position;
                } else if ((name.indexOf("Guitar Body") !== -1) || (name.indexOf("Guitar Neck") !== -1)) {
                    colors.push(element);
                }
            });
            var i;
            for (i =1; i <= 8; i++){
                sounds["Red" + i + "L"] = SoundCache.getSound(Script.resolvePath("sounds/red/" + i + "L.wav"));
                sounds["Red" + i + "R"] = SoundCache.getSound(Script.resolvePath("sounds/red/" + i + "R.wav"));
                sounds["Orange" + i + "L"] = SoundCache.getSound(Script.resolvePath("sounds/orange/" + i + "L.wav"));
                sounds["Orange" + i + "R"] = SoundCache.getSound(Script.resolvePath("sounds/orange/" + i + "R.wav"));
                sounds["Yellow" + i + "L"] = SoundCache.getSound(Script.resolvePath("sounds/yellow/" + i + "L.wav"));
                sounds["Yellow" + i + "R"] = SoundCache.getSound(Script.resolvePath("sounds/yellow/" + i + "R.wav"));
                sounds["Green" + i + "L"] = SoundCache.getSound(Script.resolvePath("sounds/green/" + i + "L.wav"));
                sounds["Green" + i + "R"] = SoundCache.getSound(Script.resolvePath("sounds/green/" + i + "R.wav"));
                sounds["Blue" + i + "L"] = SoundCache.getSound(Script.resolvePath("sounds/blue/" + i + "L.wav"));
                sounds["Blue" + i + "R"] = SoundCache.getSound(Script.resolvePath("sounds/blue/" + i + "R.wav"));
            }
        },
        mousePress: function(id, event) {
            if (overlays.indexOf(id) !== -1) {
                if (timeout) {
                    Script.clearTimeout(timeout);
                    timeout = null;
                }
                timeout = Script.setTimeout(function(){
                    _this.releaseGrab();
                    timeout = null;
                }, STILL_PLAYING_TIMEOUT_MS);
                var name = Overlays.getProperty(id, 'name');
                if (name.indexOf("Neck") !== -1) {
                    neckGrabColor = name.substr(NECK_COLOR_INDEX);
                } else {
                    var currentSoundL = sounds[neckGrabColor + name.substr(RIFF_NUMBER_INDEX) + "L"];
                    var currentSoundR = sounds[neckGrabColor + name.substr(RIFF_NUMBER_INDEX) + "R"];
                    if (currentSoundL.downloaded) {
                        if (injectorL) {
                            injectorL.stop();
                        }
                        injectorL = Audio.playSound(currentSoundL, {
                            position: ampLeftPosition,
                            volume: AUDIO_VOLUME_LEVEL,
                            loop: true
                        });
                    }
                    if (currentSoundR.downloaded) {
                        if (injectorR) {
                            injectorR.stop();
                        }
                        injectorR = Audio.playSound(currentSoundR, {
                            position: ampRightPosition,
                            volume: AUDIO_VOLUME_LEVEL,
                            loop: true
                        });
                    }
                }
            }
        },
        setNeckColor: function(buttonID, params) {
            neckGrabColor = params[0];
        },
        startNearGrab: function() {
            if (!colorsShowing) {
                this.createFingertipEntity("LeftHandMiddle4");
                this.createFingertipEntity("RightHandMiddle4");
                interval = Script.setInterval(this.updatePositions, POSITION_CHECK_INTERVAL_MS);
                Script.setTimeout(function () {
                    Script.clearInterval(interval);
                }, POSITION_CHECK_TIMEOUT_MS);
                this.createBodyOverlays();
                this.createNeckOverlays();
                numberHandsGrabbing = 1;
                colorsShowing = true;
            } else {
                numberHandsGrabbing = 2;
            }
        },
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isRightButton) {
                if (numberHandsGrabbing === 0) {
                    this.startNearGrab();
                    numberHandsGrabbing = 1;
                } else {
                    this.releaseGrab();
                    numberHandsGrabbing = 0;
                }
                
            }
        },
        releaseGrab: function() {
            if (numberHandsGrabbing === 2) {
                numberHandsGrabbing = 1;
            } else {
                colorsShowing = false;
                if (interval) {
                    Script.clearInterval(interval);
                }
                fingerEntities.forEach(function(entity) {
                    Entities.deleteEntity(entity);
                });
                fingerEntities = [];
                overlays.forEach(function(overlay) {
                    Overlays.deleteOverlay(overlay);
                });
                overlays = [];
                if (injectorL) {
                    Script.setTimeout(function() {
                        if (injectorR) {
                            injectorR.stop();
                        }
                        injectorL.stop();
                    }, STOP_SOUND_DELAY);
                }
                numberHandsGrabbing = 0;
            }
        },
        playSound: function(buttonID, params) {
            if (interval) {
                Script.clearInterval(interval);
            }
            var currentSoundL = sounds[neckGrabColor + params[0] + "L"];
            var currentSoundR = sounds[neckGrabColor + params[0] + "R"];
            if (currentSoundL.downloaded) {
                if (injectorL) {
                    injectorL.stop();
                }
                injectorL = Audio.playSound(currentSoundL, {
                    position: ampLeftPosition,
                    volume: AUDIO_VOLUME_LEVEL,
                    loop: true
                });
                
            }
            if (currentSoundR.downloaded) {
                if (injectorR) {
                    injectorR.stop();
                }
                injectorR = Audio.playSound(currentSoundR, {
                    position: ampRightPosition,
                    volume: AUDIO_VOLUME_LEVEL,
                    loop: true
                });
            }
        },
        createFingertipEntity: function(finger) {
            var entityData = {
                angularDamping: 0,
                clientOnly: 0,
                collidesWith: "static,",
                collisionMask: 1,
                damping: 0,
                dimensions: FINGER_ENTITY_DIMENSIONS,
                dynamic: 1,
                name: "Guitar Fingertip Entity",
                parentID: MyAvatar.sessionUUID,
                parentJointName: finger,
                parentJointIndex: MyAvatar.getJointIndex(finger),
                position: "",
                visible: 1,
                type: "Sphere",
                userData: "{\"grabbableKey\":{\"grabbable\":false}}"
            };
            entityData.position = MyAvatar.getJointPosition(finger);
            var fingertipEntity = Entities.addEntity(entityData);
            fingerEntities.push(fingertipEntity);
            this.updatePositions();
        },
        updatePositions: function() {
            fingerEntities.forEach(function(entity) {
                var properties = Entities.getEntityProperties(entity, ['position', 'parentJointIndex']);
                var fingerEntityPosition = properties.position;
                var fingertipPosition = MyAvatar.getJointPosition(properties.parentJointIndex);
                distance = Vec3.distance(fingerEntityPosition, fingertipPosition);
                if (distance > MIN_DISTANCE_TO_FINGERTIP) {
                    Entities.editEntity(entity, {position: fingertipPosition});
                    fingerEntityPosition = Entities.getEntityProperties(entity, 'position').position;
                    fingertipPosition = MyAvatar.getJointPosition(properties.parentJointIndex);
                    distance = Vec3.distance(fingerEntityPosition, fingertipPosition);
                }
            });
        },
        createBodyOverlays: function() {
            var riff1 = Overlays.addOverlay("sphere", {
                name: "Guitar Body Overlay 1",
                color: {
                    red: 250,
                    green: 122,
                    blue: 122
                },
                alpha: 0.5,
                dimensions: {
                    x: 0.045,
                    y: 0.0008,
                    z: 0.045
                },
                glow: 1,
                localPosition: {
                    x:0.06207275390625,
                    y:-0.2640190124511719,
                    z:0.016750335693359375
                },
                localRotation: {
                    x:-0.5052415132522583,
                    y:-0.494163453578949,
                    z:-0.494346559047699,
                    w:-0.5061875581741333
                },
                parentID: _this.entityID
            });
            overlays.push(riff1);
            var riff2 = Overlays.addOverlay("sphere", {
                name: "Guitar Body Overlay 2",
                color: {
                    red: 187,
                    green: 85,
                    blue: 250
                },
                alpha: 0.5,
                dimensions: {
                    x: 0.045,
                    y: 0.0008,
                    z: 0.045
                },
                glow: 1,
                localPosition: {
                    x:0.06076812744140625,
                    y:-0.3140449523925781,
                    z:0.01674365997314453
                },
                localRotation: {
                    x:-0.5052415132522583,
                    y:-0.494163453578949,
                    z:-0.494346559047699,
                    w:-0.5061875581741333
                },
                parentID: _this.entityID
            });
            overlays.push(riff2);
            var riff3 = Overlays.addOverlay("sphere", {
                name: "Guitar Body Overlay 3",
                color: {
                    red: 117,
                    green: 250,
                    blue: 208
                },
                alpha: 0.5,
                dimensions: {
                    x: 0.045,
                    y: 0.0008,
                    z: 0.045
                },
                glow: 1,
                localPosition: {
                    x:0.059360504150390625,
                    y:-0.3642120361328125,
                    z:0.016768455505371094
                },
                localRotation: {
                    x:-0.5052415132522583,
                    y:-0.494163453578949,
                    z:-0.494346559047699,
                    w:-0.5061875581741333
                },
                parentID: _this.entityID
            });
            overlays.push(riff3);
            var riff4 = Overlays.addOverlay("sphere", {
                name: "Guitar Body Overlay 4",
                color: {
                    red: 247,
                    green: 239,
                    blue: 143
                },
                alpha: 0.5,
                dimensions: {
                    x: 0.045,
                    y: 0.0008,
                    z: 0.045
                },
                glow: 1,
                localPosition: {
                    x:0.05805778503417969,
                    y:-0.41423797607421875,
                    z:0.01675701141357422
                },
                localRotation: {
                    x:-0.5052415132522583,
                    y:-0.494163453578949,
                    z:-0.494346559047699,
                    w:-0.5061875581741333
                },
                parentID: _this.entityID
            });
            overlays.push(riff4);
            var riff5 = Overlays.addOverlay("sphere", {
                name: "Guitar Body Overlay 5",
                size: 1,
                color: {
                    red: 138,
                    green: 126,
                    blue: 1
                },
                alpha: 0.5,
                dimensions: {
                    x: 0.045,
                    y: 0.0008,
                    z: 0.045
                },
                glow: 1,
                localPosition: {
                    x:-0.04220008850097656,
                    y:-0.4119873046875,
                    z:0.01667499542236328
                },
                localRotation: {
                    x:-0.5052415132522583,
                    y:-0.494163453578949,
                    z:-0.494346559047699,
                    w:-0.5061875581741333
                },
                parentID: _this.entityID
            });
            overlays.push(riff5);
            var riff6 = Overlays.addOverlay("sphere", {
                name: "Guitar Body Overlay 6",
                color: {
                    red: 2,
                    green: 94,
                    blue: 65
                },
                alpha: 0.5,
                dimensions: {
                    x: 0.045,
                    y: 0.0008,
                    z: 0.045
                },
                glow: 1,
                localPosition: {
                    x:-0.04091644287109375,
                    y:-0.36196136474609375,
                    z:0.016693115234375
                },
                localRotation: {
                    x:-0.5052415132522583,
                    y:-0.494163453578949,
                    z:-0.494346559047699,
                    w:-0.5061875581741333
                },
                parentID: _this.entityID
            });
            overlays.push(riff6);
            var riff7 = Overlays.addOverlay("sphere", {
                name: "Guitar Body Overlay 7",
                color: {
                    red: 81,
                    green: 3,
                    blue: 130
                },
                alpha: 0.5,
                dimensions: {
                    x: 0.045,
                    y: 0.0008,
                    z: 0.045
                },
                glow: 1,
                localPosition: {
                    x:-0.03951072692871094,
                    y:-0.31179046630859375,
                    z:0.01667022705078125
                },
                localRotation: {
                    x:-0.5052415132522583,
                    y:-0.494163453578949,
                    z:-0.494346559047699,
                    w:-0.5061875581741333
                },
                parentID: _this.entityID
            });
            overlays.push(riff7);
            var riff8 = Overlays.addOverlay("sphere", {
                name: "Guitar Body Overlay 8",
                color: {
                    red: 232,
                    green: 19,
                    blue: 75
                },
                alpha: 0.5,
                dimensions: {
                    x: 0.045,
                    y: 0.0008,
                    z: 0.045
                },
                glow: 1,
                localPosition: {
                    x:-0.03822517395019531,
                    y:-0.26175689697265625,
                    z:0.01668262481689453
                },
                localRotation: {
                    x:-0.5052415132522583,
                    y:-0.494163453578949,
                    z:-0.494346559047699,
                    w:-0.5061875581741333
                },
                parentID: _this.entityID
            });
            overlays.push(riff8);
        },
        createNeckOverlays: function() {
            var red = Overlays.addOverlay("sphere", {
                name: "Guitar Neck Overlay Red",
                color: {
                    blue: 0,
                    green: 0,
                    red: 255
                },
                alpha: 0.5,
                dimensions: {
                    x: 0.05,
                    y: 0.0008,
                    z: 0.075
                },
                glow: 1,
                localPosition: {
                    x:0.02330160140991211,
                    y:0.31251323223114014,
                    z:0.02842235565185547
                },
                localRotation: {
                    x:0.7065384387969971,
                    y:0.014816522598266602,
                    z:0.015579462051391602,
                    w:0.7073320150375366
                },
                parentID: _this.entityID
            });
            overlays.push(red);
            var orange = Overlays.addOverlay("sphere", {
                name: "Guitar Neck Overlay Orange",
                color: {
                    blue: 0,
                    green: 68,
                    red: 255
                },
                alpha: 0.5,
                dimensions: {
                    x: 0.05,
                    y: 0.0008,
                    z: 0.075
                },
                glow: 1,
                localPosition: {
                    x:0.020969390869140625,
                    y:0.21316003799438477,
                    z:0.02842235565185547
                },
                localRotation: {
                    x:0.7066299915313721,
                    y:0.014816522598266602,
                    z:0.015609979629516602,
                    w:0.7072099447250366
                },
                parentID: _this.entityID
            });
            overlays.push(orange);
            var yellow = Overlays.addOverlay("sphere", {
                name: "Guitar Neck Overlay Yellow",
                color: {
                    blue: 8,
                    green: 247,
                    red: 255
                },
                alpha: 0.5,
                dimensions: {
                    x: 0.05,
                    y: 0.0008,
                    z: 0.075
                },
                glow: 1,
                localPosition: {
                    x:0.01756763458251953,
                    y:0.11455994844436646,
                    z:0.02849578857421875
                },
                localRotation: {
                    x:-0.7066910862922668,
                    y:-0.014389276504516602,
                    z:-0.015182733535766602,
                    w:-0.7072709202766418
                },
                parentID: _this.entityID
            });
            overlays.push(yellow);
            var green = Overlays.addOverlay("sphere", {
                name: "Guitar Neck Overlay Green",
                color: {
                    blue: 15,
                    green: 148,
                    red: 3
                },
                alpha: 0.5,
                dimensions: {
                    x: 0.05,
                    y: 0.0008,
                    z: 0.075
                },
                glow: 1,
                localPosition: {
                    x:0.015446662902832031,
                    y:0.01676046848297119,
                    z:0.028522491455078125
                },
                localRotation: {
                    x:-0.7066910862922668,
                    y:-0.014175653457641602,
                    z:-0.014969110488891602,
                    w:-0.7072709202766418
                },
                parentID: _this.entityID
            });
            overlays.push(green);
            var blue = Overlays.addOverlay("sphere", {
                name: "Guitar Neck Overlay Blue",
                color: {
                    blue: 222,
                    green: 101,
                    red: 27
                },
                alpha: 0.5,
                dimensions: {
                    x: 0.05,
                    y: 0.0008,
                    z: 0.075
                },
                glow: 1,
                localPosition: {
                    x:0.012490272521972656,
                    y:-0.08011186122894287,
                    z:0.028550148010253906
                },
                localRotation: {
                    x:-0.7066910862922668,
                    y:-0.013504207134246826,
                    z:-0.014297723770141602,
                    w:-0.7072709202766418
                },
                parentID: _this.entityID,
                localDimensions: {
                    x:0.07163000851869583,
                    y:0.0010000000474974513,
                    z:0.09855818003416061}
            });
            overlays.push(blue);
            
        },
        unload: function() {
            if (injectorL) {
                injectorL.stop();
            }
            if (injectorR) {
                injectorR.stop();
            }
            this.releaseGrab();
        }
    };

    return new Guitar;
});
