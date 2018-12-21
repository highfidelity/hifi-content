"use strict";
/* eslint-disable indent */
//
//  Dance-App
//
//  Created by Milad Nazeri on 2018-10-11
//  Copyright 2016 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals Tablet, Script, HMD, Controller, Menu */

(function () { // BEGIN LOCAL_SCOPE
    // Dependencies
    // /////////////////////////////////////////////////////////////////////////
        var 
            AppUi = Script.require('appUi')
        ;

    // Consts
    // /////////////////////////////////////////////////////////////////////////
        var 
            URL = Script.resolvePath("./Tablet/DANCE_Tablet.html"),
            BUTTON_NAME = "DANCE",
            PREVIEW_DANCE = "preview_dance",
            PREVIEW_DANCE_STOP = "preview_dance_stop",
            STOP_DANCE = "stop_dance",
            START_DANCING = "start_dancing",
            TRY_DANCE = "try_dance",
            ADD_DANCE = "add_dance",
            REMOVE_DANCE = "remove_dance",
            REMOVE_DANCE_FROM_MENU = "remove_dance_from_menu",
            UPDATE_DANCE_ARRAY = "update_dance_array",
            CURRENT_DANCE = "current_dance",
            TOGGLE_HMD = "toggle_hmd",
            DEFAULT_DURATION = 3000,
            PREVIEW_TIMEOUT = 10000,
            SECOND = 1000,
            TABLET_OPEN_TIME = 300,
            DEFAULT_START_FRAME = 0,
            EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
            PREVIEW_DISTANCE = -2,
            UPDATE_UI = BUTTON_NAME + "_update_ui"
        ;
    
    // Init
    // /////////////////////////////////////////////////////////////////////////
        var 
            overlay = null,
            ui,
            lastPreviewTimeStamp,
            in3rdPerson = false, 
            zoomMapping,
            numberOfZooms = 3
        ;

    // Constructor
    // /////////////////////////////////////////////////////////////////////////
        
        // General Dance Objects used 
        
        function DanceAnimation(name, url, frames, fps, icon) {
            this.name = name;
            this.url = url;
            this.startFrame = DEFAULT_START_FRAME;
            this.endFrame = frames;
            this.fps = fps;
            this.duration = (this.endFrame / this.fps) * SECOND;
            this.icon = icon;
        }

        // Specific Dance Objects used for the dance playlist 

        function DanceListEntry(name, url, startFrame, endFrame, duration, fps, icon) {
            this.name = name;
            this.url = url;
            this.startFrame = startFrame;
            this.endFrame = endFrame;
            this.duration = duration;
            this.fps = fps;
            this.defaultEnd = endFrame;
            this.selected = false;
            this.icon = icon;
        }
    
    // Collections
    // /////////////////////////////////////////////////////////////////////////
        var 
            danceUrls = Script.require("./Dance-URLS.js?"+ Date.now()),
            dataStore = {
                shouldBeRunning: false,
                danceArray: [],
                currentIndex: 0,
                toggleHMD: false,
                ui: {
                    currentDance: false,
                    danceArray: false
                },
                danceObjects: []
            }
        ;
        
    // Helper Functions
    // /////////////////////////////////////////////////////////////////////////
        function splitDanceUrls() {
            // Capture the different parts of the Dance URL to be used for the dance object
            var regex = /((?:https:|file:\/)\/\/.*\/)([a-zA-Z0-9 ]+) (\d+)(.fbx)/;
            danceUrls.sort(function(a,b) { 
                // Sort the urls by charachter 
                if (a.toLowerCase() < b.toLowerCase()) { 
                    return -1;
                } else if (a > b) {
                    return 1;
                }
                return 0; 
            }).forEach(function(dance, index) {
                var regMatch = regex.exec(dance);
                dataStore.danceObjects.push(
                    new DanceAnimation(
                        regMatch[2],
                        dance,
                        regMatch[3],
                        30,
                        (index + 1) + ".jpg"
                    )
                );
            });
        }

        // Finds the index that matches an object in an Array.  Used to splice/edit dances in our playlist
        function findObjectIndexByKey(array, key, value) {
            for (var i = 0; i < array.length; i++) {
                if (array[i][key] === value) {
                    return i;
                }
            }
            return null;
        }

    // Procedural Functions
    // /////////////////////////////////////////////////////////////////////////
        
        // Creates an overlay animation in front of you to see what your dance looks like
        function previewDanceAnimation(danceObj) {
            if (overlay) {
                stopPreviewDanceAnimation();
            }
            var localOffset = [0, 0, PREVIEW_DISTANCE],
                worldOffset = Vec3.multiplyQbyV(MyAvatar.orientation, localOffset),
                modelPosition = Vec3.sum(MyAvatar.position, worldOffset);

            overlay = Overlays.addOverlay("model", {
                url: MyAvatar.skeletonModelURL,
                position: modelPosition,
                animationSettings: {
                    url: danceObj.url,
                    fps: danceObj.fps,
                    loop: true,
                    running: true,
                    lastFrame: danceObj.frames
                }
            });
            dataStore.ui.addThisDance = true;
            dataStore.addThisDanceName = danceObj.name;
            lastPreviewTimeStamp = Date.now();
            Script.setTimeout(function(){
                var currentTime = Date.now();
                if (currentTime - lastPreviewTimeStamp > PREVIEW_TIMEOUT) {
                    stopPreviewDanceAnimation();
                }
            }, PREVIEW_TIMEOUT + 500);
            ui.updateUI(dataStore);
        }

        function stopPreviewDanceAnimation() {

            dataStore.ui.addThisDance = false;
            dataStore.addThisDanceName = null;
            Overlays.deleteOverlay(overlay);
            overlay = null;
            ui.updateUI(dataStore);
        }

        function addDanceAnimation(danceToAdd) {
            dataStore.danceArray.push(
                new DanceListEntry(
                    danceToAdd.dance.name,
                    danceToAdd.dance.url,
                    danceToAdd.dance.startFrame,
                    danceToAdd.dance.endFrame,
                    danceToAdd.dance.duration,
                    danceToAdd.dance.fps,
                    danceToAdd.dance.icon
                )
            );
            dataStore.danceObjects[danceToAdd.index].selected = true;
            dataStore.ui.danceArray = true;
            ui.updateUI(dataStore);
        }

        function removeDanceAnimation(index) {
            var danceIndex = findObjectIndexByKey(dataStore.danceObjects, "name", dataStore.danceArray[index].name);
            dataStore.danceObjects[danceIndex].selected = false;
            dataStore.danceArray.splice(index,1);
            if (dataStore.danceArray.length === 0) {
                stopDanceAnimation();
                dataStore.ui.danceArray = false;
            }
            ui.updateUI(dataStore);
        }

        function hmdCheck(){
            if (HMD.active && dataStore.toggleHMD) {
                console.log("\n\n\tHMD IS ACTIVE AND TOGGLE HMD IS TRUE")
                playDanceArray();
            }

            if (!HMD.active) {
                console.log("\n\n\tHMD IS NOT ACTIVE")
                playDanceArray();
            }
        }

        function playDanceArray(){
            dataStore.shouldBeRunning = true;
            dataStore.currentIndex = 0;
            playNextDance(dataStore.currentIndex);
            ui.updateUI(dataStore);
        }

        function playNextDance(index) {
            if ( index >= dataStore.danceArray.length) {
                index = 0;
            }
            var danceArrayObject = dataStore.danceArray[index];
            dataStore.currentIndex++;
            dataStore.currentIndex = 
                dataStore.currentIndex >= dataStore.danceArray.length
                    ? 0
                    : dataStore.currentIndex;

            tryDanceAnimation(danceArrayObject);
            Script.setTimeout(function(){
                if (dataStore.shouldBeRunning) {
                    playNextDance(dataStore.currentIndex);
                }
            }, danceArrayObject.duration);
        }

        function tryDanceAnimation(danceObj) {
            if (!HMD.active) {
                console.log("\n\n\tIN TRYDANCE ANIMATION AND HMD IS NOT ACTIVE")
                MyAvatar.overrideAnimation(danceObj.url, danceObj.fps, true, danceObj.startFrame, danceObj.endFrame);

            } else {
                MyAvatar.overrideAnimation(danceObj.url, danceObj.fps, true, danceObj.startFrame, danceObj.endFrame);
                if (!in3rdPerson) {
                    in3rdPerson = true;
                    enableZoom();
                }
            }

            dataStore.ui.currentDance = true; 
            dataStore.currentDance = danceObj;
            ui.updateUI(dataStore, {slice: CURRENT_DANCE});
        }

        function enableZoom() {
            HMD.closeTablet();
            zoomMapping = Controller.newMapping('zoom');
            numberOfZooms = 2;
            zoomMapping.from(function () {
                numberOfZooms = numberOfZooms - 1; 
                return numberOfZooms >= 0 ? 1 : (
                    zoomMapping.disable(), 0);
            }).to(Controller.Actions.BOOM_OUT);
            Script.setTimeout(function(){
                HMD.openTablet();
            }, TABLET_OPEN_TIME);
            zoomMapping.enable();
        }

        function disableZoom() {
            HMD.closeTablet();
            zoomMapping = Controller.newMapping('zoom');
            zoomMapping.enable();
            numberOfZooms = 0;
            zoomMapping.from(function () { 
                numberOfZooms = numberOfZooms + 1;
                return numberOfZooms <= 2 ? 1 : (
                    zoomMapping.disable(), 0);
            }).to(Controller.Actions.BOOM_IN);
            Script.setTimeout(function(){
                HMD.openTablet();
            }, TABLET_OPEN_TIME);
            zoomMapping.enable();
        }

        function stopDanceAnimation() {
            MyAvatar.restoreAnimation();
            if (in3rdPerson) {
                Camera.mode = "first person";
                disableZoom();
                in3rdPerson = false;
            }
            dataStore.ui.currentDance = false; 
            dataStore.currentDance = null;
            dataStore.shouldBeRunning = false;
            ui.updateUI(dataStore);
        }

        function updateDanceArray(danceUpdate) {
            dataStore.danceArray[danceUpdate.index] = danceUpdate.dance;
            ui.updateUI(dataStore);
        }

        function updateUI(dataStore, slice) {
            if (!slice) {
                slice = {};
            }
            var messageObject = {
                type: UPDATE_UI,
                value: dataStore
            };
            Object.keys(slice).forEach(function(key){
                if (slice.hasOwnProperty(key)) {
                    messageObject[key] = slice[key];
                }
            });
            ui.sendToHtml(messageObject);
        }
        
        function onEnding(){
            MyAvatar.restoreAnimation();
        }

        function onDomainChange(){
            MyAvatar.restoreAnimation();
        }

        function toggleHMD(){
            
            dataStore.toggleHMD = !dataStore.toggleHMD;
            ui.updateUI(dataStore);
        }

        function removeDanceFromMenu(danceToRemove){
            var index = findObjectIndexByKey(dataStore.danceArray, "name", danceToRemove.dance.name);
            if (index > -1) {
                dataStore.danceArray.splice(index, 1);
                dataStore.danceObjects[danceToRemove.index].selected = false;
            }
            if (dataStore.danceArray.length === 0) {
                stopDanceAnimation();
                dataStore.ui.danceArray = false;
            }
            ui.updateUI(dataStore);
        }

    // Tablet
    // /////////////////////////////////////////////////////////////////////////
        function startup() {
            ui = new AppUi({
                buttonName: BUTTON_NAME,
                home: URL,
                graphicsDirectory: Script.resolvePath("./icons/tablet-icons/"),
                onMessage: onMessage,
                updateUI: updateUI
            });
            MyAvatar.restoreAnimation();
            
            Script.scriptEnding.connect(onEnding);
            Window.domainChanged.connect(onDomainChange);

            splitDanceUrls();
        }

        function onMessage(data) {
            // EventBridge message from HTML script.
            switch (data.type) {
                case EVENT_BRIDGE_OPEN_MESSAGE:
                    ui.updateUI(dataStore);
                    break;
                case TOGGLE_HMD:
                    toggleHMD();
                    break;
                case ADD_DANCE:
                    addDanceAnimation(data.value);
                    break;
                case REMOVE_DANCE:
                    removeDanceAnimation(data.value);
                    break;
                case REMOVE_DANCE_FROM_MENU:
                    removeDanceFromMenu(data.value);
                    break;
                case START_DANCING:
                    hmdCheck();
                    break;
                case TRY_DANCE:
                    tryDanceAnimation(data.value);
                    break;
                case UPDATE_DANCE_ARRAY:
                    updateDanceArray(data.value);
                    break;
                case STOP_DANCE:
                    stopDanceAnimation(data.value);
                    break;
                case PREVIEW_DANCE:
                    previewDanceAnimation(data.value);
                    break;
                case PREVIEW_DANCE_STOP:
                    stopPreviewDanceAnimation();
                    break;
            }
        }
     
    // Main
    // /////////////////////////////////////////////////////////////////////////
        startup();

}()); // END LOCAL_SCOPE
