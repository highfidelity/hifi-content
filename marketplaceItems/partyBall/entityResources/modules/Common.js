module.exports = {
    randomFloat: function randomFloat(low, high) {
        return low + Math.random() * (high - low);
    },
    randomInt: function randomInt(low, high) {
        return Math.floor(low + Math.random() * (high - low));
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
    }
};