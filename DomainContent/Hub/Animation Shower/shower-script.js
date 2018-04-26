/* globals AnimationCache, MyAvatar */
(function(){

    var ANIMATION_URL_ARRAY = [
        "https://hifi-content.s3.amazonaws.com/liv/dev/HubPrototypes/Crouched-Walking-32.fbx",
        "https://hifi-content.s3.amazonaws.com/liv/dev/HubPrototypes/Walking_122.fbx",
        "https://hifi-content.s3.amazonaws.com/liv/dev/HubPrototypes/Walking_36.fbx",
        "https://hifi-content.s3.amazonaws.com/liv/dev/HubPrototypes/Walking_38.fbx",
        "https://hifi-content.s3.amazonaws.com/liv/dev/HubPrototypes/Walking_61.fbx",
        "https://hifi-content.s3.amazonaws.com/liv/dev/HubPrototypes/Walking_65.fbx"
    ];
    var SOUND_URL = 
        "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/Hub/Animation%20Shower/Sounds/animationChange.wav";
    var FPS = 60;
    var AUDIO_VOLUME_LEVEL = 0.5;

    var Animations = Array();
    var sound;
    var _this;

    var AnimationShower = function(){
        _this = this;
    };
  
    AnimationShower.prototype = {
        preload: function(entityID){
            sound = SoundCache.getSound(SOUND_URL);
            ANIMATION_URL_ARRAY.forEach(function(url){
                var resource = AnimationCache.prefetch(url);
                var animation = AnimationCache.getAnimation(url);
                Animations.push({url: url, animation: animation, resource: resource}); 
            });
        }, 
        enterEntity: function() {
            var animationIndex = Math.floor(Math.random()* 6);
            _this.playSound(MyAvatar.position);
            MyAvatar.overrideRoleAnimation("walkFwd", Animations[animationIndex].url, FPS, true, 0, 
                Animations[animationIndex].animation.frames.length);
            MyAvatar.overrideRoleAnimation("idleToWalkFwd", Animations[animationIndex].url, FPS, true, 0, 
                Animations[animationIndex].animation.frames.length);
            MyAvatar.overrideRoleAnimation("walkBwdNormal", Animations[animationIndex].url, -FPS, true, 0, 
                Animations[animationIndex].animation.frames.length);
            // these don't seem to alter anything
            MyAvatar.overrideRoleAnimation("strafeLeftShort  ", Animations[animationIndex].url, FPS, true, 0, 
                Animations[animationIndex].animation.frames.length);
            MyAvatar.overrideRoleAnimation("strafeRightNormal ", Animations[animationIndex].url, FPS, true, 0, 
                Animations[animationIndex].animation.frames.length);
        },
        playSound: function(position) {
            if (sound.downloaded) {
                Audio.playSound(sound, {
                    position: position,
                    volume: AUDIO_VOLUME_LEVEL
                });
            }
        }
    };
  
    return new AnimationShower();
  
  
});