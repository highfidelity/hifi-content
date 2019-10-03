# Sit
## Description
Make any entity sittable whether it's a chair, bench, couch, log, or even a tree stump. One chair per entity.

To allow the user to sit when clicking on the entity to which the scripts are attached, set `canClickOnModelToSit` to `true` in the attached entity's `userData`. 

## Setup
1. Add sitClient.js as script to entity
2. Add sitServer.js as server script to entity

## Releases
### 2019-10-03_11-59-00 :: [71c2f1c](https://github.com/highfidelity/hifi-content/commits/71c2f1c)
- Fixed a bug that would prevent users from sitting down if they had a special, specific key/value pair defined in their `Settings` file.
- Append `-debug` to this version's folder path on S3 to access a version of Sit with full debug logging enabled.

### 2019-10-02_10-22-00 :: [1a3ee5c](https://github.com/highfidelity/hifi-content/commits/1a3ee5c)
- Turned off debug logging.

### 2019-10-02_10-22-00-debug :: [2233568](https://github.com/highfidelity/hifi-content/commits/2233568)
- Modified some debug logs and enabled all debug logs.
- Added logic to fuzz the data request timeout value so that we space out the requests made between client and server across all sit scripts.
- Moved initial heartbeat request to _after_ the user has started sitting down.

### 2019-09-18_10-30-00 :: [981038f](https://github.com/highfidelity/hifi-content/commits/981038f)
- Modified the default opacity of the "Click to Sit" overlay to be `0.5` from `0.25`.
- Removed the transparency lerp effect on script startup; the overlay will no longer fade from high opacity to low opacity upon script startup. 

