# Bubble Disabler
When this script is attached to an entity as an entity script, the entity will disable users bubbles when they load it.

## Features
- The bubble disabler will check to see if the user bubble is enable and if it is disable it
- On unload the disabler will reenable the users bubble only if it was enabled when they loaded the entity

## Setup
1. Add an zone to your domain.
    - A giant Zone entity would work perfectly. A good place for this entity is centered around your domain's content. Its dimensions should be large enough to encompass the domain's content. You want to ensure that all visitors to your domain load this entity.
2. Add the `bubbleDisabler.js` script to the entity

# Releases

## v1.0 :: [d2802ca](https://github.com/highfidelity/hifi-content/commit/d2802ca)
- Initial release