# Keyboard

This blueprint item was created by the High Fidelity Experiences Team as a template to be copied and modified by our users. 

The code is heavily commented for clarity and by following this README, users will learn more about creating using the High Fidelity API. We encourage people to create their own variations of this and other blueprint items.

## The Components

![Image of Components](http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/keyboardBlueprint/resources/images/Keyboard.jpg)

## Keyboard Base

This is just a primitive entity that serves to hold all of the other parts together. Having everything parented to this makes it easy to move the keyboard.

## Keyboard Zone

This zone is placed around the keyboard. When a user enters the zone, small entities will be created at their fingertips and all pieces of the keyboard will have touch turned off. When touch is turned on, an avatar's fingers will automatically glide across the surface of an object which looks really cool, but also prevents the ability to precisely touch a specific entity.

## Fingertip Entity

Avatars do not trigger collisions with entities, but we can work around that by attaching small entities to the avatar instead. These tiny spheres at the tips of the fingers will collide with the keys so that a user can play the keyboard while in HMD. The spheres are attached to the 4th finger joint of an avatar by default, but if an avatar does not have that joint, they will be attached to the 3rd joint. If the avatar does not have either one of these joints, they will not be able to play the keyboard with their hands but will still be able to use an object to hit the keys if they wish.

## Keys

Each key is named with its color and key number ("Keyboard Key Black 23", for instance) and runs the script keyboardKey.js. When the script begins, it reads the key name to get the default key color and number of the corresponding key sound. In desktop, a clickDownOnEntity event triggers the key sound and color change, then a clickReleaseOnEntity triggers the return to default color. In HMD, when the user touches a key, a collision occurs and the script resonds to the collisionWithEntity event. A collision event has one of 3 contactEventTypes: 0 is the start of a collision, 1 is the continuation, and 2 is the end. If a key receives a collision event of type 0, it plays a sound and changes color. When the event is over, a collision event type 2, the key returns to it's default color.

## Known Issue

If two users press a keyboard key at once, it will return to default color after the first user releases the key. The second user will still be pressing the key but the key will not be highlighted to show that it is being pressed. Upon the second user releasing the key, it will respond as expected again