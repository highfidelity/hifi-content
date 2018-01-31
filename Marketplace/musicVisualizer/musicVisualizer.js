//  
//  musicVisualizer.js
//  A tablet app for spawning particle entities with audio reactivity
//   
//  Author: Elisa Lupin-Jimenez
//  Copyright High Fidelity 2018
//  Editor: Cain Kilgore
//  
//  Licensed under the Apache 2.0 License
//  See accompanying license file or http://apache.org/
//  
//  All assets are under CC Attribution Non-Commerical
//  http://creativecommons.org/licenses/
//  

var LIB = Script.require("./musVisLib.js?" + Date.now());
var MIC_SYNC_SCRIPT = Script.resolvePath("adjuster_scripts/micSync.js?" + Date.now());
var AUDIO_SYNC_SCRIPT = Script.resolvePath("adjuster_scripts/audioFileSync.js?" + Date.now());
var TRAIL_LEFT_SCRIPT = Script.resolvePath("adjuster_scripts/effectTrailerLeft.js?" + Date.now());
var TRAIL_RIGHT_SCRIPT = Script.resolvePath("adjuster_scripts/effectTrailerRight.js?" + Date.now());

var CLEAR_SELECTION_TEXT = "Clear selection";

(function() {

    var APP_NAME = "MUS VIS";
    var APP_URL = "http://mpassets.highfidelity.com/94c95207-e34c-48c8-afae-ad7dd9499a69-v1/music_visualizer.html?" + Date.now();
    var APP_ICON = "http://mpassets.highfidelity.com/94c95207-e34c-48c8-afae-ad7dd9499a69-v1/icons/particles-i-01.svg";
    var APP_ICON_ACTIVE = "http://mpassets.highfidelity.com/94c95207-e34c-48c8-afae-ad7dd9499a69-v1/icons/particles-a-01.svg";
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var DELETE_RADIUS = 500;
    var audioFile = "";
    var existingParticles = [];

    var button = tablet.addButton({
        icon: APP_ICON,
        activeIcon: APP_ICON_ACTIVE,
        text: APP_NAME
    });

    // Activates tablet UI when selected from menu
    function onClicked() {
        if (!shown) {
            tablet.gotoWebScreen(APP_URL);
        } else {
            tablet.gotoHomeScreen();
        }
    }

    button.clicked.connect(onClicked);

    var shown = false;

    // Changes active status of tablet button
    function onScreenChanged(type, url) {
        if (type === 'Web' && url === APP_URL) {
            button.editProperties({ isActive: true });
            if (!shown) {
                tablet.webEventReceived.connect(onWebEventReceived);
            }
            shown = true;
        } else {
            button.editProperties({ isActive: false });
            if (shown) {
                tablet.webEventReceived.disconnect(onWebEventReceived);
            }
            shown = false;
        }
    }

    tablet.screenChanged.connect(onScreenChanged);

    // Gives position right in front of user's avatar
    function getPositionToCreateEntity() {
        var direction = Quat.getFront(MyAvatar.orientation);
        var distance = 0.3;
        var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
        position.y += 0.5;
        return position;
    }

    // adds the particle to world
    function createParticle(effectName, micSync, behavior, file) {
        print(effectName + " particle is being added");
        var position = getPositionToCreateEntity();
        var effectJSON = LIB.getEffect(effectName, LIB.effectLib);
        effectJSON.position = position;
        
        // mic sync and audio file are mutually exclusive
        if (micSync) {
            effectJSON.script = MIC_SYNC_SCRIPT;
            print("attached script: " + effectJSON.script);
        } else if (audioFile) {
            print("the audio file is:" + audioFile + ".");
            effectJSON.userData = JSON.stringify({
                grabbableKey: {
                    grabbable: true,
                    ignoreIK: false
                },
                audio: audioFile
            });
            effectJSON.script = AUDIO_SYNC_SCRIPT;
            print("attached script: " + effectJSON.script);
        }

        // creates invisible sphere as parent to effect
        if (behavior === "dynamic") {
            var invisible = LIB.getEffect("invisible", LIB.effectLib);
            invisible.position = position;
            var invisSphere = Entities.addEntity(invisible);
            effectJSON.parentID = invisSphere;
            var behaviorParticle = Entities.addEntity(effectJSON);
            existingParticles.push(behaviorParticle);
        }

        // creates trail effect
        if (behavior === "finger") {
            effectJSON.isEmitting = false;
            effectJSON.lifespan = 2;
            effectJSON.userData = JSON.stringify({
                grabbableKey: {
                    grabbable: true,
                    ignoreIK: false
                },
                equipHotspots: [{
                    position: {x: 0.11031082272529602, y: 0.19449540972709656, z: 0.0405043363571167},
                    radius: 0.25,
                    joints: {
                        RightHand: [
                            {x: 0.11031082272529602, y: 0.19449540972709656, z: 0.0405043363571167},
                            {x: 0.2807741165161133, y: 0.6332069635391235, z: 0.2997693121433258, w: -0.6557632088661194}
                        ],
                        LeftHand: [
                            {x: -0.10801754891872406, y: 0.15447449684143066, z: 0.030637264251708984},
                            {x: -0.32700979709625244, y: 0.623619794845581, z: 0.28943854570388794, w: 0.6483823657035828}
                        ]
                    },
                    modelURL: 'http://hifi-content.s3.amazonaws.com/alan/dev/equip-Fresnel-3.fbx',
                    modelScale: {
                        x: 1,
                        y: 1,
                        z: 1
                    }
                }]
            });

            var effectLeft = Entities.addEntity(effectJSON);
            var effectRight = Entities.addEntity(effectJSON);

            // an overlay that only the user sees to know when they have equipped finger trails
            var equipLeft = Overlays.addOverlay("sphere", {
                localPosition: {x:0, y:0, z:0},
                parentID: effectLeft,
                parentJointIndex: MyAvatar.getJointIndex("LeftHand"),
                size: 0.05,
                color: { red: 200, green: 200, blue: 200 },
                alpha: 0.5,
                solid: true,
                visible: false
            });
            var equipRight = Overlays.addOverlay("sphere", {
                localPosition: {x:0, y:0, z:0},
                parentID: effectRight,
                parentJointIndex: MyAvatar.getJointIndex("RightHand"),
                size: 0.05,
                color: { red: 200, green: 200, blue: 200 },
                alpha: 0.5,
                solid: true,
                visible: false
            });

            existingParticles.push(effectLeft);
            existingParticles.push(effectRight);
            existingParticles.push(equipLeft);
            existingParticles.push(equipRight);

            // allow time for equip
            Script.setTimeout(function() {
                Messages.sendLocalMessage('Hifi-Hand-Grab', JSON.stringify({
                    hand: "left",
                    entityID: effectLeft
                }));
                Messages.sendLocalMessage('Hifi-Hand-Grab', JSON.stringify({
                    hand: "right",
                    entityID: effectRight
                }));

                var effectLeftProps = Entities.getEntityProperties(effectLeft, "script");
                var effectRightProps = Entities.getEntityProperties(effectRight, "script");
                effectLeftProps.script = TRAIL_LEFT_SCRIPT;
                effectRightProps.script = TRAIL_RIGHT_SCRIPT;
                Entities.editEntity(effectLeft, effectLeftProps);
                Entities.editEntity(effectRight, effectRightProps);

                var equipLeftProps = Entities.getEntityProperties(equipLeft, "visible");
                var equipRightProps = Entities.getEntityProperties(equipRight, "visible");
                equipLeftProps.visible = true;
                equipRightProps.visible = true;
                Overlays.editOverlay(equipLeft, equipLeftProps);
                Overlays.editOverlay(equipRight, equipRightProps);

            }, 700);

            // once particles are equipped tablet must be auto closed
            button.editProperties({ isActive: false });
            tablet.webEventReceived.disconnect(onWebEventReceived);
            tablet.gotoHomeScreen();
            Messages.sendLocalMessage("home", HMD.homeButtonID);
            shown = false;
        }

        if (behavior === "nobehavior") {
            var noBehaviorParticle = Entities.addEntity(effectJSON);
            existingParticles.push(noBehaviorParticle);
        }

        // clears audio file selection
        updateSelection("");
    }

    // to modify HTML page's listed filename
    function updateSelection(filename) {
        if (filename === "") {
            audioFile = "";
        }
        tablet.emitScriptEvent(JSON.stringify({
            "file": filename
        }));
    }

    function onWebEventReceived(event) {
        var htmlEvent = JSON.parse(event);
        print("Event: " + JSON.stringify(htmlEvent));
        // Handles particle button clicks to retrieve the effect JSON from musVisLib
        if (htmlEvent.type === "click") {
            var effectName = htmlEvent.data;
            var micSync = htmlEvent.sync;
            var file = audioFile;
            var behavior = htmlEvent.behavior;
            print("Audio file: " + file);
            createParticle(effectName, micSync, behavior, file);
        // Handles audio file browsing event
        } else if (htmlEvent.type === "chooseAudioFile") {
            if (htmlEvent.value !== CLEAR_SELECTION_TEXT) {
                audioFile = Window.browse("Choose a .wav audio file", "", "*.wav");
                if (audioFile !== null) {
                    var filenameArr = audioFile.split("/");
                    var filename = filenameArr[filenameArr.length - 1];
                    updateSelection(filename);
                } else {
                    updateSelection("");
                }
            } else {
                updateSelection("");
            }
            
        // Resets saved audio file when contradiction present
        } else if (htmlEvent.type === "contradiction") {
            updateSelection("");
        } else if (htmlEvent.type === "cleanUpParticles") {
            cleanUpParticles();
        }
    }

    function cleanUpParticles() {
        print("Cleaning up particles");
        
        var getNearbyEntities = Entities.findEntities(MyAvatar.position, DELETE_RADIUS);
        for (var i = 0; i < getNearbyEntities.length; i++) {
            var nearbyEntity = getNearbyEntities[i];
            var nearbyEntityProperties = Entities.getEntityProperties(nearbyEntity);
            var nearbyEntityName = JSON.stringify(nearbyEntityProperties.name);
            
            if(nearbyEntityName.indexOf("musvis") != -1) {
                print("Found " + nearbyEntityName + ", removing from domain.");
                Entities.deleteEntity(nearbyEntity);
            }
        }
        
    }
    
    // When tablet UI is closed and app is removed from menu
    function cleanup() {
        tablet.removeButton(button);
        if (shown) {
            tablet.webEventReceived.disconnect(onWebEventReceived);
        }
        cleanUpParticles();
    }
    
    Window.domainChanged.connect(cleanUpParticles);
    Script.scriptEnding.connect(cleanup);

}());
