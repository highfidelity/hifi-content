/*

    Name
    name.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Throw and get down!

*/


(function() {
    
    // *************************************
    // START MODULES
    // *************************************
    // #region MODULES




    // #endregion
    // *************************************
    // END MODULES
    // *************************************

    // *************************************
    // START INIT
    // *************************************
    // #region INIT


    var _entityID;


    // #endregion
    // *************************************
    // END INIT
    // *************************************

    // *************************************
    // START eventHandlers
    // *************************************
    // #region eventHandlers




    // *************************************
    // END eventHandlers
    // *************************************

    // *************************************
    // START ENTITY DEFINITION
    // *************************************
    // #region ENTITY DEFINITION


    // Initialize the entity on preload
    function preload(entityID) {
        _entityID = entityID;
    }


    // Clean up for when the entity is unloaded
    function unload() {
    }


    function Name() { }

    Name.prototype = {
        remotelyCallable: [""],
        preload: preload,
        unload: unload
    };

    return new Name();

    // #endregion
    // *************************************
    // END ENTITY DEFINITION
    // *************************************

});
