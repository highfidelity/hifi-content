# Office Mat
This project folder contains a number of entity scripts that attach to an Office Mat, Office Mat Squares, or the zones that surround the Office Mat Squares. These entity scripts do cool things.

# Features
- When you step onto a red, yellow, or grey Office Mat Squares, a script will update your status on the High Fidelity Status Indicator database to "busy". Alternatively, if configured, the script will update your status to some custom text.
- When you step onto a green Office Mat Square, a script will update your status on the High Fidelity Status Indicator database to "available". Alternatively, if configured, the script will update your status to some custom text.

# Office Mat Setup - The Easy Way
## The Easy Way
1. Ensure that you're running the latest version of the `statusIndicator.js` script.
2. In Interface, go to `Edit -> Import JSON from URL`. Paste this link and press enter: `https://hifi-content.s3.amazonaws.com/Experiences/Releases/usefulUtilities/officeMat/v1.0/officeMat.json`
3. Using Create, modify the text entities as you see fit. Your status will display what these text entities show when you walk into their associated square, so be creative!
4. Ensure each Office Mat Square Zone is set up properly:
    1. Select a Zone entity labeled "Office Mat Square Zone - <color>"
    2. Scroll to the "User Data" section of the Properites window.
    3. Replace the word `replaceMe` with your username.
    4. Click "SAVE USER DATA".
    5. Click the refresh button to the right of the "Script" field.
5. Move the mat around as you wish. Lock entities as you wish.

You're done! If you step on any of your new Office Mat Squares, your status will automatically update.

# Office Mat Setup - The Custom Way
1. Ensure that you're running the latest version of the `statusIndicator.js` script.
2. Create a `<matSquares Folder>/config/config.json` file that contains the data below.
3. Rez a Box entity to act as your "Office Mat".
4. Rez another Box entitity to act as your first "Office Mat Square". You will stand on these Squares to update your in-world status.
5. Rez a Zone entity and position it so that you are inside that zone when you step inside the Square you just rezzed. Parent this Zone entity to your Office Mat Square from (2).
6. (Optional) Rez a Text entity and position it so that the text is readily associated with the status of that square. Parent this Text entity to your Office Mat Square from (2).
    - The text on this Text entity will be your custom status when you stand on the Square associated with that Text entity.
7. Add the below User Data to the Zone entity from (4).
8. Attach `entityScripts/zones/squareZone.js` as an Entity Script to the Zone entity from (4).
9. Clone this Mat Square, Zone entity, and Text entity as many times as you want.
    - I use four Office Mat Squares.
10. Position your Office Mat Squares on top of your Office Mat, then parent the Squares to the Mat.

You're done! If you step on any of your new Office Mat Squares, your status will automatically update.

## `config.json`
```
{
    "requestURL": "<A URL to the 'Status Update' API endpoint>"
}
```

## Zone User Data
```
{
    "usernameWhitelist": ["<The username of a user for whom the script will work. Usually your username. At least one username is required to be present in this array.>"],
    "squareType": <Optional if text entities are present. Can be one of: "red|yellow|green|grey". "red"/"yellow"/"grey" square types indicate "busy"; "green" indicates "available">
}
```

# Release Notes

## v1.0 | [commit 71ae13d](https://github.com/highfidelity/hifi-content/commits/71ae13d)
- Initial Release