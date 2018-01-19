

Script.include('utils.js');
Script.include('whiteboardEntities.js');

const WHITEBOARD_FWD_OFFSET = 4;
const WHITEBOARD_UP_OFFSET = 1.15;

TEMPLATES = WHITEBOARD_ENTITIES.Entities;

// Spawn an entity from a template.
//
// The overrides can be used to override or add properties in the template. For instance,
// it's common to override the `position` property so that you can set the position
// of the entity to be spawned.
//
// @param {string} templateName The name of the template to spawn
// @param {object} overrides An object containing properties that will override
//                           any properties set in the template.
function spawnTemplate(templateName, overrides) {
    var template = getTemplate(templateName);
    if (template === null) {
        print("ERROR, unknown template name:", templateName);
        return null;
    }
    print("Spawning: ", templateName);
    var properties = mergeObjects(template, overrides);
    return Entities.addEntity(properties);
}

function spawnTemplates(templateName, overrides) {
    var templates = getTemplates(templateName);
    if (template.length === 0) {
        print("ERROR, unknown template name:", templateName);
        return [];
    }

    var spawnedEntities = [];
    for (var i = 0; i < templates.length; ++i) {
        print("Spawning: ", templateName);
        var properties = mergeObjects(templates[i], overrides);
        spawnedEntities.push(Entities.addEntity(properties));
    }
    return spawnedEntities;
}

// TEMPLATES contains a dictionary of different named entity templates. An entity
// template is just a list of properties.
//
// @param name Name of the template to get
// @return {object} The matching template, or null if not found
function getTemplate(name) {
    for (var i = 0; i < TEMPLATES.length; ++i) {
        if (TEMPLATES[i].name === name) {
            return TEMPLATES[i];
        }
    }
    return null;
}
function getTemplates(name) {
    var templates = [];
    for (var i = 0; i < TEMPLATES.length; ++i) {
        if (TEMPLATES[i].name === name) {
            templates.push(TEMPLATES[i]);
        }
    }
    return templates;
}

// Cleanup Whiteboard template data
for (var i = 0; i < TEMPLATES.length; ++i) {
    var template = TEMPLATES[i];

    // Fixup model url
    if (template.type === "Model") {
        var urlParts = template.modelURL.split("/");
        var filename = urlParts[urlParts.length - 1];
        var newURL = Script.resolvePath("models/" + filename);
        print("Updated url", template.modelURL, "to", newURL);
        template.modelURL = newURL;
    }
}

var entityIDs = [];

var whiteboardFrameID = null;
var drawingSurfaceID = null;
var blueMarkerID = null;
var eraserID = null;
var resetButtonID = null;
var resetButtonSensorID = null;

function createWhiteboard() {
    var rootPosition = utils.findSurfaceBelowPosition(MyAvatar.position);
    rootPosition = Vec3.sum(
        rootPosition, 
        Vec3.multiply(
            WHITEBOARD_UP_OFFSET, 
            Quat.getUp(MyAvatar.orientation)
        )
    );
    rootPosition = Vec3.sum(
        rootPosition, 
        Vec3.multiply(
            WHITEBOARD_FWD_OFFSET, 
            Quat.getFront(MyAvatar.orientation)
        )
    );
	// Spawn Whiteboard Frame
	whiteboardFrameID = spawnTemplate("Whiteboard", {
        position: rootPosition,
        compoundShapeURL: Script.resolvePath("models/whiteBoard_collider.obj"),
        script: Script.resolvePath("whiteboard.js"),
        serverScripts: Script.resolvePath("whiteboardManagerServer.js")
    });
    entityIDs.push(whiteboardFrameID);

    // Spawn drawing surface
    
    drawingSurfaceID = spawnTemplate("Whiteboard - Drawing Surface", {
    	parentID: whiteboardFrameID
    });
    entityIDs.push(drawingSurfaceID);
    
    // Spawn blue marker
    
    blueMarkerID = spawnTemplate("hifi_model_marker_blue", {
        parentID: whiteboardFrameID,
        script: Script.resolvePath("whiteboardToolAttacher_NoHandControllerGrab.js"),
        userData: JSON.stringify({
        	grabbableKey: {
                wantsTrigger: true
            },
            triggerHotspots: {
            	position: {
            		x: 0,
            		y: 0,
            		z: 0
            	},
            	radius: 0.15,
            	modelURL: Script.resolvePath("models/marker-blue.fbx"),
            	modelScale: {
            		x: 0.16,
            		y: 0.16,
            		z: 0.8
            	}
            },
            type: "marker",
            markerColor: {
        		red: 0,
        		green: 13,
        		blue: 255
        	}
        })
    });

    entityIDs.push(blueMarkerID);

    // Spawn eraser
    
    eraserID = spawnTemplate("hifi_model_whiteboardEraser", {
        parentID: whiteboardFrameID,
        script: Script.resolvePath("whiteboardToolAttacher_NoHandControllerGrab.js"),
        userData: JSON.stringify({
        	grabbableKey: {
                wantsTrigger: true
            },
            triggerHotspots: {
            	position: {
            		x: 0,
            		y: 0,
            		z: 0
            	},
            	radius: 0.15,
            	modelURL: Script.resolvePath("models/eraser-2.fbx"),
            	modelScale: {
            		x: 0.4,
            		y: 0.4,
            		z: 0.8
            	}
            },
            type: "eraser"
        })
    });

    entityIDs.push(eraserID);
    
    // Spawn Reset Button
    resetButtonID = spawnTemplate("Whiteboard - Reset Button", {
    	parentID: whiteboardFrameID
    });
    entityIDs.push(resetButtonID);

    // Spawn reset nutton sensor
    
    resetButtonSensorID = spawnTemplate("Whiteboard - Reset Button Sensor", {
    	parentID: resetButtonID,
    	script: Script.resolvePath("resetWhiteBoard.js")
    });
    entityIDs.push(resetButtonSensorID);

};

createWhiteboard();
//Script.stop();