
// Easy log function checking for message, an object to stringify, and whether it should be enabled or not
function easyLog(message, object, enabled, logType) {
    if (this.logTypes.indexOf(logType) === -1) {
        console.error('this is a bad logtype, please fix to ["warn", "info", "log", "debug", "error", "exception", "assert"]');
    }

    if (typeof enable === "undefined") {
        enabled = true;
    }

    if (!this.debug || !enabled) {
        return;
    }

    var finalMessage;

    finalMessage = "\n\t" + message + ":" + "\n";

    if (typeof object !== 'undefined') {
        finalMessage += "\n\t\t" + JSON.stringify(object, null, 2) + "\n";
    }

    console[logType](finalMessage);
}

easyLog.prototype.debug = true;

easyLog.prototype.spaces = 2;

// Enable or Disable all logging
easyLog.prototype.isDebug = function(enable) {
    this.debug = enable;
};


// Change the amount of spaces for formatted JSONs
easyLog.prototype.changeSpaces = function(spaces){
    this.spaces = spaces
}


easyLog.prototype.logTypes = ["warn", "info", "log", "debug", "error", "exception", "assert"];

module.exports = easyLog;