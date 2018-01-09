//
//  Created by Daniela Fontes (Mimicry) on 12/18/2017
//  Copyright 2017 High Fidelity, Inc.
//
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//



const TURRET_MODEL_URL = Script.resolvePath('assets/basic_barrel.fbx');

const TURRET_BASE_MODEL_URL = Script.resolvePath('assets/basic_base.fbx');
const TURRET_SCRIPT_URL = Script.resolvePath('turretScript.js');
//var ENTITY_SPAWNER_SCRIPT_URL = Script.resolvePath('entitySpawner.js');


var front = Quat.getFront(MyAvatar.orientation);
var up = Quat.getUp(MyAvatar.orientation);
var avatarHalfDown = MyAvatar.position;

var TURRET_START_POSITION = Vec3.sum(avatarHalfDown, Vec3.multiply(2, front));
var TURRET_BASE_START_POSITION = Vec3.sum(MyAvatar.getJointPosition("RightFoot"), Vec3.multiply(2, front));
var TURRET_START_POSITION = Vec3.sum(TURRET_BASE_START_POSITION, Vec3.multiply(1.5, up));

var turret, turretBase;

function createTurret() {
    turret = Entities.addEntity({
        type: 'Model',
        name: 'Turret',
        description: 'hifi:turret:turret',
        modelURL: TURRET_MODEL_URL,
        shapeType: 'box',
        dynamic: false,
        registrationPoint:  {
            x: 0.5,
            y: 0.5,
            z: 0.13 // proportion
        },
        
        rotation: MyAvatar.orientation,
        script: TURRET_SCRIPT_URL,
        position: TURRET_START_POSITION,
        userData: JSON.stringify({
            grabbableKey: {
                grabbable: false
            },
            turretData: {
                turnTableID: ""
            }
        })
    });

    turretBase = Entities.addEntity({
        type: 'Model',
        name: 'TurretBase',
        description: 'hifi:turret:turretBase',
        modelURL: TURRET_BASE_MODEL_URL,
        shapeType: 'box',
        dynamic: false,
        position: TURRET_BASE_START_POSITION,
        rotation: MyAvatar.orientation,
        registrationPoint:  {
            x: 0.5,
            y: 0,
            z: 0.5
        },
        userData: JSON.stringify({
            grabbableKey: {
                grabbable: false
            }
        })
    });
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

