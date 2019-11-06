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
            maybeRemoveLocalWebEntity();
            maybeRemoveLocalPresenterDisplayName();

            if (_this.activePresenterUUID === MyAvatar.sessionUUID) {
                Screenshare.stopScreenshare();
            }
        } else if (_this.currentBoardState === "screenshare") {
            Screenshare.viewScreenshare();
            maybeCreateLocalPresenterDisplayName();

            if (_this.activePresenterUUID === MyAvatar.sessionUUID) {
                Screenshare.startScreenshare(_this.roomName);
            } else {
                maybeRemoveLocalScreenshareButton();
            }
            maybeRemovePaintSpheres();
        } else {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `receiveBoardState()`." + " Unhandled state.");
        }

        setVisibilityOfSmartboardWhiteboardComponents();

        setupLocalButton();
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
            var lowerCaseName = Entities.getEntityProperties(smartboardPiece, 'name').name.toLowerCase();
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
        if (!buttonIsReady) {
            return;
        }

        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `setButtonActivePresenterUUID()`.");
        }

        Entities.callEntityMethod(_this.ScreenshareStartStopButtonID, "setActivePresenterUUID",
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
    var offset;
    var margin = 0.025;
    var HALF = 2;
    var STATIC_BUTTON_PROPS = {
        type: "Model",
        script: Script.resolvePath("./boardButtonClient.js?" + Date.now()),
        // TODO: these will change with Alan's redesign
        // localPosition: {x: 1.1618, y: 1.0004, z: 0.0601},
        // dimensions: {x: 0.8093, Y: 0.1012, z: 0.0189}
    };
    function setupLocalButton() {
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `setupLocalButton()`.");
        }
        
        if (!_this.whiteBoardOnlyZone) {
            var buttonProps = STATIC_BUTTON_PROPS;
            buttonProps.parentID = _this.smartboard;
            buttonProps.name = "Smartboard ScreenshareStartStop Button";
            _this.ScreenshareStartStopButtonID = Entities.addEntity(buttonProps, 'local');
        }
    }


    // remove the local buttons when someone leaves the zone
    function maybeRemoveLocalScreenshareButton() {
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `maybeRemoveLocalScreenshareButton()`.");
        }

        if (_this.ScreenshareStartStopButtonID) {
            Entities.deleteEntity(_this.ScreenshareStartStopButtonID);
            _this.ScreenshareStartStopButtonID = null;
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
        textProps.localPosition = {x: 0,y: boardDimensions.y / HALF ,z: offset + margin};
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


    // create the local web entity only when there is a screenshare initiated
    // this may be moved to the participant script
    var STATIC_LOCAL_WEB_ENTITY_PROPS = {
        type: "Web",
        maxFPS: 30
    };
    var boardPosition;
    var localWebEntitySignalsConnected = false;
    function maybeCreateLocalWebEntity() {
        if (_this.localWebEntityID) {
            return;
        }

        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID +
                ": `maybeCreateLocalWebEntity()`: Creating local web entity...");
        }

        var localWebEntityProps = STATIC_LOCAL_WEB_ENTITY_PROPS;
        localWebEntityProps.localPosition = {x: 0, y: 0, z: offset};
        localWebEntityProps.parentID = _this.smartboard;
        localWebEntityProps.dimensions = boardDimensions;
        // Will point to local HTML file
        localWebEntityProps.sourceUrl = CONFIG.sourceURL;
        localWebEntityProps.position = boardPosition;

        _this.localWebEntityID = Entities.addEntity(localWebEntityProps, 'local');
        _this.localWebEntityObject = Entities.getEntityObject(_this.localWebEntityObject);
        if (!localWebEntitySignalsConnected) {
            _this.localWebEntityObject.webEventReceived.connect(onLocalWebEntityEventReceived);
            localWebEntitySignalsConnected = true;
        }
    }


    // removed when a screenshare ends or a user leaves the zone
    function maybeRemoveLocalWebEntity() {
        if (_this.localWebEntityID) {
            if (DEBUG) {
                console.log("smartboardZoneClient.js: " + _this.entityID +
                    ": `maybeRemoveLocalWebEntity()`: Deleting local web entity...");
            }

            Entities.deleteEntity(_this.localWebEntityID);
        }
        _this.localWebEntityID = false;

        if (localWebEntitySignalsConnected) {
            _this.localWebEntityObject.webEventReceived.disconnect(onLocalWebEntityEventReceived);
        }
        localWebEntitySignalsConnected = false;

        _this.localWebEntityObject = null;
    }


    // Where should the call to the metaverse go now?
    function onLocalWebEntityEventReceived(message){
        try {
            message = JSON.parse(message);
        } catch (e) {
            console.log("smartBoardZoneClient.js: Error parsing web entity event message: " + e);
            return;
        }

        if (message.type === "eventbridge_ready") {
            _this.localWebEntityObject.emitScriptEvent(JSON.stringify({
                type: "receiveConnectionInfo",
                data: {
                    projectAPIKey: _this.projectAPIKey,
                    token: _this.token,
                    sessionID: _this.sessionID
                }
            }));
        }
    }


    function onScreenshareStopped() {
        if (DEBUG) {
            console.log("smartboardZoneClient.js: " + _this.entityID + ": `onScreenshareStopped()`.");
        }
        
        Entities.callEntityServerMethod(_this.entityID, "updateCurrentBoardState", ["whiteboard", ""]);
    }


    function onStartScreenshareViewer(projectAPIKey, token, sessionID) {
        _this.projectAPIKey = projectAPIKey;
        _this.token = token;
        _this.sessionID = sessionID;
        maybeCreateLocalWebEntity();
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

        if (parsedData.roomName) {
            _this.roomName = parsedData.roomName;
        }

        if (!signalsConnected) {
            Screenshare.screenshareStopped.connect(onScreenshareStopped);
            Screenshare.startScreenshareViewer.connect(onStartScreenshareViewer);
            signalsConnected = true;
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
        Screenshare.stopScreenshare();
        maybeRemoveLocalScreenshareButton();
        maybeRemoveLocalWebEntity();
        maybeRemoveLocalPresenterDisplayName();
        if (signalsConnected) {
            Screenshare.screenshareStopped.disconnect(onScreenshareStopped);
            Screenshare.startScreenshareViewer.disconnect(onStartScreenshareViewer);
        }
    }
    

    // SMARTBOARD OBJECT
    var _this;
    function SmartboardZoneClient() {
        _this = this;
        this.activePresenterUUID = "";
        this.currentBoardState = "screenshare";
        this.entityID;
        this.ScreenshareStartStopButtonID = null;
        this.localWebEntityID = null;
        this.localWebEntityObject = null;
        this.localPresenterDisplayName = null;
        this.screenshareModeFirstActivated = false;
        this.whiteboardOnlyZone = false;
        this.roomName = "";
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
