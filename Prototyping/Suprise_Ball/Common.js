module.exports = {
    randomFloat: function randomFloat(low, high) {
        return low + Math.random() * (high - low);
    },
    randomInt: function randomInt(low, high) {
        return Math.floor(this.randomFloat(low, high));
    },
    lerp: function lerp(InputLow, InputHigh, OutputLow, OutputHigh, Input) {
        return ((Input - InputLow) / (InputHigh - InputLow)) * (OutputHigh - OutputLow) + OutputLow;
    },
    clamp: function clamp(min, max, num) {
        return Math.min(Math.max(num, min), max);
    },
    makeColor: function makeColor(red, green, blue) {
        var colorArray = [red, green, blue];
        var arrayToGet0 = Math.floor(Math.random() * colorArray.length);
        colorArray[arrayToGet0] = colorArray[arrayToGet0] * 0.20;
        var finalColorObject = {
            red: colorArray[0],
            green: colorArray[1],
            blue: colorArray[2]
        };
        return finalColorObject;
    },
    log: function log(label, value, isActive) {
        isActive = isActive || true;
        if (!isActive) {
            return;
        }
        print("\n" + label + "\n" + "***************************************\n", JSON.stringify(value));
    },
    vec: function vec(x, y, z) {
        var obj = {};
        obj.x = x;
        obj.y = y;
        obj.z = z;
        return obj;
    }
};