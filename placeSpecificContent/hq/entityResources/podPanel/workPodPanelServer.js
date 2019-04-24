//
//  workPodPanelServer.js
//
//  Created by Rebecca Stankus on 04/22/19.
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {

    var _this;

    var WAIT_FOR_ENTITIES_TO_LOAD_MS = 500;
    var NEGATIVE = -1;
    var GREEN = {red:0,green:255,blue:0};
    var YELLOW = {red:255,green:255,blue:0};
    var RED = {red:255,green:0,blue:0};

    var podOwnerUsername;
    var podOwnerDisplayName;

    var PodPanelServer = function() {
        _this = this;
    };

    PodPanelServer.prototype = {
        remotelyCallable: ['changeContentSet', 'changeEntity', 'getOwnerInfo', 'setOwnerInfo'],
        preload: function(entityID){
            _this.entityID = entityID;
            // Script.setTimeout(function() {
            //     Entities.getChildrenIDs(_this.entityID).forEach(function(panelChildID) {
            //         var name = Entities.getEntityProperties(panelChildID, 'name').name;
            //         if (name.indexOf("Pod Panel Preset Button") !== NEGATIVE) {
            //             allPresetButtonsAndText.push(panelChildID);
            //         }
            //     });
            // }, WAIT_FOR_ENTITIES_TO_LOAD_MS);
        },

        changeContentSet: function(id, params) {
            // var presetJSONURL = params[0];
            // var userConfigurationData = JSON.parse(params[1]);
            // print("CHANGE CONTENT SET TO ", presetJSONURL);
            // // use config data to update entities if it exists
        },

        changeEntity: function(entityID, changeType, newData) {
            print("CHANGE ENTITY ", entityID, " TO NEW ", changeType, " OF ", newData);
        },

        getOwnerInfo: function(id, clientSessionIDParams) {
            print("GETTING OWNER INFO");
            var clientSessionID = clientSessionIDParams[0];
            Entities.callEntityClientMethod(clientSessionID, _this.entityID, 'ownerInfoReceived', 
                [podOwnerUsername, podOwnerDisplayName]);
        },

        setOwnerInfo: function(id, ownerInfoParams) {
            print("SETTING OWNER INFO");
            podOwnerDisplayName = ownerInfoParams[0];
            podOwnerUsername = ownerInfoParams[1];
        },

        unload: function() {
        }
    };

    return new PodPanelServer();
});
