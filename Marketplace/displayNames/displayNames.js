//  
//  displayNames.js
//  A Desktop/HMD application for displaying nametags above avatars.
//   
//  Author: Cain Kilgore
//  Copyright High Fidelity 2018
//  
//  Licensed under the Apache 2.0 License
//  See accompanying license file or http://apache.org/
//  
//  All assets are under CC Attribution Non-Commerical
//  http://creativecommons.org/licenses/
//  

(function() {
    var overlaysCreated = [];
    var avatarsWithOverlays = [];
    var howLongWillNameTagAppear = 5; // seconds
    
    var nameTagProperties = {
        type: "text3d",
        visible: true,
        text: "N/A",
        lineHeight: 0.1,
        topMargin: 0.05,
        dimensions: { x: 1, y: 0.2, z: 1 },
        position: {},
        parentID: {},
        isFacingAvatar: true,
    }

    var pointer = Pointers.createPointer(PickType.Ray, {
        joint: "Mouse",
        filter: Picks.PICK_AVATARS,
        distanceScaleEnd: true,
        hover: false,
        enabled: true
    });

    var pointerLeftHand = Pointers.createPointer(PickType.Ray, {
        joint: "_CAMERA_RELATIVE_CONTROLLER_LEFTHAND",
        filter: Picks.PICK_AVATARS,
        distanceScaleEnd: true,
        hover: false,
        enabled: true
    });
    
    var pointerRightHand = Pointers.createPointer(PickType.Ray, {
        joint: "_CAMERA_RELATIVE_CONTROLLER_RIGHTHAND",
        filter: Picks.PICK_AVATARS,
        distanceScaleEnd: true,
        hover: false,
        enabled: true
    });
    
    
    var mapping_name = "nameTagSelector";

    var mapping = Controller.newMapping(mapping_name);
    mapping.from(Controller.Hardware.Keyboard.LeftMouseButton).to(function(value) {
        var res = Pointers.getPrevPickResult(pointer);
        if(typeof res.objectID == "string") {
            if(!(avatarsWithOverlays.indexOf(res.objectID) != -1)) {
                clickOnEntity(res.objectID);
            }
        }
    });
    mapping.from(Controller.Standard.RT).to(function(value) {
        var res = Pointers.getPrevPickResult(pointerRightHand);
        if(typeof res.objectID == "string") {
            if(!(avatarsWithOverlays.indexOf(res.objectID) != -1)) {
                clickOnEntity(res.objectID);
            }
        }
    });
    mapping.from(Controller.Standard.LT).to(function(value) {
        // alert("yay");
        var res = Pointers.getPrevPickResult(pointerLeftHand);
        if(typeof res.objectID == "string") {
            if(!(avatarsWithOverlays.indexOf(res.objectID) != -1)) {
                clickOnEntity(res.objectID);
            }
        }
    });

    function clickOnEntity(entityClicked) {
        var getAvatarClicked = AvatarList.getAvatar(entityClicked);
        var entityPosition = getAvatarClicked.position;
        var displayUsername = getAvatarClicked.sessionDisplayName;
        
        nameTagProperties.parentID = entityClicked;
        nameTagProperties.position = Vec3.sum(entityPosition, { x: 0, y: 1, z: 0 });
        nameTagProperties.text = getAvatarClicked.sessionDisplayName;
        nameTagProperties.dimensions = { x: displayUsername.length / 12, y: 0.2, z: 1 };
        
        var createOverlay = overlaysCreated.push(overlaysCreated, Overlays.addOverlay("text3d", nameTagProperties));
        avatarsWithOverlays.push(entityClicked);
        
        Script.setTimeout(function() {
            Overlays.deleteOverlay(overlaysCreated[createOverlay-1]);
            const index = avatarsWithOverlays.indexOf(entityClicked);
            avatarsWithOverlays.splice(index, 1);
        }, howLongWillNameTagAppear * 1000);
    }

    function scriptFinished() {
        for(var i = 0; i < overlaysCreated.length; i++) {
            Overlays.deleteOverlay(overlaysCreated[i]);
        }
        Controller.disableMapping(mapping_name);
    }
    
    Controller.enableMapping(mapping_name);
    Script.scriptEnding.connect(scriptFinished);
}());
