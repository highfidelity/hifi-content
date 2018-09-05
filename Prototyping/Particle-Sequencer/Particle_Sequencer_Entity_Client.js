(function(){
    /* eslint-disable indent */
    // ENTITY CONSTS
    // ////////////////////////////////////////////////////////////////////////
        var 
            // HOOKS
            // ////////////////////////////////////////////////////////////
                CLICK_DOWN = "clickDownOnEntity",
                CLICK_RELEASE = "clickReleaseOnEntity",
                CLICK_HOLD = "holdingClickOnEntity",
                MOUSE_MOVE = "mouseMoveOnEntity",
                MOUSE_PRESS = "mousePressOnEntity",
                MOUSE_RELEASE = "mouseReleaseOnEntity",
                MOUSE_DOUBLE_PRESS_OFF = "mouseDoublePressOffEntity",
                HOVER_ENTER = "hoverEnterEntity",
                HOVER_LEAVE = "hoverLeaveEntity",
                HOVER_OVER = "hoverOverEntity",
                WEB_EVENT = "webEventReceived",
                LEAVE = "leaveEntity",
                ENTER = "enterEntity",
                COLLISION = "collisionWithEntity",
                START_TRIGGER = "startTrigger",
                STOP_TRIGGER = "stopTrigger",
                START_FAR_TRIGGER = "startFarTrigger",
                CONTINUE_FAR_TRIGGER = "continueFarTrigger",
                STOP_FAR_TRIGGER = "stopFarTrigger",
                START_NEAR_TRIGGER = "startNearTrigger",
                CONTINUE_NEAR_TRIGGER = "continueNearTrigger",
                STOP_NEAR_TRIGGER = "stopNearTrigger",
                START_DISTANCE_GRAB = "startDistanceGrab",
                CONTINUE_DISTANCE_GRAB = "continueDistanceGrab",
                START_NEAR_GRAB = "startNearGrab",
                CONTINUE_NEAR_GRAB = "continueNearGrab",
                RELEASE_GRAB = "releaseGrab",
                START_EQUIP = "startEquip",
                CONTINUE_EQUIP = "continueEquip",
                RELEASE_EQUIP = "releaseEquip",
        ;

        var nameMap = {
            CLICK_DOWN: "clickDownOnEntity",
            CLICK_RELEASE: "clickReleaseOnEntity",
            CLICK_HOLD: "holdingClickOnEntity",
            MOUSE_MOVE: "mouseMoveOnEntity",
            MOUSE_PRESS: "mousePressOnEntity",
            MOUSE_RELEASE: "mouseReleaseOnEntity",
            MOUSE_DOUBLE_PRESS_OFF: "mouseDoublePressOffEntity",
            HOVER_ENTER: "hoverEnterEntity",
            HOVER_LEAVE: "hoverLeaveEntity",
            HOVER_OVER: "hoverOverEntity",
            WEB_EVENT: "webEventReceived",
            LEAVE: "leaveEntity",
            ENTER: "enterEntity",
            COLLISION: "collisionWithEntity",
            START_TRIGGER: "startTrigger",
            STOP_TRIGGER: "stopTrigger",
            START_FAR_TRIGGER: "startFarTrigger",
            CONTINUE_FAR_TRIGGER: "continueFarTrigger",
            STOP_FAR_TRIGGER: "stopFarTrigger",
            START_NEAR_TRIGGER: "startNearTrigger",
            CONTINUE_NEAR_TRIGGER: "continueNearTrigger",
            STOP_NEAR_TRIGGER: "stopNearTrigger",
            START_DISTANCE_GRAB: "startDistanceGrab",
            CONTINUE_DISTANCE_GRAB: "continueDistanceGrab",
            START_NEAR_GRAB: "startNearGrab",
            CONTINUE_NEAR_GRAB: "continueNearGrab",
            RELEASE_GRAB: "releaseGrab",
            START_EQUIP: "startEquip",
            CONTINUE_EQUIP: "continueEquip",
            RELEASE_EQUIP: "releaseEquip"
        };
    // PARTICLE SEQUENCER CONSTS
    // ////////////////////////////////////////////////////////////////////////
        var
            LOOP = "loop",
            ON = true,
            OFF = false,
            TOGGLE = "toggle"
        ;

    // INIT
    // ////////////////////////////////////////////////////////////////////////
        var
            _this,
            debug = false
        ;
    // HELPER FUNCTIONS
    // ////////////////////////////////////////////////////////////////////////
        function log(label, value, debug){
                
            if (debug){
                if (value) {
                    print(label, JSON.stringify(value));

                } else {
                    print(label);
                }

            }
        }

        function transform(hooks){
            var hookObject = {};
            var hooksKeys = Object.keys(hooks);
            hooksKeys.forEach(function(sequence){
                // Create an object of the registered hooks
                ["start", "stop"].forEach(function(type){
                // ["start"].forEach(function(type){
                    hooks[sequence][type].forEach(function(hook){
                        if (!hookObject[hook]) {
                            hookObject[hook] = {
                                start: [],
                                stop: []
                            };
                        }
                        hookObject[hook][type].push(sequence);
                    });
                });
            });
            return hookObject;
        }

    // ENTITY DEFINITION
    // ////////////////////////////////////////////////////////////////////////
        function Particle_Sequencer_Client() {
            this._entityID = null;
            this._position = {};
            this._sequenceHooks = {};
            this._sequenceHooksKeys = [];
            this._userData = {};
            this._userDataProperties = {};

            _this = this;
        }

        Particle_Sequencer_Client.prototype = {
            preload: function(id){
                this._entityID = id;

                this._userData = Entities.getEntityProperties(this._entityID, 'userData').userData;
                try {
                    this._userDataProperties = JSON.parse(this._userData);
                    this._sequenceHooks = this._userDataProperties._sequenceHooks;
                    this._sequenceHooksKeys = Object.keys(this._sequenceHooks);
                } catch (error) {
                    log("error", error);
                }

                // REGISTER HOOKS HERE!
                // ////////////////////////////////////////////////////////////
                var hooks = this._sequenceHooks;

                // hooks["explode"] = {
                //     // start: [COLLISION]
                //     start: [MOUSE_PRESS],
                //     stop: [MOUSE_PRESS]
                // };

                // TODO: This only supports one sequence per hook type
                // TODO: ADD RANDOM if more then one sequence given
                // TODO: ADD callback hook to combine for original callbacks
                // log("sequenceHooks", sequenceHooks);
                
                var transformedHook = transform(hooks);
                var transformedHookKeys = Object.keys(transformedHook);
                transformedHookKeys.forEach(function(hookKey) { 
                    log("hookKey", hookKey)
                    var startFunctions = [];
                    var stopFunctions = [];
                    var statusTest = JSON.stringify(transformedHook[hookKey].start) == JSON.stringify(transformedHook[hookKey].stop);
                    var status;

                    if (transformedHook[hookKey].start.length > 0) {
                        log("start > 0");
                        status = statusTest ? TOGGLE : ON;
                        startFunctions.push(function(){
                            log("this is being triggered - start", hookKey);
                            log("transformedHook[hookKey].start[0]", transformedHook[hookKey].start[0]);
                            _this.callTrigger(transformedHook[hookKey].start[0], status);
                        });

                    }

                    if (status !== TOGGLE) {
                        if (transformedHook[hookKey].stop.length > 0) {
                            log("stop > 0");
                            status = OFF;
                            log("status in off", status)
                            stopFunctions.push(function(){
                                log("this is being triggered - stop", hookKey);
                                _this.callTrigger(transformedHook[hookKey].stop[0], status);
                            });
                        }
                    }
                   
                    this[hookKey] = function(){
                        // log("key:", hookKey)
                        startFunctions.forEach(function(fn){
                            fn();
                        });
                        stopFunctions.forEach(function(fn){
                            fn();
                        });
                    };
                }, this)
            },
            callTrigger: function(name, type) {
                Entities.callEntityServerMethod(this._entityID, "callTrigger", [name, type]);
            },
            unload: function(){
            }
        }

        return new Particle_Sequencer_Client();
});