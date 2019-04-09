//
//  unmuteZoneClient.js
//
//  Created by Robin Wilson on 2019-04-08
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    
    function onMuteSettingChanged() {
        // if user mutes themselves in the zone, 
        // do not apply the previous mute setting
        usePreviousMuteSetting = false;
    }
    
    
    function UnmuteZoneClient () {
        // blank
    }


    var previousMuteSetting = false,
        usePreviousMuteSetting = true,
        isMutedSignalConnected = false;
    UnmuteZoneClient.prototype = {
        preload: function(id) {
            // blank
        },
        enterEntity: function() {
            // save previous muted setting
            previousMuteSetting = Audio.muted;
            Audio.muted = false;
            
            usePreviousMuteSetting = true;

            Audio.mutedChanged.connect(onMuteSettingChanged);
            isMutedSignalConnected = true;
        },
        leaveEntity: function() {
            if (usePreviousMuteSetting) {
                // did not change muted status while inside the zone
                // apply previous setting
                Audio.muted = previousMuteSetting;
            }

            if (isMutedSignalConnected) {
                // only disconnect once
                Audio.mutedChanged.disconnect(onMuteSettingChanged);
                isMutedSignalConnected = false;
            }
        },
        unload: function() {
            if (isMutedSignalConnected) {
                // only disconnect once
                Audio.mutedChanged.disconnect(onMuteSettingChanged);
                isMutedSignalConnected = false;
            }
        }
    };

    
    return new UnmuteZoneClient();
});
