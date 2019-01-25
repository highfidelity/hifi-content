/*

    Party Ball 
    polyfill.js
    Created by Milad Nazeri on 2019-01-17
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    This is a polyfill to have access to the .bind JS method

*/


function bind(){
    if (!Function.prototype.bind) (function () {
        var ArrayPrototypeSlice = Array.prototype.slice;
        Function.prototype.bind = function (otherThis) {
            if (typeof this !== 'function') {
                // closest thing possible to the ECMAScript 5
                // internal IsCallable function
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }
    
            var baseArgs = ArrayPrototypeSlice.call(arguments, 1),
                baseArgsLength = baseArgs.length,
                fToBind = this,
                fNOP = function () { },
                fBound = function () {
                    baseArgs.length = baseArgsLength; // reset to default base arguments
                    baseArgs.push.apply(baseArgs, arguments);
                    return fToBind.apply(
                        fNOP.prototype.isPrototypeOf(this) ? this : otherThis, baseArgs
                    );
                };
    
            if (this.prototype) {
                // Function.prototype doesn't have a prototype property
                fNOP.prototype = this.prototype;
            }
            fBound.prototype = new fNOP();
    
            return fBound;
        };
    })();
}

module.exports = bind;
