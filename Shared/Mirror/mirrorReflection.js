(function () {
    var reflectionAreaId = "{a8adb4fd-9127-40f4-973f-f440828c317f}";
    var mirrorID = "{f6ee91c2-f287-42da-886f-169fd543e160}";

    this.enterEntity = function(entityID){
        
        Entities.callEntityMethod(mirrorID, 'mirrorOverlayOn');
        print("Mirror is now reflecting.");
    }

    this.leaveEntity = function (entityID) {
        Entities.callEntityMethod(mirrorID, 'mirrorOverlayOff');
        print("Mirror is NOT reflecting anymore.");
    }
})