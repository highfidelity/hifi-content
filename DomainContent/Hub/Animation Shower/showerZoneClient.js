
(function() { 
    var _this;

    var HALF = 0.5;
    var SOUND_ON = 1;
    var SOUND_OFF = 0;

    function ShowerZone() {
        _this = this;
    }

    ShowerZone.prototype = {
        particleEffects: [],
        zoneProperties: null,
        speakers: [],
        speakerProperties: [],
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.zoneProperties = Entities.getEntityProperties(_this.entityID, 
                ["position", "dimensions", "rotation"]);
            Entities.getChildrenIDs(_this.entityID).forEach(function(element) {
                var name = Entities.getEntityProperties(element, 'name').name;
                if (name === "Shower Particle") {
                    _this.particleEffects.push(element);
                } else if (name === "Shower Sound Emitter") {
                    _this.speakers.push(element);
                    _this.speakerProperties.push(Entities.getEntityProperties(element));
                }
            });
            
        },
        onlyAvatarInZone: function(objectProperties) {
            var result = false;
            AvatarList.getAvatarIdentifiers().forEach(function(avatarID) {
                var avatar = AvatarList.getAvatar(avatarID);
                if (avatar.sessionUUID !== MyAvatar.sessionUUID) {
                    if (_this.isPositionInsideBox(avatar.position, objectProperties)) {
                        result = true;
                    }
                }
            });
            return result;
        },
        isPositionInsideBox: function(position, boxProperties) {
            var localPosition = Vec3.multiplyQbyV(Quat.inverse(boxProperties.rotation),
                Vec3.subtract(position, boxProperties.position));
            var halfDimensions = Vec3.multiply(boxProperties.dimensions, HALF);
            return -halfDimensions.x <= localPosition.x &&
                    halfDimensions.x >= localPosition.x &&
                   -halfDimensions.y <= localPosition.y &&
                    halfDimensions.y >= localPosition.y &&
                   -halfDimensions.z <= localPosition.z &&
                    halfDimensions.z >= localPosition.z;
        },
        enterEntity: function() {
            _this.particleEffects.forEach(function(particle) {
                Entities.editEntity(particle, {isEmitting: true});
            });
            var speakerNumber = 0;
            _this.speakers.forEach(function(speaker) {
                _this.touchJSONUserData(_this.speakerProperties[speakerNumber], function(userData) {
                    userData.soundVolume = SOUND_ON;
                });
                Entities.editEntity(_this.speakers[speakerNumber], 
                    {userData: _this.speakerProperties[speakerNumber].userData});
                speakerNumber++;
            });
        },
        leaveEntity: function() {
            if (!_this.onlyAvatarInZone(_this.zoneProperties)) {
                _this.particleEffects.forEach(function(particle) {
                    Entities.editEntity(particle, {isEmitting: false});
                });
                var speakerNumber = 0;
                _this.speakers.forEach(function(speaker) {
                    _this.touchJSONUserData(_this.speakerProperties[speakerNumber], function(userData) {
                        userData.soundVolume = SOUND_OFF;
                    });
                    Entities.editEntity(_this.speakers[speakerNumber], 
                        {userData: _this.speakerProperties[speakerNumber].userData});
                    speakerNumber++;
                });
            } 
        },
        touchJSONUserData: function(entityProperties, touchCallback) {
            try {
                var userData = JSON.parse(entityProperties.userData);
                touchCallback.call(this, userData);
                entityProperties.userData = JSON.stringify(userData);
            } catch (e) {
                ('Something went wrong while trying to touch/modify the userData. '+
                    'Could be invalid JSON or problem with the callback function.');
            }
        },
        unload: function() {
            _this.leaveEntity();
        }
    };

    return new ShowerZone();
});