// Cross interfacr/browser Logging function
var PREPEND = "\n##Logger:Avimoji:App::\n";
var DEBUG = false;
function log(label, data, overrideDebug){
    if (!DEBUG && overrideDebug !== "PRINT") {
        return;
    } else {
        if (overrideDebug === "off") {
            return;
        }
    }

    data = typeof data === "undefined" || data === null ? "" : data;
    data = typeof data === "string" ? data :  (JSON.stringify(data, null, 4) || "");
    data = data + " " || "";
    console.log(PREPEND + label + ": " + data +"\n");
}

module.exports = log;