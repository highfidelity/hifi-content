// Happy Boombox
// boomBoxEntityScript.js
// Licensed under the Apache 2.0 License
// Music provided by Bensound
(function(){
    var LOAD_WAIT = 500;

    var selfEntityID;
    var audioInjector;

    var volume = 0.5;

    function BoomBox(){

    }

    /**
     * playSong()
     * Checks to see if the given sound is downloaded.
     * If the song is downloaded, it plays the sound per the audio injector options
     * If the song is not downloaded, we wait half a second and try again.
     * @param {*SoundObject} sound 
     * @param {*Object} audioInjectorOptions 
     */
    function playSong(sound, audioInjectorOptions) {
        if (sound.downloaded) {
            audioInjector = Audio.playSound(sound, audioInjectorOptions);
        } else {
            Script.setTimeout(playSong, LOAD_WAIT);
        }
    }

    /**
     * BoomBox Prototype
     * This contains our functions that are specific to our boombox entity. 
     */
    BoomBox.prototype = {
        /**
         * The remotelyCallable array specifies which functions in our prototype object
         * can be called from another entity, Interface, or assignment client script. The boomBoxEntityScript
         * remotely calls these methods to control the audio on our entity, so we need to directly list them
         * to make them accessible to other scripts.
         */
        remotelyCallable: ['playMusic', 'stopMusic', 'adjustVolume'],
        /**
         * The preload() function is called when the entity server script first starts: when the server first comes up,
         * or after the entity server script is reloaded. It has a reference to the entityID of the entity that it is on, 
         * which we store in our selfEntityID variable. 
         * 
         * We attempt to save some time down the road by accessing the userdata list of music and preloading the audio, then
         * capture the initial volume of the boombox so that we do not need to make an additional edit down the road.
         */
        preload: function(entityID) {
            selfEntityID = entityID;
            // Userdata will be returned as a stringified object, so we parse it to access the objects
            var boomBoxData = JSON.parse(Entities.getEntityProperties(selfEntityID, 'userData').userData);
            var songsToPreload = boomBoxData.music;
            songsToPreload.foreach(function(song){
                SoundCache.preload(song);
            });
            volume = boomBoxData.volume;
        },
        /**
         * The unload() function is called when the entity server script is no longer needed: either it is removed 
         * from the entity or the entity script server has stopped. We want to stop playing our audio if this happens 
         * when we are playing music.
         */
        unload: function () {
            if (audioInjector && audioInjector.playing) {
                audioInjector.stop();
            }
        },
        /**
         * One of our remotely callable functions. The boomBoxEntityScript can call this function remotely when
         * it receives a request from the HTML controller. We pass in the specified sound URL through the args
         * parameter, set up our audio injector options, stop previously playing music, and then play the new song.
         */
        playMusic: function(entityID, args) {
            var sound = SoundCache.getSound(args[0]);
            var audioInjectorOptions = {
                volume: volume, 
                loop: false,
                position: Entities.getEntityProperties(selfEntityID, 'position').position
            };
            if (audioInjector && audioInjector.playing) {
                audioInjector.stop();
            }
            playSong(sound, audioInjectorOptions);
        }, 
        /**
         * Another remotely callable function. This stops the music from playing and does not require a parameter.
         */
        stopMusic : function() {
            if (audioInjector && audioInjector.playing) {
                audioInjector.stop();
            }
        }, 
        /**
         * The last of our remotely callable functions. The args[0] parameter contains the value of the new volume
         * level, but the type of the argument is a string, so we first parse it into a float. We then get the position
         * and userdata properties of our boombox entity, edit the properties of our audio injector to change the volume
         * of playing music, and save the new volume value back to the userdata. 
         */
        adjustVolume : function(entityID, args) {
            volume = parseFloat(args[0]);
            var properties = Entities.getEntityProperties(selfEntityID, ['position', 'userData']);
            if (audioInjector) {
                audioInjector.setOptions({
                    volume: volume,
                    loop: false,
                    position: properties.position
                });               
            }

            var userdata = JSON.parse(properties.userData);
            userdata.volume = volume;
            // We need to stringify our data before resetting it on the entity
            Entities.editEntity(selfEntityID, {'userData' : JSON.stringify(userdata)});
        }
    };
    return new BoomBox();
});