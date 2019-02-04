//
//  draw_ app.js
//
//  Created by Rebecca Stankus on 01/31/19
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global  */

(function() {
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var button = tablet.addButton({
        text: 'DRAW',
        icon: Script.resolvePath('Assets/Icons/draw-i.svg'),
        activeIcon: Script.resolvePath('Assets/Icons/draw-a.svg')
    });
  
    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* PLAY A SOUND: Plays the specified sound at the position of the user's Avatar using the volume and playback 
    mode requested. */
    var injector;
    function playSound(sound, volume, position, localOnly){
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: position,
                volume: volume,
                localOnly: localOnly
            });
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    /* CREATE A MARKER: Checks that marker does not already exist, then calculate position of avatar's hand and 
    create a marker there */
    var marker;
    function createMarker() {
        print("CREATING MARKER");
        if (marker) {
            return;
        }
        print("You have a marker!");
        var parentJoint = "RightHand";
        // find dominant hand first?
        var parentJointIndex = MyAvatar.getJointIndex(parentJoint);
        // We'll need a better back up joint for avatars without a hand joint in the future
        parentJoint = (parentJoint === -1) ? 0 : parentJoint;
        // get dimensions based on avatar height
        marker = Entities.addEntity({
            name: "Draw App Marker",
            type: "Model",
            description: "CC_BY Scott Fowles",
            modelURL: Script.resolvePath("Assets/Models/marker.fbx"),
            parentID: MyAvatar.sessionUUID,
            parentJointName: parentJoint,
            parentJointIndex: parentJointIndex,
            localPosition: { x: -0.0011, y: 0.0458, z: 0.0195 },
            localRotation: Quat.fromVec3Degrees({ x: 90, y: 0, z: 0 }),
            localDimensions: { x: 0.0447, y: 0.0281, z: 0.1788 },
            grab: "{\"grabbable\":false}"
        }, true);
    }

    // On clicking the app button on the toolbar or tablet, if we are oopening the app, play a sound and get the marker. 
    // If we are closing the app, remove the marker
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath('Assets/Sounds/open.wav'));
    var OPEN_SOUND_VOLUME = 0.5;
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath('Assets/Sounds/open.wav'));
    var CLOSE_SOUND_VOLUME = 0.5;
    function onClicked() {
        print("CLICKED");
        if (marker) {
            button.editProperties({ isActive: false });
            print("You do not have a marker!");
            Entities.deleteEntity(marker);
            marker = null;
            playSound(CLOSE_SOUND, CLOSE_SOUND_VOLUME, MyAvatar.position, true);
        } else {
            button.editProperties({ isActive: true });
            playSound(OPEN_SOUND, OPEN_SOUND_VOLUME, MyAvatar.position, true);
            createMarker();
        }
    }

    /* ON STOPPING THE SCRIPT: Make sure the marker gets deleted and its variable set back to null 
    if applicable. Search for any unreferenced markers and delete if found. */
    function appEnding() {
        cleanUp();
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
    }

    /* CLEANUP: Remove marker, search for any unreferenced markers to clean up */
    function cleanUp() {
        print("cleanup");
        if (marker) {
            print("deleting");
            Entities.deleteEntity(marker);
            marker = null;
        }
        button.editProperties({ isActive: false });
        // THIS BELOW DOES NOT WORK
        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            var name = Entities.getEntityProperties(avatarEntity, 'name').name;
            print("AVATAR HAS WEARABLE: ", name);
            if (name === "Draw App Marker") {
                Entities.deleteEntity(avatarEntity);
            }
        });
    }

    /* WHEN USER DOMAIN CHANGES: Close app to remove marker in hand when leaving the domain */
    function domainChanged() {
        print("session changed");
        cleanUp();
    }

    button.clicked.connect(onClicked); // listen for clicks on the tablet button
    Window.domainChanged.connect(domainChanged); // listen for when user leaves domain
    Script.scriptEnding.connect(appEnding); // listen for when the script is stopped
}());