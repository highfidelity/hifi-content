(function(){

	//var SOUND_URL = "http://hifi-content.s3.amazonaws.com/caitlyn/production/pizzaTurntable/newBuiltMixl.wav";
	var loopTime = -1; // Loop for how long?  -1 is always on.
	var soundURL = null;//SoundCache.getSound(SOUND_URL);
	var lastSoundURL = null;
	var receiverName = "";
	var soundLoop = null;
	var soundLocal = null;
	var soundVolume = null;
	var refreshInterval = 500;
	var soundData = null;
	var injector = null;
	var entityID = null;
	var properties = null;	
	
	this.preload = function(pEntityID) {
        entityID = pEntityID;        
		var intervalID = Script.setInterval(function() {		
			properties = Entities.getEntityProperties(entityID, ["position", "userData"]); 
			 if (!properties.userData) {
                   print("Sound emitter "+entityID+" missing user data."); 
				   return;
                 } try {
                    soundData = JSON.parse(properties.userData); 
					// print("SoundURL "+soundData.soundURL+", lastSoundURL"+lastSoundURL);	
					// need to check that all this stuff even exists and throw error if not.s
					soundURL = SoundCache.getSound(soundData.soundURL);
					receiverName = soundData.receiverName;
					soundVolume = !isNaN(soundData.soundVolume) ? Number(soundData.soundVolume) : 0.0;
					soundLoop = soundData.isLoop;
					soundLocal = soundData.isLocal;
					refreshInterval =  !isNaN(soundData.refreshInterval) ? Number(soundData.refreshInterval) : 1000.0;
					//refreshInterval = soundData.refreshInterval;
					refreshInterval = Math.min(1000, Math.max(refreshInterval, 10)); // cap updates at min 10 ms
                } catch (e){}
				
			if (!injector) {
				if (soundURL.downloaded) {
					injector = Audio.playSound(soundURL, {
						position: properties.position,
						volume: soundVolume,
						loop: true,//soundLoop,
						localOnly: true//;//soundLocal
					});
				}
				lastSoundURL = soundData.soundURL;
			} else {
				if (lastSoundURL != soundData.soundURL) {
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
		if (injector) {
			injector.stop();
			injector = null;
		}
	};
	
});
