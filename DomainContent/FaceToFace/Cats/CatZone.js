// A script for making a kitten meow when you stand near it
// I promise this won't get annoying
// One of those statements is a lie
//
// Copyright 2018 High Fidelity Inc.
// Author: Liv Erickson, 8/23/2018
// 
// Licensed under the Apache 2.0 license
// https://www.apache.org/licenses/LICENSE-2.0
//

(function(){
    var SEARCH_RADIUS = 10;

    var nearestCat;
    var position; 

    var CatZone = function(){

    };

    CatZone.prototype = {
        preload : function(entityID) {
            position = Entities.getEntityProperties(entityID, 'position').position;
            nearestCat = Entities.findEntitiesByName('Cat', position, SEARCH_RADIUS);
        },
        enterEntity: function(){
            Entities.callEntityServerMethod(nearestCat, 'meow');
        }
    };

    return new CatZone();

});