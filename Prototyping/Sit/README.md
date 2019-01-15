# Sit Entity Script

Make any entity sittable whether it's a chair, bench, couch, or even a tree stump or log.

## Setup

Import sit cube via JSON:
1. Download the opaqueSitCube.json or invisibleSitCube.json located in /json folder
2. Open Create Mode
3. Click on "Create Tools" > "Create" > "Import Entities (.JSON)" 
4. Select the .json file to import

Add scripts to your entity:
- Client script: sit.js 
- Server script: sitServer.js
Ensure both are running.

## Configuration

To adjust the center of the seat change the entity's registration point.
Ex: a stool for an avatar to sit in the middle on top, registrationPoint = { x: 0.5, y: 1.0, z: 0.5 }.

Configurable variables:
- SHOW_PRESIT_OVERLAY_IN_HMD - Turn on/off "Face Forward Overlay" before sit in HMD
- CHAIR_OFFSET_RATIO - Used to calculate pin hip position. Adds CHAIR_OFFSET_RATIO * chair's y dimension to the y center of the seat.

## Invisible Cube Update

 During Create Mode when the entity has 0.5 alpha value or less, a local visible cube is added for easier adjustments. The visible cube disappears once Create mode is closed.