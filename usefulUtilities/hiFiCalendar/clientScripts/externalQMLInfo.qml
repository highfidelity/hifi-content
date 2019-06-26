import QtQuick 2.6

Rectangle {
    id: root
    Component.onCompleted: {
        Qt.openUrlExternally("https://support.google.com/a/answer/1686462?hl=en");
    }
}