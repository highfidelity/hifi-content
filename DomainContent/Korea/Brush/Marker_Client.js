// Marker_Server.js
//
// Copyright 2018 High Fidelity, Inc.
// Created by Robin Wilson and Milad Nazeri 7/5/2018
// Expands on fingerPaint.js created by David Rowe 15 Feb 2017
// 
// Client script to the marker entity. Maps controls to users and sends requests to Marker_Server to create polylines.
// Works with Marker_Server.js.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {
    var entityID;

    var START_DRAW_TIMEOUT = 350, // MS

        leftHand = null,
        rightHand = null,

        RIGHT = "right",
        LEFT = "left",

        CONTROLLER_MAPPING_LEFT = "com.highfidelity.markerLeft",
        CONTROLLER_MAPPING_RIGHT = "com.highfidelity.markerRight",

        ERASE_SEARCH_RADIUS = 0.1,
        DEBUG_MARKER_CLIENT = true;

    function onEquip(hand) {
        if (DEBUG_MARKER_CLIENT){
            console.info("$$$ onEquip ", hand);
        }

        Script.setTimeout(function() {
            var oppositeMarkerID = utils.hasMarkerInOppositeHand(hand);
            if (oppositeMarkerID){
                Entities.callEntityMethod(oppositeMarkerID, "oppositeHandDisableProcessing", [hand]);
                processing.enableOneHand(hand);
            } else {
                processing.enableBothHands(hand);
            }
        }, START_DRAW_TIMEOUT);
    }


    function onUnequip(hand) {
        if (DEBUG_MARKER_CLIENT){
            console.info("$$$ Un-Equip", hand);
        }

        drawing.oncancelLine();

        var oppositeMarkerID = utils.hasMarkerInOppositeHand(hand);
        if (oppositeMarkerID){
            if (DEBUG_MARKER_CLIENT){
                console.info("$$$ opp", hand);
            }
            processing.disableOneHand(hand, oppositeMarkerID);
        } else {
            if (DEBUG_MARKER_CLIENT){
                console.info("$$$ both", hand);
            }
            processing.disableBothHands();
        }
    }


    function handController(name) {
        // Translates controller data into application events.
        var handName = name,
    
            triggerPressedCallback,
            triggerPressingCallback,
            triggerReleasedCallback,
            gripPressedCallback,
            onTearDownCallback,
    
            rawTriggerValue = 0.0,
            triggerValue = 0.0,
            isTriggerPressed = false,
            TRIGGER_SMOOTH_RATIO = 0.1,
            TRIGGER_OFF = 0.05,
            TRIGGER_ON = 0.1,
            TRIGGER_START_WIDTH_RAMP = 0.15,
            TRIGGER_FINISH_WIDTH_RAMP = 1.0,
            TRIGGER_RAMP_WIDTH = TRIGGER_FINISH_WIDTH_RAMP - TRIGGER_START_WIDTH_RAMP,
            MIN_LINE_WIDTH = 0.002,
            MAX_LINE_WIDTH = 0.013,
            RAMP_LINE_WIDTH = MAX_LINE_WIDTH - MIN_LINE_WIDTH,
    
            rawGripValue = 0.0,
            gripValue = 0.0,
            isGripPressed = false,
            GRIP_SMOOTH_RATIO = 0.1,
            GRIP_OFF = 0.05,
            GRIP_ON = 0.1;
    
        function onTriggerPress(value) {
            // Controller values are only updated when they change so store latest for use in update.
            rawTriggerValue = value;
        }
    
        function updateTriggerPress(value) {
            var wasTriggerPressed,
                // fingerTipPosition,
                lineWidth;
    
            triggerValue = triggerValue * TRIGGER_SMOOTH_RATIO + rawTriggerValue * (1.0 - TRIGGER_SMOOTH_RATIO);
    
            wasTriggerPressed = isTriggerPressed;
            if (isTriggerPressed) {
                isTriggerPressed = triggerValue > TRIGGER_OFF;
            } else {
                isTriggerPressed = triggerValue > TRIGGER_ON;
            }
    
            if (wasTriggerPressed || isTriggerPressed) {
                // fingerTipPosition = MyAvatar.getJointPosition(handName === LEFT ? "LeftHandIndex4" : "RightHandIndex4");
                if (triggerValue < TRIGGER_START_WIDTH_RAMP) {
                    lineWidth = MIN_LINE_WIDTH;
                } else {
                    lineWidth = MIN_LINE_WIDTH
                        + (triggerValue - TRIGGER_START_WIDTH_RAMP) / TRIGGER_RAMP_WIDTH * RAMP_LINE_WIDTH;
                }
    
                if (!wasTriggerPressed && isTriggerPressed) {
                    triggerPressedCallback(lineWidth);
                } else if (wasTriggerPressed && isTriggerPressed) {
                    triggerPressingCallback(lineWidth);
                } else {
                    triggerReleasedCallback(lineWidth);
                }
            }
        }
    
        function onGripPress(value) {
            // Controller values are only updated when they change so store latest for use in update.
            rawGripValue = value;
        }
    
        function updateGripPress() {
            var fingerTipPosition;
    
            gripValue = gripValue * GRIP_SMOOTH_RATIO + rawGripValue * (1.0 - GRIP_SMOOTH_RATIO);
    
            if (isGripPressed) {
                isGripPressed = gripValue > GRIP_OFF;
            } else {
                isGripPressed = gripValue > GRIP_ON;
                if (isGripPressed) {
                    fingerTipPosition = MyAvatar.getJointPosition(handName === LEFT ? "LeftHandIndex4" : "RightHandIndex4");
                    gripPressedCallback(fingerTipPosition);
                }
            }
        }
    
        function onUpdate() {
            updateTriggerPress();
            updateGripPress();
        }
    
        function setUp(onTriggerPressed, onTriggerPressing, onTriggerReleased, onGripPressed, onTearDown) {
            triggerPressedCallback = onTriggerPressed;
            triggerPressingCallback = onTriggerPressing;
            triggerReleasedCallback = onTriggerReleased;
            gripPressedCallback = onGripPressed;
            onTearDownCallback = onTearDown ? onTearDown : utils.noop;
        }
    
        function tearDown() {
            onTearDownCallback();
        }
    
        return {
            onTriggerPress: onTriggerPress,
            onGripPress: onGripPress,
            onUpdate: onUpdate,
            setUp: setUp,
            tearDown: tearDown
        };
    }

    var utils = {
        noop: function() {
            // blank
        },
        getMarkerTipPosition: function (){

            var markerProperties = Entities.getEntityProperties(entityID, ["position", "dimensions", "rotation"]);
            
            if (markerProperties.position){

                var markerTipPosition = Vec3.sum(
                    markerProperties.position, 
                    Vec3.multiplyQbyV(markerProperties.rotation, { x: 0, y: 0, z: -(markerProperties.dimensions.z/2) })
                );
                return markerTipPosition;

            } else {

                drawing.oncancelLine();
                return;

            }
        },
        getEquippedMarkerID: function (hand){
            // function called in hasMarkerInOppositeHand and hasMarkerInHand
            // hand is  "RightHand" or "LeftHand"
            var markerID;
            var equippedItemIDs = Entities.getChildrenIDsOfJoint(MyAvatar.sessionUUID, MyAvatar.getJointIndex(hand));

            equippedItemIDs.forEach(function (itemID) {

                var itemName = Entities.getEntityProperties(itemID, ['name']).name;
                if (itemName && itemName.indexOf("marker-clone") !== -1){
                    markerID = itemID;
                }
            });

            return markerID;
        },
        hasMarkerInOppositeHand: function (hand) {
            // checks objects equipped to the opposite hand
            // if opposite hand is equipped with a marker clone, will return the markerID
            // else returns undefined

            if (hand === LEFT || hand === RIGHT){
                var oppositeHand = hand === LEFT ? "RightHand" : "LeftHand";
                var oppositeHandMarkerID = this.getEquippedMarkerID(oppositeHand);

                return oppositeHandMarkerID;
            } else {
                console.error("Error: Hand is neither right or left. Issue with utility method hasMarkerInOppositeHand.");
            }
        },
        hasMarkerInHand: function (hand) {
            // checks objects equipped to the hand
            // if hand is equipped with a marker clone, will return the markerID
            // else returns undefined

            if (hand === LEFT || hand === RIGHT){
                var curHand = hand === LEFT ? "LeftHand" : "RightHand";
                var markerID = this.getEquippedMarkerID(curHand);
        
                return markerID;
            } else {
                console.error("Error: Hand is neither right or left. Issue with utility method hasMarkerInHand.");
            }
        }
    };

    var drawing = {
        // handles the drawing methods
        onStartLine: function (width){
            if (DEBUG_MARKER_CLIENT){
                console.info("startline");
            }

            var markerTipPos = utils.getMarkerTipPosition();

            if (markerTipPos){
                var position = JSON.stringify(markerTipPos);
                var strWidth = String(width);    
                var markerRotation = Entities.getEntityProperties(entityID, ["rotation"]).rotation;
                var orientation = JSON.stringify(markerRotation);
        
                Entities.callEntityServerMethod(entityID, "startLine", [position, strWidth, orientation]);
            } else {
                console.error("Error: markerTipPosition has an issue in startLine.");
            }
        },

        onDrawLine: function (width){
    
            var markerTipPos = utils.getMarkerTipPosition();

            if (markerTipPos) {
                var position = JSON.stringify(markerTipPos);
                var strWidth = String(width);
        
                Entities.callEntityServerMethod(entityID, "drawLine", [position, strWidth]);
            } else {
                console.error("Error: markerTipPosition has an issue in drawLine.");
            }
        },

        onFinishLine: function (width){

            var markerTipPos = utils.getMarkerTipPosition();

            if (markerTipPos) {
                var position = JSON.stringify(markerTipPos);
                var strWidth = String(width);
        
                Entities.callEntityServerMethod(entityID, "finishLine", [position, strWidth]);
            } else {
                console.error("Error: markerTipPosition has an issue in FinishLine.");
            }
        },

        onEraseClosestLine: function (position){
    
            // Find entities with bounding box within search radius.
            var entities = Entities.findEntities(position, ERASE_SEARCH_RADIUS);
            var polylines = [];
            
            // Find polyline entity with closest point within search radius.
            for (var i = 0, entitiesLength = entities.length; i < entitiesLength; i += 1) {
                var properties = Entities.getEntityProperties(entities[i], ["type", "position", "linePoints"]);
                if (properties.type === "PolyLine") {
                    polylines.push(properties);
                }
            }
            var strPosition = JSON.stringify(position);
            var strPolylines = JSON.stringify(polylines);

            Entities.callEntityServerMethod(entityID, "eraseClosestLine", [strPosition, strPolylines]);
        },
        
        oncancelLine: function (){
            Entities.callEntityServerMethod(entityID, "cancelLine");
        }
    };

    var hands = {
        // handles hand setups and disabling 
        mapControls: function (hand){
            if (DEBUG_MARKER_CLIENT){
                console.info("$$$ Setup ", hand);
            }

            var controllerMapping;

            if (hand === LEFT){
                leftHand = handController(LEFT);
                controllerMapping = Controller.newMapping(CONTROLLER_MAPPING_LEFT);
                controllerMapping.from(Controller.Standard.LT).to(leftHand.onTriggerPress);
                controllerMapping.from(Controller.Standard.LeftGrip).to(leftHand.onGripPress);
        
                Controller.enableMapping(CONTROLLER_MAPPING_LEFT);
            } else if (hand === RIGHT){
                rightHand = handController(RIGHT);
                controllerMapping = Controller.newMapping(CONTROLLER_MAPPING_RIGHT);
                controllerMapping.from(Controller.Standard.RT).to(rightHand.onTriggerPress);
                controllerMapping.from(Controller.Standard.RightGrip).to(rightHand.onGripPress);
        
                Controller.enableMapping(CONTROLLER_MAPPING_RIGHT);
            } else {
                console.error("Error: Hand is neither right or left. Issue with mapControls.");
            }
        },
        setupErase: function (hand){
            if (DEBUG_MARKER_CLIENT){
                console.info("$$$ Setup Erase ", hand);
            }

            if (hand === LEFT){

                leftHand.setUp(utils.noop, utils.noop, utils.noop, drawing.onEraseClosestLine);
                Script.update.connect(leftHand.onUpdate);

            } else if (hand === RIGHT) {

                rightHand.setUp(utils.noop, utils.noop, utils.noop, drawing.onEraseClosestLine);
                Script.update.connect(rightHand.onUpdate);

            } else {
                console.error("Error: Hand is neither right or left. Issue with setupErase.");
            }
        },
        setupDraw: function (hand){
            if (DEBUG_MARKER_CLIENT){
                console.info("$$$ Setup Draw ", hand);
            }

            if (hand === LEFT){
                leftHand.setUp(drawing.onStartLine, drawing.onDrawLine, drawing.onFinishLine, utils.noop);
                Script.update.connect(leftHand.onUpdate);
            } else if (hand === RIGHT) {
                rightHand.setUp(drawing.onStartLine, drawing.onDrawLine, drawing.onFinishLine, utils.noop);
                Script.update.connect(rightHand.onUpdate);
            } else {
                console.error("Error: Hand is neither right or left. Issue with setupDraw.");
            }
        },
        disableProcessing: function (hand) {
            if (DEBUG_MARKER_CLIENT){
                console.info("$$$ Disable ", hand);
            }

            if (hand === LEFT){

                if (leftHand){
                    Script.update.disconnect(leftHand.onUpdate);
                } 
                Controller.disableMapping(CONTROLLER_MAPPING_LEFT);
                if (leftHand){
                    leftHand.tearDown();
                } 

            } else if (hand === RIGHT) {

                if (rightHand){
                    Script.update.disconnect(rightHand.onUpdate);
                } 
                Controller.disableMapping(CONTROLLER_MAPPING_RIGHT);
                if (rightHand){
                    rightHand.tearDown();
                } 

            } else {
                console.error("Error: Hand is neither right or left. Issue with disableProcessing.");
            }
        }
    };

    var processing = {
        // handles full setup and disabling steps
        enableBothHands: function (hand) {
    
            hands.mapControls(LEFT);
            hands.mapControls(RIGHT);
            hands.setupDraw(hand);
            hands.setupErase(hand === LEFT ? RIGHT : LEFT); // opposite hand
        
        },
        enableOneHand: function (hand) {
            // hasMarker in other hand, map controls but only setup draw
            hands.mapControls(hand);
            hands.setupDraw(hand);
        },
        disableBothHands: function () {
            if (DEBUG_MARKER_CLIENT){
                console.info("$$$ BOTH Hand Disable ");
            }

            hands.disableProcessing(LEFT);
            hands.disableProcessing(RIGHT);
    
            onTearDown();
        },
        disableOneHand: function (hand, oppositeMarkerID) {
            if (DEBUG_MARKER_CLIENT){
                console.info("$$$ ONE Hand Disable ", hand);
            }
            // other hand hasMarker
            // param hand is the current hand to disable
            hands.disableProcessing(hand);
    
            // setup erase on current hand
            Entities.callEntityMethod(oppositeMarkerID, "oppositeHandSetupErase", [hand]);
    
            onTearDown();
        }
    };
    
    function onTearDown(){
        Entities.callEntityServerMethod(entityID, "tearDown"); // calls cancel line
        leftHand = null;
        rightHand = null;
    }

    function MarkerClient() {

    }

    MarkerClient.prototype = {
        grabbed: false,
        hand: "",
        preload: function (id) {
            // blank
        },
        startEquip: function (id, handInfo){
            if (DEBUG_MARKER_CLIENT){
                console.info("$$$ $$$ $$$ Start Equip ");
            }

            entityID = id;

            var self = this;
            var hand = handInfo[0];
            
            // FOR CLONING
            // timeout ensures drawing.cancelLine is not called too soon
            if (this.grabbed === false){
                Script.setTimeout(function(){
                    this.hand = hand;
                    self.grabbed = true;
                    onEquip(hand);
                }, 500);
            }
        },
        releaseEquip: function (id, handInfo) {
            var hand = handInfo[0];

            if (DEBUG_MARKER_CLIENT){
                console.info("$$$ $$$ $$$ Releasing ");
            }

            this.hand = "";
            this.grabbed = false;
            onUnequip(hand); 
        },
        oppositeHandSetupErase: function (id, handInfo) {
            // called on unequip of otherMarker to set up erase
            
            var hand = handInfo[0]; // hand is the one to setup Erase

            if (hand === LEFT || hand === RIGHT) {
                var markerIDInHand = utils.hasMarkerInHand(hand === LEFT ? RIGHT : LEFT);
                
                if (markerIDInHand && markerIDInHand === entityID){
                    hands.mapControls(hand);
                    hands.setupErase(hand);

                    if (DEBUG_MARKER_CLIENT){
                        console.info("$$$ Opp Hand Setup Erase ", hand);
                    }
                }
            } else {
                console.error("Error: Hand is neither right or left. Issue with oppositeHandSetupErase.");
            }

        },
        oppositeHandDisableProcessing: function (id, handInfo) {
            // called on equip of otherMarker to disable erase
            var hand = handInfo[0];
            hands.disableProcessing(hand);

            if (DEBUG_MARKER_CLIENT){
                console.info("$$$ Opp Hand Disable ", hand);
            }
        },
        unload: function () {
            if (this.hand !== "") {
                onUnequip(this.hand);
            }
        }
    };

    function tearDown() {
        
        if (DEBUG_MARKER_CLIENT){
            console.info("$$$ ScriptEnding TearDown Both Hands");
        }

        // full tear down
        processing.disableBothHands();
        leftHand = null;
        rightHand = null;
    }

    Script.scriptEnding.connect(tearDown);

    return new MarkerClient();
});
