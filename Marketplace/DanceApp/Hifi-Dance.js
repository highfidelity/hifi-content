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
            URL = Script.resolvePath("./Tablet/Hifi-Dance_Tablet.html"),
            BUTTON_NAME = "HIFI-DANCE",

            PREVIEW_DANCE = "preview_dance",
            PREVIEW_DANCE_STOP = "preview_dance_stop",
            STOP_DANCE = "stop_dance",
            START_DANCING = "start_dancing",
            TRY_DANCE = "try_dance",
            ADD_DANCE = "add_dance",
            REMOVE_DANCE = "remove_dance",
            UPDATE_DANCE_ARRAY = "update_dance_array",
            CURRENT_DANCE = "current_dance",
            DEFAULT_DURATION = "1500",
            PREVIEW_TIMEOUT = 10000,
            DEFAULT_START_FRAME = 0,
            EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
            PREVIEW_DISTANCE = -2,
            UPDATE_UI = BUTTON_NAME + "_update_ui"
            
        ;
    
    // Init
    // /////////////////////////////////////////////////////////////////////////
        var 
            rustDancing = false,
            overlay = null,
            ui,
            lastPreviewTimeStamp
        ;

    // Constructor
    // /////////////////////////////////////////////////////////////////////////
        function DanceAnimation(name, url, frames, fps) {
            this.name = name;
            this.url = url;
            this.startFrame = DEFAULT_START_FRAME;
            this.endFrame = frames;
            this.fps = fps;
        }

        function DanceListEntry(name, url, startFrame, endFrame, duration, fps) {
            this.name = name;
            this.url = url;
            this.startFrame = startFrame;
            this.endFrame = endFrame;
            this.duration = duration;
            this.fps = fps;
        }
    
    // Collections
    // /////////////////////////////////////////////////////////////////////////
        var 
            danceUrls = Script.require("./Dance-URLS.js?"+ Date.now()),
            dataStore = {
                shouldBeRunning: true,
                danceArray: [],
                currentIndex: 0,
                ui: {
                    currentDance: false,
                    danceArray: false
                }
            },
            danceObjects = []
        ;
        
    // Helper Functions
    // /////////////////////////////////////////////////////////////////////////
        function splitDanceUrls() {
            var regex = /((?:https:|file:\/)\/\/.*\/)([a-zA-Z0-9 ]+) (\d+)(.fbx)/;
            danceUrls.sort(function(a,b) { 
                if (a < b) { 
                    return -1;
                } else if (a > b) {
                    return 1;
                }
                return 0; 
            }).forEach(function(dance) {
                console.log("Dance:", dance);
                var regMatch = regex.exec(dance);
                console.log("DANCE URL:" + regMatch[2]);
                danceObjects.push(
                    new DanceAnimation(
                        regMatch[2],
                        dance,
                        regMatch[3],
                        30
                    )
                );
            });
        }

    // Procedural Functions
    // /////////////////////////////////////////////////////////////////////////
        function previewDanceAnimation(danceObj) {
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
            lastPreviewTimeStamp = Date.now();
            Script.setTimeout(function(){
                var currentTime = Date.now();
                if (currentTime - lastPreviewTimeStamp > PREVIEW_TIMEOUT) {
                    stopPreviewDanceAnimation();
                }
            }, PREVIEW_TIMEOUT + 500);
        }

        function stopPreviewDanceAnimation() {
            Overlays.deleteOverlay(overlay);
        }

        function addDanceAnimation(danceObj) {
            
            
            dataStore.danceArray.push(
                new DanceListEntry(
                    danceObj.name,
                    danceObj.url,
                    danceObj.startFrame,
                    danceObj.endFrame,
                    DEFAULT_DURATION,
                    danceObj.fps
                )
            );
            dataStore.ui.danceArray = true;
            ui.updateUI(dataStore);
        }

        function removeDanceAnimation(index) {
            dataStore.danceArray.splice(index,1);
            if (dataStore.danceArray.length === 0) {
                stopDanceAnimation();
                dataStore.ui.danceArray = false;
            }
            ui.updateUI(dataStore);
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

            ui.updateUI(dataStore);
        }

        function tryDanceAnimation(danceObj) {
            rustDancing = Settings.getValue("isDancing", false);
            MyAvatar.overrideAnimation(danceObj.url, danceObj.fps, true, danceObj.startFrame, danceObj.endFrame);
            Settings.setValue("isDancing", true);
            dataStore.ui.currentDance = true; 
            dataStore.currentDance = danceObj;
            ui.updateUI(dataStore, {slice: CURRENT_DANCE});
        }

        function stopDanceAnimation() {
            MyAvatar.restoreAnimation();
            Settings.setValue("isDancing", false);
            dataStore.ui.currentDance = false; 
            dataStore.currentDance = null;
            dataStore.shouldBeRunning = false;
            ui.updateUI(dataStore);
        }

        function updateDanceArray(danceArray) {
            dataStore.danceArray = danceArray;
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
            
        }

    // Tablet
    // /////////////////////////////////////////////////////////////////////////
        function startup() {
            ui = new AppUi({
                buttonName: BUTTON_NAME,
                sortOrder: 6,
                home: URL,
                graphicsDirectory: Script.resolvePath("./icons/tablet-icons/"),
                onMessage: onMessage,
                updateUI: updateUI
            });
            MyAvatar.restoreAnimation();
        }

        function onMessage(data) {
            // EventBridge message from HTML script.
            switch (data.type) {
                case EVENT_BRIDGE_OPEN_MESSAGE:
                    ui.updateUI(dataStore);
                    break;
                case ADD_DANCE:
                    addDanceAnimation(data.value);
                    break;
                case REMOVE_DANCE:
                    removeDanceAnimation(data.value);
                    break;
                case START_DANCING:
                    playDanceArray();
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
     
    Script.scriptEnding.connect(onEnding);
    Window.domainChanged.connect(onDomainChange);

    // Main
    // /////////////////////////////////////////////////////////////////////////
        dataStore.danceObjects = danceObjects;
        splitDanceUrls();
        startup();

}()); // END LOCAL_SCOPE
