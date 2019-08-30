# Status Indicator
Let other people know your status!

This feature consists of a High Fidelity Interface client script and a backend Node.js Web application.

The client script creates a clickable button in the upper right-hand corner of your screen to set your status to "available" or "busy". The button only appears in Desktop mode.

## "Directory Board" Setup
A Web app and database tracks individuals' statuses. Using an in-world Web entity, you can display everyone's status in a table by setting the URL of the Web entity to:
`https://<hostname>/getAllEmployees.html?organization=<the organization associated with the users whose status you want to see>`

For automated setup of an in-world "Directory" Web entity:
1. Rez a Web entity
2. Attach `directoryClientScript.js` as a script on that Web entity.


## High Fidelity Script Setup

You must set up some configuration files for the client script to work:
1. A `secrets.json` file in `<statusIndicator root>/hifiScript/secrets.json` that contains the data below.

```
{
    "REQUEST_URL": "https://<hostname>/api/statusIndicator/" 
}
```

* During development and local testing, this REQUEST_URL was `http://localhost:3305/`

Once `secrets.json` is set up, run `<statusIndicator root>/hifiScript/statusIndicator.js` in High Fidelity's Running Scripts.

Note that this is not necessary if you are using Simplified UI; Simplified UI includes "Simplified Status Indicator" functionality.

## locationZoneClient.js Setup

Add `locationZoneClient.js` as a client script to a zone entity. When a user enters the zone entity, the zone will update the user's location to the zone's name.

Make sure to update the `REQUEST_URL` variable to the location of the Status Indicator API, usually `https://<hostname>/api/statusIndicator/`.

## HTML Frontend Setup

In `webApp/www/allEmployees.html`, you will need to replace `http://localhost:3305/` in the `fetch` function call with the remote location of the Status Indicator API, usually `https://<hostname>/api/statusIndicator/`.

`allEmployees.html` will display "Loading Data..." if the fetch fails.

## Web App Config

You must set up a configuration file for the Status Indicator Web App to work:
1. A `config.json` file in `<statusIndicator root>/webApp/config.json` that contains the data below.

### `config.json`
Here's what your `config.json` file should look like:
```
{
    "mySQLHost": "<the host associated with your database>",
    "mySQLUsername": "<MySQL DB username>",
    "mySQLPassword": "<MySQL DB password>",
    "databaseName": "<the name of the database associated with the Status Indicator app>",
    "wwwRoot": "<a URL to the remote host serving the files in `/webApp/www/`. include the trailing slash. used for testing so that the `canary` API endpoint knows where to check. example: https://example.com/statusIndicator/>"
}
```

## Testing
You can perform a local test of the Status Indicator system by doing the following:
1. Perform the configuration steps as per the "High Fidelity Script Setup" section.
2. Perform the configuration steps as per the "HTML Frontend Setup" section.
3. Ensure a MySQL Server is running somewhere over which you have control (a local installation of [MySQL Community Edition](https://www.mysql.com/downloads/) works perfectly).
4. Perform the configuration steps as per the "Web App Config" section.
5. Run the `statusIndicator_webApp.js` Web app from a local NodeJS v10.15.1 installation:
    1. Run `npm install` from the `webApp/app` directory
    2. Run `node statusIndicator_webApp.js` from the `webApp/app` directory
6. Run a local HTTP server from the `webApp/www` directory:
    1. Run `npm install -g http-server` from the `webApp/www` directory (you only have to do this once)
    2. Run `http-server -p 80` from the `webApp/www` directory
7. Seed the correct Status Indicator MySQL database with valid data.
8. Go to `http://localhost/allEmployees.html` in your browser. 

# Release Notes

## Backend: v2.6 | Interface Scripts: 2019-08-30_11-39-00 | [commit 6504ca2](https://github.com/highfidelity/hifi-content/commits/6504ca2)
- The Status Update's "organization" will now be `location.domainID` instead of `location.hostname`.
- The Directory Client Script will now propertly set the organization of the Web Entity based on `location.domainID`.

## Backend: v2.6 | Interface App: 2019-07-26_10-50-00 | [commit 134bb43](https://github.com/highfidelity/hifi-content/commits/134bb43)
- Completely removed the notion of "team names" from Status Indicator. This means `teamPage.html` no longer exists, and interfaces that get data from the server via the status indicator backend APIs can no longer be formatted based off of team names.

## Backend: v2.5 | Interface App: 2019-07-16_11-06-29 | [commit 4ad6031](https://github.com/highfidelity/hifi-content/commits/4ad6031)
- On the status indicator website, don't show the 'UNKNOWN TEAM' header when that's the only org name returned in the results. Instead, show "PEOPLE".

## v2.4 | 2019-07-16_11-06-29 | [commit 0ba3f3c](https://github.com/highfidelity/hifi-content/commits/0ba3f3c)
- Updated `statusIndicator.js` to remove session display name logic.

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
