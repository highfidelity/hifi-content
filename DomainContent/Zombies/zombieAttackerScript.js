//
//  zombieAttackerScript.js
//
//  Created by David Back on 2/8/18.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

var CHANNEL_NAME = "ZOMBIE_BITE";
var SEARCH_RANGE = 2;
var BITE_RANGE = 0.3;
var BITE_SOUND = SoundCache.getSound("atp:/zombieBite.wav");
var BITE_SOUND_VOLUME = 0.5;
var TRIGGER_CONTROLS = [Controller.Standard.LT, Controller.Standard.RT];
var TRIGGER_THRESHOLD = 0.9;
var BITE_ANIMATION = "atp:/zombieBite.fbx";
var BITE_ANIMATION_START_FRAME = 0;
var BITE_ANIMATION_BLOOD_KEYFRAME = 0;
var BITE_ANIMATION_END_FRAME = 160;
var BITE_ANIMATION_FPS = 60;
var MSEC_PER_SEC = 1000;
var DEBUG_BITE_KEY = "b";
var DEBUG_ENABLED = false;

var bloodTargetAvatar;
var biteAnimationPlaying = false;

function triggerBite() {
    if (biteAnimationPlaying) {
        if (DEBUG_ENABLED) {
            print("triggerBite blocked due to bite animation playing");
        }
        return;
    }

    var myHeadPosition = MyAvatar.getJointPosition("Head");
    var avatarList = AvatarList.getAvatarsInRange(myHeadPosition, SEARCH_RANGE);
    avatarList.forEach(function(targetAvatarSessionUUID) {
        if (targetAvatarSessionUUID !== null && targetAvatarSessionUUID !== MyAvatar.sessionUUID) {
            var targetAvatar = AvatarList.getAvatar(targetAvatarSessionUUID);
            var targetHeadPosition = targetAvatar.getJointPosition("Head");
            if (Vec3.distance(myHeadPosition, targetHeadPosition) < BITE_RANGE) {
                bloodTargetAvatar = targetAvatarSessionUUID;
                if (DEBUG_ENABLED) {
                    print("Biting avatar " + targetAvatarSessionUUID + " from " + MyAvatar.sessionUUID);
                }
                Messages.sendMessage(CHANNEL_NAME, JSON.stringify({type: 'receiveBite', biterID: MyAvatar.sessionUUID, 
                                                                                        victimID: targetAvatarSessionUUID}));
                MyAvatar.overrideAnimation(BITE_ANIMATION, BITE_ANIMATION_FPS, false, 
                                           BITE_ANIMATION_START_FRAME, BITE_ANIMATION_END_FRAME);
                biteAnimationPlaying = true;

                var timeOut = MSEC_PER_SEC * BITE_ANIMATION_END_FRAME / BITE_ANIMATION_FPS;
                Script.setTimeout(function () {
                    biteAnimationPlaying = false;
                    MyAvatar.restoreAnimation();
                }, timeOut);

                var bloodTimeOut = MSEC_PER_SEC * BITE_ANIMATION_BLOOD_KEYFRAME / BITE_ANIMATION_FPS;
                Script.setTimeout(function () {
                    var targetAvatar = AvatarList.getAvatar(bloodTargetAvatar);
                    var targetHeadPosition = targetAvatar.getJointPosition("Head");
                    Audio.playSound(BITE_SOUND, {
                        volume: BITE_SOUND_VOLUME,
                        position: targetHeadPosition
                    });
                }, bloodTimeOut);
                return;
            }
        }
    });
}

function keyPressEvent(event) {
    if (!DEBUG_ENABLED) {
        return;
    }
    if (DEBUG_BITE_KEY === event.text) {
        print("triggerBite called from debug key press");
        triggerBite();
    }
}

function update() {
    for (var i = 0; i < TRIGGER_CONTROLS.length; i++) {
        var triggerValue = Controller.getValue(TRIGGER_CONTROLS[i]);
        if (triggerValue >= TRIGGER_THRESHOLD) {
            if (DEBUG_ENABLED) {
                print("triggerBite called from controller trigger");
            }
            triggerBite();
        }
    }
}

function shutdown() {
    Controller.keyPressEvent.disconnect(keyPressEvent);
}

function init() {
    Script.scriptEnding.connect(shutdown);
    Script.update.connect(update);
    Controller.keyPressEvent.connect(keyPressEvent);
}

init();
