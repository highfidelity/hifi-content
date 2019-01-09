(function(){

    /*
        Solo Point
        Created by Milad Nazeri on 2019-01-07
        Copyright 2016 High Fidelity, Inc.
    
        Distributed under the Apache License, Version 2.0.
        See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

        Point to solo someone to hear them better in a crowd!
        
    */


    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    // #region Utilty

    var debug = true;
    var FALSE = "false";

    // Easy log function checking for message, an object to stringify, and whether it should be enabled or not
    function log(message, object, enabled){
        if (!debug || enabled === FALSE) {
            return;
        }

        var finalMessage;

        finalMessage = "\n\n\t" + message + ":" + "\n\n";

        if (object) {
            finalMessage += "\n\t\t" + JSON.stringify(object, null, 4) + "\n";
        }

        print(finalMessage);
    }

    // #endregion
    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************


    // *************************************
    // START INIT
    // *************************************
    // #region Init

    var isEnabled = true;
    var soloAvatars = {};

    // #endregion
    // *************************************
    // STOP INIT
    // *************************************


    // *************************************
    // START MAPPING FUNCTIONS
    // *************************************
    // #region Mapping

    var pointer;
    var pointerLeftHand;
    var pointerRightHand;
    var pointers;


    // Create the pointers for the mouse and Left and Right controllers
    function createPointers(){
        pointer = Pointers.createPointer(PickType.Ray, {
            joint: "Mouse",
            filter: Picks.PICK_AVATARS,
            distanceScaleEnd: true,
            hover: false,
            enabled: false
        });
        Pointers.setPrecisionPicking(pointer, true);

        pointerLeftHand = Pointers.createPointer(PickType.Ray, {
            joint: "_CAMERA_RELATIVE_CONTROLLER_LEFTHAND",
            filter: Picks.PICK_AVATARS,
            distanceScaleEnd: true,
            hover: false,
            enabled: false
        });
        Pointers.setPrecisionPicking(pointerLeftHand, true);

        pointerRightHand = Pointers.createPointer(PickType.Ray, {
            joint: "_CAMERA_RELATIVE_CONTROLLER_RIGHTHAND",
            filter: Picks.PICK_AVATARS,
            distanceScaleEnd: true,
            hover: false,
            enabled: false
        });
        Pointers.setPrecisionPicking(pointerRightHand, true);

        pointers = [pointer, pointerLeftHand, pointerRightHand];
    }


    // Enables all the pointers created and the mapping
    function enablePointers(){
        pointers.forEach(function(pointer){
            Pointers.enablePointer(pointer);
        });

        Controller.enableMapping(MAPPING_NAME);
    }

    // Disables all the pointers created and the mapping 
    function disablePointers(){
        pointers.forEach(function(pointer){
            Pointers.disablePointer(pointer);
        });

        Controller.disableMapping(MAPPING_NAME);
    }


    var MAPPING_NAME = "SOLO_POINTER";
    var mapping = Controller.newMapping(MAPPING_NAME);

    mapping.from(Controller.Hardware.Keyboard.LeftMouseButton).to(function(value) {
        if (value === 0 ) {
            return;
        }

        var result = Pointers.getPrevPickResult(pointer);

        log("result from Left Mouse:", result, FALSE);

        if (typeof result.objectID === "string") {
            soloAvatar(result.objectID);
        }
    });

    mapping.from(Controller.Standard.LTClick).to(function(value) {
        if (value === 1 ) {
            return;
        }

        var result = Pointers.getPrevPickResult(pointerLeftHand);

        log("result from Left Controller Value:", value, true);

        log("result from Left Controller:", result, false);
        
        if (typeof result.objectID === "string") {
            soloAvatar(result.objectID);
        }
    });

    mapping.from(Controller.Standard.RTClick).to(function(value) {
        if (value === 1 ) {
            return;
        }
        
        var result = Pointers.getPrevPickResult(pointerRightHand);

        log("result from Right Controller Value:", value, true);

        log("result from Right Controller:", result, false);

        if (typeof result.objectID === "string") {
            soloAvatar(result.objectID);
        }
    });

    // #endregion
    // *************************************
    // STOP MAPPING FUNCTIONS
    // *************************************


    // *************************************
    // START SOLO FUNCTIONS
    // *************************************
    // #region Solo


    // Adds avatar to the solo list
    function addSolo(targetUUID){
        Audio.addToSoloList([targetUUID]);
        updateUI();
    }


    // Remove Avatar from the solo list
    function removeSolo(targetUUID){
        Audio.removeFromSoloList([targetUUID]);
        updateUI();
    }


    // Remove all avatars from the solo list
    function resetSolo(){
        Audio.resetSoloList();
        removeAllOverlays();
        soloAvatars = {};
        updateUI();
    }

    function addAvatarToList(avatarUUID, displayUsername){
        soloAvatars[avatarUUID] = {
            id: avatarUUID,
            name: displayUsername
        };

        addSolo(avatarUUID);
        addOverlayToUser(avatarUUID);
    }

    function removeAvatarFromList(avatarUUID){
        removeOverlay(avatarUUID);
        delete soloAvatars[avatarUUID];
        removeSolo(avatarUUID);
    }

    // Handles avatar being
    function soloAvatar(avatarUUID) {
        log("in soloAvatar", avatarUUID);

        log("soloAvatars", soloAvatars);

        if (!isEnabled) {
            return;
        }

        var getAvatarClicked = AvatarList.getAvatar(avatarUUID);
        var displayUsername = getAvatarClicked.sessionDisplayName;

        log("avatar clicked", displayUsername);

        if (soloAvatars[avatarUUID]){
            removeAvatarFromList(avatarUUID);
        } else {
            addAvatarToList(avatarUUID, displayUsername);
        }
    }


    // #endregion
    // *************************************
    // STOP SOLO FUNCTIONS
    // *************************************

    // *************************************
    // START OVERLAY FUNCTIONS
    // *************************************
    // #region Overlay

    function addOverlayToUser(uuid) {
        var user = soloAvatars[uuid];
        var overlayPosition = AvatarList.getAvatar(uuid).getNeckPosition(); // user.currentPosition
    
        var WHITE = [0, 0, 0];
    
        var overlayProperties = {
            position: Vec3.sum(overlayPosition, [0, 0.75, 0]),
            dimensions: { x: 0.3, y: 0.3, z: 0.3 },
            parentID: uuid, 
            drawInFront: true,
            url: Script.resolvePath("./resources/images/speaker.png")
        };
    
        var overlayID = Overlays.addOverlay("image3d", overlayProperties);
        user.overlayID = overlayID;
    }


    function removeOverlay(uuid) {
        var user = soloAvatars[uuid];
    
        Overlays.deleteOverlay(user.overlayID);
    
        user.overlayID = null;
    }
    

    function removeAllOverlays() {
        // remove previous overlays
        for (var uuid in soloAvatars) {
            removeOverlay(uuid);
        }
    }


    // #endregion
    // *************************************
    // STOP OVERLAY FUNCTIONS
    // *************************************


    // *************************************
    // START TABLET FUNCTIONS
    // *************************************
    // #region Tablet

    var BUTTON_NAME = "SOLO POINT";
    var URL = Script.resolvePath('./soloPoint.html');
    var appUi = Script.require('appUi');

    var ui = new appUi({
        buttonName: BUTTON_NAME,
        home: URL,
        graphicsDirectory: Script.resolvePath("./icons/tablet-icons/"),
        onOpened : onOpened,
        onClosed: onClosed,
        onMessage: onMessage
    });

    // function for appUi to call when opened
    function onOpened() {
        log("onOpened");
        
        enablePointers();
    }

    // function for appUi to call when closed    
    function onClosed() {
        log("onClosed");

        disablePointers();
        resetSolo();
    }

    var EVENT_BRIDGE_OPEN_MESSAGE = "EVENT_BRIDGE_OPEN_MESSAGE";
    var CLEAR_LIST = "CLEAR_LIST";

    function onMessage(data){
        switch (data.type){
            case EVENT_BRIDGE_OPEN_MESSAGE:
                log("updatingUi!");
                updateUI();
                break;
            case CLEAR_LIST:
                log("Clear List");
                resetSolo();
            default:
        }
    }

    var UPDATE_SOLO = "UPDATE_SOLO";
    function updateUI(){
        var avatarNames = [];
        for (var key in soloAvatars){
            avatarNames.push(soloAvatars[key].name);
        }
        ui.sendToHtml ({
            type: UPDATE_SOLO,
            value: avatarNames
        });
    }

    // #endregion 
    // *************************************
    // STOP TABLET FUNCTIONS
    // *************************************


    // *************************************
    // START MAIN
    // *************************************
    // #region Main

    createPointers();
    // enablePointers();

    Controller.enableMapping(MAPPING_NAME);

    // #endregion
    // *************************************
    // STOP MAIN
    // *************************************


    // *************************************
    // START CLEANUP
    // *************************************
    // #region Cleanup

    // Handles reset of list if you change domains
    function onDomainChange(){
        resetSolo();
    }


    // Handles removing an avatar from the list if they leave the domain
    function onAvatarRemoved(sessionUUID){
        removeAvatarFromList(sessionUUID);
    }

    Window.domainChanged.connect(onDomainChange);

    AvatarManager.avatarRemovedEvent.connect(onAvatarRemoved);

    function scriptFinished() {
        Controller.disableMapping(MAPPING_NAME);
        Window.domainChanged.disconnect(onDomainChange);
        resetSolo();
    }

    
    Script.scriptEnding.connect(scriptFinished);

    // #endregion
    // *************************************
    // STOP CLEANUP
    // *************************************

})();
