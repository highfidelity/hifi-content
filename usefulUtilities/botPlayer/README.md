# Bot Player
Bot Player helps with domain testing bots that need to be placed in a certain location, are a certain unique set, and that need to last through domain resets.

## Setup
1. use the [botRecorder.js](https://hifi-content.s3.amazonaws.com/Experiences/Releases/usefulUtilities/botPlayer/2019-06-06_15-39-13/botRecorder.js) to record the bots that you need.  When you click on the tablet button, it will start recording and then stop after you click it again. You can also use Alt+R.
2. Keep the script HMD log up to check on the status of the recording and to see where the file was saved.
3. Upload your bot files to a s3 directory(this is currently hardcoded in the manager file).
4. Add the following two scripts to the Domain scripts:
    - [assignmentClientManager.js](https://hifi-content.s3.amazonaws.com/Experiences/Releases/usefulUtilities/botPlayer/2019-06-06_15-39-13/assignmentClientManager.js)
    - [assignmentClientPlayer.js](https://hifi-content.s3.amazonaws.com/Experiences/Releases/usefulUtilities/botPlayer/2019-06-06_15-39-13/assignmentClientPlayer.js)
5. Add one for the manager, and make the player have as many as needed.

# Releases

## 2019-06-06_15-39-13 :: [53a8bb0](https://github.com/highfidelity/hifi-content/commit/53a8bb0)
- Initial release
