/* globals Entities, Script, AnimationCache, Settings, MyAvatar, DriveKeys, AvatarList,
 Vec3, HMD, Overlays, Camera, isInEditMode */

(function() {

    var isOccupied;
    var entityID = null;
    var currentClientSessionID = null;

    var TEN_SECONDS = 10000;
    var ONE_SECOND = 1000;
    var resolved = false;

    var heartbeatInterval = null;

    function SitServer() {

    }

    function checkClient() {
        print("CHECK CLIENT");
        Entities.callEntityClientMethod(
            currentClientSessionID, 
            entityID, 
            "check"
        );

        Script.setTimeout(function (){
            if (resolved === true){
                print("RESOLVED IS TRUE");
                // Seat is occupied
                resolved = false;
            } else {
                print("RESOLVED IS FALSE RESET!");
                // Seat is not occupied
                isOccupied = false;
                currentClientSessionID = null;
            }
        }, ONE_SECOND);
    }

    SitServer.prototype = {

        remotelyCallable: [
            "getOccupiedStatus",
            "onSitDown",
            "onStandUp",
            "checkResolved"
        ],
        preload: function (id) {
            entityID = id;
            isOccupied = false;
            resolved = false;

            heartbeatInterval = Script.setInterval(function () {
                print("HEARTBEAT");
                if (isOccupied) {
                    checkClient();
                }
            }, TEN_SECONDS);
        },

        checkResolved: function () {
            // Called by remote client script
            // indicating avatar is still sitting in chair
            resolved = true;
        },

        onSitDown: function (id, param) {
            var clientSessionID = param[0];

            print("ROBIN IS HERE!", isOccupied);

            if (isOccupied === false){

                currentClientSessionID = clientSessionID;
                isOccupied = true;

                Entities.callEntityClientMethod(
                    clientSessionID, 
                    entityID, 
                    "startSitDown"
                );
            }
        },

        onStandUp: function () {
            isOccupied = false;
        },

        unload: function () {
            isOccupied = false;
            Script.clearInterval(heartbeatInterval);
        }
    };

    return new SitServer();
});