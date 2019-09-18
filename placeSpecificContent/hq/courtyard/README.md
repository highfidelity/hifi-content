# Reconfigurable Courtyard

This allows the courtyard setup to be changed via buttons. There are 3 preset types: open, stage, and roundtable.
[More Info](https://highfidelity.atlassian.net/wiki/spaces/PM/pages/512787002/Reconfigurable+Courtyard+Functional+Requirements+Spec)

## Entity Parenting and Script Relationships
* Control Panel - controlPanel_server.js
    * Control Panel Button Stage - controlPanelButton_client.js, empty.js
    * Control Panel Button Roundtable - controlPanelButton_client.js, empty.js
    * Control Panel Button Courtyard - controlPanelButton_client.js, empty.js
* Courtyard - (HiFi Utility) empty.js
    * Safety Zone - (HiFi Utility) bouncer.js
* Roundtable - (HiFi Utility) empty.js
* Admin Only Zone - (HiFi Utility) bouncer.js

## File List
### Server Side
* **controlPanelButton_client.js** attached to the control panel button entities.
* **empty.js** attached to the control panel buttons, courtyard, and roundtable entities.

### Client Side
* **controlPanelButton_client.js** attached to the control panel entity.
* [**bouncer.js**](https://github.com/highfidelity/hifi-content/tree/master/usefulUtilities/bouncerZone) attached to the admin only zone around the control panel room and the safety check zone beneath the courtyard floor. 

## Releases
### Version 1.0.0
SHA [2fc97c2](https://github.com/highfidelity/hifi-content/commits/2fc97c2) September 17, 2019
- [JIRA 296](https://highfidelity.atlassian.net/browse/DEV-296)   Initial Release
