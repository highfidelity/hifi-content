# High Fidelity Calendar
This app lets you integrate with the Google Calendar API to query meeting room schedules.


# Setup Instructions
1. Setup `hiFiCalendar.html` by navigating to its folder location opening a powershell window from there. With Node.js installed enter the following commands into the powershell window: 
        `npm install -g http-server`
        `http-server -p 80`
2. In [Google's console API](https://console.developers.google.com/projectselector2/apis/credentials?supportedpurview=project), setup credentials to get an API Key, Client ID, and Client Secret to paste in `hiFiCalendar.html` (WARNING: DO NOT SHARE THESE OR POST THEM IN A PUBLIC PLACE).  Define your permitted access locations to include http://localhost under Domain Verification.

```
        // Client ID and API key from the Developer Console
        var CLIENT_ID = '';
        var CLIENT_SECRET = '';
        var API_KEY = '';
```

3. Copy the calendar IDs from your Google Calendar into the roomScheduleEntity userData, they'll look something like this:

```
        roomScheduleID: YourGoogleDomain123456789@resource.calendar.google.com
```

4. Drag and drop the JSONs for the meeting zone and calendar schedule into the High Fidelity Interface window go through each of the entities and make sure all the userData is filled out with the appropriate UUIDs.  Then refresh the server scripts on each of them.
5. Drag and drop the `hiFiCalendar_app.js` onto your interface window to run it. Open the app and authorize it with your Google Account information.  You will need to perform this action each time you reload content or restart the interface.


# Release Notes

## HiFi App v2.0 | [commit cb8991d](https://github.com/highfidelity/hifi-content/pull/361/commits/cb8991d98223a7ad14dca809b8ba507bef9336cb)
- Authorization fixes, client app no longer needs to stay open.
- Clock script added
- Time display logic implemented for easier reading.
## HiFi App v1.0 | [commit ad83a9d](https://github.com/highfidelity/hifi-content/pull/345/commits/ad83a9dc621196e80b234ba205803b61f42c1b88)
- Initial Release


## TO DO
1. Simplify authorization and user setup of meeting rooms
2. Refresh meeting room zones upon token refreshes.


## Technical Details
1. The very first time your HTML UI is open, OR whenever you need to manually kickoff the token process, you'll get here (the HTML UI's JS will send the "TOKEN" message to the app JS). Included in that message data is:
        - The authorization code to be exchanged for access and refresh tokens.
You will need the client script to keep track of the tokens it has sent during the session.
2. Request access and refresh tokens from the Google Authentication serviceSend that data to each of the calendar schedule entities. You could store the data in userData, OR you could store the data in the RAM of the ESS (which would be safer, but slightly more error-prone - your call)
3. Tell each calendar schedule entity to immediately refresh the calendar data (you can do that with Entities.callEntityServerMethod() after defining some remotelyCallable method on the server script). When this call is received, the server script will also cancel any "auto-refresh-calendar-events" timer that's currently active.
4. Also tell each calendar schedule entity to kick off a timer that will expire N seconds before the OAuth token expires. When that timer expires, the server script will send a message (over the messages mixer, probably) to all clients able to accept that method, which will hopefully only be you. The message data will contain the OAuth token that the server script is currently using.
5. When your client script receives this message, it will check to see if it's already tried to refresh that token (see the last sentence in (1)). If it hasn't, it should use the request module to submit a POST request to `https://www.googleapis.com/oauth2/v4/token` to renew that token. Once the response from Google is received, it'll send a message to the calendars that requested that THAT specific token be refreshed. (So, this script will have to keep track of the old version and refreshed version of each token).
6.  When this call is received, the server script will immediately refresh calendar data. It'll also cancel any "auto-refresh-calendar-events" timer that's currently active.