"use strict";

//
//  batchRecord.js
//
//  Horrible Hack, please do not judge me.
//

(function () {

    
    var APP_NAME = "BATCHREC",
        APP_ICON_INACTIVE = "icons/tablet-icons/avatar-record-i.svg",
        APP_ICON_ACTIVE = "icons/tablet-icons/avatar-record-a.svg",
        SHORTCUT_KEY = "r",  // Alt modifier is assumed.
        tablet,
        button,

        RecordingIndicator,
        Recorder;

    function log(message) {
        print(APP_NAME + ": " + message);
    }

    RecordingIndicator = (function () {
        // Displays "recording" overlay.

        var hmdOverlay,
            HMD_FONT_SIZE = 0.08,
            desktopOverlay,
            DESKTOP_FONT_SIZE = 24;

        function show() {
            // Create both overlays in case user switches desktop/HMD mode.
            var screenSize = Controller.getViewportDimensions(),
                recordingText = "REC",  // Unicode circle \u25cf doesn't render in HMD.
                CAMERA_JOINT_INDEX = -7;

            if (HMD.active) {
                // 3D overlay attached to avatar.
                hmdOverlay = Overlays.addOverlay("text3d", {
                    text: recordingText,
                    dimensions: { x: 100 * HMD_FONT_SIZE, y: HMD_FONT_SIZE * 5 },
                    parentID: MyAvatar.sessionUUID,
                    parentJointIndex: CAMERA_JOINT_INDEX,
                    localPosition: { x: 0.95, y: 0.95, z: -2.0 },
                    color: { red: 255, green: 0, blue: 0 },
                    alpha: 0.9,
                    lineHeight: HMD_FONT_SIZE,
                    backgroundAlpha: 0,
                    ignoreRayIntersection: true,
                    isFacingAvatar: true,
                    drawInFront: true,
                    visible: true
                });
            } else {
                // 2D overlay on desktop.
                desktopOverlay = Overlays.addOverlay("text", {
                    text: recordingText,
                    width: 100 * DESKTOP_FONT_SIZE,
                    height: DESKTOP_FONT_SIZE * 5,
                    x: DESKTOP_FONT_SIZE,
                    y: DESKTOP_FONT_SIZE,
                    font: { size: DESKTOP_FONT_SIZE },
                    color: { red: 255, green: 8, blue: 8 },
                    alpha: 1.0,
                    backgroundAlpha: 0,
                    visible: true
                });
            }
        }

        function hide() {
            if (desktopOverlay) {
                Overlays.deleteOverlay(desktopOverlay);
            }
            if (hmdOverlay) {
                Overlays.deleteOverlay(hmdOverlay);
            }
        }

        function updateCaption(text) {
            if (desktopOverlay) {
                Overlays.editOverlay(desktopOverlay, {text: text});
            }
            if (hmdOverlay) {
                Overlays.editOverlay(hmdOverlay, {text: text});
            }
        }

        return {
            show: show,
            hide: hide,
            updateCaption: updateCaption
        };
    }());

    Recorder = (function () {
        var IDLE = 0,
            COUNTING_DOWN = 1,
            RECORDING = 2,
            recordingState = IDLE;

        function isRecording() {
            return recordingState === COUNTING_DOWN || recordingState === RECORDING;
        }

        function startRecording() {
            console.log("in start recording")
            if (recordingState !== IDLE) {
                return;
            }

            Recording.startRecording();
            RecordingIndicator.show();
            recordingState = RECORDING;
        }

        function cancelRecording() {
            log("Cancel recording");
            Recording.stopRecording();
            RecordingIndicator.hide();
            recordingState = IDLE;
        }

        function finishRecording(filename) {
            Recording.stopRecording();
            RecordingIndicator.hide();
            filename = Recording.getDefaultRecordingSaveDirectory() + filename;
            log("Finish recording: " + filename);
            Recording.saveRecording(filename);
            recordingState = IDLE;
        }

        function stopRecording(filename) {
            if (recordingState === COUNTING_DOWN) {
                cancelRecording();
            } else if (recordingState === RECORDING) {
                finishRecording(filename);
            }
        }

        function setUp() {
        }

        function tearDown() {
            if (recordingState !== IDLE) {
                cancelRecording();
            }
        }

        return {
            isRecording: isRecording,
            startRecording: startRecording,
            stopRecording: stopRecording,
            setUp: setUp,
            tearDown: tearDown
        };
    }());

    // constructor
    function MetaRecorder() {
        this._recording = false;
    }

    MetaRecorder.prototype.startRecording = function () {
        this._recording = true;
        this._avatarIndex = 0;
        this.recordNext();
    };

    function findValue(index, array, offset) {
        offset = offset || 0;
        return array[(index + offset) % array.length];
    }

    var avatarURLS = [
        "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/Projects/Testing/Flow/wolf3ds/andy/andy.fst",
        "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/Projects/Testing/Flow/wolf3ds/jazmin1/jazmin1.baked.fst",
        "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/Projects/Testing/Flow/wolf3ds/jazmin2/jazmin2.baked.fst",
        "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/Projects/Testing/Flow/wolf3ds/jazmin3/jazmin3.baked.fst",
        "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/Projects/Testing/Flow/wolf3ds/jimi/jimi.baked.fst",
        "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/Projects/Testing/Flow/wolf3ds/milad/milad.baked.fst",
        "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/Projects/Testing/Flow/wolf3ds/milad2/milad2.baked.fst",
        "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/Projects/Testing/Flow/wolf3ds/zach/zachwolf.baked.fst"
    ];
    
    var totalRecordings = 100;
    var currentIndex = 0;
    MetaRecorder.prototype.recordNext = function () {

        log("MetaRecorder.recordNext()");

        var self = this;
        var RECORDING_LENGTH = 3000;  // 3 seconds

        if (currentIndex === totalRecordings) {
            // DONE!
            MyAvatar.skeletonModelURL = "";  // go back to the default avatar to indicate done.
            this._recording = false;
            button.editProperties({ isActive: metaRecorder.isRecording() });
            return;
        }

        var avatarURL = findValue(currentIndex, avatarURLS);
        MyAvatar.skeletonModelURL = avatarURL;

        this._loadCompleteCb = function () {

            log("loadComplete = " + avatarURL);

            if (MyAvatar.skeletonModelURL === avatarURL) {

                log("startRecording = " + avatarURL);

                Recorder.startRecording();

                log("before basename");

                Script.setTimeout(function () {

                    Recorder.stopRecording("Jene_5_" + currentIndex + ".hfr");
                    MyAvatar.onLoadComplete.disconnect(self._loadCompleteCb);
                    currentIndex++;
                    self.recordNext();
                }, RECORDING_LENGTH);
            }
        };

        MyAvatar.onLoadComplete.connect(this._loadCompleteCb);

    };

    MetaRecorder.prototype.isRecording = function () {
        return this._recording;
    };

    var metaRecorder = new MetaRecorder();

    function toggleRecording() {

        if (metaRecorder.isRecording()) {
            // do nothing.
        } else {
            log("MetaRecorder.startRecording()");
            metaRecorder.startRecording();
        }

        button.editProperties({ isActive: metaRecorder.isRecording() });
    }

    function onKeyPressEvent(event) {
        if (event.isAlt && event.text === SHORTCUT_KEY && !event.isControl && !event.isMeta && !event.isAutoRepeat) {
            toggleRecording();
        }
    }

    function onButtonClicked() {
        toggleRecording();
    }

    function setUp() {
        tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
        if (!tablet) {
            return;
        }

        Recorder.setUp();

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