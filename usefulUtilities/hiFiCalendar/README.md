# High Fidelity Calendar
This app lets you integrate with the Google Calendar API to query meeting room schedules.


# Setup Instructions
1. Setup `meetingRoom_ui.html` by navigating to its folder location opening a powershell window from there. With Node.js installed enter the following commands into the powershell window: 
        `npm install -g http-server`
        `http-server -p 80`
2. In [Google's console API](https://console.developers.google.com/projectselector2/apis/credentials?supportedpurview=project), setup credentials to get an API Key, Client ID, and Client Secret.  Paste the Client ID into "meetingRoom_ui.html".  You will paste the others into the serverConfig.json file in the hifiWebApp folder.  
Define your permitted access locations to include http://localhost under Domain Verification.

3. Create a calendarConfig.json file in the root folder that looks like the following:
```
{
    "TOKEN_SERVER_ID": "<The id of your token server entity>",
    "REDIRECT_URI": "https://highfidelity.co/hifiCalendar/meetingRoom_ui.html",
    "API_BASE": "https://highfidelity.co/hifiCalendar/api/"
}
```

4. There is an entities JSON file containing the Calendar board entities, a meeting room zone, and a token server.

5. The user data for the different types will look like the following:
- Room Schedule Entity:
```
{
  "tokenServerID": "{...}",
  "roomScheduleID": "{...}",
  "roomColorID": "{...}",
  "roomColorOccupantsID": "{...}",
  "roomOccupantsListID": "{...}",
  "roomClockID": "{...}"
}
```

- Room Occupants List:
```
{
  "meetingZoneID": "{...}"
}

```

- Meeting Room Zone:

```
{
  "roomOccupantsListID": [
    "{455f56c8-9a76-420f-a8ab-6dad5da7358a}"
  ]
}
```

- Token Server:
```
{
  "calendarScheduleIDs": [
    {
      "name": "Meeting Room 1",
      "id": "{...}"
    },
    {
      "name": "Meeting Room 2",
      "id": "{...}"
    }
  ]
}
```

6. Drag and drop the `meetingRoomSetup_app.js` onto your interface window to run it. Open the app and authorize it with your Google Account information.


# Release Notes

## 3.8 | [commit 3f77849] | 2019-08-26_10-00-00
- No backend changes.
- Implemented heartbeat system for meeting room occupants to ensure accuracy of meeting room occupants list.
- Removed errant "Loading..." occupant in list upon startup.
- Added debug logging for use during development.

## 3.7 | [commit a023ca0] | 2019-07-03
- Entity JSON update to make sure the backboard isn't grabbable [BUGZ-912](https://highfidelity.atlassian.net/browse/BUGZ-912)

## 3.6 | [commit 04db990] | 2019-07-01
- Added new way to open up the calendar app in domains [DEV-96](https://highfidelity.atlassian.net/browse/DEV-96)

## 3.5 | [commit 43d222f] | 2019-06-26
- Fixed the spam log [JIRA 708](https://highfidelity.atlassian.net/browse/BUGZ-708)
- Fixed the learn more link [JIRA 822](https://highfidelity.atlassian.net/browse/BUGZ-822)

## 3.4 | [commit fdf2bae](https://github.com/highfidelity/hifi-content/pull/420/commits/fdf2bae) | 2019-06-26
- Made text entity smaller for event list to prevent overlap [JIRA 487](https://highfidelity.atlassian.net/browse/BUGZ-487)

## 3.3 | [commit 428bea52](https://github.com/highfidelity/hifi-content/pull/420/commits/428bea52) | 2019-06-21
- Added intro page for google verification

## 3.2 | [commit 9c01703](https://github.com/highfidelity/hifi-content/pull/415/commits/9c01703) | 2019-06-14
- Fixed double clicking the google button to create duplicate menus
- Created a custom drop-down solution

## 3.1 | [commit 63609a2](https://github.com/highfidelity/hifi-content/pull/400/commits/63609a2]) | 2019-06-11
- Change to encodeURI from encodeURIComponent

## 3.0 | [commit a12bea4](https://github.com/highfidelity/hifi-content/pull/400/commits/a12bea4) | 2019-05-23
- Created a token server backend 
- Moved configuration from userData to a JSON
- Used the PrivateData to store the tokens

## 2.0 | [commit cb8991d](https://github.com/highfidelity/hifi-content/pull/361/commits/cb8991d98223a7ad14dca809b8ba507bef9336cb)
- Authorization fixes, client app no longer needs to stay open.
- Clock script added
- Time display logic implemented for easier reading.

## 1.0 | [commit ad83a9d](https://github.com/highfidelity/hifi-content/pull/345/commits/ad83a9dc621196e80b234ba205803b61f42c1b88)
- Initial Release

# Known Issues
- If the occupants list needs to refresh, it will not get the current members in the zone area.  It does this by sending a message to the zone client script to send over who is in there, however I can't seem to get that message.  Will need to test further if this a platform bug.  
- Some timezone offsets may cause the day to wrap around.  Will fix this to have normalized values for 0-24