//
//  powerDevice.js
//
//  Created by David Back on 12/11/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var invasionUtils = Script.require('./invasionUtils.js');
    
    var _this;
    var healthBarID;
    var healthBarBGID;

    function PowerDevice() {
        _this = this;
    }

    PowerDevice.prototype = {
        update: function() {
            var deviceHealth = invasionUtils.getPowerDeviceHealth(_this.entityID);
            invasionUtils.updateHealthBar(healthBarID, deviceHealth);
        },
        
        unload: function() {
            Overlays.deleteOverlay(healthBarID);
            Overlays.deleteOverlay(healthBarBGID);
            Script.update.disconnect(this.update);
        },
    
        preload: function(entityID) {
            this.entityID = entityID;   
            healthBarBGID = invasionUtils.addHealthBarBG(this.entityID, { x: 0, y: 0, z: 5 });
            healthBarID = invasionUtils.addHealthBar(healthBarBGID);
            Script.update.connect(this.update);
        }
    };

    return new PowerDevice();
});
