//
// digitalFrame
//
//  A digital picture frame 
//  Created by Liv Erickson on 10/11/2018
//  Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
(function(){

    // Set up the default transition speed and photo array
    var DEFAULT_TRANSITION_SPEED = 10; // seconds
    var DEFAULT_PHOTO_ARRAY = [
        Script.resolvePath('images/image1.jpg'),
        Script.resolvePath('images/image2.jpg'),
        Script.resolvePath('images/image3.jpg'),
        Script.resolvePath('images/image4.jpg'),
        Script.resolvePath('images/image5.jpg')
    ];

    // We will convert the seconds to milliseconds for our Script.interval call
    var SECONDS_TO_MILLISECONDS = 1000; 

    // Variables in place to store user-specified data
    var photos = [];
    var activeIndex = 0;
    var speed;

    // Keep a reference to the Image Entity entityID for editing
    var _entityID;

    // Change our photos based on the photos array and change speed
    // Return to the start after going through all our photos
    var changePhotos = function() {
        if (activeIndex < photos.length - 1) {
            Entities.editEntity(_entityID, {'textures' : JSON.stringify({'tex.picture' : photos[activeIndex]})});
            activeIndex++;
        } else {
            Entities.editEntity(_entityID, {'textures' : JSON.stringify({'tex.picture' : photos[0]})});
            activeIndex = 0;
        }
    };

    // The preload function is called when the script is added, reloaded, or the server starts up
    this.preload = function(entityID) {
        _entityID = entityID;
        try {
            var customProperties = JSON.parse(Entities.getEntityProperties(_entityID, 'userData').userData).digitalFrame;
            photos = customProperties.photos;
            speed = customProperties.changeSpeed * SECONDS_TO_MILLISECONDS;
            Script.setInterval(changePhotos, speed);

        } catch (e) {
            print ("Error loading details from userdata - using defaults");
            photos = DEFAULT_PHOTO_ARRAY;
            speed = DEFAULT_TRANSITION_SPEED * SECONDS_TO_MILLISECONDS;
            Script.setInterval(changePhotos, speed);
        }
    };

    // The unload function is called when the script is removed, reloaded, or the server shuts down
    this.unload = function() {
        Script.clearInterval(changePhotos);
    };

});