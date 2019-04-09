//
//  unmuteZoneClient.js
//
//  Add this script to a zone entity as a client script.
//  Users that enter the zone will be unmuted.
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


    var previousMuteSetting,
        usePreviousMuteSetting,
        isConnected;
    UnmuteZoneClient.prototype = {
        preload: function(id) {
            
        },
        enterEntity: function() {
            previousMuteSetting = Audio.muted;
            Audio.muted = false;
            
            usePreviousMuteSetting = true;
            Audio.mutedChanged.connect(onMuteSettingChanged);
            isConnected = true;
        },
        leaveEntity: function() {
            if (usePreviousMuteSetting) {
                Audio.muted = previousMuteSetting;
            }
            if (isConnected) {
                // only disconnect once
                Audio.mutedChanged.disconnect(onMuteSettingChanged);
                isConnected = false;
            }
        },
        unload: function() {
            if (isConnected) {
                // only disconnect once
                Audio.mutedChanged.disconnect(onMuteSettingChanged);
                isConnected = false;
            }
        }
    };

    
    return new UnmuteZoneClient();
});
