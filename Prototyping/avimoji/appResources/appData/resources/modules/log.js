// Cross interfacr/browser Logging function
var PREPEND = "\n##Logger:Avimoji:App::\n";
var DEBUG = false;
function log(label, data, overrideDebug){
    if (!DEBUG) {
        if (overrideDebug === "temp" || overrideDebug =="off") {
            return;
    } else {
        if (overrideDebug =="off") {
            return;
        }
    }

    data = typeof data === "undefined" ? "" : data;
    data = typeof data === "string" ? data :  (JSON.stringify(data, null, 4) || "");
    data = data + " " || "";
    console.log(PREPEND + label + ": " + data +"\n");
}

module.exports = log;