/* global module */

var EVENT_DATE = "11_17_2018";
var EVENT_TITLE = "Futvrelands";
var EVENT_NAME = EVENT_TITLE + "_" + EVENT_DATE;

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

    // Unload app variables
    // Example: UTC month 0 = January ; month 10 = sNovember
    // year, month, day, hour, minutes
    UNLOAD_DATE: new Date(Date.UTC(2019, 11, 21, 0, 30))
};

if (module) {
    module.exports = CONFIG;
}