# Happy Boom Box
This customizeable boom box brings tunes to your domain so that you can jam away to the beat with your friends. You will need rez permissions to add the boom box to your domain, or rez certified permissions if you want to download the version from the High Fidelity Marketplace. 

<hr>

### boomBoxEntityServerScript.js

This server script handles the state of the music player and plays audio back so that it is synchronized across all users. As a general rule of thumb, actions and behaviors of entities that need to be in the same state for all users should run on the server. The client script that runs on the button relays the requests for each of the remotely callable functions to execute on the server, and the server script handles the audio playback accordingly.

### boomBoxEntityScript.js

This client script handles the interactions between users and displays the UI for controlling the boombox via an HTML page via the Tablet Scripting Interface. It listens for mouse clicks and controller triggers, displays the controls, and serves as a relay mechanic between the HTML page and the boombox entity server script. 

### boomBoxController.html
This HTML page displays the controller UI for the music player through the Tablet Scripting Interface and is styled with CSS. It uses the EventBridge to send the user input from the HTML elements to the boombox entity script, which in turns calls entity server methods depending on the EventBridge message contents.

<hr>

### Resources
* Download a completed version of the Happy Boombox on the High Fidelity Marketplace:
https://highfidelity.com/marketplace/items/e9da3d33-b937-4e07-bdf8-29dde581dfd1 

* Entities API Reference: https://docs.highfidelity.com/api-reference/namespaces/entities

* Audio API Reference: https://docs.highfidelity.com/api-reference/namespaces/audio 

* Tablet API Reference: https://docs.highfidelity.com/api-reference/namespaces/tablet 

_Last updated: 1/15/2019_
