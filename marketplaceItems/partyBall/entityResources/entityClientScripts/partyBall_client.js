/*

    Party Ball
    partyBall.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Throw and get down!

*/

(function(){
    // *************************************
    // START INIT
    // *************************************
    // #region INIT
    
    
    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
    var _entityID
    
    
    // #endregion
    // *************************************
    // END INIT
    // *************************************

    // *************************************
    // START ENTITY DEFINITION
    // *************************************
    // #region ENTITY DEFINITION
    
    
    function PartyBall(){
    
    }
    
    PartyBall.prototype = {
        preload: function(entityID){
            _entityID = entityID;
        },
    
        unload: function(){
        }
    
    }
    
    
    
    // #endregion
    // *************************************
    // END ENTITY DEFINITION
    // *************************************

    // *************************************
    // START MAIN
    // *************************************
    // #region MAIN
    
    
    return new PartyBall();
    
    
    // #endregion
    // *************************************
    // END MAIN
    // *************************************
});
