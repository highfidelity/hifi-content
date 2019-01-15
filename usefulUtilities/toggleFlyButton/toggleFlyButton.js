//
//  toggleFlyButton.js
//
//  created by Zach Fox on 2019-01-10
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() { 
    var _this;
    var flyingEnabled;
    var statusTextOverlayID;
	// Since there's no signal in-engine for when a user's flying preferences
	// change, we need to check the settings on an interval.
	// See:
	// https://highfidelity.fogbugz.com/f/cases/20686/Add-flyingPrefDesktopChanged-and-flyingPrefHMDChanged-signals
	var updateStatusTextInterval;

    var UPDATE_TEXT_DELAY_MS = 150;
	var UPDATE_STATUS_TEXT_INTERVAL_MS = 2500;

    var ToggleFlyButton = function() {
        _this = this;
    };

    ToggleFlyButton.prototype = {
        // Set up the entity ID, rez the status text overlay, and connect the
        // HMD displayModeChanged signal
        preload: function(entityID){
            _this.entityID = entityID;
            _this.rezStatusTextOverlay();
            HMD.displayModeChanged.connect(_this.updateStatusText);
			updateStatusTextInterval = Script.setInterval(_this.updateStatusText, UPDATE_STATUS_TEXT_INTERVAL_MS);
        },
        
        // When the script goes down, delete the status text overlay (if it exists),
        // and disconnect our signal
        unload: function() {
            if (statusTextOverlayID) {
                Overlays.deleteOverlay(statusTextOverlayID);
            }
            HMD.displayModeChanged.disconnect(_this.updateStatusText);
			Script.clearInterval(updateStatusTextInterval);
        },

        // When the user uses the mouse OR their hand controller lasers
        // to click on the button...
        mousePressOnEntity: function(entityID, mouseEvent) {
            if (!mouseEvent.button === "Primary") {
                return;
            }
            _this.toggleFlyingEnabled();
        },
        
        // Create the status text overlay that'll show Flying Preference
        // status.
        rezStatusTextOverlay: function() {
            statusTextOverlayID = Overlays.addOverlay("text3d", {
                "parentID": _this.entityID,
                "localPosition": {x: -0.5593090057373047,
					y: 0.1416434347629547,
					z: 0.1189870834350586
				},
                "lineHeight": 0.11,
                "dimensions": {x: 0.5120117664337158, y: 0.1607130914926529},
                "topMargin": 0,
                "rightMargin": 0,
                "bottomMargin": 0,
                "leftMargin": 0,
            });
            _this.updateStatusText();
        },
        
        // Update the status text overlay according to whether or not
        // the user has Flying enabled.
        updateStatusText: function() {
            // This should never happen, but protect against trying to
            // edit the overlay if the overlay doesn't exist.
            if (!statusTextOverlayID) {
                return;
            }

            flyingEnabled = MyAvatar.getFlyingEnabled();
            
            var overlayText = (flyingEnabled ? "ENABLED" : "DISABLED");
            
            Overlays.editOverlay(statusTextOverlayID, {
                "text": overlayText
            });
        },
        
        // This'll toggle Flying in VR mode ONLY. It won't do anything in Desktop mode.
        toggleFlyingEnabled: function() {
			if (!HMD.active) {
				return;
			}
			
            console.log("User clicked toggleFlyButton while in VR mode! Setting flying preference to: " + !flyingEnabled);
			
			MyAvatar.setFlyingHMDPref(!flyingEnabled);
            
            // This preference doesn't update instantaneously,
            // so we have to wait a few milliseconds before updating the overlay's text.
            Script.setTimeout(function() {
                _this.updateStatusText();
            }, UPDATE_TEXT_DELAY_MS);
        }
    };

    return new ToggleFlyButton();
});