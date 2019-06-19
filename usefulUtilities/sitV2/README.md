# Sit V2

## Description

Make any entity sittable whether it's a chair, bench, couch, log, or even a tree stump. One chair per entity.

To enable sit when clicking on chair set `canClickOnModelToSit` to `true` in userData. 


## Setup

1. Add sitClientV2.js as script to entity
2. Add sitServerV2.js as server script to entity


## Releases

2019-06-19_15-56-00 :: [6ee18e8](https://github.com/highfidelity/hifi-content/pull/392/commits/6ee18e8)
- [Jira 575](https://highfidelity.atlassian.net/browse/BUGZ-575) Ensure pin on joint is only cleared when standing or before setting new pin

2019-06-12_11-30-00 :: [65eb1ecb](https://github.com/highfidelity/hifi-content/pull/392/commits/65eb1ecb)
- [Jira 655](https://highfidelity.atlassian.net/browse/BUGZ-655) Removed utils.js dependency

2019-06-06_07-13-50 :: [c6ed100](https://github.com/highfidelity/hifi-content/pull/392/commits/c6ed100)
- [Jira 554](https://highfidelity.atlassian.net/browse/BUGZ-554) Changed standup to require one tap of jump movement key 

2019-06-05_12-36-00 :: [2f30d30](https://github.com/highfidelity/hifi-content/pull/392/commits/2f30d30)
- [Jira 299](https://highfidelity.atlassian.net/browse/BUGZ-299) Removed repositioning/reorienting of avatar upon standing. User must use space bar to stand now.

2019-05-23_17-00-00 :: [0eedf28](https://github.com/highfidelity/hifi-content/pull/392/commits/0eedf28)
- [Jira 350](https://highfidelity.atlassian.net/browse/BUGZ-350) Removed script caching

2019-05-22_17-00-00 :: [f5cb684](https://github.com/highfidelity/hifi-content/pull/392/commits/f5cb684)
- [Jira 307](https://highfidelity.atlassian.net/browse/BUGZ-307) Added a timeout back after it was previously removed and removed empty script from sit zones

2019-05-21_10-00-00 :: [db0d1e5](https://github.com/highfidelity/hifi-content/pull/392/commits/db0d1e5)
- Removed signal handler for skeletonModelURLChanged as it duplicated code handled by onLoadComplete

2019-05-20_13-29-00 :: [c5de1cd](https://github.com/highfidelity/hifi-content/pull/392/commits/c5de1cd)
- Emergency fix for multiplying sit zones

2019-05-13_12-40-00 :: [c9c58a1](https://github.com/highfidelity/hifi-content/pull/388/commits/c9c58a1)
- When standing up, the user returns to the world position where they were when they sat down
- Fixed bug where user would sit without moving to the chair, then immediately stand up again

2019-01-17_14-57-17 :: [sitScriptUpdate ded8ecbc78a44c3c830e1f42fed6dd8e9277a4c1]
- During Create Mode when the entity has 0.5 alpha value or less, a local visible cube is added for easier adjustments. The visible cube disappears once Create mode is closed.














## Known issues

### Solution to other entities taking the "Click to Sit" click events

Collisions with other entity's invisible collision hulls sometimes make it difficult to sit. Ensure entities near sit cubes have the property `ignorePickIntersection: true`.

### Sit animation does not apply to an avatar using a different default animation

Animation that is applied before sitting is applied while in the chair and continues after standup. 

### Future features

Configurable variables:
- Custom animations specified via userData
- All configurable variables specified via userData

## Sit Configurations

### Configurable adjustments in Create Mode
- Adjust seat center - update the "Pivot" (to adjust the "registrationPoint" entity property) Ex: a stool for an avatar to sit in the middle on top, Pivot = { x: 0.5, y: 1.0, z: 0.5 }

### Configurable variables in userData
- Can click on chair to sit boolean in userData

Happy sitting V2!