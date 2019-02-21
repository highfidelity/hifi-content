
var portalSphereOutline = {
    "id": "{0d747d85-9e7f-4106-bc36-b5f3f82737d7}",
    "type": "Model",
    "name": "portal-sphere-outline",
    "position": {
        "x": 0,
        "y": 0,
        "z": 0
    },
    "dimensions": {
        "x": 0.5182806849479675,
        "y": 0.5182806253433228,
        "z": 0.5182806253433228
    },
    "rotation": {
        "x": 0,
        "y": 0,
        "z": 0,
        "w": 1
    },
    "parentID": "{f8f23a06-47db-49e4-810c-9112c86c37dd}",
    "grab": {
        "grabbable": false,
        "equippableLeftRotation": {
            "x": 0,
            "y": 0,
            "z": 0,
            "w": 1
        },
        "equippableRightRotation": {
            "x": 0,
            "y": 0,
            "z": 0,
            "w": 1
        }
    },
    "damping": 0,
    "angularDamping": 0,
    "modelURL": "https://hifi-content.s3.amazonaws.com/brosche/DraftDomain/Primitives/invertedSphere.obj",
    "animation": {
        "allowTranslation": false
    }
};

var particleEffect = {
    "id": "{e01f227c-ef0c-4bb7-a61c-e7cb62e91a0a}",
    "type": "ParticleEffect",
    "lastEdited": 1550373321314107,
    "name": "portal-sphere-particle",
    "position": {
        "x": 0,
        "y": 0,
        "z": 0
    },
    "dimensions": {
        "x": 0.8999999761581421,
        "y": 0.8999999761581421,
        "z": 0.8999999761581421
    },
    "rotation": {
        "x": 0,
        "y": 0,
        "z": 0,
        "w": 1
    },
    "grab": {
        "grabbable": false,
        "equippableLeftRotation": {
            "x": 0,
            "y": 0,
            "z": 0,
            "w": 1
        },
        "equippableRightRotation": {
            "x": 0,
            "y": 0,
            "z": 0,
            "w": 1
        }
    },
    "damping": 0,
    "angularDamping": 0,
    "color": {
        "red": 0,
        "green": 77,
        "blue": 84
    },
    "alpha": 0,
    "textures": "https://hifi-content.s3.amazonaws.com/brosche/dev/portalSpheres/particle_ring_wave.png",
    "maxParticles": 100,
    "lifespan": 0.5,
    "emitRate": 300,
    "emitSpeed": 0,
    "speedSpread": 0,
    "emitOrientation": {
        "x": 0,
        "y": 0,
        "z": 0,
        "w": 1
    },
    "polarFinish": 3.1415927410125732,
    "emitAcceleration": {
        "x": 0,
        "y": 0,
        "z": 0
    },
    "particleRadius": 0.44999998807907104,
    "radiusStart": 0.44999998807907104,
    "radiusFinish": null,
    "colorStart": {
        "red": 0,
        "green": 71,
        "blue": 186
    },
    "colorFinish": {
        "red": 0,
        "green": 0,
        "blue": 0
    },
    "alphaStart": 1,
    "alphaFinish": 0,
    "emitterShouldTrail": true,
    "spinStart": 0,
    "spinFinish": 0
};

var portalSphereOutlineMaterial = {
    "type": "Material",
    "name": "portal-sphere-outline",
    "position": {
        "x": 0,
        "y": 0,
        "z": 0
    },
    "rotation": {
        "x": 0,
        "y": 0,
        "z": 0,
        "w": 1
    },
    "parentID": "{0d747d85-9e7f-4106-bc36-b5f3f82737d7}",
    "grab": {
        "equippableLeftRotation": {
            "x": 0,
            "y": 0,
            "z": 0,
            "w": 1
        },
        "equippableRightRotation": {
            "x": 0,
            "y": 0,
            "z": 0,
            "w": 1
        }
    },
    "damping": 0,
    "angularDamping": 0,
    "materialURL": "materialData",
    "priority": 1,
    "materialData": "{\"materials\":{\"unlit\":false,\"opacity\":0.5,\"albedo\":[0,1,1],\"emissive\":[0,1,1]}}"
};

var portalSphereMaterial = {
    "id": "{f665cb8c-dba6-45b8-8086-17d567a2740a}",
    "type": "Material",
    "name": "portal-sphere",
    "parentID": "{f8f23a06-47db-49e4-810c-9112c86c37dd}",
    "position": {
        "x": 0,
        "y": 0,
        "z": 0
    },
    "rotation": {
        "x": 0,
        "y": 0,
        "z": 0,
        "w": 1
    },
    "grab": {
        "equippableLeftRotation": {
            "x": 0,
            "y": 0,
            "z": 0,
            "w": 1
        },
        "equippableRightRotation": {
            "x": 0,
            "y": 0,
            "z": 0,
            "w": 1
        }
    },
    "damping": 0,
    "angularDamping": 0,
    "materialURL": "materialData",
    "priority": 1,
    "materialData": "{\"materials\":{\"metallic\":1,\"roughness\":0.5,\"albedoMap\":\"https://hifi-content.s3.amazonaws.com/brosche/panoamas/tethys-lab.jpg?v2\",\"emissiveMap\":\"https://hifi-content.s3.amazonaws.com/brosche/panoamas/tethys-lab.jpg?v2\"}}"
};

var portalSphere = {
    "id": "{f8f23a06-47db-49e4-810c-9112c86c37dd}",
    "type": "Model",
    "name": "portal-sphere",
    "userData": "{\"grabbableKey\":{\"cloneAvatarEntity\":true,\"cloneDynamic\":true,\"cloneLifetime\":30,\"cloneLimit\":0,\"cloneable\":true},\"location\":\"capecobalt/401.5,-76,382\",\"imageURL\":\"https://hifi-content.s3.amazonaws.com/brosche/panoamas/tethys-lab.jpg?v2\"}",
    "dimensions": {
        "x": 0.5038086771965027,
        "y": 0.5038085579872131,
        "z": 0.5038085579872131
    },
    "rotation": {
        "x": 0.0009102229378186166,
        "y": 0.05991186574101448,
        "z": 0.05309351161122322,
        "w": 0.9967591166496277
    },
    "grab": {
        "equippableLeftRotation": {
            "x": 0,
            "y": 0,
            "z": 0,
            "w": 1
        },
        "equippableRightRotation": {
            "x": 0,
            "y": 0,
            "z": 0,
            "w": 1
        }
    },
    "damping": 0,
    "angularDamping": 1,
    "restitution": 0.9900000095367432,
    "friction": 0.30000001192092896,
    "dynamic": true,
    "collisionsWillMove": true,
    "cloneable": true,
    "cloneLifetime": 30,
    "cloneLimit": 1,
    "cloneDynamic": true,
    "cloneAvatarEntity": true,
    "scriptTimestamp": 1550088203408,
    "shapeType": "sphere",
    "modelURL": "https://hifi-content.s3.amazonaws.com/brosche/DraftDomain/Primitives/invertedSphere.obj",
    "animation": {
        "allowTranslation": false
    }
};

module.exports = {
    portalSphereOutline: portalSphereOutline,
    particleEffect: particleEffect,
    portalSphereOutlineMaterial: portalSphereOutlineMaterial,
    portalSphereMaterial: portalSphereMaterial,
    portalSphere: portalSphere
};