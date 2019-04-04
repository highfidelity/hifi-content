# Office Mat
This project folder contains a number of entity scripts that attach to an Office Mat, Office Mat Squares, or the zones that surround the Office Mat Squares. These entity scripts do cool things.

# Features
- When you step onto a red, yellow, or grey Office Mat Squares, a script will update your status on the High Fidelity Status Indicator database to "busy". Alternatively, if configured, the script will update your status to some custom text.
- When you step onto a green Office Mat Square, a script will update your status on the High Fidelity Status Indicator database to "available". Alternatively, if configured, the script will update your status to some custom text.

# Office Mat Setup
1. Create a `<matSquares Folder>/config/config.json` file that contains the data below.
2. Rez a Box entity to act as your "Office Mat".
3. Rez another Box entitity to act as your first "Office Mat Square". You will stand on these Squares to update your in-world status.
4. Rez a Zone entity and position it so that you are inside that zone when you step inside the Square you just rezzed. Parent this Zone entity to your Office Mat Square from (2).
5. (Optional) Rez a Text entity and position it so that the text is readily associated with the status of that square. Parent this Text entity to your Office Mat Square from (2).
    - The text on this Text entity will be your custom status when you stand on the Square associated with that Text entity.
6. Add the below User Data to the Zone entity from (4).
7. Attach `entityScripts/zones/squareZone.js` as an Entity Script to the Zone entity from (4).
8. Clone this Mat Square, Zone entity, and Text entity as many times as you want.
    - I use four Office Mat Squares.
9. Position your Office Mat Squares on top of your Office Mat, then parent the Squares to the Mat.

## `config.json`
```
{
    "requestURL": "<A URL to the 'Status Update' API endpoint>"
}
```

## Zone User Data
```
{
    "usernameWhitelist": ["<The username of a user for whom the script will work. At least one username is required to be present in this array.>"],
    "squareType": <Optional if text entities are present. Can be one of: "red|yellow|green|grey". "red"/"yellow"/"grey" square types indicate "busy"; "green" indicates "available">
}
```

# Release Notes

## v1.0 | [commit xxxxxxx](https://github.com/highfidelity/hifi-content/commits/xxxxxxx)
- Initial Release