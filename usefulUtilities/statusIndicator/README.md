# Status Indicator
Let other avatars know your status!

This script creates a clickable button in upper right hand corner of your screen to set status to available or busy. The button only appears in Desktop mode.

A web app and database tracks these statuses. Using a web entity, you can display everyone's status in a table by going to:

To see everyone's status:
`https://<hostname>/getAllEmployees`

To see a team's list status:
`https://<hostname>/statusIndicator/team?teamName=<team name>`


## Setup

Run `<statusIndicator root>/hifiScript/statusIndicator.js` in High Fidelity's Running scripts.

## Hifi App Script Config

The code for this content is open source. You must set up some configuration files for this content to work:
1. A `secrets.json` file in `<statusIndicator root>/hifiScript/secrets.json` that contains the data below.

```
{
    "REQUEST_URL": "https://<hostname>/api/statusIndicator/" 
}
```

* During development this REQUEST_URL was `http://localhost:3305/`

## HTML Readouts Config

In `allEmployees.html` and `teamPage.html`, you will need to replace `http://localhost:3305/` with `https://<hostname>/api/statusIndicator/` in the `fetch` function call.

`allEmployees.html` and `teamPage.html` will display "Loading Data..." if the fetch fails or the teamName is incorrect.

## Web App Config

The code for this content is open source. You must set up some configuration files for this content to work:
1. A `dbInfo.json` file in `<statusIndicator root>/webApp/dbInfo.json` that contains the data below.

### `dbInfo.json`
Here's what your `dbInfo.json` file should look like:
```
{
    "mySQLHost": "<the host associated with your database>",
    "mySQLUsername": "<MySQL DB username>",
    "mySQLPassword": "<MySQL DB password>",
    "databaseName": "<the name of the database associated with the Status Indicator app>"
}
```

## Testing
You can perform a local 1-person test of this new code by doing the following:
1. Perform configuration steps as per the "Config" section above.
2. Run the `statusIndicator_webApp.js` Web app from a local NodeJS v10.15.1 installation.
    - Run `npm install` from the `webApp/app` directory
    - Run `node statusIndicator_webApp.js` from the `webApp/app` directory

# Release Notes

## v1.1 | 2019-04-03_17-02-00 | [commit 7a55088](https://github.com/highfidelity/hifi-content/commits/7a55088)
- Added the ability to get a specific user's status from the database
- Added the ability to set custom statuses via an API call (no frontend yet)

## v1.0 | 2019-04-03_12-43-00 | [commit f7011c77](https://github.com/highfidelity/hifi-content/commits/f7011c77)

- Initial Release.
