# Multi-Con VR Festival
It's a festival in VR!

## Config

The code for this content is open source. You must set up some configuration files for this content to work:
1. A `dbInfo.json` file in `<multiCon root>/webApps/multiConVote/dbInfo.json` that contains the data below.

### `dbInfo.json`
Here's what your `dbInfo.json` file should look like:
```
{
    "mySQLHost": "<the host associated with your database>",
    "mySQLUsername": "<MySQL DB username>",
    "mySQLPassword": "<MySQL DB password>",
    "databaseName": "<the name of the database associated with the Multi-Con Vote app>"
}
```

## Testing
You can perform a local 1-person test of this new code by doing the following:
1. Perform configuration steps as per the "Config" section above.
2. Run the `multiConVote.js` Web app from a local NodeJS v10.15.1 installation.
    - Run `node multiConVote.js` from the `webApps/multiConVote` directory.
3. Run MySQL locally.
    - You can create the necessary database and tables by modifying the `startup()` function within the `multiConVote.js` web app script.


# Release Notes

## v1.0 | 2019-xx-xx_xx-xx-xx | [commit xxxxxxx](https://github.com/highfidelity/hifi-content/commits/xxxxxxx)

- Initial Release.
