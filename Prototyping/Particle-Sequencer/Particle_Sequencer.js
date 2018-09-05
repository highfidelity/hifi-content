
// PARTICLE SEQUENCER CONSTS
// ////////////////////////////////////////////////////////////////////////
    var
        LOOP = "loop",
        POSITION = "position",
        ROTATION = "rotation"
    ;

// HELPER FUNCTIONS 
// ////////////////////////////////////////////////////////////////////////
    function log(label, value){
        print(label, JSON.stringify(value));
    }

    // Get Particle in front of you
    function getPosition(x, y, z) {
        var localOffset = { x: x, y: y, z: z };
        var worldOffset = Vec3.multiplyQbyV(MyAvatar.orientation, localOffset);
        return Vec3.sum(MyAvatar.position, worldOffset);
    }

var _this;

var TRIGGER_START = 0,
    TRIGGER_STOP = 0;
// GROUP DEFINITIONS
// ////////////////////////////////////////////////////////////////////////
var _Sequence = function () {
    this._entities = {};
    this._nameMap = {};
    this._sequences = {};
    this._anchorPosition = {};
    this._totalDelta = 0;
    this._currentSequence;
    this._isRunning = false;
    _this = this;
}

_Sequence.prototype = {
    add: function(entity){
        this._entities[entity.getID()] = entity;
    },
    addSequence: function(name) {
        this._sequences[name] = {
            start: [],
            stop: []
        };
    },
    remove: function(){},
    getAll: function(){},
    removeAll: function(){},
    
    getIsRunning: function(){
        return this._isRunning;
    },
    getHooks: function(){
        var hookObject = {};
        var sequenceKeys = Object.keys(this._sequences);
        sequenceKeys.forEach(function(sequence){
            // Create an object of the registered hooks
            ["start", "stop"].forEach(function(type){
                this._sequences[sequence][type].forEach(function(hook){
                    if (!hookObject[hook]) {
                        hookObject[hook] = {
                            start: [],
                            stop: []
                        };
                    }
                    hookObject[hook][type].push(sequence);
                });
            }, _this);
        });
        return hookObject;
    },
    update: function(){},

    getAnchorPosition: function(position) {
        return this._anchorPosition; 
    },
    setAnchorPosition: function(position) {
        this._anchorPosition = position;
    },

    addNameToMap: function(name, id){
        this.nameMap[name] = id;
    },
    getIdFromNameMap: function(name) {
        return _this.nameMap[name];
    },
    onUpdate: function(delta) {
        var deltaInMs = delta * 1000;
        var withinMargin = 15;
        var entityIDs = Object.keys(_this._entities);
        _this._totalDelta += deltaInMs;

        // Run through the entities and check if any are ready for edits
        entityIDs.forEach(function(ID){
            var entity = _this._entities[ID];
            var currentIndexTimeStamp = entity._sequenceStartDelta + Number(entity._currentKeys[entity._currentIndex]);
            var timeStampDifference = Math.abs(_this._totalDelta - currentIndexTimeStamp);
            if (timeStampDifference <= withinMargin) {
                entity.editCurrentIndex();
            }
        });
    },
    onStart: function(name, hook) {
        this._sequences[name].start = this._sequences[name].start.concat(hook);
        return this;
    },
    onStop: function(name, hook) {
        this._sequences[name].stop.push(hook);
        return this;
    },
    start: function(){
        log("starting animation")
        this._isRunning = true;
        var entityIDs = Object.keys(_this._entities);
        entityIDs.forEach(function(ID){
            var entity = _this._entities[ID];
            entity.setRunningSequence(this._currentSequence);
            entity.updateKeys();
        }, this);
        Script.update.connect(this.onUpdate);
    },
    stop: function(){
        log("stop is called");
        this._totalDelta = 0;
        log("this._isRunning", this._isRunning);
        if (this._isRunning) {
            log("about to discconect")
            Script.update.disconnect(this.onUpdate);
        }
        this._isRunning = false;
    },
    triggerOn: function(name){
        log("trigger on called with", name);
        if (this._isRunning) {
            return;
        }
        this._currentSequence = name;
        this._isRunning = true;
        this.start();
    },
    triggerOff: function(name){
        log("trigger off called with", name);
        if (!this._isRunning) {
            return;
        }
        this._currentSequence = null;
        this.stop();
        this._isRunning = false;
    }
}


// SEQUENCER DEFINITIONS
// ////////////////////////////////////////////////////////////////////////
var SEQUENCER = new _Sequence();

