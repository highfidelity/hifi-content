const fs = require('fs');
const path = require('path');
const modeljson = require('./models.json');
const MIN_Y = -50;
const MAX_Y = 90;
const MIN_X = -170;
const MAX_X = 180;
const MIN_Z = -127;
const MAX_Z = 60;

let ents = modeljson.Entities;

console.log("ents1", ents.length);
var count4 = 0;

// Map the parent
let parentMap = {};
ents.forEach(function(ent){
    parentMap[ent.id] = ent;
})
let count = 0;
let countInBound = 0;
let countOutBound = 0;
let countParentInBound = 0;
let countParentOutBound = 0;
let countDeleteGroup = 0;
let countTempGroup = 0;
let countNoParentInDomain = 0;
var deleteGroup = [
    'Glass Piece',
    'Gun Material',
    "Plate Piece",
    "Space Shot",
    "Plate",
    "Space Juice Primitive",
    "Space Juice CC-BY Jarlan Perez"
];

ents = ents.filter( ent => {
    var shouldDelete = false;
    // Delete anything in the group that are pieces not from a spawner
    deleteGroup.forEach(function(entity){
        if (ent.name === entity) {
            shouldDelete = true;
        }
    });

    if (shouldDelete) {
        countDeleteGroup++;
        return false;
    };

    if (ent.name && ent.name.toLowerCase().indexOf('temp') > -1) {
        countTempGroup++;
        return false;
    }    
    if(ent.parentID) {
        let parentID = ent.parentID;
        let parent = parentMap[parentID];
        if (!parent) {
            countNoParentInDomain++;
            // Entity has a parentID, but there is no parent in the domain so delelte it
            return false;
        }
        if (parent.position) {
            // Delete anything with a parent but the parent is out of bounds 
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
    } else if(ent.position) {
            if (
                (ent.position.y < MAX_Y && ent.position.y > MIN_Y) &&
                (ent.position.x < MAX_X && ent.position.x > MIN_X) &&
                (ent.position.z < MAX_Z && ent.position.z > MIN_Z)) {
                    countInBound++
                    return true;
            } else {
                countOutBound++
                return false;
            }
    }
    console.log("Made it here")
    console.log(ent.name)
    return true;
})
console.log("countInBound", countInBound)
console.log("countOutBound", countOutBound)
console.log("countParentInBound", countParentInBound)
console.log("countParentOutBound", countParentOutBound)
console.log("countDeleteGroup", countDeleteGroup)
console.log("countNoParentInDomain", countNoParentInDomain)
console.log("countTempGroup", countTempGroup)
console.log("ents2", ents.length);
// ents.forEach(function(ent){
//     console.log(ent.name);
// })

modeljson.Entities = ents;

let jsonToWrite = JSON.stringify(modeljson, null, 4);
fs.writeFileSync(path.join(__dirname, 'models2.json'), jsonToWrite)

// {f7cabed3-a6b8-4b48-b64d-c658868fd3e1}