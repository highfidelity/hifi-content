//
//  avatarCounter.js
//
//  Created by Rebecca Stankus on 07/09/2018.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var UPDATE_INTERVAL = 1000;
    var BEGIN_DOMAIN_API_URL = "https://highfidelity.com/api/v1/domains/";
    var request = Script.require('./modules/request.js').request;
    var _this;

    var AvatarCounter = function() {
        _this = this;
    };

    AvatarCounter.prototype = {
        interval: null,

        preload: function(entityID) {
            _this.entityID = entityID;
            _this.interval = Script.setInterval(function() {
                try {
                    var userData = JSON.parse(Entities.getEntityProperties(_this.entityID, 'userData').userData);
                    var requestURL = BEGIN_DOMAIN_API_URL + userData.domainAPIURL;
                    request(requestURL, function (error, data) {
                        if (!error) {
                            Entities.editEntity(_this.entityID, { text: data.domain.online_users });
                        }
                    });
                } catch (err) {
                    print("Could not get domain data using userData domainAPIURL");
                }
            }, UPDATE_INTERVAL);
        },

        unload: function() {
            if (_this.interval) {
                Script.clearInterval(_this.interval);
            }
        }
    };
        
    return new AvatarCounter;
});
 