/*
    clickToExternalURL.js

    Created by Kalila L. on 5 Sep 2020
    Copyright 2020 Vircadia and contributors.
    
    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

(function () {
    "use strict";
    this.entityID = null;
    var _this = this;
    
    var overlayWebWindow;
    
    function getURLfromEntityDescription() {
        return Entities.getEntityProperties(_this.entityID, ["description"]).description;
    }
    
    function onMousePressOnEntity(pressedEntityID, event) {
        if (_this.entityID === pressedEntityID) {
            Window.openUrl(getURLfromEntityDescription());
        }
    }
    
    // Standard preload and unload, initialize the entity script here.

    this.preload = function (ourID) {
        this.entityID = ourID;
        
        Entities.mousePressOnEntity.connect(onMousePressOnEntity);
    };

    this.unload = function(entityID) {
        Entities.mousePressOnEntity.disconnect(onMousePressOnEntity);
    };

});
