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
SHOPPING_ENTITIES = {
    "Entities": [
        {
            "clientOnly": 0,
            "created": "2017-08-28T18:56:44Z",
            "damping": 0.30000001192092896,
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
            "id": "{8bb08818-19d9-4d1e-8bcf-7f29eb783af7}",
            "lastEdited": 1503946747545204,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/apple.fbx",
            "name": "Apple.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.1938323974609375,
                "y": 0.571990966796875,
                "z": 0.4635617733001709
            },
            "queryAACube": {
                "scale": 0.21792519092559814,
                "x": 0.08486980199813843,
                "y": 0.4630283713340759,
                "z": 0.3545991778373718
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
            "created": "2017-08-28T18:56:44Z",
            "damping": 0.30000001192092896,
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
            "id": "{828d4200-352f-4593-a0f5-e05faed3718e}",
            "lastEdited": 1503946753540459,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Fruit-Apple-2.fbx",
            "name": "Pear.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.14319229125976562,
                "y": 0.5615234375,
                "z": 0.2535703182220459
            },
            "queryAACube": {
                "scale": 0.21792519092559814,
                "x": 0.03422969579696655,
                "y": 0.4525608420372009,
                "z": 0.14460772275924683
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
            "created": "2017-08-28T18:56:44Z",
            "damping": 0.30000001192092896,
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
            "id": "{30328b37-f7a3-4ff3-901c-33edb95c55f2}",
            "lastEdited": 1503946736272481,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Book-F2-IA.fbx",
            "name": "Book.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 1.7183456420898438,
                "y": 0.520263671875,
                "z": 0.7601926326751709
            },
            "queryAACube": {
                "scale": 0.30323299765586853,
                "x": 1.566729187965393,
                "y": 0.36864715814590454,
                "z": 0.6085761189460754
            },
            "rotation": {
                "w": -0.5684748888015747,
                "x": -0.5588311553001404,
                "y": -0.43614864349365234,
                "z": 0.4175020456314087
            },
            "shapeType": "simple-hull",
            "type": "Model",
            "userData": "{\"grabbableKey\":{\"cloneLifetime\":300,\"cloneLimit\":0,\"cloneable\":true,\"cloneDynamic\":true},\"canReceiveScripts\":true}"
        },
        {
            "clientOnly": 0,
            "created": "2017-08-28T18:56:44Z",
            "damping": 0.30000001192092896,
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
            "id": "{9af85b01-9415-403d-84ab-84b434f3f417}",
            "lastEdited": 1503946742590861,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/pizza.fbx",
            "name": "Pizza.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 1.6299972534179688,
                "y": 0.5138397216796875,
                "z": 0.3906552791595459
            },
            "queryAACube": {
                "scale": 0.6315146088600159,
                "x": 1.3142399787902832,
                "y": 0.19808241724967957,
                "z": 0.07489797472953796
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
            "collidesWith": "static,dynamic,kinematic,",
            "collisionMask": 7,
            "created": "2017-08-28T18:56:44Z",
            "damping": 0.800000011920929,
            "density": 4000,
            "dimensions": {
                "x": 0.155117467045784,
                "y": 0.30698782205581665,
                "z": 0.16309989988803864
            },
            "id": "{d37bdbc8-1df9-4537-828d-a3746b121863}",
            "lastEdited": 1503946528225810,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
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
                "w": -0.11964601278305054,
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
            "created": "2017-08-28T18:56:44Z",
            "dimensions": {
                "x": 0.28897443413734436,
                "y": 0.040592171251773834,
                "z": 0.288974404335022
            },
            "id": "{4a9d2151-3941-48e9-8f74-f19f1a296f91}",
            "lastEdited": 1503946528226840,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
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
            "created": "2017-08-28T18:56:44Z",
            "damping": 0.30000001192092896,
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
            "id": "{b9212619-618f-4fbb-8ce7-695fee7a11d8}",
            "lastEdited": 1503946762366466,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Fish-1.fbx",
            "name": "Yellow_Fish.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.08582305908203125,
                "y": 0.5689544677734375,
                "z": 0.7317807674407959
            },
            "queryAACube": {
                "scale": 0.29846176505088806,
                "x": -0.06340782344341278,
                "y": 0.4197235703468323,
                "z": 0.5825498700141907
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
        },
        {
            "clientOnly": 0,
            "created": "2017-08-28T18:56:44Z",
            "dimensions": {
                "x": 0.28897443413734436,
                "y": 0.040592171251773834,
                "z": 0.288974404335022
            },
            "id": "{e53c0e82-4ee6-4ed6-8929-c12678609333}",
            "lastEdited": 1503946528227212,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
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
            "collidesWith": "static,dynamic,kinematic,",
            "collisionMask": 7,
            "created": "2017-08-28T18:56:44Z",
            "damping": 0.800000011920929,
            "density": 4000,
            "dimensions": {
                "x": 0.155117467045784,
                "y": 0.3025586009025574,
                "z": 0.16309989988803864
            },
            "id": "{818a9325-d992-4e00-8308-464cb8310eca}",
            "lastEdited": 1503946528226125,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
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
            "created": "2017-08-28T18:56:44Z",
            "dimensions": {
                "x": 0.28897443413734436,
                "y": 0.040592171251773834,
                "z": 0.288974404335022
            },
            "id": "{8e32735e-6457-4a67-9816-823a6af90c2a}",
            "lastEdited": 1503946528226417,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
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
                "w": 0.9656062126159668,
                "x": -1.52587890625e-05,
                "y": -0.25990694761276245,
                "z": -4.57763671875e-05
            },
            "shapeType": "box",
            "type": "Model"
        },
        {
            "clientOnly": 0,
            "collidesWith": "static,dynamic,kinematic,",
            "collisionMask": 7,
            "created": "2017-08-28T18:56:44Z",
            "damping": 0.800000011920929,
            "density": 4000,
            "dimensions": {
                "x": 0.155117467045784,
                "y": 0.3236876130104065,
                "z": 0.16309989988803864
            },
            "id": "{279901ed-946d-4381-ac6d-eaa3e3c62372}",
            "lastEdited": 1503946528225237,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
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
                "w": -0.15629816055297852,
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
            "collidesWith": "static,dynamic,kinematic,",
            "collisionMask": 7,
            "created": "2017-08-28T18:56:44Z",
            "damping": 0.800000011920929,
            "density": 4000,
            "dimensions": {
                "x": 0.155117467045784,
                "y": 0.30342477560043335,
                "z": 0.16309989988803864
            },
            "id": "{721fd761-6756-46ac-9751-6d1248fb33b7}",
            "lastEdited": 1503946528227033,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
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
            "created": "2017-08-28T18:56:44Z",
            "damping": 0.30000001192092896,
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
            "id": "{ef448291-4981-4052-912d-e5bc5a0fa6c6}",
            "lastEdited": 1503946772030146,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Fish-2.fbx",
            "name": "Purple_Fish.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0,
                "y": 0.5689544677734375,
                "z": 0.6607053279876709
            },
            "queryAACube": {
                "scale": 0.29846176505088806,
                "x": -0.14923088252544403,
                "y": 0.4197235703468323,
                "z": 0.5114744305610657
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
            "created": "2017-08-28T18:56:44Z",
            "dimensions": {
                "x": 0.28897443413734436,
                "y": 0.040592171251773834,
                "z": 0.288974404335022
            },
            "id": "{adb38f5b-d9ee-4c5a-821e-540258889fad}",
            "lastEdited": 1503946528227384,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
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
                "y": -0.10508888959884644,
                "z": -4.57763671875e-05
            },
            "shapeType": "box",
            "type": "Model"
        },
        {
            "clientOnly": 0,
            "created": "2017-08-28T18:56:44Z",
            "damping": 0.30000001192092896,
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
            "id": "{61315379-a4a9-43d6-a46f-60a8d6548565}",
            "lastEdited": 1503946757780974,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
            "modelURL": "http://hifi-content.s3.amazonaws.com/alan/dev/Glo-Block-g.fbx",
            "name": "Glow_Box.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.054141998291015625,
                "y": 0.5864105224609375,
                "z": 0.4717099666595459
            },
            "queryAACube": {
                "scale": 0.22302551567554474,
                "x": -0.057370759546756744,
                "y": 0.4748977720737457,
                "z": 0.3601972162723541
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
            "created": "2017-08-28T18:56:44Z",
            "dimensions": {
                "x": 2.1868999004364014,
                "y": 1,
                "z": 1.0937000513076782
            },
            "id": "{20e66f3d-491b-475f-a405-10ab9072912a}",
            "lastEdited": 1503946528226619,
            "lastEditedBy": "{02f99d30-1090-440e-bf35-7384f10723be}",
            "modelURL": "https://hifi-content.s3.amazonaws.com/jedon/Assets/table-semicircle.fbx",
            "name": "Table_Semicircle.fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.8727035522460938,
                "y": 0,
                "z": 0.3089902400970459
            },
            "queryAACube": {
                "scale": 2.6417250633239746,
                "x": -0.44815897941589355,
                "y": -1.3208625316619873,
                "z": -1.0118722915649414
            },
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "shapeType": "static-mesh",
            "type": "Model"
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
