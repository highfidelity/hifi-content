//
//  smartBoardZoneClient.js
//
//  Additional code by Milad Nazeri 10/30/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
/* globals Screenshare */

(function() {
    var DEBUG = true;
    // DEPENDENCIES
    var CONFIG = Script.require("./config.js");

    // WHITEBOARD FUNCTIONS
    /* PLAY A SOUND: Plays a sound at the specified position, volume, local mode, and playback 
    mode requested. */
    var injector;
    function playSound(sound, volume, position, localOnly, loop) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
                injector = null;
            }
            injector = Audio.playSound(sound, {
                position: position,
                volume: volume,
                localOnly: localOnly,
                loop: loop
            });
        }
    }


    /* Convert RGB value to 0-1 scale */
    var RGB_MAX_VALUE = 255;
    var DECIMAL_PLACES = 2;
    function rgbConversion(rgbColorValue) {
        return (rgbColorValue/RGB_MAX_VALUE).toFixed(DECIMAL_PLACES);
    }


    /* Check for existing paint sphere and delete if found  */
    function removePaintSpheres() {
        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            var name = Entities.getEntityProperties(avatarEntity.id, 'name').name;
            if (name && (name === "Whiteboard Paint Sphere" || name === "Whiteboard Paint Sphere Material")) {
                Entities.deleteEntity(avatarEntity.id);
            }
        });
    }


    // BOARD UI
    // If a new avatar enters the SmartBoard Zone:
    //     1. This client script will call `registerParticipant()` on the SmartBoard Zone server script.
    //     2. The server script will do some stuff, then call `receiveBoardState()` (below) on the client
    //         who just registered.
    // If the ESS detects that the broadcasting avatar has left the domain:
    //     1. The SmartBoard Zone server script will call `receiveBoardState()` (below) on all clients
    //         whose avatars are inside the SmartBoard zone.
    function receiveBoardState(id, args) {
        _this.currentBoardState = args[0];
        _this.activePresenterUUID = args[1];

        if (DEBUG) {
            console.log("smartBoardZoneClient.js: " + _this.entityID + ": `receiveBoardState()`." +
                "\n`_this.currentBoardState`: " + _this.currentBoardState + "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }

        if (_this.currentBoardState === "screenshare") {
            if (_this.activePresenterUUID === MyAvatar.sessionUUID) {
                Screenshare.startScreenshare(_this.roomName);
            }
            maybeCreateLocalWebEntity();
        } else {
            maybeRemoveLocalWebEntity();
        }

        updateButtonState();
    }


    // Updates the state of the local entity buttons.
    // Send the `activePresenterUUID` (even if it's empty) - that helps the buttons know who can change the SmartBoard's state.
    function updateButtonState() {
        if (!buttonIsReady) {
            return;
        }

        if (DEBUG) {
            console.log("smartBoardZoneClient.js: " + _this.entityID + ": `updateButtonState()`.");
        }

        Entities.callEntityMethod(_this.whiteboardButtonID, "updateButtonState",
            [_this.currentBoardState === "whiteboard", _this.activePresenterUUID]);
        Entities.callEntityMethod(_this.screenshareButtonID, "updateButtonState",
            [_this.currentBoardState !== "whiteboard", _this.activePresenterUUID]);
    }


    // Signal to make sure the buttons are loaded when first entering the zone
    // for help avoiding race conditions on the initial state setup
    var buttonIsReady = false;
    function buttonPreloadComplete() {
        if (DEBUG) {
            console.log("smartBoardZoneClient.js: " + _this.entityID + ": `buttonPreloadComplete()`.");
        }

        buttonIsReady = true;
        updateButtonState();
    }


    // Create the local screenshare and whiteboard buttons when someone enters
    // Probably will need to add an additional "zoom" button
    var boardDimensions;
    var offset;
    var margin = 0.025;
    var HALF = 2;
    var THIRD = 3;
    var STATIC_BUTTON_PROPS = {
        type: "Sphere",
        dimensions: {x: 0.25, y: 0.25, z: 0.03},
        script: Script.resolvePath("./boardButtonClient.js?" + Date.now()),
        localPosition: {x: 0, y: 0, z: -1}
    };
    var INITIAL_BUTTON_COLOR = {r: 0, g: 0, b: 0};
    function createLocalButtons() {
        if (DEBUG) {
            console.log("smartBoardZoneClient.js: " + _this.entityID + ": `createLocalButtons()`.");
        }

        var whiteboardButtonX = -(boardDimensions.x / HALF) + (STATIC_BUTTON_PROPS.dimensions.x / HALF) + margin;
        var whiteboardButtonY = -(boardDimensions.y / HALF) + (STATIC_BUTTON_PROPS.dimensions.y / HALF) + margin;

        var buttonProps = STATIC_BUTTON_PROPS;
        buttonProps.parentID = _this.whiteboard;
        buttonProps.localPosition = {x: whiteboardButtonX, y: whiteboardButtonY, z: offset};
        buttonProps.name = "SmartBoard - Whiteboard Button";
        buttonProps.color = INITIAL_BUTTON_COLOR;
        _this.whiteboardButtonID = Entities.addEntity(buttonProps, 'local');

        if (!_this.whiteboardOnlyZone) {
            // Bottom margin empirically determined
            buttonProps.localPosition.y -= whiteboardButtonY / THIRD;
            buttonProps.name = "SmartBoard - Screenshare Button";
            buttonProps.color = INITIAL_BUTTON_COLOR;
            _this.screenshareButtonID = Entities.addEntity(buttonProps, 'local');
        }
    }


    // remove the local buttons when someone leaves the zone
    function maybeRemoveLocalButtons() {
        if (DEBUG) {
            console.log("smartBoardZoneClient.js: " + _this.entityID + ": `maybeRemoveLocalButtons()`.");
        }

        if (_this.whiteboardButtonID) {
            Entities.deleteEntity(_this.whiteboardButtonID);
            _this.whiteboardButtonID = false;
        }

        if (_this.screenshareButtonID) {
            Entities.deleteEntity(_this.screenshareButtonID);
            _this.screenshareButtonID = false;
        }
    }


    // create the local web entity only when there is a screenshare initiated
    // this may be moved to the participant script
    var STATIC_LOCAL_WEB_ENTITY_PROPS = {
        type: "Web",
        maxFPS: 30
    };
    var boardPosition;
    function maybeCreateLocalWebEntity() {
        if (_this.localWebEntityID) {
            return;
        }

        if (DEBUG) {
            console.log("smartBoardZoneClient.js: " + _this.entityID + ": `maybeCreateLocalWebEntity()`: Creating local web entity...");
        }

        var localWebEntityProps = STATIC_LOCAL_WEB_ENTITY_PROPS;
        localWebEntityProps.localPosition = {x: 0, y: 0, z: offset};
        localWebEntityProps.parentID = _this.whiteboard;
        localWebEntityProps.dimensions = boardDimensions;
        // Will point to local HTML file
        localWebEntityProps.sourceUrl = CONFIG.sourceURL;
        localWebEntityProps.position = boardPosition;

        _this.localWebEntityID = Entities.addEntity(localWebEntityProps, 'local');
    }


    // removed when a screenshare ends or a user leaves the zone
    function maybeRemoveLocalWebEntity() {
        if (_this.localWebEntityID) {
            if (DEBUG) {
                console.log("smartBoardZoneClient.js: " + _this.entityID + ": `maybeRemoveLocalWebEntity()`: Deleting local web entity...");
            }

            Entities.deleteEntity(_this.localWebEntityID);
        }
        _this.localWebEntityID = false;
    }


    function onScreenshareStopped() {
        if (DEBUG) {
            console.log("smartBoardZoneClient.js: " + _this.entityID + ": `onScreenshareStopped()`.");
        }
        
        Entities.callEntityServerMethod(_this.entityID, "updateCurrentBoardState", ["whiteboard", ""]);
    }


    // ENTITY SIGNALS
    // 1. get the whiteboard parent, the dimensions/position of the board for button and web entity positioning
    // 2. get the setup information such as roomName and whether this is a whiteboard only zone
    var signalsConnected = false;
    function preload(entityID) {
        _this.entityID = entityID;
        _this.whiteboard = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;

        if (DEBUG) {
            console.log("smartBoardZoneClient.js: " + _this.entityID + ": `preload()`.");
        }

        var boardProps = Entities.getEntityProperties(_this.whiteboard, ['dimensions', 'position']);
        boardDimensions = boardProps.dimensions;
        boardPosition = boardProps.position;
        offset = boardDimensions.z / HALF + margin;

        var userData = Entities.getEntityProperties(entityID, ['userData']).userData;
        var parsedData = {};
        try {
            parsedData = JSON.parse(userData);
        } catch (e) {
            console.log("Error reading userData in smartBoardZoneClient.js", e);
        }

        if (parsedData.whiteboardOnlyZone) {
            _this.whiteboardOnlyZone = parsedData.whiteboardOnlyZone;
        }

        if (parsedData.roomName) {
            _this.roomName = parsedData.roomName;
        }

        if (!signalsConnected) {
            Screenshare.screenshareStopped.connect(onScreenshareStopped);
            signalsConnected = true;
        }
    }


    // 1. register the participant with the server to get the current board state
    // 2. check to see if this is a whiteboard only zone
    // 3. enable the whiteboard functions
    function enterEntity() {
        if (DEBUG) {
            console.log("smartBoardZoneClient.js: " + _this.entityID + ": `enterEntity()`. Registering participant and creating local buttons...");
        }

        Entities.callEntityServerMethod(_this.entityID, "registerParticipant", [MyAvatar.sessionUUID]);
        createLocalButtons();

        // // FOR WHITEBOARD INTEGRATION
        // MyAvatar.disableHandTouchForID(_this.whiteboard);
        // Entities.getChildrenIDs(_this.whiteboard).forEach(function(whiteboardPiece) {
        //     MyAvatar.disableHandTouchForID(whiteboardPiece);
        // });
        // var paletteSquares = [];
        // Entities.getChildrenIDs(_this.whiteboard).forEach(function(whiteboardPiece) {
        //     var name = Entities.getEntityProperties(whiteboardPiece, 'name').name;
        //     if (name === "Whiteboard Palette Square") {
        //         paletteSquares.push(whiteboardPiece);
        //     }
        // });
        // var numberPaletteSquares = paletteSquares.length;
        // var randomPaletteSquareIndex = Math.floor(Math.random() * numberPaletteSquares);
        // Entities.callEntityMethod(paletteSquares[randomPaletteSquareIndex],'createPaintSphere');
    }

    
    // remove the participant and remove paint sphere
    function leaveEntity() {
        if (DEBUG) {
            console.log("smartBoardZoneClient.js: " + _this.entityID + ": `leaveEntity()`. Stopping screenshare, " + 
                "removing local buttons, removing local web entity, and removing participant from server...");
        }
        
        // _this.removePaintSpheres();
        Screenshare.stopScreenshare();
        maybeRemoveLocalButtons();
        maybeRemoveLocalWebEntity();
        Entities.callEntityServerMethod(_this.entityID, "removeParticipant", [MyAvatar.sessionUUID]);
    }


    // delete buttons and remove paintspheres
    function unload() {
        if (DEBUG) {
            console.log("smartBoardZoneClient.js: " + _this.entityID + ": `unload()`.");
        }

        // _this.removePaintSpheres();
        Screenshare.stopScreenshare();
        maybeRemoveLocalButtons();
        maybeRemoveLocalWebEntity();

        if (signalsConnected) {
            Screenshare.screenshareStopped.disconnect(onScreenshareStopped);
        }
    }
    

    // SMARTBOARD OBJECT
    var _this;
    function SmartBoardZoneClient() {
        _this = this;
        this.activePresenterUUID = "";
        this.currentBoardState = "screenshare";
        this.entityID;
        this.screenshareButtonID;
        this.whiteboardButtonID;
        this.localWebEntityID;
        this.screenshareModeFirstActivated = false;
        this.whiteboardOnlyZone = false;
        this.roomName = "";
        this.whiteboard;

        this.remotelyCallable = [
            'receiveBoardState',
            'buttonPreloadComplete'
        ];
    }

    SmartBoardZoneClient.prototype = {
        createLocalButtons: createLocalButtons,
        buttonPreloadComplete: buttonPreloadComplete,
        maybeRemoveLocalButtons: maybeRemoveLocalButtons,
        updateButtonState: updateButtonState,
        maybeCreateLocalWebEntity: maybeCreateLocalWebEntity,
        maybeRemoveLocalWebEntity: maybeRemoveLocalWebEntity,
        receiveBoardState: receiveBoardState,
        preload: preload,
        unload: unload,
        enterEntity: enterEntity,
        leaveEntity: leaveEntity
    };

    return new SmartBoardZoneClient();
});
