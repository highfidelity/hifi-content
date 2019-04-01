# Botinator
Botinator helps with load testing domains.  It will handle some of the hassels of setting positions and the number of bots playing at one time. 

## Setup
1. There are 2 scripts that are given in the app to place in the domain server. 
2. Open the app and add the number of bots you would like to use for the domain.
3. Set the volume you would like to play the bots at.  
4. Update the positions by choosing the corners you would like the bots to appear in. 
5. As soon as the assignment client manager comes online, you can send it the request. 
6. As assignment client players are available for more bots, they will be noted in the top right corner
7. If the player is stopped, the the manager is updated automatically with the app data. 
8. If the player is playing and you update the data, you can click send data to stop current playback. (this is to help avoid any confusion of when changes made are sent to the server)

# Releases

## 2019-03-30_21-56-20 :: [4ff97f1](https://github.com/highfidelity/hifi-content/commit/4ff97f1)
- Initial release

# Known issues
- Currently, we can not remove the avatars with Agent.isAvatar = false, or the next time a recording is loaded, it appears as a white sphere in the origin.
- The setVolume for the Recording api also doesn't appear to be working properly.  
- Because we are using the message mixer, sometimes we get into a state where the play/stop needs to be hit a few times.  Can be fixed with some more "handshake" implementation to ensure the messges were sent/received.  Leaving out for V1 in interest of time.

# Trello Card
https://trello.com/c/8SWztg7k/88-bot-tester-script-test-app-v1
