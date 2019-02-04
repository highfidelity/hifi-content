# Tip Jar

## Description
The tip jar is a client entity a domain owner with rez rights can put in their domain.  It uses the commerce API to allow users to give a tip to whoever created the tip jar.  Through the userdata, the creator can choose who to send the money to, how much to send, and a message that will be displayed to users.  

## Instructions
Rez the tipjar and edit the userData to customize how the tip jar operates. Be mindful: Anyone who can change the tip jar's userdata can modify its parameters!

## Releases
[tipJar 4fe677f] :: 2019-01-30_09-49-14
- V1 QA Test

[tipJar 2759567] :: 2019-01-30_17-07-41
- Removed the balance checking code to simplify
- Added a cap at 1 million hfc

[tipJar 704f869] :: 2019-01-31_03-55-00
- Changed the click sound

## Links
https://trello.com/c/UzXawXgg/38-tip-jar

## Known issues
- In HMD, opening the QML window in the tablet doesn't display the background correctly.
- 2019-02-01_11-19-12: Currently you have to enter the user name with case sensitivity.  This is being looked into and should be resolved soon.

## Misc
- There is a file in entityResources/entity/tipJarSpawner.js.  This is a convenience file for testing so that you don't have to keep reimporting a JSON and will always have the updated code if there are any changes. 
- Commit bff728f has the check balance request version.  Removing the balance check to simplify the code.
    - We were trying to make sure the money went through first before making the animation feedback.
    - There aren't many hook we can latch on to so we tried a polling approach.  The version we had worked very well in testing, however it did complicate the code trying to account for all the edge cases and we wanted to make sure this would be easy to follow for other developers. 
    - Refactoring to a state machine and/or timestamping the request would be alternate approaches.