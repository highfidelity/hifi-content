//
// ShatterPlateServer.js
// 
// Author: Liv Erickson
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* globals Entities */
(function(){
  
    var PIECE_MODEL = "atp:/Plate-piece.fbx";
    var NUMBER_PIECES = 4;
    var pieces = Array();
    var _entityID;

    var Plate = function(){
    };
  
  
    Plate.prototype = {
        remotelyCallable : ['breakPlate'],

        preload: function(entityID){
            _entityID = entityID;
            for (var i = 0; i < NUMBER_PIECES; i++) {
                pieces.push(Entities.addEntity({
                    type: "Model",
                    name: "Plate Piece",
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

        breakPlate : function(){
            var velocity = Entities.getEntityProperties(_entityID, 'velocity').velocity;
            pieces.forEach(function(element){
                Entities.editEntity(element, {
                    visible: true,
                    dynamic: true,
                    gravity: {x: 0, y: -5, z: 0},
                    acceleration: {x: 1, y: -5, z: 2},
                    parentID: "{00000000-0000-0000-0000-000000000000}",
                    lifetime: 60,
                    collidesWith: "static,dynamic,",
                    collisionMask: 3,
                    shapeType: "Box",
                    velocity: velocity,
                    grabbable: true
                });
            });
    
            Entities.deleteEntity(_entityID);
        }
    };
  
    return new Plate();

});
