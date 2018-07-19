(function(){

    var timeCreated;
    var interval;
    var _entityID;

    var WebOverlaySpawner = function(){};

    function getTimestampFromMaster() {
        var elapsed = Math.round(((Date.now() - timeCreated) / 1000));
        print("Elapsed:" + elapsed);
        Entities.editEntity(_entityID, {userData : JSON.stringify({ "time" : elapsed})});
    }

    WebOverlaySpawner.prototype = {
        preload: function(entityID) {
            timeCreated = Date.now();
            _entityID = entityID;
            interval = Script.setInterval(getTimestampFromMaster, 1000);
        },

        unload: function() {
            Script.clearInterval(interval);
        }
    };

    return new WebOverlaySpawner();

});