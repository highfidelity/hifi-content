(function(){
    /* eslint-disable indent */
    // Init
    // ////////////////////////////////////////////////////////////////////////

        var
            _entityID,
            debug = true
        ;
    
    // Consts
    // ////////////////////////////////////////////////////////////////////////

    // Helper Functions
    // ////////////////////////////////////////////////////////////////////////
        function log(label, value, isActive) {
            if (!debug) {
                return;
            }
            isActive = isActive || true;
            if (!isActive) {
                return;
            }
            print("\n" + label + "\n" + "***************************************\n", JSON.stringify(value));
        }

    // Entity Definition
    // ////////////////////////////////////////////////////////////////////////
        console.log("123");
        function SupriseBall(){
        }

        SupriseBall.prototype = {
            preload: function(entityID){
                log("preload");
                _entityID = entityID;
            },

            mouseReleaseOnEntity: function() {
                log("mouse release");
                Entities.callEntityServerMethod(_entityID, "startTimer");
            },

            releaseGrab: function(id, hand){
                log("releaseGrab");
                Entities.callEntityServerMethod(_entityID, "startTimer");
            }
        };

        return new SupriseBall();
});
