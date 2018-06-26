//
//  enterStageZone.js
//
//  Created by Rebecca Stankus on 06/16/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {

    var overlays = [];
    var arrowLeft;
    var arrowRight;
    this.enterEntity = function() {
        var webOverlay = Overlays.addOverlay("web3d", {
            dimensions: {
                x: 1.3249601125717163,
                y: 0.7452900409698486,
                z: 0.009999999776482582
            },
            rotation: {
                w: 0.0014801025390625,
                x: -0.0007781982421875,
                y: 0.9099717140197754,
                z: 0.4146333932876587
            },
            position: {
                x: 99.6183,
                y: -0.6548,
                z: 32.4620
            },
            url: "https://hifi-slides.glitch.me/",
            color: { red: 255, green: 255, blue: 255 },
            alpha: 1,
            showKeyboardFocusHighlight: false,
            dpi: 37.75,
            visible: true
        });
        overlays.push(webOverlay);
        arrowRight = Overlays.addOverlay("model", {
            url: Script.resolvePath("models/arrow.fbx"),
            name: "fwd",
            dimensions: {
                x: 0.3,
                y: 0.45,
                z: 0.1
            },
            rotation: {
                w: 0.007461667060852051,
                x: -0.04377812147140503,
                y: -0.41631191968917847,
                z: 0.9081406593322754
            },
            position: {
                x: 98.8163,
                y: -0.6871,
                z: 32.3995
            },
            alpha: 1,
            visible: true
        });
        overlays.push(arrowRight);
        arrowLeft = Overlays.addOverlay("model", {
            url: Script.resolvePath("models/arrow.fbx"),
            name: "bwd",
            dimensions: {
                x: 0.3,
                y: 0.45,
                z: 0.1
            },
            rotation: {
                w: 0.42085909843444824,
                x: -0.9067673683166504,
                y: -0.005722105503082275,
                z: -0.024856925010681152
            },
            position: {
                x: 100.4279,
                y: -0.6871,
                z: 32.4366
            }, 
            alpha: 1,
            showKeyboardFocusHighlight: false,
            visible: true
        });

        overlays.push(arrowLeft);
    };

    var slideURL = "https://hifi-slides.glitch.me/";

    function XHR(url) {
        this.req = new XMLHttpRequest();
        this.req.open("GET", url);
        this.req.send();
    }

    var mousePress = function(id, event) {
        if (id === arrowRight) {
            XHR(slideURL + "/fwd");
        }
        if (id === arrowLeft) {
            XHR(slideURL + "/bwd");
        }
    };

    Overlays.mousePressOnOverlay.connect(mousePress);

    this.leaveEntity = function() {
        overlays.forEach(function(element) {
            Overlays.deleteOverlay(element);
        });
    };
});
