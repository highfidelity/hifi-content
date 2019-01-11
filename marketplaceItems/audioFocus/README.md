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

2019-01-11_01:15:00 :: [soloPoint 5274039]

- Added Icons
- Removed old code
- Added Error message if an avatar is too far away

## How this app was made

### Solo API
There isn't too much to this app so we will only touch on a couple items.

One is that it makes use of the new solo api.  It allows you to hear only one or more selected avatars.  It also side steps the domain attenuation so that you can hear a person without distance gain.  

It is used as the following:
Audio.addToSoloList([targetUUID]);
Audio.removeFromSoloList([targetUUID]);
Audio.resetSoloList();

Very handy in noisey enviornments!

### Raycasting on avatars
Small note on raycasting on avatars.  We don't have any signals for when someone clicks/triggers on an avatar, but we do have two methods that are available. 

One is to use our Pointers API with Picks, but this is more for if you are concerned with how your pointer is rendered, and also if there are dynamic actions that need to happen.  An example of this is an action that is triggered as you hover around a crowd.

The method we used here is making use of Avatars.findRayIntersection.  If you are curious how this works or need to do something similar, refer to the Mapping section.

