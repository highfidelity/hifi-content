/* globals Entities, Script, AnimationCache, Settings, MyAvatar, DriveKeys, AvatarList,
 Vec3, HMD, Overlays, Camera, isInEditMode */

(function() {

    var isOccupied;
    var entityID = null;
    function SitServer() {

    }

    SitServer.prototype = {
        remotelyCallable: [
            "getOccupiedStatus",
            "onSitDown",
            "onStandUp"
        ],
        preload: function (id) {
            entityID = id;
            isOccupied = false;
        },

        getOccupiedStatus: function (id, param) {
            var clientSessionID = param[0];
            Entities.callEntityClientMethod(
                clientSessionID, 
                entityID, 
                "setIsOccupied", 
                [JSON.stringify(isOccupied)]
            );
        },

        onSitDown: function () {
            print("hello2", isOccupied);
            isOccupied = true;
        },

        onStandUp: function () {
            print("hello3", isOccupied);
            isOccupied = false;
        }
    };

    return new SitServer();
});