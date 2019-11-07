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
                "\n`_this.currentBoardState`: " + _this.currentBoardState +
                "\n`_this.activePresenterUUID`: " + _this.activePresenterUUID);
        }        

        if (_this.currentBoardState === "whiteboard") {
            createRandomPaintSphere();
            maybeRemoveLocalPresenterDisplayName();

            // This will also delete the local web entity if there is one.
            Screenshare.stopScreenshare();
        } else if (_this.currentBoardState === "screenshare") {
            maybeCreateLocalPresenterDisplayName();

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

        setVisibilityOfSmartboardWhiteboardComponents();

        setupLocalButton();
        setButtonActivePresenterUUID();
    }


    // The following Smartboard Whiteboard components should be visible/invisible:
    // 1. Whiteboard palette circle background
    // 2. Whiteboard palette circles
    // 3. Whiteboard "reset" button
    // 4. Whiteboard polylines
    var HIDE_POLYLINES_IN_SCREENSHARE_MODE = false;
    function setVisibilityOfSmartboardWhiteboardComponents() {
        console.log("State is screenshare");

        var smartboardChildrenIDs = Entities.getChildrenIDs(_this.smartboard);
        var entityNamesToShowOrHide = ["reset", "palette"];
        if (HIDE_POLYLINES_IN_SCREENSHARE_MODE) {
            entityNamesToShowOrHide.push("polyline");
        }
        smartboardChildrenIDs.forEach(function(smartboardPiece) {
            var entityName = Entities.getEntityProperties(smartboardPiece, 'name').name;
            if (!entityName) {
                return;
            }

            var lowerCaseName = entityName.toLowerCase();
            var foundWhiteBoardComponent = false;
            for (var i = 0; i < entityNamesToShowOrHide.length; i++) {
                if (lowerCaseName.indexOf(entityNamesToShowOrHide[i] === -1)) {
                    continue;
                } else {
                    foundWhiteBoardComponent = true;
                    break;
                }
            }
            if (foundWhiteBoardComponent) {
                Entities.editEntity(smartboardPiece, {visible: _this.currentBoardState === "whiteboard"});
            }
        });
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
            [_this.activePresenterUUID]);
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
        script: Script.resolvePath("./boardButtonClient.js?" + Date.now()),
        // TODO: these will change with Alan's redesign
        localPosition: {x: 1.1618, y: 1.0004, z: 0.4601},
        dimensions: {x: 0.8093, Y: 0.1012, z: 0.0189}
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
            _this.screenshareStartStopButtonID = Entities.addEntity(buttonProps, 'local');
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


    var DEFAULT_TEXTBOX_PROPS = {
        type: "Text"
    };

    function maybeCreateLocalPresenterDisplayName() {
        if (_this.localPresenterDisplayName) {
            return;
        }
        var textProps = DEFAULT_TEXTBOX_PROPS;
        textProps.parentID = _this.smartboard;
        var lineHeight = 0.1;
        textProps.dimensions = {x: boardDimensions.x, y: lineHeight, z:boardDimensions.z};
        textProps.localPosition = {x: 0, y: boardDimensions.y / HALF ,z: entityOffsetFromBoard + margin};
        var displayName = AvatarManager.getAvatar(_this.activePresenterUUID).displayName; 
        textProps.text = displayName;
        _this.localPresenterDisplayName = Entities.addEntity(textProps, 'local');
    }


    function maybeRemoveLocalPresenterDisplayName() {
        if (_this.localPresenterDisplayName) {
            Entities.deleteEntity(_this.localPresenterDisplayName);            
        }
        _this.localPresenterDisplayName = false;
    }


    function onScreenshareStopped() {
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `onScreenshareStopped()`.");
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
            Screenshare.screenshareStopped.connect(onScreenshareStopped);
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
        this.screenshareStartStopButtonID = null;
        this.localPresenterDisplayName = null;
        this.screenshareModeFirstActivated = false;
        this.whiteboardOnlyZone = false;
        this.smartboard;
        this.smartboardChildrenIDs;
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
