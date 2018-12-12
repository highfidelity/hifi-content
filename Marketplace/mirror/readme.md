Mirror with Button
=================

Setting up mirrors in High Fidelity can be intimidating, but with this Blueprint, we'll walk you through the components of building a mirror and getting it set up in your domain. Not interested in building your own mirror? You can grab the JSON url directly and import it into your domain or grab one of the mirrors on the Marketplace. Want a look behind the scenes? Read on!

![A female avatar with green hair and red dress looks in the mirror](https://hifi-content.s3-us-west-1.amazonaws.com/liv/Courses/Mirror%20Blueprint/mirror.PNG)

## Important Considerations About Mirrors

Mirrors in High Fidelity use the _secondary camera_ to render a mirrored texture onto a plane in front of you. Like the main camera that displays what you see when you're using Interface, the secondary camera can be set up to show a view from another point in space - then what you do with that texture is up to you. In the case of a mirror, we display it onto a plane, but if you've used the spectator camera or selfie camera app before, you'll note that this can be displayed for other use cases. Some people have even used the secondary camera to map onto their avatar's mesh! 

![A diagram of two 3D cameras and their clipping planes, used to illustrate how a virtual reality mirror works](https://hifi-content.s3-us-west-1.amazonaws.com/liv/Courses/Mirror%20Blueprint/Screen%20View%281%29.png)

Because you can only have one secondary camera in a scene, you'll need to make a note of the following:
* Multiple mirrors that are displaying at the same time will not work as expected
* You cannot use the spectator camera and a mirror at the same time
* It's a good idea to provide a mechanic to turn a mirror on / off, especially if you have multiple mirrors in an area, so that users can activate a single one at a time

## Building Mirrors
There are a number of mechanics that can allow you to enable mirrors, and mirrors can take different forms. In this Blueprint, we're going to explain how to make a mirror with a button on it to turn it off and on. You can also use zones or collisionless cubes if you would prefer to use the `enterEntity` signal as a trigger to turn a mirror on and `leaveEntity` to turn a mirror off. 

All mirrors have a client script on them that handles the logic of setting up the secondary camera, the projection matrices for the camera, and rendering that to the mirror plane.

The setup for our mirror is simple and comprised of two parts. The mirror plane is the base item, and has a child button model entity. You could swap out this button for another, if you wanted to add functionality like color changes or sounds. 

### ← mirrorButton.js

The `mirrorButton.js` file is attached in the 'Script' property of our button entity on our mirror. As soon as this script begins in the `preload` function, we store the `mirrorID` by finding the mirror plane with the `parentID` property of our button entity. We then use the `mousePressOnEntity` callback and the `stopFarTrigger` callback as our on/off switches. When these signals are fired for our button entity, we check if the mirror is in an on/off state and call the appropriate `mirrorClient` method:

```
    
    var toggleMirrorMode = function() {
        if (!mirrorOn) {
            Entities.callEntityMethod(mirrorID, 'mirrorOverlayOn');
            mirrorOn = true;
        } else {
            Entities.callEntityMethod(mirrorID, 'mirrorOverlayOff');
            mirrorOn = false;
        }
    };

```   

[Entities API Documentation](https://docs.highfidelity.com/api-reference/namespaces/entities) 

If you were to put this on a zone or collisionless box, so that the mirror would turn on or off automatically as you approached it, the only change would be to switch the mouse and trigger signals with enter/leave. 

### ← mirrorClient.js
The `mirrorClient.js` script handles the rendering of the spectator (secondary) camera frame to an Image3D overlay. There are two client methods, `mirrorOverlayOn` and `mirrorOverlayOff`, which we call from our mirror's button script to enable or disable the reflective surface. When the mirror is turned on, the overlay is added and then a check is done to ensure that the mirror is rendering at the appropriate dimensions. 

```
    mirrorOverlayID = Overlays.addOverlay("image3d", {
                name: "mirrorOverlay",
                url: "resource://spectatorCameraFrame",
                emissive: true,
                parentID: _this.entityID,
                alpha: 1,
                localRotation: ZERO_ROT,
                localPosition: { 
                    x: 0,
                    y: 0,
                    z: mirrorOverlayOffset
                }
            });
```

[Overlays API Documentation](https://docs.highfidelity.com/api-reference/namespaces/overlays)

### Attributions
The `mirrorClient` script has been iterated on and changed over time. The original code was written by Patrick Manalich, with subsequent edits by Rebecca Stankus, David Back, and Caitlyn Meeks.