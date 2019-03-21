# Push Preventer
When this script is attached to an entity as an entity script, the entity serves as a "Push Preventer", useful for preventing avatars from being pushed too far outside a specified area.

## Features
Every second, Push Preventer records your avatar's location. If you have moved more than a configurable number of meters since the last time your location has been recorded, your location will be reset to the last-recorded location UNLESS you just moved to a location within some configurable spatial boundary.

## Setup
1. Add an entity to your domain.
    - A giant Zone entity would work perfectly. A good place for this entity is centered around your domain's content. Its dimensions should be large enough to encompass the domain's content. You want to ensure that all visitors to your domain load this entity.
    - Note that anyone who can modify the `userData` of this entity will be able to control this script's configurable settings!
2. Add the below `userData` object to the attached entity's `userData`
    1. Set the `maxMovementAllowedM` value in the `userData` to the maximum distance you want users to be able to move.
    2. Set the `contentBoundaryCorner1` value in the `userData` to one corner of your content's boundary.
    3. Set the `contentBoundaryCorner2` value in the `userData` to the other corner of your content's boundary.
3. Add the `pushPreventer.js` script to the entity

Here's the object to add to the entity's `userData`:
```
{
    "maxMovementAllowedM": <A number, in meters, specifying the maximum distance you want users to be able to move. If not set, defaults to 1000.>,
    "contentBoundaryCorner1": {"x": <x value of corner 1>, "y": <y value of corner 1>, "z": <z value of corner 1>},
    "contentBoundaryCorner2": {"x": <x value of corner 2>, "y": <y value of corner 2>, "z": <z value of corner 2>}
}
```

# Releases

## 2019-03-15_13-19-00 :: [02c7431](https://github.com/highfidelity/hifi-content/commit/02c7431)
- Initial release