(function () {
    // Init
    var _entityID,
        directionArray,
        NORMAL = 0,
        REVERSE = 1,
        event;


    // Polyfill
    Script.require(Script.resolvePath("./Polyfills.js"))();
    
    // Collections
    var lightOff = { intensity: 0 },
        LightOn = { intensity: 1000 };

    // Helper Functions
    function lerp(InputLow, InputHigh, OutputLow, OutputHigh, Input) {
        return ((Input - InputLow) / (InputHigh - InputLow)) * (OutputHigh - OutputLow) + OutputLow;
    }

    function clamp(min, max, num) {
        return Math.min(Math.max(num, min), max);
    }

    // Procedural Functions
    function turnOnLight() {
        Entities.editEntity(_entityID, LightOn);
    }

    
    function turnOffLight() {
        Entities.editEntity(_entityID, lightOff);
    }

    function editLight(event, directionArray) {
        var inCutoffMin = 0,
            inCutoffMax = 1,
            inColorMin = 0,
            inColorMax = 1,
            inFalloffRadiusMin = 0,
            inFalloffRadiusMax = 1,
            outCutoffMin = 0,
            outCutoffMax = 10,
            outColorMin = 0,
            outColorMax = 255,
            outFalloffRadiusMin = 0,
            outFalloffRadiusMax = 1.25,
            tempOut,
            cutoffChange,
            falloffRadiusChange,
            colorChangeRed,
            colorChangeBlue,
            props;

        event.x = clamp(0,1, event.x);
        event.y = clamp(0,1, event.y);
        event.z = clamp(0,1, event.z);

        if (directionArray[0] === REVERSE) {
            tempOut = outCutoffMin;
            outCutoffMin = outCutoffMax;
            outCutoffMax = tempOut;
        }
        
        cutoffChange = lerp(inCutoffMin,inCutoffMax, outCutoffMin, outCutoffMax, event.x);
        falloffRadiusChange = lerp(inFalloffRadiusMin, inFalloffRadiusMax, outFalloffRadiusMax, outFalloffRadiusMin, event.y);
        colorChangeRed = lerp(inColorMin,inColorMax, outColorMin, outColorMax, event.z);
        colorChangeBlue = lerp(inColorMin,inColorMax, outColorMax, outColorMin, event.z);

        props = {
            cutoff: cutoffChange,
            falloffRadius: falloffRadiusChange,
            color: {
                red: colorChangeRed,
                blue: colorChangeBlue,
                green: 0
            }
        };

        Entities.editEntity(_entityID, props);
    }

    // Entity Definition

    function DJ_Endpoint_Light_Server() {
    }

    DJ_Endpoint_Light_Server.prototype = {
        remotelyCallable: [
            'turnOn',
            'turnOff',
            'edit'
        ],
        preload: function (entityID) {
            _entityID = entityID;
        },
        turnOn: function () {
            console.log("Turn on Fire");
            turnOnLight();
        },
        turnOff: function () {
            console.log("Turn off Fire");
            turnOffLight();
        },
        edit: function (id, param) {
            event = JSON.parse(param[0]);
            directionArray = JSON.parse(param[1]);
            editLight(event, directionArray);
        }
    };

    return new DJ_Endpoint_Light_Server();

});