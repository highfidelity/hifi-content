function Sound(url) {
    this.url = url;
    this.sound = SoundCache.getSound(url);
    this.injector;
    this.SECS_TO_MS = 1000;
}

Sound.prototype = {

    getURL: function () {
        return this.url;
    },
    
    isLoaded: function() {
        return this.sound.downloaded;
    },
    getDurationSeconds: function () {
        if (this.sound.downloaded) {
            return this.sound.duration;
        }
    },
    getDurationMS: function () {
        if (this.sound.downloaded) {
            return this.sound.duration * this.SECS_TO_MS;
        }
    },
    playSoundStaticPosition: function(injectorOptions, bufferTime, onCompleteCallback, args) {
        
        if (this.sound.downloaded) {

            this.injector = Audio.playSound(this.sound, injectorOptions);

            var soundLength = this.getDurationMS();

            if (bufferTime && typeof bufferTime === "number") {
                soundLength = soundLength + bufferTime;
            }
            var injector = this.injector;

            Script.setTimeout(function () {

                if (injector) {
                    injector.stop();
                    injector = null;
                }
 
                if (onCompleteCallback) {
                    onCompleteCallback(args);
                }

            }, soundLength);
        } 
    },
    unload: function () {
        if (this.injector) {
            this.injector.stop();
            this.injector = null;
        }
    }
};

module.exports = Sound;