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
