(function() {
    var LEFT_RIGHT_PLACEHOLDER = '[LR]';
    var ATTACH_DISTANCE = 0.3;

    var _this, _entityID;
    var _attachmentData;
    var _supportedJoints = [];

    function AttachableItem() {
        _this = this;
    }
    AttachableItem.prototype = {
        checkProximityToJoint : function(entityID, joint) {
            print("Checking joint proximity...");
            var position = Entities.getEntityProperties(entityID, ['position']).position;
            _supportedJoints.forEach(function(joint) {
                var jointPosition = MyAvatar.getJointPosition(joint);
                if (Vec3.distance(position, jointPosition) <= ATTACH_DISTANCE) {
                    Entities.getEntity(entityID, {
                        parentID: MyAvatar.sessionUUID,
                        parentJointIndex: MyAvatar.getJointIndex(joint)
                    });
                    Script.clearInterval(_this.checkProximityToJoint);
                }
            });
        },
        preload : function(entityID) {
            print("Loading attachmentItemScript.js");
            _entityID = entityID;
            print("Attachment Entity ID: " + _entityID);
            _attachmentData = JSON.parse(Entities.getEntityProperties(entityID).userData).Attachment;
            print(JSON.stringify(_attachmentData.joint));
            if (_attachmentData.joint.indexOf(LEFT_RIGHT_PLACEHOLDER) !== -1) {
                var baseJoint = _attachmentData.joint.substring(3);
                _supportedJoints.push("Left".concat(baseJoint));
                _supportedJoints.push("Right".concat(baseJoint));
            } else {
                _supportedJoints.push(_attachmentData.joint);
            }
            print(JSON.stringify(_supportedJoints));            
        },
        continueNearGrab: function() {
            Script.setInterval(_this.checkProximityToJoint, 300);            
        },
        releaseGrab: function() {
            // We do not care about attaching/detaching if we are not being held
            Script.clearInterval(_this.checkProximityToJoint);
        }


    };
    return new AttachableItem(); 
});
