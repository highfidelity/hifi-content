/* globals Entities, Vec3, Quat, Overlays, module */

var WHITEBOARD_ENTITIES = Script.require('./whiteboardEntities.json');

// Add LocalPosition to entity data if parent properties are available
var entities = WHITEBOARD_ENTITIES.Entities;
var entitiesByID = {};
var i, entity;
for (i = 0; i < entities.length; ++i) {
    entity = entities[i];
    entitiesByID[entity.id] = entity;
}
for (i = 0; i < entities.length; ++i) {
    entity = entities[i];
    if (entity.parentID !== undefined) {
        var parent = entitiesByID[entity.parentID];
        entity.script = "";
        if (parent !== undefined) {
            entity.localPosition = Vec3.subtract(entity.position, parent.position);
            delete entity.position;
        }
    }

}

for (i = 0; i < entities.length; ++i) {
    delete entities[i].id;
}

module.exports = {
    WHITEBOARD_ENTITIES : WHITEBOARD_ENTITIES
};
