// Happy Boombox
// boomBoxEntityScript.js
// Licensed under the Apache 2.0 License
// Music provided by Bensound
/* globals EventBridge */
(function(){
    var RETRY_SEND_INFO = 1000; // ms
    var MAX_ATTEMPTS = 10;
    var EMPTY = -1;

    var attempts = 0;
    var boomboxID;
    var songList;
    var boomboxUserData;

    var tablet;
    var controllerApp = Script.resolvePath("app/boomBoxController.html");

    var tabletAppIsSetup = false;
    var tabletListener = EMPTY;
    var tabletPageChangedListener = EMPTY;
    
    /**
     * onWebEventReceived()
     * This function is connected to our HTML page. When the user clicks on a button or changes
     * the volume slider, the page will emit a webEvent in the form of stringified JSON. We parse
     * the message and filter on the message type.
     * 
     * The first message type, 'confirmSongList', is used when the tablet app has successfully gotten the 
     * information needed to set up the page with the song list. We then mark our tablet app as being
     * finished with setup so we no longer emit the setup message.
     * 
     * The second message type, 'playSong', notes what song the user has selected (or, in the case of ending 
     * the music, the word 'stop') and calls the appropriate entity server method for playing or stopping the selected
     * song.
     * 
     * The third message type, 'adjustVolume', is like the 'playSong' message and calls the entity server method
     * to change the volume on the userdata. This allows the boombox to work in the event of an entity edit filter regardless
     * of the client permissions of the user.
     * 
     * @param {string} message 
     */
    function onWebEventReceived(message) {
        message = JSON.parse(message);
        if (message.type === 'confirmSongList') {
            tabletAppIsSetup = true;
        }
        if (message.type === 'playSong') {
            if (message.song === "stop") {
                Entities.callEntityServerMethod(boomboxID, 'stopMusic');
            } else {
                var position = Entities.getEntityProperties(boomboxID, 'position').position;
                Entities.callEntityServerMethod(boomboxID, 'playMusic', [message.song, position]);
            }
        }
        if (message.type === 'adjustVolume') {
            Entities.callEntityServerMethod(boomboxID, 'adjustVolume', [message.volume]);
        }
    }

    /**
     * onTabletPageChanged()
     * We connect this message to the signal that our tablet or HUD interface sends us when the page
     * a user is looking at changes. When this changes, the tablet app loses it's set up status and
     * resets the attempt counter for starting the setup process. When the user switches to a page
     * that isn't the controller for the music player, we disconnect our events and set everything back
     * to a blank state for next time.
     * @param {string} type 
     * @param {string} url 
     */
    function onTabletPageChanged(type, url) {
        if (url !== controllerApp) {
            tablet.webEventReceived.disconnect(onWebEventReceived);
            tablet.screenChanged.disconnect(onTabletPageChanged);
            tabletListener = EMPTY;
            tabletPageChangedListener = EMPTY;
        }
        tabletAppIsSetup = false;
        attempts = 0;
    }

    /**
     * getVolume() is a helper function to return the current volume as set in the userdata of the boombox.
     */
    function getVolume() {
        return JSON.parse(Entities.getEntityProperties(boomboxID, 'userData').userData).volume;
    }

    /**
     * emitData()
     * This function sends the information about the available songs and the current volume of the
     * music player to the HTML page so that it can display the song names and volume to the user.
     */
    function emitData() {
        if (!tabletAppIsSetup && attempts < MAX_ATTEMPTS) {
            attempts++;
            tablet.emitScriptEvent(JSON.stringify({
                'type' : 'updateSongList',
                'songList': songList,
                'volume' : getVolume()
            }));
            Script.setTimeout(emitData, RETRY_SEND_INFO);
        }
    }

    /**
     * setupApplicationInformation() 
     * This function opens up the tablet / HUD UI to the HTML controller page for the music player. 
     * If it is the first time that the boombox controller has been opened, it connects the onWebEventReceived
     * and the onTabletPageChanged functions to their appropriate signals. The function then gets the most recent
     * version of the song list and emits that information to the HTML page for setup.
     */
    function setupApplicationInformation() {
        tablet.gotoWebScreen(controllerApp);
        if (tabletListener === EMPTY) {
            tabletListener = tablet.webEventReceived.connect(onWebEventReceived);
        }
        if (tabletPageChangedListener === EMPTY) {
            tabletPageChangedListener = tablet.screenChanged.connect(onTabletPageChanged);
        }
        boomboxUserData = Entities.getEntityProperties(boomboxID, 'userData').userData;
        songList = JSON.parse(boomboxUserData).music;
        emitData();
    }

    /**
     * preload()
     * The preload function is called when a client begins running the entity script, often when it first "sees" the entity.
     * This will re-run if the user reloads all of their scripts or refreshes their content.
     * For our boombox, on preload, we store references to the user's tablet and the boombox entity.
     * @param {UUID} entityID 
     */
    this.preload = function(entityID) {
        tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
        boomboxID = Entities.getEntityProperties(entityID, 'parentID').parentID;
    };
    /**
     * clickDownOnEntity() 
     * When a user clicks on the button with the right or left mouse button, we open up the controller window.
     */
    this.clickDownOnEntity = function() {
        setupApplicationInformation();
    };

    /**
     * stopNearTrigger()
     * When a user in HMD mode triggers on the button, we open up the controller window.
     */
    this.stopNearTrigger = function() {
        setupApplicationInformation();
    };
});