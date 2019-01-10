
// Easy log function checking for message, an object to stringify, and whether it should be enabled or not
function easyLog(message, object, enabled, logType) {
    if (typeof logType === "undefined") {
        logType = "log";
    }
    
    function inLogTypeCheck(){
        if (easyLog.logTypes.indexOf(logType) === -1) {
            console.error('logType used:' + logType);
            console.error('this is a bad logtype. \nPlease fix to one of the following: \n["w", "warn", "i", "info", "d", "debug", "er", "error", "ex", "exception", "a", "assert"];');
            return;
        }
    }

    inLogTypeCheck();

    // If it's one of the short hand console methods, use the appropriate method name found one index up
    if (logType.length <= 2) {
        var logTypeIndex = easyLog.logTypes.indexOf(logType);
        logType = easyLog.logTypes[logTypeIndex + 1];
        inLogTypeCheck();
    }


    if (typeof enabled === "undefined" || enabled === null) {
        enabled = true;
    }

    if (!easyLog.debug || !enabled) {
        return;
    }

    var finalMessage;

    finalMessage = "\n" + message;

    if (typeof object !== 'undefined' && object !== null) {
        finalMessage += "\n" + JSON.stringify(object, null, easyLog.spaces) + "\n";
    }

    console[logType](finalMessage);
}

easyLog.debug = true;

easyLog.spaces = 2;

// Enable or Disable all logging
easyLog.isDebug = function(enable) {
    easyLog.debug = enable;
};


// Change the amount of spaces for formatted JSONs
easyLog.changeSpaces = function(spaces){
    easyLog.spaces = spaces;
}


easyLog.logTypes = ["l", "log", "w", "warn", "i", "info", "d", "debug", "er", "error", "ex", "exception", "a", "assert"];

module.exports = easyLog;