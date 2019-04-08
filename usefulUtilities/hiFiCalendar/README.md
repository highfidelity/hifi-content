# High Fidelity Calendar
This app lets you integrate with the Google Calendar API to query meeting room schedules.

# Setup Instructions
1. Setup `hiFiCalendar.html` by copying it to the top level of your C:/ drive and opening a powershell window. Type the following command and press enter, `http-server -p 80` (You must have Node.js installed).
2. In [Google's console API](https://console.developers.google.com/projectselector2/apis/credentials?supportedpurview=project), setup credentials to get an API Key, Client ID, and Client Secret to paste in `hiFiCalendar.html` (WARNING: DO NOT SHARE THESE OR POST THEM IN A PUBLIC PLACE).  Define your permitted access locations to include http://localhost under Domain Verification.

```
        // Client ID and API key from the Developer Console
        var CLIENT_ID = '';
        var CLIENT_SECRET = '';
        var API_KEY = '';
```

3. Copy the calendar IDs into the html file from your Google Calendar, they'll look something like this:

```
        YourGoogleDomain123456789@resource.calendar.google.com
```

4. In Interface, create a "Text" entity with the same name you've given your calendar. Paste the server script URL into the `serverScript` field in Entity Properties.
5. Create another "Text" entity and name it the calendar name followed by `_SCHEDULE`.  Paste an empty serverscript URL onto this entity as well.  Additionally, copy the UUID of this entity and paste it as the parentID for the entity in `Step 4`.
6. Drag and drop the `hiFiCalendar_app.js` onto your interface window to run it. Open the app and authorize it with your Google Account information.  
7.  Currently, you must leave the app window open to keep the calendar entities up to date.


# Release Notes

## HiFi App v1.0 | [commit ad83a9d](https://github.com/highfidelity/hifi-content/pull/345/commits/ad83a9dc621196e80b234ba205803b61f42c1b88)
- Initial Release

## TO DO
1. Remove Room Label Entity and just have a schedule entity that changes colors in next version
2. Refactor authorization to allow app to run in the background.