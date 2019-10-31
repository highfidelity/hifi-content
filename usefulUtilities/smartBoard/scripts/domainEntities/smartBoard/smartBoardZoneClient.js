//
//  smartBoardZoneClient.js
//
//  Additional code by Milad Nazeri 10/30/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function(){
// DEPENDENCIES
    var screenshareParticipant = Script.require("./screenShareMode/screenshareParticipant.js?" + Date.now());
    var CONFIG = Script.require("./config.js");
    

// CONSTS
    var RGB_MAX_VALUE = 255;
    var DECIMAL_PLACES = 2;


// WHITEBOARD FUNCTIONS
    /* PLAY A SOUND: Plays a sound at the specified position, volume, local mode, and playback 
    mode requested. */
    function playSound(sound, volume, position, localOnly, loop){
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
    // Anytime there is a change from when someone clicks on a button or a new user is registered,
    // the zone server script will send to the client the current state of the board
    function receiveBoardState(id, args){
        _this.activePresenterUUID = args[1];
        _this.currentBoardState = state;

        if (_this.currentBoardState === "screenshare") {
            screenshareParticipant.startScreenshare(_this.activePresenterUUID);
            createLocalWebEntity();
        } else {
            removeLocalWebEntity();
        }

        updateButtonState();
    }


    // Updates the button state(currently on changes the color of the temp buttons)
    // If there is an active presenter UUID send that also to help identify who can change the buttons
    function updateButtonState(){
        if (_this.currentBoardState === "whiteboard") {
            Entities.callEntityMethod(_this.whiteboardButtonID, "updateButtonState", ["isOn", ""]);
            Entities.callEntityMethod(_this.screenshareButtonID, "updateButtonState", ["isOff", ""]);
        } else {
            Entities.callEntityMethod(_this.whiteboardButtonID, "updateButtonState", ["isOff", _this.activePresenterUUID]);
            Entities.callEntityMethod(_this.screenshareButtonID, "updateButtonState", ["isOn", _this.activePresenterUUID]);
        }
    }


    // Signal to make sure the buttons are loaded when first entering the zone for help avoiding race conditions on the initial state setup
    var baseButtonProps = {
        type: "Sphere",
        dimensions: {x: 0.25, y: 0.25, z: 0.03},
        script: Script.resolvePath("./boardButtonClient.js?" + Date.now()),
        localPosition: {x: 0, y: 0, z: -1}
    }
    function buttonLoaded(){
        if (_this.currentBoardState === 'whiteboard') {
            updateButtonState();
            return;
        } 
        updateButtonState();
    }


    // Create the local screenshare and whiteboard buttons when someone enters
    // Probably will need to add an additional "zoom" button
    var boardDimensions;
    var offset;
    var margin = 0.025;
    var HALF = 2;
    var THIRD = 3;
    function createLocalButtons(){
        var whiteboardButtonX = -(boardDimensions.x / HALF) + (baseButtonProps.dimensions.x / HALF) + margin;
        var whiteboardButtonY = -(boardDimensions.y / HALF) + (baseButtonProps.dimensions.y / HALF) + margin;

        baseButtonProps.parentID = _this.whiteboard;
        baseButtonProps.localPosition = {x: whiteboardButtonX, y: whiteboardButtonY, z: offset};
        baseButtonProps.name = 'Screenshare_whiteboard_button'
        baseButtonProps.color = {r: 15, g: 50, b: 25}; 
        _this.whiteboardButtonID = Entities.addEntity(baseButtonProps, 'local');

        if (_this.whiteboardOnlyZone) {
            return;
        }
        // emperical value for a buttom margin
        baseButtonProps.localPosition.y -= whiteboardButtonY / THIRD;
        baseButtonProps.name = 'Screenshare_screenshare_button'
        baseButtonProps.color = {r: 60, g: 44, b: 150};
        _this.screenshareButtonID = Entities.addEntity(baseButtonProps, 'local');
    }


    // remove the local buttons when someone leaves the zone
    function removeLocalButtons(){
        Entities.deleteEntity(_this.whiteboardButtonID);
        _this.whiteboardButtonID = null;

        if (_this.whiteboardOnlyZone) {
            return;
        }
        Entities.deleteEntity(_this.screenshareButtonID);
        _this.screenshareButtonID = null;
    }


    // create the local web entity only when there is a screenshare initiated
    // this may be moved to the participant script
    var localWebEntityProps = {
        type: "Web",
        maxFPS: 30
    };
    var boardPosition;
    function createLocalWebEntity(){
        localWebEntityProps.localPosition = {x: 0, y: 0, z: offset};
        localWebEntityProps.parentID = _this.whiteboard;
        localWebEntityProps.dimensions = boardDimensions;
        
        // Will point to local HTML file
        localWebEntityProps.sourceUrl = CONFIG.sourceURL;
        localWebEntityProps.position = boardPosition;

        _this.localWebEntityID = Entities.addEntity(localWebEntityProps, 'local');
    }


    // removed when a screenshare ends or a user leaves the zone
    function removeLocalWebEntity(){
        Entities.deleteEntity(_this.localWebEntityID);
        _this.localWebEntityID = null;
    }


// ENTITY SIGNALS
    // 1. get the whiteboard parent, the dimensions/position of the board for button and web entity positioning
    // 2. get the setup information such as room name and whether this is a whiteboard only zone
    function preload(entityID){
        _this.entityID = entityID;
        _this.whiteboard = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;

        var boardProps = Entities.getEntityProperties(_this.whiteboard, ['dimensions', 'position']);
        boardDimensions = boardProps.dimensions;
        boardPosition = boardProps.position;
        offset = boardDimensions.z / HALF + margin;

        var userData = Entities.getEntityProperties(entityID, ['userData']).userData;
        var parsedData = {};
        try {
            parsedData = JSON.parse(userData);
            _this.whiteboardOnlyZone = parsedData.whiteboardOnlyZone;
            _this.room = parsedData.room;
        } catch (e) {
            console.log("error reading userData in smartBoardZoneClient.js", error);
        }
    }


    // 1. register the participant with the server to get the current board state
    // 2. check to see if this is a whiteboard only zone
    // 3. enable the whiteboard functions
    function enterEntity(){
        Entities.callEntityServerMethod(_this.entityID, "registerParticipant", [MyAvatar.sessionUUID, AccountServices.username, MyAvatar.displayName]);
        if (!_this.whiteboardOnlyZone) {
            createLocalButtons();
        }
        if (_this.currentBoardState === "whiteboard") {

            // FOR WHITEBOARD INTEGRATION
            // MyAvatar.disableHandTouchForID(whiteboard);
            // Entities.getChildrenIDs(whiteboard).forEach(function(whiteboardPiece) {
            //     MyAvatar.disableHandTouchForID(whiteboardPiece);
            // });
            // var paletteSquares = [];
            // Entities.getChildrenIDs(whiteboard).forEach(function(whiteboardPiece) {
            //     var name = Entities.getEntityProperties(whiteboardPiece, 'name').name;
            //     if (name === "Whiteboard Palette Square") {
            //         paletteSquares.push(whiteboardPiece);
            //     }
            // });
            // var numberPaletteSquares = paletteSquares.length;
            // var randomPaletteSquareIndex = Math.floor(Math.random() * numberPaletteSquares);
            // Entities.callEntityMethod(paletteSquares[randomPaletteSquareIndex],'createPaintSphere');
        } else {
            console.log("current state is screenshare");
        }
    }

    
    // remove the participant and remove paint sphere
    function leaveEntity(){
        Entities.callEntityServerMethod(_this.entityID, "removeParticipant", [MyAvatar.sessionUUID]);
        // _this.removePaintSpheres();
        _this.unload();
    }


    // delete buttons and remove paintspheres
    function unload(){
        // _this.removePaintSpheres();
        removeLocalButtons();
        removeLocalWebEntity();
    }
    

// SMARTBOARD OBJECT
    var _this;
    function SmartBoardZoneClient(){
        _this = this;
        this.activePresenterUUID = "";
        this.currentBoardState = 'screenshare';
        this.entityID;
        this.screenshareButtonID;
        this.whiteboardButtonID;
        this.localWebEntityID;
        this.screenshareModeFirstActivated = false;
        this.whiteboardOnlyZone = false;
        this.room = "";

        // this.injector;
        this.whiteboard;

        this.remotelyCallable = [
            'createLocalWeb',
            'removeLocalButtons',
            'createLocalWebEntity',
            'removeLocalWebEntity',
            'receiveBoardState',
            'buttonLoaded'
        ];
    }

    SmartBoardZoneClient.prototype = {
        createLocalButtons: createLocalButtons,
        removeLocalButtons: removeLocalButtons,
        createLocalWebEntity: createLocalWebEntity,
        removeLocalWebEntity: removeLocalWebEntity,
        buttonLoaded: buttonLoaded,

        updateButtonState: updateButtonState,

        receiveBoardState: receiveBoardState,
        preload: preload,
        unload: unload,
        enterEntity: enterEntity,
        leaveEntity: leaveEntity

    }

    return new SmartBoardZoneClient();
})
