//
// ShatterPlateServer.js
// 
// Author: Liv Erickson
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* globals Entities, Uuid */
(function() {
  
    var PIECE_MODEL = Script.resolvePath('plate-piece.fbx');
    var SHATTER_PLATE_PIECE_URL = Script.resolvePath("ShatterPlatePiece.js");

    var NUMBER_PIECES = 4;
    var pieces = Array();
    var _entityID;

    var LIFETIME_DEFAULT = 60;

    var Plate = function(){
    };
  
  
    Plate.prototype = {
        remotelyCallable : ['breakPlate'],

        preload: function(entityID) {
            _entityID = entityID;
            for (var i = 0; i < NUMBER_PIECES; i++) {
                pieces.push(Entities.addEntity({
                    type: "Model",
                    name: "Plate Piece",
                    lifetime: LIFETIME_DEFAULT,
                    modelURL: PIECE_MODEL,
                    visible: false,
                    parentID: entityID,
                    collidesWith: "",
                    collisionMask: 0,
                    shapeType: "None",
                    grabbable: false
                }));
            } 
        },

        breakPlate : function() {
            var velocity = Entities.getEntityProperties(_entityID, 'velocity').velocity;
            
            pieces.forEach(function(element){
                var position = Entities.getEntityProperties(_entityID, 'position').position; 
                Entities.editEntity(element, {
                    visible: true,
                    dynamic: true,
                    position: position,
                    gravity: {x: 0, y: -5, z: 0},
                    dimensions: {x: 0.1865, y: 0.0303, z: 0.2149},
                    acceleration: {x: 1, y: -5, z: 2},
                    parentID: Uuid.NULL,
                    lifetime: 60,
                    collidesWith: "static,dynamic,",
                    collisionMask: 3,
                    shapeType: "Box",
                    velocity: velocity,
                    grabbable: true,
                    script: SHATTER_PLATE_PIECE_URL
                });
            });
    
            Entities.deleteEntity(_entityID);
        }
    };
  
    return new Plate();

});
