(function() {
    Script.include('utils.js');
    
    var _this;
    print("Daantje Debug ");


    var Whiteboard = function() {

    };

    Whiteboard.prototype = {
        remotelyCallable: ['startMarkerStroke', 'continueMarkerStroke', 'resetMarkerStroke', 'erase', 'clearBoard'],
        preload: function(entityID){
            print("Daantje Debug on Preload " + entityID);
        },
        /**
         * Remotely callable startMarkerLine function
         * @param entityID current entity ID
         * @param param parameters (expected to be empty)
         */
        startMarkerStroke: function(entityID, params) {
            print("Daantje Debug startMarkerStroke");
        },
        continueMarkerStroke: function(entityID, params) {
            print("Daantje Debug continueMarkerStroke");
        },
        resetMarkerStroke: function(entityID, params) {
            print("Daantje Debug resetMarkerStroke");
        },
        erase: function(entityID, params) {
            print("Daantje Debug erase");
        },
		clearBoard: function(entityID, params) {
            print("Daantje Debug clear board");
        },
        unload: function() {
            print("Daantje Debug on Unload");
        }
    };
    return new Whiteboard();

    // this.entityID = null;
    
    // this.preload = function(entityID) {
    //     this.entityID = entityID;
    //     print("Daantje Debug on Preload " + entityID);
        
    // };
    // this.unload = function() {
    //     print("Daantje Debug on Unload");
    // };

    // this.startMarkerLine = function(position) {
    //     print("Start Marker Line - Test function " + JSON.stringify(position));
    // }
});