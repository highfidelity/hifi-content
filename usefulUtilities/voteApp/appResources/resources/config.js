//
//  config.js 
//
//  Created by Robin Wilson 2019-1-09
// 
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  Manages data for both js/voteApp_ui.js and voteApp.js

/* global module */

var EVENT_DATE = "01_01_1970",
    EVENT_TITLE = "EventTitle",
    EVENT_NAME = EVENT_TITLE + "_" + EVENT_DATE;

// Unload time variables
var UNLOAD = {
    YEAR: 2019,
    MONTH: 11, // UTC month 0 = January ; month 10 = November
    DAY: 21,
    HOUR: 0, // 24 hour format ex - 3pm === 15
    MINUTE: 30
};

var CONFIG = {
    // Configurable event details
    EVENT_DATE: EVENT_DATE,
    EVENT_TITLE: EVENT_TITLE,
    EVENT_NAME: EVENT_NAME,

    // Tablet events shared by Tablet.js and voteApp.js
    EVENT_BRIDGE_OPEN_MESSAGE: "eventBridgeOpen",
    UPDATE_UI: EVENT_NAME + "_update_ui",
    GOTO_LOCATION: "goto_location",
    GOTO_DOMAIN: "goto_domain",
    VOTE_AVATAR: "vote_avatar",
    VOTE_DOMAIN: "vote_domain",

    // Date when the App will remove itself from the users tablet in UTC time
    // Year, month, day, hour, minutes
    UNLOAD_DATE: new Date(Date.UTC(UNLOAD.YEAR, UNLOAD.MONTH, UNLOAD.DAY, UNLOAD.HOUR, UNLOAD.MINUTE))
};

if (module) {
    module.exports = CONFIG;
}
