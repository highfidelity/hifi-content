//
//  HelpMeZone.js
//
//  Triggers an entity server function call when a zone is entered
//
//  Created by Liv Erickson on 12/11/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var _entityID;

    var HelpMeZone = function() {

    };

    HelpMeZone.prototype = {
        preload: function(entityID) {
            _entityID = entityID;
        },
        enterEntity : function() {
            Entities.callEntityServerMethod(_entityID, 'startZoneEffect');
        },
        leaveEntity: function() {
        }
    };

    return new HelpMeZone();

});