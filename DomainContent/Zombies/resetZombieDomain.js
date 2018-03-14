var COLLISION_WALL_BY_BOAT = "{5615ec4a-8749-405d-8399-b13e9ecb08bb}";
var BOAT_RAMP = "{19decf64-6171-4c71-94c5-0429943a1b9e}";
var AMBULANCE_BLOCKING_PATH_BY_CAFE = "{3f1e4501-622d-44c9-a353-7278a98b2142}";
var EXPLOSION_BY_CAFE = "{61572699-d8b7-4186-b9a1-857a7ba7db34}";
var EXPLOSION_ZONE_BY_CAFE = "{88aec9a6-97cc-4828-9983-493ab81f9131}";
var FIRE_BY_GENERATOR = "{6beca683-d761-4490-a17a-9c7864b65464}";
var FIRE_ZONE_BY_GENERATOR = "{f6164a87-ea52-478e-aa45-442bf665c674}";
var GATE1 = "{c511736d-a779-4e03-bc4e-ddd38b474869}";
var GATE1_POSITION = {
    x:-60.2142,
    y:-2.0081,
    z:-59.2634
};

var GATE2 = "{a35552d6-8176-408a-b79a-9a1ea01192e5}";
var GATE2_POSITION = {
    x:29.3710,
    y:-2.5512,
    z:-30.8264
};

var GATE3 = "{e0db4779-75e7-41fb-adf9-2b0693c20216}";
var GATE3_POSITION = {
    x:17.8314,
    y:1.6143,
    z:-49.7018
};

var GATE4 = "{a71682be-bef9-477e-89e1-2c8bee014965}";
var GATE4_POSITION = {
    x:-13.0005,
    y:4.9248,
    z:-52.6598
};

/* var GATE5 = "";
var GATE5_POSITION = {
    x:,
    y:,
    z:
};

var GATE6 = "";
var GATE6_POSITION = {
    x:,
    y:,
    z:
};

var GATE7 = "";
var GATE7_POSITION = {
    x:,
    y:,
    z:
};*/

Entities.editEntity(COLLISION_WALL_BY_BOAT, {
    visible: true,
    collisionless: false
});

Entities.editEntity(BOAT_RAMP, {
    visible: false,
    collisionless: true
});

Entities.editEntity(COLLISION_WALL_BY_BOAT, {
    visible: true,
    collisionless: false
});

Entities.editEntity(EXPLOSION_BY_CAFE, {
    visible: false,
    collisionless: true
});

Entities.editEntity(FIRE_BY_GENERATOR, {
    visible: false,
    collisionless: true
});

Entities.callEntityMethod(EXPLOSION_ZONE_BY_CAFE, 'notReadyToExplode');

Entities.editEntity(GATE1, {
    position: GATE1_POSITION
});
Entities.editEntity(GATE2, {
    position: GATE2_POSITION
});
Entities.editEntity(GATE3, {
    position: GATE3_POSITION
});
Entities.editEntity(GATE4, {
    position: GATE4_POSITION
});
/* Entities.editEntity(GATE5, {
    position: GATE5_POSITION
});
Entities.editEntity(GATE6, {
    position: GATE6_POSITION
});
Entities.editEntity(GATE7, {
    position: GATE7_POSITION
});*/