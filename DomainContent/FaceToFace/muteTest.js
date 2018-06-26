/* global AccountServices */
(function() {

    var ignore;

    if (AccountServices.username === "Philip" || AccountServices.username === "theextendedmind" || 
        Audio.muted) {
        ignore = true;
    }

    if (!ignore) {
        Audio.muted = true;
    }
    
    this.unload = function() {
        if (!ignore) {
            Audio.muted = false;
        }
    };
});