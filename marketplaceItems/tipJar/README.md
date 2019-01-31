# Tip Jar

## Description
The tip jar is a client entity a domain owner with rez rights can put in their domain.  It uses the commerce API to allow users to give a tip to whoever created the tip jar.  Through the userdata, the creator can choose who to send the money to, how much to send, and a message that will be displayed to users.  

## Instructions
Rez the tipjar and edit the userData to customize how the tip jar operates. Be mindful: Anyone who can change the tip jar's userdata can modify its parameters!

## Releases
[tipJar 4fe677f] :: 2019-01-30_09-49-14
- V1 QA Test

## Links
https://trello.com/c/UzXawXgg/38-tip-jar

## Known issues
- In HMD, opening the QML window in the tablet doesn't display the background correctly.

## Misc
- there is a file in entityResources/entity/tipJarSpawner.js.  This is a convenience file for testing so that you don't have to keep reimporting a JSON and will always have the updated code if there are any changes. 
- commit bff728f has the check balance request version.  Removing the balance check to simplify the code. 