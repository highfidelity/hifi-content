# Bubble Disabler
When this script is attached to an entity as an entity script, any users who load the entity will have their space bubbles automatically disabled.

## Features
- The Bubble Disabler will check to see if the user's bubble is enabled. If the user's bubble is enabled, the Disabler will disable it.
- When the script is unloaded, the Disabler will re-enable the user's bubble only if it was enabled when they loaded the entity to which the Disabler is attached.

## Setup
1. Add a zone to your domain.
    - A giant Zone entity would work perfectly. A good place for this entity is centered around your domain's content. Its dimensions should be large enough to encompass the domain's content. You want to ensure that all visitors to your domain load this entity.
2. Add the `bubbleDisabler.js` script to the entity.

# Releases

## v1.0 :: [d2802ca](https://github.com/highfidelity/hifi-content/commit/d2802ca)
- Initial release