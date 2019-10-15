# Tablet Cam

## Note

This is a personal project by [Zach Fox](https://github.com/zfox23/), a member of the High Fidelity Experiences Team. It has not undergone the same code review or QA process as the rest of the projects in this repository.

## Description

The Tablet Cam app allows you to **easily take selfies and regular photos in High Fidelity** using your Tablet or hand controllers!

## Features

- **Front-facing and rear-facing** cameras and flashes with optional **custom positioning**
- Works in **Desktop Mode and in VR Mode**
- **Persistent "Camera Roll"** for reviewing photos that you recently took
- Optical **zoom**
- Photo **quality settings**: Low, Normal, 4k, and _EXTREME_!
- **Aspect ratio settings**: 8x10, 2x3, 9x16, Square
- Editable photo directory

## Changelog

### v2.3 (2019-10-15)

- Removed unnecessary tone curve correction present in captured Tablet Cam output image.
- Adjusted y-offset of Desktop-mode selfie cam to better serve Virtual You avatars.
- Added `"Head"` as a backup joint to `"HeadTop_End"` for certain operations.

### v2.2 (2019-07-09)

- Fixed a hack in which the secondary camera feed was darkened to compensate for it being rendered too light.
- If your camera looks too light, it means you have an older version of Interface (pre PR #15862) and should go back to the previous version of this script.
- If your camera looks too dark, it means you have a newer version of Interface (post PR #15682) and should update to the current version of this script.

### v2.1 (2019-06-27)

- We've moved the code for this project into a new remote folder, which necessitated a version bump. There are no changes to functionality.

### v2.0 (2019-04)

**I've made some huge changes in v2.0!**

- In Desktop mode, when using the rear-facing camera and while you're using Third Person Camera, Tablet Cam will now be parented to Interface's Third Person Camera!
- The camera's viewpoint can now be detached from its default position! Snap a photo from a unique viewpoint.
- Fixed a bug that caused zoom settings to be saved incorrectly between restarts.
- Fixed a bug that caused the camera preview to show up as a corrupted image in HMD mode.
- Fixed a bug that caused the position of the rear-facing camera to be incorrect in HMD mode.
- Switched Overlay usage to Local Entities.
- Now you can use Tablet Cam in Desktop mode while "Desktop Tablet becomes Toolbar" is unchecked - although I'm not sure why you'd want to do that. :)
- Fixed some interface bugs.

### v1.1 (2019-02)

- Fixed a bug that caused Tablet Cam to erroneously appear on the Tablet after switching domains when it was previously active.

### Tablet Cam v1.0 (2019-01)

- Tablet Cam v1.0 is an update to Selfie Cam v1.0. It is a complete overhaul of the app. All of its features are new!

### Selfie Cam v1.0 (2018-12)

- Initial Release!

## Attributions
- "snap.wav" from "Camera Shutter, Fast, A.wav" by InspectorJ (www.jshaw.co.uk) of Freesound.org
- "switchCams.svg" from "rotate camera" by Diego Naive from the Noun Project
- "orientation.svg" from "orientation" by Atif Arshad from the Noun Project
- "camera.fbx" from "Digital camera" by Nick Ladd: https://poly.google.com/view/4A3SYVh_smq
- "camera-a.svg" and "camera-i.svg" from "Selfie" by Path Lord from the Noun Project