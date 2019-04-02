# Status Indicator
Let other avatars know your status!

Only available in desktop mode, creates a clickable status in upper right hand corner of screen to set status to available/busy. 

A web app and database tracks these statuses. Using a web entity, you can display everyone's status in a table by going to:

To see everyone's status:
`https://<hosted web app url>/getAllEmployees`

To see a team's list status:
`https://<hosted web app url>/?type=getTeamEmployees&teamName=ExampleTeamName`


## Setup

Run `<statusIndicator root>/hifiScript/statusIndicator_webApp.js` in High Fidelity's Running scripts.

## Hifi App Script Config

The code for this content is open source. You must set up some configuration files for this content to work:
1. A `secrets.json` file in `<statusIndicator root>/hifiScript/secrets.json` that contains the data below.

```
{
    "REQUEST_URL": "https://<hosted web app url>/" 
}
```

* During development this REQUEST_URL was `http://localhost:3305/`

## Web App Config

The code for this content is open source. You must set up some configuration files for this content to work:
1. A `dbInfo.json` file in `<statusIndicator root>/webApp/dbInfo.json` that contains the data below.
2. A `config.json` file in `<statusIndicator root>/config/config.json` that contains the data below.

### `dbInfo.json`
Here's what your `dbInfo.json` file should look like:
```
{
    "mySQLHost": "<the host associated with your database>",
    "mySQLUsername": "<MySQL DB username>",
    "mySQLPassword": "<MySQL DB password>",
    "databaseName": "<the name of the database associated with the Multi-Con app>"
}
```

### `config.json`
Here's what your `config.json` file should look like:
```
{
    "unloadTimestampUTC": "<The UTC timestamp of the time after which the app should automatically unload>"
}
```

## Testing
You can perform a local 1-person test of this new code by doing the following:
1. Perform configuration steps as per the "Config" section above.
2. Run the `statusIndicator_webApp.js` Web app from a local NodeJS v10.15.1 installation.
    - Run `npm install` from the `webApp/app` directory
    - Run `node statusIndicator_webApp.js` from the `webApp/app` directory
3. Run MySQL locally.
    - You can create the necessary database and tables by modifying the `startup()` function within the `statusIndicator_webApp.js` web app script.


# Release Notes

## v1.0 | 2019-03-18_11-48-00 | [commit 41df1a4](https://github.com/highfidelity/hifi-content/commits/41df1a4)

- Initial Release.
