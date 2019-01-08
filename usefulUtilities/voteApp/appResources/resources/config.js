/* global module */

var EVENT_DATE = "11_17_2018",
    EVENT_TITLE = "Futvrelands",
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
    EVENT_NAME: EVENT_TITLE + "_" + EVENT_DATE,

    // Tablet events shared by Tablet.js and voteApp.js
    EVENT_BRIDGE_OPEN_MESSAGE: "eventBridgeOpen",
    UPDATE_UI: EVENT_NAME + "_update_ui", // !important must match voteApp.js
    GOTO_LOCATION: "goto_location",
    GOTO_DOMAIN: "goto_domain",
    VOTE_AVATAR: "vote_avatar",
    VOTE_DOMAIN: "vote_domain",

    // year, month, day, hour, minutes
    UNLOAD_DATE: new Date(Date.UTC(UNLOAD.YEAR, UNLOAD.MONTH, UNLOAD.DAY, UNLOAD.HOUR, UNLOAD.MINUTE))
};

if (module) {
    module.exports = CONFIG;
}