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

    var UPDATE_TEXT_DELAY_MS = 150;

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
        },
        
        // When the script goes down, delete the status text overlay (if it exists),
        // and disconnect our signal
		unload: function() {
            if (statusTextOverlayID) {
                Overlays.deleteOverlay(statusTextOverlayID);
            }
			HMD.displayModeChanged.disconnect(_this.updateStatusText);
		},

        // When the user uses the mouse to click on the button...
        clickDownOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                _this.toggleFlyingEnabled();
            }
        },
        
        // When the user uses hand controller lasers to click on the button...
        startNearTrigger: function() {
            _this.toggleFlyingEnabled();
        },
        
        // Create the status text overlay that'll show Flying Preference
        // status.
        rezStatusTextOverlay: function() {
            statusTextOverlayID = Overlays.addOverlay("text3d", {
                "parentID": _this.entityID,
                "localPosition": {x: 0, y: 0.5, z: 0},
                "lineHeight": 0.1,
                "dimensions": {x: 1.0, y: 0.8},
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
			
			var overlayText = "Flying in " + (HMD.active ? "VR" : "Desktop") +
				" mode\nis currently\n" + (flyingEnabled ? "ENABLED" : "DISABLED") +
				"\n\nClick button to toggle.";
			
            Overlays.editOverlay(statusTextOverlayID, {
				"text": overlayText
			});
        },
        
        // This'll toggle Flying in BOTH desktop and VR modes.
        toggleFlyingEnabled: function() {
            console.log("User clicked toggleFlyButton! Setting flying preference to: " + !flyingEnabled);

            MyAvatar.setFlyingDesktopPref(!flyingEnabled);
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