SEQUENCER.Particle = function (properties, name) {

    var orientation = properties["emitOrientation"];
    orientation = Quat.fromPitchYawRollDegrees(orientation.x,orientation.y,orientation.z);
    properties["emitOrientation"] = orientation;
    properties.type = "ParticleEffect";
    // console.log("this", JSON.stringify(this));
    properties.position = SEQUENCER.getAnchorPosition();
    properties.name = name;
    
    this._id = Entities.addEntity(properties);
    this._name = name;
    this._properties = properties;
    this._rotation = Entities.getEntityProperties(this._id,'rotation').rotation;
    this._currentIndex = 0;
    this._currentChangeProperty = null;
    this._currentToValue = null;
    this._currentSequenceName = null;
    this._currentTempSequence = {};
    this._runningSequence = null;
    this._sequence = {};
    this._currentKeys = [];
    this._sequenceStartDelta = 0;
    this._shouldLoop = false;
    this._loopStart = 0;
    this._loopEnd = 0;
    this._duration = 0;
    
    SEQUENCER.add(this);
};

SEQUENCER.Particle.prototype = {
    at: function(time) {
        if (!this._currentTempSequence[String(time)]) {
            this._currentTempSequence[String(time)] = [];
        } 
        if (this._currentChangeProperty === LOOP) {
            this._shouldLoop = true;
            this._loopStart = this.currentToValue;
            this._loopEnd = time;
        }
        this._currentTempSequence[String(time)].push({ change: this._currentChangeProperty, to: this._currentToValue });
        this._currentChangeProperty = null;
        this._currentToValue = null;
        // log("updateKeys", this.currentKeys);
        // log("sequence", this.sequence);
        return this;
    },
    change: function (property) {
        this._currentChangeProperty = property;
        return this;
    },
    to: function (value) {
        var newValue = value;
        if (arguments.length === 3) {
            if (this._currentChangeProperty.toLowerCase().indexOf("color") > -1) {
                newValue = {
                    red: arguments[0],
                    green: arguments[1],
                    blue: arguments[2]
                };
            } else if (
                this._currentChangeProperty.toLowerCase().indexOf("rotation") > -1 ||
                this._currentChangeProperty.toLowerCase().indexOf("orientation") > -1) {
                newValue = Quat.fromPitchYawRollDegrees(arguments[0], arguments[1], arguments[2]);
            } else {
                newValue = {
                    x: arguments[0],
                    y: arguments[1],
                    z: arguments[2]
                };
            }
    
        }
        this._currentToValue = newValue;
        // log("currentToValue", this.currentToValue);
        return this;
    },
    start: function(name) {
        this._sequence[this._currentSequenceName]
        this._currentSequenceName = name;
        return this;
    },
    end: function() {
        this._sequence[this._currentSequenceName] = this._currentTempSequence;
        SEQUENCER.addSequence(this._currentSequenceName);
        this._currentTempSequence = {};
        this._currentSequenceName = null;
        this._currentOnHooks = [];
        return this;
    },
    incrementIndex: function() {
        this._currentIndex = 
            this._currentIndex >= this._currentKeys.length - 1
                ? this._currentIndex = 0
                : this._currentIndex += 1;
    },
    edit: function (propArray) {
        var self = this;
        var propertiesToChange = propArray.reduce(function (prev, cur) {
            var changeAmount = cur.to;
            if (cur.change === LOOP) {
                self._sequenceStartDelta = SEQUENCER._totalDelta;
            }
            if (cur.change === POSITION) {
                var worldOffset = Vec3.multiplyQbyV(self._rotation, cur.to);
                var moveTo = Vec3.sum(SEQUENCER.getAnchorPosition(), worldOffset);
                changeAmount = moveTo;
            }
            prev[cur.change] = changeAmount;
            return prev;
        }, {});
        Entities.editEntity(this._id, propertiesToChange);
        this.incrementIndex();
    },
    editCurrentIndex: function() {
        this.edit(this._sequence[this._currentSequenceName][this._currentKeys[this._currentIndex]]);      
    },
    getID: function() {
        return this._id;
    },
    updateKeys: function() {
        // log("this.sequence", this._sequence);
        // log("this._currentSequenceName", this._currentSequenceName);
        this._currentKeys = Object.keys(this._sequence[this._currentSequenceName]);
    },
    
    setName: function(name) {
        this._name = name;
    },
    setRunningSequence: function(name) {
        log("setRunningSequence called with", name)
        this._currentSequenceName = name;
    }
}

module.exports = SEQUENCER;