### 2019-08-30_15-11-00 :: [eb78ad2](https://github.com/highfidelity/hifi-content/commits/eb78ad2)
- Hopefully fixed the "invisible sit cube" issue from [BUGZ-1384](https://highfidelity.atlassian.net/browse/BUGZ-1384).
- Added additional protections against the "double sit cube" issue from [BUGZ-1229](https://highfidelity.atlassian.net/browse/BUGZ-1229).
- Implemented a feature where the client script periodically checks for sit point occupied status from the server script.
    - The check will only occur if the user's camera is close to the seat.
    - The check will only attempt to retrieve occupied status from the server script N times until it gives up, after which the process will start back up normally if the user sits down on the sit point and then stands up.

### 2019-08-26_15-19-00 :: [9c83ea3](https://github.com/highfidelity/hifi-content/commits/9c83ea3)
- Hopefully _actually_ fixed the "double sit cube" issue from [BUGZ-1229](https://highfidelity.atlassian.net/browse/BUGZ-1229).

### 2019-08-19_09-44-00 :: [1a36ed99](https://github.com/highfidelity/hifi-content/commits/1a36ed99)
- Addressed CR comments from [PR451](https://github.com/highfidelity/hifi-content/pull/451)

### 2019-08-13_12-17-00 :: [6404793]
- [BUGZ-1229](https://highfidelity.atlassian.net/browse/BUGZ-1229) Fixed "double sit-cube overlays" issue.
- [DEV-376](https://highfidelity.atlassian.net/browse/DEV-376) Fixed "Sitting in HMD does not remove sittable overlay"
- [DEV-377](https://highfidelity.atlassian.net/browse/DEV-377) Fixed "Switching from HMD to Desktop while sitting makes overlay invisible"

### 2019-08-09_15-32-00 :: [5e5a913f]
- [DEV 345](https://highfidelity.atlassian.net/browse/DEV-345) Updated sit to version 2.5 which utilizes the avatar api and no longer uses zone entities.

### 2019-06-27_20-24-55 :: [06afa3e]
- [DEV 150](https://highfidelity.atlassian.net/browse/DEV-150) Added checks and a time out to help fix getting stuck in the animation when HMD is removed.

### 2019-06-24_10-56-00 :: [d3de76d]
- [Jira 773](https://highfidelity.atlassian.net/browse/BUGZ-773) Added a bump when an avatar gets out of a chair to help with getting stuck in the floor

### 2019-06-21_10-56-00 :: [75b55a27](https://github.com/highfidelity/hifi-content/commits/75b55a27)
- [Jira 576](https://highfidelity.atlassian.net/browse/BUGZ-576) Removed animation restore logspam

### 2019-06-19_15-56-00 :: [6ee18e8](https://github.com/highfidelity/hifi-content/commits/6ee18e8)
- [Jira 575](https://highfidelity.atlassian.net/browse/BUGZ-575) Ensure pin on joint is only cleared when standing or before setting new pin

### 2019-06-12_11-30-00 :: [65eb1ecb](https://github.com/highfidelity/hifi-content/commits/65eb1ecb)
- [Jira 655](https://highfidelity.atlassian.net/browse/BUGZ-655) Removed utils.js dependency

### 2019-06-06_07-13-50 :: [c6ed100](https://github.com/highfidelity/hifi-content/commits/c6ed100)
- [Jira 554](https://highfidelity.atlassian.net/browse/BUGZ-554) Changed standup to require one tap of jump movement key 

### 2019-06-05_12-36-00 :: [2f30d30](https://github.com/highfidelity/hifi-content/commits/2f30d30)
- [Jira 299](https://highfidelity.atlassian.net/browse/BUGZ-299) Removed repositioning/reorienting of avatar upon standing. User must use space bar to stand now.

### 2019-05-23_17-00-00 :: [0eedf28](https://github.com/highfidelity/hifi-content/commits/0eedf28)
- [Jira 350](https://highfidelity.atlassian.net/browse/BUGZ-350) Removed script caching

### 2019-05-22_17-00-00 :: [f5cb684](https://github.com/highfidelity/hifi-content/commits/f5cb684)
- [Jira 307](https://highfidelity.atlassian.net/browse/BUGZ-307) Added a timeout back after it was previously removed and removed empty script from sit zones

### 2019-05-21_10-00-00 :: [db0d1e5](https://github.com/highfidelity/hifi-content/commits/db0d1e5)
- Removed signal handler for skeletonModelURLChanged as it duplicated code handled by onLoadComplete

### 2019-05-20_13-29-00 :: [c5de1cd](https://github.com/highfidelity/hifi-content/commits/c5de1cd)
- Emergency fix for multiplying sit zones

### 2019-05-13_12-40-00 :: [c9c58a1](https://github.com/highfidelity/hifi-content/pull/388/commits/c9c58a1)
- When standing up, the user returns to the world position where they were when they sat down
- Fixed bug where user would sit without moving to the chair, then immediately stand up again

### 2019-01-17_14-57-17 :: [sitScriptUpdate ded8ecbc78a44c3c830e1f42fed6dd8e9277a4c1]
- During Create Mode when the entity has 0.5 alpha value or less, a local visible cube is added for easier adjustments. The visible cube disappears once Create mode is closed.

## Known issues
### The heartbeat system doesn't work.
If a server heartbeat fails (i.e. a user disconnects while they're sitting), the Sittable UI won't re-appear on that seat for any other users unless they restart their client. This has been broken since Sit V1.

### A 1.1x height multiplier may not always sit the user at the right spot.
During `calculateSeatCenterPositionForPinningAvatarHips()`, we use a y-offset of 1.1x the y-dimension of the seat to determine where to place the avatar's hips. This multiplier may not always be correct for all seats.

### Solution to other entities taking the "Click to Sit" click events
Collisions with other entity's invisible collision hulls sometimes make it difficult to sit. Ensure entities near sit cubes have the property `ignorePickIntersection: true`.

### Sit animation does not apply to an avatar using a different default animation
Animation that is applied before sitting is applied while in the chair and continues after standup.

### Unreliable method for making sure we know where the floor is when we standup
In the current Sit code architecture, we begin sitting in a seat by using the position of the clicked "sit cube", and then adding some constant to figure out where your hips should go during the sit animation. To figure out where to position the avatar upon stand-up, we explored saving the Y position of the avatar before sitting down, but there are several cases where that saved Y position might not be a useful reference - consider the user standing on a different vertical plane as the chair.
In this version of the code, we add a small, arbitrary value to the Y position of the user when standing. This should generally take care of the problems we were seeing with users stuck in the floor. However, there still exists the possibility of an edge case where the small increase in Y position is enough to force the user through a room's ceiling. 
[DEV-167](https://highfidelity.atlassian.net/browse/DEV-167) for further reference.  

### Future features
Configurable variables:
- Custom animations specified via userData
- All configurable variables specified via userData

## Sit Configurations
### Configurable adjustments in Create Mode
- Adjust seat center - update the "Pivot" (to adjust the "registrationPoint" entity property) Ex: a stool for an avatar to sit in the middle on top, Pivot = { x: 0.5, y: 1.0, z: 0.5 }

### Configurable variables in userData
- Can click on chair to sit boolean in userData
