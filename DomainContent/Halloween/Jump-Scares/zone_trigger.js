//
//  zone_trigger.js
//
//  Created by Milad Nazeri on 09/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Zone script to help trigger entties that share a common trigger interface.  Can handle single id or an array of ids in the userdata.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var namesToFind = {};
    var idsToFind = {};
    var _entityID = null;
    var _userData = null;
    var _userDataProperties = null;
    var idsToFindKeys = [];
    var MAX_COUNTER = 10; 
    var TIME_OUT_INTERVAL = 500;
    var SEARCH_RADIUS = 300;

    this.preload = function(entityID) {
        _entityID = entityID;
        var position = Entities.getEntityProperties(entityID,'position').position;
        _userData = Entities.getEntityProperties(_entityID, 'userData').userData;
        try {
            _userDataProperties = JSON.parse(_userData);
            namesToFind = _userDataProperties.namesToFind;
        } catch (error) {
            //
        }
        if (typeof namesToFind !== 'string') {
            namesToFind.forEach(function(name) {
                idsToFind[name] = null;
            });
        } else {
            idsToFind[namesToFind] = null;
        }

        idsToFindKeys = Object.keys(idsToFind); 

        var timeoutCounter = 0;

        function idCheck() {
            idsToFindKeys.forEach(function(name) {
                var found = Entities.findEntitiesByName(name, position, SEARCH_RADIUS);
                idsToFind[name] = found[0];
            });
            var foundIDS = idsToFindKeys.reduce(function(accumulator, current) {
                if (current !== null) {
                    accumulator.push(current);
                }
                return accumulator;
            }, []);
            
            if (idsToFindKeys.length !== foundIDS.length && timeoutCounter <= MAX_COUNTER) {
                timeoutCounter++;
                
                Script.setTimeout(idCheck, TIME_OUT_INTERVAL);
            }
        }
        
        Script.setTimeout(idCheck, TIME_OUT_INTERVAL);
    };

    this.enterEntity = function() {
        idsToFindKeys.forEach(function(name) {
            Entities.callEntityServerMethod(idsToFind[name], "start");
        });
    };
});
