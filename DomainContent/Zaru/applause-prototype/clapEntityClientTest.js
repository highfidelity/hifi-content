/* globals Entities, Audio, SoundCache*/
(function(){

    var ClickClapper = function(){};
    var _entityID;
    var _position;
    
    var nearbyManager;
    
    ClickClapper.prototype = {
        preload: function(entityID) {
            _entityID = entityID;
            _position = Entities.getEntityProperties(entityID, 'position').position;
  
        },
        clickDownOnEntity : function() {
            nearbyManager = Entities.findEntitiesByName("Applause-Listener", _position, 25, true)[0];
            Entities.callEntityServerMethod(nearbyManager, 'queueApplauseIntent', [_position]);
        }
    };
    
    return new ClickClapper();
  
});