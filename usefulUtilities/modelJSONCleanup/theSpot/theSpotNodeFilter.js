// Consts
const PATH_TO_MODELS_JSON = ('./models.json');
const PATH_TO_WRITE_JSON = ('./models2.json');
const MIN_Y = -50;
const MAX_Y = 90;
const MIN_X = -170;
const MAX_X = 180;
const MIN_Z = -127;
const MAX_Z = 60;

// Dependencies
const fs = require('fs');
const path = require('path');
const modeljson = require(PATH_TO_MODELS_JSON);

let modelJSONEntities = modeljson.Entities;

console.log("\nOriginal entity length: ", modelJSONEntities.length, "\n");

// Map the entities to help entity lookup
let parentMap = {};
modelJSONEntities.forEach(ent => {
    parentMap[ent.id] = ent;
})

// Counters
let countNameBlackListGroup = 0;
let countNameWhiteListGroup = 0;
let countPatternMatchBlackListGroup = 0;
let countPatternMatchWhiteListGroup = 0;
let countTypeBlackListGroup = 0;
let countTypeWhiteListGroup = 0;
let countInBound = 0;
let countOutBound = 0;
let countParentInBound = 0;
let countParentOutBound = 0;
let countNoParentInDomain = 0;
let countRemainingKeeps = 0;

// Name black list
let nameBlackListGroup = [
    'Glass Piece',
    'Gun Material',
    "Plate Piece",
    "Space Shot",
    "Plate",
    "Space Juice Primitive",
    "Space Juice CC-BY Jarlan Perez"
];
// Name white list
let nameWhiteListGroup = [
];

// Type black list
let typeBlackListGroup = [
];
// Type white list
let typeWhiteListGroup = [
    'zone'
];

// Pattern match black list
let patternMatchBlackListGroup = [
    'temp'
];
// Pattern match white list
let patternMatchWhiteListGroup = [
];

// Main entity filter
modelJSONEntities = modelJSONEntities.filter( ent => {

    // Name black list
    for (var i = 0; i < nameBlackListGroup.length; i++){
        if (ent.name && ent.name.toLowerCase() === nameBlackListGroup[i].toLowerCase()) {
            countNameBlackListGroup++;
            return false;
        }
    }
    // Name white list
    for (i = 0; i < nameWhiteListGroup.length; i++){
        if (ent.name && ent.name.toLowerCase() === nameWhiteListGroup[i].toLowerCase()) {
            countNameWhiteListGroup++;
            return true;
        }
    }

    // Pattern match black list
    for (i = 0; i < patternMatchBlackListGroup.length; i++){
        if (ent.name && ent.name.toLowerCase().indexOf(patternMatchBlackListGroup[i].toLowerCase()) > -1) {
            countPatternMatchBlackListGroup++;
            return false;
        }
    }
    // Pattern match white list
    for (i = 0; i < patternMatchWhiteListGroup.length; i++){
        if (ent.name && ent.name.toLowerCase().indexOf(patternMatchWhiteListGroup[i].toLowerCase()) > -1) {
            countPatternMatchWhiteListGroup++;
            return true;
        }
    }

    // Type black list
    for (var i = 0; i < typeBlackListGroup.length; i++){
        if (ent.type && ent.type.toLowerCase() === typeBlackListGroup[i].toLowerCase()) {
            countTypeBlackListGroup++;
            return false;
        }
    }
    // Type white list
    for (i = 0; i < typeWhiteListGroup.length; i++){
        if (ent.type.toLowerCase() === typeWhiteListGroup[i].toLowerCase()) {
            countTypeWhiteListGroup++;
            return true;
        }
    }

    // Entities with Parents
    if(ent.parentID) {
        let parentID = ent.parentID;
        let parent = parentMap[parentID];
        if (!parent) {
            countNoParentInDomain++;
            // Entity has a parentID, but there is no parent in the domain so delelte it
            return false;
        }
        if (parent.position) {
            // Delete anything with a parent that is in bounds
            if (
                (parent.position.y < MAX_Y && parent.position.y > MIN_Y) &&
                (parent.position.x < MAX_X && parent.position.x > MIN_X) &&
                (parent.position.z < MAX_Z && parent.position.z > MIN_Z)
            ) {
                countParentInBound++;
                return true;
            } else {
                countParentOutBound++;
                return false;
            }
        }
    } 
    // Entities without Parents
    else if(ent.position) {
            // Delete anything with a parent that is in bounds
            if (
                (ent.position.y < MAX_Y && ent.position.y > MIN_Y) &&
                (ent.position.x < MAX_X && ent.position.x > MIN_X) &&
                (ent.position.z < MAX_Z && ent.position.z > MIN_Z)
            ) {
                countInBound++
                return true;
            } else {
                countOutBound++
                return false;
            }
    }

    // Otherwise keep the entity
    countRemainingKeeps++;
    return true;
})

// Stats
console.log("countNameBlackListGroup: ", countNameBlackListGroup);
console.log("countNameWhiteListGroup: ", countNameWhiteListGroup);
console.log("countPatternMatchBlackListGroup: ", countPatternMatchBlackListGroup);
console.log("countPatternMatchWhiteListGroup: ", countPatternMatchWhiteListGroup);
console.log("countTypeBlackListGroup: ", countTypeBlackListGroup);
console.log("countTypeWhiteListGroup: ", countTypeWhiteListGroup);
console.log("countInBound: ", countInBound);
console.log("countOutBound: ", countOutBound);
console.log("countParentInBound: ", countParentInBound);
console.log("countParentOutBound: ", countParentOutBound);
console.log("countNoParentInDomain: ", countNoParentInDomain);
console.log("countRemainingKeeps: ", countRemainingKeeps);
console.log("\nFinal ent Length: ", modelJSONEntities.length, "\n");;

// Sum of deletes
var deletes = [countOutBound, countParentOutBound, countNameBlackListGroup, countTypeBlackListGroup, countNoParentInDomain, countPatternMatchBlackListGroup].reduce( (prev, curr) => {
    return prev += curr;
}, 0);
console.log("total Deletes: ", deletes);
// Sum of Keeps
var keeps = [countInBound, countParentInBound, countNameWhiteListGroup, countTypeWhiteListGroup, countPatternMatchWhiteListGroup, countRemainingKeeps].reduce( (prev, curr) => {
    return prev += curr;
}, 0);
console.log("total Keeps: ", keeps);

// Replace the filtered entities in the models.json
modeljson.Entities = modelJSONEntities ;

// Write the new models json to disk with a new file name in case we need to run this again on the original list
let jsonToWrite = JSON.stringify(modeljson, null, 4);
fs.writeFileSync(path.join(__dirname, 'models2.json'), jsonToWrite)