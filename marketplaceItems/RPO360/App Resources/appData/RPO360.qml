//
//  RPO360.qml
//
//  Ready Player One 360 Camera
//
//  Created by Zach Fox on 2018-10-26
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import Hifi 1.0 as Hifi
import QtQuick 2.7
import QtQuick.Controls 2.2
import QtGraphicalEffects 1.0

import "qrc:////qml//styles-uit" as HifiStylesUit
import "qrc:////qml//controls-uit" as HifiControlsUit
import "qrc:////qml//controls" as HifiControls
import "qrc:////qml//hifi" as Hifi

Rectangle {
    HifiStylesUit.HifiConstants { id: hifi; }

    id: root;
    property bool uiReady: false;
    property bool processing360Snapshot: false;
    property string last360ThumbnailURL;
    // Style
    color: "#404040";

    //
    // TITLE BAR START
    //
    Rectangle {
        id: titleBarContainer;
        // Size
        width: root.width;
        height: 60;
        // Anchors
        anchors.left: parent.left;
        anchors.top: parent.top;
        color: "#121212";

        // "RPOCam" text
        HifiStylesUit.RalewaySemiBold {
            id: titleBarText;
            text: "RPO360 Cam v1.2";
            // Anchors
            anchors.left: parent.left;
            anchors.leftMargin: 30;
            width: paintedWidth;
            height: parent.height;
            size: 22;
            // Style
            color: hifi.colors.white;
            // Alignment
            horizontalAlignment: Text.AlignHLeft;
            verticalAlignment: Text.AlignVCenter;
        }
    }
    //
    // TITLE BAR END
    //

    Rectangle {
        z: 999;
        id: processingSnapshot;
        anchors.fill: parent;
        visible: !root.uiReady;
        color: Qt.rgba(0.0, 0.0, 0.0, 0.85);        

        // This object is always used in a popup.
        // This MouseArea is used to prevent a user from being
        //     able to click on a button/mouseArea underneath the popup/section.
        MouseArea {
            anchors.fill: parent;
            hoverEnabled: true;
            propagateComposedEvents: false;
        }
                
        AnimatedImage {
            id: processingImage;
            source: "resources/images/processing.gif"
            width: 74;
            height: width;
            anchors.verticalCenter: parent.verticalCenter;
            anchors.horizontalCenter: parent.horizontalCenter;
        }

        HifiStylesUit.RalewaySemiBold {
            text: root.uiReady ? "Processing..." : "";
            // Anchors
            anchors.top: processingImage.bottom;
            anchors.topMargin: 4;
            anchors.horizontalCenter: parent.horizontalCenter;
            width: paintedWidth;
            // Text size
            size: 26;
            // Style
            color: hifi.colors.white;
            verticalAlignment: Text.AlignVCenter;
        }
    }

    
    Rectangle {
        id: imageContainer;
        anchors.left: parent.left;
        anchors.top: titleBarContainer.bottom;
        anchors.topMargin: 8;
        width: parent.width;
        height: parent.width / 2;
        color: root.last360ThumbnailURL === "" ? "black" : "transparent";

        AnimatedImage {
            z: 3;
            source: "resources/images/static.gif"
            visible: root.last360ThumbnailURL === "" || root.processing360Snapshot;
            anchors.fill: parent;
            opacity: 0.15;
        }

        // Instructions (visible when display texture isn't set)
        HifiStylesUit.FiraSansRegular {
            z: 4;
            text: root.processing360Snapshot ? "Your RPO360 Photo is processing..." : "Your most recent RPO360 Photo will show up here.";
            size: 16;
            color: hifi.colors.white;
            visible: root.last360ThumbnailURL === "";
            anchors.fill: parent;
            horizontalAlignment: Text.AlignHCenter;
            verticalAlignment: Text.AlignVCenter;
        }

        Image {
            z: 2
            visible: root.last360ThumbnailURL !== "" && !root.processing360Snapshot;
            anchors.fill: parent;
            source: root.last360ThumbnailURL;
            mipmap: true;
            fillMode: Image.PreserveAspectFit;
            horizontalAlignment: Image.AlignHCenter;
            verticalAlignment: Image.AlignVCenter;
        }
    }

    //
    // RPO360 CONTROLS START
    //
    Item {
        id: rpo360ControlsContainer;
        // Anchors
        anchors.top: imageContainer.bottom;
        anchors.topMargin: 8;
        anchors.left: parent.left;
        anchors.right: parent.right;
        anchors.bottom: parent.bottom;
        
        HifiStylesUit.RalewaySemiBold {
            text: "Enable Cam";
            // Text size
            size: 20;
            anchors.right: masterSwitch.left;
            anchors.rightMargin: 12;
            anchors.verticalCenter: masterSwitch.verticalCenter;
            width: paintedWidth;
            color: hifi.colors.white;
            // Alignment
            horizontalAlignment: Text.AlignRight;
            verticalAlignment: Text.AlignVCenter;
        }

        Switch {
            id: masterSwitch;
            focusPolicy: Qt.ClickFocus;
            anchors.top: parent.top;
            anchors.topMargin: 16;
            anchors.horizontalCenter: parent.horizontalCenter;
            width: 120;
            height: 60;
            hoverEnabled: true;

            onHoveredChanged: {
                if (hovered) {
                    switchHandle.color = hifi.colors.blueHighlight;
                } else {
                    switchHandle.color = hifi.colors.lightGray;
                }
            }

            onClicked: {
                sendToScript({method: (checked ? 'rpo360On' : 'rpo360Off')});
            }

            background: Rectangle {
                color: parent.checked ? "#1FC6A6" : hifi.colors.white;
                implicitWidth: masterSwitch.width;
                implicitHeight: masterSwitch.height;
                radius: height/2;
            }

            indicator: Rectangle {
                id: switchHandle;
                implicitWidth: masterSwitch.height - 4;
                implicitHeight: implicitWidth;
                radius: implicitWidth/2;
                border.color: "#E3E3E3";
                color: "#404040";
                x: Math.max(4, Math.min(parent.width - width - 4, parent.visualPosition * parent.width - (width / 2) - 4))
                y: parent.height / 2 - height / 2;
                Behavior on x {
                    enabled: !masterSwitch.down
                    SmoothedAnimation { velocity: 200 }
                }

            }
        }

        Item {
            anchors.top: masterSwitch.bottom;
            anchors.topMargin: 8;
            anchors.left: parent.left;
            anchors.leftMargin: 26;
            anchors.right: parent.right;
            anchors.rightMargin: 26;
            anchors.bottom: parent.bottom;

            HifiControlsUit.Button {
                id: rezGlobeButton;
                enabled: root.last360ThumbnailURL !== "" && !root.processing360Snapshot &&
                    (Entities.canRezCertified() || Entities.canRezTmpCertified());
                text: "Rez Globe (Normal)";
                colorScheme: hifi.colorSchemes.dark;
                color: hifi.buttons.blue;
                anchors.top: parent.top;
                anchors.topMargin: 16;
                anchors.left: parent.left;
                width: parent.width / 2 - 8
                height: 35;
                onClicked: {
                    sendToScript({method: 'rezGlobe'});
                }
            }

            HifiControlsUit.Button {
                id: rezStreetViewButton;
                enabled: root.last360ThumbnailURL !== "" && !root.processing360Snapshot &&
                    (Entities.canRezCertified() || Entities.canRezTmpCertified());
                text: "Rez Globe (Street View)";
                colorScheme: hifi.colorSchemes.dark;
                color: hifi.buttons.blue;
                anchors.top: parent.top;
                anchors.topMargin: 16;
                anchors.right: parent.right;
                width: parent.width / 2 - 8
                height: 35;
                onClicked: {
                    sendToScript({method: 'rezStreetViewGlobe'});
                }
            }

            Item {
                id: rpo360DescriptionContainer;
                // Anchors
                anchors.top: rezGlobeButton.bottom;
                anchors.topMargin: 20;
                anchors.left: parent.left;
                anchors.right: parent.right;
                anchors.bottom: snapshotLocationButton.top;
                anchors.bottomMargin: 20;

                // App description text
                HifiStylesUit.RalewayRegular {
                    id: rpo360DescriptionText;
                    text: "Use the switch above to rez the RPO360 Cam.\n" +
                        "Throw it in the air to take a 360 snapshot!\n" + 
						"Then try rezzing a globe!" +
						((Entities.canRezCertified() || Entities.canRezTmpCertified()) ?
						"" : " (You need Rez rights)");
                    // Text size
                    size: 20;
                    anchors.fill: parent;
                    color: hifi.colors.white;
                    wrapMode: Text.Wrap;
                    // Alignment
                    horizontalAlignment: Text.AlignLeft;
                    verticalAlignment: Text.AlignVCenter;
                }
            }

            HifiControlsUit.Button {
                id: snapshotLocationButton;
                text: "Change Snapshot Location";
                colorScheme: hifi.colorSchemes.dark;
                color: hifi.buttons.none;
                anchors.bottom: grabHighlightingButtons.top;
                anchors.bottomMargin: 16;
                anchors.left: parent.left;
                anchors.right: parent.right;
                height: 35;
                onClicked: {
                    sendToScript({method: 'openSettings'});
                }
            }

            Item {
                id: grabHighlightingButtons;
                anchors.left: parent.left;
                anchors.right: parent.right;
                anchors.bottom: parent.bottom;
                anchors.bottomMargin: 12;
                height: 35;

                HifiControlsUit.Button {
                    id: disableHighlightingButton;
                    text: "Disable Grab Highlight";
                    colorScheme: hifi.colorSchemes.dark;
                    color: hifi.buttons.none;
                    anchors.top: parent.top;
                    anchors.bottom: parent.bottom;
                    anchors.left: parent.left;
                    width: parent.width / 2 - 24;
                    onClicked: {
                        sendToScript({method: 'disableGrabHighlighting'});
                    }
                }

                HifiControlsUit.Button {
                    id: enableHighlightingButton;
                    text: "Enable Grab Highlight";
                    colorScheme: hifi.colorSchemes.dark;
                    color: hifi.buttons.blue;
                    anchors.top: parent.top;
                    anchors.bottom: parent.bottom;
                    anchors.right: parent.right;
                    width: parent.width / 2 - 24;
                    onClicked: {
                        sendToScript({method: 'enableGrabHighlighting'});
                    }
                }
            }
        }
    }
    //
    // RPO360 CONTROLS END
    //

    //
    // FUNCTION DEFINITIONS START
    //
    //
    // Function Name: fromScript()
    //
    // Relevant Variables:
    // None
    //
    // Arguments:
    // message: The message sent from the RPO360 JavaScript.
    //     Messages are in format "{method, params}", like json-rpc.
    //
    // Description:
    // Called when a message is received from RPO360.js.
    //
    function fromScript(message) {
        switch (message.method) {
        case 'initializeUI':
            masterSwitch.checked = message.masterSwitchOn;
            root.uiReady = true;
            root.last360ThumbnailURL = message.last360ThumbnailURL;
            root.processing360Snapshot = message.processing360Snapshot;
        break;
        case 'last360ThumbnailURL':
            root.last360ThumbnailURL = message.last360ThumbnailURL;
        break;
        case 'startedProcessing360Snapshot':
            root.processing360Snapshot = true;
        break;
        case 'finishedProcessing360Snapshot':
            root.processing360Snapshot = false;
        break;
        default:
            console.log('Unrecognized message from RPO360.js:', JSON.stringify(message));
        }
    }
    signal sendToScript(var message);

    //
    // FUNCTION DEFINITIONS END
    //
}
