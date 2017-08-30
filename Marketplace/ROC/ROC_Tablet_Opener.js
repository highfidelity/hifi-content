//
//  ROC_Tablet_Opener.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/24/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Use this script so I can open the tablet to the knight avatar
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() { 
    var _this = this;

    _this.preload = function(entityID) {
        print("Loading Tablet Opener script");  
    };

    _this.clickReleaseOnEntity = function(entityID, mouseEvent) {
        if (mouseEvent.isLeftButton) {
            setTabletURL(entityID);
        }
    };

    _this.startFarTrigger = function(entityID, args) {
        setTabletURL(entityID);
    };
    
    _this.startNearGrab = function(entityID, args) {
        setTabletURL(entityID);
    };

    function setTabletURL(entityID) {
        try {
            var props = Entities.getEntityProperties(entityID);
            var properties = JSON.parse(props.userData);
            var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
            tablet.gotoWebScreen(properties.tabletURL);
        } catch (err) {
            print("There is an error with the entities tabletURL link");
        }
    }

})
