# SPAWN POINT ZONE

## Description
This utility handles users falling through the floor when first loading into a domain. When the user loads this zone script, they will be moved to random position within a cube whose position and dimensions are specified in the `userData` of the  attached zone. The intended area for users to spawn in should align with the axes.

## File List
### Client Side
* **spawnPointZone.js** attached to the zone around the domain. The userData of this zone should specify the position and dimensions of an area in which users should spawn at.

## Setup
1. Add an zone to your domain.
    - A giant Zone entity would work perfectly. A good place for this entity is centered around your domain's content. Its dimensions should be large enough to encompass the domain's content. You want to ensure that all visitors to your domain load this entity.
    - Note that anyone who can modify the `userData` of this entity will be able to control this script's configurable settings!
2. Add the below `userData` object to the attached entity's `userData`. You will be spceifying the area in which users should load in by outlining the properties of a zone.
    1. Set the `position` to a vec3 value where you want the center of your spawn area to be. If this value is empty, the user will not teleport.
    2. Set the `dimensions` to a vec3 value to specify the x, y, and z dimensions of your spawn area. If this value is empty, the user will not teleport.
    3. Set the  `avatarRotation` to a vec3 value to set the orientation of the user after being moved to the spawn area. If no rotation is set, a random one will be chosen.
3. Add the `spawnPointZone.js` script to the zone entity.

Here's a sample object to add to the entity's `userData`. You can adjust the position and dimensions.:
```
{
  "spawnArea": {
    "position": {
      "x": 8,
      "y": -10,
      "z": 10
    },
    "dimensions": {
      "x": 5,
      "y": 1,
      "z": 2
    },
    "avatarRotation": {
      "x": 0,
      "y": 0,
      "z": 90
    },
    "usernameWhitelist": {}
  }
}
```

## Releases
### Version 1.0
SHA [4192b55](https://github.com/highfidelity/hifi-content/commits/4192b55) May 21, 2019
- [JIRA 235](https://highfidelity.atlassian.net/browse/BUGZ-235)   Initial Release

### Version 1.1
SHA [52fe80e](https://github.com/highfidelity/hifi-content/commits/52fe80e) May 23, 2019   

- [JIRA 314](https://highfidelity.atlassian.net/browse/BUGZ-314) Adding rotation data to the spawn area
- [JIRA 315](https://highfidelity.atlassian.net/browse/BUGZ-315) Adding user whitelist for spawn area script








