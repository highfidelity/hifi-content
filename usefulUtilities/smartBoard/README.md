# Smartboard
Implements scripts necessary for a Smartboard to function. A Smartboard integrates Whiteboard functionality and Screen Sharing functionality.

## Whiteboard
The Smartboard's Whiteboard mode is a slighly modified version of the code found in `<hifi-content>/usefulUtilities/airAndWhiteboardDraw`. The main difference is the fact that a shared zone client/server script handles both whiteboard and screen share functionality.

## Screen Share
### `html`
The `html` folder contains the files the local web entity will use to display the share.
Note that the Screen Share viewer client UI HTML files are in the correct place in the repo per our repo guidelines. However, these files will be stored in a permanent location on our production S3 bucket for the associated C++ code to reference.

### `scripts`
The three main script files for the Smartboard's Screen Share mode are:
1. `boardButtonClient.js`: Controls the look of the Board and sends a message to the smartboard server to let it know about a user interaction.
2. `smartboardZoneServer.js`: Handles Smartboard participants. Handles the data model, which is passed to participants' client scripts for updating the in-world UI.
3. `smartboardZoneClient.js`: Handles creating/removing local entities, requesting to register a new participant, and initating Screen Share functionality.


# Release Notes
## v1.0 :: [commit 84a142fb](https://github.com/highfidelity/hifi-content/commits/84a142fb)
- Initial Release

## v1.1 :: [commit 5c3d02d](https://github.com/highfidelity/hifi-content/commits/5c3d02d)
- Update local button logic for visibility
- Update hardcoded values
- Truncate display names

## v1.2 :: [commit efea56a](https://github.com/highfidelity/hifi-content/commits/efea56a)
- Updated button logic to handle stopping the screenshare directly

## v1.3 :: [commit 9444d21](https://github.com/highfidelity/hifi-content/commits/9444d21)
- Added logic to harden against out-of-order entity and script loading.

## v1.4 :: [commit 56f17ae](https://github.com/highfidelity/hifi-content/commits/56f17ae)
- DEV-2840: Fix z-fighting issues in Smartboard components and enable quicker positional iteration in the future.

## v1.5 :: [commit 94c3414](https://github.com/highfidelity/hifi-content/commits/94c3414)
- DEV-2857: Upped timeout for showing the presenter name

## v1.6 :: [commit bbc05b2](https://github.com/highfidelity/hifi-content/commits/bbc05b2)
- DEV-2862: Fixed being able to draw during share