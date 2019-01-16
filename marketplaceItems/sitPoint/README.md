# Sit Point Script

## Description

Make any entity sittable whether it's a chair, bench, couch, or even a tree stump or log.

Either import Sit Point from the marketplace to put on entities for one or more seats per entity.

Or make a sittable entity yourself with one seat! See **Setup** > **Add scripts to your entity**

## Releases

2019-01-16_11-29-09 :: [voteApp 0a01cac]
- During Create Mode when the entity has 0.5 alpha value or less, a local visible cube is added for easier adjustments. The visible cube disappears once Create mode is closed.

## Project links
[trello]()

## Known issues

### Avatar is tilted after standing up when Sit Point is tilted

When a sit point is at an angle other than horizontal to the floor, on standup the avatar will be stand at that angle. To fix: use the goto menu and visit another domain. teleport to a friend, or sit again in a horizontal chair.

### Sit animation does not apply to an avatar using a different default animation

Animation that is applied before sitting is applied while in the chair and continues after standup. 

## Setup

### Import sit cube via JSON
1. Download the opaqueSitCube.json or invisibleSitCube.json located in /json folder
2. Open Create Mode
3. Click on "Create Tools" > "Create" > "Import Entities (.JSON)"
4. Select the .json file to import

### Add scripts to your entity
- Client script: sit.js 
- Server script: sitServer.js
Ensure both are running.

## Configurations

### Configurable adjustments in Create Mode
- Adjust seat center - update the "Pivot" (to adjust the "registrationPoint" entity property) Ex: a stool for an avatar to sit in the middle on top, Pivot = { x: 0.5, y: 1.0, z: 0.5 }

### Configurable variables in Script
- SHOW_PRESIT_OVERLAY_IN_HMD - Turn on/off "Face Forward Overlay" before sit in HMD
- CHAIR_OFFSET_RATIO - Used to calculate pin hip position. Adds CHAIR_OFFSET_RATIO * chair's y dimension to the y center of the seat.

Happy sitting!