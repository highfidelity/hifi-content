/**
 * Available in:Assignment Client Scripts
 */
declare namespace Agent {
    /**
     * @param isAvatar {boolean}  
     */
    function setIsAvatar(isAvatar: boolean): void;
    /**
     * @returns {boolean} 
     */
    function isAvatar(): boolean;
    /**
     * @param avatarSound {object}  
     */
    function playAvatarSound(avatarSound: object): void;
    let isAvatar: boolean;
    /**
     * Read-only.
     */
    let isPlayingAvatarSound: boolean;
    let isListeningToAudioStream: boolean;
    let isNoiseGateEnabled: boolean;
    /**
     * Read-only.
     */
    let lastReceivedAudioLoudness: number;
    /**
     * Read-only.
     */
    let sessionUUID: Uuid;
}

/**
 * Available in:Assignment Client ScriptsThe Avatar API is used to manipulate scriptable avatars on the domain. This API is a subset of the 
 *  MyAvatar API.Note: In the examples, use "Avatar" instead of "MyAvatar".
 */
declare namespace Avatar {
    /**
     * @param url {string}  
     * @param fps {number} [fps=30] 
     * @param priority {number} [priority=1] 
     * @param loop {boolean} [loop=false] 
     * @param hold {boolean} [hold=false] 
     * @param firstFrame {number} [firstFrame=0] 
     * @param lastFrame {number} [lastFrame=3.403e+38] 
     * @param maskedJoints {Array.<string>} [maskedJoints=[]] 
     */
    function startAnimation(url: string, fps: number, priority: number, loop: boolean, hold: boolean, firstFrame: number, lastFrame: number, maskedJoints: Array.<string>): void;
    function stopAnimation(): void;
    /**
     * @returns {Avatar.AnimationDetails} 
     */
    function getAnimationDetails(): Avatar.AnimationDetails;
    interface AnimationDetails {
        role: string;
        url: string;
        fps: number;
        priority: number;
        loop: boolean;
        hold: boolean;
        startAutomatically: boolean;
        firstFrame: number;
        lastFrame: number;
        running: boolean;
        currentFrame: number;
        allowTranslation: boolean;
    }

    /**
     * Returns the minimum scale allowed for this avatar in the current domain.
     * This value can change as the user changes avatars or when changing domains.
     * @returns {number} 
     */
    function getDomainMinScale(): number;
    /**
     * Returns the maximum scale allowed for this avatar in the current domain.
     * This value can change as the user changes avatars or when changing domains.
     * @returns {number} 
     */
    function getDomainMaxScale(): number;
    /**
     * Provides read only access to the current eye height of the avatar.
     * This height is only an estimate and might be incorrect for avatars that are missing standard joints.
     * @returns {number} 
     */
    function getEyeHeight(): number;
    /**
     * Provides read only access to the current height of the avatar.
     * This height is only an estimate and might be incorrect for avatars that are missing standard joints.
     * @returns {number} 
     */
    function getHeight(): number;
    /**
     * @param state {string}  
     */
    function setHandState(state: string): void;
    /**
     * @returns {string} 
     */
    function getHandState(): string;
    /**
     * @param data {Array.<JointData>}  
     */
    function setRawJointData(data: Array.<JointData>): void;
    /**
     * Set a specific joint's rotation and position relative to its parent.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inverse kinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints, the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulate joints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you set the rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param index {number}  The index of the joint.
     * @param rotation {Quat}  The rotation of the joint relative to its parent.
     * @param translation {Vec3}  The translation of the joint relative to its parent.
     */
    function setJointData(index: number, rotation: Quat, translation: Vec3): void;
    /**
     * Set a specific joint's rotation and position relative to its parent.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inverse kinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints, the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulate joints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you set the rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param name {string}  The name of the joint.
     * @param rotation {Quat}  The rotation of the joint relative to its parent.
     * @param translation {Vec3}  The translation of the joint relative to its parent.
     */
    function setJointData(name: string, rotation: Quat, translation: Vec3): void;
    /**
     * Set a specific joint's rotation relative to its parent.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inverse kinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints, the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulate joints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you set the rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param index {number}  The index of the joint.
     * @param rotation {Quat}  The rotation of the joint relative to its parent.
     */
    function setJointRotation(index: number, rotation: Quat): void;
    /**
     * Set a specific joint's rotation relative to its parent.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inverse kinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints, the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulate joints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you set the rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param name {string}  The name of the joint.
     * @param rotation {Quat}  The rotation of the joint relative to its parent.
     */
    function setJointRotation(name: string, rotation: Quat): void;
    /**
     * Set a specific joint's translation relative to its parent.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inverse kinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints, the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulate joints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you set the rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param index {number}  The index of the joint.
     * @param translation {Vec3}  The translation of the joint relative to its parent.
     */
    function setJointTranslation(index: number, translation: Vec3): void;
    /**
     * Set a specific joint's translation relative to its parent.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inverse kinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints, the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulate joints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you set the rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param name {string}  The name of the joint.
     * @param translation {Vec3}  The translation of the joint relative to its parent.
     */
    function setJointTranslation(name: string, translation: Vec3): void;
    /**
     * Clear joint translations and rotations set by script for a specific joint. This restores all motion from the default 
     * animation system including inverse kinematics for that joint.Note: This is slightly faster than the function variation that specifies the joint name.
     * @param index {number}  The index of the joint.
     */
    function clearJointData(index: number): void;
    /**
     * Clear joint translations and rotations set by script for a specific joint. This restores all motion from the default 
     * animation system including inverse kinematics for that joint.Note: This is slightly slower than the function variation that specifies the joint index.
     * @param name {string}  The name of the joint.
     */
    function clearJointData(name: string): void;
    /**
     * @param index {number}  
     * @returns {boolean} 
     */
    function isJointDataValid(index: number): boolean;
    /**
     * @param name {string}  
     * @returns {boolean} 
     */
    function isJointDataValid(name: string): boolean;
    /**
     * Get the rotation of a joint relative to its parent. For information on the joint hierarchy used, see 
     * Avatar Standards.
     * @param index {number}  The index of the joint.
     * @returns {Quat} 
     */
    function getJointRotation(index: number): Quat;
    /**
     * Get the rotation of a joint relative to its parent. For information on the joint hierarchy used, see 
     * Avatar Standards.
     * @param name {string}  The name of the joint.
     * @returns {Quat} 
     */
    function getJointRotation(name: string): Quat;
    /**
     * Get the translation of a joint relative to its parent. For information on the joint hierarchy used, see 
     * Avatar Standards.
     * @param index {number}  The index of the joint.
     * @returns {Vec3} 
     */
    function getJointTranslation(index: number): Vec3;
    /**
     * Get the translation of a joint relative to its parent. For information on the joint hierarchy used, see 
     * Avatar Standards.
     * @param name {number}  The name of the joint.
     * @returns {Vec3} 
     */
    function getJointTranslation(name: number): Vec3;
    /**
     * Get the rotations of all joints in the current avatar. Each joint's rotation is relative to its parent joint.
     * @returns {Array.<Quat>} 
     */
    function getJointRotations(): Array.<Quat>;
    /**
     * @returns {Array.<Vec3>} 
     */
    function getJointTranslations(): Array.<Vec3>;
    /**
     * Set the rotations of all joints in the current avatar. Each joint's rotation is relative to its parent joint.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inversekinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints,the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulatejoints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you setthe rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param jointRotations {Array.<Quat>}  The rotations for all joints in the avatar. The values are in the same order as the 
     * array returned by {@link MyAvatar.getJointNames} or {@link Avatar.getJointNames}.
     */
    function setJointRotations(jointRotations: Array.<Quat>): void;
    /**
     * @param translations {Array.<Vec3>}  
     */
    function setJointTranslations(translations: Array.<Vec3>): void;
    /**
     * Clear all joint translations and rotations that have been set by script. This restores all motion from the default 
     * animation system including inverse kinematics for all joints.
     */
    function clearJointsData(): void;
    /**
     * Get the joint index for a named joint. The joint index value is the position of the joint in the array returned by 
     *  MyAvatar.getJointNames or  Avatar.getJointNames.
     * @param name {string}  The name of the joint.
     * @returns {number} 
     */
    function getJointIndex(name: string): number;
    /**
     * Get the names of all the joints in the current avatar.
     * @returns {Array.<string>} 
     */
    function getJointNames(): Array.<string>;
    /**
     * @param name {string}  
     * @param value {number}  
     */
    function setBlendshape(name: string, value: number): void;
    /**
     * @returns {object} 
     */
    function getAttachmentsVariant(): object;
    /**
     * @param variant {object}  
     */
    function setAttachmentsVariant(variant: object): void;
    /**
     * @param entityID {Uuid}  
     * @param entityData {string}  
     */
    function updateAvatarEntity(entityID: Uuid, entityData: string): void;
    /**
     * @param entityID {Uuid}  
     */
    function clearAvatarEntity(entityID: Uuid): void;
    /**
     * @param connected {boolean}  
     */
    function setForceFaceTrackerConnected(connected: boolean): void;
    /**
     * Get information about all models currently attached to your avatar.
     * @returns {Array.<AttachmentData>} 
     */
    function getAttachmentData(): Array.<AttachmentData>;
    /**
     * Set all models currently attached to your avatar. For example, if you retrieve attachment data using 
     *  MyAvatar.getAttachmentData or  Avatar.getAttachmentData, make changes to it, and then want to update your avatar's attachments per the changed data. You can also remove all attachments by using setting attachmentData to null.
     * @param attachmentData {Array.<AttachmentData>}  The attachment data defining the models to have attached to your avatar. Use 
     *     <code>null</code> to remove all attachments.
     */
    function setAttachmentData(attachmentData: Array.<AttachmentData>): void;
    /**
     * Attach a model to your avatar. For example, you can give your avatar a hat to wear, a guitar to hold, or a surfboard to 
     * stand on.Note: Attached models are models only; they are not entities and can not be manipulated using the  Entities API. Nor can you use this function to attach an entity (such as a sphere or a box) to your avatar.
     * @param modelURL {string}  The URL of the model to attach. Models can be .FBX or .OBJ format.
     * @param jointName {string} [jointName=""] The name of the avatar joint (see {@link MyAvatar.getJointNames} or {@link Avatar.getJointNames}) to attach the model 
     *     to.
     * @param translation {Vec3} [translation=Vec3.ZERO] The offset to apply to the model relative to the joint position.
     * @param rotation {Quat} [rotation=Quat.IDENTITY] The rotation to apply to the model relative to the joint orientation.
     * @param scale {number} [scale=1.0] The scale to apply to the model.
     * @param isSoft {boolean} [isSoft=false] If the model has a skeleton, set this to <code>true</code> so that the bones of the 
     *     attached model's skeleton are be rotated to fit the avatar's current pose. <code>isSoft</code> is used, for example,     to have clothing that moves with the avatar.<br />    If <code>true</code>, the <code>translation</code>, <code>rotation</code>, and <code>scale</code> parameters are     ignored.
     * @param allowDuplicates {boolean} [allowDuplicates=false] 
     * @param useSaved {boolean} [useSaved=true] 
     */
    function attach(modelURL: string, jointName: string, translation: Vec3, rotation: Quat, scale: number, isSoft: boolean, allowDuplicates: boolean, useSaved: boolean): void;
    /**
     * Detach the most recently attached instance of a particular model from either a specific joint or any joint.
     * @param modelURL {string}  The URL of the model to detach.
     * @param jointName {string} [jointName=""] The name of the joint to detach the model from. If <code>""</code>, then the most 
     *     recently attached model is removed from which ever joint it was attached to.
     */
    function detachOne(modelURL: string, jointName: string): void;
    /**
     * Detach all instances of a particular model from either a specific joint or all joints.
     * @param modelURL {string}  The URL of the model to detach.
     * @param jointName {string} [jointName=""] The name of the joint to detach the model from. If <code>""</code>, then the model is 
     *     detached from all joints.
     */
    function detachAll(modelURL: string, jointName: string): void;
    /**
     * @returns {object} 
     */
    function getAvatarEntityData(): object;
    /**
     * @param avatarEntityData {object}  
     */
    function setAvatarEntityData(avatarEntityData: object): void;
    /**
     * @returns {Mat4} 
     */
    function getSensorToWorldMatrix(): Mat4;
    /**
     * @returns {number} 
     */
    function getSensorToWorldScale(): number;
    /**
     * @returns {Mat4} 
     */
    function getControllerLeftHandMatrix(): Mat4;
    /**
     * @returns {Mat4} 
     */
    function getControllerRightHandMatrix(): Mat4;
    /**
     * @param rateName {string} [rateName=""] 
     * @returns {number} 
     */
    function getDataRate(rateName: string): number;
    /**
     * @param rateName {string} [rateName=""] 
     * @returns {number} 
     */
    function getUpdateRate(rateName: string): number;
    /**
     * @returns {Signal} 
     */
    function displayNameChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function sessionDisplayNameChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function skeletonModelURLChanged(): Signal;
    /**
     * @param enabled {boolean}  
     * @returns {Signal} 
     */
    function lookAtSnappingChanged(enabled: boolean): Signal;
    /**
     * @returns {Signal} 
     */
    function sessionUUIDChanged(): Signal;
    /**
     * @param sendAll {boolean} [sendAll=false] 
     */
    function sendAvatarDataPacket(sendAll: boolean): void;
    function sendIdentityPacket(): void;
    function setJointMappingsFromNetworkReply(): void;
    /**
     * @param sessionUUID {Uuid}  
     */
    function setSessionUUID(sessionUUID: Uuid): void;
    /**
     * @param index {number}  
     * @returns {Quat} 
     */
    function getAbsoluteJointRotationInObjectFrame(index: number): Quat;
    /**
     * @param index {number}  
     * @returns {Vec3} 
     */
    function getAbsoluteJointTranslationInObjectFrame(index: number): Vec3;
    /**
     * @param index {number}  
     * @param rotation {Quat}  
     * @returns {boolean} 
     */
    function setAbsoluteJointRotationInObjectFrame(index: number, rotation: Quat): boolean;
    /**
     * @param index {number}  
     * @param translation {Vec3}  
     * @returns {boolean} 
     */
    function setAbsoluteJointTranslationInObjectFrame(index: number, translation: Vec3): boolean;
    /**
     * @returns {number} 
     */
    function getTargetScale(): number;
    function resetLastSent(): void;
    let position: Vec3;
    let scale: number;
    /**
     * Read-only.
     */
    let density: number;
    let handPosition: Vec3;
    /**
     * The rotation left or right about an axis running from the head to the feet of the avatar. 
     *     Yaw is sometimes called "heading".
     */
    let bodyYaw: number;
    /**
     * The rotation about an axis running from shoulder to shoulder of the avatar. Pitch is
     *     sometimes called "elevation".
     */
    let bodyPitch: number;
    /**
     * The rotation about an axis running from the chest to the back of the avatar. Roll is
     *     sometimes called "bank".
     */
    let bodyRoll: number;
    let orientation: Quat;
    /**
     * The orientation of the avatar's head.
     */
    let headOrientation: Quat;
    /**
     * The rotation about an axis running from ear to ear of the avatar's head. Pitch is
     *     sometimes called "elevation".
     */
    let headPitch: number;
    /**
     * The rotation left or right about an axis running from the base to the crown of the avatar's
     *     head. Yaw is sometimes called "heading".
     */
    let headYaw: number;
    /**
     * The rotation about an axis running from the nose to the back of the avatar's head. Roll is
     *     sometimes called "bank".
     */
    let headRoll: number;
    let velocity: Vec3;
    let angularVelocity: Vec3;
    let audioLoudness: number;
    let audioAverageLoudness: number;
    let displayName: string;
    /**
     * Sanitized, defaulted version displayName that is defined by the AvatarMixer
     *     rather than by Interface clients. The result is unique among all avatars present at the time.
     */
    let sessionDisplayName: string;
    let lookAtSnappingEnabled: boolean;
    let skeletonModelURL: string;
    let attachmentData: Array.<AttachmentData>;
    /**
     * The list of joints in the current avatar model. Read-only.
     */
    let jointNames: Array.<string>;
    /**
     * Read-only.
     */
    let sessionUUID: Uuid;
    /**
     * Read-only.
     */
    let sensorToWorldMatrix: Mat4;
    /**
     * Read-only.
     */
    let controllerLeftHandMatrix: Mat4;
    /**
     * Read-only.
     */
    let controllerRightHandMatrix: Mat4;
    /**
     * Read-only.
     */
    let sensorToWorldScale: number;
}

/**
 * Available in:Assignment Client Scripts
 */
declare namespace EntityViewer {
    function queryOctree(): void;
    /**
     * @param position {Vec3}  
     */
    function setPosition(position: Vec3): void;
    /**
     * @param orientation {Quat}  
     */
    function setOrientation(orientation: Quat): void;
    /**
     * @param radius {number}  
     */
    function setCenterRadius(radius: number): void;
    /**
     * @param radius {number}  
     */
    function setKeyholeRadius(radius: number): void;
    /**
     * @param sizeScale {number}  
     */
    function setVoxelSizeScale(sizeScale: number): void;
    /**
     * @param boundaryLevelAdjust {number}  
     */
    function setBoundaryLevelAdjust(boundaryLevelAdjust: number): void;
    /**
     * @param maxPacketsPerSecond {number}  
     */
    function setMaxPacketsPerSecond(maxPacketsPerSecond: number): void;
    /**
     * @returns {Vec3} 
     */
    function getPosition(): Vec3;
    /**
     * @returns {Quat} 
     */
    function getOrientation(): Quat;
    /**
     * @returns {number} 
     */
    function getVoxelSizeScale(): number;
    /**
     * @returns {number} 
     */
    function getBoundaryLevelAdjust(): number;
    /**
     * @returns {number} 
     */
    function getMaxPacketsPerSecond(): number;
    /**
     * @returns {number} 
     */
    function getOctreeElementsCount(): number;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace HifiAbout {
    /**
     * @param url {string}  
     */
    function openUrl(url: string): void;
    let buildDate: string;
    let buildVersion: string;
    let qtVersion: string;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThis API helps manage adding and deleting avatar bookmarks.
 */
declare namespace AvatarBookmarks {
    /**
     * Add the current Avatar to your avatar bookmarks.
     */
    function addBookMark(): void;
    /**
     * This function gets triggered after avatar loaded from bookmark
     * @param bookmarkName {string}  
     * @returns {Signal} 
     */
    function bookmarkLoaded(bookmarkName: string): Signal;
    /**
     * This function gets triggered after avatar bookmark deleted
     * @param bookmarkName {string}  
     * @returns {Signal} 
     */
    function bookmarkDeleted(bookmarkName: string): Signal;
    /**
     * This function gets triggered after avatar bookmark added
     * @param bookmarkName {string}  
     * @returns {Signal} 
     */
    function bookmarkAdded(bookmarkName: string): Signal;
    function deleteBookmark(): void;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace LocationBookmarks {
    function deleteBookmark(): void;
    function addBookmark(): void;
    /**
     * @param address {string}  
     */
    function setHomeLocationToAddress(address: string): void;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe LOD class manages your Level of Detail functions within Interface.
 */
declare namespace LODManager {
    /**
     * @param value {boolean}  
     */
    function setAutomaticLODAdjust(value: boolean): void;
    /**
     * @returns {boolean} 
     */
    function getAutomaticLODAdjust(): boolean;
    /**
     * @param value {number}  
     */
    function setDesktopLODTargetFPS(value: number): void;
    /**
     * @returns {number} 
     */
    function getDesktopLODTargetFPS(): number;
    /**
     * @param value {number}  
     */
    function setHMDLODTargetFPS(value: number): void;
    /**
     * @returns {number} 
     */
    function getHMDLODTargetFPS(): number;
    /**
     * @returns {string} 
     */
    function getLODFeedbackText(): string;
    /**
     * @param sizeScale {number}  
     */
    function setOctreeSizeScale(sizeScale: number): void;
    /**
     * @returns {number} 
     */
    function getOctreeSizeScale(): number;
    /**
     * @param boundaryLevelAdjust {number}  
     */
    function setBoundaryLevelAdjust(boundaryLevelAdjust: number): void;
    /**
     * @returns {number} 
     */
    function getBoundaryLevelAdjust(): number;
    /**
     * @returns {number} 
     */
    function getLODTargetFPS(): number;
    /**
     * @returns {Signal} 
     */
    function LODIncreased(): Signal;
    /**
     * @returns {Signal} 
     */
    function LODDecreased(): Signal;
    /**
     * Read-only.
     */
    let presentTime: number;
    /**
     * Read-only.
     */
    let engineRunTime: number;
    /**
     * Read-only.
     */
    let gpuTime: number;
    /**
     * Read-only.
     */
    let avgRenderTime: number;
    /**
     * Read-only.
     */
    let fps: number;
    /**
     * Read-only.
     */
    let lodLevel: number;
    /**
     * Read-only.
     */
    let lodDecreaseFPS: number;
    /**
     * Read-only.
     */
    let lodIncreaseFPS: number;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace SpeechRecognizer {
    /**
     * @param enabled {boolean}  
     */
    function setEnabled(enabled: boolean): void;
    /**
     * @param command {string}  
     */
    function addCommand(command: string): void;
    /**
     * @param command {string}  
     */
    function removeCommand(command: string): void;
    /**
     * @param command {string}  
     * @returns {Signal} 
     */
    function commandRecognized(command: string): Signal;
    /**
     * @param enabled {boolean}  
     * @returns {Signal} 
     */
    function enabledUpdated(enabled: boolean): Signal;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe AudioScope API helps control the Audio Scope features in Interface
 */
declare namespace AudioScope {
    function toggle(): void;
    /**
     * @param visible {boolean}  
     */
    function setVisible(visible: boolean): void;
    /**
     * @returns {boolean} 
     */
    function getVisible(): boolean;
    function togglePause(): void;
    /**
     * @param paused {boolean}  
     */
    function setPause(paused: boolean): void;
    /**
     * @returns {boolean} 
     */
    function getPause(): boolean;
    function toggleTrigger(): void;
    /**
     * @returns {boolean} 
     */
    function getAutoTrigger(): boolean;
    /**
     * @param autoTrigger {boolean}  
     */
    function setAutoTrigger(autoTrigger: boolean): void;
    /**
     * @param x {number}  
     * @param y {number}  
     */
    function setTriggerValues(x: number, y: number): void;
    /**
     * @param triggered {boolean}  
     */
    function setTriggered(triggered: boolean): void;
    /**
     * @returns {boolean} 
     */
    function getTriggered(): boolean;
    /**
     * @returns {number} 
     */
    function getFramesPerSecond(): number;
    /**
     * @returns {number} 
     */
    function getFramesPerScope(): number;
    function selectAudioScopeFiveFrames(): void;
    function selectAudioScopeTwentyFrames(): void;
    function selectAudioScopeFiftyFrames(): void;
    /**
     * @returns {Array.<number>} 
     */
    function getScopeInput(): Array.<number>;
    /**
     * @returns {Array.<number>} 
     */
    function getScopeOutputLeft(): Array.<number>;
    /**
     * @returns {Array.<number>} 
     */
    function getScopeOutputRight(): Array.<number>;
    /**
     * @returns {Array.<number>} 
     */
    function getTriggerInput(): Array.<number>;
    /**
     * @returns {Array.<number>} 
     */
    function getTriggerOutputLeft(): Array.<number>;
    /**
     * @returns {Array.<number>} 
     */
    function getTriggerOutputRight(): Array.<number>;
    function setLocalEcho(): void;
    function setServerEcho(): void;
    /**
     * @returns {Signal} 
     */
    function pauseChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function triggered(): Signal;
    /**
     * Read-only.
     */
    let scopeInput: number;
    /**
     * Read-only.
     */
    let scopeOutputLeft: number;
    /**
     * Read-only.
     */
    let scopeOutputRight: number;
    /**
     * Read-only.
     */
    let triggerInput: number;
    /**
     * Read-only.
     */
    let triggerOutputLeft: number;
    /**
     * Read-only.
     */
    let triggerOutputRight: number;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe AvatarManager API has properties and methods which manage Avatars within the same domain.
 * Note: This API is also provided to Interface and client entity scripts as the synonym, AvatarList. For assignment client scripts, see the separate  AvatarList API.
 */
declare namespace AvatarManager {
    /**
     * @param avatarID {Uuid}  
     * @returns {AvatarData} 
     */
    function getAvatar(avatarID: Uuid): AvatarData;
    /**
     * @param sessionID {Uuid}  
     * @param rateName {string} [rateName=""] 
     * @returns {number} 
     */
    function getAvatarDataRate(sessionID: Uuid, rateName: string): number;
    /**
     * @param sessionID {Uuid}  
     * @param rateName {string} [rateName=""] 
     * @returns {number} 
     */
    function getAvatarUpdateRate(sessionID: Uuid, rateName: string): number;
    /**
     * @param sessionID {Uuid}  
     * @param rateName {string} [rateName=""] 
     * @returns {number} 
     */
    function getAvatarSimulationRate(sessionID: Uuid, rateName: string): number;
    /**
     * @param ray {PickRay}  
     * @param avatarsToInclude {Array.<Uuid>} [avatarsToInclude=[]] 
     * @param avatarsToDiscard {Array.<Uuid>} [avatarsToDiscard=[]] 
     * @returns {RayToAvatarIntersectionResult} 
     */
    function findRayIntersection(ray: PickRay, avatarsToInclude: Array.<Uuid>, avatarsToDiscard: Array.<Uuid>): RayToAvatarIntersectionResult;
    /**
     * @param ray {PickRay}  
     * @param avatarsToInclude {Array.<Uuid>}  
     * @param avatarsToDiscard {Array.<Uuid>}  
     * @returns {RayToAvatarIntersectionResult} 
     */
    function findRayIntersectionVector(ray: PickRay, avatarsToInclude: Array.<Uuid>, avatarsToDiscard: Array.<Uuid>): RayToAvatarIntersectionResult;
    /**
     * @param name {string}  
     * @returns {number} 
     */
    function getAvatarSortCoefficient(name: string): number;
    /**
     * @param name {string}  
     * @param value {number}  
     */
    function setAvatarSortCoefficient(name: string, value: number): void;
    /**
     * Used in the PAL for getting PAL-related data about avatars nearby. Using this method is faster
     * than iterating over each avatar and obtaining data about them in JavaScript, as that methodlocks and unlocks each avatar's data structure potentially hundreds of times per update tick.
     * @param specificAvatarIdentifiers {Array.<string>}  A list of specific Avatar Identifiers about
     * which you want to get PAL data
     * @returns {object} 
     */
    function getPalData(specificAvatarIdentifiers: Array.<string>): object;
    /**
     * @param shouldRenderAvatars {boolean}  
     */
    function updateAvatarRenderStatus(shouldRenderAvatars: boolean): void;
    /**
     * @returns {Array.<Uuid>} 
     */
    function getAvatarIdentifiers(): Array.<Uuid>;
    /**
     * @param position {Vec3}  
     * @param range {number}  
     * @returns {Array.<Uuid>} 
     */
    function getAvatarsInRange(position: Vec3, range: number): Array.<Uuid>;
    /**
     * @param sessionUUID {Uuid}  
     * @returns {Signal} 
     */
    function avatarAddedEvent(sessionUUID: Uuid): Signal;
    /**
     * @param sessionUUID {Uuid}  
     * @returns {Signal} 
     */
    function avatarRemovedEvent(sessionUUID: Uuid): Signal;
    /**
     * @param sessionUUID {Uuid}  
     * @param oldSessionUUID {Uuid}  
     * @returns {Signal} 
     */
    function avatarSessionChangedEvent(sessionUUID: Uuid, oldSessionUUID: Uuid): Signal;
    /**
     * @param position {string}  
     * @param range {string}  
     * @returns {boolean} 
     */
    function isAvatarInRange(position: string, range: string): boolean;
    /**
     * @param sessionUUID {Uuid}  
     * @param oldSessionUUID {Uuid}  
     */
    function sessionUUIDChanged(sessionUUID: Uuid, oldSessionUUID: Uuid): void;
    /**
     * @param message {}  
     * @param sendingNode {}  
     */
    function processAvatarDataPacket(message, sendingNode): void;
    /**
     * @param message {}  
     * @param sendingNode {}  
     */
    function processAvatarIdentityPacket(message, sendingNode): void;
    /**
     * @param message {}  
     * @param sendingNode {}  
     */
    function processKillAvatar(message, sendingNode): void;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsYour avatar is your in-world representation of you. The MyAvatar API is used to manipulate the avatar.
 * For example, you can customize the avatar's appearance, run custom avatar animations,change the avatar's position within the domain, or manage the avatar's collisions with other objects.
 */
declare namespace MyAvatar {
    function resetSensorsAndBody(): void;
    /**
     * Moves and orients the avatar, such that it is directly underneath the HMD, with toes pointed forward.
     */
    function centerBody(): void;
    /**
     * The internal inverse-kinematics system maintains a record of which joints are "locked". Sometimes it is useful to forget this history, to prevent
     * contorted joints.
     */
    function clearIKJointLimitHistory(): void;
    /**
     * @param newOrientationVar {object}  
     */
    function setOrientationVar(newOrientationVar: object): void;
    /**
     * @returns {object} 
     */
    function getOrientationVar(): object;
    /**
     * Get the position in world coordinates of the point directly between your avatar's eyes assuming your avatar was in its
     * default pose. This is a reference position; it does not change as your avatar's head moves relative to the avatar position.
     * @returns {Vec3} 
     */
    function getDefaultEyePosition(): Vec3;
    /**
     * The avatar animation system includes a set of default animations along with rules for how those animations are blended
     * together with procedural data (such as look at vectors, hand sensors etc.). overrideAnimation() is used to completelyoverride all motion from the default animation system (including inverse kinematics for hand and head controllers) andplay a set of specified animations. To end these animations and restore the default animations, use  MyAvatar.restoreAnimation.Note: When using pre-built animation data, it's critical that the joint orientation of the source animation and target rig are equivalent, since the animation data applies absolute values onto the joints. If the orientations are different, the avatar will move in unpredictable ways. For more information about avatar joint orientation standards, see Avatar Standards.
     * @param url {string}  The URL to the animation file. Animation files need to be .FBX format, but only need to contain the 
     * avatar skeleton and animation data.
     * @param fps {number}  The frames per second (FPS) rate for the animation playback. 30 FPS is normal speed.
     * @param loop {boolean}  Set to true if the animation should loop.
     * @param firstFrame {number}  The frame the animation should start at.
     * @param lastFrame {number}  The frame the animation should end at.
     */
    function overrideAnimation(url: string, fps: number, loop: boolean, firstFrame: number, lastFrame: number): void;
    /**
     * The avatar animation system includes a set of default animations along with rules for how those animations are blended together with
     * procedural data (such as look at vectors, hand sensors etc.). Playing your own custom animations will override the default animations.restoreAnimation() is used to restore all motion from the default animation system including inverse kinematics for hand and headcontrollers. If you aren't currently playing an override animation, this function will have no effect.
     */
    function restoreAnimation(): void;
    /**
     * Each avatar has an avatar-animation.json file that defines which animations are used and how they are blended together with procedural data
     * (such as look at vectors, hand sensors etc.). Each animation specified in the avatar-animation.json file is known as an animation role.Animation roles map to easily understandable actions that the avatar can perform, such as "idleStand", "idleTalk", or "walkFwd."getAnimationRoles() is used get the list of animation roles defined in the avatar-animation.json.
     * @returns {Array.<string>} 
     */
    function getAnimationRoles(): Array.<string>;
    /**
     * Each avatar has an avatar-animation.json file that defines a set of animation roles. Animation roles map to easily understandable actions
     * that the avatar can perform, such as "idleStand", "idleTalk", or "walkFwd". To get the full list of roles, use getAnimationRoles().For each role, the avatar-animation.json defines when the animation is used, the animation clip (.FBX) used, and how animations are blendedtogether with procedural data (such as look at vectors, hand sensors etc.).overrideRoleAnimation() is used to change the animation clip (.FBX) associated with a specified animation role. To end the animations and restore the default animations, use  MyAvatar.restoreRoleAnimation.Note: Hand roles only affect the hand. Other 'main' roles, like 'idleStand', 'idleTalk', 'takeoffStand' are full body.Note: When using pre-built animation data, it's critical that the joint orientation of the source animation and targetrig are equivalent, since the animation data applies absolute values onto the joints. If the orientations are different,the avatar will move in unpredictable ways. For more information about avatar joint orientation standards, see Avatar Standards.
     * @param role {string}  The animation role to override
     * @param url {string}  The URL to the animation file. Animation files need to be .FBX format, but only need to contain the avatar skeleton and animation data.
     * @param fps {number}  The frames per second (FPS) rate for the animation playback. 30 FPS is normal speed.
     * @param loop {boolean}  Set to true if the animation should loop
     * @param firstFrame {number}  The frame the animation should start at
     * @param lastFrame {number}  The frame the animation should end at
     */
    function overrideRoleAnimation(role: string, url: string, fps: number, loop: boolean, firstFrame: number, lastFrame: number): void;
    /**
     * Each avatar has an avatar-animation.json file that defines a set of animation roles. Animation roles map to easily understandable actions that
     * the avatar can perform, such as "idleStand", "idleTalk", or "walkFwd". To get the full list of roles, use getAnimationRoles(). For each role,the avatar-animation.json defines when the animation is used, the animation clip (.FBX) used, and how animations are blended together withprocedural data (such as look at vectors, hand sensors etc.). You can change the animation clip (.FBX) associated with a specified animationrole using overrideRoleAnimation().restoreRoleAnimation() is used to restore a specified animation role's default animation clip. If you have not specified an override animationfor the specified role, this function will have no effect.
     * @param role {string}  The animation role clip to restore.
     */
    function restoreRoleAnimation(role: string): void;
    /**
     * @param handler {number}  
     */
    function removeAnimationStateHandler(handler: number): void;
    /**
     * @returns {boolean} 
     */
    function getSnapTurn(): boolean;
    /**
     * @param on {boolean}  
     */
    function setSnapTurn(on: boolean): void;
    /**
     * @param hand {string}  
     */
    function setDominantHand(hand: string): void;
    /**
     * @returns {string} 
     */
    function getDominantHand(): string;
    /**
     * @param enabled {boolean}  
     */
    function setCenterOfGravityModelEnabled(enabled: boolean): void;
    /**
     * @returns {boolean} 
     */
    function getCenterOfGravityModelEnabled(): boolean;
    /**
     * @param enabled {boolean}  
     */
    function setHMDLeanRecenterEnabled(enabled: boolean): void;
    /**
     * @returns {boolean} 
     */
    function getHMDLeanRecenterEnabled(): boolean;
    /**
     * Request to enable hand touch effect globally
     */
    function requestEnableHandTouch(): void;
    /**
     * Request to disable hand touch effect globally
     */
    function requestDisableHandTouch(): void;
    /**
     * Disables hand touch effect on a specific entity
     * @param entityID {Uuid}  ID of the entity that will disable hand touch effect
     */
    function disableHandTouchForID(entityID: Uuid): void;
    /**
     * Enables hand touch effect on a specific entity
     * @param entityID {Uuid}  ID of the entity that will enable hand touch effect
     */
    function enableHandTouchForID(entityID: Uuid): void;
    /**
     * @param key {DriveKeys}  
     * @returns {number} 
     */
    function getRawDriveKey(key: DriveKeys): number;
    /**
     * @param key {DriveKeys}  
     */
    function disableDriveKey(key: DriveKeys): void;
    /**
     * @param key {DriveKeys}  
     */
    function enableDriveKey(key: DriveKeys): void;
    /**
     * @param key {DriveKeys}  
     * @returns {boolean} 
     */
    function isDriveKeyDisabled(key: DriveKeys): boolean;
    /**
     * Recenter the avatar in the vertical direction, if  MyAvatar is 
     * false.
     */
    function triggerVerticalRecenter(): void;
    /**
     * Recenter the avatar's rotation, if  MyAvatar is false.
     */
    function triggerRotationRecenter(): void;
    /**
     * The isRecenteringHorizontally function returns true if MyAvatar
     * is translating the root of the Avatar to keep the center of gravity under the head.isActive(Horizontal) is returned.
     */
    function isRecenteringHorizontally(): void;
    /**
     * Get the current position of the avatar's "Head" joint.
     * @returns {Vec3} 
     */
    function getHeadPosition(): Vec3;
    /**
     * @returns {number} 
     */
    function getHeadFinalYaw(): number;
    /**
     * @returns {number} 
     */
    function getHeadFinalRoll(): number;
    /**
     * @returns {number} 
     */
    function getHeadFinalPitch(): number;
    /**
     * @returns {number} 
     */
    function getHeadDeltaPitch(): number;
    /**
     * Get the current position of the point directly between the avatar's eyes.
     * @returns {Vec3} 
     */
    function getEyePosition(): Vec3;
    /**
     * @returns {Vec3} 
     */
    function getTargetAvatarPosition(): Vec3;
    /**
     * @returns {AvatarData} 
     */
    function getTargetAvatar(): AvatarData;
    /**
     * Get the position of the avatar's left hand as positioned by a hand controller (e.g., Oculus Touch or Vive).
     * Note: The Leap Motion isn't part of the hand controller input system. (Instead, it manipulates the avatar's joints for hand animation.)
     * @returns {Vec3} 
     */
    function getLeftHandPosition(): Vec3;
    /**
     * Get the position of the avatar's right hand as positioned by a hand controller (e.g., Oculus Touch or Vive).
     * Note: The Leap Motion isn't part of the hand controller input system. (Instead, it manipulates the avatar's joints for hand animation.)
     * @returns {Vec3} 
     */
    function getRightHandPosition(): Vec3;
    /**
     * @returns {Vec3} 
     */
    function getLeftHandTipPosition(): Vec3;
    /**
     * @returns {Vec3} 
     */
    function getRightHandTipPosition(): Vec3;
    /**
     * Get the pose (position, rotation, velocity, and angular velocity) of the avatar's left hand as positioned by a 
     * hand controller (e.g., Oculus Touch or Vive).Note: The Leap Motion isn't part of the hand controller input system. (Instead, it manipulates the avatar's joints for hand animation.) If you are using the Leap Motion, the return value's valid property will be false and any pose values returned will not be meaningful.
     * @returns {Pose} 
     */
    function getLeftHandPose(): Pose;
    /**
     * Get the pose (position, rotation, velocity, and angular velocity) of the avatar's left hand as positioned by a 
     * hand controller (e.g., Oculus Touch or Vive).Note: The Leap Motion isn't part of the hand controller input system. (Instead, it manipulates the avatar's joints for hand animation.) If you are using the Leap Motion, the return value's valid property will be false and any pose values returned will not be meaningful.
     * @returns {Pose} 
     */
    function getRightHandPose(): Pose;
    /**
     * @returns {Pose} 
     */
    function getLeftHandTipPose(): Pose;
    /**
     * @returns {Pose} 
     */
    function getRightHandTipPose(): Pose;
    /**
     * @param position {Vec3}  
     * @param jointIndex {number} [jointIndex=-1] 
     * @returns {Vec3} 
     */
    function worldToJointPoint(position: Vec3, jointIndex: number): Vec3;
    /**
     * @param direction {Vec3}  
     * @param jointIndex {number} [jointIndex=-1] 
     * @returns {Vec3} 
     */
    function worldToJointDirection(direction: Vec3, jointIndex: number): Vec3;
    /**
     * @param rotation {Quat}  
     * @param jointIndex {number} [jointIndex=-1] 
     * @returns {Quat} 
     */
    function worldToJointRotation(rotation: Quat, jointIndex: number): Quat;
    /**
     * @param position {vec3}  
     * @param jointIndex {number} [jointIndex=-1] 
     * @returns {Vec3} 
     */
    function jointToWorldPoint(position: vec3, jointIndex: number): Vec3;
    /**
     * @param direction {Vec3}  
     * @param jointIndex {number} [jointIndex=-1] 
     * @returns {Vec3} 
     */
    function jointToWorldDirection(direction: Vec3, jointIndex: number): Vec3;
    /**
     * @param rotation {Quat}  
     * @param jointIndex {number} [jointIndex=-1] 
     * @returns {Quat} 
     */
    function jointToWorldRotation(rotation: Quat, jointIndex: number): Quat;
    /**
     * @param index {number}  
     * @param position {Vec3}  
     * @param orientation {Quat}  
     * @returns {boolean} 
     */
    function pinJoint(index: number, position: Vec3, orientation: Quat): boolean;
    /**
     * @param index {number}  
     * @returns {boolean} 
     */
    function clearPinOnJoint(index: number): boolean;
    /**
     * @returns {number} 
     */
    function getIKErrorOnLastSolve(): number;
    /**
     * @param fullAvatarURL {string}  
     * @param modelName {string} [modelName=""] 
     */
    function useFullAvatarURL(fullAvatarURL: string, modelName: string): void;
    /**
     * Get the complete URL for the current avatar.
     * @returns {string} 
     */
    function getFullAvatarURLFromPreferences(): string;
    /**
     * Get the full avatar model name for the current avatar.
     * @returns {string} 
     */
    function getFullAvatarModelName(): string;
    /**
     * Function returns list of avatar entities
     * @returns {Array.<object>} 
     */
    function getAvatarEntitiesVariant()(): Array.<object>;
    /**
     * @returns {boolean} 
     */
    function isFlying(): boolean;
    /**
     * @returns {boolean} 
     */
    function isInAir(): boolean;
    /**
     * @param enabled {boolean}  
     */
    function setFlyingEnabled(enabled: boolean): void;
    /**
     * @returns {boolean} 
     */
    function getFlyingEnabled(): boolean;
    /**
     * @param enabled {boolean}  
     */
    function setFlyingDesktopPref(enabled: boolean): void;
    /**
     * @returns {boolean} 
     */
    function getFlyingDesktopPref(): boolean;
    /**
     * @param enabled {boolean}  
     */
    function setFlyingDesktopPref(enabled: boolean): void;
    /**
     * @returns {boolean} 
     */
    function getFlyingDesktopPref(): boolean;
    /**
     * @returns {number} 
     */
    function getAvatarScale(): number;
    /**
     * @param scale {number}  
     */
    function setAvatarScale(scale: number): void;
    /**
     * @param enabled {boolean}  
     */
    function setCollisionsEnabled(enabled: boolean): void;
    /**
     * @returns {boolean} 
     */
    function getCollisionsEnabled(): boolean;
    /**
     * @returns {object} 
     */
    function getCollisionCapsule(): object;
    /**
     * @param enabled {boolean}  
     */
    function setCharacterControllerEnabled(enabled: boolean): void;
    /**
     * @returns {boolean} 
     */
    function getCharacterControllerEnabled(): boolean;
    /**
     * @param direction {Vec3}  
     * @returns {boolean} 
     */
    function isUp(direction: Vec3): boolean;
    /**
     * @param direction {Vec3}  
     * @returns {boolean} 
     */
    function isDown(direction: Vec3): boolean;
    /**
     * Increase the avatar's scale by five percent, up to a minimum scale of 1000.
     */
    function increaseSize(): void;
    /**
     * Decrease the avatar's scale by five percent, down to a minimum scale of 0.25.
     */
    function decreaseSize(): void;
    /**
     * Reset the avatar's scale back to the default scale of 1.0.
     */
    function resetSize(): void;
    function animGraphLoaded(): void;
    /**
     * @param gravity {number}  
     */
    function setGravity(gravity: number): void;
    /**
     * @returns {number} 
     */
    function getGravity(): number;
    /**
     * Move the avatar to a new position and/or orientation in the domain, while taking into account Avatar leg-length.
     * @param position {Vec3}  The new position for the avatar, in world coordinates.
     * @param hasOrientation {boolean} [hasOrientation=false] Set to <code>true</code> to set the orientation of the avatar.
     * @param orientation {Quat} [orientation=Quat.IDENTITY] The new orientation for the avatar.
     * @param shouldFaceLocation {boolean} [shouldFaceLocation=false] Set to <code>true</code> to position the avatar a short distance away from
     *      the new position and orientate the avatar to face the position.
     */
    function goToFeetLocation(position: Vec3, hasOrientation: boolean, orientation: Quat, shouldFaceLocation: boolean): void;
    /**
     * Move the avatar to a new position and/or orientation in the domain.
     * @param position {Vec3}  The new position for the avatar, in world coordinates.
     * @param hasOrientation {boolean} [hasOrientation=false] Set to <code>true</code> to set the orientation of the avatar.
     * @param orientation {Quat} [orientation=Quat.IDENTITY] The new orientation for the avatar.
     * @param shouldFaceLocation {boolean} [shouldFaceLocation=false] Set to <code>true</code> to position the avatar a short distance away from
     * @param withSafeLanding {boolean} [withSafeLanding=true] Set to <code>false</code> MyAvatar::safeLanding will not be called (used when teleporting).
     *     the new position and orientate the avatar to face the position.
     */
    function goToLocation(position: Vec3, hasOrientation: boolean, orientation: Quat, shouldFaceLocation: boolean, withSafeLanding: boolean): void;
    /**
     * @param properties {object}  
     */
    function goToLocation(properties: object): void;
    /**
     * @param position {Vec3}  
     */
    function goToLocationAndEnableCollisions(position: Vec3): void;
    /**
     * @param position {Vec3}  
     * @returns {boolean} 
     */
    function safeLanding(position: Vec3): boolean;
    /**
     * @param domainSettingsObject {objecct}  
     */
    function restrictScaleFromDomainSettings(domainSettingsObject: objecct): void;
    function clearScaleRestriction(): void;
    /**
     * @param thrust {Vec3}  
     */
    function addThrust(thrust: Vec3): void;
    /**
     * @returns {vec3} 
     */
    function getThrust(): vec3;
    /**
     * @param thrust {Vec3}  
     */
    function setThrust(thrust: Vec3): void;
    function updateMotionBehaviorFromMenu(): void;
    /**
     * @param enabled {boolean}  
     */
    function setToggleHips(enabled: boolean): void;
    /**
     * @param enabled {boolean}  
     */
    function setEnableDebugDrawBaseOfSupport(enabled: boolean): void;
    /**
     * @param enabled {boolean}  
     */
    function setEnableDebugDrawDefaultPose(enabled: boolean): void;
    /**
     * @param enabled {boolean}  
     */
    function setEnableDebugDrawAnimPose(enabled: boolean): void;
    /**
     * @param enabled {boolean}  
     */
    function setEnableDebugDrawPosition(enabled: boolean): void;
    /**
     * @param enabled {boolean}  
     */
    function setEnableDebugDrawHandControllers(enabled: boolean): void;
    /**
     * @param enabled {boolean}  
     */
    function setEnableDebugDrawSensorToWorldMatrix(enabled: boolean): void;
    /**
     * @param enabled {boolean}  
     */
    function setEnableDebugDrawIKTargets(enabled: boolean): void;
    /**
     * @param enabled {boolean}  
     */
    function setEnableDebugDrawIKConstraints(enabled: boolean): void;
    /**
     * @param enabled {boolean}  
     */
    function setEnableDebugDrawIKChains(enabled: boolean): void;
    /**
     * @param enabled {boolean}  
     */
    function setEnableDebugDrawDetailedCollision(enabled: boolean): void;
    /**
     * Get whether or not your avatar mesh is visible.
     * @returns {boolean} 
     */
    function getEnableMeshVisible(): boolean;
    /**
     * Set whether or not your avatar mesh is visible.
     * @param visible {boolean}  <code>true</code> to set your avatar mesh visible; <code>false</code> to set it invisible.
     */
    function setEnableMeshVisible(visible: boolean): void;
    /**
     * @param enabled {boolean}  
     */
    function setEnableInverseKinematics(enabled: boolean): void;
    /**
     * @returns {string} 
     */
    function getAnimGraphOverrideUrl(): string;
    /**
     * @param url {string}  
     */
    function setAnimGraphOverrideUrl(url: string): void;
    /**
     * @returns {string} 
     */
    function getAnimGraphUrl(): string;
    /**
     * @param url {string}  
     */
    function setAnimGraphUrl(url: string): void;
    /**
     * @returns {Vec3} 
     */
    function getPositionForAudio(): Vec3;
    /**
     * @returns {Quat} 
     */
    function getOrientationForAudio(): Quat;
    /**
     * @param scale {number}  
     */
    function setModelScale(scale: number): void;
    /**
     * @returns {Signal} 
     */
    function audioListenerModeChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function transformChanged(): Signal;
    /**
     * @param url {string}  
     * @returns {Signal} 
     */
    function newCollisionSoundURL(url: string): Signal;
    /**
     * Triggered when the avatar collides with an entity.
     * @param collision {Collision}  
     * @returns {Signal} 
     */
    function collisionWithEntity(collision: Collision): Signal;
    /**
     * Triggered when collisions with avatar enabled or disabled
     * @param enabled {boolean}  
     * @returns {Signal} 
     */
    function collisionsEnabledChanged(enabled: boolean): Signal;
    /**
     * Triggered when avatar's animation url changes
     * @param url {url}  
     * @returns {Signal} 
     */
    function animGraphUrlChanged(url: url): Signal;
    /**
     * @param energy {number}  
     * @returns {Signal} 
     */
    function energyChanged(energy: number): Signal;
    /**
     * @returns {Signal} 
     */
    function positionGoneTo(): Signal;
    /**
     * @returns {Signal} 
     */
    function onLoadComplete(): Signal;
    /**
     * @returns {Signal} 
     */
    function wentAway(): Signal;
    /**
     * @returns {Signal} 
     */
    function wentActive(): Signal;
    /**
     * @returns {Signal} 
     */
    function skeletonChanged(): Signal;
    /**
     * @param hand {string}  
     * @returns {Signal} 
     */
    function dominantHandChanged(hand: string): Signal;
    /**
     * @param scale {number}  
     * @returns {Signal} 
     */
    function sensorToWorldScaleChanged(scale: number): Signal;
    /**
     * @returns {Signal} 
     */
    function attachmentsChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function scaleChanged(): Signal;
    /**
     * Triggered when hand touch is globally enabled or disabled
     * @param shouldDisable {boolean}  
     * @returns {Signal} 
     */
    function shouldDisableHandTouchChanged(shouldDisable: boolean): Signal;
    /**
     * Triggered when hand touch is enabled or disabled for an specific entity
     * @param entityID {Uuid}  ID of the entity that will enable hand touch effect
     * @param disable {boolean}  
     * @returns {Signal} 
     */
    function disableHandTouchForIDChanged(entityID: Uuid, disable: boolean): Signal;
    /**
     * Returns the minimum scale allowed for this avatar in the current domain.
     * This value can change as the user changes avatars or when changing domains.
     * @returns {number} 
     */
    function getDomainMinScale(): number;
    /**
     * Returns the maximum scale allowed for this avatar in the current domain.
     * This value can change as the user changes avatars or when changing domains.
     * @returns {number} 
     */
    function getDomainMaxScale(): number;
    /**
     * Provides read only access to the current eye height of the avatar.
     * This height is only an estimate and might be incorrect for avatars that are missing standard joints.
     * @returns {number} 
     */
    function getEyeHeight(): number;
    /**
     * Provides read only access to the current height of the avatar.
     * This height is only an estimate and might be incorrect for avatars that are missing standard joints.
     * @returns {number} 
     */
    function getHeight(): number;
    /**
     * @param state {string}  
     */
    function setHandState(state: string): void;
    /**
     * @returns {string} 
     */
    function getHandState(): string;
    /**
     * @param data {Array.<JointData>}  
     */
    function setRawJointData(data: Array.<JointData>): void;
    /**
     * Set a specific joint's rotation and position relative to its parent.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inverse kinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints, the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulate joints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you set the rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param index {number}  The index of the joint.
     * @param rotation {Quat}  The rotation of the joint relative to its parent.
     * @param translation {Vec3}  The translation of the joint relative to its parent.
     */
    function setJointData(index: number, rotation: Quat, translation: Vec3): void;
    /**
     * Set a specific joint's rotation relative to its parent.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inverse kinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints, the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulate joints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you set the rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param index {number}  The index of the joint.
     * @param rotation {Quat}  The rotation of the joint relative to its parent.
     */
    function setJointRotation(index: number, rotation: Quat): void;
    /**
     * Set a specific joint's translation relative to its parent.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inverse kinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints, the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulate joints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you set the rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param index {number}  The index of the joint.
     * @param translation {Vec3}  The translation of the joint relative to its parent.
     */
    function setJointTranslation(index: number, translation: Vec3): void;
    /**
     * Clear joint translations and rotations set by script for a specific joint. This restores all motion from the default 
     * animation system including inverse kinematics for that joint.Note: This is slightly faster than the function variation that specifies the joint name.
     * @param index {number}  The index of the joint.
     */
    function clearJointData(index: number): void;
    /**
     * @param index {number}  
     * @returns {boolean} 
     */
    function isJointDataValid(index: number): boolean;
    /**
     * Get the rotation of a joint relative to its parent. For information on the joint hierarchy used, see 
     * Avatar Standards.
     * @param index {number}  The index of the joint.
     * @returns {Quat} 
     */
    function getJointRotation(index: number): Quat;
    /**
     * Get the translation of a joint relative to its parent. For information on the joint hierarchy used, see 
     * Avatar Standards.
     * @param index {number}  The index of the joint.
     * @returns {Vec3} 
     */
    function getJointTranslation(index: number): Vec3;
    /**
     * Set a specific joint's rotation and position relative to its parent.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inverse kinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints, the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulate joints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you set the rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param name {string}  The name of the joint.
     * @param rotation {Quat}  The rotation of the joint relative to its parent.
     * @param translation {Vec3}  The translation of the joint relative to its parent.
     */
    function setJointData(name: string, rotation: Quat, translation: Vec3): void;
    /**
     * Set a specific joint's rotation relative to its parent.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inverse kinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints, the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulate joints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you set the rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param name {string}  The name of the joint.
     * @param rotation {Quat}  The rotation of the joint relative to its parent.
     */
    function setJointRotation(name: string, rotation: Quat): void;
    /**
     * Set a specific joint's translation relative to its parent.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inverse kinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints, the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulate joints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you set the rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param name {string}  The name of the joint.
     * @param translation {Vec3}  The translation of the joint relative to its parent.
     */
    function setJointTranslation(name: string, translation: Vec3): void;
    /**
     * Clear joint translations and rotations set by script for a specific joint. This restores all motion from the default 
     * animation system including inverse kinematics for that joint.Note: This is slightly slower than the function variation that specifies the joint index.
     * @param name {string}  The name of the joint.
     */
    function clearJointData(name: string): void;
    /**
     * @param name {string}  
     * @returns {boolean} 
     */
    function isJointDataValid(name: string): boolean;
    /**
     * Get the rotation of a joint relative to its parent. For information on the joint hierarchy used, see 
     * Avatar Standards.
     * @param name {string}  The name of the joint.
     * @returns {Quat} 
     */
    function getJointRotation(name: string): Quat;
    /**
     * Get the translation of a joint relative to its parent. For information on the joint hierarchy used, see 
     * Avatar Standards.
     * @param name {number}  The name of the joint.
     * @returns {Vec3} 
     */
    function getJointTranslation(name: number): Vec3;
    /**
     * Get the rotations of all joints in the current avatar. Each joint's rotation is relative to its parent joint.
     * @returns {Array.<Quat>} 
     */
    function getJointRotations(): Array.<Quat>;
    /**
     * @returns {Array.<Vec3>} 
     */
    function getJointTranslations(): Array.<Vec3>;
    /**
     * Set the rotations of all joints in the current avatar. Each joint's rotation is relative to its parent joint.
     * Setting joint data completely overrides/replaces all motion from the default animation system including inversekinematics, but just for the specified joint. So for example, if you were to procedurally manipulate the finger joints,the avatar's hand and head would still do inverse kinematics properly. However, as soon as you start to manipulatejoints in the inverse kinematics chain, the inverse kinematics might not function as you expect. For example, if you setthe rotation of the elbow, the hand inverse kinematics position won't end up in the right place.
     * @param jointRotations {Array.<Quat>}  The rotations for all joints in the avatar. The values are in the same order as the 
     * array returned by {@link MyAvatar.getJointNames} or {@link Avatar.getJointNames}.
     */
    function setJointRotations(jointRotations: Array.<Quat>): void;
    /**
     * @param translations {Array.<Vec3>}  
     */
    function setJointTranslations(translations: Array.<Vec3>): void;
    /**
     * Clear all joint translations and rotations that have been set by script. This restores all motion from the default 
     * animation system including inverse kinematics for all joints.
     */
    function clearJointsData(): void;
    /**
     * Get the joint index for a named joint. The joint index value is the position of the joint in the array returned by 
     *  MyAvatar.getJointNames or  Avatar.getJointNames.
     * @param name {string}  The name of the joint.
     * @returns {number} 
     */
    function getJointIndex(name: string): number;
    /**
     * Get the names of all the joints in the current avatar.
     * @returns {Array.<string>} 
     */
    function getJointNames(): Array.<string>;
    /**
     * @param name {string}  
     * @param value {number}  
     */
    function setBlendshape(name: string, value: number): void;
    /**
     * @returns {object} 
     */
    function getAttachmentsVariant(): object;
    /**
     * @param variant {object}  
     */
    function setAttachmentsVariant(variant: object): void;
    /**
     * @param entityID {Uuid}  
     * @param entityData {string}  
     */
    function updateAvatarEntity(entityID: Uuid, entityData: string): void;
    /**
     * @param entityID {Uuid}  
     */
    function clearAvatarEntity(entityID: Uuid): void;
    /**
     * @param connected {boolean}  
     */
    function setForceFaceTrackerConnected(connected: boolean): void;
    /**
     * Get information about all models currently attached to your avatar.
     * @returns {Array.<AttachmentData>} 
     */
    function getAttachmentData(): Array.<AttachmentData>;
    /**
     * Set all models currently attached to your avatar. For example, if you retrieve attachment data using 
     *  MyAvatar.getAttachmentData or  Avatar.getAttachmentData, make changes to it, and then want to update your avatar's attachments per the changed data. You can also remove all attachments by using setting attachmentData to null.
     * @param attachmentData {Array.<AttachmentData>}  The attachment data defining the models to have attached to your avatar. Use 
     *     <code>null</code> to remove all attachments.
     */
    function setAttachmentData(attachmentData: Array.<AttachmentData>): void;
    /**
     * Attach a model to your avatar. For example, you can give your avatar a hat to wear, a guitar to hold, or a surfboard to 
     * stand on.Note: Attached models are models only; they are not entities and can not be manipulated using the  Entities API. Nor can you use this function to attach an entity (such as a sphere or a box) to your avatar.
     * @param modelURL {string}  The URL of the model to attach. Models can be .FBX or .OBJ format.
     * @param jointName {string} [jointName=""] The name of the avatar joint (see {@link MyAvatar.getJointNames} or {@link Avatar.getJointNames}) to attach the model 
     *     to.
     * @param translation {Vec3} [translation=Vec3.ZERO] The offset to apply to the model relative to the joint position.
     * @param rotation {Quat} [rotation=Quat.IDENTITY] The rotation to apply to the model relative to the joint orientation.
     * @param scale {number} [scale=1.0] The scale to apply to the model.
     * @param isSoft {boolean} [isSoft=false] If the model has a skeleton, set this to <code>true</code> so that the bones of the 
     *     attached model's skeleton are be rotated to fit the avatar's current pose. <code>isSoft</code> is used, for example,     to have clothing that moves with the avatar.<br />    If <code>true</code>, the <code>translation</code>, <code>rotation</code>, and <code>scale</code> parameters are     ignored.
     * @param allowDuplicates {boolean} [allowDuplicates=false] 
     * @param useSaved {boolean} [useSaved=true] 
     */
    function attach(modelURL: string, jointName: string, translation: Vec3, rotation: Quat, scale: number, isSoft: boolean, allowDuplicates: boolean, useSaved: boolean): void;
    /**
     * Detach the most recently attached instance of a particular model from either a specific joint or any joint.
     * @param modelURL {string}  The URL of the model to detach.
     * @param jointName {string} [jointName=""] The name of the joint to detach the model from. If <code>""</code>, then the most 
     *     recently attached model is removed from which ever joint it was attached to.
     */
    function detachOne(modelURL: string, jointName: string): void;
    /**
     * Detach all instances of a particular model from either a specific joint or all joints.
     * @param modelURL {string}  The URL of the model to detach.
     * @param jointName {string} [jointName=""] The name of the joint to detach the model from. If <code>""</code>, then the model is 
     *     detached from all joints.
     */
    function detachAll(modelURL: string, jointName: string): void;
    /**
     * @returns {object} 
     */
    function getAvatarEntityData(): object;
    /**
     * @param avatarEntityData {object}  
     */
    function setAvatarEntityData(avatarEntityData: object): void;
    /**
     * @returns {Mat4} 
     */
    function getSensorToWorldMatrix(): Mat4;
    /**
     * @returns {number} 
     */
    function getSensorToWorldScale(): number;
    /**
     * @returns {Mat4} 
     */
    function getControllerLeftHandMatrix(): Mat4;
    /**
     * @returns {Mat4} 
     */
    function getControllerRightHandMatrix(): Mat4;
    /**
     * @param rateName {string} [rateName=""] 
     * @returns {number} 
     */
    function getDataRate(rateName: string): number;
    /**
     * @param rateName {string} [rateName=""] 
     * @returns {number} 
     */
    function getUpdateRate(rateName: string): number;
    /**
     * @returns {Signal} 
     */
    function displayNameChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function sessionDisplayNameChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function skeletonModelURLChanged(): Signal;
    /**
     * @param enabled {boolean}  
     * @returns {Signal} 
     */
    function lookAtSnappingChanged(enabled: boolean): Signal;
    /**
     * @returns {Signal} 
     */
    function sessionUUIDChanged(): Signal;
    /**
     * @param sendAll {boolean} [sendAll=false] 
     */
    function sendAvatarDataPacket(sendAll: boolean): void;
    function sendIdentityPacket(): void;
    function setJointMappingsFromNetworkReply(): void;
    /**
     * @param sessionUUID {Uuid}  
     */
    function setSessionUUID(sessionUUID: Uuid): void;
    /**
     * @param index {number}  
     * @returns {Quat} 
     */
    function getAbsoluteJointRotationInObjectFrame(index: number): Quat;
    /**
     * @param index {number}  
     * @returns {Vec3} 
     */
    function getAbsoluteJointTranslationInObjectFrame(index: number): Vec3;
    /**
     * @param index {number}  
     * @param rotation {Quat}  
     * @returns {boolean} 
     */
    function setAbsoluteJointRotationInObjectFrame(index: number, rotation: Quat): boolean;
    /**
     * @param index {number}  
     * @param translation {Vec3}  
     * @returns {boolean} 
     */
    function setAbsoluteJointTranslationInObjectFrame(index: number, translation: Vec3): boolean;
    /**
     * @returns {number} 
     */
    function getTargetScale(): number;
    function resetLastSent(): void;
    /**
     * @param index {number}  
     * @returns {Quat} 
     */
    function getDefaultJointRotation(index: number): Quat;
    /**
     * @param index {number}  
     * @returns {Vec3} 
     */
    function getDefaultJointTranslation(index: number): Vec3;
    /**
     * Provides read only access to the default joint rotations in avatar coordinates.
     * The default pose of the avatar is defined by the position and orientation of all bonesin the avatar's model file. Typically this is a T-pose.
     * @param index {number}  index number
     * @returns {Quat} 
     */
    function getAbsoluteDefaultJointRotationInObjectFrame(index: number): Quat;
    /**
     * Provides read only access to the default joint translations in avatar coordinates.
     * The default pose of the avatar is defined by the position and orientation of all bonesin the avatar's model file. Typically this is a T-pose.
     * @param index {number}  index number
     * @returns {Vec3} 
     */
    function getAbsoluteDefaultJointTranslationInObjectFrame(index: number): Vec3;
    /**
     * Set the offset applied to the current avatar. The offset adjusts the position that the avatar is rendered. For example, 
     * with an offset of { x: 0, y: 0.1, z: 0 }, your avatar will appear to be raised off the ground slightly.
     * @param offset {Vec3}  The skeleton offset to set.
     */
    function setSkeletonOffset(offset: Vec3): void;
    /**
     * Get the offset applied to the current avatar. The offset adjusts the position that the avatar is rendered. For example, 
     * with an offset of { x: 0, y: 0.1, z: 0 }, your avatar will appear to be raised off the ground slightly.
     * @returns {Vec3} 
     */
    function getSkeletonOffset(): Vec3;
    /**
     * Get the position of a joint in the current avatar.
     * @param index {number}  The index of the joint.
     * @returns {Vec3} 
     */
    function getJointPosition(index: number): Vec3;
    /**
     * Get the position of a joint in the current avatar.
     * @param name {string}  The name of the joint.
     * @returns {Vec3} 
     */
    function getJointPosition(name: string): Vec3;
    /**
     * Get the position of the current avatar's neck in world coordinates.
     * @returns {Vec3} 
     */
    function getNeckPosition(): Vec3;
    /**
     * @returns {Vec3} 
     */
    function getAcceleration(): Vec3;
    /**
     * Get the position of the current avatar's feet (or rather, bottom of its collision capsule) in world coordinates.
     * @returns {Vec3} 
     */
    function getWorldFeetPosition(): Vec3;
    /**
     * @returns {Uuid} 
     */
    function getParentID(): Uuid;
    /**
     * @param parentID {Uuid}  
     */
    function setParentID(parentID: Uuid): void;
    /**
     * @returns {number} 
     */
    function getParentJointIndex(): number;
    /**
     * @param parentJointIndex {number}  
     */
    function setParentJointIndex(parentJointIndex: number): void;
    /**
     * Returns an array of joints, where each joint is an object containing name, index, and parentIndex fields.
     * @returns {Array.<MyAvatar.SkeletonJoint>} 
     */
    function getSkeleton(): Array.<MyAvatar.SkeletonJoint>;
    interface SkeletonJoint {
        /**
         * Joint name.
         */
        name: string;
        /**
         * Joint index.
         */
        index: number;
        /**
         * Index of this joint's parent (-1 if no parent).
         */
        parentIndex: number;
    }

    /**
     * @param rateName {string} [rateName=""] 
     * @returns {number} 
     */
    function getSimulationRate(rateName: string): number;
    /**
     * Get the position of the left palm in world coordinates.
     * @returns {Vec3} 
     */
    function getLeftPalmPosition(): Vec3;
    /**
     * Get the rotation of the left palm in world coordinates.
     * @returns {Quat} 
     */
    function getLeftPalmRotation(): Quat;
    /**
     * Get the position of the right palm in world coordinates.
     * @returns {Vec3} 
     */
    function getRightPalmPosition(): Vec3;
    /**
     * Get the rotation of the right palm in world coordinates.
     * @returns {Quat} 
     */
    function getRightPalmRotation(): Quat;
    /**
     * @returns {Signal} 
     */
    function rigReady(): Signal;
    /**
     * @returns {Signal} 
     */
    function rigReset(): Signal;
    /**
     * A synonym for position for use by QML.
     */
    let qmlPosition: Vec3;
    /**
     * If true then your avatar is rendered for you in Interface,
     *     otherwise it is not rendered for you (but it is still rendered for other users).
     */
    let shouldRenderLocally: boolean;
    /**
     * The target velocity of your avatar to be achieved by a scripted motor.
     */
    let motorVelocity: Vec3;
    /**
     * The timescale for the scripted motor to achieve the target 
     *     motorVelocity avatar velocity. Smaller values result in higher acceleration.
     */
    let motorTimescale: number;
    /**
     * Reference frame of the motorVelocity. Must be one of the 
     *     following: "camera", "avatar", and "world".
     */
    let motorReferenceFrame: string;
    /**
     * The Type of scripted motor behavior: "simple" to use the 
     *     motorTimescale time scale; "dynamic" to use character controller timescales.
     */
    let motorMode: string;
    /**
     * The sound that's played when the avatar experiences a 
     *     collision. It can be a mono or stereo 16-bit WAV file running at either 24kHz or 48kHz. The latter is down-sampled     by the audio mixer, so all audio effectively plays back at a 24khz. 48kHz RAW files are also supported.
     */
    let collisionSoundURL: string;
    /**
     * Specifies the listening position when hearing spatialized audio. Must be one 
     *     of the following property values:    audioListenerModeHead    audioListenerModeCamera    audioListenerModeCustom
     */
    let audioListenerMode: number;
    /**
     * The audio listening position is at the avatar's head. Read-only.
     */
    let audioListenerModeHead: number;
    /**
     * The audio listening position is at the camera. Read-only.
     */
    let audioListenerModeCamera: number;
    /**
     * The audio listening position is at a the position specified by set by the 
     *     customListenPosition and customListenOrientation property values. Read-only.
     */
    let audioListenerModeCustom: number;
    /**
     * Blendshapes will be transmitted over the network if set to true.
     */
    let hasScriptedBlendshapes: boolean;
    /**
     * procedural blinking will be turned on if set to true.
     */
    let hasProceduralBlinkFaceMovement: boolean;
    /**
     * procedural eye movement will be turned on if set to true.
     */
    let hasProceduralEyeFaceMovement: boolean;
    /**
     * If set to true, voice audio will move the mouth Blendshapes while MyAvatar.hasScriptedBlendshapes is enabled.
     */
    let hasAudioEnabledFaceMovement: boolean;
    /**
     * The listening position used when the audioListenerMode
     *     property value is audioListenerModeCustom.
     */
    let customListenPosition: Vec3;
    /**
     * The listening orientation used when the 
     *     audioListenerMode property value is audioListenerModeCustom.
     */
    let customListenOrientation: Quat;
    /**
     * The position of the left hand in avatar coordinates if it's being positioned by 
     *     controllers, otherwise  Vec3. Read-only.
     */
    let leftHandPosition: Vec3;
    /**
     * The position of the right hand in avatar coordinates if it's being positioned by
     *     controllers, otherwise  Vec3. Read-only.
     */
    let rightHandPosition: Vec3;
    /**
     * The position 30cm offset from the left hand in avatar coordinates if it's being 
     *     positioned by controllers, otherwise  Vec3. Read-only.
     */
    let leftHandTipPosition: Vec3;
    /**
     * The position 30cm offset from the right hand in avatar coordinates if it's being
     *     positioned by controllers, otherwise  Vec3. Read-only.
     */
    let rightHandTipPosition: Vec3;
    /**
     * The pose of the left hand as determined by the hand controllers. Read-only.
     */
    let leftHandPose: Pose;
    /**
     * The pose right hand position as determined by the hand controllers. Read-only.
     */
    let rightHandPose: Pose;
    /**
     * The pose of the left hand as determined by the hand controllers, with the position 
     *     by 30cm. Read-only.
     */
    let leftHandTipPose: Pose;
    /**
     * The pose of the right hand as determined by the hand controllers, with the position
     *     by 30cm. Read-only.
     */
    let rightHandTipPose: Pose;
    /**
     * If true then the avatar hips are placed according to the center of
     *     gravity model that balance the center of gravity over the base of support of the feet.  Setting the value false     will result in the default behaviour where the hips are placed under the head.
     */
    let centerOfGravityModelEnabled: boolean;
    /**
     * If true then the avatar is re-centered to be under the 
     *     head's position. In room-scale VR, this behavior is what causes your avatar to follow your HMD as you walk around     the room. Setting the value false is useful if you want to pin the avatar to a fixed position.
     */
    let hmdLeanRecenterEnabled: boolean;
    /**
     * Set to true to enable collisions for the avatar, false 
     *     to disable collisions. May return true even though the value was set false because the     zone may disallow collisionless avatars.
     */
    let collisionsEnabled: boolean;
    /**
     * Synonym of collisionsEnabled. 
     *     Deprecated: Use collisionsEnabled instead.
     */
    let characterControllerEnabled: boolean;
    /**
     * Returns and sets the value of the Interface setting, Settings > 
     *     Walking and teleporting. Note: Setting the value has no effect unless Interface is restarted.
     */
    let useAdvancedMovementControls: boolean;
    /**
     * Returns and sets the value of the Interface setting, Settings > Show room boundaries 
     *     while teleporting. Note: Setting the value has no effect unless Interface is restarted.
     */
    let showPlayArea: boolean;
    let yawSpeed: number;
    let pitchSpeed: number;
    /**
     * If true, the roll angle of your HMD turns your avatar 
     *     while flying.
     */
    let hmdRollControlEnabled: boolean;
    /**
     * The amount of HMD roll, in degrees, required before your avatar turns if 
     *    hmdRollControlEnabled is enabled.
     */
    let hmdRollControlDeadZone: number;
    /**
     * If hmdRollControlEnabled is true, this value determines the maximum turn rate of
     *     your avatar when rolling your HMD in degrees per second.
     */
    let hmdRollControlRate: number;
    /**
     * The height of the user in sensor space.
     */
    let userHeight: number;
    /**
     * The estimated height of the user's eyes in sensor space. Read-only.
     */
    let userEyeHeight: number;
    /**
     * UUID representing "my avatar". Only use for local-only entities and overlays in situations 
     *     where MyAvatar.sessionUUID is not available (e.g., if not connected to a domain). Note: Likely to be deprecated.     Read-only.
     */
    const SELF_ID: Uuid;
    let walkSpeed: number;
    let walkBackwardSpeed: number;
    let sprintSpeed: number;
    /**
     * Can be used to apply a translation offset between the avatar's position and the
     *     registration point of the 3D model.
     */
    let skeletonOffset: Vec3;
    let position: Vec3;
    /**
     * Returns the clamped scale of the avatar.
     */
    let scale: number;
    /**
     * Read-only.
     */
    let density: number;
    let handPosition: Vec3;
    /**
     * The rotation left or right about an axis running from the head to the feet of the avatar. 
     *     Yaw is sometimes called "heading".
     */
    let bodyYaw: number;
    /**
     * The rotation about an axis running from shoulder to shoulder of the avatar. Pitch is 
     *     sometimes called "elevation".
     */
    let bodyPitch: number;
    /**
     * The rotation about an axis running from the chest to the back of the avatar. Roll is 
     *     sometimes called "bank".
     */
    let bodyRoll: number;
    let orientation: Quat;
    /**
     * The orientation of the avatar's head.
     */
    let headOrientation: Quat;
    /**
     * The rotation about an axis running from ear to ear of the avatar's head. Pitch is 
     *     sometimes called "elevation".
     */
    let headPitch: number;
    /**
     * The rotation left or right about an axis running from the base to the crown of the avatar's 
     *     head. Yaw is sometimes called "heading".
     */
    let headYaw: number;
    /**
     * The rotation about an axis running from the nose to the back of the avatar's head. Roll is 
     *     sometimes called "bank".
     */
    let headRoll: number;
    let velocity: Vec3;
    let angularVelocity: Vec3;
    let audioLoudness: number;
    let audioAverageLoudness: number;
    let displayName: string;
    /**
     * Sanitized, defaulted version displayName that is defined by the AvatarMixer 
     *     rather than by Interface clients. The result is unique among all avatars present at the time.
     */
    let sessionDisplayName: string;
    let lookAtSnappingEnabled: boolean;
    let skeletonModelURL: string;
    let attachmentData: Array.<AttachmentData>;
    /**
     * The list of joints in the current avatar model. Read-only.
     */
    let jointNames: Array.<string>;
    /**
     * Read-only.
     */
    let sessionUUID: Uuid;
    /**
     * Read-only.
     */
    let sensorToWorldMatrix: Mat4;
    /**
     * Read-only.
     */
    let controllerLeftHandMatrix: Mat4;
    /**
     * Read-only.
     */
    let controllerRightHandMatrix: Mat4;
    /**
     * Read-only.
     */
    let sensorToWorldScale: number;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe FaceTracker API helps manage facial tracking hardware.
 */
declare namespace FaceTracker {
    /**
     * @param enabled {boolean}  
     */
    function setEnabled(enabled: boolean): void;
    function calibrate(): void;
    /**
     * @returns {Signal} 
     */
    function muteToggled(): Signal;
    function toggleMute(): void;
    /**
     * @returns {boolean} 
     */
    function getMuted(): boolean;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsSynonym for  Pointers as used for laser pointers.
 */
declare namespace LaserPointers {
    /**
     * @param properties {Pointers.LaserPointerProperties}  
     * @returns {number} 
     */
    function createLaserPointer(properties: Pointers.LaserPointerProperties): number;
    /**
     * @param id {number}  
     */
    function enableLaserPointer(id: number): void;
    /**
     * @param id {number}  
     */
    function disableLaserPointer(id: number): void;
    /**
     * @param id {number}  
     */
    function removeLaserPointer(id: number): void;
    /**
     * @param id {number}  
     * @param renderState {string}  
     * @param properties {Pointers.RayPointerRenderState}  
     */
    function editRenderState(id: number, renderState: string, properties: Pointers.RayPointerRenderState): void;
    /**
     * @param renderState {string}  
     * @param id {number}  
     */
    function setRenderState(renderState: string, id: number): void;
    /**
     * @param id {number}  
     * @returns {RayPickResult} 
     */
    function getPrevRayPickResult(id: number): RayPickResult;
    /**
     * @param id {number}  
     * @param precisionPicking {boolean}  
     */
    function setPrecisionPicking(id: number, precisionPicking: boolean): void;
    /**
     * @param id {number}  
     * @param laserLength {number}  
     */
    function setLaserLength(id: number, laserLength: number): void;
    /**
     * @param id {number}  
     * @param ignoreItems {Array.<Uuid>}  
     */
    function setIgnoreItems(id: number, ignoreItems: Array.<Uuid>): void;
    /**
     * @param id {number}  
     * @param includeItems {Array.<Uuid>}  
     */
    function setIncludeItems(id: number, includeItems: Array.<Uuid>): void;
    /**
     * @param id {number}  
     * @param itemID {Uuid}  
     * @param isOverlay {boolean}  
     * @param offsetMat {Mat4} [offsetMat=undefined] 
     */
    function setLockEndUUID(id: number, itemID: Uuid, isOverlay: boolean, offsetMat: Mat4): void;
    /**
     * @param id {number}  
     * @returns {boolean} 
     */
    function isLeftHand(id: number): boolean;
    /**
     * @param id {number}  
     * @returns {boolean} 
     */
    function isRightHand(id: number): boolean;
    /**
     * @param id {number}  
     * @returns {boolean} 
     */
    function isMouse(id: number): boolean;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe Picks API lets you create and manage objects for repeatedly calculating intersections in different ways.
 */
declare namespace Picks {
    interface RayPickProperties {
        /**
         * If this Pick should start enabled or not.  Disabled Picks do not updated their pick results.
         */
        enabled: boolean;
        /**
         * The filter for this Pick to use, constructed using filter flags combined using bitwise OR.
         */
        filter: number;
        /**
         * The max distance at which this Pick will intersect.  0.0 = no max.  < 0.0 is invalid.
         */
        maxDistance: number;
        /**
         * The ID of the parent, either an avatar, an entity, an overlay, or a pick.
         */
        parentID: Uuid;
        /**
         * The joint of the parent to parent to, for example, the joints on the model of an avatar. (default = 0, no joint)
         */
        parentJointIndex: number;
        /**
         * If "Mouse," parents the pick to the mouse. If "Avatar," parents the pick to MyAvatar's head. Otherwise, parents to the joint of the given name on MyAvatar.
         */
        joint: string;
        /**
         * Only for Joint Ray Picks.  A local joint position offset, in meters.  x = upward, y = forward, z = lateral
         */
        posOffset: Vec3;
        /**
         * Only for Joint Ray Picks.  A local joint direction offset.  x = upward, y = forward, z = lateral
         */
        dirOffset: Vec3;
        /**
         * Only for Static Ray Picks.  The world-space origin of the ray.
         */
        position: Vec3;
        /**
         * Only for Static Ray Picks.  The world-space direction of the ray.
         */
        direction: Vec3;
    }

    interface StylusPickProperties {
        /**
         * An integer.  0 == left, 1 == right.  Invalid otherwise.
         */
        hand: number;
        /**
         * If this Pick should start enabled or not.  Disabled Picks do not updated their pick results.
         */
        enabled: boolean;
        /**
         * The filter for this Pick to use, constructed using filter flags combined using bitwise OR.
         */
        filter: number;
        /**
         * The max distance at which this Pick will intersect.  0.0 = no max.  < 0.0 is invalid.
         */
        maxDistance: number;
    }

    interface ParabolaPickProperties {
        /**
         * If this Pick should start enabled or not.  Disabled Picks do not updated their pick results.
         */
        enabled: boolean;
        /**
         * The filter for this Pick to use, constructed using filter flags combined using bitwise OR.
         */
        filter: number;
        /**
         * The max distance at which this Pick will intersect.  0.0 = no max.  < 0.0 is invalid.
         */
        maxDistance: number;
        /**
         * The ID of the parent, either an avatar, an entity, an overlay, or a pick.
         */
        parentID: Uuid;
        /**
         * The joint of the parent to parent to, for example, the joints on the model of an avatar. (default = 0, no joint)
         */
        parentJointIndex: number;
        /**
         * If "Mouse," parents the pick to the mouse. If "Avatar," parents the pick to MyAvatar's head. Otherwise, parents to the joint of the given name on MyAvatar.
         */
        joint: string;
        /**
         * Only for Joint Parabola Picks.  A local joint position offset, in meters.  x = upward, y = forward, z = lateral
         */
        posOffset: Vec3;
        /**
         * Only for Joint Parabola Picks.  A local joint direction offset.  x = upward, y = forward, z = lateral
         */
        dirOffset: Vec3;
        /**
         * Only for Static Parabola Picks.  The world-space origin of the parabola segment.
         */
        position: Vec3;
        /**
         * Only for Static Parabola Picks.  The world-space direction of the parabola segment.
         */
        direction: Vec3;
        /**
         * The initial speed of the parabola, i.e. the initial speed of the projectile whose trajectory defines the parabola.
         */
        speed: number;
        /**
         * The acceleration of the parabola, i.e. the acceleration of the projectile whose trajectory defines the parabola, both magnitude and direction.
         */
        accelerationAxis: Vec3;
        /**
         * Whether or not the acceleration axis should rotate with the avatar's local Y axis.
         */
        rotateAccelerationWithAvatar: boolean;
        /**
         * Whether or not the acceleration axis should rotate with the parent's local Y axis, if available.
         */
        rotateAccelerationWithParent: boolean;
        /**
         * If true, the velocity and acceleration of the Pick will scale linearly with the parent, if available. scaleWithAvatar is an alias but is deprecated.
         */
        scaleWithParent: boolean;
    }

    interface CollisionPickProperties {
        /**
         * If this Pick should start enabled or not.  Disabled Picks do not updated their pick results.
         */
        enabled: boolean;
        /**
         * The filter for this Pick to use, constructed using filter flags combined using bitwise OR.
         */
        filter: number;
        /**
         * The information about the collision region's size and shape. Dimensions are in world space, but will scale with the parent if defined.
         */
        shape: Shape;
        /**
         * The position of the collision region, relative to a parent if defined.
         */
        position: Vec3;
        /**
         * The orientation of the collision region, relative to a parent if defined.
         */
        orientation: Quat;
        /**
         * The approximate minimum penetration depth for a test object to be considered in contact with the collision region.
         * The depth is measured in world space, but will scale with the parent if defined.
         */
        threshold: float;
        /**
         * The type of object this collision pick collides as. Objects whose collision masks overlap with the pick's collision group
         * will be considered colliding with the pick.
         */
        collisionGroup: CollisionMask;
        /**
         * The ID of the parent, either an avatar, an entity, an overlay, or a pick.
         */
        parentID: Uuid;
        /**
         * The joint of the parent to parent to, for example, the joints on the model of an avatar. (default = 0, no joint)
         */
        parentJointIndex: number;
        /**
         * If "Mouse," parents the pick to the mouse. If "Avatar," parents the pick to MyAvatar's head. Otherwise, parents to the joint of the given name on MyAvatar.
         */
        joint: string;
        /**
         * If true, the collision pick's dimensions and threshold will adjust according to the scale of the parent.
         */
        scaleWithParent: boolean;
    }

    /**
     * Adds a new Pick.
     * Different  PickTypes use different properties, and within one PickType, the properties you choose can lead to a wide range of behaviors.  For example,  with PickType.Ray, depending on which optional parameters you pass, you could create a Static Ray Pick, a Mouse Ray Pick, or a Joint Ray Pick.
     * @param type {PickType}  A PickType that specifies the method of picking to use
     * @param properties {Picks.RayPickProperties}  A PickProperties object, containing all the properties for initializing this Pick
     * @returns {number} 
     */
    function createPick(type: PickType, properties: Picks.RayPickProperties): number;
    /**
     * Enables a Pick.
     * @param uid {number}  The ID of the Pick, as returned by {@link Picks.createPick}.
     */
    function enablePick(uid: number): void;
    /**
     * Disables a Pick.
     * @param uid {number}  The ID of the Pick, as returned by {@link Picks.createPick}.
     */
    function disablePick(uid: number): void;
    /**
     * Removes a Pick.
     * @param uid {number}  The ID of the Pick, as returned by {@link Picks.createPick}.
     */
    function removePick(uid: number): void;
    /**
     * Get the most recent pick result from this Pick.  This will be updated as long as the Pick is enabled.
     * @param uid {number}  The ID of the Pick, as returned by {@link Picks.createPick}.
     * @returns {RayPickResult} 
     */
    function getPrevPickResult(uid: number): RayPickResult;
    /**
     * Sets whether or not to use precision picking.
     * @param uid {number}  The ID of the Pick, as returned by {@link Picks.createPick}.
     * @param precisionPicking {boolean}  Whether or not to use precision picking
     */
    function setPrecisionPicking(uid: number, precisionPicking: boolean): void;
    /**
     * Sets a list of Entity IDs, Overlay IDs, and/or Avatar IDs to ignore during intersection.  Not used by Stylus Picks.
     * @param uid {number}  The ID of the Pick, as returned by {@link Picks.createPick}.
     * @param ignoreItems {Array.<Uuid>}  A list of IDs to ignore.
     */
    function setIgnoreItems(uid: number, ignoreItems: Array.<Uuid>): void;
    /**
     * Sets a list of Entity IDs, Overlay IDs, and/or Avatar IDs to include during intersection, instead of intersecting with everything.  Stylus
     *   Picks only intersect with objects in their include list.
     * @param uid {number}  The ID of the Pick, as returned by {@link Picks.createPick}.
     * @param includeItems {Array.<Uuid>}  A list of IDs to include.
     */
    function setIncludeItems(uid: number, includeItems: Array.<Uuid>): void;
    /**
     * Check if a Pick is associated with the left hand.
     * @param uid {number}  The ID of the Pick, as returned by {@link Picks.createPick}.
     * @returns {boolean} 
     */
    function isLeftHand(uid: number): boolean;
    /**
     * Check if a Pick is associated with the right hand.
     * @param uid {number}  The ID of the Pick, as returned by {@link Picks.createPick}.
     * @returns {boolean} 
     */
    function isRightHand(uid: number): boolean;
    /**
     * Check if a Pick is associated with the system mouse.
     * @param uid {number}  The ID of the Pick, as returned by {@link Picks.createPick}.
     * @returns {boolean} 
     */
    function isMouse(uid: number): boolean;
    /**
     * @returns {number} 
     */
    function PICK_NOTHING(): number;
    /**
     * @returns {number} 
     */
    function PICK_ENTITIES(): number;
    /**
     * @returns {number} 
     */
    function PICK_OVERLAYS(): number;
    /**
     * @returns {number} 
     */
    function PICK_AVATARS(): number;
    /**
     * @returns {number} 
     */
    function PICK_HUD(): number;
    /**
     * @returns {number} 
     */
    function PICK_COARSE(): number;
    /**
     * @returns {number} 
     */
    function PICK_INCLUDE_INVISIBLE(): number;
    /**
     * @returns {number} 
     */
    function PICK_INCLUDE_NONCOLLIDABLE(): number;
    /**
     * @returns {number} 
     */
    function PICK_ALL_INTERSECTIONS(): number;
    /**
     * @returns {number} 
     */
    function INTERSECTED_NONE(): number;
    /**
     * @returns {number} 
     */
    function INTERSECTED_ENTITY(): number;
    /**
     * @returns {number} 
     */
    function INTERSECTED_OVERLAY(): number;
    /**
     * @returns {number} 
     */
    function INTERSECTED_AVATAR(): number;
    /**
     * @returns {number} 
     */
    function INTERSECTED_HUD(): number;
    /**
     * A filter flag. Don't intersect with anything. Read-only.
     */
    const PICK_NOTHING: number;
    /**
     * A filter flag. Include entities when intersecting. Read-only.
     */
    const PICK_ENTITIES: number;
    /**
     * A filter flag. Include overlays when intersecting. Read-only.
     */
    const PICK_OVERLAYS: number;
    /**
     * A filter flag. Include avatars when intersecting. Read-only.
     */
    const PICK_AVATARS: number;
    /**
     * A filter flag. Include the HUD sphere when intersecting in HMD mode. Read-only.
     */
    const PICK_HUD: number;
    /**
     * A filter flag. Pick against coarse meshes, instead of exact meshes. Read-only.
     */
    const PICK_COARSE: number;
    /**
     * A filter flag. Include invisible objects when intersecting. Read-only.
     */
    const PICK_INCLUDE_INVISIBLE: number;
    /**
     * A filter flag. Include non-collidable objects when intersecting. 
     *     Read-only.
     */
    const PICK_INCLUDE_NONCOLLIDABLE: number;
    /**
     * Read-only.
     */
    const PICK_ALL_INTERSECTIONS: number;
    /**
     * An intersection type. Intersected nothing with the given filter flags. 
     *     Read-only.
     */
    const INTERSECTED_NONE: number;
    /**
     * An intersection type. Intersected an entity. Read-only.
     */
    const INTERSECTED_ENTITY: number;
    /**
     * An intersection type. Intersected an overlay. Read-only.
     */
    const INTERSECTED_OVERLAY: number;
    /**
     * An intersection type. Intersected an avatar. Read-only.
     */
    const INTERSECTED_AVATAR: number;
    /**
     * An intersection type. Intersected the HUD sphere. Read-only.
     */
    const INTERSECTED_HUD: number;
    /**
     * The max number of usec to spend per frame updating Pick results. Read-only.
     */
    let perFrameTimeBudget: number;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe Pointers API lets you create and manage objects for repeatedly calculating intersections in different ways, as well as the visual representation of those objects.
 *  Pointers can also be configured to automatically generate  PointerEvents on  Entities and  Overlays.
 */
declare namespace Pointers {
    interface StylusPointerProperties {
        /**
         * If this pointer should generate hover events.
         */
        hover: boolean;
        enabled: boolean;
    }

    interface DefaultRayPointerRenderState {
        /**
         * The distance at which to render the end of this Ray Pointer, if one is defined.
         */
        distance: number;
    }

    interface RayPointerRenderState {
        /**
         * When using  Pointers.createPointer, the name of this render state, used by  Pointers.setRenderState and  Pointers.editRenderState
         */
        name: string;
        /**
         * When using  Pointers.createPointer, an optionally defined overlay to represent the beginning of the Ray Pointer,
         * using the properties you would normally pass to  Overlays.addOverlay, plus the type (as a type field).When returned from  Pointers.getPointerProperties, the ID of the created overlay if it exists, or a null ID otherwise.
         */
        start: Overlays.OverlayProperties;
        /**
         * When using  Pointers.createPointer, an optionally defined overlay to represent the path of the Ray Pointer,
         * using the properties you would normally pass to  Overlays.addOverlay, plus the type (as a type field), which must be "line3d".When returned from  Pointers.getPointerProperties, the ID of the created overlay if it exists, or a null ID otherwise.
         */
        path: Overlays.OverlayProperties;
        /**
         * When using  Pointers.createPointer, an optionally defined overlay to represent the end of the Ray Pointer,
         * using the properties you would normally pass to  Overlays.addOverlay, plus the type (as a type field).When returned from  Pointers.getPointerProperties, the ID of the created overlay if it exists, or a null ID otherwise.
         */
        end: Overlays.OverlayProperties;
    }

    interface LaserPointerProperties {
        /**
         * If true, the end of the Pointer will always rotate to face the avatar.
         */
        faceAvatar: boolean;
        /**
         * If false, the end of the Pointer will be moved up by half of its height.
         */
        centerEndY: boolean;
        /**
         * If true, the end of the Pointer will lock on to the center of the object at which the pointer is pointing.
         */
        lockEnd: boolean;
        /**
         * If true, the dimensions of the end of the Pointer will scale linearly with distance.
         */
        distanceScaleEnd: boolean;
        /**
         * If true, the width of the Pointer's path will scale linearly with the pick parent's scale. scaleWithAvatar is an alias but is deprecated.
         */
        scaleWithParent: boolean;
        /**
         * If true, the end of the Pointer will rotate to follow the normal of the intersected surface.
         */
        followNormal: boolean;
        /**
         * The strength of the interpolation between the real normal and the visual normal if followNormal is true. 0-1.  If 0 or 1,
         * the normal will follow exactly.
         */
        followNormalStrength: number;
        enabled: boolean;
        /**
         * A collection of different visual states to switch between.
         * When using  Pointers.createPointer, a list of RayPointerRenderStates.When returned from  Pointers.getPointerProperties, a map between render state names and RayPointRenderStates.
         */
        renderStates: Array.<Pointers.RayPointerRenderState>;
        /**
         * A collection of different visual states to use if there is no intersection.
         * When using  Pointers.createPointer, a list of DefaultRayPointerRenderStates.When returned from  Pointers.getPointerProperties, a map between render state names and DefaultRayPointRenderStates.
         */
        defaultRenderStates: Array.<Pointers.DefaultRayPointerRenderState>;
        /**
         * If this Pointer should generate hover events.
         */
        hover: boolean;
        /**
         * A list of different triggers mechanisms that control this Pointer's click event generation.
         */
        triggers: Array.<Pointers.Trigger>;
    }

    interface ParabolaProperties {
        /**
         * The color of the parabola.
         */
        color: Color;
        /**
         * The alpha of the parabola.
         */
        alpha: number;
        /**
         * The width of the parabola, in meters.
         */
        width: number;
        /**
         * The width of the parabola, in meters.
         */
        isVisibleInSecondaryCamera: boolean;
        /**
         * If true, the parabola is rendered in front of other items in the scene.
         */
        drawInFront: boolean;
    }

    interface DefaultParabolaPointerRenderState {
        /**
         * The distance along the parabola at which to render the end of this Parabola Pointer, if one is defined.
         */
        distance: number;
    }

    interface ParabolaPointerRenderState {
        /**
         * When using  Pointers.createPointer, the name of this render state, used by  Pointers.setRenderState and  Pointers.editRenderState
         */
        name: string;
        /**
         * When using  Pointers.createPointer, an optionally defined overlay to represent the beginning of the Parabola Pointer,
         * using the properties you would normally pass to  Overlays.addOverlay, plus the type (as a type field).When returned from  Pointers.getPointerProperties, the ID of the created overlay if it exists, or a null ID otherwise.
         */
        start: Overlays.OverlayProperties;
        /**
         * When using  Pointers.createPointer, the optionally defined rendering properties of the parabolic path defined by the Parabola Pointer.
         * Not defined in  Pointers.getPointerProperties.
         */
        path: Pointers.ParabolaProperties;
        /**
         * When using  Pointers.createPointer, an optionally defined overlay to represent the end of the Parabola Pointer,
         * using the properties you would normally pass to  Overlays.addOverlay, plus the type (as a type field).When returned from  Pointers.getPointerProperties, the ID of the created overlay if it exists, or a null ID otherwise.
         */
        end: Overlays.OverlayProperties;
    }

    interface ParabolaPointerProperties {
        /**
         * If true, the end of the Pointer will always rotate to face the avatar.
         */
        faceAvatar: boolean;
        /**
         * If false, the end of the Pointer will be moved up by half of its height.
         */
        centerEndY: boolean;
        /**
         * If true, the end of the Pointer will lock on to the center of the object at which the pointer is pointing.
         */
        lockEnd: boolean;
        /**
         * If true, the dimensions of the end of the Pointer will scale linearly with distance.
         */
        distanceScaleEnd: boolean;
        /**
         * If true, the width of the Pointer's path will scale linearly with the pick parent's scale. scaleWithAvatar is an alias but is deprecated.
         */
        scaleWithParent: boolean;
        /**
         * If true, the end of the Pointer will rotate to follow the normal of the intersected surface.
         */
        followNormal: boolean;
        /**
         * The strength of the interpolation between the real normal and the visual normal if followNormal is true. 0-1.  If 0 or 1,
         * the normal will follow exactly.
         */
        followNormalStrength: number;
        enabled: boolean;
        /**
         * A collection of different visual states to switch between.
         * When using  Pointers.createPointer, a list of ParabolaPointerRenderStates.When returned from  Pointers.getPointerProperties, a map between render state names and ParabolaPointerRenderStates.
         */
        renderStates: Array.<Pointers.ParabolaPointerRenderState>;
        /**
         * A collection of different visual states to use if there is no intersection.
         * When using  Pointers.createPointer, a list of DefaultParabolaPointerRenderStates.When returned from  Pointers.getPointerProperties, a map between render state names and DefaultParabolaPointerRenderStates.
         */
        defaultRenderStates: Array.<Pointers.DefaultParabolaPointerRenderState>;
        /**
         * If this Pointer should generate hover events.
         */
        hover: boolean;
        /**
         * A list of different triggers mechanisms that control this Pointer's click event generation.
         */
        triggers: Array.<Pointers.Trigger>;
    }

    interface Trigger {
        /**
         * This can be a built-in Controller action, like Controller.Standard.LTClick, or a function that evaluates to >= 1.0 when you want to trigger button.
         */
        action: Controller.Standard;
        /**
         * Which button to trigger.  "Primary", "Secondary", "Tertiary", and "Focus" are currently supported.  Only "Primary" will trigger clicks on web surfaces.  If "Focus" is triggered,
         * it will try to set the entity or overlay focus to the object at which the Pointer is aimed.  Buttons besides the first three will still trigger events, but event.button will be "None".
         */
        button: string;
    }

    /**
     * Adds a new Pointer
     * Different  PickTypes use different properties, and within one PickType, the properties you choose can lead to a wide range of behaviors.  For example,  with PickType.Ray, depending on which optional parameters you pass, you could create a Static Ray Pointer, a Mouse Ray Pointer, or a Joint Ray Pointer.
     * @param type {PickType}  A PickType that specifies the method of picking to use
     * @param properties {Pointers.LaserPointerProperties}  A PointerProperties object, containing all the properties for initializing this Pointer <b>and</b> the {@link Picks.PickProperties} for the Pick that
     *   this Pointer will use to do its picking.
     * @returns {number} 
     */
    function createPointer(type: PickType, properties: Pointers.LaserPointerProperties): number;
    /**
     * Enables a Pointer.
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     */
    function enablePointer(uid: number): void;
    /**
     * Disables a Pointer.
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     */
    function disablePointer(uid: number): void;
    /**
     * Removes a Pointer.
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     */
    function removePointer(uid: number): void;
    /**
     * Edit some visual aspect of a Pointer.  Currently only supported for Ray Pointers.
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     * @param renderState {string}  The name of the render state you want to edit.
     * @param properties {Pointers.RayPointerRenderState}  The new properties for <code>renderStates</code> item.
     */
    function editRenderState(uid: number, renderState: string, properties: Pointers.RayPointerRenderState): void;
    /**
     * Set the render state of a Pointer.  For Ray Pointers, this means switching between their  Pointers.RayPointerRenderStates, or "" to turn off rendering and hover/trigger events.
     *  For Stylus Pointers, there are three built-in options: "events on" (render and send events, the default), "events off" (render but don't send events), and "disabled" (don't render, don't send events).
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     * @param renderState {string}  The name of the render state to which you want to switch.
     */
    function setRenderState(uid: number, renderState: string): void;
    /**
     * Get the most recent pick result from this Pointer.  This will be updated as long as the Pointer is enabled, regardless of the render state.
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     * @returns {RayPickResult} 
     */
    function getPrevPickResult(uid: number): RayPickResult;
    /**
     * Sets whether or not to use precision picking.
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     * @param precisionPicking {boolean}  Whether or not to use precision picking
     */
    function setPrecisionPicking(uid: number, precisionPicking: boolean): void;
    /**
     * Sets the length of this Pointer.  No effect on Stylus Pointers.
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     * @param length {number}  The desired length of the Pointer.
     */
    function setLength(uid: number, length: number): void;
    /**
     * Sets a list of Entity IDs, Overlay IDs, and/or Avatar IDs to ignore during intersection.  Not used by Stylus Pointers.
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     * @param ignoreItems {Array.<Uuid>}  A list of IDs to ignore.
     */
    function setIgnoreItems(uid: number, ignoreItems: Array.<Uuid>): void;
    /**
     * Sets a list of Entity IDs, Overlay IDs, and/or Avatar IDs to include during intersection, instead of intersecting with everything.  Stylus
     *   Pointers only intersect with objects in their include list.
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     * @param includeItems {Array.<Uuid>}  A list of IDs to include.
     */
    function setIncludeItems(uid: number, includeItems: Array.<Uuid>): void;
    /**
     * Lock a Pointer onto a specific object (overlay, entity, or avatar).  Optionally, provide an offset in object-space, otherwise the Pointer will lock on to the center of the object.
     *   Not used by Stylus Pointers.
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     * @param objectID {Uuid}  The ID of the object to which to lock on.
     * @param isOverlay {boolean}  False for entities or avatars, true for overlays
     * @param offsetMat {Mat4} [offsetMat=undefined] The offset matrix to use if you do not want to lock on to the center of the object.
     */
    function setLockEndUUID(uid: number, objectID: Uuid, isOverlay: boolean, offsetMat: Mat4): void;
    /**
     * Check if a Pointer is associated with the left hand.
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     * @returns {boolean} 
     */
    function isLeftHand(uid: number): boolean;
    /**
     * Check if a Pointer is associated with the right hand.
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     * @returns {boolean} 
     */
    function isRightHand(uid: number): boolean;
    /**
     * Check if a Pointer is associated with the system mouse.
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     * @returns {boolean} 
     */
    function isMouse(uid: number): boolean;
    /**
     * Returns information about an existing Pointer
     * @param uid {number}  The ID of the Pointer, as returned by {@link Pointers.createPointer}.
     * @returns {Pointers.LaserPointerProperties} 
     */
    function getPointerProperties(uid: number): Pointers.LaserPointerProperties;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsSynonym for  Picks as used for ray picks.
 */
declare namespace RayPick {
    /**
     * @param undefined {Picks.RayPickProperties}  
     * @returns {number} 
     */
    function createRayPick(undefined: Picks.RayPickProperties): number;
    /**
     * @param id {number}  
     */
    function enableRayPick(id: number): void;
    /**
     * @param id {number}  
     */
    function disableRayPick(id: number): void;
    /**
     * @param id {number}  
     */
    function removeRayPick(id: number): void;
    /**
     * @param id {number}  
     * @returns {RayPickResult} 
     */
    function getPrevRayPickResult(id: number): RayPickResult;
    /**
     * @param id {number}  
     * @param precisionPicking {boolean}  
     */
    function setPrecisionPicking(id: number, precisionPicking: boolean): void;
    /**
     * @param id {number}  
     * @param {Uuid[]) {}  ignoreEntities
     */
    function setIgnoreItems(id: number, {Uuid[])): void;
    /**
     * @param id {number}  
     * @param {Uuid[]) {}  includeEntities
     */
    function setIncludeItems(id: number, {Uuid[])): void;
    /**
     * @param id {number}  
     * @returns {boolean} 
     */
    function isLeftHand(id: number): boolean;
    /**
     * @param id {number}  
     * @returns {boolean} 
     */
    function isRightHand(id: number): boolean;
    /**
     * @param id {number}  
     * @returns {boolean} 
     */
    function isMouse(id: number): boolean;
    /**
     * @returns {number} 
     */
    function PICK_NOTHING(): number;
    /**
     * @returns {number} 
     */
    function PICK_ENTITIES(): number;
    /**
     * @returns {number} 
     */
    function PICK_OVERLAYS(): number;
    /**
     * @returns {number} 
     */
    function PICK_AVATARS(): number;
    /**
     * @returns {number} 
     */
    function PICK_HUD(): number;
    /**
     * @returns {number} 
     */
    function PICK_COARSE(): number;
    /**
     * @returns {number} 
     */
    function PICK_INCLUDE_INVISIBLE(): number;
    /**
     * @returns {number} 
     */
    function PICK_INCLUDE_NONCOLLIDABLE(): number;
    /**
     * @returns {number} 
     */
    function PICK_ALL_INTERSECTIONS(): number;
    /**
     * @returns {number} 
     */
    function INTERSECTED_NONE(): number;
    /**
     * @returns {number} 
     */
    function INTERSECTED_ENTITY(): number;
    /**
     * @returns {number} 
     */
    function INTERSECTED_OVERLAY(): number;
    /**
     * @returns {number} 
     */
    function INTERSECTED_AVATAR(): number;
    /**
     * @returns {number} 
     */
    function INTERSECTED_HUD(): number;
    /**
     * Read-only.
     */
    const PICK_NOTHING: number;
    /**
     * Read-only.
     */
    const PICK_ENTITIES: number;
    /**
     * Read-only.
     */
    const PICK_OVERLAYS: number;
    /**
     * Read-only.
     */
    const PICK_AVATARS: number;
    /**
     * Read-only.
     */
    const PICK_HUD: number;
    /**
     * Read-only.
     */
    const PICK_COARSE: number;
    /**
     * Read-only.
     */
    const PICK_INCLUDE_INVISIBLE: number;
    /**
     * Read-only.
     */
    const PICK_INCLUDE_NONCOLLIDABLE: number;
    /**
     * Read-only.
     */
    const PICK_ALL_INTERSECTIONS: number;
    /**
     * Read-only.
     */
    const INTERSECTED_NONE: number;
    /**
     * Read-only.
     */
    const INTERSECTED_ENTITY: number;
    /**
     * Read-only.
     */
    const INTERSECTED_OVERLAY: number;
    /**
     * Read-only.
     */
    const INTERSECTED_AVATAR: number;
    /**
     * Read-only.
     */
    const INTERSECTED_HUD: number;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe AccountServices API contains helper functions related to user connectivity
 */
declare namespace AccountServices {
    /**
     * @returns {DownloadInfoResult} 
     */
    function getDownloadInfo(): DownloadInfoResult;
    function updateDownloadInfo(): void;
    /**
     * @returns {boolean} 
     */
    function isLoggedIn(): boolean;
    /**
     * @returns {boolean} 
     */
    function checkAndSignalForAccessToken(): boolean;
    function logOut(): void;
    /**
     * @returns {Signal} 
     */
    function connected(): Signal;
    /**
     * @param reason {string}  
     * @returns {Signal} 
     */
    function disconnected(reason: string): Signal;
    /**
     * @param username {string}  
     * @returns {Signal} 
     */
    function myUsernameChanged(username: string): Signal;
    /**
     * @param info {}  
     * @returns {Signal} 
     */
    function downloadInfoChanged(info): Signal;
    /**
     * @param discoverabilityMode {string}  
     * @returns {Signal} 
     */
    function findableByChanged(discoverabilityMode: string): Signal;
    /**
     * @param loggedIn {boolean}  
     * @returns {Signal} 
     */
    function loggedInChanged(loggedIn: boolean): Signal;
    /**
     * Read-only.
     */
    let username: string;
    /**
     * Read-only.
     */
    let loggedIn: boolean;
    let findableBy: string;
    /**
     * Read-only.
     */
    let metaverseServerURL: string;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client ScriptsThe Audio API provides facilities to interact with audio inputs and outputs and to play sounds.
 */
declare namespace Audio {
    /**
     * @param device {object}  
     * @param isHMD {boolean}  
     */
    function setInputDevice(device: object, isHMD: boolean): void;
    /**
     * @param device {object}  
     * @param isHMD {boolean}  
     */
    function setOutputDevice(device: object, isHMD: boolean): void;
    /**
     * Enable or disable reverberation. Reverberation is done by the client, on the post-mix audio. The reverberation options 
     * come from either the domain's audio zone if used &mdash; configured on the server &mdash; or as scripted by  Audio.setReverbOptions.
     * @param enable {boolean}  <code>true</code> to enable reverberation, <code>false</code> to disable.
     */
    function setReverb(enable: boolean): void;
    /**
     * Configure reverberation options. Use  Audio.setReverb to enable or disable reverberation.
     * @param options {AudioEffectOptions}  The reverberation options.
     */
    function setReverbOptions(options: AudioEffectOptions): void;
    /**
     * Starts making an audio recording of the audio being played in-world (i.e., not local-only audio) to a file in WAV format.
     * @param filename {string}  The path and name of the file to make the recording in. Should have a <code>.wav</code> 
     *     extension. The file is overwritten if it already exists.
     * @returns {boolean} 
     */
    function startRecording(filename: string): boolean;
    /**
     * Finish making an audio recording started with  Audio.startRecording.
     */
    function stopRecording(): void;
    /**
     * Check whether an audio recording is currently being made.
     * @returns {boolean} 
     */
    function getRecording(): boolean;
    /**
     * @returns {Signal} 
     */
    function nop(): Signal;
    /**
     * Triggered when the audio input is muted or unmuted.
     * @param isMuted {boolean}  <code>true</code> if the audio input is muted, otherwise <code>false</code>.
     * @returns {Signal} 
     */
    function mutedChanged(isMuted: boolean): Signal;
    /**
     * Triggered when the audio input noise reduction is enabled or disabled.
     * @param isEnabled {boolean}  <code>true</code> if audio input noise reduction is enabled, otherwise <code>false</code>.
     * @returns {Signal} 
     */
    function noiseReductionChanged(isEnabled: boolean): Signal;
    /**
     * Triggered when the input audio volume changes.
     * @param volume {number}  The requested volume to be applied to the audio input, range <code>0.0</code> &ndash; 
     *     <code>1.0</code>. The resulting value of <code>Audio.inputVolume</code> depends on the capabilities of the device:     for example, the volume can't be changed on some devices, and others might only support values of <code>0.0</code>     and <code>1.0</code>.
     * @returns {Signal} 
     */
    function inputVolumeChanged(volume: number): Signal;
    /**
     * Triggered when the input audio level changes.
     * @param level {number}  The loudness of the input audio, range <code>0.0</code> (no sound) &ndash; <code>1.0</code> (the 
     *     onset of clipping).
     * @returns {Signal} 
     */
    function inputLevelChanged(level: number): Signal;
    /**
     * Triggered when the current context of the audio changes.
     * @param context {string}  The current context of the audio: either <code>"Desktop"</code> or <code>"HMD"</code>.
     * @returns {Signal} 
     */
    function contextChanged(context: string): Signal;
    function onContextChanged(): void;
    /**
     * Starts playing &mdash; "injecting" &mdash; the content of an audio file. The sound is played globally (sent to the audio 
     * mixer) so that everyone hears it, unless the injectorOptions has localOnly set to true in which case only the client hears the sound played. No sound is played if sent to the audio mixer but the client is not connected to an audio mixer. The  AudioInjector object returned by the function can be used to control the playback and get information about its current state.
     * @param sound {SoundObject}  The content of an audio file, loaded using {@link SoundCache.getSound}. See 
     * {@link SoundObject} for supported formats.
     * @param injectorOptions {AudioInjector.AudioInjectorOptions} [injectorOptions={}] Audio injector configuration.
     * @returns {AudioInjector} 
     */
    function playSound(sound: SoundObject, injectorOptions: AudioInjector.AudioInjectorOptions): AudioInjector;
    /**
     * Start playing the content of an audio file, locally (isn't sent to the audio mixer). This is the same as calling 
     *  Audio.playSound with  AudioInjector.AudioInjectorOptions localOnly set true and the specified position.
     * @param sound {SoundObject}  The content of an audio file, loaded using {@link SoundCache.getSound}. See 
     * {@link SoundObject} for supported formats.
     * @param position {Vec3}  The position in the domain to play the sound.
     * @returns {AudioInjector} 
     */
    function playSystemSound(sound: SoundObject, position: Vec3): AudioInjector;
    /**
     * Set whether or not the audio input should be used in stereo. If the audio input does not support stereo then setting a 
     * value of true has no effect.
     * @param stereo {boolean}  <code>true</code> if the audio input should be used in stereo, otherwise <code>false</code>.
     */
    function setStereoInput(stereo: boolean): void;
    /**
     * Get whether or not the audio input is used in stereo.
     * @returns {boolean} 
     */
    function isStereoInput(): boolean;
    /**
     * Triggered when the client is muted by the mixer because their loudness value for the noise background has reached the 
     * threshold set for the domain in the server settings.
     * @returns {Signal} 
     */
    function mutedByMixer(): Signal;
    /**
     * Triggered when the client is muted by the mixer because they're within a certain radius (50m) of someone who requested 
     * the mute through Developer &gt; Audio &gt; Mute Environment.
     * @returns {Signal} 
     */
    function environmentMuted(): Signal;
    /**
     * Triggered when the client receives its first packet from the audio mixer.
     * @returns {Signal} 
     */
    function receivedFirstPacket(): Signal;
    /**
     * Triggered when the client is disconnected from the audio mixer.
     * @returns {Signal} 
     */
    function disconnected(): Signal;
    /**
     * Triggered when the noise gate is opened: the input audio signal is no longer blocked (fully attenuated) because it has 
     * risen above an adaptive threshold set just above the noise floor. Only occurs if Audio.noiseReduction is true.
     * @returns {Signal} 
     */
    function noiseGateOpened(): Signal;
    /**
     * Triggered when the noise gate is closed: the input audio signal is blocked (fully attenuated) because it has fallen 
     * below an adaptive threshold set just above the noise floor. Only occurs if Audio.noiseReduction is true.
     * @returns {Signal} 
     */
    function noiseGateClosed(): Signal;
    /**
     * Triggered when a frame of audio input is processed.
     * @param inputSamples {Int16Array}  The audio input processed.
     * @returns {Signal} 
     */
    function inputReceived(inputSamples: Int16Array): Signal;
    /**
     * Triggered when the input audio use changes between mono and stereo.
     * @param isStereo {boolean}  <code>true</code> if the input audio is stereo, otherwise <code>false</code>.
     * @returns {Signal} 
     */
    function isStereoInputChanged(isStereo: boolean): Signal;
    /**
     * true if the audio input is muted, otherwise false.
     */
    let muted: boolean;
    /**
     * true if noise reduction is enabled, otherwise false. When 
     *     enabled, the input audio signal is blocked (fully attenuated) when it falls below an adaptive threshold set just     above the noise floor.
     */
    let noiseReduction: boolean;
    /**
     * The loudness of the audio input, range 0.0 (no sound) &ndash; 
     *     1.0 (the onset of clipping). Read-only.
     */
    let inputLevel: number;
    /**
     * Adjusts the volume of the input audio; range 0.0 &ndash; 1.0. 
     *     If set to a value, the resulting value depends on the input device: for example, the volume can't be changed on some     devices, and others might only support values of 0.0 and 1.0.
     */
    let inputVolume: number;
    /**
     * true if the input audio is being used in stereo, otherwise 
     *     false. Some devices do not support stereo, in which case the value is always false.
     */
    let isStereoInput: boolean;
    /**
     * The current context of the audio: either "Desktop" or "HMD".
     *     Read-only.
     */
    let context: string;
    /**
     * Read-only. Deprecated: This property is deprecated and will be
     *     removed.
     */
    let devices: object;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe Clipboard API enables you to export and import entities to and from JSON files.
 */
declare namespace Clipboard {
    /**
     * Compute the extents of the contents held in the clipboard.
     * @returns {Vec3} 
     */
    function getContentsDimensions(): Vec3;
    /**
     * Compute the largest dimension of the extents of the contents held in the clipboard.
     * @returns {number} 
     */
    function getClipboardContentsLargestDimension(): number;
    /**
     * Import entities from a JSON file containing entity data into the clipboard.
     * You can generate a JSON file using  Clipboard.exportEntities.
     * @param filename {string}  Path and name of file to import.
     * @returns {boolean} 
     */
    function importEntities(filename: string): boolean;
    /**
     * Export the entities specified to a JSON file.
     * @param filename {string}  Path and name of the file to export the entities to. Should have the extension ".json".
     * @param entityIDs {Array.<Uuid>}  Array of IDs of the entities to export.
     * @returns {boolean} 
     */
    function exportEntities(filename: string, entityIDs: Array.<Uuid>): boolean;
    /**
     * Export the entities with centers within a cube to a JSON file.
     * @param filename {string}  Path and name of the file to export the entities to. Should have the extension ".json".
     * @param x {number}  X-coordinate of the cube center.
     * @param y {number}  Y-coordinate of the cube center.
     * @param z {number}  Z-coordinate of the cube center.
     * @param scale {number}  Half dimension of the cube.
     * @returns {boolean} 
     */
    function exportEntities(filename: string, x: number, y: number, z: number, scale: number): boolean;
    /**
     * Paste the contents of the clipboard into the world.
     * @param position {Vec3}  Position to paste the clipboard contents at.
     * @returns {Array.<Uuid>} 
     */
    function pasteEntities(position: Vec3): Array.<Uuid>;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe Controller API provides facilities to interact with computer and controller hardware.
 * FunctionsProperties   Controller.getActions   Controller.getHardware   Controller.getStandardMappings   Controller.disableMapping   Controller.enableMapping   Controller.loadMapping   Controller.newMapping   Controller.parseMappingInput, Hardware, and Action Reflection   Controller.findAction   Controller.findDevice   Controller.getActionNames   Controller.getAllActions   Controller.getAvailableInputs   Controller.getDeviceName   Controller.getDeviceNamesInput, Hardware, and Action Events   Controller.actionEvent   Controller.hardwareChanged   Controller.inputEventMouse, Keyboard, and Touch Events   Controller.keyPressEvent   Controller.keyReleaseEvent   Controller.mouseDoublePressEvent   Controller.mouseMoveEvent   Controller.mousePressEvent   Controller.mouseReleaseEvent   Controller.touchBeginEvent   Controller.touchEndEvent   Controller.touchUpdateEvent   Controller.wheelEventControl Capturing   Controller.captureMouseEvents   Controller.captureTouchEvents   Controller.captureWheelEvents   Controller.releaseMouseEvents   Controller.releaseTouchEvents   Controller.releaseWheelEventsAction Capturing   Controller.captureActionEvents   Controller.captureEntityClickEvents   Controller.captureJoystick   Controller.captureKeyEvents   Controller.releaseActionEvents   Controller.releaseEntityClickEvents   Controller.releaseJoystick   Controller.releaseKeyEventsController and Action Values   Controller.getValue   Controller.getAxisValue   Controller.getPoseValue   Controller.getActionValueHaptics   Controller.triggerHapticPulse   Controller.triggerHapticPulseOnDevice   Controller.triggerShortHapticPulse   Controller.triggerShortHapticPulseOnDeviceDisplay Information   Controller.getViewportDimensions   Controller.getRecommendedHUDRectVirtual Game Pad   Controller.setVPadEnabled   Controller.setVPadHidden   Controller.setVPadExtraBottomMarginInput Recordings   Controller.startInputRecording   Controller.stopInputRecording   Controller.saveInputRecording   Controller.getInputRecorderSaveDirectory   Controller.loadInputRecording   Controller.startInputPlayback   Controller.stopInputPlaybackEntity Methods:The default scripts implement hand controller actions that use  Entities.callEntityMethod to call entity script methods, if present in the entity being interacted with.      Method NameDescriptionExample              startFarTriggercontinueFarTriggerstopFarTrigger      These methods are called when a user is more than 0.3m away from the entity, the entity is triggerable, and the         user starts, continues, or stops squeezing the trigger.            A light switch that can be toggled on and off from a distance.              startNearTriggercontinueNearTriggerstopNearTrigger      These methods are called when a user is less than 0.3m away from the entity, the entity is triggerable, and the         user starts, continues, or stops squeezing the trigger.      A doorbell that can be rung when a user is near.              startDistanceGrabcontinueDistanceGrab      These methods are called when a user is more than 0.3m away from the entity, the entity is either cloneable, or        grabbable and not locked, and the user starts or continues to squeeze the trigger.      A comet that emits icy particle trails when a user is dragging it through the sky.              startNearGrabcontinueNearGrab      These methods are called when a user is less than 0.3m away from the entity, the entity is either cloneable, or         grabbable and not locked, and the user starts or continues to squeeze the trigger.      A ball that glows when it's being held close.              releaseGrab      This method is called when a user releases the trigger when having been either distance or near grabbing an         entity.      Turn off the ball glow or comet trail with the user finishes grabbing it.              startEquipcontinueEquipreleaseEquip      These methods are called when a user starts, continues, or stops equipping an entity.      A glass that stays in the user's hand after the trigger is clicked.      All the entity methods are called with the following two arguments:  The entity ID.  A string, "hand,userID" &mdash; where "hand" is "left" or "right", and "userID"    is the user's  MyAvatar.
 */
declare namespace Controller {
    interface Hardware-Application {
    }

    /**
     * Disable default Interface actions for a particular key event.
     * @param event {KeyEvent}  Details of the key event to be captured. The <code>key</code> property must be specified. The 
     *     <code>text</code> property is ignored. The other properties default to <code>false</code>.
     */
    function captureKeyEvents(event: KeyEvent): void;
    /**
     * Re-enable default Interface actions for a particular key event that has been disabled using 
     *  Controller.captureKeyEvents.
     * @param event {KeyEvent}  Details of the key event to release from capture. The <code>key</code> property must be 
     *     specified. The <code>text</code> property is ignored. The other properties default to <code>false</code>.
     */
    function releaseKeyEvents(event: KeyEvent): void;
    /**
     * Disable default Interface actions for a joystick.
     * @param joystickID {number}  The integer ID of the joystick.
     */
    function captureJoystick(joystickID: number): void;
    /**
     * Re-enable default Interface actions for a joystick that has been disabled using 
     *  Controller.captureJoystick.
     * @param joystickID {number}  The integer ID of the joystick.
     */
    function releaseJoystick(joystickID: number): void;
    /**
     * Disable  Entities.mousePressOnEntity and  Entities.mouseDoublePressOnEntity events on entities.
     */
    function captureEntityClickEvents(): void;
    /**
     * Re-enable  Entities.mousePressOnEntity and  Entities.mouseDoublePressOnEntity events on entities that were 
     * disabled using  Controller.captureEntityClickEvents.
     */
    function releaseEntityClickEvents(): void;
    /**
     * Get the dimensions of the Interface window's interior if in desktop mode or the HUD surface if in HMD mode.
     * @returns {Vec2} 
     */
    function getViewportDimensions(): Vec2;
    /**
     * Get the recommended area to position UI on the HUD surface if in HMD mode or Interface's window interior if in desktop 
     * mode.
     * @returns {Rect} 
     */
    function getRecommendedHUDRect(): Rect;
    /**
     * Enables or disables the virtual game pad that is displayed on certain devices (e.g., Android).
     * @param enable {boolean}  If <code>true</code> then the virtual game pad doesn't work, otherwise it does work provided 
     *     that it is not hidden by {@link Controller.setVPadHidden|setVPadHidden}.
     */
    function setVPadEnabled(enable: boolean): void;
    /**
     * Shows or hides the virtual game pad that is displayed on certain devices (e.g., Android).
     * @param hidden {boolean}  If <code>true</code> then the virtual game pad is hidden, otherwise it is shown.
     */
    function setVPadHidden(hidden: boolean): void;
    /**
     * Sets the amount of extra margin between the virtual game pad that is displayed on certain devices (e.g., Android) and 
     * the bottom of the display.
     * @param margin {number}  Integer number of pixels in the extra margin.
     */
    function setVPadExtraBottomMargin(margin: number): void;
    /**
     * Triggered when a keyboard key is pressed.
     * @param event {KeyEvent}  Details of the key press.
     * @returns {Signal} 
     */
    function keyPressEvent(event: KeyEvent): Signal;
    /**
     * Triggered when a keyboard key is released from being pressed.
     * @param event {KeyEvent}  Details of the key release.
     * @returns {Signal} 
     */
    function keyReleaseEvent(event: KeyEvent): Signal;
    /**
     * Triggered when the mouse moves.
     * @param event {MouseEvent}  Details of the mouse movement.
     * @returns {Signal} 
     */
    function mouseMoveEvent(event: MouseEvent): Signal;
    /**
     * Triggered when a mouse button is pressed.
     * @param event {MouseEvent}  Details of the button press.
     * @returns {Signal} 
     */
    function mousePressEvent(event: MouseEvent): Signal;
    /**
     * Triggered when a mouse button is double-pressed.
     * @param event {MouseEvent}  Details of the button double-press.
     * @returns {Signal} 
     */
    function mouseDoublePressEvent(event: MouseEvent): Signal;
    /**
     * Triggered when a mouse button is released from being pressed.
     * @param event {MouseEvent}  Details of the button release.
     * @returns {Signal} 
     */
    function mouseReleaseEvent(event: MouseEvent): Signal;
    /**
     * Triggered when a touch event starts in the Interface window on a touch-enabled display or device.
     * @param event {TouchEvent}  Details of the touch begin.
     * @returns {Signal} 
     */
    function touchBeginEvent(event: TouchEvent): Signal;
    /**
     * Triggered when a touch event ends in the Interface window on a touch-enabled display or device.
     * @param event {TouchEvent}  Details of the touch end.
     * @returns {Signal} 
     */
    function touchEndEvent(event: TouchEvent): Signal;
    /**
     * Triggered when a touch event update occurs in the Interface window on a touch-enabled display or device.
     * @param event {TouchEvent}  Details of the touch update.
     * @returns {Signal} 
     */
    function touchUpdateEvent(event: TouchEvent): Signal;
    /**
     * Triggered when the mouse wheel is rotated.
     * @param event {WheelEvent}  Details of the wheel movement.
     * @returns {Signal} 
     */
    function wheelEvent(event: WheelEvent): Signal;
    interface Actions {
    }

    interface Hardware {
    }

    /**
     * Get a list of all available actions.
     * @returns {Array.<Action>} 
     */
    function getAllActions(): Array.<Action>;
    /**
     * Get a list of all available inputs for a hardware device.
     * @param deviceID {number}  Integer ID of the hardware device.
     * @returns {Array.<NamedPair>} 
     */
    function getAvailableInputs(deviceID: number): Array.<NamedPair>;
    /**
     * Find the name of a particular controller from its device ID.
     * @param deviceID {number}  The integer ID of the device.
     * @returns {string} 
     */
    function getDeviceName(deviceID: number): string;
    /**
     * Get the current value of an action.
     * @param actionID {number}  The integer ID of the action.
     * @returns {number} 
     */
    function getActionValue(actionID: number): number;
    /**
     * Find the ID of a specific controller from its device name.
     * @param deviceName {string}  The name of the device to find.
     * @returns {number} 
     */
    function findDevice(deviceName: string): number;
    /**
     * Get the names of all currently available controller devices plus "Actions", "Application", and "Standard".
     * @returns {Array.<string>} 
     */
    function getDeviceNames(): Array.<string>;
    /**
     * Find the ID of an action from its name.
     * @param actionName {string}  The name of the action: one of the {@link Controller.Actions} property names.
     * @returns {number} 
     */
    function findAction(actionName: string): number;
    /**
     * Get the names of all actions available as properties of  Controller.Actions.
     * @returns {Array.<string>} 
     */
    function getActionNames(): Array.<string>;
    /**
     * Get the value of a controller button or axis output. Note: Also gets the value of a controller axis output.
     * @param source {number}  The {@link Controller.Standard} or {@link Controller.Hardware} item.
     * @returns {number} 
     */
    function getValue(source: number): number;
    /**
     * Get the value of a controller axis output. Note: Also gets the value of a controller button output.
     * @param source {number}  The {@link Controller.Standard} or {@link Controller.Hardware} item.
     * @returns {number} 
     */
    function getAxisValue(source: number): number;
    /**
     * Get the value of a controller pose output.
     * @param source {number}  The {@link Controller.Standard} or {@link Controller.Hardware} pose output.
     * @returns {Pose} 
     */
    function getPoseValue(source: number): Pose;
    /**
     * Triggers a haptic pulse on connected and enabled devices that have the capability.
     * @param strength {number}  The strength of the haptic pulse, <code>0.0</code> &ndash; <code>1.0</code>.
     * @param duration {number}  The duration of the haptic pulse, in milliseconds.
     * @param hand {Controller.Hand}  The hand or hands to trigger the haptic pulse on.
     */
    function triggerHapticPulse(strength: number, duration: number, hand: Controller.Hand): void;
    /**
     * Triggers a 250ms haptic pulse on connected and enabled devices that have the capability.
     * @param strength {number}  The strength of the haptic pulse, <code>0.0</code> &ndash; <code>1.0</code>.
     * @param hand {Controller.Hand}  The hand or hands to trigger the haptic pulse on.
     */
    function triggerShortHapticPulse(strength: number, hand: Controller.Hand): void;
    /**
     * Triggers a haptic pulse on a particular device if connected and enabled and it has the capability.
     * @param deviceID {number}  The ID of the device to trigger the haptic pulse on.
     * @param strength {number}  The strength of the haptic pulse, <code>0.0</code> &ndash; <code>1.0</code>.
     * @param duration {number}  The duration of the haptic pulse, in milliseconds.
     * @param hand {Controller.Hand}  The hand or hands to trigger the haptic pulse on.
     */
    function triggerHapticPulseOnDevice(deviceID: number, strength: number, duration: number, hand: Controller.Hand): void;
    /**
     * Triggers a 250ms haptic pulse on a particular device if connected and enabled and it has the capability.
     * @param deviceID {number}  The ID of the device to trigger the haptic pulse on.
     * @param strength {number}  The strength of the haptic pulse, <code>0.0</code> &ndash; <code>1.0</code>.
     * @param hand {Controller.Hand}  The hand or hands to trigger the haptic pulse on.
     */
    function triggerShortHapticPulseOnDevice(deviceID: number, strength: number, hand: Controller.Hand): void;
    /**
     * Create a new controller mapping. Routes can then be added to the mapping using  MappingObject methods and 
     * routed to Standard controls, Actions, or script functions using  RouteObject methods. The mapping can then be enabled using  Controller.enableMapping for it to take effect.
     * @param mappingName {string}  A unique name for the mapping. If not specified a new UUID generated 
     *     by {@link Uuid.generate} is used.
     * @returns {MappingObject} 
     */
    function newMapping(mappingName: string): MappingObject;
    /**
     * Enable or disable a controller mapping. When enabled, the routes in the mapping have effect.
     * @param mappingName {string}  The name of the mapping.
     * @param enable {boolean}  If <code>true</code> then the mapping is enabled, otherwise it is disabled.
     */
    function enableMapping(mappingName: string, enable: boolean): void;
    /**
     * Disable a controller mapping. When disabled, the routes in the mapping have no effect.
     * @param mappingName {string}  The name of the mapping.
     */
    function disableMapping(mappingName: string): void;
    /**
     * Create a new controller mapping from a  Controller.MappingJSON string. Use 
     *  Controller.enableMapping to enable the mapping for it to take effect.
     * @param jsonString {string}  A JSON string of the {@link Controller.MappingJSON|MappingJSON}.
     * @returns {MappingObject} 
     */
    function parseMapping(jsonString: string): MappingObject;
    /**
     * Create a new controller mapping from a  Controller.MappingJSON JSON file at a URL. Use 
     *  Controller.enableMapping to enable the mapping for it to take effect.
     * @param jsonURL {string}  The URL the {@link Controller.MappingJSON|MappingJSON} JSON file.
     * @returns {MappingObject} 
     */
    function loadMapping(jsonURL: string): MappingObject;
    /**
     * Get the  Controller.Hardware property tree. Calling this function is the same as using the  Controller 
     * property, Controller.Hardware.
     * @returns {Controller.Hardware} 
     */
    function getHardware(): Controller.Hardware;
    /**
     * Get the  Controller.Actions property tree. Calling this function is the same as using the  Controller 
     * property, Controller.Actions.
     * @returns {Controller.Actions} 
     */
    function getActions(): Controller.Actions;
    /**
     * Get the  Controller.Standard property tree. Calling this function is the same as using the  Controller 
     * property, Controller.Standard.
     * @returns {Controller.Standard} 
     */
    function getStandard(): Controller.Standard;
    /**
     * Start making a recording of currently active controllers.
     */
    function startInputRecording(): void;
    /**
     * Stop making a recording started by  Controller.startInputRecording.
     */
    function stopInputRecording(): void;
    /**
     * Play back the current recording from the beginning. The current recording may have been recorded by 
     *  Controller.startInputRecording and  Controller.stopInputRecording, or loaded by  Controller.loadInputRecording. Playback repeats in a loop until  Controller.stopInputPlayback is called.
     */
    function startInputPlayback(): void;
    /**
     * Stop play back of a recording started by  Controller.startInputPlayback.
     */
    function stopInputPlayback(): void;
    /**
     * Save the current recording to a file. The current recording may have been recorded by
     *  Controller.startInputRecording and Controller.stopInputRecording, or loaded by Controller.loadInputRecording. It is saved in the directory returned by  Controller.getInputRecorderSaveDirectory.
     */
    function saveInputRecording(): void;
    /**
     * Load an input recording, ready for play back.
     * @param file {string}  The path to the recording file, prefixed by <code>"file:///"</code>.
     */
    function loadInputRecording(file: string): void;
    /**
     * Get the directory in which input recordings are saved.
     * @returns {string} 
     */
    function getInputRecorderSaveDirectory(): string;
    /**
     * Get all the active and enabled (running) input devices
     * @returns {Array.<string>} 
     */
    function getRunningInputDevices(): Array.<string>;
    /**
     * Disable processing of mouse "move", "press", "double-press", and "release" events into 
     *  Controller.Hardware outputs.
     */
    function captureMouseEvents(): void;
    /**
     * Enable processing of mouse "move", "press", "double-press", and "release" events into 
     *  Controller.Hardware-Keyboard outputs that were disabled using  Controller.captureMouseEvents.
     */
    function releaseMouseEvents(): void;
    /**
     * Disable processing of touch "begin", "update", and "end" events into 
     *  Controller.Hardware,  Controller.Hardware, and  Controller.Hardware outputs.
     */
    function captureTouchEvents(): void;
    /**
     * Enable processing of touch "begin", "update", and "end" events into 
     *  Controller.Hardware,  Controller.Hardware, and  Controller.Hardware outputs that were disabled using  Controller.captureTouchEvents.
     */
    function releaseTouchEvents(): void;
    /**
     * Disable processing of mouse wheel rotation events into  Controller.Hardware 
     * outputs.
     */
    function captureWheelEvents(): void;
    /**
     * Enable processing of mouse wheel rotation events into  Controller.Hardware 
     * outputs that wer disabled using  Controller.captureWheelEvents.
     */
    function releaseWheelEvents(): void;
    /**
     * Disable translating and rotating the user's avatar in response to keyboard and controller controls.
     */
    function captureActionEvents(): void;
    /**
     * Enable translating and rotating the user's avatar in response to keyboard and controller controls that were disabled 
     * using  Controller.captureActionEvents.
     */
    function releaseActionEvents(): void;
    /**
     * Triggered when an action occurs.
     * @param actionID {number}  The ID of the action, per {@link Controller.findAction|findAction}.
     * @param value {number}  The value associated with the action.
     * @returns {Signal} 
     */
    function actionEvent(actionID: number, value: number): Signal;
    /**
     * Triggered when there is a new controller input event.
     * @param action {number}  The input action, per {@link Controller.Standard}.
     * @param value {number}  The value associated with the input action.
     * @returns {Signal} 
     */
    function inputEvent(action: number, value: number): Signal;
    /**
     * Triggered when a device is registered or unregistered by a plugin. Not all plugins generate 
     * hardwareChanged events: for example connecting or disconnecting a mouse will not generate an event but connecting or disconnecting an Xbox controller will.
     * @returns {Signal} 
     */
    function hardwareChanged(): Signal;
    /**
     * Triggered when a device is enabled/disabled
     * Enabling/Disabling Leapmotion on settings/controls will trigger this signal.
     * @param deviceName {string}  The name of the device that is getting enabled/disabled
     * @param isEnabled {boolean}  Return if the device is enabled.
     * @returns {Signal} 
     */
    function deviceRunningChanged(deviceName: string, isEnabled: boolean): Signal;
    interface Standard {
    }

    interface MappingJSON {
        /**
         * The name of the mapping.
         */
        name: string;
        /**
         * An array of routes.
         */
        channels: Array.<Controller.MappingJSONRoute>;
    }

    interface MappingJSONRoute {
        /**
         * The name of a  Controller.Hardware property name or an axis 
         *     made from them. If a property name, the leading "Controller.Hardware." can be omitted.
         */
        from: string;
        /**
         * If true then peeking is enabled per  RouteObject#peek.
         */
        peek: boolean;
        /**
         * If true then debug is enabled per  RouteObject#debug.
         */
        debug: boolean;
        /**
         * One or more numeric  Controller.Hardware property names which are evaluated 
         *     as booleans and ANDed together. Prepend with a ! to use the logical NOT of the property value. The leading     "Controller.Hardware." can be omitted from the property names.
         */
        when: string;
        /**
         * One or more filters in the route.
         */
        filters: Controller.MappingJSONFilter;
        /**
         * The name of a  Controller.Actions or  Controller.Standard property. The leading 
         *     "Controller." can be omitted.
         */
        to: string;
    }

    interface MappingJSONAxis {
        /**
         * A two-member array of single-member arrays of  Controller.Hardware property names. 
         * The leading "Controller.Hardware." can be omitted from the property names.
         */
        makeAxis: Array.<Array.<string>>;
    }

    interface MappingJSONFilter {
        /**
         * The name of the filter, being the name of the one of the  RouteObject's filter methods.
         */
        type: string;
        /**
         * If the filter method has a first parameter, the property name is the name of that parameter and the 
         *     property value is the value to use.
         */
        ?: string;
        /**
         * If the filter method has a second parameter, the property name  is the name of that parameter and 
         *     the property value is the value to use.
         */
        ?: string;
    }

    interface Hardware-Keyboard {
    }

    interface Hardware-OculusTouch {
    }

    interface Hardware-Vive {
    }

    /**
     * Predefined actions on Interface and the user's avatar. These can be used as end
     *     points in a  RouteObject mapping. A synonym for Controller.Hardware.Actions.    Read-only.    Default mappings are provided from the Controller.Hardware.Keyboard and Controller.Standard to     actions in         keyboardMouse.json and         standard.json, respectively.
     */
    let Actions: Controller.Actions;
    /**
     * Standard and hardware-specific controller and computer outputs, plus predefined 
     *     actions on Interface and the user's avatar. The outputs can be mapped to Actions or functions in a      RouteObject mapping. Additionally, hardware-specific controller outputs can be mapped to Standard     controller outputs. Read-only.
     */
    let Hardware: Controller.Hardware;
    /**
     * Standard controller outputs that can be mapped to Actions or 
     *     functions in a  RouteObject mapping. Read-only.    Each hardware device has a mapping from its outputs to Controller.Standard items, specified in a JSON file.     For example,     leapmotion.json and     vive.json.
     */
    let Standard: Controller.Standard;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace Desktop {
    let width: number;
    let height: number;
    /**
     * InteractiveWindow flag for always showing a window on top
     */
    const ALWAYS_ON_TOP: number;
    /**
     * InteractiveWindow flag for hiding the window instead of closing on window close by user
     */
    const CLOSE_BUTTON_HIDES: number;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe GooglePoly API allows you to interact with Google Poly models direct from inside High Fidelity.
 */
declare namespace GooglePoly {
    /**
     * @param key {string}  
     */
    function setAPIKey(key: string): void;
    /**
     * @param keyword {string}  
     * @param category {string}  
     * @param format {string}  
     * @returns {string} 
     */
    function getAssetList(keyword: string, category: string, format: string): string;
    /**
     * @param keyword {string}  
     * @param category {string}  
     * @returns {string} 
     */
    function getFBX(keyword: string, category: string): string;
    /**
     * @param keyword {string}  
     * @param category {string}  
     * @returns {string} 
     */
    function getOBJ(keyword: string, category: string): string;
    /**
     * @param keyword {string}  
     * @param category {string}  
     * @returns {string} 
     */
    function getBlocks(keyword: string, category: string): string;
    /**
     * @param keyword {string}  
     * @param category {string}  
     * @returns {string} 
     */
    function getGLTF(keyword: string, category: string): string;
    /**
     * @param keyword {string}  
     * @param category {string}  
     * @returns {string} 
     */
    function getGLTF2(keyword: string, category: string): string;
    /**
     * @param keyword {string}  
     * @param category {string}  
     * @returns {string} 
     */
    function getTilt(keyword: string, category: string): string;
    /**
     * @param input {string}  
     * @returns {string} 
     */
    function getModelInfo(input: string): string;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe HMD API provides access to the HMD used in VR display mode.
 */
declare namespace HMD {
    /**
     * Calculate the intersection of a ray with the HUD overlay.
     * @param position {Vec3}  The origin of the ray.
     * @param direction {Vec3}  The direction of the ray.
     * @returns {Vec3} 
     */
    function calculateRayUICollisionPoint(position: Vec3, direction: Vec3): Vec3;
    /**
     * Get the 2D HUD overlay coordinates of a 3D point on the HUD overlay.
     * 2D HUD overlay coordinates are pixels with the origin at the top left of the overlay.
     * @param position {Vec3}  The point on the HUD overlay in world coordinates.
     * @returns {Vec2} 
     */
    function overlayFromWorldPoint(position: Vec3): Vec2;
    /**
     * Get the 3D world coordinates of a 2D point on the HUD overlay.
     * 2D HUD overlay coordinates are pixels with the origin at the top left of the overlay.
     * @param coordinates {Vec2}  The point on the HUD overlay in HUD coordinates.
     * @returns {Vec3} 
     */
    function worldPointFromOverlay(coordinates: Vec2): Vec3;
    /**
     * Get the 2D point on the HUD overlay represented by given spherical coordinates. 
     * 2D HUD overlay coordinates are pixels with the origin at the top left of the overlay.Spherical coordinates are polar coordinates in radians with { x: 0, y: 0 } being the center of the HUD overlay.
     * @param sphericalPos {Vec2}  The point on the HUD overlay in spherical coordinates.
     * @returns {Vec2} 
     */
    function sphericalToOverlay(sphericalPos: Vec2): Vec2;
    /**
     * Get the spherical coordinates of a 2D point on the HUD overlay.
     * 2D HUD overlay coordinates are pixels with the origin at the top left of the overlay.Spherical coordinates are polar coordinates in radians with { x: 0, y: 0 } being the center of the HUDoverlay.
     * @param overlayPos {Vec2}  The point on the HUD overlay in HUD coordinates.
     * @returns {Vec2} 
     */
    function overlayToSpherical(overlayPos: Vec2): Vec2;
    /**
     * Recenter the HMD HUD to the current HMD position and orientation.
     */
    function centerUI(): void;
    /**
     * Get the name of the HMD audio input device.
     * @returns {string} 
     */
    function preferredAudioInput(): string;
    /**
     * Get the name of the HMD audio output device.
     * @returns {string} 
     */
    function preferredAudioOutput(): string;
    /**
     * Check whether there is an HMD available.
     * @param name {string} [name=""] The name of the HMD to check for, e.g., <code>"Oculus Rift"</code>. The name is the same as 
     *     may be displayed in Interface's "Display" menu. If no name is specified then any HMD matches.
     * @returns {boolean} 
     */
    function isHMDAvailable(name: string): boolean;
    /**
     * Check whether there is an HMD head controller available.
     * @param name {string} [name=""] The name of the HMD head controller to check for, e.g., <code>"Oculus"</code>. If no name is 
     *     specified then any HMD head controller matches.
     * @returns {boolean} 
     */
    function isHeadControllerAvailable(name: string): boolean;
    /**
     * Check whether there are HMD hand controllers available.
     * @param name {string} [name=""] The name of the HMD hand controller to check for, e.g., <code>"Oculus"</code>. If no name is 
     *     specified then any HMD hand controller matches.
     * @returns {boolean} 
     */
    function isHandControllerAvailable(name: string): boolean;
    /**
     * Check whether there are specific HMD controllers available.
     * @param name {string}  The name of the HMD controller to check for, e.g., <code>"OculusTouch"</code>.
     * @returns {boolean} 
     */
    function isSubdeviceContainingNameAvailable(name: string): boolean;
    /**
     * Signal that models of the HMD hand controllers being used should be displayed. The models are displayed at their actual, 
     * real-world locations.
     */
    function requestShowHandControllers(): void;
    /**
     * Signal that it is no longer necessary to display models of the HMD hand controllers being used. If no other scripts 
     * want the models displayed then they are no longer displayed.
     */
    function requestHideHandControllers(): void;
    /**
     * Check whether any script wants models of the HMD hand controllers displayed. Requests are made and canceled using 
     *  HMD.requestShowHandControllers and  HMD.requestHideHandControllers.
     * @returns {boolean} 
     */
    function shouldShowHandControllers(): boolean;
    /**
     * Causes the borders in HUD windows to be enlarged when the laser intersects them in HMD mode. By default, borders are not 
     * enlarged.
     */
    function activateHMDHandMouse(): void;
    /**
     * Causes the border in HUD windows to no longer be enlarged when the laser intersects them in HMD mode. By default, 
     * borders are not enlarged.
     */
    function deactivateHMDHandMouse(): void;
    /**
     * Suppress the activation of the HMD-provided keyboard, if any. Successful calls should be balanced with a call to 
     *  HMD.unspressKeyboard within a reasonable amount of time.
     * @returns {boolean} 
     */
    function suppressKeyboard(): boolean;
    /**
     * Unsuppress the activation of the HMD-provided keyboard, if any.
     */
    function unsuppressKeyboard(): void;
    /**
     * Check whether the HMD-provided keyboard, if any, is visible.
     * @returns {boolean} 
     */
    function isKeyboardVisible(): boolean;
    /**
     * Closes the tablet if it is open.
     */
    function closeTablet(): void;
    /**
     * Opens the tablet if the tablet is used in the current display mode and it isn't already showing, and sets the tablet to 
     * contextual mode if requested. In contextual mode, the page displayed on the tablet is wholly controlled by script (i.e., the user cannot navigate to another).
     * @param contextualMode {boolean} [contextualMode=false] If <code>true</code> then the tablet is opened at a specific position and 
     *     orientation already set by the script, otherwise it opens at a position and orientation relative to the user. For     contextual mode, set the world or local position and orientation of the <code>HMD.tabletID</code> overlay.
     */
    function openTablet(contextualMode: boolean): void;
    /**
     * Triggered when a request to show or hide models of the HMD hand controllers is made using 
     *  HMD.requestShowHandControllers or HMD.requestHideHandControllers.
     * @returns {Signal} 
     */
    function shouldShowHandControllersChanged(): Signal;
    /**
     * Triggered when the HMD.ipdScale property value changes.
     * @returns {Signal} 
     */
    function IPDScaleChanged(): Signal;
    /**
     * Triggered when Interface's display mode changes and when the user puts on or takes off their HMD.
     * @param isHMDMode {boolean}  <code>true</code> if the display mode is HMD, otherwise <code>false</code>. This is the 
     *     same value as provided by <code>HMD.active</code>.
     * @returns {Signal} 
     */
    function displayModeChanged(isHMDMode: boolean): Signal;
    /**
     * Triggered when the HMD.mounted property value changes.
     * @returns {Signal} 
     */
    function mountedChanged(): Signal;
    /**
     * The position of the HMD if currently in VR display mode, otherwise
     *      Vec3. Read-only.
     */
    let position: Vec3;
    /**
     * The orientation of the HMD if currently in VR display mode, otherwise 
     *      Quat. Read-only.
     */
    let orientation: Quat;
    /**
     * true if the display mode is HMD, otherwise false. Read-only.
     */
    let active: boolean;
    /**
     * true if currently in VR display mode and the HMD is being worn, otherwise
     *     false. Read-only.
     */
    let mounted: boolean;
    /**
     * The real-world height of the user. Read-only. Currently always returns a
     *     value of 1.755.
     */
    let playerHeight: number;
    /**
     * The real-world height of the user's eyes. Read-only. Currently always returns a
     *     value of 1.655.
     */
    let eyeHeight: number;
    /**
     * The inter-pupillary distance (distance between eyes) of the user, used for rendering. Defaults to
     *     the human average of 0.064 unless set by the HMD. Read-only.
     */
    let ipd: number;
    /**
     * A scale factor applied to the ipd property value.
     */
    let ipdScale: number;
    /**
     * true if the tablet is being displayed, false otherwise.
     *     Read-only.
     */
    let showTablet: boolean;
    /**
     * true if the tablet has been opened in contextual mode, otherwise 
     *     false. In contextual mode, the tablet has been opened at a specific world position and orientation rather     than at a position and orientation relative to the user. Read-only.
     */
    let tabletContextualMode: boolean;
    /**
     * The UUID of the tablet body model overlay.
     */
    let tabletID: Uuid;
    /**
     * The UUID of the tablet's screen overlay.
     */
    let tabletScreenID: Uuid;
    /**
     * The UUID of the tablet's "home" button overlay.
     */
    let homeButtonID: Uuid;
    /**
     * The UUID of the tablet's "home" button highlight overlay.
     */
    let homeButtonHighlightID: Uuid;
    /**
     * The UUID of the mini tablet's body model overlay. null if not in HMD mode.
     */
    let miniTabletID: Uuid;
    /**
     * The UUID of the mini tablet's screen overlay. null if not in HMD mode.
     */
    let miniTabletScreenID: Uuid;
    /**
     * The hand that the mini tablet is displayed on: 0 for left hand, 
     *     1 for right hand, -1 if not in HMD mode.
     */
    let miniTabletHand: number;
    /**
     * The size and position of the HMD play area in sensor coordinates. Read-only.
     */
    let playArea: Rect;
    /**
     * The positions of the VR system sensors in sensor coordinates. Read-only.
     */
    let sensorPositions: Array.<Vec3>;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe Menu API provides access to the menu that is displayed at the top of the window
 * on a user's desktop and in the tablet when the "MENU" button is pressed.GroupingsA "grouping" provides a way to group a set of menus or menu items together so that they can all be set visible or invisible as a group. There are two available groups: "Advanced" and "Developer".These groupings can be toggled in the "Settings" menu.If a menu item doesn't belong to a group it is always displayed.
 */
declare namespace Menu {
    /**
     * Add a new top-level menu.
     * @param menuName {string}  Name that will be displayed for the menu. Nested menus can be described using the ">" symbol.
     * @param grouping {string} [grouping=undefined] Name of the grouping, if any, to add this menu to.
     */
    function addMenu(menuName: string, grouping: string): void;
    /**
     * Remove a top-level menu.
     * @param menuName {string}  Name of the menu to remove.
     */
    function removeMenu(menuName: string): void;
    /**
     * Check whether a top-level menu exists.
     * @param menuName {string}  Name of the menu to check for existence.
     * @returns {boolean} 
     */
    function menuExists(menuName: string): boolean;
    /**
     * Add a separator with an unclickable label below it. The separator will be placed at the bottom of the menu.
     * If you want to add a separator at a specific point in the menu, use  Menu.addMenuItem with Menu.MenuItemProperties instead.
     * @param menuName {string}  Name of the menu to add a separator to.
     * @param separatorName {string}  Name of the separator that will be displayed as the label below the separator line.
     */
    function addSeparator(menuName: string, separatorName: string): void;
    /**
     * Remove a separator from a menu.
     * @param menuName {string}  Name of the menu to remove the separator from.
     * @param separatorName {string}  Name of the separator to remove.
     */
    function removeSeparator(menuName: string, separatorName: string): void;
    /**
     * Add a new menu item to a menu.
     * @param properties {Menu.MenuItemProperties}  Properties of the menu item to create.
     */
    function addMenuItem(properties: Menu.MenuItemProperties): void;
    /**
     * Add a new menu item to a menu. The new item is added at the end of the menu.
     * @param menuName {string}  Name of the menu to add a menu item to.
     * @param menuItem {string}  Name of the menu item. This is what will be displayed in the menu.
     * @param shortcutKey {string} [shortcutKey=undefined] A shortcut key that can be used to trigger the menu item.
     */
    function addMenuItem(menuName: string, menuItem: string, shortcutKey: string): void;
    /**
     * Remove a menu item from a menu.
     * @param menuName {string}  Name of the menu to remove a menu item from.
     * @param menuItem {string}  Name of the menu item to remove.
     * Menu.removeMenuItem("Developer", "Test");
     */
    function removeMenuItem(menuName: string, menuItem: string): void;
    /**
     * Check if a menu item exists.
     * @param menuName {string}  Name of the menu that the menu item is in.
     * @param menuItem {string}  Name of the menu item to check for existence of.
     * @returns {boolean} 
     */
    function menuItemExists(menuName: string, menuItem: string): boolean;
    /**
     * Check whether a checkable menu item is checked.
     * @param menuOption {string}  The name of the menu item.
     * @returns {boolean} 
     */
    function isOptionChecked(menuOption: string): boolean;
    /**
     * Set a checkable menu item as checked or unchecked.
     * @param menuOption {string}  The name of the menu item to modify.
     * @param isChecked {boolean}  If <code>true</code>, the menu item will be checked, otherwise it will not be checked.
     */
    function setIsOptionChecked(menuOption: string, isChecked: boolean): void;
    /**
     * Trigger the menu item as if the user clicked on it.
     * @param menuOption {string}  The name of the menu item to trigger.
     */
    function triggerOption(menuOption: string): void;
    /**
     * Check whether a menu or menu item is enabled. If disabled, the item is grayed out and unusable.
     * Menus are enabled by default.
     * @param menuName {string}  The name of the menu or menu item to check.
     * @returns {boolean} 
     */
    function isMenuEnabled(menuName: string): boolean;
    /**
     * Set a menu or menu item to be enabled or disabled. If disabled, the item is grayed out and unusable.
     * @param menuName {string}  The name of the menu or menu item to modify.
     * @param isEnabled {boolean}  If <code>true</code>, the menu will be enabled, otherwise it will be disabled.
     */
    function setMenuEnabled(menuName: string, isEnabled: boolean): void;
    /**
     * Triggered when a menu item is clicked (or triggered by  Menu.triggerOption).
     * @param menuItem {string}  Name of the menu item that was clicked.
     * @returns {Signal} 
     */
    function menuItemEvent(menuItem: string): Signal;
    interface MenuItemProperties {
        /**
         * Name of the menu. Nested menus can be described using the ">" symbol.
         */
        menuName: string;
        /**
         * Name of the menu item.
         */
        menuItemName: string;
        /**
         * Whether or not the menu item is checkable.
         */
        isCheckable: boolean;
        /**
         * Whether or not the menu item is checked.
         */
        isChecked: boolean;
        /**
         * Whether or not the menu item is a separator.
         */
        isSeparator: boolean;
        /**
         * A shortcut key that triggers the menu item.
         */
        shortcutKey: string;
        /**
         * A  KeyEvent that specifies a key that triggers the menu item.
         */
        shortcutKeyEvent: KeyEvent;
        /**
         * The position to place the new menu item. An integer number with 0 being the first
         *     menu item.
         */
        position: number;
        /**
         * The name of the menu item to place this menu item before.
         */
        beforeItem: string;
        /**
         * The name of the menu item to place this menu item after.
         */
        afterItem: string;
        /**
         * The name of grouping to add this menu item to.
         */
        grouping: string;
    }

}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe Selection API provides a means of grouping together avatars, entities, and overlays in named lists.
 */
declare namespace Selection {
    interface SelectedItemsList {
        /**
         * The IDs of the avatars in the selection.
         */
        avatars: Array.<Uuid>;
        /**
         * The IDs of the entities in the selection.
         */
        entities: Array.<Uuid>;
        /**
         * The IDs of the overlays in the selection.
         */
        overlays: Array.<Uuid>;
    }

    interface HighlightStyle {
        /**
         * Color of the specified highlight region.
         */
        outlineUnoccludedColor: Color;
        /**
         * ""
         */
        outlineOccludedColor: Color;
        /**
         * ""
         */
        fillUnoccludedColor-: Color;
        /**
         * ""
         */
        fillOccludedColor-: Color;
        /**
         * Alpha value ranging from 0.0 (not visible) to 1.0 
         *     (fully opaque) for the specified highlight region.
         */
        outlineUnoccludedAlpha: number;
        /**
         * ""
         */
        outlineOccludedAlpha: number;
        /**
         * ""
         */
        fillUnoccludedAlpha: number;
        /**
         * ""
         */
        fillOccludedAlpha: number;
        /**
         * Width of the outline, in pixels.
         */
        outlineWidth: number;
        /**
         * true to enable outline smooth fall-off.
         */
        isOutlineSmooth: boolean;
    }

    /**
     * Get the names of all the selection lists.
     * @returns {Array.<list>} 
     */
    function getListNames(): Array.<list>;
    /**
     * Delete a named selection list.
     * @param listName {string}  The name of the selection list.
     * @returns {boolean} 
     */
    function removeListFromMap(listName: string): boolean;
    /**
     * Add an item to a selection list.
     * @param listName {string}  The name of the selection list to add the item to.
     * @param itemType {Selection.ItemType}  The type of the item being added.
     * @param id {Uuid}  The ID of the item to add to the selection.
     * @returns {boolean} 
     */
    function addToSelectedItemsList(listName: string, itemType: Selection.ItemType, id: Uuid): boolean;
    /**
     * Remove an item from a selection list.
     * @param listName {string}  The name of the selection list to remove the item from.
     * @param itemType {Selection.ItemType}  The type of the item being removed.
     * @param id {Uuid}  The ID of the item to remove.
     * @returns {boolean} 
     */
    function removeFromSelectedItemsList(listName: string, itemType: Selection.ItemType, id: Uuid): boolean;
    /**
     * Remove all items from a selection.
     * @param listName {string}  The name of the selection list.
     * @returns {boolean} 
     */
    function clearSelectedItemsList(listName: string): boolean;
    /**
     * Print out the list of avatars, entities, and overlays in a selection to the debug log (not the script log).
     * @param listName {string}  The name of the selection list.
     */
    function printList(listName: string): void;
    /**
     * Get the list of avatars, entities, and overlays stored in a selection list.
     * @param listName {string}  The name of the selection list.
     * @returns {Selection.SelectedItemsList} 
     */
    function getSelectedItemsList(listName: string): Selection.SelectedItemsList;
    /**
     * Get the names of the highlighted selection lists.
     * @returns {Array.<string>} 
     */
    function getHighlightedListNames(): Array.<string>;
    /**
     * Enable highlighting for a selection list.
     * If the selection list doesn't exist, it will be created.All objects in the list will be displayed with the highlight effect specified.The function can be called several times with different values in the style to modify it.Note: This function implicitly calls  Selection.enableListToScene.
     * @param listName {string}  The name of the selection list.
     * @param highlightStyle {Selection.HighlightStyle}  The highlight style.
     * @returns {boolean} 
     */
    function enableListHighlight(listName: string, highlightStyle: Selection.HighlightStyle): boolean;
    /**
     * Disable highlighting for the selection list.
     * If the selection list doesn't exist or wasn't enabled for highlighting then nothing happens and false isreturned.Note: This function implicitly calls  Selection.disableListToScene.
     * @param listName {string}  The name of the selection list.
     * @returns {boolean} 
     */
    function disableListHighlight(listName: string): boolean;
    /**
     * Enable scene selection for the selection list.
     * If the Selection doesn't exist, it will be created.All objects in the list will be sent to a scene selection.
     * @param listName {string}  The name of the selection list.
     * @returns {boolean} 
     */
    function enableListToScene(listName: string): boolean;
    /**
     * Disable scene selection for the named selection.
     * If the selection list doesn't exist or wasn't enabled on the scene then nothing happens and false isreturned.
     * @param listName {string}  The name of the selection list.
     * @returns {boolean} 
     */
    function disableListToScene(listName: string): boolean;
    /**
     * Get the highlight style values for the a selection list.
     * If the selection doesn't exist or hasn't been highlight enabled yet, an empty object is returned.
     * @param listName {string}  The name of the selection list.
     * @returns {Selection.HighlightStyle} 
     */
    function getListHighlightStyle(listName: string): Selection.HighlightStyle;
    /**
     * Triggered when a list's content changes.
     * @param listName {string}  The name of the selection list that changed.
     * @returns {Signal} 
     */
    function selectedItemsListChanged(listName: string): Signal;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe Settings API provides a facility to store and retrieve values that persist between Interface runs.
 */
declare namespace Settings {
    /**
     * Retrieve the value from a named setting.
     * @param key {string}  The name of the setting.
     * @param defaultValue {string} [defaultValue=""] The value to return if the setting doesn't exist.
     * @returns {string} 
     */
    function getValue(key: string, defaultValue: string): string;
    /**
     * Store a value in a named setting. If the setting already exists its value is overwritten, otherwise a new setting is 
     * created. If the value is set to null or undefined, the setting is deleted.
     * @param key {string}  The name of the setting. Be sure to use a unique name if creating a new setting.
     * @param value {string}  The value to store in the setting. If <code>null</code> or 
     *     <code>undefined</code> is specified, the setting is deleted.
     */
    function setValue(key: string, value: string): void;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace Wallet {
    function refreshWalletStatus(): void;
    /**
     * @returns {number} 
     */
    function getWalletStatus(): number;
    /**
     * @param entityID {Uuid}  
     */
    function proveAvatarEntityOwnershipVerification(entityID: Uuid): void;
    /**
     * @returns {Signal} 
     */
    function walletStatusChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function walletNotSetup(): Signal;
    /**
     * @param entityID {Uuid}  
     * @returns {Signal} 
     */
    function ownershipVerificationSuccess(entityID: Uuid): Signal;
    /**
     * @param entityID {Uuid}  
     * @returns {Signal} 
     */
    function ownershipVerificationFailed(entityID: Uuid): Signal;
    let walletStatus: number;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe Window API provides various facilities not covered elsewhere: window dimensions, window focus, normal or entity camera
 * view, clipboard, announcements, user connections, common dialog boxes, snapshots, file import, domain changes, domain physics.
 */
declare namespace Window {
    /**
     * Check if the Interface window has focus.
     * @returns {boolean} 
     */
    function hasFocus(): boolean;
    /**
     * Make the Interface window have focus. On Windows, if Interface doesn't already have focus, the task bar icon flashes to 
     * indicate that Interface wants attention but focus isn't taken away from the application that the user is using.
     */
    function setFocus(): void;
    /**
     * Raise the Interface window if it is minimized. If raised, the window gains focus.
     */
    function raise(): void;
    /**
     * Display a dialog with the specified message and an "OK" button. The dialog is non-modal; the script continues without
     * waiting for a user response.
     * @param message {string} [message=""] The message to display.
     */
    function alert(message: string): void;
    /**
     * Prompt the user to confirm something. Displays a modal dialog with a message plus "Yes" and "No" buttons.
     * responds.
     * @param message {string} [message=""] The question to display.
     * @returns {boolean} 
     */
    function confirm(message: string): boolean;
    /**
     * Prompt the user to enter some text. Displays a modal dialog with a message and a text box, plus "OK" and "Cancel" 
     * buttons.
     * @param message {string}  The question to display.
     * @param defaultText {string}  The default answer text.
     * @returns {string} 
     */
    function prompt(message: string, defaultText: string): string;
    /**
     * Prompt the user to enter some text. Displays a non-modal dialog with a message and a text box, plus "OK" and "Cancel" 
     * buttons. A  Window.promptTextChanged signal is emitted when the user OKs the dialog; no signal is emitted if the user cancels the dialog.
     * @param message {string} [message=""] The question to display.
     * @param defaultText {string} [defaultText=""] The default answer text.
     */
    function promptAsync(message: string, defaultText: string): void;
    /**
     * Prompt the user to choose a directory. Displays a modal dialog that navigates the directory tree.
     * @param title {string} [title=""] The title to display at the top of the dialog.
     * @param directory {string} [directory=""] The initial directory to start browsing at.
     * @returns {string} 
     */
    function browseDir(title: string, directory: string): string;
    /**
     * Prompt the user to choose a directory. Displays a non-modal dialog that navigates the directory tree. A
     *  Window.browseDirChanged signal is emitted when a directory is chosen; no signal is emitted ifthe user cancels the dialog.
     * @param title {string} [title=""] The title to display at the top of the dialog.
     * @param directory {string} [directory=""] The initial directory to start browsing at.
     */
    function browseDirAsync(title: string, directory: string): void;
    /**
     * Prompt the user to choose a file. Displays a modal dialog that navigates the directory tree.
     * @param title {string} [title=""] The title to display at the top of the dialog.
     * @param directory {string} [directory=""] The initial directory to start browsing at.
     * @param nameFilter {string} [nameFilter=""] The types of files to display. Examples: <code>"*.json"</code> and 
     *     <code>"Images (*.png *.jpg *.svg)"</code>. All files are displayed if a filter isn't specified.
     * @returns {string} 
     */
    function browse(title: string, directory: string, nameFilter: string): string;
    /**
     * Prompt the user to choose a file. Displays a non-modal dialog that navigates the directory tree. A
     *  Window.browseChanged signal is emitted when a file is chosen; no signal is emitted if the usercancels the dialog.
     * @param title {string} [title=""] The title to display at the top of the dialog.
     * @param directory {string} [directory=""] The initial directory to start browsing at.
     * @param nameFilter {string} [nameFilter=""] The types of files to display. Examples: <code>"*.json"</code> and
     *     <code>"Images (*.png *.jpg *.svg)"</code>. All files are displayed if a filter isn't specified.
     */
    function browseAsync(title: string, directory: string, nameFilter: string): void;
    /**
     * Prompt the user to specify the path and name of a file to save to. Displays a model dialog that navigates the directory
     * tree and allows the user to type in a file name.
     * @param title {string} [title=""] The title to display at the top of the dialog.
     * @param directory {string} [directory=""] The initial directory to start browsing at.
     * @param nameFilter {string} [nameFilter=""] The types of files to display. Examples: <code>"*.json"</code> and
     *     <code>"Images (*.png *.jpg *.svg)"</code>. All files are displayed if a filter isn't specified.
     * @returns {string} 
     */
    function save(title: string, directory: string, nameFilter: string): string;
    /**
     * Prompt the user to specify the path and name of a file to save to. Displays a non-model dialog that navigates the
     * directory tree and allows the user to type in a file name. A  Window.saveFileChanged signal isemitted when a file is specified; no signal is emitted if the user cancels the dialog.
     * @param title {string} [title=""] The title to display at the top of the dialog.
     * @param directory {string} [directory=""] The initial directory to start browsing at.
     * @param nameFilter {string} [nameFilter=""] The types of files to display. Examples: <code>"*.json"</code> and
     *     <code>"Images (*.png *.jpg *.svg)"</code>. All files are displayed if a filter isn't specified.
     */
    function saveAsync(title: string, directory: string, nameFilter: string): void;
    /**
     * Prompt the user to choose an Asset Server item. Displays a modal dialog that navigates the tree of assets on the Asset
     * Server.
     * @param title {string} [title=""] The title to display at the top of the dialog.
     * @param directory {string} [directory=""] The initial directory to start browsing at.
     * @param nameFilter {string} [nameFilter=""] The types of files to display. Examples: <code>"*.json"</code> and 
     *     <code>"Images (*.png *.jpg *.svg)"</code>. All files are displayed if a filter isn't specified.
     * @returns {string} 
     */
    function browseAssets(title: string, directory: string, nameFilter: string): string;
    /**
     * Prompt the user to choose an Asset Server item. Displays a non-modal dialog that navigates the tree of assets on the 
     * Asset Server. A  Window.assetsDirChanged signal is emitted when an asset is chosen; no signal isemitted if the user cancels the dialog.
     * @param title {string} [title=""] The title to display at the top of the dialog.
     * @param directory {string} [directory=""] The initial directory to start browsing at.
     * @param nameFilter {string} [nameFilter=""] The types of files to display. Examples: <code>"*.json"</code> and
     *     <code>"Images (*.png *.jpg *.svg)"</code>. All files are displayed if a filter isn't specified.
     */
    function browseAssetsAsync(title: string, directory: string, nameFilter: string): void;
    /**
     * Open the Asset Browser dialog. If a file to upload is specified, the user is prompted to enter the folder and name to
     * map the file to on the asset server.
     * @param uploadFile {string} [uploadFile=""] The path and name of a file to upload to the asset server.
     */
    function showAssetServer(uploadFile: string): void;
    /**
     * Get Interface's build number.
     * @returns {string} 
     */
    function checkVersion(): string;
    /**
     * Get the signature for Interface's protocol version.
     * @returns {string} 
     */
    function protocolSignature(): string;
    /**
     * Copies text to the operating system's clipboard.
     * @param text {string}  The text to copy to the operating system's clipboard.
     */
    function copyToClipboard(text: string): void;
    /**
     * Takes a snapshot of the current Interface view from the primary camera. When a still image only is captured, 
     *  Window.stillSnapshotTaken is emitted; when a still image plus moving images are captured,  Window.processingGifStarted and  Window.processingGifCompletedare emitted. The path to store the snapshots and the length of the animated GIF to capture are specified in Settings >General > Snapshots.If user has supplied a specific filename for the snapshot:    If the user's requested filename has a suffix that's contained within SUPPORTED_IMAGE_FORMATS,        DON'T append ".jpg" to the filename. QT will save the image in the format associated with the        filename's suffix.        If you want lossless Snapshots, supply a `.png` filename. Otherwise, use `.jpeg` or `.jpg`.    Otherwise, ".jpg" is appended to the user's requested filename so that the image is saved in JPG format.If the user hasn't supplied a specific filename for the snapshot:    Save the snapshot in JPG format according to FILENAME_PATH_FORMAT
     * @param notify {boolean} [notify=true] This value is passed on through the {@link Window.stillSnapshotTaken|stillSnapshotTaken}
     *     signal.
     * @param includeAnimated {boolean} [includeAnimated=false] If <code>true</code>, a moving image is captured as an animated GIF in addition 
     *     to a still image.
     * @param aspectRatio {number} [aspectRatio=0] The width/height ratio of the snapshot required. If the value is <code>0</code> the
     *     full resolution is used (window dimensions in desktop mode; HMD display dimensions in HMD mode), otherwise one of the    dimensions is adjusted in order to match the aspect ratio.
     * @param filename {string} [filename=""] If this parameter is not given, the image will be saved as "hifi-snap-by-&lt;user name&gt-YYYY-MM-DD_HH-MM-SS".
     *     If this parameter is <code>""</code> then the image will be saved as ".jpg".    Otherwise, the image will be saved to this filename, with an appended ".jpg".
     */
    function takeSnapshot(notify: boolean, includeAnimated: boolean, aspectRatio: number, filename: string): void;
    /**
     * Takes a still snapshot of the current view from the secondary camera that can be set up through the  Render API.
     * @param notify {boolean} [notify=true] This value is passed on through the {@link Window.stillSnapshotTaken|stillSnapshotTaken}
     *     signal.
     * @param filename {string} [filename=""] If this parameter is not given, the image will be saved as "hifi-snap-by-&lt;user name&gt;-YYYY-MM-DD_HH-MM-SS".
     *     If this parameter is <code>""</code> then the image will be saved as ".jpg".    Otherwise, the image will be saved to this filename, with an appended ".jpg".
     */
    function takeSecondaryCameraSnapshot(notify: boolean, filename: string): void;
    /**
     * Takes a 360&deg; snapshot at a given position for the secondary camera. The secondary camera does not need to have been 
     *     set up.
     * @param cameraPosition {Vec3}  The position of the camera for the snapshot.
     * @param cubemapOutputFormat {boolean} [cubemapOutputFormat=false] If <code>true</code> then the snapshot is saved as a cube map image, 
     *     otherwise is saved as an equirectangular image.
     * @param notify {boolean} [notify=true] This value is passed on through the {@link Window.stillSnapshotTaken|stillSnapshotTaken}
     *     signal.
     * @param filename {string} [filename=""] If this parameter is not supplied, the image will be saved as "hifi-snap-by-&lt;user name&gt;-YYYY-MM-DD_HH-MM-SS".
     *     If this parameter is <code>""</code> then the image will be saved as ".jpg".    Otherwise, the image will be saved to this filename, with an appended ".jpg".
     */
    function takeSecondaryCamera360Snapshot(cameraPosition: Vec3, cubemapOutputFormat: boolean, notify: boolean, filename: string): void;
    /**
     * Emit a  Window.connectionAdded or a  Window.connectionError signal that
     * indicates whether or not a user connection was successfully made using the Web API.
     * @param success {boolean}  If <code>true</code> then {@link Window.connectionAdded|connectionAdded} is emitted, otherwise
     *     {@link Window.connectionError|connectionError} is emitted.
     * @param description {string}  Descriptive text about the connection success or error. This is sent in the signal emitted.
     */
    function makeConnection(success: boolean, description: string): void;
    /**
     * Display a notification message. Notifications are displayed in panels by the default script, nofications.js. An
     *  Window.announcement signal is emitted when this function is called.
     * @param message {string}  The announcement message.
     */
    function displayAnnouncement(message: string): void;
    /**
     * Prepare a snapshot ready for sharing. A  Window.snapshotShared signal is emitted when the snapshot
     * has been prepared.
     * @param path {string}  The path and name of the image file to share.
     * @param href {string} [href=""] The metaverse location where the snapshot was taken.
     */
    function shareSnapshot(path: string, href: string): void;
    /**
     * Check to see if physics is active for you in the domain you're visiting - there is a delay between your arrival at a
     * domain and physics becoming active for you in that domain.
     * @returns {boolean} 
     */
    function isPhysicsEnabled(): boolean;
    /**
     * Set what to show on the PC display: normal view or entity camera view. The entity camera is configured using
     *  Camera.setCameraEntity and  Camera.
     * @param texture {Window.DisplayTexture}  The view to display.
     * @returns {boolean} 
     */
    function setDisplayTexture(texture: Window.DisplayTexture): boolean;
    /**
     * Check if a 2D point is within the desktop window if in desktop mode, or the drawable area of the HUD overlay if in HMD
     * mode.
     * @param point {Vec2}  The point to check.
     * @returns {boolean} 
     */
    function isPointOnDesktopWindow(point: Vec2): boolean;
    /**
     * Get the size of the drawable area of the Interface window if in desktop mode or the HMD rendering surface if in HMD mode.
     * @returns {Vec2} 
     */
    function getDeviceSize(): Vec2;
    /**
     * Gets the last domain connection error when a connection is refused.
     * @returns {Window.ConnectionRefusedReason} 
     */
    function getLastDomainConnectionError(): Window.ConnectionRefusedReason;
    /**
     * Open a non-modal message box that can have a variety of button combinations. See also, 
     *  Window.updateMessageBox and  Window.closeMessageBox.
     * @param title {string}  The title to display for the message box.
     * @param text {string}  Text to display in the message box.
     * @param buttons {Window.MessageBoxButton}  The buttons to display on the message box; one or more button values added
     *     together.
     * @param defaultButton {Window.MessageBoxButton}  The button that has focus when the message box is opened.
     * @returns {number} 
     */
    function openMessageBox(title: string, text: string, buttons: Window.MessageBoxButton, defaultButton: Window.MessageBoxButton): number;
    /**
     * Open a URL in the Interface window or other application, depending on the URL's scheme. If the URL starts with 
     * hifi:// then that URL is navigated to in Interface, otherwise the URL is opened in the application the OS associates with the URL's scheme (e.g., a Web browser for http://).
     * @param url {string}  The URL to open.
     */
    function openUrl(url: string): void;
    /**
     * Open an Android activity and optionally return back to the scene when the activity is completed. Android only.
     * @param activityName {string}  The name of the activity to open: one of <code>"Home"</code>, <code>"Login"</code>, or 
     *     <code>"Privacy Policy"</code>.
     * @param backToScene {boolean}  If <code>true</code>, the user is automatically returned back to the scene when the 
     *     activity is completed.
     */
    function openAndroidActivity(activityName: string, backToScene: boolean): void;
    /**
     * Update the content of a message box that was opened with  Window.openMessageBox.
     * @param id {number}  The ID of the message box.
     * @param title {string}  The title to display for the message box.
     * @param text {string}  Text to display in the message box.
     * @param buttons {Window.MessageBoxButton}  The buttons to display on the message box; one or more button values added
     *     together.
     * @param defaultButton {Window.MessageBoxButton}  The button that has focus when the message box is opened.
     */
    function updateMessageBox(id: number, title: string, text: string, buttons: Window.MessageBoxButton, defaultButton: Window.MessageBoxButton): void;
    /**
     * Close a message box that was opened with  Window.openMessageBox.
     * @param id {number}  The ID of the message box.
     */
    function closeMessageBox(id: number): void;
    /**
     * Triggered when you change the domain you're visiting. Warning: Is not emitted if you go to a domain 
     * that isn't running.
     * @param domainURL {string}  The domain's URL.
     * @returns {Signal} 
     */
    function domainChanged(domainURL: string): Signal;
    /**
     * Triggered when you try to navigate to a *.json, *.svo, or *.svo.json URL in a Web browser within Interface.
     * @param url {string}  The URL of the file to import.
     * @returns {Signal} 
     */
    function svoImportRequested(url: string): Signal;
    /**
     * Triggered when you try to visit a domain but are refused connection.
     * @param reasonMessage {string}  A description of the refusal.
     * @param reasonCode {Window.ConnectionRefusedReason}  Integer number that enumerates the reason for the refusal.
     * @param extraInfo {string}  Extra information about the refusal.
     * @returns {Signal} 
     */
    function domainConnectionRefused(reasonMessage: string, reasonCode: Window.ConnectionRefusedReason, extraInfo: string): Signal;
    /**
     * Triggered when you try to visit a domain but are redirected into the error state.
     * @param isInErrorState {boolean}  If <code>true</code>, the user has been redirected to the error URL.
     * @returns {Signal} 
     */
    function redirectErrorStateChanged(isInErrorState: boolean): Signal;
    /**
     * Triggered when a still snapshot has been taken by calling  Window.takeSnapshot with 
     *     includeAnimated = false or  Window.takeSecondaryCameraSnapshot.
     * @param pathStillSnapshot {string}  The path and name of the snapshot image file.
     * @param notify {boolean}  The value of the <code>notify</code> parameter that {@link Window.takeSnapshot|takeSnapshot}
     *     was called with.
     * @returns {Signal} 
     */
    function stillSnapshotTaken(pathStillSnapshot: string, notify: boolean): Signal;
    /**
     * Triggered when a still 360&deg; snapshot has been taken by calling 
     *      Window.takeSecondaryCamera360Snapshot.
     * @param pathStillSnapshot {string}  The path and name of the snapshot image file.
     * @param notify {boolean}  The value of the <code>notify</code> parameter that {@link Window.takeSecondaryCamera360Snapshot|takeSecondaryCamera360Snapshot}
     *     was called with.
     * @returns {Signal} 
     */
    function snapshot360Taken(pathStillSnapshot: string, notify: boolean): Signal;
    /**
     * Triggered when a snapshot submitted via  Window.shareSnapshot is ready for sharing. The snapshot
     * may then be shared via the  Account.metaverseServerURL Web API.
     * @param isError {boolean}  <code>true</code> if an error was encountered preparing the snapshot for sharing, otherwise
     *     <code>false</code>.
     * @param reply {string}  JSON-formatted information about the snapshot.
     * @returns {Signal} 
     */
    function snapshotShared(isError: boolean, reply: string): Signal;
    /**
     * Triggered when the snapshot images have been captured by  Window.takeSnapshot and the GIF is
     *     starting to be processed.
     * @param pathStillSnapshot {string}  The path and name of the still snapshot image file.
     * @returns {Signal} 
     */
    function processingGifStarted(pathStillSnapshot: string): Signal;
    /**
     * Triggered when a GIF has been prepared of the snapshot images captured by  Window.takeSnapshot.
     * @param pathAnimatedSnapshot {string}  The path and name of the moving snapshot GIF file.
     * @returns {Signal} 
     */
    function processingGifCompleted(pathAnimatedSnapshot: string): Signal;
    /**
     * Triggered when you've successfully made a user connection.
     * @param message {string}  A description of the success.
     * @returns {Signal} 
     */
    function connectionAdded(message: string): Signal;
    /**
     * Triggered when you failed to make a user connection.
     * @param message {string}  A description of the error.
     * @returns {Signal} 
     */
    function connectionError(message: string): Signal;
    /**
     * Triggered when a message is announced by  Window.displayAnnouncement.
     * @param message {string}  The message text.
     * @returns {Signal} 
     */
    function announcement(message: string): Signal;
    /**
     * Triggered when the user closes a message box that was opened with  Window.openMessageBox.
     * @param id {number}  The ID of the message box that was closed.
     * @param button {number}  The button that the user clicked. If the user presses Esc, the Cancel button value is returned,
     *    whether or not the Cancel button is displayed in the message box.
     * @returns {Signal} 
     */
    function messageBoxClosed(id: number, button: number): Signal;
    /**
     * Triggered when the user chooses a directory in a  Window.browseDirAsync dialog.
     * @param directory {string}  The directory the user chose in the dialog.
     * @returns {Signal} 
     */
    function browseDirChanged(directory: string): Signal;
    /**
     * Triggered when the user chooses an asset in a  Window.browseAssetsAsync dialog.
     * @param asset {string}  The path and name of the asset the user chose in the dialog.
     * @returns {Signal} 
     */
    function assetsDirChanged(asset: string): Signal;
    /**
     * Triggered when the user specifies a file in a  Window.saveAsync dialog.
     * @param filename {string}  The path and name of the file that the user specified in the dialog.
     * @returns {Signal} 
     */
    function saveFileChanged(filename: string): Signal;
    /**
     * Triggered when the user chooses a file in a  Window.browseAsync dialog.
     * @param filename {string}  The path and name of the file the user chose in the dialog.
     * @returns {Signal} 
     */
    function browseChanged(filename: string): Signal;
    /**
     * Triggered when the user OKs a  Window.promptAsync dialog.
     * @param text {string}  The text the user entered in the dialog.
     * @returns {Signal} 
     */
    function promptTextChanged(text: string): Signal;
    /**
     * Triggered when the position or size of the Interface window changes.
     * @param geometry {Rect}  The position and size of the drawable area of the Interface window.
     * @returns {Signal} 
     */
    function geometryChanged(geometry: Rect): Signal;
    /**
     * The width of the drawable area of the Interface window (i.e., without borders or other
     *     chrome), in pixels. Read-only.
     */
    let innerWidth: number;
    /**
     * The height of the drawable area of the Interface window (i.e., without borders or other
     *     chrome), in pixels. Read-only.
     */
    let innerHeight: number;
    /**
     * Provides facilities for working with your current metaverse location. See  location.
     */
    let location: object;
    /**
     * The x display coordinate of the top left corner of the drawable area of the Interface window. 
     *     Read-only.
     */
    let x: number;
    /**
     * The y display coordinate of the top left corner of the drawable area of the Interface window. 
     *     Read-only.
     */
    let y: number;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsAPI to help manage your Avatar's input
 */
declare namespace AvatarInputs {
    /**
     * @param loudness {number}  
     * @returns {number} 
     */
    function loudnessToAudioLevel(loudness: number): number;
    /**
     * @param showAudioTools {boolean}  
     */
    function setShowAudioTools(showAudioTools: boolean): void;
    /**
     * @returns {Signal} 
     */
    function cameraEnabledChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function cameraMutedChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function isHMDChanged(): Signal;
    /**
     * @param show {boolean}  
     * @returns {Signal} 
     */
    function showAudioToolsChanged(show: boolean): Signal;
    function resetSensors(): void;
    function toggleCameraMute(): void;
    /**
     * Read-only.
     */
    let cameraEnabled: boolean;
    /**
     * Read-only.
     */
    let cameraMuted: boolean;
    /**
     * Read-only.
     */
    let isHMD: boolean;
    let showAudioTools: boolean;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace Snapshot {
    /**
     * @param location {string}  
     * @returns {Signal} 
     */
    function snapshotLocationSet(location: string): Signal;
    /**
     * @returns {string} 
     */
    function getSnapshotsLocation(): string;
    /**
     * @param location {String}  
     */
    function setSnapshotsLocation(location: String): void;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client Scripts
 */
declare namespace Stats {
    /**
     * Triggered when the value of the longsubmits property changes.
     * @returns {Signal} 
     */
    function longsubmitsChanged(): Signal;
    /**
     * Triggered when the value of the longrenders property changes.
     * @returns {Signal} 
     */
    function longrendersChanged(): Signal;
    /**
     * Triggered when the value of the longframes property changes.
     * @returns {Signal} 
     */
    function longframesChanged(): Signal;
    /**
     * Triggered when the value of the appdropped property changes.
     * @returns {Signal} 
     */
    function appdroppedChanged(): Signal;
    /**
     * Triggered when the value of the expanded property changes.
     * @returns {Signal} 
     */
    function expandedChanged(): Signal;
    /**
     * Triggered when the value of the timingExpanded property changes.
     * @returns {Signal} 
     */
    function timingExpandedChanged(): Signal;
    /**
     * Triggered when the value of the serverCount property changes.
     * @returns {Signal} 
     */
    function serverCountChanged(): Signal;
    /**
     * Triggered when the value of the renderrate property changes.
     * @returns {Signal} 
     */
    function renderrateChanged(): Signal;
    /**
     * Triggered when the value of the presentrate property changes.
     * @returns {Signal} 
     */
    function presentrateChanged(): Signal;
    /**
     * Triggered when the value of the presentnewrate property changes.
     * @returns {Signal} 
     */
    function presentnewrateChanged(): Signal;
    /**
     * Triggered when the value of the presentdroprate property changes.
     * @returns {Signal} 
     */
    function presentdroprateChanged(): Signal;
    /**
     * Triggered when the value of the stutterrate property changes.
     * @returns {Signal} 
     */
    function stutterrateChanged(): Signal;
    /**
     * Triggered when the value of the gameLoopRate property changes.
     * @returns {Signal} 
     */
    function gameLoopRateChanged(): Signal;
    /**
     * Trigered when
     * @returns {Signal} 
     */
    function numPhysicsBodiesChanged(): Signal;
    /**
     * Triggered when the value of the avatarCount property changes.
     * @returns {Signal} 
     */
    function avatarCountChanged(): Signal;
    /**
     * Triggered when the value of the updatedAvatarCount property changes.
     * @returns {Signal} 
     */
    function updatedAvatarCountChanged(): Signal;
    /**
     * Triggered when the value of the notUpdatedAvatarCount property changes.
     * @returns {Signal} 
     */
    function notUpdatedAvatarCountChanged(): Signal;
    /**
     * Triggered when the value of the packetInCount property changes.
     * @returns {Signal} 
     */
    function packetInCountChanged(): Signal;
    /**
     * Triggered when the value of the packetOutCount property changes.
     * @returns {Signal} 
     */
    function packetOutCountChanged(): Signal;
    /**
     * Triggered when the value of the mbpsIn property changes.
     * @returns {Signal} 
     */
    function mbpsInChanged(): Signal;
    /**
     * Triggered when the value of the mbpsOut property changes.
     * @returns {Signal} 
     */
    function mbpsOutChanged(): Signal;
    /**
     * Triggered when the value of the assetMbpsIn property changes.
     * @returns {Signal} 
     */
    function assetMbpsInChanged(): Signal;
    /**
     * Triggered when the value of the assetMbpsOut property changes.
     * @returns {Signal} 
     */
    function assetMbpsOutChanged(): Signal;
    /**
     * Triggered when the value of the audioPing property changes.
     * @returns {Signal} 
     */
    function audioPingChanged(): Signal;
    /**
     * Triggered when the value of the avatarPing property changes.
     * @returns {Signal} 
     */
    function avatarPingChanged(): Signal;
    /**
     * Triggered when the value of the entitiesPing property changes.
     * @returns {Signal} 
     */
    function entitiesPingChanged(): Signal;
    /**
     * Triggered when the value of the assetPing property changes.
     * @returns {Signal} 
     */
    function assetPingChanged(): Signal;
    /**
     * Triggered when the value of the messagePing property changes.
     * @returns {Signal} 
     */
    function messagePingChanged(): Signal;
    /**
     * Triggered when the value of the position property changes.
     * @returns {Signal} 
     */
    function positionChanged(): Signal;
    /**
     * Triggered when the value of the speed property changes.
     * @returns {Signal} 
     */
    function speedChanged(): Signal;
    /**
     * Triggered when the value of the yaw property changes.
     * @returns {Signal} 
     */
    function yawChanged(): Signal;
    /**
     * Triggered when the value of the avatarMixerInKbps property changes.
     * @returns {Signal} 
     */
    function avatarMixerInKbpsChanged(): Signal;
    /**
     * Triggered when the value of the avatarMixerInPps property changes.
     * @returns {Signal} 
     */
    function avatarMixerInPpsChanged(): Signal;
    /**
     * Triggered when the value of the avatarMixerOutKbps property changes.
     * @returns {Signal} 
     */
    function avatarMixerOutKbpsChanged(): Signal;
    /**
     * Triggered when the value of the avatarMixerOutPps property changes.
     * @returns {Signal} 
     */
    function avatarMixerOutPpsChanged(): Signal;
    /**
     * Triggered when the value of the myAvatarSendRate property changes.
     * @returns {Signal} 
     */
    function myAvatarSendRateChanged(): Signal;
    /**
     * Triggered when the value of the audioMixerInKbps property changes.
     * @returns {Signal} 
     */
    function audioMixerInKbpsChanged(): Signal;
    /**
     * Triggered when the value of the audioMixerInPps property changes.
     * @returns {Signal} 
     */
    function audioMixerInPpsChanged(): Signal;
    /**
     * Triggered when the value of the audioMixerOutKbps property changes.
     * @returns {Signal} 
     */
    function audioMixerOutKbpsChanged(): Signal;
    /**
     * Triggered when the value of the audioMixerOutPps property changes.
     * @returns {Signal} 
     */
    function audioMixerOutPpsChanged(): Signal;
    /**
     * Triggered when the value of the audioMixerKbps property changes.
     * @returns {Signal} 
     */
    function audioMixerKbpsChanged(): Signal;
    /**
     * Triggered when the value of the audioMixerPps property changes.
     * @returns {Signal} 
     */
    function audioMixerPpsChanged(): Signal;
    /**
     * Triggered when the value of the audioOutboundPPS property changes.
     * @returns {Signal} 
     */
    function audioOutboundPPSChanged(): Signal;
    /**
     * Triggered when the value of the audioSilentOutboundPPS property changes.
     * @returns {Signal} 
     */
    function audioSilentOutboundPPSChanged(): Signal;
    /**
     * Triggered when the value of the audioAudioInboundPPS property changes.
     * @returns {Signal} 
     */
    function audioAudioInboundPPSChanged(): Signal;
    /**
     * Triggered when the value of the audioSilentInboundPPS property changes.
     * @returns {Signal} 
     */
    function audioSilentInboundPPSChanged(): Signal;
    /**
     * Triggered when the value of the audioPacketLoss property changes.
     * @returns {Signal} 
     */
    function audioPacketLossChanged(): Signal;
    /**
     * Triggered when the value of the audioCodec property changes.
     * @returns {Signal} 
     */
    function audioCodecChanged(): Signal;
    /**
     * Triggered when the value of the audioNoiseGate property changes.
     * @returns {Signal} 
     */
    function audioNoiseGateChanged(): Signal;
    /**
     * Triggered when the value of the entityPacketsInKbps property changes.
     * @returns {Signal} 
     */
    function entityPacketsInKbpsChanged(): Signal;
    /**
     * Triggered when the value of the downloads property changes.
     * @returns {Signal} 
     */
    function downloadsChanged(): Signal;
    /**
     * Triggered when the value of the downloadLimit property changes.
     * @returns {Signal} 
     */
    function downloadLimitChanged(): Signal;
    /**
     * Triggered when the value of the downloadsPending property changes.
     * @returns {Signal} 
     */
    function downloadsPendingChanged(): Signal;
    /**
     * Triggered when the value of the downloadUrls property changes.
     * @returns {Signal} 
     */
    function downloadUrlsChanged(): Signal;
    /**
     * Triggered when the value of the processing property changes.
     * @returns {Signal} 
     */
    function processingChanged(): Signal;
    /**
     * Triggered when the value of the processingPending property changes.
     * @returns {Signal} 
     */
    function processingPendingChanged(): Signal;
    /**
     * Triggered when the value of the triangles property changes.
     * @returns {Signal} 
     */
    function trianglesChanged(): Signal;
    /**
     * Triggered when the value of the drawcalls property changes.
     * This
     * @returns {Signal} 
     */
    function drawcallsChanged(): Signal;
    /**
     * Triggered when the value of the materialSwitches property changes.
     * @returns {Signal} 
     */
    function materialSwitchesChanged(): Signal;
    /**
     * Triggered when the value of the itemConsidered property changes.
     * @returns {Signal} 
     */
    function itemConsideredChanged(): Signal;
    /**
     * Triggered when the value of the itemOutOfView property changes.
     * @returns {Signal} 
     */
    function itemOutOfViewChanged(): Signal;
    /**
     * Triggered when the value of the itemTooSmall property changes.
     * @returns {Signal} 
     */
    function itemTooSmallChanged(): Signal;
    /**
     * Triggered when the value of the itemRendered property changes.
     * @returns {Signal} 
     */
    function itemRenderedChanged(): Signal;
    /**
     * Triggered when the value of the shadowConsidered property changes.
     * @returns {Signal} 
     */
    function shadowConsideredChanged(): Signal;
    /**
     * Triggered when the value of the shadowOutOfView property changes.
     * @returns {Signal} 
     */
    function shadowOutOfViewChanged(): Signal;
    /**
     * Triggered when the value of the shadowTooSmall property changes.
     * @returns {Signal} 
     */
    function shadowTooSmallChanged(): Signal;
    /**
     * Triggered when the value of the shadowRendered property changes.
     * @returns {Signal} 
     */
    function shadowRenderedChanged(): Signal;
    /**
     * Triggered when the value of the sendingMode property changes.
     * @returns {Signal} 
     */
    function sendingModeChanged(): Signal;
    /**
     * Triggered when the value of the packetStats property changes.
     * @returns {Signal} 
     */
    function packetStatsChanged(): Signal;
    /**
     * Triggered when the value of the lodStatus property changes.
     * @returns {Signal} 
     */
    function lodStatusChanged(): Signal;
    /**
     * Triggered when the value of the serverElements property changes.
     * @returns {Signal} 
     */
    function serverElementsChanged(): Signal;
    /**
     * Triggered when the value of the serverInternal property changes.
     * @returns {Signal} 
     */
    function serverInternalChanged(): Signal;
    /**
     * Triggered when the value of the serverLeaves property changes.
     * @returns {Signal} 
     */
    function serverLeavesChanged(): Signal;
    /**
     * Triggered when the value of the localElements property changes.
     * @returns {Signal} 
     */
    function localElementsChanged(): Signal;
    /**
     * Triggered when the value of the localInternal property changes.
     * @returns {Signal} 
     */
    function localInternalChanged(): Signal;
    /**
     * Triggered when the value of the localLeaves property changes.
     * @returns {Signal} 
     */
    function localLeavesChanged(): Signal;
    /**
     * Triggered when the value of the timingStats property changes.
     * @returns {Signal} 
     */
    function timingStatsChanged(): Signal;
    /**
     * Triggered when the value of the gameUpdateStats property changes.
     * @returns {Signal} 
     */
    function gameUpdateStatsChanged(): Signal;
    /**
     * Triggered when the value of the glContextSwapchainMemory property changes.
     * @returns {Signal} 
     */
    function glContextSwapchainMemoryChanged(): Signal;
    /**
     * Triggered when the value of the qmlTextureMemory property changes.
     * @returns {Signal} 
     */
    function qmlTextureMemoryChanged(): Signal;
    /**
     * Triggered when the value of the texturePendingTransfers property changes.
     * @returns {Signal} 
     */
    function texturePendingTransfersChanged(): Signal;
    /**
     * Triggered when the value of the gpuBuffers property changes.
     * @returns {Signal} 
     */
    function gpuBuffersChanged(): Signal;
    /**
     * Triggered when the value of the gpuBufferMemory property changes.
     * @returns {Signal} 
     */
    function gpuBufferMemoryChanged(): Signal;
    /**
     * Triggered when the value of the gpuTextures property changes.
     * @returns {Signal} 
     */
    function gpuTexturesChanged(): Signal;
    /**
     * Triggered when the value of the gpuTextureMemory property changes.
     * @returns {Signal} 
     */
    function gpuTextureMemoryChanged(): Signal;
    /**
     * Triggered when the value of the gpuTextureResidentMemory property changes.
     * @returns {Signal} 
     */
    function gpuTextureResidentMemoryChanged(): Signal;
    /**
     * Triggered when the value of the gpuTextureFramebufferMemory property changes.
     * @returns {Signal} 
     */
    function gpuTextureFramebufferMemoryChanged(): Signal;
    /**
     * Triggered when the value of the gpuTextureResourceMemory property changes.
     * @returns {Signal} 
     */
    function gpuTextureResourceMemoryChanged(): Signal;
    /**
     * Triggered when the value of the gpuTextureResourceIdealMemory property changes.
     * @returns {Signal} 
     */
    function gpuTextureResourceIdealMemoryChanged(): Signal;
    /**
     * Triggered when the value of the gpuTextureResourcePopulatedMemory property changes.
     * @returns {Signal} 
     */
    function gpuTextureResourcePopulatedMemoryChanged(): Signal;
    /**
     * Triggered when the value of the gpuTextureExternalMemory property changes.
     * @returns {Signal} 
     */
    function gpuTextureExternalMemoryChanged(): Signal;
    /**
     * Triggered when the value of the gpuTextureMemoryPressureState property changes.
     * @returns {Signal} 
     */
    function gpuTextureMemoryPressureStateChanged(): Signal;
    /**
     * Triggered when the value of the gpuFreeMemory property changes.
     * @returns {Signal} 
     */
    function gpuFreeMemoryChanged(): Signal;
    /**
     * Triggered when the value of the gpuFrameTime property changes.
     * @returns {Signal} 
     */
    function gpuFrameTimeChanged(): Signal;
    /**
     * Triggered when the value of the gpuFrameTime property changes.
     * @returns {Signal} 
     */
    function gpuFrameTimeChanged(): Signal;
    /**
     * Triggered when the value of the gpuFrameTime property changes.
     * @returns {Signal} 
     */
    function gpuFrameTimeChanged(): Signal;
    /**
     * Triggered when the value of the batchFrameTime property changes.
     * @returns {Signal} 
     */
    function batchFrameTimeChanged(): Signal;
    /**
     * Triggered when the value of the engineFrameTime property changes.
     * @returns {Signal} 
     */
    function engineFrameTimeChanged(): Signal;
    /**
     * Triggered when the value of the avatarSimulationTime property changes.
     * @returns {Signal} 
     */
    function avatarSimulationTimeChanged(): Signal;
    /**
     * Triggered when the value of the rectifiedTextureCount property changes.
     * @returns {Signal} 
     */
    function rectifiedTextureCountChanged(): Signal;
    /**
     * Triggered when the value of the decimatedTextureCount property changes.
     * @returns {Signal} 
     */
    function decimatedTextureCountChanged(): Signal;
    /**
     * Triggered when the parent item changes.
     * @param parent {object}  
     * @returns {Signal} 
     */
    function parentChanged(parent: object): Signal;
    /**
     * Triggered when the value of the x property changes.
     * @returns {Signal} 
     */
    function xChanged(): Signal;
    /**
     * Triggered when the value of the y property changes.
     * @returns {Signal} 
     */
    function yChanged(): Signal;
    /**
     * Triggered when the value of the z property changes.
     * @returns {Signal} 
     */
    function zChanged(): Signal;
    /**
     * Triggered when the value of the width property changes.
     * @returns {Signal} 
     */
    function widthChanged(): Signal;
    /**
     * Triggered when the value of the height property changes.
     * @returns {Signal} 
     */
    function heightChanged(): Signal;
    /**
     * Triggered when the value of the opacity property changes.
     * @returns {Signal} 
     */
    function opacityChanged(): Signal;
    /**
     * Triggered when the value of the enabled property changes.
     * @returns {Signal} 
     */
    function enabledChanged(): Signal;
    /**
     * Triggered when the value of the visibleChanged property changes.
     * @returns {Signal} 
     */
    function visibleChanged(): Signal;
    /**
     * Triggered when the list of visible children changes.
     * @returns {Signal} 
     */
    function visibleChildrenChanged(): Signal;
    /**
     * Triggered when the value of the state property changes.
     * @returns {Signal} 
     */
    function stateChanged(): Signal;
    /**
     * Triggered when the position and size of the rectangle containing the children changes.
     * @param childrenRect {Rect}  
     * @returns {Signal} 
     */
    function childrenRectChanged(childrenRect: Rect): Signal;
    /**
     * Triggered when the value of the baselineOffset property changes.
     * @param baselineOffset {number}  
     * @returns {Signal} 
     */
    function baselineOffsetChanged(baselineOffset: number): Signal;
    /**
     * Triggered when the value of the clip property changes.
     * @param clip {boolean}  
     * @returns {Signal} 
     */
    function clipChanged(clip: boolean): Signal;
    /**
     * Triggered when the value of the focus property changes.
     * @param focus {boolean}  
     * @returns {Signal} 
     */
    function focusChanged(focus: boolean): Signal;
    /**
     * Triggered when the value of the activeFocus property changes.
     * @param activeFocus {boolean}  
     * @returns {Signal} 
     */
    function activeFocusChanged(activeFocus: boolean): Signal;
    /**
     * Triggered when the value of the activeFocusOnTab property changes.
     * @param activeFocusOnTab {boolean}  
     * @returns {Signal} 
     */
    function activeFocusOnTabChanged(activeFocusOnTab: boolean): Signal;
    /**
     * Triggered when the value of the rotation property changes.
     * @returns {Signal} 
     */
    function rotationChanged(): Signal;
    /**
     * Triggered when the value of the scaleChanged property changes.
     * @returns {Signal} 
     */
    function scaleChanged(): Signal;
    /**
     * Triggered when the value of the transformOrigin property changes.
     * @param transformOrigin {number}  
     * @returns {Signal} 
     */
    function transformOriginChanged(transformOrigin: number): Signal;
    /**
     * Triggered when the value of the smooth property changes.
     * @param smooth {boolean}  
     * @returns {Signal} 
     */
    function smoothChanged(smooth: boolean): Signal;
    /**
     * Triggered when the value of the antialiasing property changes.
     * @param antialiasing {boolean}  
     * @returns {Signal} 
     */
    function antialiasingChanged(antialiasing: boolean): Signal;
    /**
     * Triggered when the value of the implicitWidth property changes.
     * @returns {Signal} 
     */
    function implicitWidthChanged(): Signal;
    /**
     * Triggered when the value of the implicitHeight property changes.
     * @returns {Signal} 
     */
    function implicitHeightChanged(): Signal;
    /**
     * @param window {object}  
     * @returns {Signal} 
     */
    function windowChanged(window: object): Signal;
    /**
     * @param callback {object}  
     * @param targetSize {Size} [targetSize=0,0] 
     * @returns {boolean} 
     */
    function grabToImage(callback: object, targetSize: Size): boolean;
    /**
     * @param point {Vec2}  
     * @returns {boolean} 
     */
    function contains(point: Vec2): boolean;
    /**
     * @param item {object}  
     */
    function mapFromItem(item: object): void;
    /**
     * @param item {object}  
     */
    function mapToItem(item: object): void;
    /**
     * @param global {object}  
     */
    function mapFromGlobal(global: object): void;
    /**
     * @param global {object}  
     */
    function mapToGlobal(global: object): void;
    /**
     * @param reason {number} [reason=7] 
     */
    function forceActiveFocus(reason: number): void;
    /**
     * @param forward {boolean} [forward=true] 
     * @returns {object} 
     */
    function nextItemInFocusChain(forward: boolean): object;
    /**
     * @param x {number}  
     * @param y {number}  
     * @returns {object} 
     */
    function childAt(x: number, y: number): object;
    function update(): void;
    /**
     * Triggered when the value of the stylusPicksCount property changes.
     * @returns {Signal} 
     */
    function stylusPicksCountChanged(): Signal;
    /**
     * Triggered when the value of the rayPicksCount property changes.
     * @returns {Signal} 
     */
    function rayPicksCountChanged(): Signal;
    /**
     * Triggered when the value of the parabolaPicksCount property changes.
     * @returns {Signal} 
     */
    function parabolaPicksCountChanged(): Signal;
    /**
     * Triggered when the value of the collisionPicksCount property changes.
     * @returns {Signal} 
     */
    function collisionPicksCountChanged(): Signal;
    /**
     * Triggered when the value of the stylusPicksUpdated property changes.
     * @returns {Signal} 
     */
    function stylusPicksUpdatedChanged(): Signal;
    /**
     * Triggered when the value of the rayPicksUpdated property changes.
     * @returns {Signal} 
     */
    function rayPicksUpdatedChanged(): Signal;
    /**
     * Triggered when the value of the parabolaPicksUpdated property changes.
     * @returns {Signal} 
     */
    function parabolaPicksUpdatedChanged(): Signal;
    /**
     * Triggered when the value of the collisionPicksUpdated property changes.
     * @returns {Signal} 
     */
    function collisionPicksUpdatedChanged(): Signal;
    let expanded: boolean;
    /**
     * Read-only.
     */
    let timingExpanded: boolean;
    /**
     * Read-only.
     */
    let monospaceFont: string;
    /**
     * Read-only.
     */
    let serverCount: number;
    /**
     * How often the app is creating new gpu::Frames. Read-only.
     */
    let renderrate: number;
    /**
     * How often the display plugin is presenting to the device. Read-only.
     */
    let presentrate: number;
    /**
     * How often the display device is reprojecting old frames. Read-only.
     */
    let stutterrate: number;
    /**
     * Read-only.
     */
    let appdropped: number;
    /**
     * Read-only.
     */
    let longsubmits: number;
    /**
     * Read-only.
     */
    let longrenders: number;
    /**
     * Read-only.
     */
    let longframes: number;
    /**
     * Read-only.
     */
    let presentnewrate: number;
    /**
     * Read-only.
     */
    let presentdroprate: number;
    /**
     * Read-only.
     */
    let gameLoopRate: number;
    /**
     * Read-only.
     */
    let avatarCount: number;
    /**
     * Read-only.
     */
    let physicsObjectCount: number;
    /**
     * Read-only.
     */
    let updatedAvatarCount: number;
    /**
     * Read-only.
     */
    let notUpdatedAvatarCount: number;
    /**
     * Read-only.
     */
    let packetInCount: number;
    /**
     * Read-only.
     */
    let packetOutCount: number;
    /**
     * Read-only.
     */
    let mbpsIn: number;
    /**
     * Read-only.
     */
    let mbpsOut: number;
    /**
     * Read-only.
     */
    let assetMbpsIn: number;
    /**
     * Read-only.
     */
    let assetMbpsOut: number;
    /**
     * Read-only.
     */
    let audioPing: number;
    /**
     * Read-only.
     */
    let avatarPing: number;
    /**
     * Read-only.
     */
    let entitiesPing: number;
    /**
     * Read-only.
     */
    let assetPing: number;
    /**
     * Read-only.
     */
    let messagePing: number;
    /**
     * Read-only.
     */
    let position: Vec3;
    /**
     * Read-only.
     */
    let speed: number;
    /**
     * Read-only.
     */
    let yaw: number;
    /**
     * Read-only.
     */
    let avatarMixerInKbps: number;
    /**
     * Read-only.
     */
    let avatarMixerInPps: number;
    /**
     * Read-only.
     */
    let avatarMixerOutKbps: number;
    /**
     * Read-only.
     */
    let avatarMixerOutPps: number;
    /**
     * Read-only.
     */
    let myAvatarSendRate: number;
    /**
     * Read-only.
     */
    let audioMixerInKbps: number;
    /**
     * Read-only.
     */
    let audioMixerInPps: number;
    /**
     * Read-only.
     */
    let audioMixerOutKbps: number;
    /**
     * Read-only.
     */
    let audioMixerOutPps: number;
    /**
     * Read-only.
     */
    let audioMixerKbps: number;
    /**
     * Read-only.
     */
    let audioMixerPps: number;
    /**
     * Read-only.
     */
    let audioOutboundPPS: number;
    /**
     * Read-only.
     */
    let audioSilentOutboundPPS: number;
    /**
     * Read-only.
     */
    let audioAudioInboundPPS: number;
    /**
     * Read-only.
     */
    let audioSilentInboundPPS: number;
    /**
     * Read-only.
     */
    let audioPacketLoss: number;
    /**
     * Read-only.
     */
    let audioCodec: string;
    /**
     * Read-only.
     */
    let audioNoiseGate: string;
    /**
     * Read-only.
     */
    let entityPacketsInKbps: number;
    /**
     * Read-only.
     */
    let downloads: number;
    /**
     * Read-only.
     */
    let downloadLimit: number;
    /**
     * Read-only.
     */
    let downloadsPending: number;
    /**
     * Read-only.
     */
    let downloadUrls: Array.<string>;
    /**
     * Read-only.
     */
    let processing: number;
    /**
     * Read-only.
     */
    let processingPending: number;
    /**
     * Read-only.
     */
    let triangles: number;
    /**
     * Read-only.
     */
    let materialSwitches: number;
    /**
     * Read-only.
     */
    let itemConsidered: number;
    /**
     * Read-only.
     */
    let itemOutOfView: number;
    /**
     * Read-only.
     */
    let itemTooSmall: number;
    /**
     * Read-only.
     */
    let itemRendered: number;
    /**
     * Read-only.
     */
    let shadowConsidered: number;
    /**
     * Read-only.
     */
    let shadowOutOfView: number;
    /**
     * Read-only.
     */
    let shadowTooSmall: number;
    /**
     * Read-only.
     */
    let shadowRendered: number;
    /**
     * Read-only.
     */
    let sendingMode: string;
    /**
     * Read-only.
     */
    let packetStats: string;
    /**
     * Read-only.
     */
    let lodStatus: string;
    /**
     * Read-only.
     */
    let timingStats: string;
    /**
     * Read-only.
     */
    let gameUpdateStats: string;
    /**
     * Read-only.
     */
    let serverElements: number;
    /**
     * Read-only.
     */
    let serverInternal: number;
    /**
     * Read-only.
     */
    let serverLeaves: number;
    /**
     * Read-only.
     */
    let localElements: number;
    /**
     * Read-only.
     */
    let localInternal: number;
    /**
     * Read-only.
     */
    let localLeaves: number;
    /**
     * Read-only.
     */
    let rectifiedTextureCount: number;
    /**
     * Read-only.
     */
    let decimatedTextureCount: number;
    /**
     * Read-only.
     */
    let gpuBuffers: number;
    /**
     * Read-only.
     */
    let gpuBufferMemory: number;
    /**
     * Read-only.
     */
    let gpuTextures: number;
    /**
     * Read-only.
     */
    let glContextSwapchainMemory: number;
    /**
     * Read-only.
     */
    let qmlTextureMemory: number;
    /**
     * Read-only.
     */
    let texturePendingTransfers: number;
    /**
     * Read-only.
     */
    let gpuTextureMemory: number;
    /**
     * Read-only.
     */
    let gpuTextureResidentMemory: number;
    /**
     * Read-only.
     */
    let gpuTextureFramebufferMemory: number;
    /**
     * Read-only.
     */
    let gpuTextureResourceMemory: number;
    /**
     * Read-only.
     */
    let gpuTextureResourceIdealMemory: number;
    /**
     * Read-only.
     */
    let gpuTextureResourcePopulatedMemory: number;
    /**
     * Read-only.
     */
    let gpuTextureExternalMemory: number;
    /**
     * Read-only.
     */
    let gpuTextureMemoryPressureState: string;
    /**
     * Read-only.
     */
    let gpuFreeMemory: number;
    /**
     * Read-only.
     */
    let gpuFrameTime: number;
    /**
     * Read-only.
     */
    let batchFrameTime: number;
    /**
     * Read-only.
     */
    let engineFrameTime: number;
    /**
     * Read-only.
     */
    let avatarSimulationTime: number;
    let x: number;
    let y: number;
    let z: number;
    let width: number;
    let height: number;
    let opacity: number;
    let enabled: boolean;
    let visible: boolean;
    let state: string;
    /**
     * Read-only.
     */
    let anchors: object;
    let baselineOffset: number;
    let clip: boolean;
    let focus: boolean;
    /**
     * Read-only.
     */
    let activeFocus: boolean;
    let activeFocusOnTab: boolean;
    let rotation: number;
    let scale: number;
    let transformOrigin: number;
    let smooth: boolean;
    let antialiasing: boolean;
    let implicitWidth: number;
    let implicitHeight: number;
    /**
     * Read-only.
     */
    let layer: object;
    /**
     * Read-only.
     */
    let stylusPicksCount: number;
    /**
     * Read-only.
     */
    let rayPicksCount: number;
    /**
     * Read-only.
     */
    let parabolaPicksCount: number;
    /**
     * Read-only.
     */
    let collisionPicksCount: number;
    /**
     * Read-only.
     */
    let stylusPicksUpdated: Vec4;
    /**
     * Read-only.
     */
    let rayPicksUpdated: Vec4;
    /**
     * Read-only.
     */
    let parabolaPicksUpdated: Vec4;
    /**
     * Read-only.
     */
    let collisionPicksUpdated: Vec4;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe Overlays API provides facilities to create and interact with overlays. Overlays are 2D and 3D objects visible only to
 * yourself and that aren't persisted to the domain. They are used for UI.
 */
declare namespace Overlays {
    interface Circle3DProperties {
        /**
         * Has the value "circle3d". Read-only.
         */
        type: string;
        /**
         * The maximum value of the pulse multiplier.
         */
        pulseMax: number;
        /**
         * The minimum value of the pulse multiplier.
         */
        pulseMin: number;
        /**
         * The duration of the color and alpha pulse, in seconds. A pulse multiplier value goes from
         *     pulseMin to pulseMax, then pulseMax to pulseMin in one period.
         */
        pulsePeriod: number;
        /**
         * If non-zero, the alpha of the overlay is pulsed: the alpha value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        alphaPulse: number;
        /**
         * If non-zero, the color of the overlay is pulsed: the color value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        colorPulse: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         */
        visible: boolean;
        /**
         * A friendly name for the overlay.
         */
        name: string;
        /**
         * The position of the overlay center. Synonyms: p1, point, and
         *     start.
         */
        position: Vec3;
        /**
         * The local position of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as position.
         */
        localPosition: Vec3;
        /**
         * The orientation of the overlay. Synonym: orientation.
         */
        rotation: Quat;
        /**
         * The orientation of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as rotation.
         */
        localRotation: Quat;
        /**
         * Synonyms: solid, isFilled, and filled
         *     Antonyms: isWire and wire.
         */
        isSolid: boolean;
        /**
         * If true, a dashed line is drawn on the overlay's edges. Synonym:
         *     dashed.
         */
        isDashedLine: boolean;
        /**
         * If true, picks ignore the overlay.  ignoreRayIntersection is a synonym.
         */
        ignorePickIntersection: boolean;
        /**
         * If true, the overlay is rendered in front of other overlays that don't
         *     have drawInFront set to true, and in front of entities.
         */
        drawInFront: boolean;
        /**
         * Signal to grabbing scripts whether or not this overlay can be grabbed.
         */
        grabbable: boolean;
        /**
         * The avatar, entity, or overlay that the overlay is parented to.
         */
        parentID: Uuid;
        /**
         * Integer value specifying the skeleton joint that the overlay is attached to if
         *     parentID is an avatar skeleton. A value of 65535 means "no joint".
         */
        parentJointIndex: number;
        /**
         * The dimensions of the overlay. Synonyms: scale, size.
         *     Not used.
         */
        dimensions: Vec2;
        /**
         * The counter-clockwise angle from the overlay's x-axis that drawing starts at, in degrees.
         */
        startAt: number;
        /**
         * The counter-clockwise angle from the overlay's x-axis that drawing ends at, in degrees.
         */
        endAt: number;
        /**
         * The outer radius of the overlay, in meters. Synonym: radius.
         */
        outerRadius: number;
        /**
         * The inner radius of the overlay, in meters.
         */
        innerRadius: number;
        /**
         * The color of the overlay. Setting this value also sets the values of 
         *     innerStartColor, innerEndColor, outerStartColor, and outerEndColor.
         */
        color: Color;
        /**
         * Sets the values of innerStartColor and outerStartColor.
         *     Write-only.
         */
        startColor: Color;
        /**
         * Sets the values of innerEndColor and outerEndColor.
         *     Write-only.
         */
        endColor: Color;
        /**
         * Sets the values of innerStartColor and innerEndColor.
         *     Write-only.
         */
        innerColor: Color;
        /**
         * Sets the values of outerStartColor and outerEndColor.
         *     Write-only.
         */
        outerColor: Color;
        /**
         * The color at the inner start point of the overlay.
         */
        innerStartcolor: Color;
        /**
         * The color at the inner end point of the overlay.
         */
        innerEndColor: Color;
        /**
         * The color at the outer start point of the overlay.
         */
        outerStartColor: Color;
        /**
         * The color at the outer end point of the overlay.
         */
        outerEndColor: Color;
        /**
         * The opacity of the overlay, 0.0 - 1.0. Setting this value also sets
         *     the values of innerStartAlpha, innerEndAlpha, outerStartAlpha, and     outerEndAlpha. Synonym: Alpha; write-only.
         */
        alpha: number;
        /**
         * Sets the values of innerStartAlpha and outerStartAlpha.
         *     Write-only.
         */
        startAlpha: number;
        /**
         * Sets the values of innerEndAlpha and outerEndAlpha.
         *     Write-only.
         */
        endAlpha: number;
        /**
         * Sets the values of innerStartAlpha and innerEndAlpha.
         *     Write-only.
         */
        innerAlpha: number;
        /**
         * Sets the values of outerStartAlpha and outerEndAlpha.
         *     Write-only.
         */
        outerAlpha: number;
        /**
         * The alpha at the inner start point of the overlay.
         */
        innerStartAlpha: number;
        /**
         * The alpha at the inner end point of the overlay.
         */
        innerEndAlpha: number;
        /**
         * The alpha at the outer start point of the overlay.
         */
        outerStartAlpha: number;
        /**
         * The alpha at the outer end point of the overlay.
         */
        outerEndAlpha: number;
        /**
         * If true, tick marks are drawn.
         */
        hasTickMarks: boolean;
        /**
         * The angle between major tick marks, in degrees.
         */
        majorTickMarksAngle: number;
        /**
         * The angle between minor tick marks, in degrees.
         */
        minorTickMarksAngle: number;
        /**
         * The length of the major tick marks, in meters. A positive value draws tick marks
         *     outwards from the inner radius; a negative value draws tick marks inwards from the outer radius.
         */
        majorTickMarksLength: number;
        /**
         * The length of the minor tick marks, in meters. A positive value draws tick marks
         *     outwards from the inner radius; a negative value draws tick marks inwards from the outer radius.
         */
        minorTickMarksLength: number;
        /**
         * The color of the major tick marks.
         */
        majorTickMarksColor: Color;
        /**
         * The color of the minor tick marks.
         */
        minorTickMarksColor: Color;
    }

    interface CubeProperties {
        /**
         * Has the value "cube". Read-only.
         */
        type: string;
        /**
         * The color of the overlay.
         */
        color: Color;
        /**
         * The opacity of the overlay, 0.0 - 1.0.
         */
        alpha: number;
        /**
         * The maximum value of the pulse multiplier.
         */
        pulseMax: number;
        /**
         * The minimum value of the pulse multiplier.
         */
        pulseMin: number;
        /**
         * The duration of the color and alpha pulse, in seconds. A pulse multiplier value goes from
         *     pulseMin to pulseMax, then pulseMax to pulseMin in one period.
         */
        pulsePeriod: number;
        /**
         * If non-zero, the alpha of the overlay is pulsed: the alpha value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        alphaPulse: number;
        /**
         * If non-zero, the color of the overlay is pulsed: the color value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        colorPulse: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         */
        visible: boolean;
        /**
         * A friendly name for the overlay.
         */
        name: string;
        /**
         * The position of the overlay center. Synonyms: p1, point, and
         *     start.
         */
        position: Vec3;
        /**
         * The local position of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as position.
         */
        localPosition: Vec3;
        /**
         * The orientation of the overlay. Synonym: orientation.
         */
        rotation: Quat;
        /**
         * The orientation of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as rotation.
         */
        localRotation: Quat;
        /**
         * Synonyms: solid, isFilled, and filled.
         *     Antonyms: isWire and wire.
         */
        isSolid: boolean;
        /**
         * If true, a dashed line is drawn on the overlay's edges. Synonym:
         *     dashed.
         */
        isDashedLine: boolean;
        /**
         * If true, picks ignore the overlay.  ignoreRayIntersection is a synonym.
         */
        ignorePickIntersection: boolean;
        /**
         * If true, the overlay is rendered in front of other overlays that don't
         *     have drawInFront set to true, and in front of entities.
         */
        drawInFront: boolean;
        /**
         * Signal to grabbing scripts whether or not this overlay can be grabbed.
         */
        grabbable: boolean;
        /**
         * The avatar, entity, or overlay that the overlay is parented to.
         */
        parentID: Uuid;
        /**
         * Integer value specifying the skeleton joint that the overlay is attached to if
         *     parentID is an avatar skeleton. A value of 65535 means "no joint".
         */
        parentJointIndex: number;
        /**
         * The dimensions of the overlay. Synonyms: scale, size.
         */
        dimensions: Vec3;
    }

    interface GridProperties {
        /**
         * Has the value "grid". Read-only.
         */
        type: string;
        /**
         * The color of the overlay.
         */
        color: Color;
        /**
         * The opacity of the overlay, 0.0 - 1.0.
         */
        alpha: number;
        /**
         * The maximum value of the pulse multiplier.
         */
        pulseMax: number;
        /**
         * The minimum value of the pulse multiplier.
         */
        pulseMin: number;
        /**
         * The duration of the color and alpha pulse, in seconds. A pulse multiplier value goes from
         *     pulseMin to pulseMax, then pulseMax to pulseMin in one period.
         */
        pulsePeriod: number;
        /**
         * If non-zero, the alpha of the overlay is pulsed: the alpha value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        alphaPulse: number;
        /**
         * If non-zero, the color of the overlay is pulsed: the color value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        colorPulse: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         */
        visible: boolean;
        /**
         * A friendly name for the overlay.
         */
        name: string;
        /**
         * The position of the overlay center. Synonyms: p1, point, and
         *     start.
         */
        position: Vec3;
        /**
         * The local position of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as position.
         */
        localPosition: Vec3;
        /**
         * The orientation of the overlay. Synonym: orientation.
         */
        rotation: Quat;
        /**
         * The orientation of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as rotation.
         */
        localRotation: Quat;
        /**
         * Synonyms: solid, isFilled, and filled.
         *     Antonyms: isWire and wire.
         */
        isSolid: boolean;
        /**
         * If true, a dashed line is drawn on the overlay's edges. Synonym:
         *     dashed.
         */
        isDashedLine: boolean;
        /**
         * If true, picks ignore the overlay.  ignoreRayIntersection is a synonym.
         */
        ignorePickIntersection: boolean;
        /**
         * If true, the overlay is rendered in front of other overlays that don't
         *     have drawInFront set to true, and in front of entities.
         */
        drawInFront: boolean;
        /**
         * Signal to grabbing scripts whether or not this overlay can be grabbed.
         */
        grabbable: boolean;
        /**
         * The avatar, entity, or overlay that the overlay is parented to.
         */
        parentID: Uuid;
        /**
         * Integer value specifying the skeleton joint that the overlay is attached to if
         *     parentID is an avatar skeleton. A value of 65535 means "no joint".
         */
        parentJointIndex: number;
        /**
         * The dimensions of the overlay. Synonyms: scale, size.
         */
        dimensions: Vec2;
        /**
         * If true, the grid is always visible even as the camera moves to another
         *     position.
         */
        followCamera: boolean;
        /**
         * Integer number of minorGridEvery intervals at which to draw a thick grid 
         *     line. Minimum value = 1.
         */
        majorGridEvery: number;
        /**
         * Real number of meters at which to draw thin grid lines. Minimum value = 
         *     0.001.
         */
        minorGridEvery: number;
    }

    interface Image3DProperties {
        /**
         * Has the value "image3d". Read-only.
         */
        type: string;
        /**
         * The color of the overlay.
         */
        color: Color;
        /**
         * The opacity of the overlay, 0.0 - 1.0.
         */
        alpha: number;
        /**
         * The maximum value of the pulse multiplier.
         */
        pulseMax: number;
        /**
         * The minimum value of the pulse multiplier.
         */
        pulseMin: number;
        /**
         * The duration of the color and alpha pulse, in seconds. A pulse multiplier value goes from
         *     pulseMin to pulseMax, then pulseMax to pulseMin in one period.
         */
        pulsePeriod: number;
        /**
         * If non-zero, the alpha of the overlay is pulsed: the alpha value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        alphaPulse: number;
        /**
         * If non-zero, the color of the overlay is pulsed: the color value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        colorPulse: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         */
        visible: boolean;
        /**
         * A friendly name for the overlay.
         */
        name: string;
        /**
         * The position of the overlay center. Synonyms: p1, point, and 
         *     start.
         */
        position: Vec3;
        /**
         * The local position of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as position.
         */
        localPosition: Vec3;
        /**
         * The orientation of the overlay. Synonym: orientation.
         */
        rotation: Quat;
        /**
         * The orientation of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as rotation.
         */
        localRotation: Quat;
        /**
         * Synonyms: solid, isFilled, and filled.
         *     Antonyms: isWire and wire.
         */
        isSolid: boolean;
        /**
         * If true, a dashed line is drawn on the overlay's edges. Synonym:
         *     dashed.
         */
        isDashedLine: boolean;
        /**
         * If true, picks ignore the overlay.  ignoreRayIntersection is a synonym.
         */
        ignorePickIntersection: boolean;
        /**
         * If true, the overlay is rendered in front of other overlays that don't
         *     have drawInFront set to true, and in front of entities.
         */
        drawInFront: boolean;
        /**
         * Signal to grabbing scripts whether or not this overlay can be grabbed.
         */
        grabbable: boolean;
        /**
         * The avatar, entity, or overlay that the overlay is parented to.
         */
        parentID: Uuid;
        /**
         * Integer value specifying the skeleton joint that the overlay is attached to if
         *     parentID is an avatar skeleton. A value of 65535 means "no joint".
         */
        parentJointIndex: number;
        /**
         * The dimensions of the overlay. Synonyms: scale, size.
         */
        dimensions: Vec2;
        /**
         * If true, the overlay is rotated to face the user's camera about an axis
         *     parallel to the user's avatar's "up" direction.
         */
        isFacingAvatar: boolean;
        /**
         * The URL of the PNG or JPG image to display.
         */
        url: string;
        /**
         * The portion of the image to display. Defaults to the full image.
         */
        subImage: Rect;
        /**
         * If true, the overlay is displayed at full brightness, otherwise it is rendered
         *     with scene lighting.
         */
        emissive: boolean;
    }

    interface ImageProperties {
        /**
         * The position and size of the image display area, in pixels. Write-only.
         */
        bounds: Rect;
        /**
         * Integer left, x-coordinate value of the image display area = bounds.x.
         *     Write-only.
         */
        x: number;
        /**
         * Integer top, y-coordinate value of the image display area = bounds.y.
         *     Write-only.
         */
        y: number;
        /**
         * Integer width of the image display area = bounds.width. Write-only.
         */
        width: number;
        /**
         * Integer height of the image display area = bounds.height. Write-only.
         */
        height: number;
        /**
         * The URL of the image file to display. The image is scaled to fit to the bounds.
         *     Write-only.
         */
        imageURL: string;
        /**
         * Integer coordinates of the top left pixel to start using image content from.
         *     Write-only.
         */
        subImage: Vec2;
        /**
         * The color to apply over the top of the image to colorize it. Write-only.
         */
        color: Color;
        /**
         * The opacity of the color applied over the top of the image, 0.0 - 
         *     1.0. Write-only.
         */
        alpha: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         *     Write-only.
         */
        visible: boolean;
    }

    interface Line3DProperties {
        /**
         * Has the value "line3d". Read-only.
         */
        type: string;
        /**
         * The color of the overlay.
         */
        color: Color;
        /**
         * The opacity of the overlay, 0.0 - 1.0.
         */
        alpha: number;
        /**
         * The maximum value of the pulse multiplier.
         */
        pulseMax: number;
        /**
         * The minimum value of the pulse multiplier.
         */
        pulseMin: number;
        /**
         * The duration of the color and alpha pulse, in seconds. A pulse multiplier value goes from
         *     pulseMin to pulseMax, then pulseMax to pulseMin in one period.
         */
        pulsePeriod: number;
        /**
         * If non-zero, the alpha of the overlay is pulsed: the alpha value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        alphaPulse: number;
        /**
         * If non-zero, the color of the overlay is pulsed: the color value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        colorPulse: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         */
        visible: boolean;
        /**
         * A friendly name for the overlay.
         */
        name: string;
        /**
         * The position of the overlay center. Synonyms: p1, point, and
         *     start.
         */
        position: Vec3;
        /**
         * The local position of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as position.
         */
        localPosition: Vec3;
        /**
         * The orientation of the overlay. Synonym: orientation.
         */
        rotation: Quat;
        /**
         * The orientation of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as rotation.
         */
        localRotation: Quat;
        /**
         * Synonyms: solid, isFilled, and filled.
         *     Antonyms: isWire and wire.
         */
        isSolid: boolean;
        /**
         * If true, a dashed line is drawn on the overlay's edges. Synonym:
         *     dashed.
         */
        isDashedLine: boolean;
        /**
         * If true, picks ignore the overlay.  ignoreRayIntersection is a synonym.
         */
        ignorePickIntersection: boolean;
        /**
         * If true, the overlay is rendered in front of other overlays that don't
         *     have drawInFront set to true, and in front of entities.
         */
        drawInFront: boolean;
        /**
         * Signal to grabbing scripts whether or not this overlay can be grabbed.
         */
        grabbable: boolean;
        /**
         * The avatar, entity, or overlay that the overlay is parented to.
         */
        parentID: Uuid;
        /**
         * Integer value specifying the skeleton joint that the overlay is attached to if
         *     parentID is an avatar skeleton. A value of 65535 means "no joint".
         */
        parentJointIndex: number;
        /**
         * The avatar, entity, or overlay that the end point of the line is parented to.
         */
        endParentID: Uuid;
        /**
         * Integer value specifying the skeleton joint that the end point of the line is
         *     attached to if parentID is an avatar skeleton. A value of 65535 means "no joint".
         */
        endParentJointIndex: number;
        /**
         * The start point of the line. Synonyms: startPoint, p1, and
         *     position.
         */
        start: Vec3;
        /**
         * The end point of the line. Synonyms: endPoint and p2.
         */
        end: Vec3;
        /**
         * The local position of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as start. Synonym: localPosition.
         */
        localStart: Vec3;
        /**
         * The local position of the overlay relative to its parent if the overlay has a
         *     endParentID set, otherwise the same value as end.
         */
        localEnd: Vec3;
        /**
         * The length of the line, in meters. This can be set after creating a line with start and end
         *     points.
         */
        length: number;
        /**
         * If glow > 0, the line is rendered with a glow.
         */
        glow: number;
        /**
         * If glow > 0, this is the width of the glow, in meters.
         */
        lineWidth: number;
    }

    interface ModelProperties {
        /**
         * Has the value "model". Read-only.
         */
        type: string;
        /**
         * The color of the overlay.
         */
        color: Color;
        /**
         * The opacity of the overlay, 0.0 - 1.0.
         */
        alpha: number;
        /**
         * The maximum value of the pulse multiplier.
         */
        pulseMax: number;
        /**
         * The minimum value of the pulse multiplier.
         */
        pulseMin: number;
        /**
         * The duration of the color and alpha pulse, in seconds. A pulse multiplier value goes from
         *     pulseMin to pulseMax, then pulseMax to pulseMin in one period.
         */
        pulsePeriod: number;
        /**
         * If non-zero, the alpha of the overlay is pulsed: the alpha value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        alphaPulse: number;
        /**
         * If non-zero, the color of the overlay is pulsed: the color value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        colorPulse: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         */
        visible: boolean;
        /**
         * A friendly name for the overlay.
         */
        name: string;
        /**
         * The position of the overlay center. Synonyms: p1, point, and
         *     start.
         */
        position: Vec3;
        /**
         * The local position of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as position.
         */
        localPosition: Vec3;
        /**
         * The orientation of the overlay. Synonym: orientation.
         */
        rotation: Quat;
        /**
         * The orientation of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as rotation.
         */
        localRotation: Quat;
        /**
         * Synonyms: solid, isFilled, and filled.
         *     Antonyms: isWire and wire.
         */
        isSolid: boolean;
        /**
         * If true, a dashed line is drawn on the overlay's edges. Synonym:
         *     dashed.
         */
        isDashedLine: boolean;
        /**
         * If true, picks ignore the overlay.  ignoreRayIntersection is a synonym.
         */
        ignorePickIntersection: boolean;
        /**
         * If true, the overlay is rendered in front of other overlays that don't
         *     have drawInFront set to true, and in front of entities.
         */
        drawInFront: boolean;
        /**
         * If true, the mesh parts of the model are LOD culled as a group.
         *     If false, separate mesh parts will be LOD culled individually.
         */
        isGroupCulled: boolean;
        /**
         * Signal to grabbing scripts whether or not this overlay can be grabbed.
         */
        grabbable: boolean;
        /**
         * The avatar, entity, or overlay that the overlay is parented to.
         */
        parentID: Uuid;
        /**
         * Integer value specifying the skeleton joint that the overlay is attached to if
         *     parentID is an avatar skeleton. A value of 65535 means "no joint".
         */
        parentJointIndex: number;
        /**
         * The URL of the FBX or OBJ model used for the overlay.
         */
        url: string;
        /**
         * The priority for loading and displaying the overlay. Overlays with higher values load 
         *     first.
         */
        loadPriority: number;
        /**
         * The dimensions of the overlay. Synonym: size.
         */
        dimensions: Vec3;
        /**
         * The scale factor applied to the model's dimensions.
         */
        scale: Vec3;
        /**
         * Maps the named textures in the model to the JPG or PNG images in the urls.
         */
        textures: object.<name, url>;
        /**
         * The names of the joints - if any - in the model. Read-only.
         */
        jointNames: Array.<string>;
        /**
         * The relative rotations of the model's joints. Not copied if overlay is 
         *     cloned.
         */
        jointRotations: Array.<Quat>;
        /**
         * The relative translations of the model's joints. Not copied if overlay is 
         *     cloned.
         */
        jointTranslations: Array.<Vec3>;
        /**
         * The absolute orientations of the model's joints, in world coordinates.
         *     Read-only.
         */
        jointOrientations: Array.<Quat>;
        /**
         * The absolute positions of the model's joints, in world coordinates.
         *     Read-only.
         */
        jointPositions: Array.<Vec3>;
        /**
         * The URL of an FBX file containing an animation to play.
         */
        animationSettings.url: string;
        /**
         * The frame rate (frames/sec) to play the animation at.
         */
        animationSettings.fps: number;
        /**
         * The frame to start playing at.
         */
        animationSettings.firstFrame: number;
        /**
         * The frame to finish playing at.
         */
        animationSettings.lastFrame: number;
        /**
         * The current frame being played.
         */
        animationSettings.currentFrame: number;
        /**
         * Whether or not the animation is playing.
         */
        animationSettings.running: boolean;
        /**
         * Whether or not the animation should repeat in a loop.
         */
        animationSettings.loop: boolean;
        /**
         * Whether or not when the animation finishes, the rotations and 
         *     translations of the last frame played should be maintained.
         */
        animationSettings.hold: boolean;
        /**
         * Whether or not translations contained in the animation should
         *     be played.
         */
        animationSettings.allowTranslation: boolean;
    }

    interface OverlayProperties {
    }

    interface RayToOverlayIntersectionResult {
        /**
         * true if the  PickRay intersected with a 3D overlay, otherwise
         *     false.
         */
        intersects: boolean;
        /**
         * The UUID of the overlay that was intersected.
         */
        overlayID: Uuid;
        /**
         * The distance from the  PickRay origin to the intersection point.
         */
        distance: number;
        /**
         * The normal of the overlay surface at the intersection point.
         */
        surfaceNormal: Vec3;
        /**
         * The position of the intersection point.
         */
        intersection: Vec3;
        /**
         * Additional intersection details, if available.
         */
        extraInfo: object;
    }

    /**
     * Add an overlay to the scene.
     * @param type {Overlays.OverlayType}  The type of the overlay to add.
     * @param properties {Overlays.OverlayProperties}  The properties of the overlay to add.
     * @returns {Uuid} 
     */
    function addOverlay(type: Overlays.OverlayType, properties: Overlays.OverlayProperties): Uuid;
    /**
     * Create a clone of an existing overlay.
     * @param overlayID {Uuid}  The ID of the overlay to clone.
     * @returns {Uuid} 
     */
    function cloneOverlay(overlayID: Uuid): Uuid;
    /**
     * Edit an overlay's properties.
     * @param overlayID {Uuid}  The ID of the overlay to edit.
     * @param properties {Overlays.OverlayProperties}  The properties changes to make.
     * @returns {boolean} 
     */
    function editOverlay(overlayID: Uuid, properties: Overlays.OverlayProperties): boolean;
    /**
     * Edit multiple overlays' properties.
     * @param propertiesById {object.<Uuid, Overlays.OverlayProperties>}  An object with overlay IDs as keys and
     *     {@link Overlays.OverlayProperties|OverlayProperties} edits to make as values.
     * @returns {boolean} 
     */
    function editOverlays(propertiesById: object.<Uuid, Overlays.OverlayProperties>): boolean;
    /**
     * Delete an overlay.
     * @param overlayID {Uuid}  The ID of the overlay to delete.
     */
    function deleteOverlay(overlayID: Uuid): void;
    /**
     * Get the type of an overlay.
     * @param overlayID {Uuid}  The ID of the overlay to get the type of.
     * @returns {Overlays.OverlayType} 
     */
    function getOverlayType(overlayID: Uuid): Overlays.OverlayType;
    /**
     * Get the overlay script object. In particular, this is useful for accessing the event bridge for a web3d 
     * overlay.
     * @param overlayID {Uuid}  The ID of the overlay to get the script object of.
     * @returns {object} 
     */
    function getOverlayObject(overlayID: Uuid): object;
    /**
     * Get the ID of the 2D overlay at a particular point on the screen or HUD.
     * @param point {Vec2}  The point to check for an overlay.
     * @returns {Uuid} 
     */
    function getOverlayAtPoint(point: Vec2): Uuid;
    /**
     * Get the value of a 3D overlay's property.
     * @param overlayID {Uuid}  The ID of the overlay. <em>Must be for a 3D {@link Overlays.OverlayType|OverlayType}.</em>
     * @param property {string}  The name of the property value to get.
     * @returns {object} 
     */
    function getProperty(overlayID: Uuid, property: string): object;
    /**
     * Get the values of an overlay's properties.
     * @param overlayID {Uuid}  The ID of the overlay.
     * @param properties {Array.<string>}  An array of names of properties to get the values of.
     * @returns {Overlays.OverlayProperties} 
     */
    function getProperties(overlayID: Uuid, properties: Array.<string>): Overlays.OverlayProperties;
    /**
     * Get the values of multiple overlays' properties.
     * @param propertiesById {object.<Uuid, Array.<string>>}  An object with overlay IDs as keys and arrays of the names of 
     *     properties to get for each as values.
     * @returns {object.<Uuid, Overlays.OverlayProperties>} 
     */
    function getOverlaysProperties(propertiesById: object.<Uuid, Array.<string>>): object.<Uuid, Overlays.OverlayProperties>;
    /**
     * Find the closest 3D overlay intersected by a  PickRay.
     * @param pickRay {PickRay}  The PickRay to use for finding overlays.
     * @param precisionPicking {boolean} [precisionPicking=false] <em>Unused</em>; exists to match Entity API.
     * @param overlayIDsToInclude {Array.<Uuid>} [overlayIDsToInclude=[]] If not empty then the search is restricted to these overlays.
     * @param overlayIDsToExclude {Array.<Uuid>} [overlayIDsToExclude=[]] Overlays to ignore during the search.
     * @param visibleOnly {boolean} [visibleOnly=false] <em>Unused</em>; exists to match Entity API.
     * @param collidableOnly {boolean} [collidableOnly=false] <em>Unused</em>; exists to match Entity API.
     * @returns {Overlays.RayToOverlayIntersectionResult} 
     */
    function findRayIntersection(pickRay: PickRay, precisionPicking: boolean, overlayIDsToInclude: Array.<Uuid>, overlayIDsToExclude: Array.<Uuid>, visibleOnly: boolean, collidableOnly: boolean): Overlays.RayToOverlayIntersectionResult;
    /**
     * Return a list of 3D overlays with bounding boxes that touch a search sphere.
     * @param center {Vec3}  The center of the search sphere.
     * @param radius {number}  The radius of the search sphere.
     * @returns {Array.<Uuid>} 
     */
    function findOverlays(center: Vec3, radius: number): Array.<Uuid>;
    /**
     * Check whether an overlay's assets have been loaded. For example, for an image overlay the result indicates
     * whether its image has been loaded.
     * @param overlayID {Uuid}  The ID of the overlay to check.
     * @returns {boolean} 
     */
    function isLoaded(overlayID: Uuid): boolean;
    /**
     * Calculates the size of the given text in the specified overlay if it is a text overlay.
     * @param overlayID {Uuid}  The ID of the overlay to use for calculation.
     * @param text {string}  The string to calculate the size of.
     * @returns {Size} 
     */
    function textSize(overlayID: Uuid, text: string): Size;
    /**
     * Get the width of the window or HUD.
     * @returns {number} 
     */
    function width(): number;
    /**
     * Get the height of the window or HUD.
     * @returns {number} 
     */
    function height(): number;
    /**
     * Check if there is an overlay of a given ID.
     * @param overlayID {Uuid}  The ID to check.
     * @returns {boolean} 
     */
    function isAddedOverlay(overlayID: Uuid): boolean;
    /**
     * Generate a mouse press event on an overlay.
     * @param overlayID {Uuid}  The ID of the overlay to generate a mouse press event on.
     * @param event {PointerEvent}  The mouse press event details.
     */
    function sendMousePressOnOverlay(overlayID: Uuid, event: PointerEvent): void;
    /**
     * Generate a mouse release event on an overlay.
     * @param overlayID {Uuid}  The ID of the overlay to generate a mouse release event on.
     * @param event {PointerEvent}  The mouse release event details.
     */
    function sendMouseReleaseOnOverlay(overlayID: Uuid, event: PointerEvent): void;
    /**
     * Generate a mouse move event on an overlay.
     * @param overlayID {Uuid}  The ID of the overlay to generate a mouse move event on.
     * @param event {PointerEvent}  The mouse move event details.
     */
    function sendMouseMoveOnOverlay(overlayID: Uuid, event: PointerEvent): void;
    /**
     * Generate a hover enter event on an overlay.
     * @param id {Uuid}  The ID of the overlay to generate a hover enter event on.
     * @param event {PointerEvent}  The hover enter event details.
     */
    function sendHoverEnterOverlay(id: Uuid, event: PointerEvent): void;
    /**
     * Generate a hover over event on an overlay.
     * @param overlayID {Uuid}  The ID of the overlay to generate a hover over event on.
     * @param event {PointerEvent}  The hover over event details.
     */
    function sendHoverOverOverlay(overlayID: Uuid, event: PointerEvent): void;
    /**
     * Generate a hover leave event on an overlay.
     * @param overlayID {Uuid}  The ID of the overlay to generate a hover leave event on.
     * @param event {PointerEvent}  The hover leave event details.
     */
    function sendHoverLeaveOverlay(overlayID: Uuid, event: PointerEvent): void;
    /**
     * Get the ID of the Web3D overlay that has keyboard focus.
     * @returns {Uuid} 
     */
    function getKeyboardFocusOverlay(): Uuid;
    /**
     * Set the Web3D overlay that has keyboard focus.
     * @param overlayID {Uuid}  The ID of the {@link Overlays.OverlayType|web3d} overlay to set keyboard focus to. Use 
     *     <code>null</code> or {@link Uuid|Uuid.NULL} to unset keyboard focus from an overlay.
     */
    function setKeyboardFocusOverlay(overlayID: Uuid): void;
    /**
     * Triggered when an overlay is deleted.
     * @param overlayID {Uuid}  The ID of the overlay that was deleted.
     * @returns {Signal} 
     */
    function overlayDeleted(overlayID: Uuid): Signal;
    /**
     * Triggered when a mouse press event occurs on an overlay. Only occurs for 3D overlays (unless you use 
     *      Overlays.sendMousePressOnOverlay for a 2D overlay).
     * @param overlayID {Uuid}  The ID of the overlay the mouse press event occurred on.
     * @param event {PointerEvent}  The mouse press event details.
     * @returns {Signal} 
     */
    function mousePressOnOverlay(overlayID: Uuid, event: PointerEvent): Signal;
    /**
     * Triggered when a mouse double press event occurs on an overlay. Only occurs for 3D overlays.
     * @param overlayID {Uuid}  The ID of the overlay the mouse double press event occurred on.
     * @param event {PointerEvent}  The mouse double press event details.
     * @returns {Signal} 
     */
    function mouseDoublePressOnOverlay(overlayID: Uuid, event: PointerEvent): Signal;
    /**
     * Triggered when a mouse release event occurs on an overlay. Only occurs for 3D overlays (unless you use 
     *      Overlays.sendMouseReleaseOnOverlay for a 2D overlay).
     * @param overlayID {Uuid}  The ID of the overlay the mouse release event occurred on.
     * @param event {PointerEvent}  The mouse release event details.
     * @returns {Signal} 
     */
    function mouseReleaseOnOverlay(overlayID: Uuid, event: PointerEvent): Signal;
    /**
     * Triggered when a mouse move event occurs on an overlay. Only occurs for 3D overlays (unless you use 
     *      Overlays.sendMouseMoveOnOverlay for a 2D overlay).
     * @param overlayID {Uuid}  The ID of the overlay the mouse moved event occurred on.
     * @param event {PointerEvent}  The mouse move event details.
     * @returns {Signal} 
     */
    function mouseMoveOnOverlay(overlayID: Uuid, event: PointerEvent): Signal;
    /**
     * Triggered when a mouse press event occurs on something other than a 3D overlay.
     * @returns {Signal} 
     */
    function mousePressOffOverlay(): Signal;
    /**
     * Triggered when a mouse double press event occurs on something other than a 3D overlay.
     * @returns {Signal} 
     */
    function mouseDoublePressOffOverlay(): Signal;
    /**
     * Triggered when a mouse cursor starts hovering over an overlay. Only occurs for 3D overlays (unless you use 
     *      Overlays.sendHoverEnterOverlay for a 2D overlay).
     * @param overlayID {Uuid}  The ID of the overlay the mouse moved event occurred on.
     * @param event {PointerEvent}  The mouse move event details.
     * @returns {Signal} 
     */
    function hoverEnterOverlay(overlayID: Uuid, event: PointerEvent): Signal;
    /**
     * Triggered when a mouse cursor continues hovering over an overlay. Only occurs for 3D overlays (unless you use 
     *      Overlays.sendHoverOverOverlay for a 2D overlay).
     * @param overlayID {Uuid}  The ID of the overlay the hover over event occurred on.
     * @param event {PointerEvent}  The hover over event details.
     * @returns {Signal} 
     */
    function hoverOverOverlay(overlayID: Uuid, event: PointerEvent): Signal;
    /**
     * Triggered when a mouse cursor finishes hovering over an overlay. Only occurs for 3D overlays (unless you use 
     *      Overlays.sendHoverLeaveOverlay for a 2D overlay).
     * @param overlayID {Uuid}  The ID of the overlay the hover leave event occurred on.
     * @param event {PointerEvent}  The hover leave event details.
     * @returns {Signal} 
     */
    function hoverLeaveOverlay(overlayID: Uuid, event: PointerEvent): Signal;
    interface Rectangle3DProperties {
        /**
         * Has the value "rectangle3d". Read-only.
         */
        type: string;
        /**
         * The color of the overlay.
         */
        color: Color;
        /**
         * The opacity of the overlay, 0.0 - 1.0.
         */
        alpha: number;
        /**
         * The maximum value of the pulse multiplier.
         */
        pulseMax: number;
        /**
         * The minimum value of the pulse multiplier.
         */
        pulseMin: number;
        /**
         * The duration of the color and alpha pulse, in seconds. A pulse multiplier value goes from
         *     pulseMin to pulseMax, then pulseMax to pulseMin in one period.
         */
        pulsePeriod: number;
        /**
         * If non-zero, the alpha of the overlay is pulsed: the alpha value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        alphaPulse: number;
        /**
         * If non-zero, the color of the overlay is pulsed: the color value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        colorPulse: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         */
        visible: boolean;
        /**
         * A friendly name for the overlay.
         */
        name: string;
        /**
         * The position of the overlay center. Synonyms: p1, point, and
         *     start.
         */
        position: Vec3;
        /**
         * The local position of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as position.
         */
        localPosition: Vec3;
        /**
         * The orientation of the overlay. Synonym: orientation.
         */
        rotation: Quat;
        /**
         * The orientation of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as rotation.
         */
        localRotation: Quat;
        /**
         * Synonyms: solid, isFilled, and filled.
         *     Antonyms: isWire and wire.
         */
        isSolid: boolean;
        /**
         * If true, a dashed line is drawn on the overlay's edges. Synonym:
         *     dashed.
         */
        isDashedLine: boolean;
        /**
         * If true, picks ignore the overlay.  ignoreRayIntersection is a synonym.
         */
        ignorePickIntersection: boolean;
        /**
         * If true, the overlay is rendered in front of other overlays that don't
         *     have drawInFront set to true, and in front of entities.
         */
        drawInFront: boolean;
        /**
         * Signal to grabbing scripts whether or not this overlay can be grabbed.
         */
        grabbable: boolean;
        /**
         * The avatar, entity, or overlay that the overlay is parented to.
         */
        parentID: Uuid;
        /**
         * Integer value specifying the skeleton joint that the overlay is attached to if
         *     parentID is an avatar skeleton. A value of 65535 means "no joint".
         */
        parentJointIndex: number;
        /**
         * The dimensions of the overlay. Synonyms: scale, size.
         */
        dimensions: Vec2;
    }

    interface RectangleProperties {
        /**
         * The position and size of the rectangle, in pixels. Write-only.
         */
        bounds: Rect;
        /**
         * Integer left, x-coordinate value = bounds.x. Write-only.
         */
        x: number;
        /**
         * Integer top, y-coordinate value = bounds.y. Write-only.
         */
        y: number;
        /**
         * Integer width of the rectangle = bounds.width. Write-only.
         */
        width: number;
        /**
         * Integer height of the rectangle = bounds.height. Write-only.
         */
        height: number;
        /**
         * The color of the overlay. Write-only.
         */
        color: Color;
        /**
         * The opacity of the overlay, 0.0 - 1.0. Write-only.
         */
        alpha: number;
        /**
         * Integer width of the border, in pixels. The border is drawn within the rectangle's bounds.
         *     It is not drawn unless either borderColor or borderAlpha are specified. Write-only.
         */
        borderWidth: number;
        /**
         * Integer corner radius, in pixels. Write-only.
         */
        radius: number;
        /**
         * The color of the border. Write-only.
         */
        borderColor: Color;
        /**
         * The opacity of the border, 0.0 - 1.0.
         *     Write-only.
         */
        borderAlpha: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         *     Write-only.
         */
        visible: boolean;
    }

    interface ShapeProperties {
        /**
         * Has the value "shape". Read-only.
         */
        type: string;
        /**
         * The color of the overlay.
         */
        color: Color;
        /**
         * The opacity of the overlay, 0.0 - 1.0.
         */
        alpha: number;
        /**
         * The maximum value of the pulse multiplier.
         */
        pulseMax: number;
        /**
         * The minimum value of the pulse multiplier.
         */
        pulseMin: number;
        /**
         * The duration of the color and alpha pulse, in seconds. A pulse multiplier value goes from
         *     pulseMin to pulseMax, then pulseMax to pulseMin in one period.
         */
        pulsePeriod: number;
        /**
         * If non-zero, the alpha of the overlay is pulsed: the alpha value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        alphaPulse: number;
        /**
         * If non-zero, the color of the overlay is pulsed: the color value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        colorPulse: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         */
        visible: boolean;
        /**
         * A friendly name for the overlay.
         */
        name: string;
        /**
         * The position of the overlay center. Synonyms: p1, point, and
         *     start.
         */
        position: Vec3;
        /**
         * The local position of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as position.
         */
        localPosition: Vec3;
        /**
         * The orientation of the overlay. Synonym: orientation.
         */
        rotation: Quat;
        /**
         * The orientation of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as rotation.
         */
        localRotation: Quat;
        /**
         * Synonyms: solid, isFilled, and filled.
         *     Antonyms: isWire and wire.
         */
        isSolid: boolean;
        /**
         * If true, a dashed line is drawn on the overlay's edges. Synonym:
         *     dashed.
         */
        isDashedLine: boolean;
        /**
         * If true, picks ignore the overlay.  ignoreRayIntersection is a synonym.
         */
        ignorePickIntersection: boolean;
        /**
         * If true, the overlay is rendered in front of other overlays that don't
         *     have drawInFront set to true, and in front of entities.
         */
        drawInFront: boolean;
        /**
         * Signal to grabbing scripts whether or not this overlay can be grabbed.
         */
        grabbable: boolean;
        /**
         * The avatar, entity, or overlay that the overlay is parented to.
         */
        parentID: Uuid;
        /**
         * Integer value specifying the skeleton joint that the overlay is attached to if
         *     parentID is an avatar skeleton. A value of 65535 means "no joint".
         */
        parentJointIndex: number;
        /**
         * The dimensions of the overlay. Synonyms: scale, size.
         */
        dimensions: Vec3;
        /**
         * The geometrical shape of the overlay.
         */
        shape: Overlays.Shape;
    }

    interface SphereProperties {
        /**
         * Has the value "sphere". Read-only.
         */
        type: string;
        /**
         * The color of the overlay.
         */
        color: Color;
        /**
         * The opacity of the overlay, 0.0 - 1.0.
         */
        alpha: number;
        /**
         * The maximum value of the pulse multiplier.
         */
        pulseMax: number;
        /**
         * The minimum value of the pulse multiplier.
         */
        pulseMin: number;
        /**
         * The duration of the color and alpha pulse, in seconds. A pulse multiplier value goes from
         *     pulseMin to pulseMax, then pulseMax to pulseMin in one period.
         */
        pulsePeriod: number;
        /**
         * If non-zero, the alpha of the overlay is pulsed: the alpha value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        alphaPulse: number;
        /**
         * If non-zero, the color of the overlay is pulsed: the color value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        colorPulse: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         */
        visible: boolean;
        /**
         * A friendly name for the overlay.
         */
        name: string;
        /**
         * The position of the overlay center. Synonyms: p1, point, and
         *     start.
         */
        position: Vec3;
        /**
         * The local position of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as position.
         */
        localPosition: Vec3;
        /**
         * The orientation of the overlay. Synonym: orientation.
         */
        rotation: Quat;
        /**
         * The orientation of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as rotation.
         */
        localRotation: Quat;
        /**
         * Synonyms: solid, isFilled, and filled.
         *     Antonyms: isWire and wire.
         */
        isSolid: boolean;
        /**
         * If true, a dashed line is drawn on the overlay's edges. Synonym:
         *     dashed.
         */
        isDashedLine: boolean;
        /**
         * If true, picks ignore the overlay.  ignoreRayIntersection is a synonym.
         */
        ignorePickIntersection: boolean;
        /**
         * If true, the overlay is rendered in front of other overlays that don't
         *     have drawInFront set to true, and in front of entities.
         */
        drawInFront: boolean;
        /**
         * Signal to grabbing scripts whether or not this overlay can be grabbed.
         */
        grabbable: boolean;
        /**
         * The avatar, entity, or overlay that the overlay is parented to.
         */
        parentID: Uuid;
        /**
         * Integer value specifying the skeleton joint that the overlay is attached to if
         *     parentID is an avatar skeleton. A value of 65535 means "no joint".
         */
        parentJointIndex: number;
        /**
         * The dimensions of the overlay. Synonyms: scale, size.
         */
        dimensions: Vec3;
    }

    interface Text3DProperties {
        /**
         * Has the value "text3d". Read-only.
         */
        type: string;
        /**
         * The color of the overlay.
         */
        color: Color;
        /**
         * The opacity of the overlay, 0.0 - 1.0.
         */
        alpha: number;
        /**
         * The maximum value of the pulse multiplier.
         */
        pulseMax: number;
        /**
         * The minimum value of the pulse multiplier.
         */
        pulseMin: number;
        /**
         * The duration of the color and alpha pulse, in seconds. A pulse multiplier value goes from
         *     pulseMin to pulseMax, then pulseMax to pulseMin in one period.
         */
        pulsePeriod: number;
        /**
         * If non-zero, the alpha of the overlay is pulsed: the alpha value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        alphaPulse: number;
        /**
         * If non-zero, the color of the overlay is pulsed: the color value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        colorPulse: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         */
        visible: boolean;
        /**
         * A friendly name for the overlay.
         */
        name: string;
        /**
         * The position of the overlay center. Synonyms: p1, point, and
         *     start.
         */
        position: Vec3;
        /**
         * The local position of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as position.
         */
        localPosition: Vec3;
        /**
         * The orientation of the overlay. Synonym: orientation.
         */
        rotation: Quat;
        /**
         * The orientation of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as rotation.
         */
        localRotation: Quat;
        /**
         * Synonyms: solid, isFilled, and filled.
         *     Antonyms: isWire and wire.
         */
        isSolid: boolean;
        /**
         * If true, a dashed line is drawn on the overlay's edges. Synonym:
         *     dashed.
         */
        isDashedLine: boolean;
        /**
         * If true, picks ignore the overlay.  ignoreRayIntersection is a synonym.
         */
        ignorePickIntersection: boolean;
        /**
         * If true, the overlay is rendered in front of other overlays that don't
         *     have drawInFront set to true, and in front of entities.
         */
        drawInFront: boolean;
        /**
         * Signal to grabbing scripts whether or not this overlay can be grabbed.
         */
        grabbable: boolean;
        /**
         * The avatar, entity, or overlay that the overlay is parented to.
         */
        parentID: Uuid;
        /**
         * Integer value specifying the skeleton joint that the overlay is attached to if
         *     parentID is an avatar skeleton. A value of 65535 means "no joint".
         */
        parentJointIndex: number;
        /**
         * The dimensions of the overlay. Synonyms: scale, size.
         */
        dimensions: Vec2;
        /**
         * If true, the overlay is rotated to face the user's camera about an axis
         *     parallel to the user's avatar's "up" direction.
         */
        isFacingAvatar: boolean;
        /**
         * The text to display. Text does not automatically wrap; use \n for a line break.
         */
        text: string;
        /**
         * The text alpha value.
         */
        textAlpha: number;
        /**
         * The background color.
         */
        backgroundColor: Color;
        /**
         * The background alpha value.
         */
        backgroundAlpha: number;
        /**
         * The height of a line of text in meters.
         */
        lineHeight: number;
        /**
         * The left margin, in meters.
         */
        leftMargin: number;
        /**
         * The top margin, in meters.
         */
        topMargin: number;
        /**
         * The right margin, in meters.
         */
        rightMargin: number;
        /**
         * The bottom margin, in meters.
         */
        bottomMargin: number;
    }

    interface TextProperties {
        /**
         * The position and size of the rectangle, in pixels. Write-only.
         */
        bounds: Rect;
        /**
         * Integer left, x-coordinate value = bounds.x. Write-only.
         */
        x: number;
        /**
         * Integer top, y-coordinate value = bounds.y. Write-only.
         */
        y: number;
        /**
         * Integer width of the rectangle = bounds.width. Write-only.
         */
        width: number;
        /**
         * Integer height of the rectangle = bounds.height. Write-only.
         */
        height: number;
        /**
         * Sets the leftMargin and topMargin values, in pixels.
         *     Write-only.
         */
        margin: number;
        /**
         * The left margin's size, in pixels. This value is also used for the right margin. 
         *     Write-only.
         */
        leftMargin: number;
        /**
         * The top margin's size, in pixels. This value is also used for the bottom margin. 
         *     Write-only.
         */
        topMargin: number;
        /**
         * The text to display. Text does not automatically wrap; use \n for a line break. Text
         *     is clipped to the bounds. Write-only.
         */
        text: string;
        /**
         * The size of the text, in pixels. Write-only.
         */
        font.size: number;
        /**
         * The height of a line of text, in pixels. Write-only.
         */
        lineHeight: number;
        /**
         * The color of the text. Synonym: textColor. Write-only.
         */
        color: Color;
        /**
         * The opacity of the overlay, 0.0 - 1.0. Write-only.
         */
        alpha: number;
        /**
         * The color of the background rectangle. Write-only.
         */
        backgroundColor: Color;
        /**
         * The opacity of the background rectangle. Write-only.
         */
        backgroundAlpha: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         *     Write-only.
         */
        visible: boolean;
    }

    interface Web3DProperties {
        /**
         * Has the value "web3d". Read-only.
         */
        type: string;
        /**
         * The color of the overlay.
         */
        color: Color;
        /**
         * The opacity of the overlay, 0.0 - 1.0.
         */
        alpha: number;
        /**
         * The maximum value of the pulse multiplier.
         */
        pulseMax: number;
        /**
         * The minimum value of the pulse multiplier.
         */
        pulseMin: number;
        /**
         * The duration of the color and alpha pulse, in seconds. A pulse multiplier value goes from
         *     pulseMin to pulseMax, then pulseMax to pulseMin in one period.
         */
        pulsePeriod: number;
        /**
         * If non-zero, the alpha of the overlay is pulsed: the alpha value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        alphaPulse: number;
        /**
         * If non-zero, the color of the overlay is pulsed: the color value is multiplied by the
         *     current pulse multiplier value each frame. If > 0 the pulse multiplier is applied in phase with the pulse period; if < 0    the pulse multiplier is applied out of phase with the pulse period. (The magnitude of the property isn't otherwise    used.)
         */
        colorPulse: number;
        /**
         * If true, the overlay is rendered, otherwise it is not rendered.
         */
        visible: boolean;
        /**
         * A friendly name for the overlay.
         */
        name: string;
        /**
         * The position of the overlay center. Synonyms: p1, point, and 
         *     start.
         */
        position: Vec3;
        /**
         * The local position of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as position.
         */
        localPosition: Vec3;
        /**
         * The orientation of the overlay. Synonym: orientation.
         */
        rotation: Quat;
        /**
         * The orientation of the overlay relative to its parent if the overlay has a
         *     parentID set, otherwise the same value as rotation.
         */
        localRotation: Quat;
        /**
         * Synonyms: solid, isFilled, and filled.
         *     Antonyms: isWire and wire.
         */
        isSolid: boolean;
        /**
         * If true, a dashed line is drawn on the overlay's edges. Synonym:
         *     dashed.
         */
        isDashedLine: boolean;
        /**
         * If true, picks ignore the overlay.  ignoreRayIntersection is a synonym.
         */
        ignorePickIntersection: boolean;
        /**
         * If true, the overlay is rendered in front of other overlays that don't
         *     have drawInFront set to true, and in front of entities.
         */
        drawInFront: boolean;
        /**
         * Signal to grabbing scripts whether or not this overlay can be grabbed.
         */
        grabbable: boolean;
        /**
         * The avatar, entity, or overlay that the overlay is parented to.
         */
        parentID: Uuid;
        /**
         * Integer value specifying the skeleton joint that the overlay is attached to if
         *     parentID is an avatar skeleton. A value of 65535 means "no joint".
         */
        parentJointIndex: number;
        /**
         * If true, the overlay is rotated to face the user's camera about an axis
         *     parallel to the user's avatar's "up" direction.
         */
        isFacingAvatar: boolean;
        /**
         * The URL of the Web page to display.
         */
        url: string;
        /**
         * The URL of a JavaScript file to inject into the Web page.
         */
        scriptURL: string;
        /**
         * The dots per inch to display the Web page at, on the overlay.
         */
        dpi: number;
        /**
         * The size of the overlay to display the Web page on, in meters. Synonyms: 
         *     scale, size.
         */
        dimensions: Vec2;
        /**
         * The maximum update rate for the Web overlay content, in frames/second.
         */
        maxFPS: number;
        /**
         * If true, the Web overlay is highlighted when it has
         *     keyboard focus.
         */
        showKeyboardFocusHighlight: boolean;
        /**
         * The user input mode to use - either "Touch" or "Mouse".
         */
        inputMode: string;
    }

    /**
     * Get or set the  Overlays.OverlayType overlay that has keyboard focus.
     *     If no overlay has keyboard focus, get returns null; set to null or  Uuid to     clear keyboard focus.
     */
    let keyboardFocusOverlay: Uuid;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client Scripts
 */
declare class AnimationObject {
    /**
     * @returns {Array.<string>} 
     */
    getJointNames(): Array.<string>;
    /**
     * @returns {Array.<FBXAnimationFrame>} 
     */
    getFrames(): Array.<FBXAnimationFrame>;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsAssignment Client ScriptsAPI to manage animation cache resources.
 */
declare namespace AnimationCache {
    /**
     * Returns animation resource for particular animation.
     * @param url {string}  URL to load.
     * @returns {AnimationObject} 
     */
    function getAnimation(url: string): AnimationObject;
    /**
     * Get the list of all resource URLs.
     * @returns {Array.<string>} 
     */
    function getResourceList(): Array.<string>;
    /**
     * @param deltaSize {number}  
     */
    function updateTotalSize(deltaSize: number): void;
    /**
     * Prefetches a resource.
     * @param url {string}  URL of the resource to prefetch.
     * @param extra {object} [extra=null] 
     * @returns {ResourceObject} 
     */
    function prefetch(url: string, extra: object): ResourceObject;
    /**
     * @returns {Signal} 
     */
    function dirty(): Signal;
    /**
     * Total number of total resources. Read-only.
     */
    let numTotal: number;
    /**
     * Total number of cached resource. Read-only.
     */
    let numCached: number;
    /**
     * Size in bytes of all resources. Read-only.
     */
    let sizeTotal: number;
    /**
     * Size in bytes of all cached resources. Read-only.
     */
    let sizeCached: number;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare class AudioStreamStats {
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsAudio stats from the client.
 */
declare namespace AudioStats {
    /**
     * @param pingMs {number}  
     * @returns {Signal} 
     */
    function pingMsChanged(pingMs: number): Signal;
    /**
     * @param inputReadMsMax {number}  
     * @returns {Signal} 
     */
    function inputReadMsMaxChanged(inputReadMsMax: number): Signal;
    /**
     * @param inputUnplayedMsMax {number}  
     * @returns {Signal} 
     */
    function inputUnplayedMsMaxChanged(inputUnplayedMsMax: number): Signal;
    /**
     * @param outputUnplayedMsMax {number}  
     * @returns {Signal} 
     */
    function outputUnplayedMsMaxChanged(outputUnplayedMsMax: number): Signal;
    /**
     * @param sentTimegapMsMax {number}  
     * @returns {Signal} 
     */
    function sentTimegapMsMaxChanged(sentTimegapMsMax: number): Signal;
    /**
     * @param sentTimegapMsAvg {number}  
     * @returns {Signal} 
     */
    function sentTimegapMsAvgChanged(sentTimegapMsAvg: number): Signal;
    /**
     * @param sentTimegapMsMaxWindow {number}  
     * @returns {Signal} 
     */
    function sentTimegapMsMaxWindowChanged(sentTimegapMsMaxWindow: number): Signal;
    /**
     * @param sentTimegapMsAvgWindow {number}  
     * @returns {Signal} 
     */
    function sentTimegapMsAvgWindowChanged(sentTimegapMsAvgWindow: number): Signal;
    /**
     * @returns {Signal} 
     */
    function mixerStreamChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function clientStreamChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function injectorStreamsChanged(): Signal;
    /**
     * Read-only.
     */
    let pingMs: number;
    /**
     * Read-only.
     */
    let inputReadMsMax: number;
    /**
     * Read-only.
     */
    let inputUnplayedMsMax: number;
    /**
     * Read-only.
     */
    let outputUnplayedMsMax: number;
    /**
     * Read-only.
     */
    let sentTimegapMsMax: number;
    /**
     * Read-only.
     */
    let sentTimegapMsAvg: number;
    /**
     * Read-only.
     */
    let sentTimegapMsMaxWindow: number;
    /**
     * Read-only.
     */
    let sentTimegapMsAvgWindow: number;
    /**
     * Read-only.
     */
    let clientStream: AudioStats.AudioStreamStats;
    /**
     * Read-only.
     */
    let mixerStream: AudioStats.AudioStreamStats;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client ScriptsAudio effect options used by the  Audio API.
 * Create using new AudioEffectOptions(reverbOptions).
 * @param reverbOptions {AudioEffectOptions.ReverbOptions} [reverbOptions=null] Reverberation options.
 */
declare class AudioEffectOptions {
    interface ReverbOptions {
        /**
         * The corner frequency (Hz) of the low-pass filter at reverb input.
         */
        bandwidth: number;
        /**
         * The delay (milliseconds) between dry signal and the onset of early reflections.
         */
        preDelay: number;
        /**
         * The delay (milliseconds) between early reflections and the onset of reverb tail.
         */
        lateDelay: number;
        /**
         * The time (seconds) for the reverb tail to decay by 60dB, also known as RT60.
         */
        reverbTime: number;
        /**
         * Adjusts the buildup of echo density in the early reflections, normally 100%.
         */
        earlyDiffusion: number;
        /**
         * Adjusts the buildup of echo density in the reverb tail, normally 100%.
         */
        lateDiffusion: number;
        /**
         * The apparent room size, from small (0%) to large (100%).
         */
        roomSize: number;
        /**
         * Adjusts the echo density in the reverb tail, normally 100%.
         */
        density: number;
        /**
         * Adjusts the bass-frequency reverb time, as multiple of reverbTime.
         */
        bassMult: number;
        /**
         * The crossover frequency (Hz) for the onset of bassMult.
         */
        bassFreq: number;
        /**
         * Reduces the high-frequency reverb time, as attenuation (dB).
         */
        highGain: number;
        /**
         * The crossover frequency (Hz) for the onset of highGain.
         */
        highFreq: number;
        /**
         * The rate of modulation (Hz) of the LFO-modulated delay lines.
         */
        modRate: number;
        /**
         * The depth of modulation (percent) of the LFO-modulated delay lines.
         */
        modDepth: number;
        /**
         * Adjusts the relative level (dB) of the early reflections.
         */
        earlyGain: number;
        /**
         * Adjusts the relative level (dB) of the reverb tail.
         */
        lateGain: number;
        /**
         * The apparent distance of the source (percent) in the early reflections.
         */
        earlyMixLeft: number;
        /**
         * The apparent distance of the source (percent) in the early reflections.
         */
        earlyMixRight: number;
        /**
         * The apparent distance of the source (percent) in the reverb tail.
         */
        lateMixLeft: number;
        /**
         * The apparent distance of the source (percent) in the reverb tail.
         */
        lateMixRight: number;
        /**
         * Adjusts the wet/dry ratio, from completely dry (0%) to completely wet (100%).
         */
        wetDryMix: number;
    }

}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client ScriptsAn audio resource, created by  SoundCache.getSound, to be played back using  Audio.playSound.
 * Supported formats:  WAV: 16-bit uncompressed WAV at any sample rate, with 1 (mono), 2(stereo), or 4 (ambisonic) channels.  MP3: Mono or stereo, at any sample rate.  RAW: 48khz 16-bit mono or stereo. Filename must include ".stereo" to be interpreted as stereo.
 */
declare class SoundObject {
    /**
     * Triggered when the sound has been downloaded and is ready to be played.
     * @returns {Signal} 
     */
    ready(): Signal;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client ScriptsAPI to manage sound cache resources.
 */
declare namespace SoundCache {
    /**
     * Loads the content of an audio file into a  SoundObject, ready for playback by  Audio.playSound.
     * @param url {string}  The URL of the audio file to load &mdash; Web, ATP, or file. See {@link SoundObject} for supported 
     *     formats.
     * @returns {SoundObject} 
     */
    function getSound(url: string): SoundObject;
    /**
     * Get the list of all resource URLs.
     * @returns {Array.<string>} 
     */
    function getResourceList(): Array.<string>;
    /**
     * @param deltaSize {number}  
     */
    function updateTotalSize(deltaSize: number): void;
    /**
     * Prefetches a resource.
     * @param url {string}  URL of the resource to prefetch.
     * @param extra {object} [extra=null] 
     * @returns {ResourceObject} 
     */
    function prefetch(url: string, extra: object): ResourceObject;
    /**
     * @returns {Signal} 
     */
    function dirty(): Signal;
    /**
     * Total number of total resources. Read-only.
     */
    let numTotal: number;
    /**
     * Total number of cached resource. Read-only.
     */
    let numCached: number;
    /**
     * Size in bytes of all resources. Read-only.
     */
    let sizeTotal: number;
    /**
     * Size in bytes of all cached resources. Read-only.
     */
    let sizeCached: number;
}

/**
 * Available in:Assignment Client ScriptsNote: An AvatarList API is also provided for Interface and client entity scripts: it is a 
 * synonym for the  AvatarManager API.
 */
declare namespace AvatarList {
    /**
     * @returns {Array.<Uuid>} 
     */
    function getAvatarIdentifiers(): Array.<Uuid>;
    /**
     * @param position {Vec3}  
     * @param range {number}  
     * @returns {Array.<Uuid>} 
     */
    function getAvatarsInRange(position: Vec3, range: number): Array.<Uuid>;
    /**
     * @param avatarID {Uuid}  
     * @returns {AvatarData} 
     */
    function getAvatar(avatarID: Uuid): AvatarData;
    /**
     * @param sessionUUID {Uuid}  
     * @returns {Signal} 
     */
    function avatarAddedEvent(sessionUUID: Uuid): Signal;
    /**
     * @param sessionUUID {Uuid}  
     * @returns {Signal} 
     */
    function avatarRemovedEvent(sessionUUID: Uuid): Signal;
    /**
     * @param sessionUUID {Uuid}  
     * @param oldSessionUUID {Uuid}  
     * @returns {Signal} 
     */
    function avatarSessionChangedEvent(sessionUUID: Uuid, oldSessionUUID: Uuid): Signal;
    /**
     * @param position {string}  
     * @param range {string}  
     * @returns {boolean} 
     */
    function isAvatarInRange(position: string, range: string): boolean;
    /**
     * @param sessionUUID {Uuid}  
     * @param oldSessionUUID {Uuid}  
     */
    function sessionUUIDChanged(sessionUUID: Uuid, oldSessionUUID: Uuid): void;
    /**
     * @param message {}  
     * @param sendingNode {}  
     */
    function processAvatarDataPacket(message, sendingNode): void;
    /**
     * @param message {}  
     * @param sendingNode {}  
     */
    function processAvatarIdentityPacket(message, sendingNode): void;
    /**
     * @param message {}  
     * @param sendingNode {}  
     */
    function processKillAvatar(message, sendingNode): void;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsA  Controller mapping object that can contain a set of routes that map:
 *      Controller.Standard outputs to  Controller.Actions actions or script functions.     Controller.Hardware outputs to  Controller.Standard outputs,  Controller.Actions actions, or     script functions.Create by one of the following methods:    Use  Controller.newMapping to create the mapping object, add routes using  MappingObject#from or     MappingObject#makeAxis, and map the routes to actions or functions using  RouteObject     methods.    Use  Controller.parseMapping or  Controller.loadMapping to load a  Controller.MappingJSON.Enable the mapping using  MappingObject#enable or  Controller.enableMapping for it to take effect.Mappings and their routes are applied according to the following rules:    One read per output: after a controller output has been read, it can't be read again. Exception: You can use      RouteObject#peek to read a value without marking that output as having been read.    Existing mapping routes take precedence over new mapping routes: within a mapping, if a route is added for a control     output that already has a route the new route is ignored.    New mappings override previous mappings: each output is processed using the route in the most recently enabled     mapping that contains that output.
 */
declare class MappingObject {
    /**
     * Create a new  RouteObject from a controller output, ready to be mapped to a standard control, action, or 
     * function.This is a QML-specific version of  MappingObject#from: use this version in QML files.
     * @param source {Controller.Standard}  The controller output or function that is the source
     *     of the route data. If a function, it must return a number or a {@link Pose} value as the route data.
     * @returns {RouteObject} 
     */
    fromQml(source: Controller.Standard): RouteObject;
    /**
     * Create a new  RouteObject from two numeric  Controller.Hardware outputs, one applied in the negative 
     * direction and the other in the positive direction, ready to be mapped to a standard control, action, or function.This is a QML-specific version of  MappingObject#makeAxis: use this version in QML files.
     * @param source1 {Controller.Hardware}  The first, negative-direction controller output.
     * @param source2 {Controller.Hardware}  The second, positive-direction controller output.
     * @returns {RouteObject} 
     */
    makeAxisQml(source1: Controller.Hardware, source2: Controller.Hardware): RouteObject;
    /**
     * Create a new  RouteObject from a controller output, ready to be mapped to a standard control, action, or 
     * function.
     * @param source {Controller.Standard}  The controller output or function that is the source 
     *     of the route data. If a function, it must return a number or a {@link Pose} value as the route data.
     * @returns {RouteObject} 
     */
    from(source: Controller.Standard): RouteObject;
    /**
     * Create a new  RouteObject from two numeric  Controller.Hardware outputs, one applied in the negative 
     * direction and the other in the positive direction, ready to be mapped to a standard control, action, or function.
     * @param source1 {Controller.Hardware}  The first, negative-direction controller output.
     * @param source2 {Controller.Hardware}  The second, positive-direction controller output.
     * @returns {RouteObject} 
     */
    makeAxis(source1: Controller.Hardware, source2: Controller.Hardware): RouteObject;
    /**
     * Enable or disable the mapping. When enabled, the routes in the mapping take effect.
     * Synonymous with  Controller.enableMapping.
     * @param enable {boolean}  If <code>true</code> then the mapping is enabled, otherwise it is disabled.
     * @returns {MappingObject} 
     */
    enable(enable: boolean): MappingObject;
    /**
     * Disable the mapping. When disabled, the routes in the mapping have no effect.
     * Synonymous with  Controller.disableMapping.
     * @returns {MappingObject} 
     */
    disable(): MappingObject;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsA route in a  MappingObject used by the  Controller API.
 * Create a route using  MappingObject methods and apply this object's methods to process it, terminating with  RouteObject#to to apply it to a Standard control, action, or script function. Note: Loops are not permitted.Some methods apply to routes with number data, some apply routes with  Pose data, and some apply to both route types.
 */
declare class RouteObject {
    /**
     * Terminate the route with a standard control, an action, or a script function. The output value from the route is 
     * sent to the specified destination.This is a QML-specific version of  MappingObject#to: use this version in QML files.
     * @param destination {Controller.Standard}  The standard control, action, or JavaScript
     * function that the route output is mapped to. For a function, the parameter can be either the name of the function oran in-line function definition.
     */
    toQml(destination: Controller.Standard): void;
    /**
     * Process the route only if a condition is satisfied. The condition is evaluated before the route input is read, and
     * the input is read only if the condition is true. Thus, if the condition is not met then subsequentroutes using the same input are processed.This is a QML-specific version of  MappingObject#to: use this version in QML files.
     * @param expression {condition}  <p>A <code>condition</code> may be a:</p>
     *     <ul>        <li>A boolean or numeric {@link Controller.Hardware} property, which is evaluated as a boolean.</li>        <li><code>!</code> followed by a {@link Controller.Hardware} property, indicating the logical NOT should be        used.</li>        <li>A script function returning a boolean value. This can be either the name of the function or an in-line        definition.</li>    </ul><p>If an array of conditions is provided, their values are ANDed together.</p>
     * @returns {RouteObject} 
     */
    whenQml(expression: condition): RouteObject;
    /**
     * Terminate the route with a standard control, an action, or a script function. The output value from the route is 
     * sent to the specified destination.
     * @param destination {Controller.Standard}  The standard control, action, or JavaScript 
     * function that the route output is mapped to. For a function, the parameter can be either the name of the function or an in-line function definition.
     */
    to(destination: Controller.Standard): void;
    /**
     * Enable and disabling writing debug information for a route to the program log.
     * @param enable {boolean} [enable=true] If <code>true</code> then writing debug information is enabled for the route, 
     *     otherwise it is disabled.
     * @returns {RouteObject} 
     */
    debug(enable: boolean): RouteObject;
    /**
     * Process the route without marking the controller output as having been read, so that other routes from the same 
     * controller output can also process.
     * @param enable {boolean} [enable=true] If <code>true</code> then the route is processed without marking the route's 
     *     controller source as having been read.
     * @returns {RouteObject} 
     */
    peek(enable: boolean): RouteObject;
    /**
     * Process the route only if a condition is satisfied. The condition is evaluated before the route input is read, and 
     * the input is read only if the condition is true. Thus, if the condition is not met then subsequent routes using the same input are processed.
     * @param expression {condition}  <p>A <code>condition</code> may be a:</p>
     *     <ul>        <li>A numeric {@link Controller.Hardware} property, which is evaluated as a boolean.</li>        <li><code>!</code> followed by a {@link Controller.Hardware} property to use the logical NOT of the property         value.</li>        <li>A script function returning a boolean value. This can be either the name of the function or an in-line         definition.</li>    </ul><p>If an array of conditions is provided, their values are ANDed together.</p>
     * @returns {RouteObject} 
     */
    when(expression: condition): RouteObject;
    /**
     * Filter numeric route values to lie between two values; values outside this range are not passed on through the 
     * route.
     * @param min {number}  The minimum value to pass through.
     * @param max {number}  The maximum value to pass through.
     * @returns {RouteObject} 
     */
    clamp(min: number, max: number): RouteObject;
    /**
     * Filter numeric route values such that they are rounded to 0 or 1 without output values 
     * flickering when the input value hovers around 0.5. For example, this enables you to use an analog input as if it were a toggle.
     * @param min {number}  When the input value drops below this value the output value changes to <code>0</code>.
     * @param max {number}  When the input value rises above this value the output value changes to <code>1</code>.
     * @returns {RouteObject} 
     */
    hysteresis(min: number, max: number): RouteObject;
    /**
     * Filter numeric route values to send at a specified interval.
     * @param interval {number}  The interval between sending values, in seconds.
     * @returns {RouteObject} 
     */
    pulse(interval: number): RouteObject;
    /**
     * Filter numeric and  Pose route values to be scaled by a constant amount.
     * @param multiplier {number}  The scale to multiply the value by.
     * @returns {RouteObject} 
     */
    scale(multiplier: number): RouteObject;
    /**
     * Filter numeric and  Pose route values to have the opposite sign, e.g., 0.5 is changed to 
     * -0.5.
     * @returns {RouteObject} 
     */
    invert(): RouteObject;
    /**
     * Filter numeric route values such that they're sent only when the input value is outside a dead-zone. When the input 
     * passes the dead-zone value, output is sent starting at 0.0 and catching up with the input value. As the input returns toward the dead-zone value, output values reduce to 0.0 at the dead-zone value.
     * @param min {number}  The minimum input value at which to start sending output. For negative input values, the 
     *    negative of this value is used.
     * @returns {RouteObject} 
     */
    deadZone(min: number): RouteObject;
    /**
     * Filter numeric route values such that they are rounded to -1, 0, or 1.
     * For example, this enables you to use an analog input as if it were a toggle or, in the case of a bidirectional axis, a tri-state switch.
     * @returns {RouteObject} 
     */
    constrainToInteger(): RouteObject;
    /**
     * Filter numeric route values such that they are rounded to 0 or 1. For example, this 
     * enables you to use an analog input as if it were a toggle.
     * @returns {RouteObject} 
     */
    constrainToPositiveInteger(): RouteObject;
    /**
     * Filter  Pose route values to have a pre-translation applied.
     * @param translate {Vec3}  The pre-translation to add to the pose.
     * @returns {RouteObject} 
     */
    translate(translate: Vec3): RouteObject;
    /**
     * Filter  Pose route values to have a pre-transform applied.
     * @param transform {Mat4}  The pre-transform to apply.
     * @returns {RouteObject} 
     */
    transform(transform: Mat4): RouteObject;
    /**
     * Filter  Pose route values to have a post-transform applied.
     * @param transform {Mat4}  The post-transform to apply.
     * @returns {RouteObject} 
     */
    postTransform(transform: Mat4): RouteObject;
    /**
     * Filter  Pose route values to have a pre-rotation applied.
     * @param rotation {Quat}  The pre-rotation to add to the pose.
     * @returns {RouteObject} 
     */
    rotate(rotation: Quat): RouteObject;
    /**
     * Filter  Pose route values to be smoothed by a low velocity filter. The filter's rotation and translation 
     * values are calculated as: (1 - f) * currentValue + f * previousValue where f = currentVelocity / filterConstant. At low velocities, the filter value is largely the previous value; at high velocities the value is wholly the current controller value.
     * @param rotationConstant {number}  The rotational velocity, in rad/s, at which the filter value is wholly the latest 
     *     controller value.
     * @param translationConstant {number}  The linear velocity, in m/s, at which the filter value is wholly the latest 
     *     controller value.
     * @returns {RouteObject} 
     */
    lowVelocity(rotationConstant: number, translationConstant: number): RouteObject;
    /**
     * Filter  Pose route values to be smoothed by an exponential decay filter. The filter's rotation and 
     * translation values are calculated as: filterConstant * currentValue + (1 - filterConstant) * previousValue. Values near 1 are less smooth with lower latency; values near 0 are more smooth with higher latency.
     * @param rotationConstant {number}  Rotation filter constant, <code>0.0&ndash;1.0</code>.
     * @param translationConstant {number}  Translation filter constant, <code>0.0&ndash;1.0</code>.
     * @returns {RouteObject} 
     */
    exponentialSmoothing(rotationConstant: number, translationConstant: number): RouteObject;
    /**
     * Filter numeric route values such that a value of 0.0 is changed to 1.0, and other values 
     * are changed to 0.0.
     * @returns {RouteObject} 
     */
    logicalNot(): RouteObject;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace Reticle {
    /**
     * @returns {boolean} 
     */
    function isMouseCaptured(): boolean;
    /**
     * @returns {boolean} 
     */
    function getAllowMouseCapture(): boolean;
    /**
     * @param allowMouseCaptured {boolean}  
     */
    function setAllowMouseCapture(allowMouseCaptured: boolean): void;
    /**
     * @returns {boolean} 
     */
    function isPointingAtSystemOverlay(): boolean;
    /**
     * @returns {boolean} 
     */
    function getVisible(): boolean;
    /**
     * @param visible {boolean}  
     */
    function setVisible(visible: boolean): void;
    /**
     * @returns {number} 
     */
    function getDepth(): number;
    /**
     * @param depth {number}  
     */
    function setDepth(depth: number): void;
    /**
     * @returns {number} 
     */
    function getScale(): number;
    /**
     * @param scale {number}  
     */
    function setScale(scale: number): void;
    /**
     * @returns {Vec2} 
     */
    function getPosition(): Vec2;
    /**
     * @param position {Vec2}  
     */
    function setPosition(position: Vec2): void;
    /**
     * @returns {Vec2} 
     */
    function getMaximumPosition(): Vec2;
    let allowMouseCapture: boolean;
    let depth: number;
    let maximumPosition: Vec2;
    let mouseCaptured: boolean;
    let pointingAtSystemOverlay: boolean;
    let position: Vec2;
    let scale: number;
    let visible: boolean;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client ScriptsThe Entities API provides facilities to create and interact with entities. Entities are 2D and 3D objects that are visible
 * to everyone and typically are persisted to the domain. For Interface scripts, the entities available are those that Interface has displayed and so knows about.
 */
declare namespace Entities {
    interface ActionArguments-FarGrab {
        /**
         * The target position.
         */
        targetPosition: Vec3;
        /**
         * The target rotation.
         */
        targetRotation: Quat;
        /**
         * If an entity ID, the targetPosition and targetRotation are 
         *     relative to this entity's position and rotation.
         */
        otherID: Uuid;
        /**
         * Controls how long it takes for the entity's position to catch up with the
         *     target position. The value is the time for the action to catch up to 1/e = 0.368 of the target value, where the action     is applied using an exponential decay.
         */
        linearTimeScale: number;
        /**
         * Controls how long it takes for the entity's orientation to catch up with the
         *     target orientation. The value is the time for the action to catch up to 1/e = 0.368 of the target value, where the     action is applied using an exponential decay.
         */
        angularTimeScale: number;
    }

    interface ActionArguments-Hold {
        /**
         * The ID of the avatar holding the entity.
         */
        holderID: Uuid;
        /**
         * The target position relative to the avatar's hand.
         */
        relativePosition: Vec3;
        /**
         * The target rotation relative to the avatar's hand.
         */
        relativeRotation: Vec3;
        /**
         * Controls how long it takes for the entity's position and rotation to catch up with 
         *     the target. The value is the time for the action to catch up to 1/e = 0.368 of the target value, where the action is     applied using an exponential decay.
         */
        timeScale: number;
        /**
         * The hand holding the entity: "left" or "right".
         */
        hand: string;
        /**
         * If true, the entity is made kinematic during the action; the entity won't 
         *    lag behind the hand but constraint actions such as "hinge" won't act properly.
         */
        kinematic: boolean;
        /**
         * If true and kinematic is true, the 
         *    entity's velocity property will be set during the action, e.g., so that other scripts may use the value.
         */
        kinematicSetVelocity: boolean;
        /**
         * If true, the entity follows the HMD controller rather than the avatar's 
         *    hand.
         */
        ignoreIK: boolean;
    }

    interface AmbientLight {
        /**
         * The intensity of the light.
         */
        ambientIntensity: number;
        /**
         * A cube map image that defines the color of the light coming from each direction. If 
         *     "" then the entity's  Entities.Skybox url property value is used, unless that also is "" in which     case the entity's ambientLightMode property is set to "inherit".
         */
        ambientURL: string;
    }

    interface AnimationProperties {
        /**
         * The URL of the FBX file that has the animation.
         */
        url: string;
        /**
         * The speed in frames/s that the animation is played at.
         */
        fps: number;
        /**
         * The first frame to play in the animation.
         */
        firstFrame: number;
        /**
         * The last frame to play in the animation.
         */
        lastFrame: number;
        /**
         * The current frame being played in the animation.
         */
        currentFrame: number;
        /**
         * If true then the animation should play.
         */
        running: boolean;
        /**
         * If true then the animation should be continuously repeated in a loop.
         */
        loop: boolean;
        /**
         * If true then the rotations and translations of the last frame played should be
         *     maintained when the animation stops playing.
         */
        hold: boolean;
    }

    interface Bloom {
        /**
         * The intensity of the bloom effect.
         */
        bloomIntensity: number;
        /**
         * The threshold for the bloom effect.
         */
        bloomThreshold: number;
        /**
         * The size of the bloom effect.
         */
        bloomSize: number;
    }

    interface EntityProperties {
        /**
         * The ID of the entity. Read-only.
         */
        id: Uuid;
        /**
         * A name for the entity. Need not be unique.
         */
        name: string;
        /**
         * The entity type. You cannot change the type of an entity after it's created. (Though 
         *     its value may switch among "Box", "Shape", and "Sphere" depending on changes to     the shape property set for entities of these types.) Read-only.
         */
        type: Entities.EntityType;
        /**
         * If true then the entity is an avatar entity; otherwise it is a server
         *     entity. An avatar entity follows you to each domain you visit, rendering at the same world coordinates unless it's     parented to your avatar. Value cannot be changed after the entity is created.    The value can also be set at entity creation by using the clientOnly parameter in      Entities.addEntity.
         */
        clientOnly: boolean;
        /**
         * The session ID of the owning avatar if clientOnly is 
         *     true, otherwise  Uuid. Read-only.
         */
        owningAvatarID: Uuid;
        /**
         * The UTC date and time that the entity was created, in ISO 8601 format as
         *     yyyy-MM-ddTHH:mm:ssZ. Read-only.
         */
        created: string;
        /**
         * The age of the entity in seconds since it was created. Read-only.
         */
        age: number;
        /**
         * The age of the entity since it was created, formatted as h hours m minutes s 
         *     seconds.
         */
        ageAsText: string;
        /**
         * How long an entity lives for, in seconds, before being automatically deleted. A value of
         *     -1 means that the entity lives for ever.
         */
        lifetime: number;
        /**
         * When the entity was last edited, expressed as the number of microseconds since
         *     1970-01-01T00:00:00 UTC. Read-only.
         */
        lastEdited: number;
        /**
         * The session ID of the avatar or agent that most recently created or edited the entity.
         *     Read-only.
         */
        lastEditedBy: Uuid;
        /**
         * Whether or not the entity can be edited or deleted. If true then the 
         *     entity's properties other than locked cannot be changed, and the entity cannot be deleted.
         */
        locked: boolean;
        /**
         * Whether or not the entity is rendered. If true then the entity is rendered.
         */
        visible: boolean;
        /**
         * Whether or not the entity can cast a shadow. Currently applicable only to 
         *      Entities.EntityType and  Entities.EntityType entities. Shadows are cast if inside a      Entities.EntityType entity with castShadows enabled in its      Entities.EntityProperties-Zone property.
         */
        canCastShadow: boolean;
        /**
         * Whether or not the entity is rendered in the secondary camera. If true then the entity is rendered.
         */
        isVisibleInSecondaryCamera: boolean;
        /**
         * The position of the entity.
         */
        position: Vec3;
        /**
         * The orientation of the entity with respect to world coordinates.
         */
        rotation: Quat;
        /**
         * The point in the entity that is set to the entity's position and is rotated 
         *      about,  Vec3 &ndash;  Vec3. A value of  Vec3 is the entity's     minimum x, y, z corner; a value of  Vec3 is the entity's maximum x, y, z corner.
         */
        registrationPoint: Vec3;
        /**
         * The center of the entity's unscaled mesh model if it has one, otherwise
         *      Vec3. Read-only.
         */
        naturalPosition: Vec3;
        /**
         * The dimensions of the entity's unscaled mesh model if it has one, otherwise 
         *      Vec3. Read-only.
         */
        naturalDimensions: Vec3;
        /**
         * The linear velocity of the entity in m/s with respect to world coordinates.
         */
        velocity: Vec3;
        /**
         * How much to slow down the linear velocity of an entity over time, 0.0 
         *     &ndash; 1.0. A higher damping value slows down the entity more quickly. The default value is for an     exponential decay timescale of 2.0s, where it takes 2.0s for the movement to slow to 1/e = 0.368 of its     initial value.
         */
        damping: number;
        /**
         * The angular velocity of the entity in rad/s with respect to its axes, about its
         *     registration point.
         */
        angularVelocity: Vec3;
        /**
         * How much to slow down the angular velocity of an entity over time, 
         *     0.0 &ndash; 1.0. A higher damping value slows down the entity more quickly. The default value     is for an exponential decay timescale of 2.0s, where it takes 2.0s for the movement to slow to 1/e = 0.368     of its initial value.
         */
        angularDamping: number;
        /**
         * The acceleration due to gravity in m/s2 that the entity should move with, in 
         *     world coordinates. Set to { x: 0, y: -9.8, z: 0 } to simulate Earth's gravity. Gravity is applied to an     entity's motion only if its dynamic property is true. If changing an entity's     gravity from  Vec3, you need to give it a small velocity in order to kick     off physics simulation.    The gravity value is applied in addition to the acceleration value.
         */
        gravity: Vec3;
        /**
         * A general acceleration in m/s2 that the entity should move with, in world 
         *     coordinates. The acceleration is applied to an entity's motion only if its dynamic property is     true. If changing an entity's acceleration from  Vec3, you need to give it     a small velocity in order to kick off physics simulation.    The acceleration value is applied in addition to the gravity value.
         */
        acceleration: Vec3;
        /**
         * The "bounciness" of an entity when it collides, 0.0 &ndash; 
         *     0.99. The higher the value, the more bouncy.
         */
        restitution: number;
        /**
         * How much to slow down an entity when it's moving against another, 0.0 &ndash; 
         *     10.0. The higher the value, the more quickly it slows down. Examples: 0.1 for ice,     0.9 for sandpaper.
         */
        friction: number;
        /**
         * The density of the entity in kg/m3, 100 for balsa wood &ndash; 
         *     10000 for silver. The density is used in conjunction with the entity's bounding box volume to work out its     mass in the application of physics.
         */
        density: number;
        /**
         * Whether or not the entity should collide with items per its 
         *     collisionMask property. If true then the entity does not collide.
         */
        collisionless: boolean;
        /**
         * Synonym for collisionless.
         */
        ignoreForCollisions: boolean;
        /**
         * What types of items the entity should collide with.
         */
        collisionMask: Entities.CollisionMask;
        /**
         * Synonym for collisionMask,
         *     in text format.
         */
        collidesWith: string;
        /**
         * The sound to play when the entity experiences a collision. Valid file formats are
         *     as per the  SoundCache object.
         */
        collisionSoundURL: string;
        /**
         * Whether or not the entity should be affected by collisions. If true then 
         *     the entity's movement is affected by collisions.
         */
        dynamic: boolean;
        /**
         * Synonym for dynamic.
         */
        collisionsWillMove: boolean;
        /**
         * A "hifi://" metaverse address that a user is taken to when they click on the entity.
         */
        href: string;
        /**
         * A description of the href property value.
         */
        description: string;
        /**
         * Used to store extra data about the entity in JSON format. WARNING: Other apps such as the 
         *     Create app can also use this property, so make sure you handle data stored by other apps &mdash; edit only your bit and     leave the rest of the data intact. You can use JSON.parse() to parse the string into a JavaScript object     which you can manipulate the properties of, and use JSON.stringify() to convert the object into a string to     put in the property.
         */
        userData: string;
        /**
         * The URL of the client entity script, if any, that is attached to the entity.
         */
        script: string;
        /**
         * Intended to be used to indicate when the client entity script was loaded. Should be 
         *     an integer number of milliseconds since midnight GMT on January 1, 1970 (e.g., as supplied by Date.now().     If you update the property's value, the script is re-downloaded and reloaded. This is how the "reload"     button beside the "script URL" field in properties tab of the Create app works.
         */
        scriptTimestamp: number;
        /**
         * The URL of the server entity script, if any, that is attached to the entity.
         */
        serverScripts: string;
        /**
         * The ID of the entity or avatar that this entity is parented to.  Uuid 
         *     if the entity is not parented.
         */
        parentID: Uuid;
        /**
         * The joint of the entity or avatar that this entity is parented to. Use 
         *     65535 or -1 to parent to the entity or avatar's position and orientation rather than a joint.
         */
        parentJointIndex: number;
        /**
         * The position of the entity relative to its parent if the entity is parented, 
         *     otherwise the same value as position. If the entity is parented to an avatar and is clientOnly     so that it scales with the avatar, this value remains the original local position value while the avatar scale changes.
         */
        localPosition: Vec3;
        /**
         * The rotation of the entity relative to its parent if the entity is parented, 
         *     otherwise the same value as rotation.
         */
        localRotation: Quat;
        /**
         * The velocity of the entity relative to its parent if the entity is parented, 
         *     otherwise the same value as velocity.
         */
        localVelocity: Vec3;
        /**
         * The angular velocity of the entity relative to its parent if the entity is 
         *     parented, otherwise the same value as position.
         */
        localAngularVelocity: Vec3;
        /**
         * The dimensions of the entity. If the entity is parented to an avatar and is 
         *     clientOnly so that it scales with the avatar, this value remains the original dimensions value while the     avatar scale changes.
         */
        localDimensions: Vec3;
        /**
         * The axis-aligned bounding box that tightly encloses the entity. 
         *     Read-only.
         */
        boundingBox: Entities.BoundingBox;
        /**
         * The axis-aligned cube that determines where the entity lives in the entity server's octree. 
         *     The cube may be considerably larger than the entity in some situations, e.g., when the entity is grabbed by an avatar:     the position of the entity is determined through avatar mixer updates and so the AA cube is expanded in order to reduce     unnecessary entity server updates. Scripts should not change this property's value.
         */
        queryAACube: AACube;
        /**
         * Base-64 encoded compressed dump of the actions associated with the entity. This property
         *     is typically not used in scripts directly; rather, functions that manipulate an entity's actions update it.    The size of this property increases with the number of actions. Because this property value has to fit within a High     Fidelity datagram packet there is a limit to the number of actions that an entity can have, and edits which would result     in overflow are rejected.    Read-only.
         */
        actionData: string;
        /**
         * Information on the cost of rendering the entity. Currently information is only 
         *     provided for Model entities. Read-only.
         */
        renderInfo: Entities.RenderInfo;
        /**
         * If true then the entity can be cloned via  Entities.cloneEntity.
         */
        cloneable: boolean;
        /**
         * The entity lifetime for clones created from this entity.
         */
        cloneLifetime: number;
        /**
         * The total number of clones of this entity that can exist in the domain at any given time.
         */
        cloneLimit: number;
        /**
         * If true then clones created from this entity will have their 
         *     dynamic property set to true.
         */
        cloneDynamic: boolean;
        /**
         * If true then clones created from this entity will be created as 
         *     avatar entities: their clientOnly property will be set to true.
         */
        cloneAvatarEntity: boolean;
        /**
         * The ID of the entity that this entity was cloned from.
         */
        cloneOriginID: Uuid;
        /**
         * Certifiable name of the Marketplace item.
         */
        itemName: string;
        /**
         * Certifiable description of the Marketplace item.
         */
        itemDescription: string;
        /**
         * Certifiable category of the Marketplace item.
         */
        itemCategories: string;
        /**
         * Certifiable  artist that created the Marketplace item.
         */
        itemArtist: string;
        /**
         * Certifiable license URL for the Marketplace item.
         */
        itemLicense: string;
        /**
         * Certifiable maximum integer number of editions (copies) of the Marketplace item 
         *     allowed to be sold.
         */
        limitedRun: number;
        /**
         * Certifiable integer edition (copy) number or the Marketplace item. Each copy sold in 
         *     the Marketplace is numbered sequentially, starting at 1.
         */
        editionNumber: number;
        /**
         * Certifiable integer instance number for identical entities in a Marketplace 
         *     item. A Marketplace item may have identical parts. If so, then each is numbered sequentially with an instance number.
         */
        entityInstanceNumber: number;
        /**
         * Certifiable UUID for the Marketplace item, as used in the URL of the item's download
         *     and its Marketplace Web page.
         */
        marketplaceID: string;
        /**
         * Hash of the entity's static certificate JSON, signed by the artist's private key.
         */
        certificateID: string;
        /**
         * The version of the method used to generate the certificateID.
         */
        staticCertificateVersion: number;
    }

    interface EntityProperties-Box {
    }

    interface EntityProperties-Light {
        /**
         * The dimensions of the entity. Entity surface outside these dimensions are not lit 
         *     by the light.
         */
        dimensions: Vec3;
        /**
         * The color of the light emitted.
         */
        color: Color;
        /**
         * The brightness of the light.
         */
        intensity: number;
        /**
         * The distance from the light's center at which intensity is reduced by 25%.
         */
        falloffRadius: number;
        /**
         * If true then the light is directional, emitting along the entity's
         *     local negative z-axis; otherwise the light is a point light which emanates in all directions.
         */
        isSpotlight: boolean;
        /**
         * Affects the softness of the spotlight beam: the higher the value the softer the beam.
         */
        exponent: number;
        /**
         * Affects the size of the spotlight beam: the higher the value the larger the beam.
         */
        cutoff: number;
    }

    interface EntityProperties-Line {
        /**
         * The dimensions of the entity. Must be sufficient to contain all the 
         *     linePoints.
         */
        dimensions: Vec3;
        /**
         * The sequence of points to draw lines between. The values are relative to the entity's
         *     position. A maximum of 70 points can be specified. The property's value is set only if all the linePoints     lie within the entity's dimensions.
         */
        linePoints: Array.<Vec3>;
        /**
         * Currently not used.
         */
        lineWidth: number;
        /**
         * The color of the line.
         */
        color: Color;
    }

    interface EntityProperties-Material {
        /**
         * URL to a  MaterialResource. If you append ?name to the URL, the 
         *     material with that name in the  MaterialResource will be applied to the entity.     Alternatively, set the property value to "materialData" to use the materialData property      for the  MaterialResource values.
         */
        materialURL: string;
        /**
         * The priority for applying the material to its parent. Only the highest priority material is 
         *     applied, with materials of the same priority randomly assigned. Materials that come with the model have a priority of     0.
         */
        priority: number;
        /**
         * Selects the submesh or submeshes within the parent to apply the material 
         *     to. If in the format "mat::string", all submeshes with material name "string" are replaced.     Otherwise the property value is parsed as an unsigned integer, specifying the mesh index to modify. Invalid values are     parsed to 0.
         */
        parentMaterialName: string;
        /**
         * How the material is mapped to the entity. Either "uv" or 
         *     "projected". Currently, only "uv" is supported.
         */
        materialMappingMode: string;
        /**
         * Offset position in UV-space of the top left of the material, range 
         *     { x: 0, y: 0 } &ndash; { x: 1, y: 1 }.
         */
        materialMappingPos: Vec2;
        /**
         * How much to scale the material within the parent's UV-space.
         */
        materialMappingScale: Vec2;
        /**
         * How much to rotate the material within the parent's UV-space, in degrees.
         */
        materialMappingRot: number;
        /**
         * Used to store  MaterialResource data as a JSON string. You can use 
         *     JSON.parse() to parse the string into a JavaScript object which you can manipulate the properties of, and     use JSON.stringify() to convert the object into a string to put in the property.
         */
        materialData: string;
    }

    interface EntityProperties-Model {
        /**
         * The dimensions of the entity. When adding an entity, if no dimensions 
         *     value is specified then the model is automatically sized to its      Entities.EntityProperties.
         */
        dimensions: Vec3;
        /**
         * Currently not used.
         */
        color: Color;
        /**
         * The URL of the FBX of OBJ model. Baked FBX models' URLs end in ".baked.fbx".
         *     Note: If the name ends with "default-image-model.fbx" then the entity is considered to be an "Image"     entity, in which case the textures property should be set per the example.
         */
        modelURL: string;
        /**
         * A JSON string of texture name, URL pairs used when rendering the model in place of the
         *     model's original textures. Use a texture name from the originalTextures property to override that texture.     Only the texture names and URLs to be overridden need be specified; original textures are used where there are no     overrides. You can use JSON.stringify() to convert a JavaScript object of name, URL pairs into a JSON     string.
         */
        textures: string;
        /**
         * A JSON string of texture name, URL pairs used in the model. The property value is 
         *     filled in after the entity has finished rezzing (i.e., textures have loaded). You can use JSON.parse() to     parse the JSON string into a JavaScript object of name, URL pairs. Read-only.
         */
        originalTextures: string;
        /**
         * The shape of the collision hull used if collisions are enabled.
         */
        shapeType: ShapeType;
        /**
         * The OBJ file to use for the compound shape if shapeType is
         *     "compound".
         */
        compoundShapeURL: string;
        /**
         * An animation to play on the model.
         */
        animation: Entities.AnimationProperties;
        /**
         * Joint rotations applied to the model; [] if none are applied or the 
         *     model hasn't loaded. The array indexes are per  Entities.getJointIndex. Rotations are relative to     each joint's parent.    Joint rotations can be set by  Entities.setLocalJointRotation and similar functions, or by    setting the value of this property. If you set a joint rotation using this property you also need to set the     corresponding jointRotationsSet value to true.
         */
        jointRotations: Array.<Quat>;
        /**
         * true values for joints that have had rotations applied, 
         *     false otherwise; [] if none are applied or the model hasn't loaded. The array indexes are per      Entities.getJointIndex.
         */
        jointRotationsSet: Array.<boolean>;
        /**
         * Joint translations applied to the model; [] if none are applied or 
         *     the model hasn't loaded. The array indexes are per  Entities.getJointIndex. Rotations are relative     to each joint's parent.    Joint translations can be set by  Entities.setLocalJointTranslation and similar     functions, or by setting the value of this property. If you set a joint translation using this property you also need to     set the corresponding jointTranslationsSet value to true.
         */
        jointTranslations: Array.<Vec3>;
        /**
         * true values for joints that have had translations applied, 
         *     false otherwise; [] if none are applied or the model hasn't loaded. The array indexes are per      Entities.getJointIndex.
         */
        jointTranslationsSet: Array.<boolean>;
        /**
         * If true and the entity is parented to an avatar, then the 
         *     avatar's joint rotations are applied to the entity's joints.
         */
        relayParentJoints: boolean;
    }

    interface EntityProperties-ParticleEffect {
        /**
         * If true then particles are emitted.
         */
        isEmitting: boolean;
        /**
         * The maximum number of particles to render at one time. Older particles are deleted if 
         *     necessary when new ones are created.
         */
        maxParticles: number;
        /**
         * How long, in seconds, each particle lives.
         */
        lifespan: number;
        /**
         * The number of particles per second to emit.
         */
        emitRate: number;
        /**
         * The speed, in m/s, that each particle is emitted at.
         */
        emitSpeed: number;
        /**
         * The spread in speeds at which particles are emitted at. If emitSpeed == 5 
         *     and speedSpread == 1, particles will be emitted with speeds in the range 4m/s &ndash; 6m/s.
         */
        speedSpread: number;
        /**
         * The acceleration that is applied to each particle during its lifetime. The 
         *     default is Earth's gravity value.
         */
        emitAcceleration: vec3;
        /**
         * The spread in accelerations that each particle is given. If
         *     emitAccelerations == {x: 0, y: -9.8, z: 0} and accelerationSpread ==    {x: 0, y: 1, z: 0}, each particle will have an acceleration in the range {x: 0, y: -10.8, z: 0}    &ndash; {x: 0, y: -8.8, z: 0}.
         */
        accelerationSpread: vec3;
        /**
         * The dimensions of the particle effect, i.e., a bounding box containing all the particles
         *     during their lifetimes, assuming that emitterShouldTrail is false. Read-only.
         */
        dimensions: Vec3;
        /**
         * If true then particles are "left behind" as the emitter moves,
         *     otherwise they stay with the entity's dimensions.
         */
        emitterShouldTrail: boolean;
        /**
         * The orientation of particle emission relative to the entity's axes. By
         *     default, particles emit along the entity's local z-axis, and azimuthStart and azimuthFinish     are relative to the entity's local x-axis. The default value is a rotation of -90 degrees about the local x-axis, i.e.,     the particles emit vertically.
         */
        emitOrientation: Quat;
        /**
         * The dimensions of the ellipsoid from which particles are emitted.
         */
        emitDimensions: vec3;
        /**
         * The starting radius within the ellipsoid at which particles start being emitted;
         *     range 0.0 &ndash; 1.0 for the ellipsoid center to the ellipsoid surface, respectively.    Particles are emitted from the portion of the ellipsoid that lies between emitRadiusStart and the     ellipsoid's surface.
         */
        emitRadiusStart: number;
        /**
         * The angle in radians from the entity's local z-axis at which particles start being emitted 
         *     within the ellipsoid; range 0 &ndash; Math.PI. Particles are emitted from the portion of the     ellipsoid that lies between polarStart and polarFinish.
         */
        polarStart: number;
        /**
         * The angle in radians from the entity's local z-axis at which particles stop being emitted 
         *     within the ellipsoid; range 0 &ndash; Math.PI. Particles are emitted from the portion of the     ellipsoid that lies between polarStart and polarFinish.
         */
        polarFinish: number;
        /**
         * The angle in radians from the entity's local x-axis about the entity's local 
         *     z-axis at which particles start being emitted; range -Math.PI &ndash; Math.PI. Particles are     emitted from the portion of the ellipsoid that lies between azimuthStart and azimuthFinish.
         */
        azimuthStart: number;
        /**
         * The angle in radians from the entity's local x-axis about the entity's local
         *     z-axis at which particles stop being emitted; range -Math.PI &ndash; Math.PI. Particles are    emitted from the portion of the ellipsoid that lies between azimuthStart and azimuthFinish.
         */
        azimuthFinish: number;
        /**
         * The URL of a JPG or PNG image file to display for each particle. If you want transparency,
         *     use PNG format.
         */
        textures: string;
        /**
         * The radius of each particle at the middle of its life.
         */
        particleRadius: number;
        /**
         * The radius of each particle at the start of its life. If NaN, the
         *     particleRadius value is used.
         */
        radiusStart: number;
        /**
         * The radius of each particle at the end of its life. If NaN, the
         *     particleRadius value is used.
         */
        radiusFinish: number;
        /**
         * The spread in radius that each particle is given. If particleRadius == 0.5
         *     and radiusSpread == 0.25, each particle will have a radius in the range 0.25 &ndash;     0.75.
         */
        radiusSpread: number;
        /**
         * The color of each particle at the middle of its life.
         */
        color: Color;
        /**
         * The color of each particle at the start of its life. If any of the component values are 
         *     undefined, the color value is used.
         */
        colorStart: Color;
        /**
         * The color of each particle at the end of its life. If any of the component values are 
         *     undefined, the color value is used.
         */
        colorFinish: Color;
        /**
         * The spread in color that each particle is given. If
         *     color == {red: 100, green: 100, blue: 100} and colorSpread ==    {red: 10, green: 25, blue: 50}, each particle will have a color in the range     {red: 90, green: 75, blue: 50} &ndash; {red: 110, green: 125, blue: 150}.
         */
        colorSpread: Color;
        /**
         * The alpha of each particle at the middle of its life.
         */
        alpha: number;
        /**
         * The alpha of each particle at the start of its life. If NaN, the
         *     alpha value is used.
         */
        alphaStart: number;
        /**
         * The alpha of each particle at the end of its life. If NaN, the
         *     alpha value is used.
         */
        alphaFinish: number;
        /**
         * The spread in alpha that each particle is given. If alpha == 0.5
         *     and alphaSpread == 0.25, each particle will have an alpha in the range 0.25 &ndash;     0.75.
         */
        alphaSpread: number;
        /**
         * The spin of each particle at the middle of its life. In the range -2*PI &ndash; 2*PI.
         */
        particleSpin: number;
        /**
         * The spin of each particle at the start of its life. In the range -2*PI &ndash; 2*PI.
         *     If NaN, the particleSpin value is used.
         */
        spinStart: number;
        /**
         * The spin of each particle at the end of its life. In the range -2*PI &ndash; 2*PI.
         *     If NaN, the particleSpin value is used.
         */
        spinFinish: number;
        /**
         * The spread in spin that each particle is given. In the range 0 &ndash; 2*PI.  If particleSpin == PI
         *     and spinSpread == PI/2, each particle will have a spin in the range PI/2 &ndash; 3*PI/2.
         */
        spinSpread: number;
        /**
         * Whether or not the particles' spin will rotate with the entity.  If false, when particleSpin == 0, the particles will point
         * up in the world.  If true, they will point towards the entity's up vector, based on its orientation.
         */
        rotateWithEntity: boolean;
        /**
         * Currently not used. Read-only.
         */
        shapeType: ShapeType;
    }

    interface EntityProperties-PolyLine {
        /**
         * The dimensions of the entity, i.e., the size of the bounding box that contains the 
         *     lines drawn.
         */
        dimensions: Vec3;
        /**
         * The sequence of points to draw lines between. The values are relative to the entity's
         *     position. A maximum of 70 points can be specified. Must be specified in order for the entity to render.
         */
        linePoints: Array.<Vec3>;
        /**
         * The normal vectors for the line's surface at the linePoints. The values are 
         *     relative to the entity's orientation. Must be specified in order for the entity to render.
         */
        normals: Array.<Vec3>;
        /**
         * The widths, in m, of the line at the linePoints. Must be specified in 
         *     order for the entity to render.
         */
        strokeWidths: Array.<number>;
        /**
         * Currently not used.
         */
        lineWidth: number;
        /**
         * Currently not used.
         */
        strokeColors: Array.<Vec3>;
        /**
         * The base color of the line, which is multiplied with the color of the texture for
         *     rendering.
         */
        color: Color;
        /**
         * The URL of a JPG or PNG texture to use for the lines. If you want transparency, use PNG
         *     format.
         */
        textures: string;
        /**
         * If true, the texture is stretched to fill the whole line, otherwise 
         *     the texture repeats along the line.
         */
        isUVModeStretch: boolean;
    }

    interface EntityProperties-PolyVox {
        /**
         * The dimensions of the entity.
         */
        dimensions: Vec3;
        /**
         * Integer number of voxels along each axis of the entity, in the range 
         *     1,1,1 to 128,128,128. The dimensions of each voxel is     dimensions / voxelVolumesize.
         */
        voxelVolumeSize: Vec3;
        /**
         * Base-64 encoded compressed dump of 
         *     the PolyVox data. This property is typically not used in scripts directly; rather, functions that manipulate a PolyVox     entity update it.    The size of this property increases with the size and complexity of the PolyVox entity, with the size depending on how     the particular entity's voxels compress. Because this property value has to fit within a High Fidelity datagram packet     there is a limit to the size and complexity of a PolyVox entity, and edits which would result in an overflow are     rejected.
         */
        voxelData: string;
        /**
         * The style of rendering the voxels' surface and how 
         *     neighboring PolyVox entities are joined.
         */
        voxelSurfaceStyle: Entities.PolyVoxSurfaceStyle;
        /**
         * URL of the texture to map to surfaces perpendicular to the entity's local x-axis. JPG or
         *     PNG format. If no texture is specified the surfaces display white.
         */
        xTextureURL: string;
        /**
         * URL of the texture to map to surfaces perpendicular to the entity's local y-axis. JPG or 
         *     PNG format. If no texture is specified the surfaces display white.
         */
        yTextureURL: string;
        /**
         * URL of the texture to map to surfaces perpendicular to the entity's local z-axis. JPG or 
         *     PNG format. If no texture is specified the surfaces display white.
         */
        zTextureURL: string;
        /**
         * ID of the neighboring PolyVox entity in the entity's -ve local x-axis direction, 
         *     if you want them joined. Set to  Uuid if there is none or you don't want to join them.
         */
        xNNeighborID: Uuid;
        /**
         * ID of the neighboring PolyVox entity in the entity's -ve local y-axis direction, 
         *     if you want them joined. Set to  Uuid if there is none or you don't want to join them.
         */
        yNNeighborID: Uuid;
        /**
         * ID of the neighboring PolyVox entity in the entity's -ve local z-axis direction, 
         *     if you want them joined. Set to  Uuid if there is none or you don't want to join them.
         */
        zNNeighborID: Uuid;
        /**
         * ID of the neighboring PolyVox entity in the entity's +ve local x-axis direction, 
         *     if you want them joined. Set to  Uuid if there is none or you don't want to join them.
         */
        xPNeighborID: Uuid;
        /**
         * ID of the neighboring PolyVox entity in the entity's +ve local y-axis direction, 
         *     if you want them joined. Set to  Uuid if there is none or you don't want to join them.
         */
        yPNeighborID: Uuid;
        /**
         * ID of the neighboring PolyVox entity in the entity's +ve local z-axis direction, 
         *     if you want them joined. Set to  Uuid if there is none or you don't want to join them.
         */
        zPNeighborID: Uuid;
    }

    interface EntityProperties-Shape {
        /**
         * The shape of the entity.
         */
        shape: Entities.Shape;
        /**
         * The dimensions of the entity.
         */
        dimensions: Vec3;
        /**
         * The color of the entity.
         */
        color: Color;
    }

    interface EntityProperties-Sphere {
    }

    interface EntityProperties-Text {
        /**
         * The dimensions of the entity.
         */
        dimensions: Vec3;
        /**
         * The text to display on the face of the entity. Text wraps if necessary to fit. New lines can be
         *     created using \n. Overflowing lines are not displayed.
         */
        text: string;
        /**
         * The height of each line of text (thus determining the font size).
         */
        lineHeight: number;
        /**
         * The color of the text.
         */
        textColor: Color;
        /**
         * The color of the background rectangle.
         */
        backgroundColor: Color;
        /**
         * If true, the entity is oriented to face each user's camera (i.e., it
         *     differs for each user present).
         */
        faceCamera: boolean;
    }

    interface EntityProperties-Web {
        /**
         * The dimensions of the entity.
         */
        dimensions: Vec3;
        /**
         * The URL of the Web page to display. This value does not change as you or others navigate 
         *     on the Web entity.
         */
        sourceUrl: string;
        /**
         * The resolution to display the page at, in dots per inch. If you convert this to dots per meter 
         *     (multiply by 1 / 0.0254 = 39.3701) then multiply dimensions.x and dimensions.y by that value     you get the resolution in pixels.
         */
        dpi: number;
    }

    interface EntityProperties-Zone {
        /**
         * The size of the volume in which the zone's lighting effects and avatar permissions 
         *     have effect.
         */
        dimensions: Vec3;
        /**
         * The shape of the volume in which the zone's lighting effects and avatar 
         *     permissions have effect. Reverts to the default value if set to "none", or set to "compound"     and compoundShapeURL is "".
         */
        shapeType: ShapeType;
        /**
         * The OBJ file to use for the compound shape if shapeType is 
         *     "compound".
         */
        compoundShapeURL: string;
        /**
         * Configures the key light in the zone. Possible values:
         *     "inherit": The key light from any enclosing zone continues into this zone.    "disabled": The key light from any enclosing zone and the key light of this zone are disabled in this         zone.    "enabled": The key light properties of this zone are enabled, overriding the key light of from any         enclosing zone.
         */
        keyLightMode: string;
        /**
         * The key light properties of the zone.
         */
        keyLight: Entities.KeyLight;
        /**
         * Configures the ambient light in the zone. Possible values:
         *     "inherit": The ambient light from any enclosing zone continues into this zone.    "disabled": The ambient light from any enclosing zone and the ambient light of this zone are disabled in         this zone.    "enabled": The ambient light properties of this zone are enabled, overriding the ambient light from any         enclosing zone.
         */
        ambientLightMode: string;
        /**
         * The ambient light properties of the zone.
         */
        ambientLight: Entities.AmbientLight;
        /**
         * Configures the skybox displayed in the zone. Possible values:
         *     "inherit": The skybox from any enclosing zone is dislayed in this zone.    "disabled": The skybox from any enclosing zone and the skybox of this zone are disabled in this zone.    "enabled": The skybox properties of this zone are enabled, overriding the skybox from any enclosing zone.
         */
        skyboxMode: string;
        /**
         * The skybox properties of the zone.
         */
        skybox: Entities.Skybox;
        /**
         * Configures the haze in the zone. Possible values:
         *     "inherit": The haze from any enclosing zone continues into this zone.    "disabled": The haze from any enclosing zone and the haze of this zone are disabled in this zone.    "enabled": The haze properties of this zone are enabled, overriding the haze from any enclosing zone.
         */
        hazeMode: string;
        /**
         * The haze properties of the zone.
         */
        haze: Entities.Haze;
        /**
         * Configures the bloom in the zone. Possible values:
         *     "inherit": The bloom from any enclosing zone continues into this zone.    "disabled": The bloom from any enclosing zone and the bloom of this zone are disabled in this zone.    "enabled": The bloom properties of this zone are enabled, overriding the bloom from any enclosing zone.
         */
        bloomMode: string;
        /**
         * The bloom properties of the zone.
         */
        bloom: Entities.Bloom;
        /**
         * If true then visitors can fly in the zone; otherwise they cannot.
         */
        flyingAllowed: boolean;
        /**
         * If true then visitors with avatar collisions turned off will not 
         *     collide with content in the zone; otherwise visitors will always collide with content in the zone.
         */
        ghostingAllowed: boolean;
        /**
         * The URL of a JavaScript file that filters changes to properties of entities within the 
         *     zone. It is periodically executed for each entity in the zone. It can, for example, be used to not allow changes to     certain properties.function filter(properties) {    // Test and edit properties object values,    // e.g., properties.modelURL, as required.    return properties;}
         */
        filterURL: string;
    }

    interface BoundingBox {
        /**
         * The bottom right near (minimum axes values) corner of the AA box.
         */
        brn: Vec3;
        /**
         * The top far left (maximum axes values) corner of the AA box.
         */
        tfl: Vec3;
        /**
         * The center of the AA box.
         */
        center: Vec3;
        /**
         * The dimensions of the AA box.
         */
        dimensions: Vec3;
    }

    interface RenderInfo {
        /**
         * The number of vertices in the entity.
         */
        verticesCount: number;
        /**
         * The number of textures in the entity.
         */
        texturesCount: number;
        /**
         * The total size of the textures in the entity, in bytes.
         */
        textureSize: number;
        /**
         * Is true if any of the textures has transparency.
         */
        hasTransparent: boolean;
        /**
         * The number of draw calls required to render the entity.
         */
        drawCalls: number;
    }

    interface RayToEntityIntersectionResult {
        /**
         * true if the  PickRay intersected an entity, otherwise 
         *     false.
         */
        intersects: boolean;
        /**
         * Is always true.
         */
        accurate: boolean;
        /**
         * The ID if the entity intersected, if any, otherwise null.
         */
        entityID: Uuid;
        /**
         * The distance from the  PickRay origin to the intersection point.
         */
        distance: number;
        /**
         * The intersection point.
         */
        intersection: Vec3;
        /**
         * The surface normal of the entity at the intersection point.
         */
        surfaceNormal: Vec3;
        /**
         * The face of the entity's axis-aligned box that the ray intersects.
         */
        face: BoxFace;
        /**
         * Extra information depending on the entity intersected. Currently, only Model 
         *     entities provide extra information, and the information provided depends on the precisionPicking parameter     value that the search function was called with.
         */
        extraInfo: object;
    }

    /**
     * Get the properties of multiple entities.
     * @param entityIDs {Array.<Uuid>}  The IDs of the entities to get the properties of.
     * @param desiredProperties {Array.<string>} [desiredProperties=[]] Either string with property name or array of the names of the properties
     *     to get. If the array is empty, all properties are returned.
     * @returns {Array.<Entities.EntityProperties>} 
     */
    function getMultipleEntityProperties(entityIDs: Array.<Uuid>, desiredProperties: Array.<string>): Array.<Entities.EntityProperties>;
    /**
     * Check whether or not you can change the locked property of entities. Locked entities have their 
     * locked property set to true and cannot be edited or deleted. Whether or not you can change entities' locked properties is configured in the domain server's permissions.
     * @returns {boolean} 
     */
    function canAdjustLocks(): boolean;
    /**
     * Check whether or not you can rez (create) new entities in the domain.
     * @returns {boolean} 
     */
    function canRez(): boolean;
    /**
     * Check whether or not you can rez (create) new temporary entities in the domain. Temporary entities are entities with a
     * finite lifetime property value set.
     * @returns {boolean} 
     */
    function canRezTmp(): boolean;
    /**
     * Check whether or not you can rez (create) new certified entities in the domain. Certified entities are entities that have
     * PoP certificates.
     * @returns {boolean} 
     */
    function canRezCertified(): boolean;
    /**
     * Check whether or not you can rez (create) new temporary certified entities in the domain. Temporary entities are entities
     * with a finite  lifetime property value set. Certified entities are entities that have PoP certificates.
     * @returns {boolean} 
     */
    function canRezTmpCertified(): boolean;
    /**
     * Check whether or not you can make changes to the asset server's assets.
     * @returns {boolean} 
     */
    function canWriteAssets(): boolean;
    /**
     * Check whether or not you can replace the domain's content set.
     * @returns {boolean} 
     */
    function canReplaceContent(): boolean;
    /**
     * Add a new entity with specified properties.
     * @param properties {Entities.EntityProperties}  The properties of the entity to create.
     * @param clientOnly {boolean} [clientOnly=false] If <code>true</code>, or if <code>clientOnly</code> is set <code>true</code> in 
     *     the properties, the entity is created as an avatar entity; otherwise it is created on the server. An avatar entity     follows you to each domain you visit, rendering at the same world coordinates unless it's parented to your avatar.
     * @returns {Uuid} 
     */
    function addEntity(properties: Entities.EntityProperties, clientOnly: boolean): Uuid;
    /**
     * Create a clone of an entity. A clone can be created by a client that doesn't have rez permissions in the current domain.
     * The entity must have its cloneable property set to true. The clone has a modified name, other properties set per its clone related-properties, and its clone-related properties are set to defaults.
     * @param entityID {Uuid}  The ID of the entity to clone.
     * @returns {Uuid} 
     */
    function cloneEntity(entityID: Uuid): Uuid;
    /**
     * Get the properties of an entity.
     * @param entityID {Uuid}  The ID of the entity to get the properties of.
     * @param desiredProperties {Array.<string>} [desiredProperties=[]] Array of the names of the properties to get. If the array is empty,
     *     all properties are returned.
     * @returns {Entities.EntityProperties} 
     */
    function getEntityProperties(entityID: Uuid, desiredProperties: Array.<string>): Entities.EntityProperties;
    /**
     * Update an entity with specified properties.
     * @param entityID {Uuid}  The ID of the entity to edit.
     * @param properties {Entities.EntityProperties}  The properties to update the entity with.
     * @returns {Uuid} 
     */
    function editEntity(entityID: Uuid, properties: Entities.EntityProperties): Uuid;
    /**
     * Delete an entity.
     * @param entityID {Uuid}  The ID of the entity to delete.
     */
    function deleteEntity(entityID: Uuid): void;
    /**
     * Call a method in a client entity script from a client script or client entity script, or call a method in a server 
     * entity script from a server entity script. The entity script method must be exposed as a property in the target client entity script. Additionally, if calling a server entity script, the server entity script must include the method's name in an exposed property called remotelyCallable that is an array of method names that can be called.
     * @param entityID {Uuid}  The ID of the entity to call the method in.
     * @param method {string}  The name of the method to call.
     * @param parameters {Array.<string>} [parameters=[]] The parameters to call the specified method with.
     */
    function callEntityMethod(entityID: Uuid, method: string, parameters: Array.<string>): void;
    /**
     * Call a method in a server entity script from a client script or client entity script. The entity script method must be 
     * exposed as a property in the target server entity script. Additionally, the target server entity script must include the method's name in an exposed property called remotelyCallable that is an array of method names that can be called.
     * @param entityID {Uuid}  The ID of the entity to call the method in.
     * @param method {string}  The name of the method to call.
     * @param parameters {Array.<string>} [parameters=[]] The parameters to call the specified method with.
     */
    function callEntityServerMethod(entityID: Uuid, method: string, parameters: Array.<string>): void;
    /**
     * Call a method in a specific user's client entity script from a server entity script. The entity script method must be 
     * exposed as a property in the target client entity script.
     * @param clientSessionID {Uuid}  The session ID of the user to call the method in.
     * @param entityID {Uuid}  The ID of the entity to call the method in.
     * @param method {string}  The name of the method to call.
     * @param parameters {Array.<string>} [parameters=[]] The parameters to call the specified method with.
     */
    function callEntityClientMethod(clientSessionID: Uuid, entityID: Uuid, method: string, parameters: Array.<string>): void;
    /**
     * Find the entity with a position closest to a specified point and within a specified radius.
     * @param center {Vec3}  The point about which to search.
     * @param radius {number}  The radius within which to search.
     * @returns {Uuid} 
     */
    function findClosestEntity(center: Vec3, radius: number): Uuid;
    /**
     * Find all entities that intersect a sphere defined by a center point and radius.
     * @param center {Vec3}  The point about which to search.
     * @param radius {number}  The radius within which to search.
     * @returns {Array.<Uuid>} 
     */
    function findEntities(center: Vec3, radius: number): Array.<Uuid>;
    /**
     * Find all entities whose axis-aligned boxes intersect a search axis-aligned box defined by its minimum coordinates corner
     * and dimensions.
     * @param corner {Vec3}  The corner of the search AA box with minimum co-ordinate values.
     * @param dimensions {Vec3}  The dimensions of the search AA box.
     * @returns {Array.<Uuid>} 
     */
    function findEntitiesInBox(corner: Vec3, dimensions: Vec3): Array.<Uuid>;
    /**
     * Find all entities whose axis-aligned boxes intersect a search frustum.
     * @param frustum {ViewFrustum}  The frustum to search in. The <code>position</code>, <code>orientation</code>, 
     *     <code>projection</code>, and <code>centerRadius</code> properties must be specified.
     * @returns {Array.<Uuid>} 
     */
    function findEntitiesInFrustum(frustum: ViewFrustum): Array.<Uuid>;
    /**
     * Find all entities of a particular type that intersect a sphere defined by a center point and radius.
     * @param entityType {Entities.EntityType}  The type of entity to search for.
     * @param center {Vec3}  The point about which to search.
     * @param radius {number}  The radius within which to search.
     * @returns {Array.<Uuid>} 
     */
    function findEntitiesByType(entityType: Entities.EntityType, center: Vec3, radius: number): Array.<Uuid>;
    /**
     * Find all entities of a particular name that intersect a sphere defined by a center point and radius.
     * @param entityName {string}  The name of the entity to search for.
     * @param center {Vec3}  The point about which to search.
     * @param radius {number}  The radius within which to search.
     * @param caseSensitive {boolean} [caseSensitive=false] If <code>true</code> then the search is case-sensitive.
     * @returns {Array.<Uuid>} 
     */
    function findEntitiesByName(entityName: string, center: Vec3, radius: number, caseSensitive: boolean): Array.<Uuid>;
    /**
     * Find the first entity intersected by a  PickRay. Light and Zone entities are not 
     * intersected unless they've been configured as pickable using  Entities.setLightsArePickableand  Entities.setZonesArePickable, respectively.
     * @param pickRay {PickRay}  The PickRay to use for finding entities.
     * @param precisionPicking {boolean} [precisionPicking=false] If <code>true</code> and the intersected entity is a <code>Model</code> 
     *     entity, the result's <code>extraInfo</code> property includes more information than it otherwise would.
     * @param entitiesToInclude {Array.<Uuid>} [entitiesToInclude=[]] If not empty then the search is restricted to these entities.
     * @param entitiesToDiscard {Array.<Uuid>} [entitiesToDiscard=[]] Entities to ignore during the search.
     * @param visibleOnly {boolean} [visibleOnly=false] If <code>true</code> then only entities that are 
     *     <code>{@link Entities.EntityProperties|visible}<code> are searched.
     * @param collideableOnly {boolean} [collideableOnly=false] If <code>true</code> then only entities that are not 
     *     <code>{@link Entities.EntityProperties|collisionless}</code> are searched.
     * @returns {Entities.RayToEntityIntersectionResult} 
     */
    function findRayIntersection(pickRay: PickRay, precisionPicking: boolean, entitiesToInclude: Array.<Uuid>, entitiesToDiscard: Array.<Uuid>, visibleOnly: boolean, collideableOnly: boolean): Entities.RayToEntityIntersectionResult;
    /**
     * Find the first entity intersected by a  PickRay. Light and Zone entities are not 
     * intersected unless they've been configured as pickable using  Entities.setLightsArePickable and  Entities.setZonesArePickable, respectively.This is a synonym for  Entities.findRayIntersection.
     * @param pickRay {PickRay}  The PickRay to use for finding entities.
     * @param precisionPicking {boolean} [precisionPicking=false] If <code>true</code> and the intersected entity is a <code>Model</code>
     *     entity, the result's <code>extraInfo</code> property includes more information than it otherwise would.
     * @param entitiesToInclude {Array.<Uuid>} [entitiesToInclude=[]] If not empty then the search is restricted to these entities.
     * @param entitiesToDiscard {Array.<Uuid>} [entitiesToDiscard=[]] Entities to ignore during the search.
     */
    function findRayIntersectionBlocking(pickRay: PickRay, precisionPicking: boolean, entitiesToInclude: Array.<Uuid>, entitiesToDiscard: Array.<Uuid>): void;
    /**
     * Reloads an entity's server entity script such that the latest version re-downloaded.
     * @param entityID {Uuid}  The ID of the entity to reload the server entity script of.
     * @returns {boolean} 
     */
    function reloadServerScripts(entityID: Uuid): boolean;
    /**
     * Gets the status of server entity script attached to an entity
     * @param entityID {Uuid}  The ID of the entity to get the server entity script status for.
     * @param callback {Entities~getServerScriptStatusCallback}  The function to call upon completion.
     * @returns {boolean} 
     */
    function getServerScriptStatus(entityID: Uuid, callback: Entities~getServerScriptStatusCallback): boolean;
    /**
     * Get metadata for certain entity properties such as script and serverScripts.
     * @param entityID {Uuid}  The ID of the entity to get the metadata for.
     * @param property {string}  The property name to get the metadata for.
     * @param callback {Entities~queryPropertyMetadataCallback}  The function to call upon completion.
     * @returns {boolean} 
     */
    function queryPropertyMetadata(entityID: Uuid, property: string, callback: Entities~queryPropertyMetadataCallback): boolean;
    /**
     * Get metadata for certain entity properties such as script and serverScripts.
     * @param entityID {Uuid}  The ID of the entity to get the metadata for.
     * @param property {string}  The property name to get the metadata for.
     * @param scope {object}  The "<code>this</code>" context that the callback will be executed within.
     * @param callback {Entities~queryPropertyMetadataCallback}  The function to call upon completion.
     * @returns {boolean} 
     */
    function queryPropertyMetadata(entityID: Uuid, property: string, scope: object, callback: Entities~queryPropertyMetadataCallback): boolean;
    /**
     * Set whether or not ray picks intersect the bounding box of  Entities.EntityType entities. By default, Light 
     * entities are not intersected. The setting lasts for the Interface session. Ray picks are done using      Entities.findRayIntersection or      Entities.findRayIntersectionBlocking, or the  Picks and  RayPick     APIs.
     * @param value {boolean}  Set <code>true</code> to make ray picks intersect the bounding box of 
     *     {@link Entities.EntityType|Light} entities, otherwise <code>false</code>.
     */
    function setLightsArePickable(value: boolean): void;
    /**
     * Get whether or not ray picks intersect the bounding box of  Entities.EntityType entities. Ray picks are 
     *     done using  Entities.findRayIntersection or      Entities.findRayIntersectionBlocking, or the  Picks and  RayPick     APIs.
     * @returns {boolean} 
     */
    function getLightsArePickable(): boolean;
    /**
     * Set whether or not ray picks intersect the bounding box of  Entities.EntityType entities. By default, Light 
     * entities are not intersected. The setting lasts for the Interface session. Ray picks are done using      Entities.findRayIntersection or      Entities.findRayIntersectionBlocking, or the  Picks and  RayPick     APIs.
     * @param value {boolean}  Set <code>true</code> to make ray picks intersect the bounding box of 
     *     {@link Entities.EntityType|Zone} entities, otherwise <code>false</code>.
     */
    function setZonesArePickable(value: boolean): void;
    /**
     * Get whether or not ray picks intersect the bounding box of  Entities.EntityType entities. Ray picks are 
     *     done using  Entities.findRayIntersection or      Entities.findRayIntersectionBlocking, or the  Picks and  RayPick     APIs.
     * @returns {boolean} 
     */
    function getZonesArePickable(): boolean;
    /**
     * Set whether or not  Entities.EntityType entities' boundaries should be drawn. Currently not used.
     * @param value {boolean}  Set to <code>true</code> if {@link Entities.EntityType|Zone} entities' boundaries should be 
     *     drawn, otherwise <code>false</code>.
     */
    function setDrawZoneBoundaries(value: boolean): void;
    /**
     * Get whether or not  Entities.EntityType entities' boundaries should be drawn. Currently not used.
     * @returns {boolean} 
     */
    function getDrawZoneBoundaries(): boolean;
    /**
     * Set the values of all voxels in a spherical portion of a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|PolyVox} entity.
     * @param center {Vec3}  The center of the sphere of voxels to set, in world coordinates.
     * @param radius {number}  The radius of the sphere of voxels to set, in world coordinates.
     * @param value {number}  If <code>value % 256 == 0</code> then each voxel is cleared, otherwise each voxel is set.
     */
    function setVoxelSphere(entityID: Uuid, center: Vec3, radius: number, value: number): void;
    /**
     * Set the values of all voxels in a capsule-shaped portion of a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|PolyVox} entity.
     * @param start {Vec3}  The center of the sphere of voxels to set, in world coordinates.
     * @param end {Vec3}  The center of the sphere of voxels to set, in world coordinates.
     * @param radius {number}  The radius of the capsule cylinder and spherical ends, in world coordinates.
     * @param value {number}  If <code>value % 256 == 0</code> then each voxel is cleared, otherwise each voxel is set.
     */
    function setVoxelCapsule(entityID: Uuid, start: Vec3, end: Vec3, radius: number, value: number): void;
    /**
     * Set the value of a particular voxels in a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|PolyVox} entity.
     * @param position {Vec3}  The position relative to the minimum axes values corner of the entity. The 
     *     <code>position</code> coordinates are rounded to the nearest integer to get the voxel coordinate. The minimum axes     corner voxel is <code>{ x: 0, y: 0, z: 0 }</code>.
     * @param value {number}  If <code>value % 256 == 0</code> then voxel is cleared, otherwise the voxel is set.
     */
    function setVoxel(entityID: Uuid, position: Vec3, value: number): void;
    /**
     * Set the values of all voxels in a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|PolyVox} entity.
     * @param value {number}  If <code>value % 256 == 0</code> then each voxel is cleared, otherwise each voxel is set.
     */
    function setAllVoxels(entityID: Uuid, value: number): void;
    /**
     * Set the values of all voxels in a cubic portion of a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|PolyVox} entity.
     * @param lowPosition {Vec3}  The position of the minimum axes value corner of the cube of voxels to set, in voxel 
     *     coordinates.
     * @param cuboidSize {Vec3}  The size of the cube of voxels to set, in voxel coordinates.
     * @param value {number}  If <code>value % 256 == 0</code> then each voxel is cleared, otherwise each voxel is set.
     */
    function setVoxelsInCuboid(entityID: Uuid, lowPosition: Vec3, cuboidSize: Vec3, value: number): void;
    /**
     * Convert voxel coordinates in a  Entities.EntityType entity to world coordinates. Voxel coordinates are 
     * relative to the minimum axes values corner of the entity with a scale of Vec3.ONE being the dimensions of each voxel.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|PolyVox} entity.
     * @param voxelCoords {Vec3}  The voxel coordinates. May be fractional and outside the entity's bounding box.
     * @returns {Vec3} 
     */
    function voxelCoordsToWorldCoords(entityID: Uuid, voxelCoords: Vec3): Vec3;
    /**
     * Convert world coordinates to voxel coordinates in a  Entities.EntityType entity. Voxel coordinates are 
     * relative to the minimum axes values corner of the entity, with a scale of Vec3.ONE being the dimensions of each voxel.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|PolyVox} entity.
     * @param worldCoords {Vec3}  The world coordinates. May be outside the entity's bounding box.
     * @returns {Vec3} 
     */
    function worldCoordsToVoxelCoords(entityID: Uuid, worldCoords: Vec3): Vec3;
    /**
     * Convert voxel coordinates in a  Entities.EntityType entity to local coordinates relative to the minimum 
     * axes value corner of the entity, with the scale being the same as world coordinates.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|PolyVox} entity.
     * @param voxelCoords {Vec3}  The voxel coordinates. May be fractional and outside the entity's bounding box.
     * @returns {Vec3} 
     */
    function voxelCoordsToLocalCoords(entityID: Uuid, voxelCoords: Vec3): Vec3;
    /**
     * Convert local coordinates to voxel coordinates in a  Entities.EntityType entity. Local coordinates are 
     * relative to the minimum axes value corner of the entity, with the scale being the same as world coordinates.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|PolyVox} entity.
     * @param localCoords {Vec3}  The local coordinates. May be outside the entity's bounding box.
     * @returns {Vec3} 
     */
    function localCoordsToVoxelCoords(entityID: Uuid, localCoords: Vec3): Vec3;
    /**
     * Set the linePoints property of a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|Line} entity.
     * @param points {Array.<Vec3>}  The array of points to set the entity's <code>linePoints</code> property to.
     * @returns {boolean} 
     */
    function setAllPoints(entityID: Uuid, points: Array.<Vec3>): boolean;
    /**
     * Append a point to a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|Line} entity.
     * @param point {Vec3}  The point to add to the line. The coordinates are relative to the entity's position.
     * @returns {boolean} 
     */
    function appendPoint(entityID: Uuid, point: Vec3): boolean;
    /**
     * Dumps debug information about all entities in Interface's local in-memory tree of entities it knows about &mdash; domain
     * and client-only &mdash; to the program log.
     */
    function dumpTree(): void;
    /**
     * Add an action to an entity. An action is registered with the physics engine and is applied every physics simulation 
     * step. Any entity may have more than one action associated with it, but only as many as will fit in an entity's actionData property.
     * @param actionType {Entities.ActionType}  The type of action.
     * @param entityID {Uuid}  The ID of the entity to add the action to.
     * @param arguments {Entities.ActionArguments}  Configure the action.
     * @returns {Uuid} 
     */
    function addAction(actionType: Entities.ActionType, entityID: Uuid, arguments: Entities.ActionArguments): Uuid;
    /**
     * Update an entity action.
     * @param entityID {Uuid}  The ID of the entity with the action to update.
     * @param actionID {Uuid}  The ID of the action to update.
     * @param arguments {Entities.ActionArguments}  The arguments to update.
     * @returns {boolean} 
     */
    function updateAction(entityID: Uuid, actionID: Uuid, arguments: Entities.ActionArguments): boolean;
    /**
     * Delete an action from an entity.
     * @param entityID {Uuid}  The ID of entity to delete the action from.
     * @param actionID {Uuid}  The ID of the action to delete.
     * @returns {boolean} 
     */
    function deleteAction(entityID: Uuid, actionID: Uuid): boolean;
    /**
     * Get the IDs of the actions that  are associated with an entity.
     * @param entityID {Uuid}  The entity to get the action IDs for.
     * @returns {Array.<Uuid>} 
     */
    function getActionIDs(entityID: Uuid): Array.<Uuid>;
    /**
     * Get the arguments of an action.
     * @param entityID {Uuid}  The ID of the entity with the action.
     * @param actionID {Uuid}  The ID of the action to get the arguments of.
     * @returns {Entities.ActionArguments} 
     */
    function getActionArguments(entityID: Uuid, actionID: Uuid): Entities.ActionArguments;
    /**
     * Get the translation of a joint in a  Entities.EntityType entity relative to the entity's position and 
     * orientation.
     * @param entityID {Uuid}  The ID of the entity.
     * @param jointIndex {number}  The integer index of the joint.
     * @returns {Vec3} 
     */
    function getAbsoluteJointTranslationInObjectFrame(entityID: Uuid, jointIndex: number): Vec3;
    /**
     * Get the translation of a joint in a  Entities.EntityType entity relative to the entity's position and 
     * orientation.
     * @param entityID {Uuid}  The ID of the entity.
     * @param jointIndex {number}  The integer index of the joint.
     * @returns {Quat} 
     */
    function getAbsoluteJointRotationInObjectFrame(entityID: Uuid, jointIndex: number): Quat;
    /**
     * Set the translation of a joint in a  Entities.EntityType entity relative to the entity's position and 
     * orientation.
     * @param entityID {Uuid}  The ID of the entity.
     * @param jointIndex {number}  The integer index of the joint.
     * @param translation {Vec3}  The translation to set the joint to relative to the entity's position and orientation.
     * @returns {boolean} 
     */
    function setAbsoluteJointTranslationInObjectFrame(entityID: Uuid, jointIndex: number, translation: Vec3): boolean;
    /**
     * Set the rotation of a joint in a  Entities.EntityType entity relative to the entity's position and 
     * orientation.
     * @param entityID {Uuid}  The ID of the entity.
     * @param jointIndex {number}  The integer index of the joint.
     * @param rotation {Quat}  The rotation to set the joint to relative to the entity's orientation.
     * @returns {boolean} 
     */
    function setAbsoluteJointRotationInObjectFrame(entityID: Uuid, jointIndex: number, rotation: Quat): boolean;
    /**
     * Get the local translation of a joint in a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the entity.
     * @param jointIndex {number}  The integer index of the joint.
     * @returns {Vec3} 
     */
    function getLocalJointTranslation(entityID: Uuid, jointIndex: number): Vec3;
    /**
     * Get the local rotation of a joint in a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the entity.
     * @param jointIndex {number}  The integer index of the joint.
     * @returns {Quat} 
     */
    function getLocalJointRotation(entityID: Uuid, jointIndex: number): Quat;
    /**
     * Set the local translation of a joint in a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the entity.
     * @param jointIndex {number}  The integer index of the joint.
     * @param translation {Vec3}  The local translation to set the joint to.
     * @returns {boolean} 
     */
    function setLocalJointTranslation(entityID: Uuid, jointIndex: number, translation: Vec3): boolean;
    /**
     * Set the local rotation of a joint in a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the entity.
     * @param jointIndex {number}  The integer index of the joint.
     * @param rotation {Quat}  The local rotation to set the joint to.
     * @returns {boolean} 
     */
    function setLocalJointRotation(entityID: Uuid, jointIndex: number, rotation: Quat): boolean;
    /**
     * Set the local translations of joints in a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the entity.
     * @param translations {Array.<Vec3>}  The local translations to set the joints to.
     * @returns {boolean} 
     */
    function setLocalJointTranslations(entityID: Uuid, translations: Array.<Vec3>): boolean;
    /**
     * Set the local rotations of joints in a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the entity.
     * @param rotations {Array.<Quat>}  The local rotations to set the joints to.
     * @returns {boolean} 
     */
    function setLocalJointRotations(entityID: Uuid, rotations: Array.<Quat>): boolean;
    /**
     * Set the local rotations and translations of joints in a  Entities.EntityType entity. This is the same as 
     * calling both  Entities.setLocalJointRotations and  Entities.setLocalJointTranslations at the same time.
     * @param entityID {Uuid}  The ID of the entity.
     * @param rotations {Array.<Quat>}  The local rotations to set the joints to.
     * @param translations {Array.<Vec3>}  The local translations to set the joints to.
     * @returns {boolean} 
     */
    function setLocalJointsData(entityID: Uuid, rotations: Array.<Quat>, translations: Array.<Vec3>): boolean;
    /**
     * Get the index of a named joint in a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the entity.
     * @param name {string}  The name of the joint.
     * @returns {number} 
     */
    function getJointIndex(entityID: Uuid, name: string): number;
    /**
     * Get the names of all the joints in a  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|Model} entity.
     * @returns {Array.<string>} 
     */
    function getJointNames(entityID: Uuid): Array.<string>;
    /**
     * Get the IDs of entities, overlays, and avatars that are directly parented to an entity, overlay, or avatar model. Recurse on the IDs returned by the function to get all descendants of an entity, overlay, or avatar.
     * @param parentID {Uuid}  The ID of the entity, overlay, or avatar to get the children IDs of.
     * @returns {Array.<Uuid>} 
     */
    function getChildrenIDs(parentID: Uuid): Array.<Uuid>;
    /**
     * Get the IDs of entities, overlays, and avatars that are directly parented to an entity, overlay, or avatar model's joint.
     * @param parentID {Uuid}  The ID of the entity, overlay, or avatar to get the children IDs of.
     * @param jointIndex {number}  Integer number of the model joint to get the children IDs of.
     * @returns {Array.<Uuid>} 
     */
    function getChildrenIDsOfJoint(parentID: Uuid, jointIndex: number): Array.<Uuid>;
    /**
     * Check whether an entity or overlay has an entity as an ancestor (parent, parent's parent, etc.).
     * @param childID {Uuid}  The ID of the child entity or overlay to test for being a child, grandchild, etc.
     * @param parentID {Uuid}  The ID of the parent entity to test for being a parent, grandparent, etc.
     * @returns {boolean} 
     */
    function isChildOfParent(childID: Uuid, parentID: Uuid): boolean;
    /**
     * Get the type &mdash; entity, overlay, or avatar &mdash; of an in-world item.
     * @param entityID {Uuid}  The ID of the item to get the type of.
     * @returns {string} 
     */
    function getNestableType(entityID: Uuid): string;
    /**
     * Get the ID of the  Entities.EntityType entity that has keyboard focus.
     * @returns {Uuid} 
     */
    function getKeyboardFocusEntity(): Uuid;
    /**
     * Set the  Entities.EntityType entity that has keyboard focus.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|Web} entity to set keyboard focus to. Use 
     *     <code>null</code> or {@link Uuid|Uuid.NULL} to unset keyboard focus from an entity.
     */
    function setKeyboardFocusEntity(entityID: Uuid): void;
    /**
     * Emit a  Entities.mousePressOnEntity event.
     * @param entityID {Uuid}  The ID of the entity to emit the event for.
     * @param event {PointerEvent}  The event details.
     */
    function sendMousePressOnEntity(entityID: Uuid, event: PointerEvent): void;
    /**
     * Emit a  Entities.mouseMoveOnEntity event.
     * @param entityID {Uuid}  The ID of the entity to emit the event for.
     * @param event {PointerEvent}  The event details.
     */
    function sendMouseMoveOnEntity(entityID: Uuid, event: PointerEvent): void;
    /**
     * Emit a  Entities.mouseReleaseOnEntity event.
     * @param entityID {Uuid}  The ID of the entity to emit the event for.
     * @param event {PointerEvent}  The event details.
     */
    function sendMouseReleaseOnEntity(entityID: Uuid, event: PointerEvent): void;
    /**
     * Emit a  Entities.clickDownOnEntity event.
     * @param entityID {Uuid}  The ID of the entity to emit the event for.
     * @param event {PointerEvent}  The event details.
     */
    function sendClickDownOnEntity(entityID: Uuid, event: PointerEvent): void;
    /**
     * Emit a  Entities.holdingClickOnEntity event.
     * @param entityID {Uuid}  The ID of the entity to emit the event for.
     * @param event {PointerEvent}  The event details.
     */
    function sendHoldingClickOnEntity(entityID: Uuid, event: PointerEvent): void;
    /**
     * Emit a  Entities.clickReleaseOnEntity event.
     * @param entityID {Uuid}  The ID of the entity to emit the event for.
     * @param event {PointerEvent}  The event details.
     */
    function sendClickReleaseOnEntity(entityID: Uuid, event: PointerEvent): void;
    /**
     * Emit a  Entities.hoverEnterEntity event.
     * @param entityID {Uuid}  The ID of the entity to emit the event for.
     * @param event {PointerEvent}  The event details.
     */
    function sendHoverEnterEntity(entityID: Uuid, event: PointerEvent): void;
    /**
     * Emit a  Entities.hoverOverEntity event.
     * @param entityID {Uuid}  The ID of the entity to emit the event for.
     * @param event {PointerEvent}  The event details.
     */
    function sendHoverOverEntity(entityID: Uuid, event: PointerEvent): void;
    /**
     * Emit a  Entities.hoverLeaveEntity event.
     * @param entityID {Uuid}  The ID of the entity to emit the event for.
     * @param event {PointerEvent}  The event details.
     */
    function sendHoverLeaveEntity(entityID: Uuid, event: PointerEvent): void;
    /**
     * Check whether an entity wants hand controller pointer events. For example, a  Entities.EntityType entity does 
     * but a  Entities.EntityType entity doesn't.
     * @param entityID {Uuid}  The ID of the entity.
     * @returns {boolean} 
     */
    function wantsHandControllerPointerEvents(entityID: Uuid): boolean;
    /**
     * Send a script event over a  Entities.EntityType entity's EventBridge to the Web page's scripts.
     * @param entityID {Uuid}  The ID of the {@link Entities.EntityType|Web} entity.
     * @param message {string}  The message to send.
     */
    function emitScriptEvent(entityID: Uuid, message: string): void;
    /**
     * Check whether an axis-aligned box and a capsule intersect.
     * @param brn {Vec3}  The bottom right near (minimum axes values) corner of the AA box.
     * @param dimensions {Vec3}  The dimensions of the AA box.
     * @param start {Vec3}  One end of the capsule.
     * @param end {Vec3}  The other end of the capsule.
     * @param radius {number}  The radiues of the capsule.
     * @returns {boolean} 
     */
    function AABoxIntersectsCapsule(brn: Vec3, dimensions: Vec3, start: Vec3, end: Vec3, radius: number): boolean;
    /**
     * Get the meshes in a  Entities.EntityType or  Entities.EntityType entity.
     * @param entityID {Uuid}  The ID of the <code>Model</code> or <code>PolyVox</code> entity to get the meshes of.
     * @param callback {Entities~getMeshesCallback}  The function to call upon completion.
     */
    function getMeshes(entityID: Uuid, callback: Entities~getMeshesCallback): void;
    /**
     * Get the object to world transform, excluding scale, of an entity.
     * @param entityID {Uuid}  The ID of the entity.
     * @returns {Mat4} 
     */
    function getEntityTransform(entityID: Uuid): Mat4;
    /**
     * Get the object to parent transform, excluding scale, of an entity.
     * @param entityID {Uuid}  The ID of the entity.
     * @returns {Mat4} 
     */
    function getEntityLocalTransform(entityID: Uuid): Mat4;
    /**
     * Get the static certificate for an entity. The static certificate contains static properties of the item which cannot 
     * be altered.
     * @param entityID {Uuid}  The ID of the entity to get the static certificate for.
     * @returns {string} 
     */
    function getStaticCertificateJSON(entityID: Uuid): string;
    /**
     * Verify the entity's proof of provenance, i.e., that the entity's certificateID property was produced by 
     * High Fidelity signing the entity's static certificate JSON.
     * @param entityID {Uuid}  The ID of the entity to verify.
     * @returns {boolean} 
     */
    function verifyStaticCertificateProperties(entityID: Uuid): boolean;
    /**
     * Triggered on the client that is the physics simulation owner during the collision of two entities. Note: Isn't triggered 
     * for a collision with an avatar.
     * @param idA {Uuid}  The ID of one entity in the collision. For an entity script, this is the ID of the entity containing 
     *     the script.
     * @param idB {Uuid}  The ID of the other entity in the collision.
     * @param collision {Collision}  The details of the collision.
     * @returns {Signal} 
     */
    function collisionWithEntity(idA: Uuid, idB: Uuid, collision: Collision): Signal;
    /**
     * Triggered when your ability to change the locked property of entities changes.
     * @param canAdjustLocks {boolean}  <code>true</code> if the script can change the <code>locked</code> property of an 
     *     entity, otherwise <code>false</code>.
     * @returns {Signal} 
     */
    function canAdjustLocksChanged(canAdjustLocks: boolean): Signal;
    /**
     * Triggered when your ability to rez (create) entities changes.
     * @param canRez {boolean}  <code>true</code> if the script can rez (create) entities, otherwise <code>false</code>.
     * @returns {Signal} 
     */
    function canRezChanged(canRez: boolean): Signal;
    /**
     * Triggered when your ability to rez (create) temporary entities changes. Temporary entities are entities with a finite
     * lifetime property value set.
     * @param canRezTmp {boolean}  <code>true</code> if the script can rez (create) temporary entities, otherwise 
     *     <code>false</code>.
     * @returns {Signal} 
     */
    function canRezTmpChanged(canRezTmp: boolean): Signal;
    /**
     * Triggered when your ability to rez (create) certified entities changes. Certified entities are entities that have PoP
     * certificates.
     * @param canRezCertified {boolean}  <code>true</code> if the script can rez (create) certified entities, otherwise 
     *     <code>false</code>.
     * @returns {Signal} 
     */
    function canRezCertifiedChanged(canRezCertified: boolean): Signal;
    /**
     * Triggered when your ability to rez (create) temporary certified entities changes. Temporary entities are entities with a
     * finite lifetime property value set. Certified entities are entities that have PoP certificates.
     * @param canRezTmpCertified {boolean}  <code>true</code> if the script can rez (create) temporary certified entities,
     *     otherwise <code>false</code>.
     * @returns {Signal} 
     */
    function canRezTmpCertifiedChanged(canRezTmpCertified: boolean): Signal;
    /**
     * Triggered when your ability to make changes to the asset server's assets changes.
     * @param canWriteAssets {boolean}  <code>true</code> if the script can change the <code>?</code> property of an entity,
     *     otherwise <code>false</code>.
     * @returns {Signal} 
     */
    function canWriteAssetsChanged(canWriteAssets: boolean): Signal;
    /**
     * Triggered when a mouse button is clicked while the mouse cursor is on an entity, or a controller trigger is fully 
     * pressed while its laser is on an entity.
     * @param entityID {Uuid}  The ID of the entity that was pressed.
     * @param event {PointerEvent}  Details of the event.
     * @returns {Signal} 
     */
    function mousePressOnEntity(entityID: Uuid, event: PointerEvent): Signal;
    /**
     * Triggered when a mouse button is double-clicked while the mouse cursor is on an entity.
     * @param entityID {Uuid}  The ID of the entity that was double-pressed.
     * @param event {PointerEvent}  Details of the event.
     * @returns {Signal} 
     */
    function mouseDoublePressOnEntity(entityID: Uuid, event: PointerEvent): Signal;
    /**
     * Repeatedly triggered while the mouse cursor or controller laser moves on an entity.
     * @param entityID {Uuid}  The ID of the entity that was moved on.
     * @param event {PointerEvent}  Details of the event.
     * @returns {Signal} 
     */
    function mouseMoveOnEntity(entityID: Uuid, event: PointerEvent): Signal;
    /**
     * Triggered when a mouse button is released after clicking on an entity or the controller trigger is partly or fully 
     * released after pressing on an entity, even if the mouse pointer or controller laser has moved off the entity.
     * @param entityID {Uuid}  The ID of the entity that was originally pressed.
     * @param event {PointerEvent}  Details of the event.
     * @returns {Signal} 
     */
    function mouseReleaseOnEntity(entityID: Uuid, event: PointerEvent): Signal;
    /**
     * Triggered when a mouse button is clicked while the mouse cursor is not on an entity.
     * @param event {PointerEvent}  Details of the event.
     * @returns {Signal} 
     */
    function mousePressOffEntity(event: PointerEvent): Signal;
    /**
     * Triggered when a mouse button is double-clicked while the mouse cursor is not on an entity.
     * @param event {PointerEvent}  Details of the event.
     * @returns {Signal} 
     */
    function mouseDoublePressOffEntity(event: PointerEvent): Signal;
    /**
     * Triggered when a mouse button is clicked while the mouse cursor is on an entity. Note: Not triggered by controller.
     * @param entityID {Uuid}  The ID of the entity that was clicked.
     * @param event {PointerEvent}  Details of the event.
     * @returns {Signal} 
     */
    function clickDownOnEntity(entityID: Uuid, event: PointerEvent): Signal;
    /**
     * Repeatedly triggered while a mouse button continues to be held after clicking an entity, even if the mouse cursor has 
     * moved off the entity. Note: Not triggered by controller.
     * @param entityID {Uuid}  The ID of the entity that was originally clicked.
     * @param event {PointerEvent}  Details of the event.
     * @returns {Signal} 
     */
    function holdingClickOnEntity(entityID: Uuid, event: PointerEvent): Signal;
    /**
     * Triggered when a mouse button is released after clicking on an entity, even if the mouse cursor has moved off the 
     * entity. Note: Not triggered by controller.
     * @param entityID {Uuid}  The ID of the entity that was originally clicked.
     * @param event {PointerEvent}  Details of the event.
     * @returns {Signal} 
     */
    function clickReleaseOnEntity(entityID: Uuid, event: PointerEvent): Signal;
    /**
     * Triggered when the mouse cursor or controller laser starts hovering on an entity.
     * @param entityID {Uuid}  The ID of the entity that is being hovered.
     * @param event {PointerEvent}  Details of the event.
     * @returns {Signal} 
     */
    function hoverEnterEntity(entityID: Uuid, event: PointerEvent): Signal;
    /**
     * Repeatedly triggered when the mouse cursor or controller laser moves while hovering over an entity.
     * @param entityID {Uuid}  The ID of the entity that is being hovered.
     * @param event {PointerEvent}  Details of the event.
     * @returns {Signal} 
     */
    function hoverOverEntity(entityID: Uuid, event: PointerEvent): Signal;
    /**
     * Triggered when the mouse cursor or controller laser stops hovering over an entity.
     * @param entityID {Uuid}  The ID of the entity that was being hovered.
     * @param event {PointerEvent}  Details of the event.
     * @returns {Signal} 
     */
    function hoverLeaveEntity(entityID: Uuid, event: PointerEvent): Signal;
    /**
     * Triggered when an avatar enters an entity.
     * @param entityID {Uuid}  The ID of the entity that the avatar entered.
     * @returns {Signal} 
     */
    function enterEntity(entityID: Uuid): Signal;
    /**
     * Triggered when an avatar leaves an entity.
     * @param entityID {Uuid}  The ID of the entity that the avatar left.
     * @returns {Signal} 
     */
    function leaveEntity(entityID: Uuid): Signal;
    /**
     * Triggered when an entity is deleted.
     * @param entityID {Uuid}  The ID of the entity deleted.
     * @returns {Signal} 
     */
    function deletingEntity(entityID: Uuid): Signal;
    /**
     * Triggered when an entity is added to Interface's local in-memory tree of entities it knows about. This may occur when 
     * entities are loaded upon visiting a domain, when the user rotates their view so that more entities become visible, and when a domain or client-only entity is added (e.g., by Entities.addEntity).
     * @param entityID {Uuid}  The ID of the entity added.
     * @returns {Signal} 
     */
    function addingEntity(entityID: Uuid): Signal;
    /**
     * Triggered when you disconnect from a domain, at which time Interface's local in-memory tree of entities it knows about
     * is cleared.
     * @returns {Signal} 
     */
    function clearingEntities(): Signal;
    /**
     * Triggered in when a script in a  Entities.EntityType entity's Web page script sends an event over the 
     * script's EventBridge.
     * @param entityID {Uuid}  The ID of the entity that event was received from.
     * @param message {string}  The message received.
     * @returns {Signal} 
     */
    function webEventReceived(entityID: Uuid, message: string): Signal;
    interface Haze {
        /**
         * The horizontal distance at which visibility is reduced to 95%; i.e., 95% of each pixel's 
         *     color is haze.
         */
        hazeRange: number;
        /**
         * The color of the haze when looking away from the key light.
         */
        hazeColor: Color;
        /**
         * If true then the haze is colored with glare from the key light;
         *     hazeGlareColor and hazeGlareAngle are used.
         */
        hazeEnableGlare: boolean;
        /**
         * The color of the haze when looking towards the key light.
         */
        hazeGlareColor: Color;
        /**
         * The angle in degrees across the circle around the key light that the glare color and 
         *     haze color are blended 50/50.
         */
        hazeGlareAngle: number;
        /**
         * If true then haze decreases with altitude as defined by the 
         *     entity's local coordinate system; hazeBaseRef and hazeCeiling are used.
         */
        hazeAltitudeEffect: boolean;
        /**
         * The y-axis value in the entity's local coordinate system at which the haze density starts 
         *     reducing with altitude.
         */
        hazeBaseRef: number;
        /**
         * The y-axis value in the entity's local coordinate system at which the haze density has 
         *     reduced to 5%.
         */
        hazeCeiling: number;
        /**
         * The proportion of the skybox image to show through the haze: 0.0 
         *     displays no skybox image; 1.0 displays no haze.
         */
        hazeBackgroundBlend: number;
        /**
         * Currently not supported.
         */
        hazeAttenuateKeyLight: boolean;
        /**
         * Currently not supported.
         */
        hazeKeyLightRange: number;
        /**
         * Currently not supported.
         */
        hazeKeyLightAltitude: number;
    }

    interface KeyLight {
        /**
         * The color of the light.
         */
        color: Color;
        /**
         * The intensity of the light.
         */
        intensity: number;
        /**
         * The direction the light is shining.
         */
        direction: Vec3;
        /**
         * If true then shadows are cast. Shadows are cast by avatars, plus 
         *      Entities.EntityType and  Entities.EntityType entities that have their      Entities.EntityProperties property set to true.
         */
        castShadows: boolean;
    }

    interface Skybox {
        /**
         * Sets the color of the sky if url is "", otherwise modifies the 
         *     color of the cube map image.
         */
        color: Color;
        /**
         * A cube map image that is used to render the sky.
         */
        url: string;
    }

    /**
     * Set the maximum number of entity packets that the client can send per second.
     * @param packetsPerSecond {number}  Integer maximum number of entity packets that the client can send per second.
     */
    function setPacketsPerSecond(packetsPerSecond: number): void;
    /**
     * Get the maximum number of entity packets that the client can send per second.
     * @returns {number} 
     */
    function getPacketsPerSecond(): number;
    /**
     * Check whether servers exist for the client to send entity packets to, i.e., whether you are connected to a domain and 
     * its entity server is working.
     * @returns {boolean} 
     */
    function serversExist(): boolean;
    /**
     * Check whether the client has entity packets waiting to be sent.
     * @returns {boolean} 
     */
    function hasPacketsToSend(): boolean;
    /**
     * Get the number of entity packets the client has waiting to be sent.
     * @returns {number} 
     */
    function packetsToSendCount(): number;
    /**
     * Get the entity packets per second send rate of the client over its lifetime.
     * @returns {number} 
     */
    function getLifetimePPS(): number;
    /**
     * Get the entity bytes per second send rate of the client over its lifetime.
     * @returns {number} 
     */
    function getLifetimeBPS(): number;
    /**
     * Get the entity packets per second queued rate of the client over its lifetime.
     * @returns {number} 
     */
    function getLifetimePPSQueued(): number;
    /**
     * Get the entity bytes per second queued rate of the client over its lifetime.
     * @returns {number} 
     */
    function getLifetimeBPSQueued(): number;
    /**
     * Get the lifetime of the client from the first entity packet sent until now, in microseconds.
     * @returns {number} 
     */
    function getLifetimeInUsecs(): number;
    /**
     * Get the lifetime of the client from the first entity packet sent until now, in seconds.
     * @returns {number} 
     */
    function getLifetimeInSeconds(): number;
    /**
     * Get the total number of entity packets sent by the client over its lifetime.
     * @returns {number} 
     */
    function getLifetimePacketsSent(): number;
    /**
     * Get the total bytes of entity packets sent by the client over its lifetime.
     * @returns {number} 
     */
    function getLifetimeBytesSent(): number;
    /**
     * Get the total number of entity packets queued by the client over its lifetime.
     * @returns {number} 
     */
    function getLifetimePacketsQueued(): number;
    /**
     * Get the total bytes of entity packets queued by the client over its lifetime.
     * @returns {number} 
     */
    function getLifetimeBytesQueued(): number;
    interface ActionArguments-Offset {
        /**
         * The target point to offset the entity from.
         */
        pointToOffsetFrom: Vec3;
        /**
         * The distance away from the target point to position the entity.
         */
        linearDistance: number;
        /**
         * Controls how long it takes for the entity's position to catch up with the
         *     target offset. The value is the time for the action to catch up to 1/e = 0.368 of the target value, where the action     is applied using an exponential decay.
         */
        linearTimeScale: number;
    }

    interface ActionArguments-Tractor {
        /**
         * The target position.
         */
        targetPosition: Vec3;
        /**
         * The target rotation.
         */
        targetRotation: Quat;
        /**
         * If an entity ID, the targetPosition and targetRotation are 
         *     relative to this entity's position and rotation.
         */
        otherID: Uuid;
        /**
         * Controls how long it takes for the entity's position to catch up with the
         *     target position. The value is the time for the action to catch up to 1/e = 0.368 of the target value, where the action     is applied using an exponential decay.
         */
        linearTimeScale: number;
        /**
         * Controls how long it takes for the entity's orientation to catch up with the
         *     target orientation. The value is the time for the action to catch up to 1/e = 0.368 of the target value, where the     action is applied using an exponential decay.
         */
        angularTimeScale: number;
    }

    interface ActionArguments-TravelOriented {
        /**
         * The axis of the entity to align with the entity's direction of travel.
         */
        forward: Vec3;
        /**
         * Controls how long it takes for the entity's orientation to catch up with the 
         *     direction of travel. The value is the time for the action to catch up to 1/e = 0.368 of the target value, where the     action is applied using an exponential decay.
         */
        angularTimeScale: number;
    }

    interface ActionArguments-BallSocket {
        /**
         * The local offset of the joint relative to the entity's position.
         */
        pivot: Vec3;
        /**
         * The ID of the other entity that is connected to the joint.
         */
        otherEntityID: Uuid;
        /**
         * The local offset of the joint relative to the other entity's position.
         */
        otherPivot: Vec3;
    }

    interface ActionArguments-ConeTwist {
        /**
         * The local offset of the joint relative to the entity's position.
         */
        pivot: Vec3;
        /**
         * The axis of the entity that moves through the cone. Must be a non-zero vector.
         */
        axis: Vec3;
        /**
         * The ID of the other entity that is connected to the joint.
         */
        otherEntityID: Uuid;
        /**
         * The local offset of the joint relative to the other entity's position.
         */
        otherPivot: Vec3;
        /**
         * The axis of the other entity that moves through the cone. Must be a non-zero vector.
         */
        otherAxis: Vec3;
        /**
         * The angle through which the joint can move in one axis of the cone, in radians.
         */
        swingSpan1: number;
        /**
         * The angle through which the joint can move in the other axis of the cone, in radians.
         */
        swingSpan2: number;
        /**
         * The angle through with the joint can twist, in radians.
         */
        twistSpan: number;
    }

    interface ActionArguments-Hinge {
        /**
         * The local offset of the joint relative to the entity's position.
         */
        pivot: Vec3;
        /**
         * The axis of the entity that it pivots about. Must be a non-zero vector.
         */
        axis: Vec3;
        /**
         * The ID of the other entity that is connected to the joint, if any. If none is 
         *     specified then the first entity simply pivots about its specified axis.
         */
        otherEntityID: Uuid;
        /**
         * The local offset of the joint relative to the other entity's position.
         */
        otherPivot: Vec3;
        /**
         * The axis of the other entity that it pivots about. Must be a non-zero vector.
         */
        otherAxis: Vec3;
        /**
         * The most negative angle that the hinge can take, in radians.
         */
        low: number;
        /**
         * The most positive angle that the hinge can take, in radians.
         */
        high: number;
        /**
         * The current angle of the hinge. Read-only.
         */
        angle: number;
    }

    interface ActionArguments-Slider {
        /**
         * The local position of a point in the entity that slides along the axis.
         */
        point: Vec3;
        /**
         * The axis of the entity that slides along the joint. Must be a non-zero vector.
         */
        axis: Vec3;
        /**
         * The ID of the other entity that is connected to the joint, if any. If non is 
         *     specified then the first entity simply slides and rotates about its specified axis.
         */
        otherEntityID: Uuid;
        /**
         * The local position of a point in the other entity that slides along the axis.
         */
        otherPoint: Vec3;
        /**
         * The axis of the other entity that slides along the joint. Must be a non-zero vector.
         */
        axis: Vec3;
        /**
         * The most negative linear offset from the entity's initial point that the entity can 
         *     have along the slider.
         */
        linearLow: number;
        /**
         * The most positive linear offset from the entity's initial point that the entity can 
         *     have along the slider.
         */
        linearHigh: number;
        /**
         * The most negative angle that the entity can rotate about the axis if the action 
         *     involves only one entity, otherwise the most negative angle the rotation can be between the two entities. In radians.
         */
        angularLow: number;
        /**
         * The most positive angle that the entity can rotate about the axis if the action 
         *     involves only one entity, otherwise the most positive angle the rotation can be between the two entities. In radians.
         */
        angularHigh: number;
        /**
         * The current linear offset the entity is from its initial point if the action involves 
         *     only one entity, otherwise the linear offset between the two entities' action points. Read-only.
         */
        linearPosition: number;
        /**
         * The current angular offset of the entity from its initial rotation if the action 
         *     involves only one entity, otherwise the angular offset between the two entities. Read-only.
         */
        angularPosition: number;
    }

    interface ActionArguments {
        /**
         * The type of action.
         */
        type: Entities.ActionType;
        /**
         * A string that a script can use for its own purposes.
         */
        tag: string;
        /**
         * How long the action should exist, in seconds, before it is automatically deleted. A value of 
         *     0 means that the action should not be deleted.
         */
        ttl: number;
        /**
         * Is true if you created the action during your current Interface session, 
         *     false otherwise. Read-only.
         */
        isMine: boolean;
        /**
         * Is present when the entity hasn't been registered with the physics engine yet (e.g., 
         *     if the action hasn't been properly configured), otherwise undefined. Read-only.
         */
        ::no-motion-state: boolean;
        /**
         * Is true when the action is modifying the entity's motion, false 
         *     otherwise. Is present once the entity has been registered with the physics engine, otherwise undefined.     Read-only.
         */
        ::active: boolean;
        /**
         * How the entity moves with the action. Is present once the entity has 
         *     been registered with the physics engine, otherwise undefined. Read-only.
         */
        ::motion-type: Entities.PhysicsMotionType;
    }

    /**
     * Triggered when the script starts for a user.
     * Note: Can only be connected to via this.preload = function (...) { ... } in the entity script.Available in:Client Entity ScriptsServer Entity Scripts
     * @param entityID {Uuid}  The ID of the entity that the script is running in.
     * @returns {Signal} 
     */
    function preload(entityID: Uuid): Signal;
    /**
     * Triggered when the script terminates for a user.
     * Note: Can only be connected to via this.unoad = function () { ... } in the entity script.Available in:Client Entity ScriptsServer Entity Scripts
     * @returns {Signal} 
     */
    function unload(): Signal;
    /**
     * Get or set the  Entities.EntityType entity that has keyboard focus.
     *     If no entity has keyboard focus, get returns null; set to null or  Uuid to     clear keyboard focus.
     */
    let keyboardFocusEntity: Uuid;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe experimental Graphics API (experimental) lets you query and manage certain graphics-related structures (like underlying meshes and textures) from scripting.
 */
declare namespace Graphics {
    interface Material {
        name: string;
        model: string;
        opacity: number;
        roughness: number;
        metallic: number;
        scattering: number;
        unlit: boolean;
        emissiveMap: string;
        albedoMap: string;
        opacityMap: string;
        metallicMap: string;
        specularMap: string;
        roughnessMap: string;
        glossMap: string;
        normalMap: string;
        bumpMap: string;
        occlusionMap: string;
        lightmapMap: string;
        scatteringMap: string;
    }

    interface MaterialLayer {
        /**
         * This layer's material.
         */
        material: Graphics.Material;
        /**
         * The priority of this layer.  If multiple materials are applied to a mesh part, only the highest priority layer is used.
         */
        priority: number;
    }

    interface IFSData {
        /**
         * mesh name (useful for debugging / debug prints).
         */
        name: string;
        topology: string;
        /**
         * vertex indices to use for the mesh faces.
         */
        indices: Array.<number>;
        /**
         * vertex positions (model space)
         */
        vertices: Array.<Vec3>;
        /**
         * vertex normals (normalized)
         */
        normals: Array.<Vec3>;
        /**
         * vertex colors (normalized)
         */
        colors: Array.<Vec3>;
        /**
         * vertex texture coordinates (normalized)
         */
        texCoords0: Array.<Vec2>;
    }

    /**
     * Returns a model reference object associated with the specified UUID ( EntityID,  OverlayID, or  AvatarID).
     * @param entityID {UUID}  The objectID of the model whose meshes are to be retrieved.
     * @returns {Graphics.Model} 
     */
    function getModel(entityID: UUID): Graphics.Model;
    /**
     * @param id {Uuid}  
     * @param model {Graphics.Model}  
     * @returns {boolean} 
     */
    function updateModel(id: Uuid, model: Graphics.Model): boolean;
    /**
     * @param id {Uuid}  
     * @param meshIndex {number} [meshIndex=-1] 
     * @param partNumber {number} [partNumber=-1] 
     * @returns {boolean} 
     */
    function canUpdateModel(id: Uuid, meshIndex: number, partNumber: number): boolean;
    /**
     * @param meshes {Array.<Graphics.Mesh>}  
     * @returns {Graphics.Model} 
     */
    function newModel(meshes: Array.<Graphics.Mesh>): Graphics.Model;
    /**
     * Create a new Mesh / Mesh Part with the specified data buffers.
     * @param ifsMeshData {Graphics.IFSData}  Index-Faced Set (IFS) arrays used to create the new mesh.
     * @returns {Graphics.Mesh} 
     */
    function newMesh(ifsMeshData: Graphics.IFSData): Graphics.Mesh;
    /**
     * @param model {Graphics.Model}  
     * @returns {string} 
     */
    function exportModelToOBJ(model: Graphics.Model): string;
    interface Mesh {
        /**
         * Array of submesh part references.
         */
        parts: Array.<Graphics.MeshPart>;
        /**
         * Vertex attribute names (color, normal, etc.)
         */
        attributeNames: Array.<string>;
        /**
         * The number of parts contained in the mesh.
         */
        numParts: number;
        /**
         * Total number of vertex indices in the mesh.
         */
        numIndices: number;
        /**
         * Total number of vertices in the Mesh.
         */
        numVertices: number;
        /**
         * Number of currently defined vertex attributes.
         */
        numAttributes: number;
        valid: boolean;
        strong: boolean;
        extents: object;
        bufferFormats: object;
    }

    interface MeshPart {
        valid: boolean;
        /**
         * The part index (within the containing Mesh).
         */
        partIndex: number;
        firstVertexIndex: number;
        baseVertexIndex: number;
        lastVertexIndex: number;
        /**
         * element interpretation (currently only 'triangles' is supported).
         */
        topology: Graphics.Topology;
        /**
         * Vertex attribute names (color, normal, etc.)
         */
        attributeNames: Array.<string>;
        /**
         * Number of vertex indices that this mesh part refers to.
         */
        numIndices: number;
        /**
         * Number of vertices per face (eg: 3 when topology is 'triangles').
         */
        numVerticesPerFace: number;
        /**
         * Number of faces represented by the mesh part (numIndices / numVerticesPerFace).
         */
        numFaces: number;
        /**
         * Total number of vertices in the containing Mesh.
         */
        numVertices: number;
        /**
         * Number of currently defined vertex attributes.
         */
        numAttributes: number;
        extents: object;
        bufferFormats: object;
    }

    interface Model {
        /**
         * UUID of corresponding inworld object (if model is associated)
         */
        objectID: Uuid;
        /**
         * The number of submeshes contained in the model.
         */
        numMeshes: number;
        /**
         * Array of submesh references.
         */
        meshes: Array.<Graphics.Mesh>;
        /**
         * Map of materials layer lists.  You can look up a material layer list by mesh part number or by material name.
         */
        materialLayers: Object.<string, Array.<Graphics.MaterialLayer>>;
        /**
         * Array of all the material names used by the mesh parts of this model, in order (e.g. materialNames[0] is the name of the first mesh part's material).
         */
        materialNames: Array.<string>;
    }

}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace Midi {
    /**
     * Send Raw MIDI packet to a particular device.
     * @param device {number}  Integer device number.
     * @param raw {number}  Integer (DWORD) raw MIDI message.
     */
    function sendRawDword(device: number, raw: number): void;
    /**
     * Send MIDI message to a particular device.
     * @param device {number}  Integer device number.
     * @param channel {number}  Integer channel number.
     * @param type {number}  0x8 is note off, 0x9 is note on (if velocity=0, note off), etc.
     * @param note {number}  MIDI note number.
     * @param velocity {number}  Note velocity (0 means note off).
     */
    function sendMidiMessage(device: number, channel: number, type: number, note: number, velocity: number): void;
    /**
     * Play a note on all connected devices.
     * @param status {number}  0x80 is note off, 0x90 is note on (if velocity=0, note off), etc.
     * @param note {number}  MIDI note number.
     * @param velocity {number}  Note velocity (0 means note off).
     */
    function playMidiNote(status: number, note: number, velocity: number): void;
    /**
     * Turn off all notes on all connected devices.
     */
    function allNotesOff(): void;
    /**
     * Clean up and re-discover attached devices.
     */
    function resetDevices(): void;
    /**
     * Get a list of inputs/outputs.
     * @param output {boolean}  
     * @returns {Array.<string>} 
     */
    function listMidiDevices(output: boolean): Array.<string>;
    /**
     * Block an input/output by name.
     * @param name {string}  
     * @param output {boolean}  
     */
    function blockMidiDevice(name: string, output: boolean): void;
    /**
     * Unblock an input/output by name.
     * @param name {string}  
     * @param output {boolean}  
     */
    function unblockMidiDevice(name: string, output: boolean): void;
    /**
     * Repeat all incoming notes to all outputs (default disabled).
     * @param enable {boolean}  
     */
    function thruModeEnable(enable: boolean): void;
    /**
     * Broadcast on all unblocked devices.
     * @param enable {boolean}  
     */
    function broadcastEnable(enable: boolean): void;
    /**
     * @param enable {boolean}  
     */
    function typeNoteOffEnable(enable: boolean): void;
    /**
     * @param enable {boolean}  
     */
    function typeNoteOnEnable(enable: boolean): void;
    /**
     * @param enable {boolean}  
     */
    function typePolyKeyPressureEnable(enable: boolean): void;
    /**
     * @param enable {boolean}  
     */
    function typeControlChangeEnable(enable: boolean): void;
    /**
     * @param enable {boolean}  
     */
    function typeProgramChangeEnable(enable: boolean): void;
    /**
     * @param enable {boolean}  
     */
    function typeChanPressureEnable(enable: boolean): void;
    /**
     * @param enable {boolean}  
     */
    function typePitchBendEnable(enable: boolean): void;
    /**
     * @param enable {boolean}  
     */
    function typeSystemMessageEnable(enable: boolean): void;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsAPI to manage model cache resources.
 */
declare namespace ModelCache {
    /**
     * Get the list of all resource URLs.
     * @returns {Array.<string>} 
     */
    function getResourceList(): Array.<string>;
    /**
     * @param deltaSize {number}  
     */
    function updateTotalSize(deltaSize: number): void;
    /**
     * Prefetches a resource.
     * @param url {string}  URL of the resource to prefetch.
     * @param extra {object} [extra=null] 
     * @returns {ResourceObject} 
     */
    function prefetch(url: string, extra: object): ResourceObject;
    /**
     * @returns {Signal} 
     */
    function dirty(): Signal;
    /**
     * Total number of total resources. Read-only.
     */
    let numTotal: number;
    /**
     * Total number of cached resource. Read-only.
     */
    let numCached: number;
    /**
     * Size in bytes of all resources. Read-only.
     */
    let sizeTotal: number;
    /**
     * Size in bytes of all cached resources. Read-only.
     */
    let sizeCached: number;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsAPI to manage texture cache resources.
 */
declare namespace TextureCache {
    /**
     * @param url {string}  
     * @param type {number}  
     * @param maxNumPixels {number} [maxNumPixels=67108864] 
     * @returns {ResourceObject} 
     */
    function prefetch(url: string, type: number, maxNumPixels: number): ResourceObject;
    /**
     * @returns {Signal} 
     */
    function spectatorCameraFramebufferReset(): Signal;
    /**
     * Get the list of all resource URLs.
     * @returns {Array.<string>} 
     */
    function getResourceList(): Array.<string>;
    /**
     * @param deltaSize {number}  
     */
    function updateTotalSize(deltaSize: number): void;
    /**
     * Prefetches a resource.
     * @param url {string}  URL of the resource to prefetch.
     * @param extra {object} [extra=null] 
     * @returns {ResourceObject} 
     */
    function prefetch(url: string, extra: object): ResourceObject;
    /**
     * @returns {Signal} 
     */
    function dirty(): Signal;
    /**
     * Total number of total resources. Read-only.
     */
    let numTotal: number;
    /**
     * Total number of cached resource. Read-only.
     */
    let numCached: number;
    /**
     * Size in bytes of all resources. Read-only.
     */
    let sizeTotal: number;
    /**
     * Size in bytes of all cached resources. Read-only.
     */
    let sizeCached: number;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsAssignment Client ScriptsThe location API provides facilities related to your current location in the metaverse.
 * Getter/SetterYou can get and set your current metaverse address by directly reading a string value from and writing a string value to the location object. This is an alternative to using the location.href property or this object'sfunctions.
 */
declare namespace location {
    /**
     * Go to a specified metaverse address.
     * @param address {string}  The address to go to: a <code>"hifi://"<code> address, an IP address (e.g., 
     * <code>"127.0.0.1"</code> or <code>"localhost"</code>), a domain name, a named path on a domain (starts with <code>"/"</code>), a position or position and orientation, or a user (starts with <code>"@"</code>).
     * @param fromSuggestions {boolean}  Set to <code>true</code> if the address is obtained from the "Goto" dialog.
     *    Helps ensure that user's location history is correctly maintained.
     */
    function handleLookupString(address: string, fromSuggestions: boolean): void;
    /**
     * Go to a position and orientation resulting from a lookup for a named path in the domain (set in the domain server's 
     * settings).
     * @param path {string}  The position and orientation corresponding to the named path.
     * @param namedPath {string}  The named path that was looked up on the server.
     */
    function goToViewpointForPath(path: string, namedPath: string): void;
    /**
     * Go back to the previous location in your navigation history, if there is one.
     */
    function goBack(): void;
    /**
     * Go forward to the next location in your navigation history, if there is one.
     */
    function goForward(): void;
    /**
     * Go to the local Sandbox server that's running on the same PC as Interface.
     * @param path {string}  The position and orientation to go to (e.g., <code>"/0,0,0"</code>).
     * @param trigger {location.LookupTrigger}  The reason for the function call. Helps ensure that user's
     *     location history is correctly maintained.
     */
    function goToLocalSandbox(path: string, trigger: location.LookupTrigger): void;
    /**
     * Go to the default "welcome" metaverse address.
     * @param trigger {location.LookupTrigger}  The reason for the function call. Helps ensure that user's
     *     location history is correctly maintained.
     */
    function goToEntry(trigger: location.LookupTrigger): void;
    /**
     * Go to the specified user's location.
     * @param username {string}  The user's username.
     * @param matchOrientation {boolean}  If <code>true</code> then go to a location just in front of the user and turn to face
     *     them, otherwise go to the user's exact location and orientation.
     */
    function goToUser(username: string, matchOrientation: boolean): void;
    /**
     * Go to the last address tried.  This will be the last URL tried from location.handleLookupString
     */
    function goToLastAddress(): void;
    /**
     * Returns if going back is possible.
     */
    function canGoBack(): void;
    /**
     * Refresh the current address, e.g., after connecting to a domain in order to position the user to the desired location.
     */
    function refreshPreviousLookup(): void;
    /**
     * Update your current metaverse location in Interface's  Settings file as your last-known address. This can be used
     * to ensure that you start up at that address if you exit Interface without a later address automatically being saved.
     */
    function storeCurrentAddress(): void;
    /**
     * Copy your current metaverse address (i.e., location.href property value) to the OS clipboard.
     */
    function copyAddress(): void;
    /**
     * Copy your current metaverse location and orientation (i.e., location.pathname property value) to the OS 
     * clipboard.
     */
    function copyPath(): void;
    /**
     * Retrieve and remember the place name for the given domain ID if the place name is not already known.
     * @param domainID {Uuid}  The UUID of the domain.
     */
    function lookupShareableNameForDomainID(domainID: Uuid): void;
    /**
     * Triggered when looking up the details of a metaverse user or location to go to has completed (successfully or
     * unsuccessfully).
     * @returns {Signal} 
     */
    function lookupResultsFinished(): Signal;
    /**
     * Triggered when looking up the details of a metaverse user or location to go to has completed and the domain or user is 
     * offline.
     * @returns {Signal} 
     */
    function lookupResultIsOffline(): Signal;
    /**
     * Triggered when looking up the details of a metaverse user or location to go to has completed and the domain or user could
     * not be found.
     * @returns {Signal} 
     */
    function lookupResultIsNotFound(): Signal;
    /**
     * Triggered when a request is made to go to an IP address.
     * @param domainURL {Url}  URL for domain
     * @param domainID {Uuid}  The UUID of the domain to go to.
     * @returns {Signal} 
     */
    function possibleDomainChangeRequired(domainURL: Url, domainID: Uuid): Signal;
    /**
     * Triggered when a request is made to go to a named domain or user.
     * @param iceServerHostName {string}  IP address of the ICE server.
     * @param domainID {Uuid}  The UUID of the domain to go to.
     * @returns {Signal} 
     */
    function possibleDomainChangeRequiredViaICEForID(iceServerHostName: string, domainID: Uuid): Signal;
    /**
     * Triggered when an attempt is made to send your avatar to a specified position on the current domain. For example, when
     * you change domains or enter a position to go to in the "Goto" dialog.
     * @param position {Vec3}  The position to go to.
     * @param hasOrientationChange {boolean}  If <code>true</code> then a new <code>orientation</code> has been requested.
     * @param orientation {Quat}  The orientation to change to. Is {@link Quat|Quat.IDENTITY} if 
     *     <code>hasOrientationChange</code> is <code>false</code>.
     * @param shouldFaceLocation {boolean}  If <code>true</code> then the request is to go to a position near that specified 
     *     and orient your avatar to face it. For example when you visit someone from the "People" dialog.
     * @returns {Signal} 
     */
    function locationChangeRequired(position: Vec3, hasOrientationChange: boolean, orientation: Quat, shouldFaceLocation: boolean): Signal;
    /**
     * Triggered when an attempt is made to send your avatar to a new named path on the domain (set in the domain server's
     * settings). For example, when you enter a "/" followed by the path's name in the "GOTO" dialog.
     * @param path {string}  The name of the path to go to.
     * @returns {Signal} 
     */
    function pathChangeRequired(path: string): Signal;
    /**
     * Triggered when you navigate to a new domain.
     * @param hostname {string}  The new domain's host name.
     * @returns {Signal} 
     */
    function hostChanged(hostname: string): Signal;
    /**
     * Triggered when there's a change in whether or not there's a previous location that can be navigated to using
     *  location.goBack. (Reflects changes in the state of the "Goto" dialog's back arrow.)
     * @param isPossible {boolean}  <code>true</code> if there's a previous location to navigate to, otherwise 
     *     <code>false</code>.
     * @returns {Signal} 
     */
    function goBackPossible(isPossible: boolean): Signal;
    /**
     * Triggered when there's a change in whether or not there's a forward location that can be navigated to using
     *  location.goForward. (Reflects changes in the state of the "Goto" dialog's forward arrow.)
     * @param isPossible {boolean}  <code>true</code> if there's a forward location to navigate to, otherwise
     *     <code>false</code>.
     * @returns {Signal} 
     */
    function goForwardPossible(isPossible: boolean): Signal;
    /**
     * A UUID uniquely identifying the domain you're visiting. Is  Uuid if you're not
     *     connected to the domain or are in a serverless domain.    Read-only.
     */
    let domainID: Uuid;
    /**
     * The name of the domain for your current metaverse address (e.g., "AvatarIsland",
     *     localhost, or an IP address). Is blank if you're in a serverless domain.    Read-only.
     */
    let hostname: string;
    /**
     * Your current metaverse address (e.g., "hifi://avatarisland/15,-10,26/0,0,0,1")
     *     regardless of whether or not you're connected to the domain. Starts with "file:///" if you're in a     serverless domain.    Read-only.
     */
    let href: string;
    /**
     * true if you're connected to the domain in your current href
     *     metaverse address, otherwise false.
     */
    let isConnected: boolean;
    /**
     * The location and orientation in your current href metaverse address 
     *     (e.g., "/15,-10,26/0,0,0,1").    Read-only.
     */
    let pathname: string;
    /**
     * The place name in your current href metaverse address
     *     (e.g., "AvatarIsland"). Is blank if your hostname is an IP address.    Read-only.
     */
    let placename: string;
    /**
     * The protocol of your current href metaverse address (e.g., "hifi").
     *     Read-only.
     */
    let protocol: string;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client ScriptsThe Messages API enables text and data to be sent between scripts over named "channels". A channel can have an arbitrary 
 * name to help separate messaging between different sets of scripts.Note: If you want to call a function in another script, you should use one of the following rather than sending a message:   Entities.callEntityClientMethod   Entities.callEntityMethod   Entities.callEntityServerMethod   Script.callEntityScriptMethod
 */
declare namespace Messages {
    /**
     * Send a text message on a channel.
     * @param channel {string}  The channel to send the message on.
     * @param message {string}  The message to send.
     * @param localOnly {boolean} [localOnly=false] If <code>false</code> then the message is sent to all Interface, client entity, 
     *     server entity, and assignment client scripts in the domain.<br />    If <code>true</code> then: if sent from an Interface or client entity script it is received by all Interface and     client entity scripts; if sent from a server entity script it is received by all entity server scripts; and if sent     from an assignment client script it is received only by that same assignment client script.
     */
    function sendMessage(channel: string, message: string, localOnly: boolean): void;
    /**
     * Send a text message locally on a channel.
     * This is the same as calling  Messages.sendMessage with localOnly set to true.
     * @param channel {string}  The channel to send the message on.
     * @param message {string}  The message to send.
     */
    function sendLocalMessage(channel: string, message: string): void;
    /**
     * Send a data message on a channel.
     * @param channel {string}  The channel to send the data on.
     * @param data {object}  The data to send. The data is handled as a byte stream, for example as may be provided via a 
     *     JavaScript <code>Int8Array</code> object.
     * @param localOnly {boolean} [localOnly=false] If <code>false</code> then the message is sent to all Interface, client entity,
     *     server entity, and assignment client scripts in the domain.<br />    If <code>true</code> then: if sent from an Interface or client entity script it is received by all Interface and    client entity scripts; if sent from a server entity script it is received by all entity server scripts; and if sent    from an assignment client script it is received only by that same assignment client script.
     */
    function sendData(channel: string, data: object, localOnly: boolean): void;
    /**
     * Subscribe the scripting environment &mdash; Interface, the entity script server, or assignment client instance &mdash; 
     * to receive messages on a specific channel. Note that, for example, if there are two Interface scripts that subscribe to different channels, both scripts will receive messages on both channels.
     * @param channel {string}  The channel to subscribe to.
     */
    function subscribe(channel: string): void;
    /**
     * Unsubscribe the scripting environment from receiving messages on a specific channel.
     * @param channel {string}  The channel to unsubscribe from.
     */
    function unsubscribe(channel: string): void;
    /**
     * Triggered when the a text message is received.
     * @param channel {string}  The channel that the message was sent on. You can use this to filter out messages not relevant 
     *     to your script.
     * @param message {string}  The message received.
     * @param senderID {Uuid}  The UUID of the sender: the user's session UUID if sent by an Interface or client entity 
     *     script, the UUID of the entity script server if sent by a server entity script, or the UUID of the assignment client     instance if sent by an assignment client script.
     * @param localOnly {boolean}  <code>true</code> if the message was sent with <code>localOnly = true</code>.
     * @returns {Signal} 
     */
    function messageReceived(channel: string, message: string, senderID: Uuid, localOnly: boolean): Signal;
    /**
     * Triggered when a data message is received.
     * @param channel {string}  The channel that the message was sent on. You can use this to filter out messages not relevant
     *     to your script.
     * @param data {object}  The data received. The data is handled as a byte stream, for example as may be used by a 
     *     JavaScript <code>Int8Array</code> object.
     * @param senderID {Uuid}  The UUID of the sender: the user's session UUID if sent by an Interface or client entity
     *     script, the UUID of the entity script server if sent by a server entity script, or the UUID of the assignment client    script, the UUID of the entity script server if sent by a server entity script, or the UUID of the assignment client    instance if sent by an assignment client script.
     * @param localOnly {boolean}  <code>true</code> if the message was sent with <code>localOnly = true</code>.
     * @returns {Signal} 
     */
    function dataReceived(channel: string, data: object, senderID: Uuid, localOnly: boolean): Signal;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client Scripts
 */
declare class ResourceObject {
    /**
     * Release this resource.
     */
    release(): void;
    /**
     * Triggered when download progress for this resource has changed.
     * @param bytesReceived {number}  Byytes downloaded so far.
     * @param bytesTotal {number}  Total number of bytes in the resource.
     * @returns {Signal} 
     */
    progressChanged(bytesReceived: number, bytesTotal: number): Signal;
    /**
     * Triggered when resource loading state has changed.
     * @param state {Resource.State}  New state.
     * @returns {Signal} 
     */
    stateChanged(state: Resource.State): Signal;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client Scripts
 */
declare namespace Resources {
    /**
     * @param prefix {string}  
     * @param replacement {string}  
     */
    function overrideUrlPrefix(prefix: string, replacement: string): void;
    /**
     * @param prefix {string}  
     */
    function restoreUrlPrefix(prefix: string): void;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace Steam {
    /**
     * @returns {boolean} 
     */
    function isRunning(): boolean;
    function openInviteOverlay(): void;
    /**
     * Read-only.
     */
    let running: boolean;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsEnum for different types of Picks and Pointers.
 */
declare namespace PickType {
    /**
     * Ray Picks intersect a ray with the nearest object in front of them, along a given direction.
     */
    let Ray: number;
    /**
     * Stylus Picks provide "tapping" functionality on/into flat surfaces.
     */
    let Stylus: number;
    /**
     * Parabola Picks intersect a parabola with the nearest object in front of them, with a given initial velocity and acceleration.
     */
    let Parabola: number;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client ScriptsThe Assets API allows you to communicate with the Asset Browser.
 */
declare namespace Assets {
    /**
     * @param input {string}  
     * @returns {boolean} 
     */
    function isValidPath(input: string): boolean;
    /**
     * @param input {string}  
     * @returns {boolean} 
     */
    function isValidFilePath(input: string): boolean;
    /**
     * @param input {string}  
     * @returns {string} 
     */
    function getATPUrl(input: string): string;
    /**
     * @param input {string}  
     * @returns {string} 
     */
    function extractAssetHash(input: string): string;
    /**
     * @param input {string}  
     * @returns {boolean} 
     */
    function isValidHash(input: string): boolean;
    /**
     * @param data {}  
     * @returns {object} 
     */
    function hashData(data): object;
    /**
     * @param data {}  
     * @returns {string} 
     */
    function hashDataHex(data): string;
    /**
     * Upload content to the connected domain's asset server.
     * @param data {string}  content to upload
     * @param callback {Assets~uploadDataCallback}  called when upload is complete
     */
    function uploadData(data: string, callback: Assets~uploadDataCallback): void;
    /**
     * Download data from the connected domain's asset server.
     * @param url {string}  URL of asset to download, must be ATP scheme URL.
     * @param callback {Assets~downloadDataCallback}  
     */
    function downloadData(url: string, callback: Assets~downloadDataCallback): void;
    /**
     * Sets up a path to hash mapping within the connected domain's asset server
     * @param path {string}  
     * @param hash {string}  
     * @param callback {Assets~setMappingCallback}  
     */
    function setMapping(path: string, hash: string, callback: Assets~setMappingCallback): void;
    /**
     * Look up a path to hash mapping within the connected domain's asset server
     * @param path {string}  
     * @param callback {Assets~getMappingCallback}  
     */
    function getMapping(path: string, callback: Assets~getMappingCallback): void;
    /**
     * @param path {string}  
     * @param enabled {boolean}  
     * @param callback {}  
     */
    function setBakingEnabled(path: string, enabled: boolean, callback): void;
    /**
     * Request Asset data from the ATP Server
     * @param options {URL}  An atp: style URL, hash, or relative mapped path; or an {@link Assets.GetOptions} object with request parameters
     * @param scope {Assets~getAssetCallback}  A scope callback function to receive (error, results) values
     * @param callback {function} [callback=undefined] 
     */
    function getAsset(options: URL, scope: Assets~getAssetCallback, callback: function): void;
    interface GetOptions {
        /**
         * an "atp:" style URL, hash, or relative mapped path to fetch
         */
        url: string;
        /**
         * the desired reponse type (text | arraybuffer | json)
         */
        responseType: string;
        /**
         * whether to attempt gunzip decompression on the fetched data
         *    See:  Assets.putAsset and its .compress=true option
         */
        decompress: boolean;
    }

    interface getAssetResult {
        /**
         * the resolved "atp:" style URL for the fetched asset
         */
        url: string;
        /**
         * the resolved hash for the fetched asset
         */
        hash: string;
        /**
         * response data (possibly converted per .responseType value)
         */
        response: string;
        /**
         * response type (text | arraybuffer | json)
         */
        responseType: string;
        /**
         * detected asset mime-type (autodetected)
         */
        contentType: string;
        /**
         * response data size in bytes
         */
        byteLength: number;
        /**
         * flag indicating whether data was decompressed
         */
        decompressed: number;
    }

    /**
     * Upload Asset data to the ATP Server
     * @param options {Assets.PutOptions}  A PutOptions object with upload parameters
     * @param scope[callback {Assets~putAssetCallback}  A scoped callback function invoked with (error, results)
     * @param callback {function} [callback=undefined] 
     */
    function putAsset(options: Assets.PutOptions, scope[callback: Assets~putAssetCallback, callback: function): void;
    interface PutOptions {
        /**
         * byte buffer or string value representing the new asset's content
         */
        data: ArrayBuffer;
        /**
         * ATP path mapping to automatically create (upon successful upload to hash)
         */
        path: string;
        /**
         * whether to gzip compress data before uploading
         */
        compress: boolean;
    }

    interface putAssetResult {
        /**
         * the resolved "atp:" style URL for the uploaded asset (based on .path if specified, otherwise on the resulting ATP hash)
         */
        url: string;
        /**
         * the uploaded asset's resulting ATP path (or undefined if no path mapping was assigned)
         */
        path: string;
        /**
         * the uploaded asset's resulting ATP hash
         */
        hash: string;
        /**
         * flag indicating whether the data was compressed before upload
         */
        compressed: boolean;
        /**
         * flag indicating final byte size of the data uploaded to the ATP server
         */
        byteLength: number;
    }

    /**
     * @param options {}  
     * @param scope {}  
     * @param callback {} [callback=""] 
     */
    function deleteAsset(options, scope, callback): void;
    /**
     * @param options {}  
     * @param scope {}  
     * @param callback {} [callback=""] 
     */
    function resolveAsset(options, scope, callback): void;
    /**
     * @param options {}  
     * @param scope {}  
     * @param callback {} [callback=""] 
     */
    function decompressData(options, scope, callback): void;
    /**
     * @param options {}  
     * @param scope {}  
     * @param callback {} [callback=""] 
     */
    function compressData(options, scope, callback): void;
    /**
     * @returns {boolean} 
     */
    function initializeCache(): boolean;
    /**
     * @param url {string}  
     * @returns {boolean} 
     */
    function canWriteCacheValue(url: string): boolean;
    /**
     * @param scope {}  
     * @param callback {} [callback=undefined] 
     */
    function getCacheStatus(scope, callback): void;
    /**
     * @param options {}  
     * @param scope {}  
     * @param callback {} [callback=undefined] 
     */
    function queryCacheMeta(options, scope, callback): void;
    /**
     * @param options {}  
     * @param scope {}  
     * @param callback {} [callback=undefined] 
     */
    function loadFromCache(options, scope, callback): void;
    /**
     * @param options {}  
     * @param scope {}  
     * @param callback {} [callback=undefined] 
     */
    function saveToCache(options, scope, callback): void;
    /**
     * @param url {}  
     * @param data {}  
     * @param metadata {}  
     * @param scope {}  
     * @param callback {} [callback=undefined] 
     */
    function saveToCache(url, data, metadata, scope, callback): void;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client Scripts
 */
declare namespace File {
    /**
     * @param url {string}  
     * @returns {string} 
     */
    function convertUrlToPath(url: string): string;
    /**
     * @param path {string}  
     * @param url {string}  
     * @param autoAdd {boolean}  
     * @param isZip {boolean}  
     * @param isBlocks {boolean}  
     */
    function runUnzip(path: string, url: string, autoAdd: boolean, isZip: boolean, isBlocks: boolean): void;
    /**
     * @returns {string} 
     */
    function getTempDir(): string;
    /**
     * @param zipFile {string}  
     * @param unzipFile {string}  
     * @param autoAdd {boolean}  
     * @param isZip {boolean}  
     * @param isBlocks {boolean}  
     * @returns {Signal} 
     */
    function unzipResult(zipFile: string, unzipFile: string, autoAdd: boolean, isZip: boolean, isBlocks: boolean): Signal;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client Scripts
 */
declare namespace Mat4 {
    /**
     * @param m1 {Mat4}  
     * @param m2 {Mat4}  
     * @returns {Mat4} 
     */
    function multiply(m1: Mat4, m2: Mat4): Mat4;
    /**
     * @param rot {Quat}  
     * @param trans {Vec3}  
     * @returns {Mat4} 
     */
    function createFromRotAndTrans(rot: Quat, trans: Vec3): Mat4;
    /**
     * @param scale {Vec3}  
     * @param rot {Quat}  
     * @param trans {Vec3}  
     * @returns {Mat4} 
     */
    function createFromScaleRotAndTrans(scale: Vec3, rot: Quat, trans: Vec3): Mat4;
    /**
     * @param col0 {Vec4}  
     * @param col1 {Vec4}  
     * @param col2 {Vec4}  
     * @param col {Vec4}  
     * @returns {Mat4} 
     */
    function createFromColumns(col0: Vec4, col1: Vec4, col2: Vec4, col: Vec4): Mat4;
    /**
     * @param numbers {Array.<number>}  
     * @returns {Mat4} 
     */
    function createFromArray(numbers: Array.<number>): Mat4;
    /**
     * @param m {Mat4}  
     * @returns {Vec3} 
     */
    function extractTranslation(m: Mat4): Vec3;
    /**
     * @param m {Mat4}  
     * @returns {Vec3} 
     */
    function extractRotation(m: Mat4): Vec3;
    /**
     * @param m {Mat4}  
     * @returns {Vec3} 
     */
    function extractScale(m: Mat4): Vec3;
    /**
     * @param m {Mat4}  
     * @param point {Vec3}  
     * @returns {Vec3} 
     */
    function transformPoint(m: Mat4, point: Vec3): Vec3;
    /**
     * @param m {Mat4}  
     * @param vector {Vec3}  
     * @returns {Vec3} 
     */
    function transformVector(m: Mat4, vector: Vec3): Vec3;
    /**
     * @param m {Mat4}  
     * @returns {Mat4} 
     */
    function inverse(m: Mat4): Mat4;
    /**
     * @param m {Mat4}  
     * @returns {Vec3} 
     */
    function getFront(m: Mat4): Vec3;
    /**
     * @param m {Mat4}  
     * @returns {Vec3} 
     */
    function getForward(m: Mat4): Vec3;
    /**
     * @param m {Mat4}  
     * @returns {Vec3} 
     */
    function getRight(m: Mat4): Vec3;
    /**
     * @param m {Mat4}  
     * @returns {Vec3} 
     */
    function getUp(m: Mat4): Vec3;
    /**
     * @param label {string}  
     * @param m {Mat4}  
     * @param transpose {boolean} [transpose=false] 
     */
    function print(label: string, m: Mat4, transpose: boolean): void;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client ScriptsThe Quat API provides facilities for generating and manipulating quaternions.
 * Quaternions should be used in preference to Euler angles wherever possible because quaternions don't suffer from the problemof gimbal lock.
 */
declare namespace Quat {
    /**
     * Multiply two quaternions.
     * @param q1 {Quat}  The first quaternion.
     * @param q2 {Quat}  The second quaternion.
     * @returns {Quat} 
     */
    function multiply(q1: Quat, q2: Quat): Quat;
    /**
     * Normalizes a quaternion.
     * @param q {Quat}  The quaternion to normalize.
     * @returns {Quat} 
     */
    function normalize(q: Quat): Quat;
    /**
     * Calculate the conjugate of a quaternion. For a unit quaternion, its conjugate is the same as its 
     *      Quat.inverse.
     * @param q {Quat}  The quaternion to conjugate.
     * @returns {Quat} 
     */
    function conjugate(q: Quat): Quat;
    /**
     * Calculate a camera orientation given eye position, point of interest, and "up" direction. The camera's negative z-axis is
     * the forward direction. The result has zero roll about its forward direction with respect to the given "up" direction.
     * @param eye {Vec3}  The eye position.
     * @param target {Vec3}  The point to look at.
     * @param up {Vec3}  The "up" direction.
     * @returns {Quat} 
     */
    function lookAt(eye: Vec3, target: Vec3, up: Vec3): Quat;
    /**
     * Calculate a camera orientation given eye position and point of interest. The camera's negative z-axis is the forward 
     * direction. The result has zero roll about its forward direction.
     * @param eye {Vec3}  The eye position.
     * @param target {Vec3}  The point to look at.
     * @returns {Quat} 
     */
    function lookAtSimple(eye: Vec3, target: Vec3): Quat;
    /**
     * Calculate the shortest rotation from a first vector onto a second.
     * @param v1 {Vec3}  The first vector.
     * @param v2 {Vec3}  The second vector.
     * @returns {Quat} 
     */
    function rotationBetween(v1: Vec3, v2: Vec3): Quat;
    /**
     * Generate a quaternion from a  Vec3 of Euler angles in degrees.
     * @param vector {Vec3}  A vector of three Euler angles in degrees, the angles being the rotations about the x, y, and z
     *     axes.
     * @returns {Quat} 
     */
    function fromVec3Degrees(vector: Vec3): Quat;
    /**
     * Generate a quaternion from a  Vec3 of Euler angles in radians.
     * @param vector {Vec3}  A vector of three Euler angles in radians, the angles being the rotations about the x, y, and z
     *     axes.
     * @returns {Quat} 
     */
    function fromVec3Radians(vector: Vec3): Quat;
    /**
     * Generate a quaternion from pitch, yaw, and roll values in degrees.
     * @param pitch {number}  The pitch angle in degrees.
     * @param yaw {number}  The yaw angle in degrees.
     * @param roll {number}  The roll angle in degrees.
     * @returns {Quat} 
     */
    function fromPitchYawRollDegrees(pitch: number, yaw: number, roll: number): Quat;
    /**
     * Generate a quaternion from pitch, yaw, and roll values in radians.
     * @param pitch {number}  The pitch angle in radians.
     * @param yaw {number}  The yaw angle in radians.
     * @param roll {number}  The roll angle in radians.
     * @returns {Quat} 
     */
    function fromPitchYawRollRadians(pitch: number, yaw: number, roll: number): Quat;
    /**
     * Calculate the inverse of a quaternion. For a unit quaternion, its inverse is the same as its
     *      Quat.conjugate.
     * @param q {Quat}  The quaternion.
     * @returns {Quat} 
     */
    function inverse(q: Quat): Quat;
    /**
     * Get the "front" direction that the camera would face if its orientation was set to the quaternion value.
     * This is a synonym for  Quat.getForward.The High Fidelity camera has axes x = right, y = up, -z = forward.
     * @param orientation {Quat}  A quaternion representing an orientation.
     * @returns {Vec3} 
     */
    function getFront(orientation: Quat): Vec3;
    /**
     * Get the "forward" direction that the camera would face if its orientation was set to the quaternion value.
     * This is a synonym for  Quat.getFront.The High Fidelity camera has axes x = right, y = up, -z = forward.
     * @param orientation {Quat}  A quaternion representing an orientation.
     * @returns {Vec3} 
     */
    function getForward(orientation: Quat): Vec3;
    /**
     * Get the "right" direction that the camera would have if its orientation was set to the quaternion value.
     * The High Fidelity camera has axes x = right, y = up, -z = forward.
     * @param orientation {Quat}  A quaternion representing an orientation.
     * @returns {Vec3} 
     */
    function getRight(orientation: Quat): Vec3;
    /**
     * Get the "up" direction that the camera would have if its orientation was set to the quaternion value.
     * The High Fidelity camera has axes x = right, y = up, -z = forward.
     * @param orientation {Quat}  A quaternion representing an orientation.
     * @returns {Vec3} 
     */
    function getUp(orientation: Quat): Vec3;
    /**
     * Calculate the Euler angles for the quaternion, in degrees. (The "safe" in the name signifies that the angle results will
     * not be garbage even when the rotation is particularly difficult to decompose with pitches around +/-90 degrees.)
     * @param orientation {Quat}  A quaternion representing an orientation.
     * @returns {Vec3} 
     */
    function safeEulerAngles(orientation: Quat): Vec3;
    /**
     * Generate a quaternion given an angle to rotate through and an axis to rotate about.
     * @param angle {number}  The angle to rotate through, in degrees.
     * @param axis {Vec3}  The unit axis to rotate about.
     * @returns {Quat} 
     */
    function angleAxis(angle: number, axis: Vec3): Quat;
    /**
     * Get the rotation axis for a quaternion.
     * @param q {Quat}  The quaternion.
     * @returns {Vec3} 
     */
    function axis(q: Quat): Vec3;
    /**
     * Get the rotation angle for a quaternion.
     * @param q {Quat}  The quaternion.
     * @returns {number} 
     */
    function angle(q: Quat): number;
    /**
     * Compute a spherical linear interpolation between two rotations, safely handling two rotations that are very similar.
     * See also,  Quat.slerp.
     * @param q1 {Quat}  The beginning rotation.
     * @param q2 {Quat}  The ending rotation.
     * @param alpha {number}  The mixture coefficient between <code>0.0</code> and <code>1.0</code>. Specifies the proportion
     *     of <code>q2</code>'s value to return in favor of <code>q1</code>'s value. A value of <code>0.0</code> returns     <code>q1</code>'s value; <code>1.0</code> returns <code>q2s</code>'s value.
     * @returns {Quat} 
     */
    function mix(q1: Quat, q2: Quat, alpha: number): Quat;
    /**
     * Compute a spherical linear interpolation between two rotations, for rotations that are not very similar.
     * See also,  Quat.mix.
     * @param q1 {Quat}  The beginning rotation.
     * @param q2 {Quat}  The ending rotation.
     * @param alpha {number}  The mixture coefficient between <code>0.0</code> and <code>1.0</code>. Specifies the proportion
     *     of <code>q2</code>'s value to return in favor of <code>q1</code>'s value. A value of <code>0.0</code> returns    <code>q1</code>'s value; <code>1.0</code> returns <code>q2s</code>'s value.
     * @returns {Quat} 
     */
    function slerp(q1: Quat, q2: Quat, alpha: number): Quat;
    /**
     * Compute a spherical quadrangle interpolation between two rotations along a path oriented toward two other rotations.
     * Equivalent to: Quat.slerp(Quat.slerp(q1, q2, alpha), Quat.slerp(s1, s2, alpha), 2 * alpha * (1.0 - alpha)).
     * @param q1 {Quat}  Initial rotation.
     * @param q2 {Quat}  Final rotation.
     * @param s1 {Quat}  First control point.
     * @param s2 {Quat}  Second control point.
     * @param alpha {number}  The mixture coefficient between <code>0.0</code> and <code>1.0</code>. A value of 
     *     <code>0.0</code> returns <code>q1</code>'s value; <code>1.0</code> returns <code>q2s</code>'s value.
     * @returns {Quat} 
     */
    function squad(q1: Quat, q2: Quat, s1: Quat, s2: Quat, alpha: number): Quat;
    /**
     * Calculate the dot product of two quaternions. The closer the quaternions are to each other the more non-zero the value is
     * (either positive or negative). Identical unit rotations have a dot product of +/- 1.
     * @param q1 {Quat}  The first quaternion.
     * @param q2 {Quat}  The second quaternion.
     * @returns {number} 
     */
    function dot(q1: Quat, q2: Quat): number;
    /**
     * Print to the program log a text label followed by a quaternion's pitch, yaw, and roll Euler angles.
     * @param label {string}  The label to print.
     * @param q {Quat}  The quaternion to print.
     * @param asDegrees {boolean} [asDegrees=false] If <code>true</code> the angle values are printed in degrees, otherwise they are
     *     printed in radians.
     */
    function print(label: string, q: Quat, asDegrees: boolean): void;
    /**
     * Test whether two quaternions are equal. Note: The quaternions must be exactly equal in order for 
     * true to be returned; it is often better to use  Quat.dot and test for closeness to +/-1.
     * @param q1 {Quat}  The first quaternion.
     * @param q2 {Quat}  The second quaternion.
     * @returns {boolean} 
     */
    function equal(q1: Quat, q2: Quat): boolean;
    /**
     * Cancels out the roll and pitch component of a quaternion so that its completely horizontal with a yaw pointing in the 
     * given quaternion's direction.
     * @param orientation {Quat}  A quaternion representing an orientation.
     * @returns {Quat} 
     */
    function cancelOutRollAndPitch(orientation: Quat): Quat;
    /**
     * Cancels out the roll component of a quaternion so that its horizontal axis is level.
     * @param orientation {Quat}  A quaternion representing an orientation.
     * @returns {Quat} 
     */
    function cancelOutRoll(orientation: Quat): Quat;
    /**
     * { x: 0, y: 0, z: 0, w: 1 } : The identity rotation, i.e., no rotation.
     *     Read-only.
     */
    const IDENTITY: Quat;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsAssignment Client Scripts
 */
declare namespace Recording {
    /**
     * @param url {string}  
     * @param callback {Recording~loadRecordingCallback} [callback=null] 
     */
    function loadRecording(url: string, callback: Recording~loadRecordingCallback): void;
    function startPlaying(): void;
    function pausePlayer(): void;
    function stopPlaying(): void;
    /**
     * @returns {boolean} 
     */
    function isPlaying(): boolean;
    /**
     * @returns {boolean} 
     */
    function isPaused(): boolean;
    /**
     * @returns {number} 
     */
    function playerElapsed(): number;
    /**
     * @returns {number} 
     */
    function playerLength(): number;
    /**
     * @param volume {number}  
     */
    function setPlayerVolume(volume: number): void;
    /**
     * @param audioOffset {number}  
     */
    function setPlayerAudioOffset(audioOffset: number): void;
    /**
     * @param time {number}  
     */
    function setPlayerTime(time: number): void;
    /**
     * @param loop {boolean}  
     */
    function setPlayerLoop(loop: boolean): void;
    /**
     * @param useDisplayName {boolean}  
     */
    function setPlayerUseDisplayName(useDisplayName: boolean): void;
    /**
     * @param useAttachments {boolean}  
     */
    function setPlayerUseAttachments(useAttachments: boolean): void;
    /**
     * @param useHeadModel {boolean}  
     */
    function setPlayerUseHeadModel(useHeadModel: boolean): void;
    /**
     * @param useSkeletonModel {boolean}  
     */
    function setPlayerUseSkeletonModel(useSkeletonModel: boolean): void;
    /**
     * @param playFromCurrentLocation {boolean}  
     */
    function setPlayFromCurrentLocation(playFromCurrentLocation: boolean): void;
    /**
     * @returns {boolean} 
     */
    function getPlayerUseDisplayName(): boolean;
    /**
     * @returns {boolean} 
     */
    function getPlayerUseAttachments(): boolean;
    /**
     * @returns {boolean} 
     */
    function getPlayerUseHeadModel(): boolean;
    /**
     * @returns {boolean} 
     */
    function getPlayerUseSkeletonModel(): boolean;
    /**
     * @returns {boolean} 
     */
    function getPlayFromCurrentLocation(): boolean;
    function startRecording(): void;
    function stopRecording(): void;
    /**
     * @returns {boolean} 
     */
    function isRecording(): boolean;
    /**
     * @returns {number} 
     */
    function recorderElapsed(): number;
    /**
     * @returns {string} 
     */
    function getDefaultRecordingSaveDirectory(): string;
    /**
     * @param filename {string}  
     */
    function saveRecording(filename: string): void;
    /**
     * @param getClipAtpUrl {function}  
     */
    function saveRecordingToAsset(getClipAtpUrl: function): void;
    function loadLastRecording(): void;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare class Stage {
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace Scene {
    /**
     * @param shouldRenderAvatars {boolean}  
     * @returns {Signal} 
     */
    function shouldRenderAvatarsChanged(shouldRenderAvatars: boolean): Signal;
    /**
     * @param shouldRenderEntities {boolean}  
     * @returns {Signal} 
     */
    function shouldRenderEntitiesChanged(shouldRenderEntities: boolean): Signal;
    let shouldRenderAvatars: boolean;
    let shouldRenderEntities: boolean;
    let stage: Scene.Stage;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client ScriptsPlays &mdash; "injects" &mdash; the content of an audio file. Used in the  Audio API.
 */
declare class AudioInjector {
    interface AudioInjectorOptions {
        /**
         * The position in the domain to play the sound.
         */
        position: Vec3;
        /**
         * The orientation in the domain to play the sound in.
         */
        orientation: Quat;
        /**
         * Playback volume, between 0.0 and 1.0.
         */
        volume: number;
        /**
         * Alter the pitch of the sound, within +/- 2 octaves. The value is the relative sample rate to 
         *     resample the sound at, range 0.0625 &ndash; 16.0. A value of 0.0625 lowers the     pitch by 2 octaves; 1.0 is no change in pitch; 16.0 raises the pitch by 2 octaves.
         */
        pitch: number;
        /**
         * If true, the sound is played repeatedly until playback is stopped.
         */
        loop: boolean;
        /**
         * Starts playback from a specified time (seconds) within the sound file, &ge; 
         *     0.
         */
        secondOffset: number;
        /**
         * IF true, the sound is played back locally on the client rather than to
         *     others via the audio mixer.
         */
        localOnly: boolean;
        /**
         * Deprecated: This property is deprecated and will be
         *     removed.
         */
        ignorePenumbra: boolean;
    }

    /**
     * Stop current playback, if any, and start playing from the beginning.
     */
    restart(): void;
    /**
     * Stop audio playback.
     */
    stop(): void;
    /**
     * Get the current configuration of the audio injector.
     * @returns {AudioInjector.AudioInjectorOptions} 
     */
    getOptions(): AudioInjector.AudioInjectorOptions;
    /**
     * Configure how the injector plays the audio.
     * @param options {AudioInjector.AudioInjectorOptions}  Configuration of how the injector plays the audio.
     */
    setOptions(options: AudioInjector.AudioInjectorOptions): void;
    /**
     * Get the loudness of the most recent frame of audio played.
     * @returns {number} 
     */
    getLoudness(): number;
    /**
     * Get whether or not the audio is currently playing.
     * @returns {boolean} 
     */
    isPlaying(): boolean;
    /**
     * Triggered when the audio has finished playing.
     * @returns {Signal} 
     */
    finished(): Signal;
    /**
     * Stop audio playback. (Synonym of  AudioInjector.stop.)
     */
    stopInjectorImmediately(): void;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client Scripts
 */
declare namespace Resource {
    interface State {
        /**
         * The resource is queued up, waiting to be loaded.
         */
        QUEUED: number;
        /**
         * The resource is downloading.
         */
        LOADING: number;
        /**
         * The resource has finished downloaded by is not complete.
         */
        LOADED: number;
        /**
         * The resource has completely finished loading and is ready.
         */
        FINISHED: number;
        /**
         * Downloading the resource has failed.
         */
        FAILED: number;
    }

    let State: Resource.State;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client Scripts
 */
declare namespace Script {
    /**
     * Stop the current script.
     * @param marshal {boolean} [marshal=false] 
     */
    function stop(marshal: boolean): void;
    /**
     * @param name {string}  
     * @param object {object}  
     */
    function registerGlobalObject(name: string, object: object): void;
    /**
     * @param name {string}  
     * @param getter {object}  
     * @param setter {object}  
     * @param parent {string} [parent=""] 
     */
    function registerGetterSetter(name: string, getter: object, setter: object, parent: string): void;
    /**
     * @param name {string}  
     * @param function {object}  
     * @param numArguments {number} [numArguments=-1] 
     */
    function registerFunction(name: string, function: object, numArguments: number): void;
    /**
     * @param parent {string}  
     * @param name {string}  
     * @param function {object}  
     * @param numArguments {number} [numArguments=-1] 
     */
    function registerFunction(parent: string, name: string, function: object, numArguments: number): void;
    /**
     * @param name {string}  
     * @param value {object}  
     */
    function registerValue(name: string, value: object): void;
    /**
     * @param program {string}  
     * @param filename {string}  
     * @param lineNumber {number} [lineNumber=-1] 
     * @returns {object} 
     */
    function evaluate(program: string, filename: string, lineNumber: number): object;
    /**
     * @param locals {object}  
     * @param program {object}  
     * @returns {object} 
     */
    function evaluateInClosure(locals: object, program: object): object;
    /**
     * @returns {string} 
     */
    function getContext(): string;
    /**
     * @returns {boolean} 
     */
    function isClientScript(): boolean;
    /**
     * @returns {boolean} 
     */
    function isDebugMode(): boolean;
    /**
     * @returns {boolean} 
     */
    function isEntityClientScript(): boolean;
    /**
     * @returns {boolean} 
     */
    function isEntityServerScript(): boolean;
    /**
     * @returns {boolean} 
     */
    function isAgentScript(): boolean;
    /**
     * @param entityID {Uuid}  
     * @param eventName {string}  
     * @param handler {function}  
     */
    function addEventHandler(entityID: Uuid, eventName: string, handler: function): void;
    /**
     * @param entityID {Uuid}  
     * @param eventName {string}  
     * @param handler {function}  
     */
    function removeEventHandler(entityID: Uuid, eventName: string, handler: function): void;
    /**
     * Start a new Interface or entity script.
     * @param filename {string}  The URL of the script to load. Can be relative to the current script.
     */
    function load(filename: string): void;
    /**
     * Include JavaScript from other files in the current script. If a callback is specified the files are loaded and included 
     * asynchronously, otherwise they are included synchronously (i.e., script execution blocks while the files are included).
     * @param filenames {Array.<string>}  The URLs of the scripts to include. Each can be relative to the current script.
     * @param callback {function} [callback=null] The function to call back when the scripts have been included. Can be an in-line 
     * function or the name of a function.
     */
    function include(filenames: Array.<string>, callback: function): void;
    /**
     * Include JavaScript from another file in the current script. If a callback is specified the file is loaded and included 
     * asynchronously, otherwise it is included synchronously (i.e., script execution blocks while the file is included).
     * @param filename {string}  The URL of the script to include. Can be relative to the current script.
     * @param callback {function} [callback=null] The function to call back when the script has been included. Can be an in-line 
     * function or the name of a function.
     */
    function include(filename: string, callback: function): void;
    /**
     * @param module {string}  
     */
    function require(module: string): void;
    /**
     * @param deleteScriptCache {boolean} [deleteScriptCache=false] 
     */
    function resetModuleCache(deleteScriptCache: boolean): void;
    /**
     * Call a function at a set interval.
     * @param function {function}  The function to call. Can be an in-line function or the name of a function.
     * @param interval {number}  The interval at which to call the function, in ms.
     * @returns {object} 
     */
    function setInterval(function: function, interval: number): object;
    /**
     * Call a function after a delay.
     * @param function {function}  The function to call. Can be an in-line function or the name of a function.
     * @param timeout {number}  The delay after which to call the function, in ms.
     * @returns {object} 
     */
    function setTimeout(function: function, timeout: number): object;
    /**
     * Stop an interval timer set by  Script.setInterval.
     * @param timer {object}  The interval timer to clear.
     */
    function clearInterval(timer: object): void;
    /**
     * Clear a timeout timer set by  Script.setTimeout.
     * @param timer {object}  The timeout timer to clear.
     */
    function clearTimeout(timer: object): void;
    /**
     * @param message {string}  
     */
    function print(message: string): void;
    /**
     * Resolve a relative path to an absolute path.
     * @param path {string}  The relative path to resolve.
     * @returns {string} 
     */
    function resolvePath(path: string): string;
    /**
     * @returns {string} 
     */
    function resourcesPath(): string;
    /**
     * @param label {string}  
     */
    function beginProfileRange(label: string): void;
    /**
     * @param label {string}  
     */
    function endProfileRange(label: string): void;
    /**
     * @param entityID {Uuid}  
     * @returns {boolean} 
     */
    function isEntityScriptRunning(entityID: Uuid): boolean;
    /**
     * @param entityID {Uuid}  
     * @param script {string}  
     * @param forceRedownload {boolean}  
     */
    function loadEntityScript(entityID: Uuid, script: string, forceRedownload: boolean): void;
    /**
     * @param entityID {Uuid}  
     * @param shouldRemoveFromMap {boolean} [shouldRemoveFromMap=false] 
     */
    function unloadEntityScript(entityID: Uuid, shouldRemoveFromMap: boolean): void;
    function unloadAllEntityScripts(): void;
    /**
     * @param entityID {Uuid}  
     * @param methodName {string}  
     * @param parameters {Array.<string>}  
     * @param remoteCallerID {Uuid} [remoteCallerID=Uuid.NULL] 
     */
    function callEntityScriptMethod(entityID: Uuid, methodName: string, parameters: Array.<string>, remoteCallerID: Uuid): void;
    /**
     * @param entityID {Uuid}  
     * @param methodName {string}  
     * @param event {PointerEvent}  
     */
    function callEntityScriptMethod(entityID: Uuid, methodName: string, event: PointerEvent): void;
    /**
     * @param entityID {Uuid}  
     * @param methodName {string}  
     * @param otherID {Uuid}  
     * @param collision {Collision}  
     */
    function callEntityScriptMethod(entityID: Uuid, methodName: string, otherID: Uuid, collision: Collision): void;
    function requestGarbageCollection(): void;
    /**
     * @returns {Uuid} 
     */
    function generateUUID(): Uuid;
    /**
     * @param callback {function}  
     * @param parameters {object}  
     * @param names {Array.<string>}  
     * @param useNames {boolean}  
     * @param resultHandler {object}  
     */
    function callAnimationStateHandler(callback: function, parameters: object, names: Array.<string>, useNames: boolean, resultHandler: object): void;
    /**
     * @param deltaSize {number}  
     */
    function updateMemoryCost(deltaSize: number): void;
    /**
     * @param filename {string}  
     * @returns {Signal} 
     */
    function scriptLoaded(filename: string): Signal;
    /**
     * @param filename {string}  
     * @returns {Signal} 
     */
    function errorLoadingScript(filename: string): Signal;
    /**
     * Triggered regularly at a system-determined frequency.
     * @param deltaTime {number}  The time since the last update, in s.
     * @returns {Signal} 
     */
    function update(deltaTime: number): Signal;
    /**
     * Triggered when the script is ending.
     * @returns {Signal} 
     */
    function scriptEnding(): Signal;
    /**
     * @param filename {string}  
     * @param engine {object}  
     * @returns {Signal} 
     */
    function finished(filename: string, engine: object): Signal;
    /**
     * @param menuItem {string}  
     * @returns {Signal} 
     */
    function cleanupMenuItem(menuItem: string): Signal;
    /**
     * @param message {string}  
     * @param scriptName {string}  
     * @returns {Signal} 
     */
    function printedMessage(message: string, scriptName: string): Signal;
    /**
     * @param message {string}  
     * @param scriptName {string}  
     * @returns {Signal} 
     */
    function errorMessage(message: string, scriptName: string): Signal;
    /**
     * @param message {string}  
     * @param scriptName {string}  
     * @returns {Signal} 
     */
    function warningMessage(message: string, scriptName: string): Signal;
    /**
     * @param message {string}  
     * @param scriptName {string}  
     * @returns {Signal} 
     */
    function infoMessage(message: string, scriptName: string): Signal;
    /**
     * @returns {Signal} 
     */
    function runningStateChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function clearDebugWindow(): Signal;
    /**
     * @param scriptName {string}  
     * @param isUserLoaded {boolean}  
     * @returns {Signal} 
     */
    function loadScript(scriptName: string, isUserLoaded: boolean): Signal;
    /**
     * @param scriptName {string}  
     * @param isUserLoaded {boolean}  
     * @returns {Signal} 
     */
    function reloadScript(scriptName: string, isUserLoaded: boolean): Signal;
    /**
     * @returns {Signal} 
     */
    function doneRunning(): Signal;
    /**
     * @returns {Signal} 
     */
    function entityScriptDetailsUpdated(): Signal;
    /**
     * @returns {Signal} 
     */
    function entityScriptPreloadFinished(): Signal;
    /**
     * @param function {object}  
     * @param type {ConnectionType} [type=2] 
     */
    function executeOnScriptThread(function: object, type: ConnectionType): void;
    /**
     * @param module {string}  
     * @param relativeTo {string} [relativeTo=""] 
     * @returns {string} 
     */
    function _requireResolve(module: string, relativeTo: string): string;
    /**
     * @param entityID {Uuid}  
     * @param scriptOrURL {string}  
     * @param contents {string}  
     * @param isURL {boolean}  
     * @param success {boolean}  
     * @param status {string}  
     */
    function entityScriptContentAvailable(entityID: Uuid, scriptOrURL: string, contents: string, isURL: boolean, success: boolean, status: string): void;
    let context: string;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace ScriptDiscoveryService {
    /**
     * @param filename {string}  
     */
    function loadOneScript(filename: string): void;
    /**
     * @param filename {string} [filename=""] 
     * @param isUserLoaded {boolean} [isUserLoaded=true] 
     * @param loadScriptFromEditor {boolean} [loadScriptFromEditor=false] 
     * @param activateMainWindow {boolean} [activateMainWindow=false] 
     * @param reload {boolean} [reload=false] 
     * @param quitWhenFinished {boolean} [quitWhenFinished=false] 
     * @returns {boolean} 
     */
    function loadScript(filename: string, isUserLoaded: boolean, loadScriptFromEditor: boolean, activateMainWindow: boolean, reload: boolean, quitWhenFinished: boolean): boolean;
    /**
     * @param scriptHash {string}  
     * @param restart {boolean} [restart=false] 
     * @returns {boolean} 
     */
    function stopScript(scriptHash: string, restart: boolean): boolean;
    function reloadAllScripts(): void;
    /**
     * @param restart {boolean} [restart=false] 
     */
    function stopAllScripts(restart: boolean): void;
    /**
     * @returns {Array.<object>} 
     */
    function getRunning(): Array.<object>;
    /**
     * @returns {Array.<object>} 
     */
    function getPublic(): Array.<object>;
    /**
     * @returns {Array.<object>} 
     */
    function getLocal(): Array.<object>;
    /**
     * @returns {Signal} 
     */
    function scriptCountChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function scriptsReloading(): Signal;
    /**
     * @param filename {string}  
     * @param error {string}  
     * @returns {Signal} 
     */
    function scriptLoadError(filename: string, error: string): Signal;
    /**
     * @param message {string}  
     * @param engineName {string}  
     * @returns {Signal} 
     */
    function printedMessage(message: string, engineName: string): Signal;
    /**
     * @param message {string}  
     * @param engineName {string}  
     * @returns {Signal} 
     */
    function errorMessage(message: string, engineName: string): Signal;
    /**
     * @param message {string}  
     * @param engineName {string}  
     * @returns {Signal} 
     */
    function warningMessage(message: string, engineName: string): Signal;
    /**
     * @param message {string}  
     * @param engineName {string}  
     * @returns {Signal} 
     */
    function infoMessage(message: string, engineName: string): Signal;
    /**
     * @param url {string}  
     * @returns {Signal} 
     */
    function errorLoadingScript(url: string): Signal;
    /**
     * @returns {Signal} 
     */
    function clearDebugWindow(): Signal;
    /**
     * @param message {string}  
     * @param scriptName {string}  
     */
    function onPrintedMessage(message: string, scriptName: string): void;
    /**
     * @param message {string}  
     * @param scriptName {string}  
     */
    function onErrorMessage(message: string, scriptName: string): void;
    /**
     * @param message {string}  
     * @param scriptName {string}  
     */
    function onWarningMessage(message: string, scriptName: string): void;
    /**
     * @param message {string}  
     * @param scriptName {string}  
     */
    function onInfoMessage(message: string, scriptName: string): void;
    /**
     * @param url {string}  
     */
    function onErrorLoadingScript(url: string): void;
    function onClearDebugWindow(): void;
    /**
     * @param filename {string}  
     * @param engine {object}  
     */
    function onScriptFinished(filename: string, engine: object): void;
    let debugScriptUrl: string;
    let defaultScriptsPath: string;
    let scriptsModel: ScriptsModel;
    let scriptsModelFilter: ScriptsModelFilter;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsProvided as a property of  ScriptDiscoveryService.
 * Has properties and functions below in addition to those of http://doc.qt.io/qt-5/qabstractitemmodel.html.
 */
declare class ScriptsModel {
    /**
     * @param row {number}  
     * @param column {number}  
     * @param parent {QModelIndex}  
     * @returns {QModelIndex} 
     */
    index(row: number, column: number, parent: QModelIndex): QModelIndex;
    /**
     * @param child {QModelIndex}  
     * @returns {QModelIndex} 
     */
    parent(child: QModelIndex): QModelIndex;
    /**
     * @param index {QModelIndex}  
     * @param role {number} [role=0] returns {string}
     */
    data(index: QModelIndex, role: number): void;
    /**
     * @param parent {QmodelIndex} [parent=null] 
     * @returns {number} 
     */
    rowCount(parent: QmodelIndex): number;
    /**
     * @param parent {QmodelIndex} [parent=null] 
     * @returns {number} 
     */
    columnCount(parent: QmodelIndex): number;
    /**
     * @param index {QmodelIndex}  
     * @returns {TreeNodeBase} 
     */
    getTreeNodeFromIndex(index: QmodelIndex): TreeNodeBase;
    /**
     * @param parent {TreeNodeFolder}  
     * @returns {Array.<TreeNodeBase>} 
     */
    getFolderNodes(parent: TreeNodeFolder): Array.<TreeNodeBase>;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsProvided as a property of  ScriptDiscoveryService.
 * Has properties and functions per http://doc.qt.io/qt-5/qsortfilterproxymodel.html.
 */
declare class ScriptsModelFilter {
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client ScriptsA UUID (Universally Unique IDentifier) is used to uniquely identify entities, overlays, avatars, and the like. It is
 * represented in JavaScript as a string in the format, {nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn}, where the "n"s arehexadecimal digits.
 */
declare namespace Uuid {
    /**
     * Generates a UUID from a string representation of the UUID.
     * @param string {string}  A string representation of a UUID. The curly braces are optional.
     * @returns {Uuid} 
     */
    function fromString(string: string): Uuid;
    /**
     * Generates a string representation of a UUID. However, because UUIDs are represented in JavaScript as strings, this is in
     * effect a no-op.
     * @param id {Uuid}  The UUID to generate a string from.
     * @returns {string} 
     */
    function toString(id: Uuid): string;
    /**
     * Generate a new UUID.
     * @returns {Uuid} 
     */
    function generate(): Uuid;
    /**
     * Test whether two given UUIDs are equal.
     * @param idA {Uuid}  The first UUID to compare.
     * @param idB {Uuid}  The second UUID to compare.
     * @returns {boolean} 
     */
    function isEqual(idA: Uuid, idB: Uuid): boolean;
    /**
     * Test whether a given UUID is null.
     * @param id {Uuid}  The UUID to test.
     * @returns {boolean} 
     */
    function isNull(id: Uuid): boolean;
    /**
     * Print to the program log a text label followed by the UUID value.
     * @param label {string}  The label to print.
     * @param id {Uuid}  The UUID to print.
     */
    function print(label: string, id: Uuid): void;
    /**
     * The null UUID, {00000000-0000-0000-0000-000000000000}.
     */
    const NULL: Uuid;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsAssignment Client Scripts
 */
declare namespace Users {
    /**
     * Personally ignore another user, making them disappear for you and you disappear for them.
     * @param nodeID {Uuid}  The node or session ID of the user you want to ignore.
     * @param enable {boolean}  True for ignored; false for un-ignored.
     */
    function ignore(nodeID: Uuid, enable: boolean): void;
    /**
     * Get whether or not you have ignored the node with the given UUID.
     * @param nodeID {Uuid}  The node or session ID of the user whose ignore status you want.
     * @returns {boolean} 
     */
    function getIgnoreStatus(nodeID: Uuid): boolean;
    /**
     * Mute another user for you and you only. They won't be able to hear you, and you won't be able to hear them.
     * @param nodeID {Uuid}  The node or session ID of the user you want to mute.
     * @param muteEnabled {boolean}  True for enabled; false for disabled.
     */
    function personalMute(nodeID: Uuid, muteEnabled: boolean): void;
    /**
     * Get whether or not you have personally muted the node with the given UUID.
     * @param nodeID {Uuid}  The node or session ID of the user whose personal mute status you want.
     * @returns {boolean} 
     */
    function requestPersonalMuteStatus(nodeID: Uuid): boolean;
    /**
     * Sets an avatar's gain for you and you only.
     * Units are Decibels (dB)
     * @param nodeID {Uuid}  The node or session ID of the user whose gain you want to modify, or null to set the master gain.
     * @param gain {number}  The gain of the avatar you'd like to set. Units are dB.
     */
    function setAvatarGain(nodeID: Uuid, gain: number): void;
    /**
     * Gets an avatar's gain for you and you only.
     * @param nodeID {Uuid}  The node or session ID of the user whose gain you want to get, or null to get the master gain.
     * @returns {number} 
     */
    function getAvatarGain(nodeID: Uuid): number;
    /**
     * Kick/ban another user. Removes them from the server and prevents them from returning. Bans by either user name (if 
     * available) or machine fingerprint otherwise. This will only do anything if you're an admin of the domain you're in.
     * @param nodeID {Uuid}  The node or session ID of the user you want to kick.
     */
    function kick(nodeID: Uuid): void;
    /**
     * Mutes another user's microphone for everyone. Not permanent; the silenced user can unmute themselves with the UNMUTE 
     * button in their HUD. This will only do anything if you're an admin of the domain you're in.
     * @param nodeID {Uuid}  The node or session ID of the user you want to mute.
     */
    function mute(nodeID: Uuid): void;
    /**
     * Request the user name and machine fingerprint associated with the given UUID. The user name will be returned in a 
     *  Users.usernameFromIDReply signal. This will only do anything if you're an admin of the domain you're in.
     * @param nodeID {Uuid}  The node or session ID of the user whose user name you want.
     */
    function requestUsernameFromID(nodeID: Uuid): void;
    /**
     * Returns `true` if the DomainServer will allow this Node/Avatar to make kick.
     * @returns {boolean} 
     */
    function getCanKick(): boolean;
    /**
     * Toggle the state of the space bubble feature.
     */
    function toggleIgnoreRadius(): void;
    /**
     * Enables the space bubble feature.
     */
    function enableIgnoreRadius(): void;
    /**
     * Disables the space bubble feature.
     */
    function disableIgnoreRadius(): void;
    /**
     * Returns `true` if the space bubble feature is enabled.
     * @returns {boolean} 
     */
    function getIgnoreRadiusEnabled(): boolean;
    /**
     * @param canKick {boolean}  
     * @returns {Signal} 
     */
    function canKickChanged(canKick: boolean): Signal;
    /**
     * @param isEnabled {boolean}  
     * @returns {Signal} 
     */
    function ignoreRadiusEnabledChanged(isEnabled: boolean): Signal;
    /**
     * Notifies scripts that another user has entered the ignore radius.
     * @returns {Signal} 
     */
    function enteredIgnoreRadius(): Signal;
    /**
     * Triggered in response to a  Users.requestUsernameFromID call. Provides the user name and 
     * machine fingerprint associated with a UUID.Username and machineFingerprint will be their default constructor output if the requesting user isn't an admin.
     * @param nodeID {Uuid}  
     * @param userName {string}  
     * @param machineFingerprint {string}  
     * @param isAdmin {boolean}  
     * @returns {Signal} 
     */
    function usernameFromIDReply(nodeID: Uuid, userName: string, machineFingerprint: string, isAdmin: boolean): Signal;
    /**
     * Notifies scripts that a user has disconnected from the domain.
     * @param nodeID {Uuid}  The session ID of the avatar that has disconnected.
     * @returns {Signal} 
     */
    function avatarDisconnected(nodeID: Uuid): Signal;
    /**
     * true if the domain server allows the node or avatar to kick (ban) avatars,
     *     otherwise false. Read-only.
     */
    let canKick: boolean;
    /**
     * true if the avatar requests extra data from the mixers (such as 
     *     positional data of an avatar you've ignored). Read-only.
     */
    let requestsDomainListData: boolean;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client ScriptsThe Vec3 API facilities for generating and manipulating 3-dimensional vectors. High Fidelity uses a right-handed 
 * Cartesian coordinate system where the y-axis is the "up" and the negative z-axis is the "front" direction.
 */
declare namespace Vec3 {
    /**
     * Calculate the reflection of a vector in a plane.
     * @param v {Vec3}  The vector to reflect.
     * @param normal {Vec3}  The normal of the plane.
     * @returns {Vec3} 
     */
    function reflect(v: Vec3, normal: Vec3): Vec3;
    /**
     * Calculate the cross product of two vectors.
     * @param v1 {Vec3}  The first vector.
     * @param v2 {Vec3}  The second vector.
     * @returns {Vec3} 
     */
    function cross(v1: Vec3, v2: Vec3): Vec3;
    /**
     * Calculate the dot product of two vectors.
     * @param v1 {Vec3}  The first vector.
     * @param v2 {Vec3}  The second vector.
     * @returns {number} 
     */
    function dot(v1: Vec3, v2: Vec3): number;
    /**
     * Multiply a vector by a scale factor.
     * @param v {Vec3}  The vector.
     * @param scale {number}  The scale factor.
     * @returns {Vec3} 
     */
    function multiply(v: Vec3, scale: number): Vec3;
    /**
     * Multiply a vector by a scale factor.
     * @param scale {number}  The scale factor.
     * @param v {Vec3}  The vector.
     * @returns {Vec3} 
     */
    function multiply(scale: number, v: Vec3): Vec3;
    /**
     * Multiply two vectors.
     * @param v1 {Vec3}  The first vector.
     * @param v2 {Vec3}  The second vector.
     * @returns {Vec3} 
     */
    function multiplyVbyV(v1: Vec3, v2: Vec3): Vec3;
    /**
     * Rotate a vector.
     * @param q {Quat}  The rotation to apply.
     * @param v {Vec3}  The vector to rotate.
     * @returns {Vec3} 
     */
    function multiplyQbyV(q: Quat, v: Vec3): Vec3;
    /**
     * Calculate the sum of two vectors.
     * @param v1 {Vec3}  The first vector.
     * @param v2 {Vec3}  The second vector.
     * @returns {Vec3} 
     */
    function sum(v1: Vec3, v2: Vec3): Vec3;
    /**
     * Calculate one vector subtracted from another.
     * @param v1 {Vec3}  The first vector.
     * @param v2 {Vec3}  The second vector.
     * @returns {Vec3} 
     */
    function subtract(v1: Vec3, v2: Vec3): Vec3;
    /**
     * Calculate the length of a vector
     * @param v {Vec3}  The vector.
     * @returns {number} 
     */
    function length(v: Vec3): number;
    /**
     * Calculate the distance between two points.
     * @param p1 {Vec3}  The first point.
     * @param p2 {Vec3}  The second point.
     * @returns {number} 
     */
    function distance(p1: Vec3, p2: Vec3): number;
    /**
     * Calculate the angle of rotation from one vector onto another, with the sign depending on a reference vector.
     * @param v1 {Vec3}  The first vector.
     * @param v2 {Vec3}  The second vector.
     * @param ref {Vec3}  Reference vector.
     * @returns {number} 
     */
    function orientedAngle(v1: Vec3, v2: Vec3, ref: Vec3): number;
    /**
     * Normalize a vector so that its length is 1.
     * @param v {Vec3}  The vector to normalize.
     * @returns {Vec3} 
     */
    function normalize(v: Vec3): Vec3;
    /**
     * Calculate a linear interpolation between two vectors.
     * @param v1 {Vec3}  The first vector.
     * @param v2 {Vec3}  The second vector.
     * @param factor {number}  The interpolation factor in the range <code>0.0</code> to <code>1.0</code>.
     * @returns {Vec3} 
     */
    function mix(v1: Vec3, v2: Vec3, factor: number): Vec3;
    /**
     * Print to the program log a text label followed by a vector value.
     * @param label {string}  The label to print.
     * @param v {Vec3}  The vector value to print.
     */
    function print(label: string, v: Vec3): void;
    /**
     * Test whether two vectors are equal. Note: The vectors must be exactly equal in order for 
     * true to be returned; it is often better to use  Vec3.withinEpsilon.
     * @param v1 {Vec3}  The first vector.
     * @param v2 {Vec3}  The second vector.
     * @returns {boolean} 
     */
    function equal(v1: Vec3, v2: Vec3): boolean;
    /**
     * Test whether two vectors are equal within a tolerance. Note: It is often better to use this function 
     * than  Vec3.equal.
     * @param v1 {Vec3}  The first vector.
     * @param v2 {Vec3}  The second vector.
     * @param epsilon {number}  The maximum distance between the two vectors.
     * @returns {boolean} 
     */
    function withinEpsilon(v1: Vec3, v2: Vec3, epsilon: number): boolean;
    /**
     * Calculate polar coordinates (elevation, azimuth, radius) that transform the unit z-axis vector onto a point.
     * @param p {Vec3}  The point to calculate the polar coordinates for.
     * @returns {Vec3} 
     */
    function toPolar(p: Vec3): Vec3;
    /**
     * Calculate the coordinates of a point from polar coordinate transformation of the unit z-axis vector.
     * @param polar {Vec3}  The polar coordinates of a point: <code>x</code> elevation rotation about the x-axis in radians, 
     *    <code>y</code> azimuth rotation about the y-axis in radians, and <code>z</code> scale.
     * @returns {Vec3} 
     */
    function fromPolar(polar: Vec3): Vec3;
    /**
     * Calculate the unit vector corresponding to polar coordinates elevation and azimuth transformation of the unit z-axis 
     * vector.
     * @param elevation {number}  Rotation about the x-axis, in radians.
     * @param azimuth {number}  Rotation about the y-axis, in radians.
     * @returns {Vec3} 
     */
    function fromPolar(elevation: number, azimuth: number): Vec3;
    /**
     * Calculate the angle between two vectors.
     * @param v1 {Vec3}  The first vector.
     * @param v2 {Vec3}  The second vector.
     * @returns {number} 
     */
    function getAngle(v1: Vec3, v2: Vec3): number;
    /**
     * { x: 1, y: 0, z: 0 } : Unit vector in the x-axis direction. Read-only.
     */
    const UNIT_X: Vec3;
    /**
     * { x: 0, y: 1, z: 0 } : Unit vector in the y-axis direction. Read-only.
     */
    const UNIT_Y: Vec3;
    /**
     * { x: 0, y: 0, z: 1 } : Unit vector in the z-axis direction. Read-only.
     */
    const UNIT_Z: Vec3;
    /**
     * { x: -1, y: 0, z: 0 } : Unit vector in the negative x-axis direction. 
     *     Read-only.
     */
    const UNIT_NEG_X: Vec3;
    /**
     * { x: 0, y: -1, z: 0 } : Unit vector in the negative y-axis direction. 
     *     Read-only.
     */
    const UNIT_NEG_Y: Vec3;
    /**
     * { x: 0, y: 0, z: -1 } : Unit vector in the negative z-axis direction. 
     *     Read-only.
     */
    const UNIT_NEG_Z: Vec3;
    /**
     * { x: 0.707107, y: 0.707107, z: 0 } : Unit vector in the direction of the diagonal 
     *     between the x and y axes. Read-only.
     */
    const UNIT_XY: Vec3;
    /**
     * { x: 0.707107, y: 0, z: 0.707107 } : Unit vector in the direction of the diagonal 
     *     between the x and z axes. Read-only.
     */
    const UNIT_XZ: Vec3;
    /**
     * { x: 0, y: 0.707107, z: 0.707107 } : Unit vector in the direction of the diagonal 
     *     between the y and z axes. Read-only.
     */
    const UNIT_YZ: Vec3;
    /**
     * { x: 0.577350, y: 0.577350, z: 0.577350 } : Unit vector in the direction of the 
     *     diagonal between the x, y, and z axes. Read-only.
     */
    const UNIT_XYZ: Vec3;
    /**
     * { x: 3.402823e+38, y: 3.402823e+38, z: 3.402823e+38 } : Vector with all axis 
     *     values set to the maximum floating point value. Read-only.
     */
    const FLOAT_MAX: Vec3;
    /**
     * { x: -3.402823e+38, y: -3.402823e+38, z: -3.402823e+38 } : Vector with all axis 
     *     values set to the negative of the maximum floating point value. Read-only.
     */
    const FLOAT_MIN: Vec3;
    /**
     * { x: 0, y: 0, z: 0 } : Vector with all axis values set to 0. 
     *     Read-only.
     */
    const ZERO: Vec3;
    /**
     * { x: 1, y: 1, z: 1 } : Vector with all axis values set to 1. 
     *     Read-only.
     */
    const ONE: Vec3;
    /**
     * { x: 2, y: 2, z: 2 } : Vector with all axis values set to 2. 
     *     Read-only.
     */
    const TWO: Vec3;
    /**
     * { x: 0.5, y: 0.5, z: 0.5 } : Vector with all axis values set to 0.5. 
     *     Read-only.
     */
    const HALF: Vec3;
    /**
     * { x: 1, y: 0, z: 0 } : Unit vector in the "right" direction. Synonym for 
     *     UNIT_X. Read-only.
     */
    const RIGHT: Vec3;
    /**
     * { x: 0, y: 1, z: 0 } : Unit vector in the "up" direction. Synonym for 
     *     UNIT_Y. Read-only.
     */
    const UP: Vec3;
    /**
     * { x: 0, y: 0, z: -1 } : Unit vector in the "front" direction. Synonym for 
     *     UNIT_NEG_Z. Read-only.
     */
    const FRONT: Vec3;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client ScriptsHelper functions to render ephemeral debug markers and lines.
 * DebugDraw markers and lines are only visible locally, they are not visible by other users.
 */
declare namespace DebugDraw {
    /**
     * Draws a line in world space, but it will only be visible for a single frame.
     * @param start {Vec3}  start position of line in world space.
     * @param end {Vec3}  end position of line in world space.
     * @param color {Vec4}  color of line, each component should be in the zero to one range.  x = red, y = blue, z = green, w = alpha.
     */
    function drawRay(start: Vec3, end: Vec3, color: Vec4): void;
    /**
     * Adds a debug marker to the world. This marker will be drawn every frame until it is removed with DebugDraw.removeMarker.
     * This can be called repeatedly to change the position of the marker.
     * @param key {string}  name to uniquely identify this marker, later used for DebugDraw.removeMarker.
     * @param rotation {Quat}  start position of line in world space.
     * @param position {Vec3}  position of the marker in world space.
     * @param color {Vec4}  color of the marker.
     */
    function addMarker(key: string, rotation: Quat, position: Vec3, color: Vec4): void;
    /**
     * Removes debug marker from the world.  Once a marker is removed, it will no longer be visible.
     * @param key {string}  name of marker to remove.
     */
    function removeMarker(key: string): void;
    /**
     * Adds a debug marker to the world, this marker will be drawn every frame until it is removed with DebugDraw.removeMyAvatarMarker.
     * This can be called repeatedly to change the position of the marker.
     * @param key {string}  name to uniquely identify this marker, later used for DebugDraw.removeMyAvatarMarker.
     * @param rotation {Quat}  start position of line in avatar space.
     * @param position {Vec3}  position of the marker in avatar space.
     * @param color {Vec4}  color of the marker.
     */
    function addMyAvatarMarker(key: string, rotation: Quat, position: Vec3, color: Vec4): void;
    /**
     * Removes debug marker from the world.  Once a marker is removed, it will no longer be visible
     * @param key {string}  name of marker to remove.
     */
    function removeMyAvatarMarker(key: string): void;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe Paths API provides absolute paths to the scripts and resources directories.
 */
declare namespace Paths {
    /**
     * The path to the scripts directory. Read-only.
     */
    let defaultScripts: string;
    /**
     * The path to the resources directory. Read-only.
     */
    let resources: string;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsServer Entity ScriptsAssignment Client ScriptsA handle for a mesh in an entity, such as returned by  Entities.getMeshes.
 */
declare class MeshProxy {
    /**
     * Get the number of vertices in the mesh.
     * @returns {number} 
     */
    getNumVertices(): number;
    /**
     * Get the position of a vertex in the mesh.
     * @param index {number}  Integer index of the mesh vertex.
     * @returns {Vec3} 
     */
    getPos(index: number): Vec3;
}

/**
 * Available in:Interface ScriptsClient Entity ScriptsThe Camera API provides access to the "camera" that defines your view in desktop and HMD display modes.
 */
declare namespace Camera {
    /**
     * Get the ID of the entity that the camera is set to use the position and orientation from when it's in entity mode. You can
     *     also get the entity ID using the Camera.cameraEntity property.
     * @returns {Uuid} 
     */
    function getCameraEntity(): Uuid;
    /**
     * Set the entity that the camera should use the position and orientation from when it's in entity mode. You can also set the
     *     entity using the Camera.cameraEntity property.
     * @param entityID {Uuid}  The entity that the camera should follow when it's in entity mode.
     */
    function setCameraEntity(entityID: Uuid): void;
    /**
     * Get the current camera mode. You can also get the mode using the Camera.mode property.
     * @returns {Camera.Mode} 
     */
    function getModeString(): Camera.Mode;
    /**
     * Set the camera mode. You can also set the mode using the Camera.mode property.
     * @param mode {Camera.Mode}  The mode to set the camera to.
     */
    function setModeString(mode: Camera.Mode): void;
    /**
     * Get the current camera position. You can also get the position using the Camera.position property.
     * @returns {Vec3} 
     */
    function getPosition(): Vec3;
    /**
     * Set the camera position. You can also set the position using the Camera.position property. Only works if the
     *     camera is in independent mode.
     * @param position {Vec3}  The position to set the camera at.
     */
    function setPosition(position: Vec3): void;
    /**
     * Get the current camera orientation. You can also get the orientation using the Camera.orientation property.
     * @returns {Quat} 
     */
    function getOrientation(): Quat;
    /**
     * Set the camera orientation. You can also set the orientation using the Camera.orientation property. Only
     *     works if the camera is in independent mode.
     * @param orientation {Quat}  The orientation to set the camera to.
     */
    function setOrientation(orientation: Quat): void;
    /**
     * Compute a  PickRay based on the current camera configuration and the specified x, y position on the 
     *     screen. The  PickRay can be used in functions such as  Entities.findRayIntersection and      Overlays.findRayIntersection.
     * @param x {number}  X-coordinate on screen.
     * @param y {number}  Y-coordinate on screen.
     * @returns {PickRay} 
     */
    function computePickRay(x: number, y: number): PickRay;
    /**
     * Rotate the camera to look at the specified position. Only works if the camera is in independent mode.
     * @param position {Vec3}  Position to look at.
     */
    function lookAt(position: Vec3): void;
    /**
     * Set the camera to continue looking at the specified position even while the camera moves. Only works if the 
     * camera is in independent mode.
     * @param position {Vec3}  Position to keep looking at.
     */
    function keepLookingAt(position: Vec3): void;
    /**
     * Stops the camera from continually looking at the position that was set with Camera.keepLookingAt.
     */
    function stopLookingAt(): void;
    /**
     * Triggered when the camera mode changes.
     * @param newMode {Camera.Mode}  The new camera mode.
     * @returns {Signal} 
     */
    function modeUpdated(newMode: Camera.Mode): Signal;
    /**
     * The position of the camera. You can set this value only when the camera is in independent 
     *     mode.
     */
    let position: Vec3;
    /**
     * The orientation of the camera. You can set this value only when the camera is in 
     *     independent mode.
     */
    let orientation: Quat;
    /**
     * The camera mode.
     */
    let mode: Camera.Mode;
    /**
     * The camera frustum.
     */
    let frustum: ViewFrustum;
    /**
     * The ID of the entity that is used for the camera position and orientation when the 
     *     camera is in entity mode.
     */
    let cameraEntity: Uuid;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace Render {
    /**
     * @returns {string} 
     */
    function toJSON(): string;
    /**
     * @param map {object}  
     */
    function load(map: object): void;
    /**
     * @returns {boolean} 
     */
    function isTask(): boolean;
    /**
     * @returns {Array.<object>} 
     */
    function getSubConfigs(): Array.<object>;
    /**
     * @returns {number} 
     */
    function getNumSubs(): number;
    /**
     * @param index {number}  
     * @returns {object} 
     */
    function getSubConfig(index: number): object;
    /**
     * @param map {object}  
     */
    function load(map: object): void;
    /**
     * @returns {Signal} 
     */
    function loaded(): Signal;
    /**
     * @returns {Signal} 
     */
    function newStats(): Signal;
    /**
     * @returns {Signal} 
     */
    function dirtyEnabled(): Signal;
    /**
     * @param name {string}  
     * @returns {object} 
     */
    function getConfig(name: string): object;
    function refresh(): void;
    /**
     * Read-only.
     */
    let cpuRunTime: number;
    let enabled: boolean;
}

/**
 * Available in:Interface Scripts
 */
declare class InteractiveWindow {
    /**
     * @param message {object}  
     */
    sendToQml(message: object): void;
    /**
     * @param message {object}  
     */
    emitScriptEvent(message: object): void;
    /**
     * @param message {object}  
     */
    emitWebEvent(message: object): void;
    close(): void;
    show(): void;
    raise(): void;
    /**
     * @returns {Signal} 
     */
    visibleChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    positionChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    sizeChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    presentationModeChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    titleChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    closed(): Signal;
    /**
     * @param message {object}  
     * @returns {Signal} 
     */
    fromQml(message: object): Signal;
    /**
     * @param message {object}  
     * @returns {Signal} 
     */
    scriptEventReceived(message: object): Signal;
    /**
     * @param message {object}  
     * @returns {Signal} 
     */
    webEventReceived(message: object): Signal;
    /**
     * @param message {object}  
     * @returns {Signal} 
     */
    qmlToScript(message: object): Signal;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace OffscreenFlags {
    /**
     * @returns {Signal} 
     */
    function navigationFocusedChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    function navigationFocusDisabledChanged(): Signal;
    let navigationFocused: boolean;
    let navigationFocusDisabled: boolean;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 * @param properties {OverlayWindow.Properties} [properties=null] 
 */
declare class OverlayWebWindow {
    /**
     * @returns {string} 
     */
    getURL(): string;
    /**
     * @param url {string}  
     */
    setURL(url: string): void;
    /**
     * @param script {string}  
     */
    setScriptURL(script: string): void;
    /**
     * @returns {Signal} 
     */
    urlChanged(): Signal;
    /**
     * @param properties {OverlayWindow.Properties}  
     */
    initQml(properties: OverlayWindow.Properties): void;
    /**
     * @returns {boolean} 
     */
    isVisible(): boolean;
    /**
     * @param visible {boolean}  
     */
    setVisible(visible: boolean): void;
    /**
     * @returns {Vec2} 
     */
    getPosition(): Vec2;
    /**
     * @param position {Vec2}  
     */
    setPosition(position: Vec2): void;
    /**
     * @param x {number}  
     * @param y {number}  
     */
    setPosition(x: number, y: number): void;
    /**
     * @returns {Vec2} 
     */
    getSize(): Vec2;
    /**
     * @param size {Vec2}  
     */
    setSize(size: Vec2): void;
    /**
     * @param width {number}  
     * @param height {number}  
     */
    setSize(width: number, height: number): void;
    /**
     * @param title {string}  
     */
    setTitle(title: string): void;
    raise(): void;
    close(): void;
    /**
     * @returns {object} 
     */
    getEventBridge(): object;
    /**
     * @param message {object}  
     */
    sendToQml(message: object): void;
    clearDebugWindow(): void;
    /**
     * @param message {object}  
     */
    emitScriptEvent(message: object): void;
    /**
     * @param message {object}  
     */
    emitWebEvent(message: object): void;
    /**
     * @returns {Signal} 
     */
    visibleChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    positionChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    sizeChanged(): Signal;
    /**
     * @param position {Vec2}  
     * @returns {Signal} 
     */
    moved(position: Vec2): Signal;
    /**
     * @param size {Size}  
     * @returns {Signal} 
     */
    resized(size: Size): Signal;
    /**
     * @returns {Signal} 
     */
    closed(): Signal;
    /**
     * @param message {object}  
     * @returns {Signal} 
     */
    fromQml(message: object): Signal;
    /**
     * @param message {object}  
     * @returns {Signal} 
     */
    scriptEventReceived(message: object): Signal;
    /**
     * @param message {object}  
     * @returns {Signal} 
     */
    webEventReceived(message: object): Signal;
    /**
     * @param position {Vec2}  
     * @returns {Signal} 
     */
    hasMoved(position: Vec2): Signal;
    /**
     * @returns {Signal} 
     */
    hasClosed(): Signal;
    /**
     * @param message {object}  
     * @returns {Signal} 
     */
    qmlToScript(message: object): Signal;
}

/**
 * Available in:Interface Scripts
 * @param properties {OverlayWindow.Properties} [properties=null] 
 */
declare class OverlayWindow {
    interface Properties {
        title: string;
        source: string;
        width: number;
        height: number;
        visible: boolean;
    }

    /**
     * @param properties {OverlayWindow.Properties}  
     */
    initQml(properties: OverlayWindow.Properties): void;
    /**
     * @returns {boolean} 
     */
    isVisible(): boolean;
    /**
     * @param visible {boolean}  
     */
    setVisible(visible: boolean): void;
    /**
     * @returns {Vec2} 
     */
    getPosition(): Vec2;
    /**
     * @param position {Vec2}  
     */
    setPosition(position: Vec2): void;
    /**
     * @param x {number}  
     * @param y {number}  
     */
    setPosition(x: number, y: number): void;
    /**
     * @returns {Vec2} 
     */
    getSize(): Vec2;
    /**
     * @param size {Vec2}  
     */
    setSize(size: Vec2): void;
    /**
     * @param width {number}  
     * @param height {number}  
     */
    setSize(width: number, height: number): void;
    /**
     * @param title {string}  
     */
    setTitle(title: string): void;
    raise(): void;
    close(): void;
    /**
     * @returns {object} 
     */
    getEventBridge(): object;
    /**
     * @param message {object}  
     */
    sendToQml(message: object): void;
    clearDebugWindow(): void;
    /**
     * @param message {object}  
     */
    emitScriptEvent(message: object): void;
    /**
     * @param message {object}  
     */
    emitWebEvent(message: object): void;
    /**
     * @returns {Signal} 
     */
    visibleChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    positionChanged(): Signal;
    /**
     * @returns {Signal} 
     */
    sizeChanged(): Signal;
    /**
     * @param position {Vec2}  
     * @returns {Signal} 
     */
    moved(position: Vec2): Signal;
    /**
     * @param size {Size}  
     * @returns {Signal} 
     */
    resized(size: Size): Signal;
    /**
     * @returns {Signal} 
     */
    closed(): Signal;
    /**
     * @param message {object}  
     * @returns {Signal} 
     */
    fromQml(message: object): Signal;
    /**
     * @param message {object}  
     * @returns {Signal} 
     */
    scriptEventReceived(message: object): Signal;
    /**
     * @param message {object}  
     * @returns {Signal} 
     */
    webEventReceived(message: object): Signal;
    /**
     * @param position {Vec2}  
     * @returns {Signal} 
     */
    hasMoved(position: Vec2): Signal;
    /**
     * @returns {Signal} 
     */
    hasClosed(): Signal;
    /**
     * @param message {object}  
     * @returns {Signal} 
     */
    qmlToScript(message: object): Signal;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace Tablet {
    /**
     * Creates or returns a new TabletProxy and returns it.
     * @param name {string}  Tablet name.
     * @returns {TabletProxy} 
     */
    function getTablet(name: string): TabletProxy;
    /**
     * @param sound {Tablet.AudioEvents}  
     */
    function playSound(sound: Tablet.AudioEvents): void;
    /**
     * Triggered when a tablet message or dialog is created.
     * @returns {Signal} 
     */
    function tabletNotification(): Signal;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace tabletInterface {
    /**
     * Creates or returns a new TabletProxy and returns it.
     * @param name {string}  Tablet name.
     * @returns {TabletProxy} 
     */
    function getTablet(name: string): TabletProxy;
    /**
     * @param sound {Tablet.AudioEvents}  
     */
    function playSound(sound: Tablet.AudioEvents): void;
    /**
     * Triggered when a tablet message or dialog is created.
     * @returns {Signal} 
     */
    function tabletNotification(): Signal;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare class TabletProxy {
    interface ButtonList {
    }

    /**
     * @param submenu {string} [submenu=""] 
     */
    gotoMenuScreen(submenu: string): void;
    /**
     * @param url {string}  
     */
    initialScreen(url: string): void;
    /**
     * Transition to the home screen.
     */
    gotoHomeScreen(): void;
    /**
     * Show the specified Web url on the tablet.
     * @param url {string}  URL of web page.
     * @param injectedJavaScriptUrl {string} [injectedJavaScriptUrl=""] URL to an additional JS script to inject into the web page.
     * @param loadOtherBase {boolean} [loadOtherBase=false] 
     */
    gotoWebScreen(url: string, injectedJavaScriptUrl: string, loadOtherBase: boolean): void;
    /**
     * @param path {string}  
     * @param resizable {boolean} [resizable=false] 
     */
    loadQMLSource(path: string, resizable: boolean): void;
    /**
     * @param path {string}  
     * @returns {boolean} 
     */
    pushOntoStack(path: string): boolean;
    popFromStack(): void;
    /**
     * @param path {string}  
     */
    loadQMLOnTop(path: string): void;
    /**
     * @param path {string}  
     * @param injectedJavaScriptURL {string} [injectedJavaScriptURL=""] 
     */
    loadWebScreenOnTop(path: string, injectedJavaScriptURL: string): void;
    returnToPreviousApp(): void;
    /**
     * Check if the tablet has a message dialog open.
     * @returns {boolean} 
     */
    isMessageDialogOpen(): boolean;
    /**
     * Close any open dialogs.
     */
    closeDialog(): void;
    /**
     * Creates a new button, adds it to this and returns it.
     * @param properties {object}  Button properties.
     * @returns {TabletButtonProxy} 
     */
    addButton(properties: object): TabletButtonProxy;
    /**
     * Removes a button from the tablet.
     * @param button {TabletButtonProxy}  The button to be removed
     */
    removeButton(button: TabletButtonProxy): void;
    /**
     * Used to send an event to the HTML/JavaScript embedded in the tablet.
     * @param message {object}  
     */
    emitScriptEvent(message: object): void;
    /**
     * Used to send an event to the QML embedded in the tablet.
     * @param message {object}  
     */
    sendToQml(message: object): void;
    /**
     * Check if the tablet is on the home screen.
     * @returns {boolean} 
     */
    onHomeScreen(): boolean;
    /**
     * Set tablet into or out of landscape mode.
     * @param landscape {boolean}  <code>true</code> for landscape, <ode>false</code> for portrait.
     */
    setLandscape(landscape: boolean): void;
    /**
     * @returns {boolean} 
     */
    getLandscape(): boolean;
    /**
     * @param path {string}  
     * @returns {boolean} 
     */
    isPathLoaded(path: string): boolean;
    /**
     * Signaled when this tablet receives an event from the html/js embedded in the tablet.
     * @param message {object}  
     * @returns {Signal} 
     */
    webEventReceived(message: object): Signal;
    /**
     * Signaled when this tablet receives an event from the qml embedded in the tablet.
     * @param message {object}  
     * @returns {Signal} 
     */
    fromQml(message: object): Signal;
    /**
     * Signaled when this tablet screen changes.
     * @param type {string}  "Home", "Web", "Menu", "QML", "Closed".
     * @param url {string}  Only valid for Web and QML.
     */
    screenChanged(type: string, url: string): void;
    /**
     * Signaled when the tablet becomes visible or becomes invisible.
     * @returns {Signal} 
     */
    isTabletShownChanged(): Signal;
    toolbarModeChanged(): void;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare class TabletButtonProxy {
    /**
     * Returns the current value of this button's properties.
     * @returns {TabletButtonProxy.ButtonProperties} 
     */
    getProperties(): TabletButtonProxy.ButtonProperties;
    /**
     * Replace the values of some of this button's properties.
     * @param properties {TabletButtonProxy.ButtonProperties}  Set of properties to change.
     */
    editProperties(properties: TabletButtonProxy.ButtonProperties): void;
    /**
     * Triggered when this button has been clicked on by the user.
     * @returns {Signal} 
     */
    clicked(): Signal;
    /**
     * @returns {Signal} 
     */
    propertiesChanged(): Signal;
    interface ButtonProperties {
        /**
         * URL to button icon. (50 x 50)
         */
        icon: string;
        /**
         * URL to button icon, displayed during mouse hover. (50 x 50)
         */
        hoverIcon: string;
        /**
         * URL to button icon used when button is active, and during mouse hover. (50 x 50)
         */
        activeHoverIcon: string;
        /**
         * URL to button icon used when button is active. (50 x 50)
         */
        activeIcon: string;
        /**
         * Button caption.
         */
        text: string;
        /**
         * Button caption when button is not-active but during mouse hover.
         */
        hoverText: string;
        /**
         * Button caption when button is active.
         */
        activeText: string;
        /**
         * Button caption when button is active and during mouse hover.
         */
        activeHoverText: string;
        /**
         * true when button is active.
         */
        isActive: boolean;
        /**
         * Determines sort order on tablet.  lower numbers will appear before larger numbers. 
         *     Default is 100.
         */
        sortOrder: number;
    }

}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare class ToolbarButtonProxy {
    /**
     * @param properties {object}  
     */
    editProperties(properties: object): void;
    /**
     * @param propertyValue {object}  
     */
    writeProperty(propertyValue: object): void;
    /**
     * @param properties {object}  
     */
    writeProperties(properties: object): void;
    /**
     * @param propertyName {string}  
     * @returns {object} 
     */
    readProperty(propertyName: string): object;
    /**
     * @param propertyList {Array.<string>}  
     * @returns {object} 
     */
    readProperties(propertyList: Array.<string>): object;
    /**
     * @returns {Signal} 
     */
    clicked(): Signal;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare class ToolbarProxy {
    /**
     * @param properties {object}  
     * @returns {ToolbarButtonProxy} 
     */
    addButton(properties: object): ToolbarButtonProxy;
    /**
     * @param name {string}  
     */
    removeButton(name: string): void;
    /**
     * @param propertyValue {object}  
     */
    writeProperty(propertyValue: object): void;
    /**
     * @param properties {object}  
     */
    writeProperties(properties: object): void;
    /**
     * @param propertyName {string}  
     * @returns {object} 
     */
    readProperty(propertyName: string): object;
    /**
     * @param propertyList {Array.<string>}  
     * @returns {object} 
     */
    readProperties(propertyList: Array.<string>): object;
}

/**
 * Available in:Interface ScriptsClient Entity Scripts
 */
declare namespace Toolbars {
    /**
     * @param toolbarID {string}  
     * @returns {ToolbarProxy} 
     */
    function getToolbar(toolbarID: string): ToolbarProxy;
}

