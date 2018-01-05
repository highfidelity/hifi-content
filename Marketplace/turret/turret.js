//
//  Created by Daniela Fontes (Mimicry) on 12/18/2017
//  Copyright 2017 High Fidelity, Inc.
//
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//



const TURRET_MODEL_URL = Script.resolvePath('assets/turret.fbx');
const TURRET_BASE_MODEL_URL = Script.resolvePath('assets/turretBase.fbx');
const TURRET_SCRIPT_URL = Script.resolvePath('turretScript.js');
//var ENTITY_SPAWNER_SCRIPT_URL = Script.resolvePath('entitySpawner.js');


var front = Quat.getFront(MyAvatar.orientation);
var avatarHalfDown = MyAvatar.position;
var TURRET_START_POSITION = Vec3.sum(avatarHalfDown, Vec3.multiply(2, front));
var TURRET_START_POSITION = Vec3.sum(avatarHalfDown, Vec3.multiply(2, front));

var turret, turretBase;

function createTurret() {
    turret = Entities.addEntity({
        type: 'Model',
        name: 'Turret',
        description: 'hifi:turret:turret',
        modelURL: TURRET_MODEL_URL,
        shapeType: 'box',
        dynamic: false,
        gravity: {
            x: 0,
            y: -3.0,
            z: 0
        },
        density: 8000,
        restitution: 0,
        damping: 0.9,
        angularDamping: 0.8,
        friction: 1,
        dimensions: {
            x: 1.0,
            y: 1.0,
            z: 1.0
        },
        velocity: {
            x: 0.0,
            y: 0.0,
            z: 0.0
        },
        rotation: MyAvatar.orientation,
        script: TURRET_SCRIPT_URL,
        position: TURRET_START_POSITION,
        userData: JSON.stringify({
            grabbableKey: {
                grabbable: false
            }
        })
    });

    // turretBase = Entities.addEntity({
    //     type: 'Model',
    //     name: 'TurretBase',
    //     description: 'hifi:turret:turretBase',
    //     modelURL: TURRET_BASE_MODEL_URL,
    //     shapeType: 'box',
    //     dynamic: false,
    //     position: TURRET_START_POSITION,
    //     rotation: MyAvatar.orientation,
    //     userData: JSON.stringify({
    //         grabbableKey: {
    //             grabbable: false
    //         }
    //     })
    // });
}


function makeTurret() {
    createTurret();
    
}

function cleanup() {
    Entities.deleteEntity(turret);
    Entities.deleteEntity(turretBase);
}

Script.scriptEnding.connect(cleanup);

makeTurret();

