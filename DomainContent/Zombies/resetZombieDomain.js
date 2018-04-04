//
// resetZombieDomain.js
// 
// Created by Rebecca Stankus on 03/07/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

var AMBULANCE_BLOCKING_PATH_BY_CAFE = "{3f1e4501-622d-44c9-a353-7278a98b2142}";
var FIRE_BY_CAFE = "{b908d304-cbee-4eb0-85ed-e549264de3f4}";
var EXPLOSION_ZONE_BY_CAFE = "{88aec9a6-97cc-4828-9983-493ab81f9131}";
var FIRE_BY_GENERATOR = "{84d98c70-fe1c-4624-a8ba-d0e9171a1e46}";
var FIRE_ZONE_BY_GENERATOR = "{f6164a87-ea52-478e-aa45-442bf665c674}";
var FIRE_BY_GAS_MAIN_1 = "{358ac501-b964-4502-a0d6-2be2be3691cd}";
var FIRE_BY_GAS_MAIN_2 = "{21c65586-06c0-429b-9dc3-2a13d7e92a10}";
var GATEA = "{9d5f1f76-3d1f-4424-b3f3-bfb1122f177b}";
var GATE1 = "{a35552d6-8176-408a-b79a-9a1ea01192e5}";
var GATE2 = "{e0db4779-75e7-41fb-adf9-2b0693c20216}";
var GATE3 = "{a71682be-bef9-477e-89e1-2c8bee014965}";
var GATE4 = "{c511736d-a779-4e03-bc4e-ddd38b474869}";
var GATE5 = "{eb233e13-ed68-4cd1-8224-3f8fe2cc7771}";
var SOS_BUTTON = "{a106c159-b533-47c4-93cc-a34fc4ed9b58}";
var GAS_MAIN = "{1afbc834-d361-468a-b077-b5364cf17043}";
var GENERATOR_BUTTON ="{f7d7ad8f-958a-4861-9cec-337642744646}";
var BOAT = "{4691d6ad-93f5-4456-90b9-95c9f2ef00b2}";
var BLOCK_BOAT_ACCESS = "{838f0103-1bfa-4c7c-a786-b3e8c0f71f8a}";
var BOAT_LEAVING_ZONE = "{eaed52a6-6791-4c68-a5d3-d5efe6377d58}";

Entities.callEntityServerMethod(BOAT, 'reset');
Entities.editEntity(BLOCK_BOAT_ACCESS, {
    collisionless: false
});
Entities.callEntityMethod(BOAT_LEAVING_ZONE, 'reset');

Entities.callEntityServerMethod(GATEA, 'resetGate');
Entities.callEntityServerMethod(GATE1, 'resetGate');
Entities.callEntityServerMethod(GATE2, 'resetGate');
Entities.callEntityServerMethod(GATE3, 'resetGate');
Entities.callEntityServerMethod(GATE4, 'resetGate');
Entities.callEntityServerMethod(GATE5, 'resetGate');

Entities.editEntity(FIRE_BY_CAFE, {
    visible: false,
    collisionless: true,
    locked: false
});

Entities.editEntity(FIRE_BY_GAS_MAIN_1, {
    visible: true,
    collisionless: false,
    locked: false
});

Entities.editEntity(FIRE_BY_GAS_MAIN_2, {
    visible: true,
    collisionless: false,
    locked: false
});

Entities.editEntity(AMBULANCE_BLOCKING_PATH_BY_CAFE, {
    visible: true,
    collisionless: false,
    locked: false
});

Entities.callEntityMethod(SOS_BUTTON, 'changeColorToRed');
Entities.callEntityMethod(FIRE_ZONE_BY_GENERATOR, 'resetZone');
Entities.callEntityMethod(GAS_MAIN, 'reset');
Entities.callEntityMethod(GENERATOR_BUTTON, 'reset');
