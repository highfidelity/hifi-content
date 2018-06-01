(function(){

    var GROUP_CLAP_URL = Script.resolvePath("sounds/small-clap.wav");
    var groupClapSound;

    var applauseQueue = [];

    var ApplauseManager = function() {};

    ApplauseManager.prototype = {
        remotelyCallable: ["queueApplauseIntent"],
        preload: function(entityID) {
            groupClapSound = SoundCache.getSound(GROUP_CLAP_URL);
        },
        hasSenderInQueue: function(key) {
            var found = false;
            for (var i = 0; i < applauseQueue.length; i++) {
                if (applauseQueue[i].id === key) {
                    found = true;
                    break;
                }
            }
            return found;
        },
        queueApplauseIntent : function(entityID, params) {
            var _remoteCallerID = Script.remoteCallerID + "";
            print("Remote caller ID: " + _remoteCallerID);
            var intentToAdd = { 
                id : _remoteCallerID,
                position:  params[0]
            };
            if (!this.hasSenderInQueue(intentToAdd.id)) {
                applauseQueue.push(intentToAdd); // queue once per caller
            }
            print(JSON.stringify(applauseQueue));
            if (applauseQueue.length > 2) {
                this.playCrowdApplauseAndResetIntent();
            }
        },
        playCrowdApplauseAndResetIntent : function(){
            applauseQueue.forEach(function(intent) {
                var spot = applauseQueue.pop().position;
                if (groupClapSound.downloaded) {
                    Audio.playSound(groupClapSound, {
                        position: spot,
                        volume: 1.0
                    });
                }
            });
        },
        unload: function() {

        }
    };

    return new ApplauseManager();

});