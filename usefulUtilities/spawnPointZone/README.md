# SPAWN POINT ZONE

## Description
This utility handles users falling through the floor when first loading into a domain. When the user loads this zone script, they will be moved to random position within a cube whose position and dimensions are specified in the `userData` of the  attached zone.

## File List
### Client Side
* **spawnPointZone.js** attached to the zone around the domain. The userData of this zone should specify the position and dimensions of an area in which users should spawn at.

## Setup
1. Add an zone to your domain.
    - A giant Zone entity would work perfectly. A good place for this entity is centered around your domain's content. Its dimensions should be large enough to encompass the domain's content. You want to ensure that all visitors to your domain load this entity.
    - Note that anyone who can modify the `userData` of this entity will be able to control this script's configurable settings!
2. Add the below `userData` object to the attached entity's `userData`. You will be spceifying the area in which users should load in by outlining the properties of a zone.
    1. Set the `position` to a vec3 value where you want the center of your zone to be.
    2. Set the `dimensions` to a vec3 value to specify the x, y, and z dimensions of your zone.
3. Add the `spawnPointZone.js` script to the zone entity.

Here's a sample object to add to the entity's `userData`. You can adjust the position and dimensions.:
```
{
  "spawnArea": {
    "position": {
      "x": 8,
      "y": -7.35,
      "z": 10.36
    },
    "dimensions": {
      "x": 3,
      "y": 3,
      "z": 3
    }
  }
}
```

## Releases
### Version 1.0
SHA [4192b55](https://github.com/highfidelity/hifi-content/commits/4192b55)
May 21, 2019
- Initial Release

## Links
[JIRA 235](https://highfidelity.atlassian.net/browse/BUGZ-235)





