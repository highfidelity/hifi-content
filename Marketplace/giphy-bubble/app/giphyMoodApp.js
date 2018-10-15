/* globals EventBridge */
(function () {
    var GIPHY_BASE_URL = "https://api.giphy.com/v1/gifs/";
    var GIPHY_API_KEY = " "; // You will need to supply your own key

    var OFFSET_VALUE = 25;

    var req = Script.require('./utils/request.js');

    var APP_NAME = "#MOOD";
    var APP_URL = Script.resolvePath("./giphyMoodApp.html");
    var ICON_ACTIVE = Script.resolvePath('./resources/thought-open.png');
    var ICON_INACTIVE = Script.resolvePath('./resources/thought-closed.png');

    var giphyMoodWebEntityID = -1;
    var giphyMoodThoughtBubble = -1;

    var EMPTY_ID = -1;

    // Tablet app specific code

    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var isOpen = false;
  
    var button = tablet.addButton({
        text: APP_NAME, 
        icon: ICON_INACTIVE,
        activeIcon: ICON_ACTIVE
    });

    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);
    Entities.deletingEntity.connect(checkForDeletedEntities);

    Script.scriptEnding.connect(function() {
        button.clicked.disconnect(onClicked);
        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
        Entities.deletingEntity.disconnect(checkForDeletedEntities);
        tablet.removeButton(button);
        Entities.deleteEntity(giphyMoodThoughtBubble);
        Entities.deletedEntityID(giphyMoodWebEntityID);
    });

    function onClicked() {
        if (isOpen) {
            tablet.gotoHomeScreen();
        } else {
            tablet.gotoWebScreen(APP_URL);
        }
    }

    function onScreenChanged(type, url) {
        isOpen = (url === APP_URL);
        button.editProperties({ isActive: isOpen });
        if (isOpen) {
            setup();
        }
    }

    // App Logic
    var requestGifAndUpdateSign = function(rating, mood){
        hideBubble();
        var randomOffset = Math.round(Math.random() * OFFSET_VALUE);
        var getGifReq = GIPHY_BASE_URL + "search?api_key=" + GIPHY_API_KEY + "&q=" + 
        mood + "&limit=1&offset=" + randomOffset + "&rating=" + rating + "&lang=en";  

        req.request(getGifReq, function(error, response) {
            var newURL = response.data[0].embed_url;
            Entities.editEntity(giphyMoodWebEntityID, { sourceUrl : newURL});
            tablet.emitScriptEvent(response.data[0].images.fixed_height_downsampled.url);
        });
    };

    var requestRandomGif = function() {
        hideBubble();
        var getGifReq = GIPHY_BASE_URL + "random?api_key=" + GIPHY_API_KEY + "&tag=&rating=PG";
        req.request(getGifReq, function(error, response) {
            // Ultimately, do this on the server entity script
            var newURL = response.data.image_original_url;
            Entities.editEntity(giphyMoodWebEntityID, { sourceUrl : newURL});
            tablet.emitScriptEvent(response.data.fixed_height_downsampled_url);
        });

    };

    function createNewThoughtBubble() {
        giphyMoodThoughtBubble = Entities.addEntity({
            "clientOnly": 1,
            "dimensions": {
                "x": 0.11244157701730728,
                "y": 1.1516592502593994,
                "z": 1.2351282835006714
            },
            "id": "{9d900dff-901b-4b3f-b2f2-0655dbd0ec95}",
            "modelURL": Script.resolvePath('./resources/ThoughtBubble.fbx'),
            "name": "ThoughtBubble-Giphy",
            "parentID": MyAvatar.sessionUUID,
            "parentJointIndex": MyAvatar.getJointIndex("Head"),
            "position" : MyAvatar.getJointPosition("HeadTop_End"),
            "localPosition": {
                "x": 0.807220458984375,
                "y": 0.8286701202392578,
                "z": -0.188949584960
            },
            "queryAACube": {
                "scale": 5.248152732849121,
                "x": -1.4032782316207886,
                "y": -11.526137351989746,
                "z": -2.0149528980255127
            },
            "localRotation": {
                "w": -0.6794636845588684,
                "x": 0.11407923698425293,
                "y": -0.7147857546806335,
                "z": 0.11998607218265533
            },
            "type": "Model", 
            "visible" : false
        }, true);
    }

    function createNewWebEntity() {
        giphyMoodWebEntityID = Entities.addEntity({
            "clientOnly": 1,
            "collidesWith": "",
            "collisionMask": 0,
            "dimensions": {
                "x": 0.9472649097442627,
                "y": 0.5328364968299866,
                "z": 0.009999999776482582
            },
            "id": "{a5a315aa-8169-4767-b66f-ffb27d25a54a}",
            "name" : "WebEntity-Giphy",
            "parentID": MyAvatar.sessionUUID, 
            "parentJointIndex" : MyAvatar.getJointIndex("Head"),
            "position" : MyAvatar.getJointPosition("HeadTop_End"),
            "localPosition": {
                "x":0.8114402294158936,
                "y":0.9220905303955078,
                "z":-0.10172748565673828
            },
            "queryAACube": {
                "scale": 3.2606639862060547,
                "x": -0.30625295639038086,
                "y": -10.532992362976074,
                "z": -1.059478998184204
            },
            "localRotation": {
                "x":-0.004176754504442215,
                "y":-0.9858834147453308,
                "z":0.1655092090368271,
                "w":0.024976519867777824
            },
            "sourceUrl": "http://giphy.com",
            "type": "Web",
            "userData": "{\"grabbableKey\":{\"grabbable\":false}}",
            "visible" : false
        }, true);
    }

    function setup() {
        if (giphyMoodThoughtBubble === EMPTY_ID) {
            createNewThoughtBubble();
        } 
        if (giphyMoodWebEntityID === EMPTY_ID) {
            createNewWebEntity();
        }
        hideBubble();        
    }

    function checkForDeletedEntities(deletedEntityID) {
        if (deletedEntityID == giphyMoodThoughtBubble) {
            giphyMoodThoughtBubble = EMPTY_ID;
        } 
        if (deletedEntityID == giphyMoodWebEntityID) {
            giphyMoodWebEntityID = EMPTY_ID;
        }
    }

    function hideBubble() {
        Entities.editEntity(giphyMoodThoughtBubble, {'visible' : false});
        Entities.editEntity(giphyMoodWebEntityID, {'visible' : false});
    }

    function showBubble() {
        Entities.editEntity(giphyMoodThoughtBubble, {'visible' : true});
        Entities.editEntity(giphyMoodWebEntityID, {'visible' : true});
    }
	
    function onWebEventReceived(event) {
        var data = JSON.parse(event);
        if (data.event === "requestGIFMood") {
            requestGifAndUpdateSign(data.rating, data.mood);
        } else if (data.event === "requestRandomGIF") {
            requestRandomGif();
        } else if (data.event === "requestCustomGif") {
            requestGifAndUpdateSign('PG', data.mood);
        } else if (data.event === 'showGif') {
            showBubble();
        } else if (data.event === "hideGif") {
            hideBubble();
        }
    }
}());