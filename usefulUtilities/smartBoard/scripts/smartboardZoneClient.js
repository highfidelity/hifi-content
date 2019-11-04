//
//  smartboardZoneClient.js
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

    // BOARD UI
    // If a new avatar enters the Smartboard Zone:
    //     1. This client script will call `registerParticipant()` on the Smartboard Zone server script.
    //     2. The server script will do some stuff, then call `receiveBoardState()` (below) on the client
    //         who just registered.
    // If the ESS detects that the broadcasting avatar has left the domain:
    //     1. The Smartboard Zone server script will call `receiveBoardState()` (below) on all clients
    //         whose avatars are inside the Smartboard zone.
    function receiveBoardState(id, args) {
        _this.currentBoardState = args[0];
        _this.activePresenterUUID = args[1];

        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `receiveBoardState()`." +
                "\n`_this.currentBoardState`: " + _this.currentBoardState + "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }

        setupWhiteboardState();
        setupScreenshareState();
        setupSelectionState();
    }


    function toggleSmartboardPolylines() {
        var smartboardPieces = Entities.getChildrenIDs(_this.smartboard);
        var hideArray = ["screenshare", "reset", "palette"]
        smartboardPieces.forEach(function(smartboardPiece) {
            var name = Entities.getEntityProperties(smartboardPiece, 'name').name.toLowerCase();
            if (name.indexOf("Polyline") > -1) {
                if (_this.currentBoardState === "screenshare" || _this.current) {
                    for (var i = 0; i < hideArray.length; i++) {
                        if (name.indexOf(hideArray[i] > -1)) {
                            Entities.editEntity(smartboardPiece, {visible: false});
                            break;
                        }
                    }
                } else {
                    Entities.editEntity(smartboardPiece, {visible: true});
                }
            }
        });
    }

    // Updates the state of the local entity buttons.
    // Send the `activePresenterUUID` (even if it's empty) - that helps the buttons know who can change the Smartboard's state.
    function updateButtonState() {
        if (!buttonIsReady) {
            return;
        }

        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `updateButtonState()`.");
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
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `buttonPreloadComplete()`.");
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
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `createLocalButtons()`.");
        }

        var whiteboardButtonX = -(boardDimensions.x / HALF) + (STATIC_BUTTON_PROPS.dimensions.x / HALF) + margin;
        var whiteboardButtonY = -(boardDimensions.y / HALF) + (STATIC_BUTTON_PROPS.dimensions.y / HALF) + margin;

        var buttonProps = STATIC_BUTTON_PROPS;
        buttonProps.parentID = _this.smartboard;
        buttonProps.localPosition = {x: whiteboardButtonX, y: whiteboardButtonY, z: offset};
        buttonProps.name = "Smartboard Whiteboard Button";
        buttonProps.color = INITIAL_BUTTON_COLOR;
        _this.whiteboardButtonID = Entities.addEntity(buttonProps, 'local');
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `buttonProps:`.", JSON.stringify(buttonProps, null, 4));
            console.log("_this.smartboard;", _this.smartboard);
        }
        if (!_this.whiteboardOnlyZone) {
            // Just for testing
            var selectionButtonY = buttonProps.localPosition.y + (buttonProps.dimensions.y * 2) + (buttonProps.dimensions.y / THIRD * 2);
            var screenshareButtonY = buttonProps.localPosition.y + buttonProps.dimensions.y + buttonProps.dimensions.y / THIRD;
            buttonProps.localPosition.y = screenshareButtonY;
            buttonProps.name = "Smartboard Screenshare Button";
            buttonProps.color = INITIAL_BUTTON_COLOR;
            _this.screenshareButtonID = Entities.addEntity(buttonProps, 'local');
            buttonProps.name = "Smartboard Selection Button";
            buttonProps.localPosition.y = selectionButtonY;
            _this.selectionButtonID = Entities.addEntity(buttonProps, 'local');
        }
    }


    // remove the local buttons when someone leaves the zone
    function maybeRemoveLocalButtons() {
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `maybeRemoveLocalButtons()`.");
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

    var DEFAULT_TEXTBOX_PROPS = {
        type: "Text"
    };

    function createLocalPresenterDisplayName() {
        if (_this.localPresenterDisplayName) {
            return;
        }
        var textProps = DEFAULT_TEXTBOX_PROPS;
        textProps.parentID = _this.smartboard;
        var lineHeight = 0.1;
        textProps.dimensions = {x: boardDimensions.x, y: lineHeight, z:boardDimensions.z};
        textProps.localPosition = {x: 0,y: boardDimensions.y / HALF ,z: offset + margin};
        var displayName = AvatarManager.getAvatar(_this.activePresenterUUID).displayName; 
        textProps.text = displayName;
        _this.localPresenterDisplayName = Entities.addEntity(textProps, 'local');
    }

    function maybeRemoveLocalPresenterDisplayName(){
        if (_this.localPresenterDisplayName) {
            Entities.deleteEntity(_this.localPresenterDisplayName);            
        }
        _this.localPresenterDisplayName = false;
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
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `maybeCreateLocalWebEntity()`: Creating local web entity...");
        }

        var localWebEntityProps = STATIC_LOCAL_WEB_ENTITY_PROPS;
        localWebEntityProps.localPosition = {x: 0, y: 0, z: offset};
        localWebEntityProps.parentID = _this.smartboard;
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
                console.log("smartboardZoneClient.js: " + _this.entityID + ": `maybeRemoveLocalWebEntity()`: Deleting local web entity...");
            }

            Entities.deleteEntity(_this.localWebEntityID);
        }
        _this.localWebEntityID = false;
    }


    function toggleWhiteboardUI() {
        if (_this.currentBoardState === "whiteboard") {
            // Show erase button
            // Show palettes
            // Show closeout button
            // Show screenshare Icon
        } else {
            // Hide erase button
            // Hide palettes
            // Hide closeout button
            // Hide screenshare Icon
        }
        
    }


    function setupWhiteboardState() {
        if (_this.currentBoardState === "whiteboard") {
            setupTouchDisable();
            createRandomPaintSphere();
        } else {
            removePaintSpheres();
        }
        toggleWhiteboardUI();
        toggleSmartboardPolylines();
    }


    function toggleScreenshareUI(){
        if (_this.currentBoardState === "screenshare") {
            // Add the background
            // Add the displayName
            createLocalPresenterDisplayName();
            // Add the closeout button
            // Add the screenshare Icon            
        } else {
            // remove the background
            // remove the displayName
            maybeRemoveLocalPresenterDisplayName();
            // remove the closeout button
            // add the screenshare Icon
        }
    }


    function setupScreenshareState() {
        if (_this.currentBoardState === "screenshare") {
            maybeCreateLocalWebEntity();
            if (_this.activePresenterUUID === MyAvatar.sessionUUID) {
                Screenshare.startScreenshare(_this.roomName);
            }
        } else {
            maybeRemoveLocalWebEntity();
            if (_this.activePresenterUUID === MyAvatar.sessionUUID) {
                Screenshare.stopScreenshare();
            }
        }
        toggleScreenshareUI();
    }

    function toggleSelectionScreenUI() {
        //
    }

    function setupSelectionState() { 
        if (_this.currentBoardState === "selection") {
            //
        } else {
            //
        }
        toggleSelectionScreenUI();
    }

    function onScreenshareStopped() {
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `onScreenshareStopped()`.");
        }
        
        Entities.callEntityServerMethod(_this.entityID, "updateCurrentBoardState", ["whiteboard", ""]);
    }

    // ENTITY SIGNALS
    // 1. get the smartboard parent, the dimensions/position of the board for button and web entity positioning
    // 2. get the setup information such as roomName and whether this is a whiteboard only zone
    var signalsConnected = false;
    function preload(entityID) {
        _this.entityID = entityID;
        _this.smartboard = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;

        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `preload()`.");
        }

        var boardProps = Entities.getEntityProperties(_this.smartboard, ['dimensions', 'position']);
        boardDimensions = boardProps.dimensions;
        boardPosition = boardProps.position;
        offset = boardDimensions.z / HALF + margin;

        var userData = Entities.getEntityProperties(entityID, ['userData']).userData;
        var parsedData = {};
        try {
            parsedData = JSON.parse(userData);
        } catch (e) {
            console.log("Error reading userData in smartboardZoneClient.js", e);
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


    function createRandomPaintSphere(){
        var numberPaletteSquares = paletteSquares.length;
        var randomPaletteSquareIndex = Math.floor(Math.random() * numberPaletteSquares);
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `createRandomPaintSphere()`.");
            console.log("paletteSquares[randomPaletteSquareIndex]", paletteSquares[randomPaletteSquareIndex]);
        }
        Entities.callEntityMethod(paletteSquares[randomPaletteSquareIndex],'createPaintSphere');
    }

    function setupTouchDisable(){
        var smartboardPieces = Entities.getChildrenIDs(_this.smartboard);

        MyAvatar.disableHandTouchForID(_this.smartboard);
        smartboardPieces.forEach(function(smartboardPiece) {
            var name = Entities.getEntityProperties(smartboardPiece, 'name').name;
            console.log("smartboard children name:", name);
            MyAvatar.disableHandTouchForID(smartboardPiece);
            if (name === "Smartboard Palette Square") {
                paletteSquares.push(smartboardPiece);
            }
        });


    }

    // 1. register the participant with the server to get the current board state
    // 2. check to see if this is a smartboard only zone
    // 3. enable the smartboard functions
    var paletteSquares = [];
    function enterEntity() {
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `enterEntity()`. Registering participant and creating local buttons...");
        }

        Entities.callEntityServerMethod(_this.entityID, "registerParticipant", [MyAvatar.sessionUUID]);
        
        // TODO: This should be handled by the state machine
        createLocalButtons();
    }

    
    // Check for existing paint sphere and delete if found
    function removePaintSpheres() {
        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            var name = Entities.getEntityProperties(avatarEntity.id, 'name').name;
            if (name && (name === "Smartboard Paint Sphere" || name === "Smartboard Paint Sphere Material")) {
                Entities.deleteEntity(avatarEntity.id);
            }
        });
    }


    // remove the participant and remove paint sphere
    function leaveEntity() {
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `leaveEntity()`. Stopping screenshare, " + 
                "removing local buttons, removing local web entity, and removing participant from server...");
        }
        
        Entities.callEntityServerMethod(_this.entityID, "removeParticipant", [MyAvatar.sessionUUID]);
        unload();
    }


    // delete buttons and remove paintspheres
    function unload() {
        removePaintSpheres();
        Screenshare.stopScreenshare();
        maybeRemoveLocalButtons();
        maybeRemoveLocalWebEntity();
        maybeRemoveLocalPresenterDisplayName();
        if (signalsConnected) {
            Screenshare.screenshareStopped.disconnect(onScreenshareStopped);
        }
    }
    

    // SMARTBOARD OBJECT
    var _this;
    function SmartboardZoneClient() {
        _this = this;
        this.activePresenterUUID = "";
        this.currentBoardState = "screenshare";
        this.entityID;
        this.screenshareButtonID;
        this.whiteboardButtonID;
        this.selectionButtonID;
        this.localWebEntityID;
        this.localPresenterDisplayName;
        this.screenshareModeFirstActivated = false;
        this.whiteboardOnlyZone = false;
        this.roomName = "";
        this.smartboard;

        this.remotelyCallable = [
            'receiveBoardState',
            'buttonPreloadComplete'
        ];
    }

    SmartboardZoneClient.prototype = {
        buttonPreloadComplete: buttonPreloadComplete,
        updateButtonState: updateButtonState,
        receiveBoardState: receiveBoardState,
        preload: preload,
        unload: unload,
        enterEntity: enterEntity,
        leaveEntity: leaveEntity
    };

    return new SmartboardZoneClient();
});
