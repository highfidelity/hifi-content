# AUDIO FOCUS

## Description

This is a simple app that allows you to choose an avatar and solo them.
You can either select in Desktop by clicking, or in HMD by triggering with either controller

## Releases

2019-01-09_12:45:00 :: [soloPoint 0a01cac]

- Raypicking changed to findRayIntersection
- Styling added
- Error checking added

2019-01-11_11:11:15 :: [soloPoint 504e306]

- Updated to work only within 25 meters of someone
- Updated styling
- CR corrections

2019-01-11_13:15:00 :: [soloPoint 5274039]

- Added Icons
- Removed old code
- Added Error message if an avatar is too far away

2019-01-12_13:05:00 :: [soloPoint 63a2a48]

- Fixed the issue with the clear button losing focus
- Added some code formatting to help with future apps
- Switched to using Vue
- Fixed Right mouse button issue

2019-01-14_15-00-54 :: [soloPoint b93649b]
- Marketplace V1
- Fixed speaker facing avatar
- Fixed Error from popping up when opened

2019-02-05_16-50-55 :: [fix_audioFocus 4f3160e]
- Marketplace V2
- This just fixed the breaking Vue version change 

## How this app was made

### Solo API
There isn't too much to this app so we will only touch on a couple items.

One is that it makes use of the new solo api.  It allows you to hear only one or more selected avatars.  It also side steps the domain attenuation so that you can hear a person without distance gain.  

It is used as the following:
Audio.addToSoloList([targetUUID]);
Audio.removeFromSoloList([targetUUID]);
Audio.resetSoloList();

Very handy in noisey environments!

### Raycasting on avatars
Small note on raycasting on avatars.  We don't have any signals for when someone clicks/triggers on an avatar, but we do have two methods that are available. 

One is to use our Pointers API with Picks, but this is more for if you are concerned with how your pointer is rendered, and also if there are dynamic actions that need to happen.  An example of this is an action that is triggered as you hover around a crowd.

The method we used here is making use of Avatars.findRayIntersection.  If you are curious how this works or need to do something similar, refer to the Mapping section.

## Project links
[trello](https://trello.com/c/iK9EtELU/12-loud-pointer-script)

## Known issues

### Unreliable avatar picking
Depending on the size of the avatar being picked on, sometimes it doesn't always accurately get them, or the result is unreliable.
This possibly has to do with the way avatars have collision capsules are represented.  Better avatar picking is in the roadmap and will update this app to use it when possible.

### Popping can occur on audio from audio injectors
Not sure why this happens, but could be related to general distance attenuation issues.  
[Manuscript](https://highfidelity.manuscript.com/f/cases/20666/When-exclusively-listening-to-an-audio-source-hearing-popping-when-around-items-that-play-repeating-audio)

