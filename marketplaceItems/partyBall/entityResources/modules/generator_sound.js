/*

    Sound Generator
    generator_sound.js
    Created by Milad Nazeri on 2019-01-16
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Used as a mini sound library to play a collection of sounds
    Some code from soundArray.js in the Hifi archive repo

*/
print("in generator sound");


Script.resetModuleCache(true);


// Constructor function to create a sound library to play randomly
function SoundGenerator(audioOptions, autoUpdateAudioPosition) {
    this.audioOptions = audioOptions !== undefined ? audioOptions : {};
    this.autoUpdateAudioPosition = autoUpdateAudioPosition !== undefined ? autoUpdateAudioPosition : false;
    if (this.audioOptions.position === undefined) {
        this.audioOptions.position = Vec3.sum(this.position, { x: 0, y: 1, z: 0});
    }
    if (this.audioOptions.volume === undefined) {
        this.audioOptions.volume = 1.0;
    }
    this.position = null;
    this.injector = null;
    this.sounds = [];
}

// Updates the position to play from
function updatePosition(position){
    this.position = position;
}


// Grabs the url of a sound and pushes it to the sound list
function addSound(soundURL) {
    this.sounds.push(SoundCache.getSound(soundURL));
}


// Play a sound from an index
function play(index) {
    if (0 <= index && index < this.sounds.length) {
        if (this.autoUpdateAudioPosition) {
            this.updateAudioPosition();
        }
        if (this.sounds[index].downloaded) {
            this.injector = Audio.playSound(this.sounds[index], this.audioOptions);
        }
    } else {
        print("Index " + index + " out of range.");
    }
}


// Play a random sound from the array
function playRandom() {
    if (this.sounds.length > 0) {
        this.play(Math.floor(Math.random() * this.sounds.length));
    } else {
        print("[ERROR] libraries/soundArray.js:playRandom() : Array is empty.");
    }
}


// Updates the audio position basesd on your Avatar if selected
function updateAudioPosition() {
    var position = MyAvatar.position;
    var forwardVector = Quat.getForward(MyAvatar.orientation);
    this.audioOptions.position = Vec3.sum(position, forwardVector);
}


function stop() {
    try {
        this.injector.stop();

    } catch (e) {
        // e
    }
}


SoundGenerator.prototype = {
    updatePosition: updatePosition,
    addSound: addSound,
    play: play,
    stop: stop,
    playRandom: playRandom,
    updateAudioPosition: updateAudioPosition
};

module.exports = SoundGenerator;
