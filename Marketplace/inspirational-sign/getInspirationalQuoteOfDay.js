//
//  getInspirationalQuoteOfDay.js
//
//  created by Liv Erickson on 12/04/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var API_URL = "https://quotes.rest/qod?category=inspire";
    var INTERVAL_FREQUENCY = 360000;
    var myEntityID, interval; 
  
    var req = Script.require('./utils/request.js');
  
    var InspirationalSign = function() {};
  
    function checkForNewQuote() {
        getInspirationOfTheDay();
    }
  
    InspirationalSign.prototype = {
        preload : function(entityID) {
            myEntityID = entityID;
            getInspirationOfTheDay();
            interval = Script.setInterval(checkForNewQuote, INTERVAL_FREQUENCY); 
        }, 
        unload: function() {
            if (interval) {
                Script.clearInterval(interval);
            }
        }
    };
  
    function getInspirationOfTheDay() {
        req.request(API_URL, function(error, data) {
            try {
                var quote = data.contents.quotes[0].quote;
                var author = data.contents.quotes[0].author;
                var string = quote + " - " + author;
                Entities.editEntity(myEntityID, {'text' : string});
            } catch (e) {
                print("Error getting quote");
            }
        });
    }
  
    return new InspirationalSign();
});