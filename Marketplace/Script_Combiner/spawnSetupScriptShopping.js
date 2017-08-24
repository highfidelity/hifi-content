//
//  spawnSetupScriptShopping.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/21/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Sets up objects for script combiner
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals utils,SHOPPING_ENTITIES, TEMPLATES:true */
SHOPPING_ENTITIES = 
{
    "Entities": [
        {
            "clientOnly": 0,
            "created": "2017-08-15T18:15:58Z",
            "damping": 0.800000011920929,
            "dimensions": {
                "x": 0.1116928830742836,
                "y": 0.13345099985599518,
                "z": 0.13117514550685883
            },
            "gravity": {
                "x": 0,
                "y": -9.800000190734863,
                "z": 0
            },
            "id": "{3118bca2-e645-4589-9d09-c77083af8be7}",
            "lastEdited": 1502821105474208,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/apple.fbx",
            "name": "Apple.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.1938323974609375,
                "y": 0.571990966796875,
                "z": 0.46356201171875
            },
            "queryAACube": {
                "scale": 0.21792519092559814,
                "x": 0.08486980199813843,
                "y": 0.4630283713340759,
                "z": 0.3545994162559509
            },
            "rotation": {
                "w": 0.997589111328125,
                "x": -4.57763671875e-05,
                "y": -7.62939453125e-05,
                "z": 0.06923019886016846
            },
            "shapeType": "simple-hull",
            "type": "Model",
            "userData": "{\"grabbableKey\":{\"cloneLifetime\":300,\"cloneLimit\":0,\"cloneable\":true,\"cloneDynamic\":true},\"canReceiveScripts\":true}"
        },
        {
            "clientOnly": 0,
            "created": "2017-08-15T18:15:58Z",
            "damping": 0.800000011920929,
            "dimensions": {
                "x": 0.1116928830742836,
                "y": 0.13345099985599518,
                "z": 0.13117514550685883
            },
            "gravity": {
                "x": 0,
                "y": -9.800000190734863,
                "z": 0
            },
            "id": "{93e5906a-f2bd-4d90-94d9-c6892fd47c45}",
            "lastEdited": 1502821106721745,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Fruit-Apple-2.fbx",
            "name": "Pear.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.14319229125976562,
                "y": 0.5615234375,
                "z": 0.253570556640625
            },
            "queryAACube": {
                "scale": 0.21792519092559814,
                "x": 0.03422969579696655,
                "y": 0.4525608420372009,
                "z": 0.14460796117782593
            },
            "rotation": {
                "w": 0.99755859375,
                "x": -4.57763671875e-05,
                "y": -7.62939453125e-05,
                "z": 0.06941330432891846
            },
            "shapeType": "simple-hull",
            "type": "Model",
            "userData": "{\"grabbableKey\":{\"cloneLifetime\":300,\"cloneLimit\":0,\"cloneable\":true,\"cloneDynamic\":true},\"canReceiveScripts\":true}"
        },
        {
            "clientOnly": 0,
            "created": "2017-08-15T18:15:58Z",
            "damping": 0.800000011920929,
            "dimensions": {
                "x": 0.43931344151496887,
                "y": 0.032170284539461136,
                "z": 0.45252567529678345
            },
            "gravity": {
                "x": 0,
                "y": -9.800000190734863,
                "z": 0
            },
            "id": "{f8b7a851-91c1-4b96-989d-ceea15950354}",
            "lastEdited": 1502821108003356,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/pizza.fbx",
            "name": "Pizza.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 1.6299972534179688,
                "y": 0.5138397216796875,
                "z": 0.390655517578125
            },
            "queryAACube": {
                "scale": 0.6315146088600159,
                "x": 1.3142399787902832,
                "y": 0.19808241724967957,
                "z": 0.07489821314811707
            },
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "shapeType": "simple-hull",
            "type": "Model",
            "userData": "{\"grabbableKey\":{\"cloneLifetime\":300,\"cloneLimit\":0,\"cloneable\":true,\"cloneDynamic\":true},\"canReceiveScripts\":true}"
        },
        {
            "clientOnly": 0,
            "created": "2017-08-15T18:15:58Z",
            "damping": 0.800000011920929,
            "dimensions": {
                "x": 0.17363440990447998,
                "y": 0.24628490209579468,
                "z": 0.033839233219623566
            },
            "gravity": {
                "x": 0,
                "y": -9.800000190734863,
                "z": 0
            },
            "id": "{e9eb5e0c-a235-4291-80ff-3a478a00c959}",
            "lastEdited": 1502821101147563,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Book-F2-IA.fbx",
            "name": "Book.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 1.7183456420898438,
                "y": 0.520263671875,
                "z": 0.76019287109375
            },
            "queryAACube": {
                "scale": 0.30323299765586853,
                "x": 1.566729187965393,
                "y": 0.36864715814590454,
                "z": 0.6085763573646545
            },
            "rotation": {
                "w": -0.5684748888015747,
                "x": -0.5588311553001404,
                "y": -0.43614864349365234,
                "z": 0.4175630807876587
            },
            "shapeType": "simple-hull",
            "type": "Model",
            "userData": "{\"grabbableKey\":{\"cloneLifetime\":300,\"cloneLimit\":0,\"cloneable\":true,\"cloneDynamic\":true},\"canReceiveScripts\":true}"
        },
        {
            "clientOnly": 0,
            "collidesWith": "static,dynamic,kinematic,",
            "collisionMask": 7,
            "created": "2017-08-15T18:15:58Z",
            "damping": 0.800000011920929,
            "density": 4000,
            "dimensions": {
                "x": 0.155117467045784,
                "y": 0.3236876130104065,
                "z": 0.16309989988803864
            },
            "id": "{93875447-344a-4dfb-a8d8-ba82acfb8da0}",
            "lastEdited": 1502821026585660,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Script-Wand-4-orange.fbx?1",
            "name": "Wand_Yellow.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 1.3417816162109375,
                "y": 0.6834259033203125,
                "z": 0.1172943115234375
            },
            "queryAACube": {
                "scale": 0.394254595041275,
                "x": 1.1446542739868164,
                "y": 0.4862986207008362,
                "z": -0.07983298599720001
            },
            "restitution": 0,
            "rotation": {
                "w": -0.15623712539672852,
                "x": 0.0001373291015625,
                "y": 0.9877011775970459,
                "z": 0.0004119873046875
            },
            "script": "https://hifi-content.s3.amazonaws.com/jedon/Script_Combiner/AttachableScript.js",
            "shapeType": "box",
            "type": "Model",
            "userData": "{\"grabbableKey\":{\"cloneLifetime\":300,\"cloneLimit\":0,\"cloneable\":true,\"cloneDynamic\":true},\"scriptURL\":\"https://hifi-content.s3.amazonaws.com/jedon/Script_Combiner/Float.js\"}"
        },
        {
            "clientOnly": 0,
            "created": "2017-08-15T18:15:58Z",
            "damping": 0.800000011920929,
            "dimensions": {
                "x": 0.2725292444229126,
                "y": 0.11536315828561783,
                "z": 0.03871145099401474
            },
            "gravity": {
                "x": 0,
                "y": -9.800000190734863,
                "z": 0
            },
            "id": "{29bd56bd-c8b5-4518-ac74-bb6d0249a8e3}",
            "lastEdited": 1502821103374008,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Fish-2.fbx",
            "name": "Purple_Fish.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0,
                "y": 0.5689544677734375,
                "z": 0.66070556640625
            },
            "queryAACube": {
                "scale": 0.29846176505088806,
                "x": -0.14923088252544403,
                "y": 0.4197235703468323,
                "z": 0.5114746689796448
            },
            "rotation": {
                "w": 0.9510490894317627,
                "x": -4.57763671875e-05,
                "y": 0.30897998809814453,
                "z": -1.52587890625e-05
            },
            "shapeType": "simple-hull",
            "type": "Model",
            "userData": "{\"grabbableKey\":{\"cloneLifetime\":300,\"cloneLimit\":0,\"cloneable\":true,\"cloneDynamic\":true},\"canReceiveScripts\":true}"
        },
        {
            "clientOnly": 0,
            "collidesWith": "static,dynamic,kinematic,",
            "collisionMask": 7,
            "created": "2017-08-15T18:15:58Z",
            "damping": 0.800000011920929,
            "density": 4000,
            "dimensions": {
                "x": 0.155117467045784,
                "y": 0.30698782205581665,
                "z": 0.16309989988803864
            },
            "id": "{093d808c-7257-4119-976e-96a89e4bc30f}",
            "lastEdited": 1502821026585907,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Script-Wand-4-red.fbx?1",
            "name": "Wand_Red.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.718597412109375,
                "y": 0.67529296875,
                "z": 0.046661376953125
            },
            "queryAACube": {
                "scale": 0.38066327571868896,
                "x": 0.5282657742500305,
                "y": 0.4849613308906555,
                "z": -0.14367026090621948
            },
            "restitution": 0,
            "rotation": {
                "w": -0.11958497762680054,
                "x": 0.0003509521484375,
                "y": 0.9927977323532104,
                "z": -0.0005340576171875
            },
            "script": "https://hifi-content.s3.amazonaws.com/jedon/Script_Combiner/AttachableScript.js",
            "shapeType": "box",
            "type": "Model",
            "userData": "{\"grabbableKey\":{\"cloneLifetime\":300,\"cloneLimit\":0,\"cloneable\":true,\"cloneDynamic\":true},\"scriptURL\":\"https://hifi-content.s3.amazonaws.com/jedon/Script_Combiner/Edible.js\"}"
        },
        {
            "clientOnly": 0,
            "collidesWith": "static,dynamic,kinematic,",
            "collisionMask": 7,
            "created": "2017-08-15T18:15:58Z",
            "damping": 0.800000011920929,
            "density": 4000,
            "dimensions": {
                "x": 0.155117467045784,
                "y": 0.3025586009025574,
                "z": 0.16309989988803864
            },
            "id": "{ba2ec385-68fd-44fd-80f0-b96a834ecc30}",
            "lastEdited": 1502821026585431,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Script-Wand-4-green.fbx?1",
            "name": "Wand_Green.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 1.037841796875,
                "y": 0.673187255859375,
                "z": 0.0387420654296875
            },
            "queryAACube": {
                "scale": 0.37710040807724,
                "x": 0.8492915630340576,
                "y": 0.484637051820755,
                "z": -0.1498081386089325
            },
            "restitution": 0,
            "rotation": {
                "w": 0.028915882110595703,
                "x": 0.0004119873046875,
                "y": 0.99957275390625,
                "z": -0.0005645751953125
            },
            "script": "https://hifi-content.s3.amazonaws.com/jedon/Script_Combiner/AttachableScript.js",
            "shapeType": "box",
            "type": "Model",
            "userData": "{\"grabbableKey\":{\"cloneLifetime\":300,\"cloneLimit\":0,\"cloneable\":true,\"cloneDynamic\":true},\"scriptURL\":\"https://hifi-content.s3.amazonaws.com/jedon/Script_Combiner/Break.js\"}"
        },
        {
            "clientOnly": 0,
            "created": "2017-08-15T18:15:58Z",
            "dimensions": {
                "x": 0.28897443413734436,
                "y": 0.040592171251773834,
                "z": 0.288974404335022
            },
            "id": "{a3b1b53a-664f-4289-8848-deb521e32883}",
            "lastEdited": 1502821026586433,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Wand-Base-Float.fbx",
            "name": "Float_Podium.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 1.3385772705078125,
                "y": 0.51861572265625,
                "z": 0.101593017578125
            },
            "queryAACube": {
                "scale": 0.4106825590133667,
                "x": 1.1332359313964844,
                "y": 0.31327444314956665,
                "z": -0.10374826192855835
            },
            "rotation": {
                "w": 0.9656367301940918,
                "x": -1.52587890625e-05,
                "y": -0.25987643003463745,
                "z": -4.57763671875e-05
            },
            "shapeType": "box",
            "type": "Model"
        },
        {
            "clientOnly": 0,
            "created": "2017-08-15T18:15:58Z",
            "dimensions": {
                "x": 2.1868999004364014,
                "y": 1,
                "z": 1.0937000513076782
            },
            "id": "{78df0503-913f-42a5-8071-4af01b61288f}",
            "lastEdited": 1502821026585198,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "https://hifi-content.s3.amazonaws.com/jedon/Assets/table-semicircle.fbx",
            "name": "Table_Semicircle.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.8727035522460938,
                "y": 0,
                "z": 0.308990478515625
            },
            "queryAACube": {
                "scale": 2.6417250633239746,
                "x": -0.44815897941589355,
                "y": -1.3208625316619873,
                "z": -1.0118720531463623
            },
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "shapeType": "static-mesh",
            "type": "Model"
        },
        {
            "clientOnly": 0,
            "created": "2017-08-15T18:15:58Z",
            "dimensions": {
                "x": 0.28897443413734436,
                "y": 0.040592171251773834,
                "z": 0.288974404335022
            },
            "id": "{50a5b92e-f738-4386-bd13-c1bdf1296a7c}",
            "lastEdited": 1502821026588117,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Wand-Base-bounce.fbx",
            "name": "Bounce_Podium.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.40122222900390625,
                "y": 0.51861572265625,
                "z": 0.115203857421875
            },
            "queryAACube": {
                "scale": 0.4106825590133667,
                "x": 0.1958809494972229,
                "y": 0.31327444314956665,
                "z": -0.09013742208480835
            },
            "rotation": {
                "w": 0.9426261186599731,
                "x": -7.62939453125e-05,
                "y": 0.3337606191635132,
                "z": -1.52587890625e-05
            },
            "shapeType": "box",
            "type": "Model"
        },
        {
            "clientOnly": 0,
            "collidesWith": "static,dynamic,kinematic,",
            "collisionMask": 7,
            "created": "2017-08-15T18:15:58Z",
            "damping": 0.800000011920929,
            "density": 4000,
            "dimensions": {
                "x": 0.155117467045784,
                "y": 0.30342477560043335,
                "z": 0.16309989988803864
            },
            "id": "{67ee1eab-af81-4c94-ba64-d2c09860fb78}",
            "lastEdited": 1502821041165039,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Script-Wand-4-blue.fbx?1",
            "name": "Wand_Blue.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.40828704833984375,
                "y": 0.67962646484375,
                "z": 0.1260528564453125
            },
            "queryAACube": {
                "scale": 0.3777956962585449,
                "x": 0.2193892002105713,
                "y": 0.49072861671447754,
                "z": -0.06284499168395996
            },
            "restitution": 0,
            "rotation": {
                "w": 0.7346150875091553,
                "x": -0.0326085090637207,
                "y": 0.6773022413253784,
                "z": -0.023208975791931152
            },
            "script": "https://hifi-content.s3.amazonaws.com/jedon/Script_Combiner/AttachableScript.js",
            "shapeType": "box",
            "type": "Model",
            "userData": "{\"grabbableKey\":{\"cloneLifetime\":300,\"cloneLimit\":0,\"cloneable\":true,\"cloneDynamic\":true},\"scriptURL\":\"https://hifi-content.s3.amazonaws.com/jedon/Script_Combiner/Bounce.js\"}"
        },
        {
            "clientOnly": 0,
            "created": "2017-08-15T18:15:58Z",
            "dimensions": {
                "x": 0.28897443413734436,
                "y": 0.040592171251773834,
                "z": 0.288974404335022
            },
            "id": "{b74a4ce1-3a11-47d1-bf39-8ee1a9b9a086}",
            "lastEdited": 1502821026586162,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Wand-Base-Edible.fbx",
            "name": "Edible_Podium.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.7096138000488281,
                "y": 0.51861572265625,
                "z": 0
            },
            "queryAACube": {
                "scale": 0.4106825590133667,
                "x": 0.5042725205421448,
                "y": 0.31327444314956665,
                "z": -0.20534127950668335
            },
            "rotation": {
                "w": 0.9945067167282104,
                "x": -4.57763671875e-05,
                "y": 0.10450899600982666,
                "z": -1.52587890625e-05
            },
            "shapeType": "box",
            "type": "Model"
        },
        {
            "clientOnly": 0,
            "created": "2017-08-15T18:15:58Z",
            "dimensions": {
                "x": 0.28897443413734436,
                "y": 0.040592171251773834,
                "z": 0.288974404335022
            },
            "id": "{1c705954-f70b-4f43-a81a-fdccd22f905d}",
            "lastEdited": 1502821026587843,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Wand-Base-shatter.fbx",
            "name": "Break_Podium.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 1.0404510498046875,
                "y": 0.51861572265625,
                "z": 0
            },
            "queryAACube": {
                "scale": 0.4106825590133667,
                "x": 0.8351097702980042,
                "y": 0.31327444314956665,
                "z": -0.20534127950668335
            },
            "rotation": {
                "w": 0.9944456815719604,
                "x": -1.52587890625e-05,
                "y": -0.10502785444259644,
                "z": -4.57763671875e-05
            },
            "shapeType": "box",
            "type": "Model"
        },
        {
            "clientOnly": 0,
            "created": "2017-08-15T18:15:58Z",
            "damping": 0.800000011920929,
            "dimensions": {
                "x": 0.1287638545036316,
                "y": 0.12876379489898682,
                "z": 0.1287638545036316
            },
            "gravity": {
                "x": 0,
                "y": -9.800000190734863,
                "z": 0
            },
            "id": "{d8ed9231-eec0-4c81-8f0d-f6107109d804}",
            "lastEdited": 1502821104467522,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Glo-Block-g.fbx",
            "name": "Glow_Box.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.054141998291015625,
                "y": 0.5864105224609375,
                "z": 0.471710205078125
            },
            "queryAACube": {
                "scale": 0.22302551567554474,
                "x": -0.057370759546756744,
                "y": 0.4748977720737457,
                "z": 0.3601974546909332
            },
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "shapeType": "simple-hull",
            "type": "Model",
            "userData": "{\"grabbableKey\":{\"cloneLifetime\":300,\"cloneLimit\":0,\"cloneable\":true,\"cloneDynamic\":true},\"canReceiveScripts\":true}"
        },
        {
            "clientOnly": 0,
            "created": "2017-08-15T18:15:58Z",
            "damping": 0.800000011920929,
            "dimensions": {
                "x": 0.2725292444229126,
                "y": 0.11536315828561783,
                "z": 0.03871145099401474
            },
            "gravity": {
                "x": 0,
                "y": -9.800000190734863,
                "z": 0
            },
            "id": "{cf0749d8-621e-4ce7-b978-7c91fde3ed94}",
            "lastEdited": 1502821102349030,
            "lastEditedBy": "{01facc45-b88e-4c27-9421-e63152b9c764}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Fish-1.fbx",
            "name": "Yellow_Fish.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.08582305908203125,
                "y": 0.5689544677734375,
                "z": 0.731781005859375
            },
            "queryAACube": {
                "scale": 0.29846176505088806,
                "x": -0.06340782344341278,
                "y": 0.4197235703468323,
                "z": 0.5825501084327698
            },
            "rotation": {
                "w": 0.8910200595855713,
                "x": -7.62939453125e-05,
                "y": 0.45394062995910645,
                "z": -1.52587890625e-05
            },
            "shapeType": "simple-hull",
            "type": "Model",
            "userData": "{\"grabbableKey\":{\"cloneLifetime\":300,\"cloneLimit\":0,\"cloneable\":true,\"cloneDynamic\":true},\"canReceiveScripts\":true}"
        }
    ],
    "Version": 71
}


// Add LocalPosition to entity data if parent properties are available
var entities = SHOPPING_ENTITIES.Entities;
var entitiesByID = {};
for (var i = 0; i < entities.length; ++i) {
    var entity = entities[i];
    entitiesByID[entity.id] = entity;
}
for (var i = 0; i < entities.length; ++i) {
    var entity = entities[i];
    if (entity.parentID !== undefined) {
        var parent = entitiesByID[entity.parentID];
        if (parent !== undefined) {
            entity.localPosition = Vec3.subtract(entity.position, parent.position);
            delete entity.position;
        }
    }
}
