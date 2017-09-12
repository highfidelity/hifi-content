//
//  AttachmentStatusServer.js
//
//  This script attaches to a zone that converts attachments to avatar entities
//  Created by Liv Erickson 9/7/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
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
        var avatarEntityProperties = {
            type : "Model",
            dynamic : true,
            userData: newUserData,
            modelURL : attachment.modelURL,
            parentID: MyAvatar.sessionUUID,
            parentJointIndex: attachmentJointToEntityJointIndex(attachment.jointName),
            rotation : attachment.rotation,
            position : MyAvatar.getJointPosition(attachment.jointName),
            script : "https://cdn.rawgit.com/thoys/hifi-content-1/38f817fc61ee979c7250df294a3e2d38a1f06dc0/Shared/attachmentsShelve/attachmentItemScript.js"
        };
        MyAvatar.detachOne(attachment.modelURL, attachment.jointName);
        attachmentsAsAvatarEntities.push(Entities.addEntity(avatarEntityProperties, true));
    };

    var createAttachmentFromAvatarEntity = function(avatarEntityProperties) {
        var userDataProperties = JSON.parse(avatarEntityProperties.userData).Attachment;
        var naturalDimensions = avatarEntityProperties.naturalDimensions;
        var adjustedScale = Vec3.multiply(naturalDimensions, userDataProperties.options.scale !== undefined ? 
            userDataProperties.options.scale : 1.0);

        var attachToJointName = entityJointIndexToAttachmentJoint(avatarEntityProperties.parentJointIndex);
        var attachToJointIndex = MyAvatar.getJointIndex(attachToJointName);
        var jointWorldRotation = MyAvatar.jointToWorldRotation({}, attachToJointIndex);

        var localRotation = Quat.multiply(avatarEntityProperties.rotation, Quat.inverse(jointWorldRotation));
        var localPosition = userDataProperties.options['translation'] !== undefined ? Vec3.multiplyQbyV(localRotation, 
            userDataProperties.options['translation']) : {x: 0, y: 0, z: 0};
        
        var attachmentProperties = {
            modelURL: avatarEntityProperties.modelURL,
            jointName: attachToJointName,
            translation: localPosition,
            rotation: Quat.safeEulerAngles(localRotation),
            scale: adjustedScale,
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
