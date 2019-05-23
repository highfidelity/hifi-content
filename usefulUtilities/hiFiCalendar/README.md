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
    "ROOMS": {
        "<The name of your room>": {
            "MAIN": {
                "roomColorID": "<The id of the top bar that says in use/available>",
                "roomScheduleID": "<The id for the main schedule section of the board>",
                "roomColorOccupantsID": "<The color 'occupants' signed aligning with the colorID>",
                "roomClockID": "<The Id of the clock on the wall>",
                "roomOccupantsListID": "<The bottom list of who is in the meeting room>"
            },
            "SECONDARY": { // this is if you have a second schedule board up.  The main one will just feed it whatever it needs for UI
                    ...<same kind of ids as above>
            },
            "ZONE": "{741a2c33-a866-404f-b9fa-ab34d5edc495}"
        },
    },
    "REDIRECT_URI": "https://highfidelity.co/hifiCalendar/meetingRoom_ui.html",
    "API_BASE": "https://highfidelity.co/hifiCalendar/api/"
}
```
Capitalize the keys like above.  

4. There is an entities JSON file containing the Calendar board entities, a meeting room zone, and a token server.

5. Rename any entities in the following pattern: Calendar_RoomName_RoomType[Main|Secondary]_entity. (important)

6. Drag and drop the `meetingRoomSetup_app.js` onto your interface window to run it. Open the app and authorize it with your Google Account information.


# Release Notes

## 3.0 | 900b27f | 2019-05-23
  - Created a token server backend 
  - Moved configuration from userData to a JSON
  - Used the PrivateData to store the tokens

## 2.0 | [commit cb8991d](https://github.com/highfidelity/hifi-content/pull/361/commits/cb8991d98223a7ad14dca809b8ba507bef9336cb)
- Authorization fixes, client app no longer needs to stay open.
- Clock script added
- Time display logic implemented for easier reading.

## 1.0 | [commit ad83a9d](https://github.com/highfidelity/hifi-content/pull/345/commits/ad83a9dc621196e80b234ba205803b61f42c1b88)
- Initial Release