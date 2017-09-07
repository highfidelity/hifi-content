//This script acts on the reflection box in front of the mirror so that when and avatar
//enters the area, the mirror will reflect an image via the spectator camera

(function () {
    print("Starting reflection script...............");
    var mirrorID, reflectionAreaID;
   //get id of reflection area and mirror
    this.preload = function(entityID) {
        reflectionAreaID = entityID;
        mirrorID = Entities.getEntityProperties(reflectionAreaID, 'parentID').parentID;
        print("Reflection area ID is : " + reflectionAreaID);
        print("Mirror area ID is : " + mirrorID);
  };

    //when avatar enters reflection area, begin reflecting
    this.enterEntity = function(entityID){
        
      // var mirrorOverlayOn = function() {
        //if(mirrorID.mirrorOverlayRunning == false) {
            Entities.callEntityMethod(mirrorID, 'toggleMirrorOverlay');
            print("Mirror is now reflecting.");
      //  }
      // }
    }

    //when avatar leaves reflection area, stop reflecting
    this.leaveEntity = function (entityID) {
      //  var mirrorOverlayOff = function() {
        //if(mirrorID.mirrorOverlayRunning == true) {
            Entities.callEntityMethod(mirrorID, 'toggleMirrorOverlay');
            print("Mirror is NOT reflecting anymore.");
       // }
            
       // }
    }
})