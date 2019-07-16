# Status Indicator
Let other avatars know your status!

This script creates a clickable button in upper right hand corner of your screen to set status to available or busy. The button only appears in Desktop mode.

## "Directory Board" Setup

A web app and database tracks these statuses. Using a web entity, you can display everyone's status in a table by going to:

To see everyone's status:
`https://<hostname>/getAllEmployees`

To see a team's list status:
`https://<hostname>/statusIndicator/team?teamName=<team name>`

For automated setup:
1. Rez a Web entity
2. Attach `directoryClientScript.js` as a script on that Web entity.


## Setup

Run `<statusIndicator root>/hifiScript/statusIndicator.js` in High Fidelity's Running scripts.

## locationZoneClient.js Config

Update REQUEST_URL variable to `https://<hostname>/api/statusIndicator/`.

Add `locationZoneClient.js` as a client script to a zone entity. When a user enters the zone entity, the zone will update the user's location to the zone's name.

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
1. A `config.json` file in `<statusIndicator root>/webApp/config.json` that contains the data below.

### `config.json`
Here's what your `config.json` file should look like:
```
{
    "mySQLHost": "<the host associated with your database>",
    "mySQLUsername": "<MySQL DB username>",
    "mySQLPassword": "<MySQL DB password>",
    "databaseName": "<the name of the database associated with the Status Indicator app>",
    "wwwRoot": "<a URL to the remote host serving the files in `/webApp/www`. include the trailing slash. used for testing so that the `canary` API endpoint knows where to check. example: https://example.com/statusIndicator/>"
}
```

## Testing
You can perform a local 1-person test of this new code by doing the following:
1. Perform configuration steps as per the "Config" section above.
2. Run the `statusIndicator_webApp.js` Web app from a local NodeJS v10.15.1 installation.
    - Run `npm install` from the `webApp/app` directory
    - Run `node statusIndicator_webApp.js` from the `webApp/app` directory

# Release Notes

## v2.5 | 2019-07-16_11-06-29 | [commit ac44aee](https://github.com/highfidelity/hifi-content/commits/ac44aee)
- Updated `statusIndictaor.js` to remove session display name.  

## v2.4 | 2019-06-25_15-46-00 | [commit ac44aee](https://github.com/highfidelity/hifi-content/commits/ac44aee)
- Added `directoryClientScript.js` to help make directory setup process easier.

## v2.4 | 2019-04-08_09-11-00 | [commit a2477fb](https://github.com/highfidelity/hifi-content/commits/a2477fb)
- Added a `canary` HTTP GET endpoint for monitoring
- Renamed `dbInfo.json` to `config.json` to support the `canary` endpoint

## v2.3 | 2019-04-08_09-11-00 | [commit ad7d554](https://github.com/highfidelity/hifi-content/commits/ad7d554)
- Added 'organization' column to database. Status board will now only show members of one organization (named after the domain)
- Fixed [Bug 183](https://highfidelity.atlassian.net/browse/BUGZ-183) where status overlay would disappear when moving or resizing the window
- Fixed [Bug 151](https://highfidelity.atlassian.net/browse/BUGZ-151) where changing domains would throw an error

## v2.2 | 2019-04-08_09-11-00 | [commit ac1fbb0](https://github.com/highfidelity/hifi-content/commits/ac1fbb0)
NO VERSION BUMPS - Web App Frontend Change Only!
- Added an "online" count to the Directory page per-team
- Improved the look of custom statuses on the Directory

## v2.2 | 2019-04-08_09-11-00 | [commit d161426](https://github.com/highfidelity/hifi-content/commits/d161426)
NO VERSION BUMPS - Web App Frontend Change Only!
- Gave the Directory pages fresh new looks!

## v2.2 | 2019-04-08_09-11-00 | [commit 0429529](https://github.com/highfidelity/hifi-content/commits/0429529)
- Fixed onEnterEntity bug inside locationZoneClient.js

## v2.1 | 2019-04-08_09-11-00 | [commit 009d7aa](https://github.com/highfidelity/hifi-content/commits/009d7aa)
- Changed the "GET DATA" API to return JSON instead of HTML
- Updated styling of HTML

## v2.0 | 2019-04-08_09-11-00 | [commit 2ab4badf](https://github.com/highfidelity/hifi-content/commits/2ab4badf)
- Added set location functionality with a function call 
- Added zone client script where user enters the zone, and the zone updates user location to the name of the zone

## v1.1 | 2019-04-03_17-02-00 | [commit 9159ae0](https://github.com/highfidelity/hifi-content/commits/9159ae0)
- Added the ability to get a specific user's status from the database
- Added the ability to set custom statuses via an API call (no frontend yet)

## v1.0 | 2019-04-03_12-43-00 | [commit f7011c77](https://github.com/highfidelity/hifi-content/commits/f7011c77)

- Initial Release.
