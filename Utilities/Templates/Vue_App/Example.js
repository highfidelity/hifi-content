"use strict";
/* eslint indent: ["error", 4, { "outerIIFEBody": 0 }] */
//
//  Example Vue App
//  scripts/system/
//
//  Created by Howard Stearns on 2 Nov 2016
//  Copyright 2016 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals Tablet, Script, HMD, Controller, Menu */

(function () { // BEGIN LOCAL_SCOPE
var AppUi = Script.require('appUi');

var URL = Script.resolvePath("./html/tablet.html");
var BUTTON_NAME = "BUTTON_NAME";
var ui;
function startup() {
    ui = new AppUi({
        buttonName: BUTTON_NAME,
        sortOrder: 6,
        home: URL
    });
}
startup();
}()); // END LOCAL_SCOPE