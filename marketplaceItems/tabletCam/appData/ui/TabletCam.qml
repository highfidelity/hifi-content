//
//  TabletCam.qml
//  qml/hifi
//
//  Tablet Cam v2.1
//
//  Created by Zach Fox on 2019-04-14
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Hifi 1.0 as Hifi
import QtQuick 2.7
import QtQuick.Controls 2.3
import stylesUit 1.0 as HifiStylesUit
import controlsUit 1.0 as HifiControlsUit

Rectangle {
    id: root;
    property bool flashEnabled: Settings.getValue("tabletCam/flashEnabled", false);
    property string snapshotQuality: Settings.getValue("tabletCam/quality", "normal");
    property real aspectRatio: Settings.getValue("tabletCam/aspectRatio", (8 / 10));
    property bool detached: Settings.getValue("tabletCam/detached", false);
    property bool frontCamInUse: Settings.getValue("tabletCam/frontCamInUse", true);
    property string activeView: "mainView";

    HifiStylesUit.HifiConstants { id: hifi; }
	color: hifi.colors.black;

    onFlashEnabledChanged: {
        sendToScript({method: 'setFlashStatus', enabled: root.flashEnabled});
    }

    onDetachedChanged: {
        sendToScript({method: 'setDetached', detached: root.detached});
    }

    onFrontCamInUseChanged: {
        sendToScript({method: 'switchCams', frontCamInUse: root.frontCamInUse});
    }

    onActiveViewChanged: {
        root.flashEnabled = false;
		sendToScript({method: 'activeViewChanged', activeView: root.activeView});

        if (root.activeView === "settingsView") {
            photoDirectoryTextField.text = Settings.getValue("snapshotsLocation", "<Not Set>");
        }
    }

    Item {
        id: mainView;
        visible: root.activeView === "mainView";
        anchors.fill: parent;

	    Rectangle {
		    id: helpTextContainer;
		    visible: !!Settings.getValue('tabletCam/firstRun', true) && HMD.active;
            width: parent.width;
            height: topBarContainer_main.height;
            anchors.left: parent.left;
            anchors.top: parent.top;
            color: "#121212";

		    HifiStylesUit.RalewaySemiBold {
			    text: "Try clicking right thumbstick for photos!";
			    // Anchors
			    anchors.left: parent.left;
			    anchors.leftMargin: 8;
			    anchors.verticalCenter: parent.verticalCenter;
			    size: 22;
			    // Style
			    color: hifi.colors.white;
			    // Alignment
			    horizontalAlignment: Text.AlignLeft;
			    verticalAlignment: Text.AlignVCenter;
			    wrapMode: Text.Wrap;
		    }

		    HifiControlsUit.Button {
			    text: "OK";
			    colorScheme: hifi.colorSchemes.dark;
			    color: hifi.buttons.blue;
			    anchors.verticalCenter: parent.verticalCenter;
			    anchors.right: parent.right;
			    anchors.rightMargin: 8;
			    width: 50;
			    height: 35;
			    onClicked: {
				    helpTextContainer.visible = false;
				    Settings.setValue('tabletCam/firstRun', false);
			    }
		    }
	    }
	
        Rectangle {
            id: topBarContainer_main;
		    visible: !helpTextContainer.visible;
            width: parent.width;
            height: 42;
            anchors.left: parent.left;
            anchors.top: parent.top;
            color: "#121212";

            HifiControlsUit.CheckBox {
                id: detachCheckbox;
                text: "Detach"
                checked: root.detached;
                boxSize: 24;
                height: 32;
			    anchors.verticalCenter: parent.verticalCenter;
                anchors.left: parent.left;
                anchors.leftMargin: 8;
                onClicked: {
                    root.detached = checked;
                }
            }

            HifiControlsUit.GlyphButton {
                id: flashButton;
                height: 26;
                width: height;
			    anchors.verticalCenter: parent.verticalCenter;
			    anchors.right: fakeFlash.left;
                anchors.rightMargin: 8;
                glyph: hifi.glyphs.lightning;
                color: root.flashEnabled ? hifi.buttons.blue : hifi.buttons.none;
                onClicked: {
                    root.flashEnabled = !root.flashEnabled;
                }
            }

		    Rectangle {
			    id: fakeCamera;
			    width: 34;
			    height: width;
			    radius: width;
			    anchors.centerIn: parent;
			    color: hifi.colors.black;

			    Rectangle {
                    visible: root.frontCamInUse && !root.detached;
				    width: parent.width - 12;
				    height: width;
				    radius: width;
				    anchors.centerIn: parent;
				    color: "#230000";
			    }
		    }

		    Rectangle {
			    id: fakeFlash;
			    width: 12;
			    height: width;
			    radius: width;
			    anchors.verticalCenter: fakeCamera.verticalCenter;
			    anchors.right: fakeCamera.left;
			    anchors.rightMargin: 4;
			    color: root.flashEnabled && root.frontCamInUse ? "#fffcad" : "#000000";
		    }

            Image {
                id: switchCams;
                height: 26;
                width: height;
			    anchors.verticalCenter: parent.verticalCenter;
			    anchors.left: fakeCamera.right;
                anchors.leftMargin: 8;
                source: "./images/switchCams.svg"; // rotate camera by Diego Naive from the Noun Project
                mipmap: true;
                MouseArea {
                    anchors.fill: parent;
                    enabled: !root.detached;

                    onClicked: {
                        root.frontCamInUse = !root.frontCamInUse;
                    }
                }
            }

            HifiControlsUit.GlyphButton {
                id: settingsButton;
                height: 26;
                width: height;
			    anchors.verticalCenter: parent.verticalCenter;
			    anchors.right: parent.right;
                anchors.rightMargin: 8;
                glyph: hifi.glyphs.settings;
                color: hifi.buttons.none;
                onClicked: {
                    root.activeView = "settingsView";
                }
            }
	    }
        
        Rectangle {
            visible: !secondaryCameraPreview.visible && HMD.tabletID !== "{00000000-0000-0000-0000-000000000000}";
            anchors.fill: secondaryCameraPreview;
            color: hifi.colors.white;
        }

        // Secondary Camera Preview
        Hifi.ResourceImageItem {
            id: secondaryCameraPreview;
            visible: HMD.tabletID !== "{00000000-0000-0000-0000-000000000000}";
            url: "resource://spectatorCameraFrame";
            ready: visible;
            mirrorVertically: true;
            anchors.top: topBarContainer_main.bottom;
            anchors.bottom: bottomBarContainer_main.top;
            anchors.left: parent.left;
            anchors.right: parent.right;
            onVisibleChanged: {
                update();
            }
        }
    
	    Rectangle {
		    id: bottomBarContainer_main;
            height: 88;
            anchors.left: parent.left;
            anchors.bottom: parent.bottom;
            anchors.right: parent.right;
            color: "#121212";

            Item {
                id: fieldOfView;
                anchors.left: parent.left;
                anchors.leftMargin: 12;
                anchors.verticalCenter: parent.verticalCenter;
                anchors.right: takeSnapshotButton.left;
                anchors.rightMargin: 12;
                height: 35;

                HifiControlsUit.GlyphButton {
                    id: resetvFoV;
                    anchors.verticalCenter: parent.verticalCenter;
                    anchors.left: parent.left;
                    height: parent.height - 8;
                    width: height;
                    glyph: hifi.glyphs.reload;
                    onClicked: {
                        fieldOfViewSlider.value = 60.0;
                    }
                }

                HifiControlsUit.Slider {
                    id: fieldOfViewSlider;
                    anchors.top: parent.top;
                    anchors.bottom: parent.bottom;
                    anchors.right: parent.right;
                    anchors.left: resetvFoV.right;
                    anchors.leftMargin: 8;
                    colorScheme: hifi.colorSchemes.dark;
                    from: 8.0;
                    to: 120.0;
                    value: (to - Settings.getValue("tabletCam/vFoV", 60.0) + from);
                    stepSize: 1;

                    onValueChanged: {
                        sendToScript({method: 'updateCameravFoV', vFoV: to - value + from});
                    }
                    onPressedChanged: {
                        if (!pressed) {
                            sendToScript({method: 'updateCameravFoV', vFoV: to - value + from});
                        }
                    }
                }
            }

	        Rectangle {
		        id: takeSnapshotButton;
		        color: "#EA4C5F";
		        anchors.horizontalCenter: parent.horizontalCenter;
                anchors.verticalCenter: parent.verticalCenter;
		        height: 72;
		        width: height;
                radius: height;
                border.width: 3;
                border.color: hifi.colors.white;

                MouseArea {
                    anchors.fill: parent;
                    hoverEnabled: true;
                    onEntered: {
                        parent.color = "#C62147";
                    }
                    onExited: {
                        parent.color = "#EA4C5F";
                    }
                    onClicked: {
                        if (HMD.tabletID !== "{00000000-0000-0000-0000-000000000000}") {
                            secondaryCameraPreview.visible = false;
                        }
			            sendToScript({method: 'takePhoto'});
                    }
                }
	        }

            Image {
                visible: !HMD.active;
                source: "./images/orientation.svg"; // orientation by Atif Arshad from the Noun Project
                height: 24;
                width: height;
                anchors.left: takeSnapshotButton.right;
                anchors.leftMargin: 24;
                anchors.verticalCenter: parent.verticalCenter;

                MouseArea {
                    anchors.fill: parent;
                    onClicked: {
			            sendToScript({method: 'switchOrientation'});
                    }
                }
            }
        
            Rectangle {
                id: galleryButton;
                anchors.right: parent.right;
                anchors.rightMargin: 12;
                anchors.verticalCenter: parent.verticalCenter;
		        height: 72;
		        width: height;
                color: hifi.colors.black;
            
                Image {
                    id: galleryButtonImage;
                    source: JSON.parse(Settings.getValue("tabletCam/cameraRollPaths", '{"paths": ["imagePath": ""]}')).paths[0].imagePath;
                    fillMode: Image.PreserveAspectCrop;
                    anchors.fill: parent;
                    mipmap: true;
                }

                MouseArea {
                    enabled: galleryButtonImage.source !== "";
                    anchors.fill: parent;
                    onClicked: {
                        cameraRollSwipeView.setCurrentIndex(0);
                        cameraRollModel.clear();

                        var settingsString = Settings.getValue("tabletCam/cameraRollPaths", '{"paths": []}');
                        cameraRollModel.append(JSON.parse(settingsString).paths);

			            root.activeView = "reviewView";
                    }
                }
            }
        }
    }

    Item {
        id: reviewView;
        visible: root.activeView === "reviewView";
        anchors.fill: parent;
	
        Rectangle {
            id: topBarContainer_review;
            width: parent.width;
            height: 42;
            anchors.left: parent.left;
            anchors.top: parent.top;
            color: "#121212";

            HifiControlsUit.Button {
			    text: "BACK";
			    colorScheme: hifi.colorSchemes.dark;
			    color: hifi.buttons.noneBorderlessWhite;
			    anchors.verticalCenter: parent.verticalCenter;
			    anchors.left: parent.left;
			    anchors.leftMargin: 8;
			    width: 50;
			    height: 30;
			    onClicked: {
			        root.activeView = "mainView";
			    }
		    }

            HifiStylesUit.RalewaySemiBold {
			    text: "CAMERA ROLL";
			    // Anchors
			    anchors.horizontalCenter: parent.horizontalCenter;
			    anchors.verticalCenter: parent.verticalCenter;
			    size: 22;
			    // Style
			    color: hifi.colors.white;
			    // Alignment
			    horizontalAlignment: Text.AlignHCenter;
			    verticalAlignment: Text.AlignVCenter;
			    wrapMode: Text.Wrap;
		    }
        }

        ListModel {
            id: cameraRollModel;
        }

        SwipeView {
            id: cameraRollSwipeView;

            anchors.top: topBarContainer_review.bottom;
            anchors.left: parent.left;
            anchors.right: parent.right;
            anchors.bottom: bottomBarContainer_review.top;

            Repeater {
                model: cameraRollModel;

                Image {
                    source: imagePath;
                    fillMode: Image.PreserveAspectFit;
                    mipmap: true;
                }
            }
        }

        PageIndicator {
            id: indicator;
            interactive: true;
            count: cameraRollSwipeView.count;
            currentIndex: cameraRollSwipeView.currentIndex

            anchors.bottom: cameraRollSwipeView.bottom;
            anchors.horizontalCenter: cameraRollSwipeView.horizontalCenter;

            delegate: Rectangle {
                implicitWidth: 15;
                implicitHeight: 15;
                radius: width;
                color: "#00b4ef";
                opacity: index === cameraRollSwipeView.currentIndex ? 0.95 : 0.45;

                border.color: "#FFFFFF";
                border.width: index === cameraRollSwipeView.currentIndex ? 2 : 0;

                Behavior on opacity {
                    OpacityAnimator {
                        duration: 100;
                    }
                }
            }
        }
    
	    Rectangle {
		    id: bottomBarContainer_review;
            height: 88;
            anchors.left: parent.left;
            anchors.bottom: parent.bottom;
            anchors.right: parent.right;
            color: "#121212";

            HifiControlsUit.Button {
			    text: "SHOW IN DESKTOP FILE BROWSER";
			    colorScheme: hifi.colorSchemes.dark;
			    color: hifi.buttons.blue;
			    anchors.verticalCenter: parent.verticalCenter;
                anchors.horizontalCenter: parent.horizontalCenter;
			    width: 240;
			    height: 30;
			    onClicked: {
                    var currentImagePath = cameraRollModel.get(cameraRollSwipeView.index).imagePath;
                    Qt.openUrlExternally(currentImagePath.substring(0, currentImagePath.lastIndexOf('/')));
			    }
		    }
        }
    }

    Rectangle {
        id: settingsView;
        visible: root.activeView === "settingsView";
        anchors.fill: parent;
        color: hifi.colors.black;
	
        Rectangle {
            id: topBarContainer_settings;
            width: parent.width;
            height: 42;
            anchors.left: parent.left;
            anchors.top: parent.top;
            color: "#121212";

            HifiControlsUit.Button {
			    text: "BACK";
			    colorScheme: hifi.colorSchemes.dark;
			    color: hifi.buttons.noneBorderlessWhite;
			    anchors.verticalCenter: parent.verticalCenter;
			    anchors.left: parent.left;
			    anchors.leftMargin: 8;
			    width: 50;
			    height: 30;
			    onClicked: {
			        root.activeView = "mainView";
			    }
		    }

            HifiStylesUit.RalewaySemiBold {
			    text: "SETTINGS";
			    // Anchors
			    anchors.horizontalCenter: parent.horizontalCenter;
			    anchors.verticalCenter: parent.verticalCenter;
			    size: 22;
			    // Style
			    color: hifi.colors.white;
			    // Alignment
			    horizontalAlignment: Text.AlignHCenter;
			    verticalAlignment: Text.AlignVCenter;
			    wrapMode: Text.Wrap;
		    }
        }

        Item {
            id: settingsContainer;
            anchors.top: topBarContainer_settings.bottom;
            anchors.topMargin: 16;
            anchors.left: parent.left;
            anchors.leftMargin: 16;
            anchors.right: parent.right;
            anchors.rightMargin: 16;
            anchors.bottom: parent.bottom;
            anchors.bottomMargin: 8;

            Item {
                id: qualityContainer;
                anchors.top: parent.top;
                anchors.left: parent.left;
                anchors.right: parent.right;
                height: childrenRect.height;

		        HifiStylesUit.RalewaySemiBold {
                    id: qualityHeaderText;
			        text: "Photo Quality";
			        // Anchors
			        anchors.left: parent.left;
                    anchors.top: parent.top;
                    height: 22;
			        size: 18;
			        // Style
			        color: hifi.colors.white;
			        // Alignment
			        horizontalAlignment: Text.AlignLeft;
			        verticalAlignment: Text.AlignTop;
		        }

                HifiControlsUit.RadioButton {
                    id: lowRadioButton;
                    checked: root.snapshotQuality === "low";
                    text: "Low";
                    width: 70;
                    height: 35;
                    anchors.left: parent.left;
                    anchors.top: qualityHeaderText.bottom;
                    colorScheme: hifi.colorSchemes.dark;
                    onClicked: {
                        if (!lowRadioButton.checked) {
                            lowRadioButton.checked = true;
                        }
                        if (normalRadioButton.checked) {
                            normalRadioButton.checked = false;
                        }
                        if (highRadioButton.checked) {
                            highRadioButton.checked = false;
                        }
                        if (extremeRadioButton.checked) {
                            extremeRadioButton.checked = false;
                        }
                    }
                    onCheckedChanged: {
                        if (checked) {
                            sendToScript({method: 'setSnapshotQuality', quality: "low"});
                        }
                    }
                }

                HifiControlsUit.RadioButton {
                    id: normalRadioButton;
                    checked: root.snapshotQuality === "normal";
                    text: "Normal";
                    width: 100;
                    height: 35;
                    anchors.left: lowRadioButton.right;
                    anchors.leftMargin: 16;
                    anchors.top: qualityHeaderText.bottom;
                    colorScheme: hifi.colorSchemes.dark;
                    onClicked: {
                        if (lowRadioButton.checked) {
                            lowRadioButton.checked = false;
                        }
                        if (!normalRadioButton.checked) {
                            normalRadioButton.checked = true;
                        }
                        if (highRadioButton.checked) {
                            highRadioButton.checked = false;
                        }
                        if (extremeRadioButton.checked) {
                            extremeRadioButton.checked = false;
                        }
                    }
                    onCheckedChanged: {
                        if (checked) {
                            sendToScript({method: 'setSnapshotQuality', quality: "normal"});
                        }
                    }
                }

                HifiControlsUit.RadioButton {
                    id: highRadioButton;
                    checked: root.snapshotQuality === "high";
                    text: "4k";
                    width: 75;
                    height: 35;
                    anchors.left: normalRadioButton.right;
                    anchors.leftMargin: 16;
                    anchors.top: qualityHeaderText.bottom;
                    colorScheme: hifi.colorSchemes.dark;
                    onClicked: {
                        if (lowRadioButton.checked) {
                            lowRadioButton.checked = false;
                        }
                        if (normalRadioButton.checked) {
                            normalRadioButton.checked = false;
                        }
                        if (!highRadioButton.checked) {
                            highRadioButton.checked = true;
                        }
                        if (extremeRadioButton.checked) {
                            extremeRadioButton.checked = false;
                        }
                    }
                    onCheckedChanged: {
                        if (checked) {
                            sendToScript({method: 'setSnapshotQuality', quality: "high"});
                        }
                    }
                }

                HifiControlsUit.RadioButton {
                    id: extremeRadioButton;
                    checked: root.snapshotQuality === "extreme";
                    text: "EXTREME";
                    width: 120;
                    height: 35;
                    anchors.left: highRadioButton.right;
                    anchors.leftMargin: 16;
                    anchors.top: qualityHeaderText.bottom;
                    colorScheme: hifi.colorSchemes.dark;
                    onClicked: {
                        if (lowRadioButton.checked) {
                            lowRadioButton.checked = false;
                        }
                        if (normalRadioButton.checked) {
                            normalRadioButton.checked = false;
                        }
                        if (highRadioButton.checked) {
                            highRadioButton.checked = false;
                        }
                        if (!extremeRadioButton.checked) {
                            extremeRadioButton.checked = true;
                        }
                    }
                    onCheckedChanged: {
                        if (checked) {
                            sendToScript({method: 'setSnapshotQuality', quality: "extreme"});
                        }
                    }
                }
            }

            Item {
                id: aspectRatioContainer;
                anchors.top: qualityContainer.bottom;
                anchors.topMargin: 16;
                anchors.left: parent.left;
                anchors.right: parent.right;
                height: childrenRect.height;

		        HifiStylesUit.RalewaySemiBold {
                    id: aspectRatioHeaderText;
			        text: "Aspect Ratio";
			        // Anchors
			        anchors.left: parent.left;
                    anchors.top: parent.top;
                    height: 22;
			        size: 18;
			        // Style
			        color: hifi.colors.white;
			        // Alignment
			        horizontalAlignment: Text.AlignLeft;
			        verticalAlignment: Text.AlignTop;
		        }

                HifiControlsUit.RadioButton {
                    id: eightByTenRadioButton;
                    checked: parseFloat(root.aspectRatio) === (8 / 10);
                    text: "8x10";
                    width: 70;
                    height: 35;
                    anchors.left: parent.left;
                    anchors.top: aspectRatioHeaderText.bottom;
                    colorScheme: hifi.colorSchemes.dark;
                    onClicked: {
                        if (!eightByTenRadioButton.checked) {
                            eightByTenRadioButton.checked = true;
                        }
                        if (twoByThreeRadioButton.checked) {
                            twoByThreeRadioButton.checked = false;
                        }
                        if (nineBySixteenRadioButton.checked) {
                            nineBySixteenRadioButton.checked = false;
                        }
                        if (oneByOneRadioButton.checked) {
                            oneByOneRadioButton.checked = false;
                        }
                    }
                    onCheckedChanged: {
                        if (checked) {
                            sendToScript({method: 'setAspectRatio', aspectRatio: (8 / 10)});
                        }
                    }
                }

                HifiControlsUit.RadioButton {
                    id: twoByThreeRadioButton;
                    checked: parseFloat(root.aspectRatio) === (2 / 3);
                    text: "2x3";
                    width: 100;
                    height: 35;
                    anchors.left: eightByTenRadioButton.right;
                    anchors.leftMargin: 16;
                    anchors.top: aspectRatioHeaderText.bottom;
                    colorScheme: hifi.colorSchemes.dark;
                    onClicked: {
                        if (eightByTenRadioButton.checked) {
                            eightByTenRadioButton.checked = false;
                        }
                        if (!twoByThreeRadioButton.checked) {
                            twoByThreeRadioButton.checked = true;
                        }
                        if (nineBySixteenRadioButton.checked) {
                            nineBySixteenRadioButton.checked = false;
                        }
                        if (oneByOneRadioButton.checked) {
                            oneByOneRadioButton.checked = false;
                        }
                    }
                    onCheckedChanged: {
                        if (checked) {
                            sendToScript({method: 'setAspectRatio', aspectRatio: (2 / 3)});
                        }
                    }
                }

                HifiControlsUit.RadioButton {
                    id: nineBySixteenRadioButton;
                    checked: parseFloat(root.aspectRatio) === 9 / 16;
                    text: "9x16";
                    width: 75;
                    height: 35;
                    anchors.left: twoByThreeRadioButton.right;
                    anchors.leftMargin: 16;
                    anchors.top: aspectRatioHeaderText.bottom;
                    colorScheme: hifi.colorSchemes.dark;
                    onClicked: {
                        if (eightByTenRadioButton.checked) {
                            eightByTenRadioButton.checked = false;
                        }
                        if (twoByThreeRadioButton.checked) {
                            twoByThreeRadioButton.checked = false;
                        }
                        if (!nineBySixteenRadioButton.checked) {
                            nineBySixteenRadioButton.checked = true;
                        }
                        if (oneByOneRadioButton.checked) {
                            oneByOneRadioButton.checked = false;
                        }
                    }
                    onCheckedChanged: {
                        if (checked) {
                            sendToScript({method: 'setAspectRatio', aspectRatio: (9 / 16)});
                        }
                    }
                }

                HifiControlsUit.RadioButton {
                    id: oneByOneRadioButton;
                    checked: parseFloat(root.aspectRatio) === 1 / 1;
                    text: "Square";
                    width: 83;
                    height: 35;
                    anchors.left: nineBySixteenRadioButton.right;
                    anchors.leftMargin: 16;
                    anchors.top: aspectRatioHeaderText.bottom;
                    colorScheme: hifi.colorSchemes.dark;
                    onClicked: {
                        if (eightByTenRadioButton.checked) {
                            eightByTenRadioButton.checked = false;
                        }
                        if (twoByThreeRadioButton.checked) {
                            twoByThreeRadioButton.checked = false;
                        }
                        if (nineBySixteenRadioButton.checked) {
                            nineBySixteenRadioButton.checked = false;
                        }
                        if (!oneByOneRadioButton.checked) {
                            oneByOneRadioButton.checked = true;
                        }
                    }
                    onCheckedChanged: {
                        if (checked) {
                            sendToScript({method: 'setAspectRatio', aspectRatio: 1});
                        }
                    }
                }
            }

            Item {
                id: photoDirectoryContainer;
                anchors.top: aspectRatioContainer.bottom;
                anchors.topMargin: 16;
                anchors.left: parent.left;
                anchors.right: parent.right;
                height: childrenRect.height;

		        HifiStylesUit.RalewaySemiBold {
                    id: photoDirectoryHeaderText;
			        text: "Photo Directory";
			        // Anchors
			        anchors.left: parent.left;
                    anchors.top: parent.top;
                    height: 22;
			        size: 18;
			        // Style
			        color: hifi.colors.white;
			        // Alignment
			        horizontalAlignment: Text.AlignLeft;
			        verticalAlignment: Text.AlignTop;
		        }

                HifiControlsUit.TextField {
                    id: photoDirectoryTextField;
                    readOnly: true;
                    text: Settings.getValue("snapshotsDirectory", "<Not Set>");
                    colorScheme: hifi.colorSchemes.dark;
                    // Anchors
                    anchors.top: photoDirectoryHeaderText.bottom;
                    anchors.topMargin: 8;
                    anchors.left: parent.left;
                    anchors.right: parent.right;
                    height: 50;

                    MouseArea {
                        anchors.fill: parent;

                        onClicked: {
                            sendToScript({method: 'setPhotoDirectory'});
                        }
                    }
                }

                HifiControlsUit.Button {
                    text: "CHANGE";
                    colorScheme: hifi.colorSchemes.dark;
                    color: hifi.buttons.blue;
                    anchors.top: photoDirectoryTextField.bottom;
                    anchors.topMargin: 4;
                    anchors.right: parent.right;
                    width: 100;
                    height: 35;
                    onClicked: {
                        sendToScript({method: 'setPhotoDirectory'});
                    }
                }
            }
            
            HifiStylesUit.FiraSansRegular {
			    text: "v2.1";
			    // Anchors
			    anchors.bottom: parent.bottom;
                anchors.right: parent.right;
			    size: 16;
			    // Style
                color: hifi.colors.lightGrayText;
		    }
        }
    }

    function fromScript(message) {
        switch (message.method) {
        case 'stillSnapshotTaken':
			Settings.setValue('tabletCam/firstRun', false);
			helpTextContainer.visible = false;
            galleryButtonImage.source = message.lastStillSnapshotPath;
            if (HMD.tabletID !== "{00000000-0000-0000-0000-000000000000}") {
                secondaryCameraPreview.visible = true;
            }
        break;
        case 'photoDirectoryChanged':
            photoDirectoryTextField.text = message.photoDirectory;
        break;
		case 'inspectionCertificate_resetCert':
		break;
        default:
            console.log('Unrecognized message from TabletCam.js.');
        }
    }
    signal sendToScript(var message);
}
