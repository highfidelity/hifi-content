(function(){

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    var debug = true;
    var FALSE = "false";


    function log(message, object, enabled){
        if (!debug || enabled === FALSE) {
            return;
        }

        print("\n\n");
        print("\t" + message);

        if (object) {
            print("\t\t" + JSON.stringify(object));
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************


    var isEnabled = true;
    // var appUi = Script.require('appUi');

    var pointer = Pointers.createPointer(PickType.Ray, {
        joint: "Mouse",
        filter: Picks.PICK_AVATARS,
        distanceScaleEnd: true,
        hover: false,
        enabled: false
    });
    
    var pointerLeftHand = Pointers.createPointer(PickType.Ray, {
        joint: "_CAMERA_RELATIVE_CONTROLLER_LEFTHAND",
        filter: Picks.PICK_AVATARS,
        distanceScaleEnd: true,
        hover: false,
        enabled: false
    });

    var pointerRightHand = Pointers.createPointer(PickType.Ray, {
        joint: "_CAMERA_RELATIVE_CONTROLLER_RIGHTHAND",
        filter: Picks.PICK_AVATARS,
        distanceScaleEnd: true,
        hover: false,
        enabled: false
    });

    var pointers = [pointer, pointerLeftHand, pointerRightHand];

    var MAPPING_NAME = "SOLO_POINTER";

    var mapping = Controller.newMapping(MAPPING_NAME);

    var soloAvatars = [];

    mapping.from(Controller.Hardware.Keyboard.LeftMouseButton).to(function(value) {
        var res = Pointers.getPrevPickResult(pointer);
        print(res.objectID);
        if (typeof res.objectID === "string") {
            if (!(soloAvatars.indexOf(res.objectID) !== -1)) {
                soloAvatar(res.objectID);
            }
        }
    });

    mapping.from(Controller.Standard.RT).to(function(value) {
        var res = Pointers.getPrevPickResult(pointerRightHand);
        if (typeof res.objectID === "string") {
            if (!(soloAvatars.indexOf(res.objectID) !== -1)) {
                soloAvatar(res.objectID);
            }
        }
    });

    mapping.from(Controller.Standard.LT).to(function(value) {
        var res = Pointers.getPrevPickResult(pointerLeftHand);
        if (typeof res.objectID === "string") {
            if (!(soloAvatars.indexOf(res.objectID) !== -1)) {
                soloAvatar(res.objectID);
            }
        }
    });

    function soloAvatar(entityClicked, textColor, bgAlpha) {
        log("in soloAvatar");

        if (!isEnabled) {
            return;
        }

        var getAvatarClicked = AvatarList.getAvatar(entityClicked);
        // var entityPosition = getAvatarClicked.position;
        var displayUsername = getAvatarClicked.sessionDisplayName;

        soloAvatars.push(entityClicked);
    } 
    

    function onOpen() {
        log("onOpen");
        pointers.forEach(function(pointer){
            Pointers.enablePointer(pointer);
        });

        Controller.enableMapping(MAPPING_NAME);
    }
    
    function onClose() {
        log("onClose");
        pointers.forEach(function(pointer){
            Pointers.disablePointer(pointer);
        });

        Controller.disableMapping(MAPPING_NAME);
    }

    function scriptFinished() {
        Controller.disableMapping(MAPPING_NAME);
    }

    Controller.enableMapping(MAPPING_NAME);
    Script.scriptEnding.connect(scriptFinished);

})();