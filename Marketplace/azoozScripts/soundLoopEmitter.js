(function(){

    var soundURL = null; 
    var lastSoundURL = null;
    var soundVolume = null;
    var refreshInterval = 500;
    var soundData = null;
    var injector = null;
    var entityID = null;
    var properties = null;	
    var intervalID;

    this.preload = function(pEntityID) {
        entityID = pEntityID;        
        intervalID = Script.setInterval(function() {		
            properties = Entities.getEntityProperties(entityID, ["position", "userData"]); 
            if (!properties.userData) {
                print("Sound emitter "+entityID+" missing user data."); 
                return;
            } try {
                soundData = JSON.parse(properties.userData); 
                soundURL = SoundCache.getSound(soundData.soundURL);
                soundVolume = !isNaN(soundData.soundVolume) ? Number(soundData.soundVolume) : 0.0;
                refreshInterval = !isNaN(soundData.refreshInterval) ? Number(soundData.refreshInterval) : 1000.0;
                refreshInterval = Math.min(1000, Math.max(refreshInterval, 10)); // cap updates at min 10 ms
            } catch (e) {
                // e
            }
                
            if (!injector) {
                if (soundURL.downloaded) {
                    injector = Audio.playSound(soundURL, {
                        position: properties.position,
                        volume: soundVolume,
                        loop: true,// soundLoop,
                        localOnly: true// ;//soundLocal
                    });
                }
                lastSoundURL = soundData.soundURL;
            } else {
                if (lastSoundURL !== soundData.soundURL) {
                    injector.stop();
                    injector = null;
                    soundURL = SoundCache.getSound(lastSoundURL);
                } else {
                    injector.setOptions({
                        position: properties.position,
                        volume: soundVolume
                    });
                }
            }
        }, refreshInterval);
    };
    
    this.unload = function(){
        Script.clearInterval(intervalID);
        if (injector) {
            injector.stop();
            injector = null;
        }
    };
    
});
