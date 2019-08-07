# Whiteboard and Air Draw

## Description
This utility combines the best features of the whiteboard and the draw app. Any user can draw in the air and users with rez-temp rights can draw on the board in HMD and desktop. In desktop, draw with your left mouse button and erase with your middle mouse button. In HMD, draw with your trigger button and erase with the grip.

## File List
### Client Side
* **drawSphereClient.js** attached to the sphere at the end of the user's fingertip, handles drawing
* **drawSphereSpawnerClient.js** attached to each color selection square, allows the user to select a new color
* **whiteboardReset.js** attached to reset square, allows user to clear all lines on whiteboard and their ownlines in air
* **whiteboardZoneClient.js** attached to the zone in front of the whiteboard, this script automatically attaches a paint sphere to the user's fingertip when they enter and removes all of their spheres when they leave

## Releases

SHA [3089026](https://github.com/highfidelity/hifi-content/commits/3089026)
2019-08-06_13-30-00 [JIRA 1159](https://highfidelity.atlassian.net/browse/BUGZ-1159)
- Fixed bug where whiteboards in close proximity erase each other's lines 

SHA [f80f76a6](https://github.com/highfidelity/hifi-content/commits/f80f76a6)
2019-06-18_13-30-00 [JIRA 143](https://highfidelity.atlassian.net/browse/DEV-143)
- Removed the ability to draw in the air while in desktop mode.

SHA [a5368e9](https://github.com/highfidelity/hifi-content/commits/a5368e9)
2019-06-11_16-16-16 [JIRA 642](https://highfidelity.atlassian.net/browse/BUGZ-642)
- Clear a var after changing draw mode

SHA [d176da9](https://github.com/highfidelity/hifi-content/commits/d176da9)
2019-06-06_16-45-25
- Updated the current tablet method to use the controller as an origin to help avoid using intervals other than the update loop
- Updated the model to have a full bezel around the board

SHA [90ebb0d](https://github.com/highfidelity/hifi-content/commits/90ebb0d)
2019-05-21_11-30-00
- Fixed bug with paint sphere dimensions not found [JIRA 152](https://highfidelity.atlassian.net/browse/BUGZ-152)
- Made material entity attached to paint sphere collisionless 

SHA [80bcc13](https://github.com/highfidelity/hifi-content/commits/80bcc13)
2019-04-18_09-44-00
- Initial Release

## Known issues
### Lines drawn on the board in HMD do not render flat and with an even stroke width
### Line textures do not match their respective png files
### Color selectors and reset buttons may LOD