# Bot Player
Bot Player helps with domain testing bots that need to be placed in a certain location, are a certain unique set, and that need to last through domain resets.

## Setup
1. Add the following two scripts to the Domain scripts [Place here when ready].
2. Make the player have as many as needed.


# Releases

## 2019-03-30_21-56-20 :: [ac097f4](https://github.com/highfidelity/hifi-content/commit/ac097f4)
- Initial release

# Known issues
- Currently, we can not remove the avatars with Agent.isAvatar = false, or the next time a recording is loaded, it appears as a white sphere in the origin.
- The setVolume for the Recording api also doesn't appear to be working properly.  Disabled in the html for now. 
- Because we are using the message mixer, sometimes we get into a state where the play/stop needs to be hit a few times.  Can be fixed with some more "handshake" implementation to ensure the messges were sent/received.  Leaving out for V1 in interest of time.

# Trello Card
https://trello.com/c/8SWztg7k/88-bot-tester-script-test-app-v1

# Future versions
- More handshakes for confirmation in the players.  Possibly status heartbeats.
- Additional types of bots to use.  I have 160 more unique bots with unique audio/movements of Mark's avatar that I'll next with a drop down or buttons.