(function(){
    var SOUND_URL = Script.resolvePath("Sounds/undo-notif.wav");

    var walkRoles = ["walkFwd", "idleToWalkFwd", "walkBwdNormal"];
    var sound = SoundCache.getSound(SOUND_URL);

    function resetAnimations(){
        walkRoles.forEach(function(item) {
            MyAvatar.restoreRoleAnimation(item);
        });
        if (sound.downloaded) {
            Audio.playSound(sound, {
                volume: 0.5,
                position: MyAvatar.position
            });
        }
    }

    var ResetButton = function() {

    };

    ResetButton.prototype = {
        mousePressOnEntity: function() {
            resetAnimations();
        },
        startNearTrigger: function() {
            resetAnimations();
        }
    };

    return new ResetButton();
})