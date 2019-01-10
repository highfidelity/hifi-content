## Easy Log

# Description

Easy log function with handy features for custom logging. 

## Use

var l = Script.require(<locationOfLibrary>/easyLog.js>);

---

Parameters: 

l(message, objectToPrint, isEnabled, logType);

message: 

string to print

objectToPrint: 

prettified JSON print of an object

isEnabled: 

log or not, default = true

logType: 

different kinds of logs:

["l", "log", "w", "warn", "i", "info", "d", "debug", "er", "error", "ex", "exception", "a", "assert"], default = "log"

---

l("easy log message");

// "easy log message"

var object = { "a": "a", "b": "b", "c": "C"};

easyLog("log with object", object);

/*

log with object
{
  "a": "a",
  "b": "b",
  "c": "C"
}

*/

easyLog("log with object", object, false);

//

easyLog("log with object", null, true, "error");

// X log with object

A couple of useful methods:

l.isDebug(false) // stops all logs
l.changeSpaces(0) // how many spaces you want for prettify