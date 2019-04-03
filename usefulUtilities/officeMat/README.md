# Office Mat
This project folder contains a number of entity scripts that attach to an Office Mat, the Office Mat Squares, or the zones that surround the Office Mat Squares. These entity scripts do cool things.

# Features
- When you step onto a red, yellow, or grey Office Mat Squares, a script will update your status on the High Fidelity Status Indicator database to "busy".
- When you step onto a green Office Mat Square, a script will update your status on the High Fidelity Status Indicator database to "available".

# Setup Instructions
1. Create a `<matSquares Folder>/config/config.json` file that contains the data below.
1. Add the below User Data to each of the four zones that surround your four mat squares.
2. Attach `entityScripts/zones/squareZone.js` to the zone that surrounds the red mat square.
3. Attach `entityScripts/zones/squareZone.js` to the zone that surrounds the yellow mat square.
4. Attach `entityScripts/zones/squareZone.js` to the zone that surrounds the green mat square.
5. Attach `entityScripts/zones/squareZone.js` to the zone that surrounds the grey mat square.

## `config.json`
```
{
    "requestURL": "<A URL to the 'Status Update' API endpoint>"
}
```

## Zone User Data
```
{
    "squareType": "<red|yellow|green|grey>",
    "usernameWhitelist": ["<The username of a user for whom the script will work>"]
}
```

# Release Notes

## v1.0 | [commit xxxxxxx](https://github.com/highfidelity/hifi-content/commits/xxxxxxx)
- Initial Release