(function(){

    var SupportItem = function(){

    };

    SupportItem.prototype = {

        preload: function(entityID) {
            Script.require('./support.js');
        }

    };
    return new SupportItem();

});