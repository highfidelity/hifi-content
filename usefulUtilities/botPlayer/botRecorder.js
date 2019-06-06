"use strict";

//
//  Bot Player
//  assignmentClientPlayer.js
//  Created by Milad Nazeri on 2019-06-06
//  Based on work from Anthony Thibault 
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function () {

    
    var APP_NAME = "AV-REC",
        APP_ICON_INACTIVE = "icons/tablet-icons/avatar-record-i.svg",
        APP_ICON_ACTIVE = "icons/tablet-icons/avatar-record-a.svg",
        // Alt modifier is assumed.
        SHORTCUT_KEY = "r",  
        tablet,
        button,

        Recorder;

    function log(message) {
        print(APP_NAME + ": " + message);
    }


    Recorder = (function () {
        var IDLE = 0,
            COUNTING_DOWN = 1,
            RECORDING = 2,
            recordingState = IDLE;

        
        // Check to make sure we can record and then start the Bot recording
        function startRecording() {
            if (recordingState !== IDLE) {
                return;
            }

            Recording.startRecording();
            recordingState = RECORDING;
        }


        // Stop the recording and change the state
        function cancelRecording() {
            Recording.stopRecording();
            recordingState = IDLE;
        }


        // Stop the recording, prep the filename, and then save the file to your recording directory
        function finishRecording(filename) {
            Recording.stopRecording();
            filename = Recording.getDefaultRecordingSaveDirectory() + filename;
            log("Finish recording: " + filename);
            Recording.saveRecording(filename);
            recordingState = IDLE;
        }


        // Check to see if we are stopping the recording or canceling.  
        function stopRecording(filename) {
            if (recordingState === COUNTING_DOWN) {
                cancelRecording();
            } else if (recordingState === RECORDING) {
                finishRecording(filename);
            }
        }


        // Cancel the recording if we have to exit
        function tearDown() {
            if (recordingState !== IDLE) {
                cancelRecording();
            }
        }

        return {
            startRecording: startRecording,
            stopRecording: stopRecording,
            tearDown: tearDown
        };
    }());


    // constructor
    function MetaRecorder() {
        this._recording = false;
        this._currentIndex = 0;
    }
    

    // Prep our recording by changing the state and moving to the next recording
    MetaRecorder.prototype.startRecording = function () {
        this._recording = true;
        this._currentIndex++;
        Recorder.startRecording();
    };
    

    // Check to see if we are currently recording
    MetaRecorder.prototype.isRecording = function () {
        return this._recording;
    };

    var metaRecorder = new MetaRecorder();

    
    // Check to see if we need to start or stop the recording.  We update the button state after.
    function toggleRecording() {
        if (metaRecorder.isRecording()) {
            log("MetaRecorder.stopRecording()");
            Recorder.stopRecording("AVATAR_TEST" + this._currentIndex + ".hfr");
            metaRecorder._recording = false;
        } else {
            log("MetaRecorder.startRecording()");
            metaRecorder.startRecording();
        }
        button.editProperties({ isActive: metaRecorder.isRecording() });
    }


    // Key press for easy record
    function onKeyPressEvent(event) {
        if (event.isAlt && event.text === SHORTCUT_KEY && !event.isControl && !event.isMeta && !event.isAutoRepeat) {
            toggleRecording();
        }
    }


    // Toggle the recording if the button is clicked on and off
    function onButtonClicked() {
        toggleRecording();
    }

    
    function setUp() {
        tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
        if (!tablet) {
            return;
        }

        // tablet/toolbar button.
        button = tablet.addButton({
            icon: APP_ICON_INACTIVE,
            activeIcon: APP_ICON_ACTIVE,
            text: APP_NAME,
            isActive: false
        });
        if (button) {
            button.clicked.connect(onButtonClicked);
        }

        Controller.keyPressEvent.connect(onKeyPressEvent);
    }


    function tearDown() {

        Controller.keyPressEvent.disconnect(onKeyPressEvent);

        Recorder.tearDown();

        if (!tablet) {
            return;
        }

        if (button) {
            button.clicked.disconnect(onButtonClicked);
            tablet.removeButton(button);
            button = null;
        }

        tablet = null;

    }

    setUp();
    Script.scriptEnding.connect(tearDown);
}());