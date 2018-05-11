//
//  guitarZone.js
//
//  created by Rebecca Stankus on 02/14/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
// 

(function() {
    this.enterEntity = function() {
        function getPosition() {
            var direction = Quat.getFront(MyAvatar.orientation);
            var distance = 1;
            var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
            var verticalOffset = 0.4;
            position.y += verticalOffset;
            return position;
        }

        var guitar = Entities.addEntity({
            angularDamping: 1,
            clientOnly: 1,
            collidesWith: "",
            collisionMask: 0,
            collisionless: 1,
            damping: 1,
            dimensions: {
                x: 0.3574559986591339,
                y: 1.2611900568008423,
                z: 0.08082675188779831
            },
            modelURL: "https://hifi-content.s3.amazonaws.com/rebecca/guitar/models/ElectricGuitar.obj",
            name: "Guitar CC-BY-Poly by Google",
            position: getPosition(),
            script: "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitar.js",
            shapeType: "simple-compound",
            type: "Model",
            userData: "{\"grabbableKey\":{\"grabbable\":true,\"ignoreIK\":false}}",
            owningAvatarID : MyAvatar.sessionUUID
        });

        Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "static,dynamic,kinematic,",
            "collisionMask": 7,
            "color": {
                "blue": 122,
                "green": 122,
                "red": 250
            },
            "dimensions": {
                "x": 0.05000000074505806,
                "y": 0.029999999329447746,
                "z": 0.05000000074505806
            },
            "name": "Guitar Body 1",
            "parentID": guitar,
            localPosition: {
                x:0.06207275390625,
                y:-0.2640190124511719,
                z:0.016750335693359375
            },
            localRotation: {
                x:-0.5052415132522583,
                y:-0.494163453578949,
                z:-0.494346559047699,
                w:-0.5061875581741333
            },
            "script": "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitarPlay.js",
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"grabbable\":false}}",
            "visible": 0
        });

        Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "dynamic,",
            "collisionMask": 2,
            "color": {
                "blue": 250,
                "green": 85,
                "red": 187
            },
            "dimensions": {
                "x": 0.05000000074505806,
                "y": 0.029999999329447746,
                "z": 0.05000000074505806
            },
            "name": "Guitar Body 2",
            "parentID": guitar,
            localPosition: {
                x:0.06076812744140625,
                y:-0.3140449523925781,
                z:0.01674365997314453
            },
            localRotation: {
                x:-0.5052415132522583,
                y:-0.494163453578949,
                z:-0.494346559047699,
                w:-0.5061875581741333
            },
            "script": "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitarPlay.js",
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"grabbable\":false,\"ignoreIK\":false}}",
            "visible": 0
        });

        Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "dynamic,",
            "collisionMask": 2,
            "color": {
                "blue": 208,
                "green": 250,
                "red": 117
            },
            "dimensions": {
                "x": 0.05000000074505806,
                "y": 0.029999999329447746,
                "z": 0.05000000074505806
            },
            "name": "Guitar Body 3",
            "parentID": guitar,
            localPosition: {
                x:0.059360504150390625,
                y:-0.3642120361328125,
                z:0.016768455505371094
            },
            localRotation: {
                x:-0.5052415132522583,
                y:-0.494163453578949,
                z:-0.494346559047699,
                w:-0.5061875581741333
            },
            "script": "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitarPlay.js",
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"ignoreIK\":false,\"grabbable\":false}}",
            "visible": 0
        });

        Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "dynamic,",
            "collisionMask": 2,
            "color": {
                "blue": 143,
                "green": 239,
                "red": 247
            },
            "dimensions": {
                "x": 0.05000000074505806,
                "y": 0.029999999329447746,
                "z": 0.05000000074505806
            },
            localPosition: {
                x:0.05805778503417969,
                y:-0.41423797607421875,
                z:0.01675701141357422
            },
            localRotation: {
                x:-0.5052415132522583,
                y:-0.494163453578949,
                z:-0.494346559047699,
                w:-0.5061875581741333
            },
            "name": "Guitar Body 4",
            "parentID": guitar,
            "script": "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitarPlay.js",
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"ignoreIK\":false,\"grabbable\":false}}",
            "visible": 0
        });

        Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "dynamic,",
            "collisionMask": 2,
            "color": {
                "blue": 1,
                "green": 126,
                "red": 138
            },
            "dimensions": {
                "x": 0.05000000074505806,
                "y": 0.029999999329447746,
                "z": 0.05000000074505806
            },
            "name": "Guitar Body 5",
            "parentID": guitar,
            localPosition: {
                x:-0.04220008850097656,
                y:-0.4119873046875,
                z:0.01667499542236328
            },
            localRotation: {
                x:-0.5052415132522583,
                y:-0.494163453578949,
                z:-0.494346559047699,
                w:-0.5061875581741333
            },
            "script": "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitarPlay.js",
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"grabbable\":false,\"ignoreIK\":false}}",
            "visible": 0
        });

        Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "dynamic,",
            "collisionMask": 2,
            "color": {
                "blue": 65,
                "green": 94,
                "red": 2
            },
            "dimensions": {
                "x": 0.05000000074505806,
                "y": 0.029999999329447746,
                "z": 0.05000000074505806
            },
            "name": "Guitar Body 6",
            "parentID": guitar,
            localPosition: {
                x:-0.04091644287109375,
                y:-0.36196136474609375,
                z:0.016693115234375
            },
            localRotation: {
                x:-0.5052415132522583,
                y:-0.494163453578949,
                z:-0.494346559047699,
                w:-0.5061875581741333
            },
            "script": "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitarPlay.js",
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"grabbable\":false,\"ignoreIK\":false}}",
            "visible": 0
        });

        Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "dynamic,",
            "collisionMask": 2,
            "color": {
                "blue": 130,
                "green": 3,
                "red": 81
            },
            "dimensions": {
                "x": 0.05000000074505806,
                "y": 0.029999999329447746,
                "z": 0.05000000074505806
            },
            "name": "Guitar Body 7",
            "parentID": guitar,
            localPosition: {
                x:-0.03951072692871094,
                y:-0.31179046630859375,
                z:0.01667022705078125
            },
            localRotation: {
                x:-0.5052415132522583,
                y:-0.494163453578949,
                z:-0.494346559047699,
                w:-0.5061875581741333
            },
            "script": "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitarPlay.js",
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"grabbable\":false,\"ignoreIK\":false}}",
            "visible": 0
        });

        Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "dynamic,",
            "collisionMask": 2,
            "color": {
                "blue": 75,
                "green": 19,
                "red": 232
            },
            "dimensions": {
                "x": 0.05000000074505806,
                "y": 0.029999999329447746,
                "z": 0.05000000074505806
            },
            "name": "Guitar Body 8",
            "parentID": guitar,
            localPosition: {
                x:-0.03822517395019531,
                y:-0.26175689697265625,
                z:0.01668262481689453
            },
            localRotation: {
                x:-0.5052415132522583,
                y:-0.494163453578949,
                z:-0.494346559047699,
                w:-0.5061875581741333
            },
            "script": "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitarPlay.js",
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"grabbable\":false,\"ignoreIK\":false}}",
            "visible": 0
        });

        Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "static,dynamic,kinematic,",
            "collisionMask": 7,
            "color": {
                "blue": 0,
                "green": 0,
                "red": 255
            },
            "dimensions": {
                "x": 0.09593421965837479,
                "y": 0.07194480299949646,
                "z": 0.09860000014305115
            },
            "name": "Guitar Neck Red",
            "parentID": guitar,
            localPosition: {
                x:0.02330160140991211,
                y:0.31251323223114014,
                z:0
            },
            localRotation: {
                x:0.7065384387969971,
                y:0.014816522598266602,
                z:0.015579462051391602,
                w:0.7073320150375366
            },
            "script": "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitarNeck.js",
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"grabbable\":false}}",
            "visible": 0
        });

        Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "dynamic,",
            "collisionMask": 2,
            "color": {
                "blue": 0,
                "green": 68,
                "red": 255
            },
            "dimensions": {
                "x": 0.09676527231931686,
                "y": 0.0685807392001152,
                "z": 0.09860000014305115
            },
            "name": "Guitar Neck Orange",
            "parentID": guitar,
            localPosition: {
                x:0.020969390869140625,
                y:0.21316003799438477,
                z:0
            },
            localRotation: {
                x:0.7066299915313721,
                y:0.014816522598266602,
                z:0.015609979629516602,
                w:0.7072099447250366
            },
            "script": "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitarNeck.js",
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"ignoreIK\":false,\"grabbable\":false}}",
            "visible": 0
        });

        Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "dynamic,",
            "collisionMask": 2,
            "color": {
                "blue": 8,
                "green": 247,
                "red": 255
            },
            "dimensions": {
                "x": 0.09798748791217804,
                "y": 0.06747297197580338,
                "z": 0.09860000014305115
            },
            "name": "Guitar Neck Yellow",
            "parentID": guitar,
            localPosition: {
                x:0.01756763458251953,
                y:0.11455994844436646,
                z:0
            },
            localRotation: {
                x:-0.7066910862922668,
                y:-0.014389276504516602,
                z:-0.015182733535766602,
                w:-0.7072709202766418
            },
            "script": "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitarNeck.js",
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"grabbable\":false,\"ignoreIK\":false}}",
            "visible": 0
        });

        Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "dynamic,",
            "collisionMask": 2,
            "color": {
                "blue": 15,
                "green": 148,
                "red": 3
            },
            "dimensions": {
                "x": 0.10068956762552261,
                "y": 0.06967802345752716,
                "z": 0.09860000014305115
            },
            "name": "Guitar Neck Green",
            "parentID": guitar,
            localPosition: {
                x:0.015446662902832031,
                y:0.01676046848297119,
                z:0
            },
            localRotation: {
                x:-0.7066910862922668,
                y:-0.014175653457641602,
                z:-0.014969110488891602,
                w:-0.7072709202766418
            },
            "script": "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitarNeck.js",
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"ignoreIK\":false,\"grabbable\":false}}",
            "visible": 0
        });

        Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "dynamic,",
            "collisionMask": 2,
            "color": {
                "blue": 222,
                "green": 101,
                "red": 27
            },
            "dimensions": {
                "x": 0.09966519474983215,
                "y": 0.06864230334758759,
                "z": 0.09860000014305115
            },
            "name": "Guitar Neck Blue",
            "parentID": guitar,
            localPosition: {
                x:0.012490272521972656,
                y:-0.08011186122894287,
                z:0
            },
            localRotation: {
                x:-0.7066910862922668,
                y:-0.013504207134246826,
                z:-0.014297723770141602,
                w:-0.7072709202766418
            },
            "script": "https://hifi-content.s3.amazonaws.com/rebecca/guitar/guitarNeck.js",
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"ignoreIK\":false,\"grabbable\":false}}",
            "visible": 0
        });
    };
});
