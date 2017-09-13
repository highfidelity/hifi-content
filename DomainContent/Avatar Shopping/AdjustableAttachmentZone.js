//
//  AttachmentAdjustableZone.js
//
//  This script attaches to a zone that converts attachments to avatar entities
//  Created by Liv Erickson 9/7/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ATTACHMENT_SCRIPT_URL = Script.resolvePath('attachmentItemScript.js');
    var _this, _entityID;
    var attachments;
    var attachmentsAsAvatarEntities;
    var attachmentJointToEntityJointIndex = function(attachmentJointName) {
        return MyAvatar.getJointIndex(attachmentJointName);
    };

    var entityJointIndexToAttachmentJoint = function(entityJointIndex) {
        return MyAvatar.getJointNames()[entityJointIndex]; 
    };

    var createAvatarEntityFromAttachment = function(attachment) {
        var newUserData = JSON.stringify({
            Attachment: {
                action: "attach",
                joint: attachment.jointName,
                options: {
                    translation: attachment.translation,
                    scale: attachment.scale
                }
            },
            grabbableKey: {
                grabbable: true
            }
        });

        var jointPosition = MyAvatar.getJointPosition;
        var avatarEntityProperties = {
            type : "Model",
            dynamic : true,
            userData: newUserData,
            modelURL : attachment.modelURL,
            parentID: MyAvatar.sessionUUID,
            parentJointIndex: attachmentJointToEntityJointIndex(attachment.jointName),
            rotation : attachment.rotation,
            position : {x: jointPosition.x + attachment.translation.x,
                y: jointPosition.y + attachment.translation.y,
                z: jointPosition.z + attachment.translation.z}
        };
        var newEntity = Entities.addEntity(avatarEntityProperties, true);
        var newDimensions = Entities.getEntityProperties(newEntity, ['dimensions']).dimensions;
        newDimensions = Vec3.multiply(newDimensions, attachment.scale);
        Entities.editEntity(newEntity, {dimensions : newDimensions, script : ATTACHMENT_SCRIPT_URL});
        MyAvatar.detachOne(attachment.modelURL, attachment.jointName);
        attachmentsAsAvatarEntities.push(newEntity);
    };

    var createAttachmentFromAvatarEntity = function(avatarEntityProperties) {
        var userDataProperties = JSON.parse(avatarEntityProperties.userData).Attachment;
        var scale = userDataProperties.options['scale'] !== undefined ? userDataProperties.options['scale'] : 1.0;

        var attachToJointName = entityJointIndexToAttachmentJoint(avatarEntityProperties.parentJointIndex);
        var attachToJointIndex = MyAvatar.getJointIndex(attachToJointName);
        var jointWorldRotation = MyAvatar.jointToWorldRotation({}, attachToJointIndex);

        var localRotation = Quat.multiply(avatarEntityProperties.rotation, Quat.inverse(jointWorldRotation));
        var localPosition = avatarEntityProperties.localPosition;

        print(JSON.stringify(scale));
        
        var attachmentProperties = {
            modelURL: avatarEntityProperties.modelURL,
            jointName: attachToJointName,
            translation: localPosition,
            rotation: Quat.safeEulerAngles(Quat.fromVec3Degrees(localRotation)),
            scale: scale,
            isSoft: false
        };
        MyAvatar.attach(attachmentProperties.modelURL,
            attachmentProperties.jointName,
            attachmentProperties.translation,
            attachmentProperties.rotation,
            attachmentProperties.scale,
            attachmentProperties.isSoft);
    };

    var convertAvatarEntitiesToAttachments = function() {
        for (var i = 0; i < attachmentsAsAvatarEntities.length; ++i) {
            createAttachmentFromAvatarEntity(Entities.getEntityProperties(attachmentsAsAvatarEntities[i]));    
            Entities.deleteEntity(attachmentsAsAvatarEntities[i]);            
        }
    };

    var convertAttachmentsToAvatarEntities = function() {
        for (var i = 0; i < attachments.length; ++i) {
            createAvatarEntityFromAttachment(attachments[i]);
        }
    };

    function AdjustableAvatarEntityZone() {
        _this = this;
    }
    AdjustableAvatarEntityZone.prototype = {
        preload : function(entityID) {
            _entityID = entityID;
            print("Loaded zone script");
        },
        enterEntity : function() {
            print("Entering the attachment zone");
            attachments = MyAvatar.getAttachmentData();
            attachmentsAsAvatarEntities = [];
            convertAttachmentsToAvatarEntities();
        },
        leaveEntity : function() {
            print("Leaving the attachment zone");
            convertAvatarEntitiesToAttachments();
        }
    };
    return new AdjustableAvatarEntityZone();
});
