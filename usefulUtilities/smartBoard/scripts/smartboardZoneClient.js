'use strict';
//  smartboardZoneClient.js
//
//  Milad Nazeri and Zach Fox 10/30/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals Screenshare */

(function() {
    var DEBUG = false;

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
            console.log("args:", args, "\nsmartboardZoneClient.js: " + _this.entityID + ": `receiveBoardState()`." +
                "\n`_this.currentBoardState`: " + _this.currentBoardState +
                "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }        

        if (_this.currentBoardState === "whiteboard") {
            createRandomPaintSphere();
            maybeRemoveLocalPresenterDisplayName();
            maybeRemoveLocalSmartboardScreenshareGlass();

            // This will also delete the local web entity if there is one.
            Screenshare.stopScreenshare();
        } else if (_this.currentBoardState === "screenshare") {
            maybeCreateLocalPresenterDisplayName();
            maybeCreateLocalSmartboardScreenshareGlass();

            if (_this.activePresenterUUID === MyAvatar.sessionUUID) {
                Screenshare.startScreenshare(_this.entityID, _this.smartboard, true);
            } else {
                maybeRemoveLocalScreenshareButton();
                Screenshare.startScreenshare(_this.entityID, _this.smartboard, false);
            }
            maybeRemovePaintSpheres();
        } else {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `receiveBoardState()`." + " Unhandled state.");
        }

        setupLocalButton();
        setButtonActivePresenterUUID();
    }


    // Updates the state of the local entity buttons.
    // Send the `activePresenterUUID` (even if it's empty) - that helps the buttons know who can change the Smartboard's state.
    function setButtonActivePresenterUUID() {
        if (!buttonIsReady || !_this.screenshareStartStopButtonID) {
            return;
        }

        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `setButtonActivePresenterUUID()`.");
        }

        Entities.callEntityMethod(_this.screenshareStartStopButtonID, "setActivePresenterUUID",
            [_this.currentBoardState, _this.activePresenterUUID]);
    }


    // Signal to make sure the buttons are loaded when first entering the zone
    // for help avoiding race conditions on the initial state setup
    var buttonIsReady = false;
    function buttonPreloadComplete() {
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `buttonPreloadComplete()`.");
        }

        buttonIsReady = true;
        setButtonActivePresenterUUID();

    }


    // Create the local screenshare and whiteboard buttons when someone enters
    // Probably will need to add an additional "zoom" button
    var boardDimensions;
    var entityOffsetFromBoard;
    var margin = 0.025;
    var HALF = 2;
    var STATIC_BUTTON_PROPS = {
        type: "Model",
        script: Script.resolvePath("./boardButtonClient.js"),
        localPosition: {x: 1.5426, y: 1.2593, z: 0.0618},
        dimensions: {x: 1.0394, y: 0.1300, z: 0.0243},
        visible: false
    };
    function setupLocalButton() {
        if (_this.screenshareStartStopButtonID) {
            return;
        }

        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `setupLocalButton()`.");
        }
        
        if (!_this.whiteBoardOnlyZone) {
            var buttonProps = STATIC_BUTTON_PROPS;
            buttonProps.parentID = _this.smartboard;
            buttonProps.name = "Smartboard ScreenshareStartStop Button";
            _this.screenshareStartStopButtonID = Entities.addEntity(buttonProps, "local");
        }
    }


    // remove the local buttons when someone leaves the zone
    function maybeRemoveLocalScreenshareButton() {
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `maybeRemoveLocalScreenshareButton()`.");
        }

        if (_this.screenshareStartStopButtonID) {
            Entities.deleteEntity(_this.screenshareStartStopButtonID);
            _this.screenshareStartStopButtonID = null;
        }
    }


    // Grab the presenter's display name and create a text entity above the smartboard.
    // After it is created, get the text size for positioning.
    var DEFAULT_TEXTBOX_PROPS = {
        type: "Text",
        name: "Smartboard Presenting Text",
        backgroundAlpha: 0.0
    };
    var LINE_HEIGHT = 0.1;
    var PRESENTER_TEXT_DELAY_MS = 100;
    var TEXT_SIZE_WIDTH_BUFFER = 1.15; // textsize calculation from engine is slightly off
    function maybeCreateLocalPresenterDisplayName() {
        if (_this.localPresenterDisplayName) {
            return;
        }
        var textProps = DEFAULT_TEXTBOX_PROPS;
        var displayName = AvatarManager.getAvatar(_this.activePresenterUUID).displayName; 

        textProps.parentID = _this.smartboard;
        textProps.dimensions = {x: 0, y: LINE_HEIGHT, z: 0.1009};
        textProps.localPosition = {x: 0, y: 1.2563, z: entityOffsetFromBoard + margin};
        textProps.text = displayName + " is presenting";
        textProps.visible = false;
        _this.localPresenterDisplayName = Entities.addEntity(textProps, "local");

        Script.setTimeout(function(){
            var textSize = Entities.textSize(_this.localPresenterDisplayName, textProps.text);
            textProps.dimensions.x = textSize.width * TEXT_SIZE_WIDTH_BUFFER;
            var newProps = { 
                dimensions: textProps.dimensions,
                visible: true
            };
            Entities.editEntity(_this.localPresenterDisplayName, newProps);
        }, PRESENTER_TEXT_DELAY_MS);
    }


    // Check to see if there is a presenter name text box to remove
    function maybeRemoveLocalPresenterDisplayName() {
        if (_this.localPresenterDisplayName) {
            Entities.deleteEntity(_this.localPresenterDisplayName);            
        }
        _this.localPresenterDisplayName = false;
    }

    var DEFAULT_SMARTBOARD_SCREENSHARE_GLASS_PROPS = {
        type: "Model",
        modelURL: Script.resolvePath("../resources/models/screen-share-glass.fbx"),
        localPosition: {x: 0.0, y: -0.0861, z: 0.0311},
        dimensions: {x: 4.2301, y: 2.4942, z: 0.0025}
    }
    function maybeCreateLocalSmartboardScreenshareGlass() {
        if (_this.localSmartboardScreenshareGlass) {
            return;
        }
        var localSmartboardScreenshareGlassProps = DEFAULT_SMARTBOARD_SCREENSHARE_GLASS_PROPS;
        localSmartboardScreenshareGlassProps.parentID = _this.smartboard;
        localSmartboardScreenshareGlassProps.name = "Smarboard Screenshare Glass";

        _this.localSmartboardScreenshareGlass = Entities.addEntity(localSmartboardScreenshareGlassProps, "local");

    }
    
    function maybeRemoveLocalSmartboardScreenshareGlass() {
        if (this.localSmartboardScreenshareGlass) {
            Entities.deleteEntity(_this.localSmartboardScreenshareGlass);
        }
        _this.localSmartboardScreenshareGlass = false;
    }

    // If there is a problem with screenshare, then update the board back to whiteboard mode
    function onScreenshareError() {
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `onScreenshareError()`.");
        }
        
        Entities.callEntityServerMethod(_this.entityID, "updateCurrentBoardState", ["whiteboard", ""]);
    }


    // Similar to function above but related to the process being terminated and not necessarily for an error
    function onScreenshareProcessTerminated() {
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `onScreenshareProcessTerminated()`.");
        }
        
        Entities.callEntityServerMethod(_this.entityID, "updateCurrentBoardState", ["whiteboard", ""]);
    }


    // ENTITY SIGNALS
    // 1. get the smartboard parent, the dimensions/position of the board for button and web entity positioning
    // 2. get the setup information: whether this is a whiteboard only zone
    var signalsConnected = false;
    var boardDimensions;
    function preload(entityID) {
        _this.entityID = entityID;
        _this.smartboard = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;

        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `preload()`.");
        }

        var boardProps = Entities.getEntityProperties(_this.smartboard, ['dimensions']);
        boardDimensions = boardProps.dimensions;
        entityOffsetFromBoard = boardDimensions.z / HALF + margin;

        _this.smartboardChildrenIDs = Entities.getChildrenIDs(_this.smartboard);

        MyAvatar.disableHandTouchForID(_this.smartboard);

        _this.smartboardChildrenIDs.forEach(function(smartboardPiece) {
            MyAvatar.disableHandTouchForID(smartboardPiece);
            var name = Entities.getEntityProperties(smartboardPiece, 'name').name;
            if (name === "Smartboard Palette Square") {
                _this.paletteSquares.push(smartboardPiece);
            }
        });

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
    }


    // Make sure an avatar has a paint sphere when they enter the zone
    function createRandomPaintSphere() {
        var numberPaletteSquares = _this.paletteSquares.length;
        var randomPaletteSquareIndex = Math.floor(Math.random() * numberPaletteSquares);

        Entities.callEntityMethod(_this.paletteSquares[randomPaletteSquareIndex], 'createPaintSphere');
    }


    // 1. register the participant with the server to get the current board state
    // 2. check to see if this is a smartboard only zone
    // 3. enable the smartboard functions
    function enterEntity() {
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID +
                ": `enterEntity()`. Registering participant and creating local buttons...");
        }

        if (!signalsConnected) {
            Screenshare.screenshareProcessTerminated.connect(onScreenshareProcessTerminated);
            Screenshare.screenshareError.connect(onScreenshareError);
            signalsConnected = true;
        }

        Entities.callEntityServerMethod(_this.entityID, "registerParticipant", [MyAvatar.sessionUUID]);
    }

    
    // Check for existing paint sphere and delete if found
    function maybeRemovePaintSpheres() {
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
        maybeRemovePaintSpheres();
        // This will also delete the local web entity if there is one.
        Screenshare.stopScreenshare();
        maybeRemoveLocalScreenshareButton();
        maybeRemoveLocalPresenterDisplayName();
        maybeRemoveLocalSmartboardScreenshareGlass();

        if (signalsConnected) {
            Screenshare.screenshareError.disconnect(onScreenshareError);
            Screenshare.screenshareProcessTerminated.disconnect(onScreenshareProcessTerminated);
        }
        signalsConnected = false;
    }
    

    // SMARTBOARD OBJECT
    var _this;
    function SmartboardZoneClient() {
        _this = this;
        this.activePresenterUUID = "";
        this.currentBoardState = "screenshare";
        this.entityID;
        this.screenshareStartStopButtonID = null;
        this.localPresenterDisplayName = null;
        this.screenshareModeFirstActivated = false;
        this.whiteboardOnlyZone = false;
        this.smartboard;
        this.smartboardChildrenIDs;
        this.localSmartboardScreenshareGlass;
        this.paletteSquares = [];
        this.projectAPIKey = "";
        this.token = "";
        this.sessionID = "";

        this.remotelyCallable = [
            'receiveBoardState',
            'buttonPreloadComplete'
        ];
    }

    SmartboardZoneClient.prototype = {
        buttonPreloadComplete: buttonPreloadComplete,
        setButtonActivePresenterUUID: setButtonActivePresenterUUID,
        receiveBoardState: receiveBoardState,
        preload: preload,
        unload: unload,
        enterEntity: enterEntity,
        leaveEntity: leaveEntity
    };

    return new SmartboardZoneClient();
});
