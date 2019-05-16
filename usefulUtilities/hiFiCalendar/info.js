MeetingRoomZone:
    userData.occupantsListID
    =calls=
    if (_this.occupantsListID) {
        Entities.callEntityServerMethod(_this.occupantsListID, "enteredMeetingZone", [MyAvatar.sessionUUID, MyAvatar.sessionDisplayName]);
    }
    if (_this.occupantsListID) {
        Entities.callEntityServerMethod(_this.occupantsListID, "leftMeetingZone", [MyAvatar.sessionUUID]);
    }
    if (_this.occupantsListID) {
        Entities.callEntityServerMethod(_this.occupantsListID, "leftMeetingZone", [uuid]);
    }

    var CHANNEL = "HiFi.Meeting.Occupants";
===============================================

OccupantsServer:
    userData.meetingZoneID;
    userData.roomOccupantListID;
    ["enteredMeetingZone", "leftMeetingZone"]

    ////////////////////////////////////////
    Messages.sendMessage(CHANNEL, JSON.stringify({
        type: "REFRESH OCCUPANTS",
        id: that.meetingZoneID
    }));

    var CHANNEL = "HiFi.Meeting.Occupants";

==============================================

roomScheduleServer:
    userData.roomScheduleID
    userData.token
    userData.expireTime
    userData.timezoneOffset
    userData.timezoneName
    userData.address
    userData.roomColorID
    userData.roomColorOccupantsID
    userData.roomClockID
    userData.secondScheduleID
    ["refreshToken"]
    =calls=
    if (userData.secondScheduleID) {
        Entities.callEntityMethod(userData.secondScheduleID, "refreshToken", params);
    }
    ---
    Entities.callEntityMethod(TOKEN_SERVER_ID, "tokenCheck", [that.token, that.entityID]);

    ///////////////////////////////////////////////
var CHANNEL = "HiFi.Google.Calendar";


    Messages.sendMessage(CHANNEL, JSON.stringify({
        type: "ERROR",
        entityName: that.entityProperties.name,
        errorMessage: error,
        actionAttempted: "Requesting schedule from Google - Initial"
    }));


===============================================

tokenServer:
    userData.token
    userData.refreshToken
    userData.expireTime
    userData.timezone
    userData.timezoneOffset
    userData.clientID
    userData.secret
    userData.roomConfig
    userData.roomConfigured
    ["initializeRooms", "enteredDomain", "tokenCheck"]
    =calls=
    Entities.callEntityMethod(entity, "refreshToken", [
        params[0], 
        params[2], 
        params[4], 
        params[3],
        calendarAddress,
        calendarName
    ]);
    Entities.callEntityMethod(entity, "refreshToken", [
        that.token, 
        that.expireTime
    ]);

    //////////////////////////////////////

    var CHANNEL = "HiFi.Google.Calendar";


    Messages.sendMessage(CHANNEL, JSON.stringify({
        type: "STATUS UPDATE",
        tokenStatus: true,
        roomConfigured: true,
        roomConfig: that.roomConfig
    }));

    Messages.sendMessage(CHANNEL, JSON.stringify({
        type: "TOKEN EXPIRED",
        roomConfig: that.roomConfig
    }));

    Messages.sendMessage(CHANNEL, JSON.stringify({
        type: "ROOM DATA",
        message: that.roomConfig
    }));



==============================================

MeetingRoomSetup:
    =calls=
    Script.setTimeout(function(){
        Entities.callEntityServerMethod(TOKEN_SERVER_ID, "enteredDomain", AccountServices.username);
    }, DOMAIN_DELAY);

    Entities.callEntityServerMethod(TOKEN_SERVER_ID, "initializeToken", [
        token, 
        refreshToken, 
        expireTime, 
        timezone,
        timezoneOffset, 
        clientID,
        secret,
        roomConfig
    ]);

    var CHANNEL = "HiFi.Google.Calendar";

#############################################################
Zone Atlantis
"https://hifi-content.s3.amazonaws.com/Experiences/Releases/usefulUtilities/hiFiCalendar/2019-04-17_12-24-00-staging/entityScripts/hiFiMeetingZone.js?v3"

{
    "occupantsListID1": "{56682979-c566-46e1-b25e-c2b91af101d8}",
    "occupantsListID2": "{2d67ea55-3601-4c04-afff-4c9504954935}"
    (so this is the id with my name on it)
}

"occupantsListID1": "{56682979-c566-46e1-b25e-c2b91af101d8}",
-:
{
    "roomOccupantListID": "{56682979-c566-46e1-b25e-c2b91af101d8}",
    "roomScheduleID": "{4b6f47fe-646f-4b2c-9a7b-c74f3c47a105}"
}
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
"occupantsListID2": "{2d67ea55-3601-4c04-afff-4c9504954935}"
-:
{
    "roomOccupantListID": "{2d67ea55-3601-4c04-afff-4c9504954935}",
    "roomScheduleID": "{4b6f47fe-646f-4b2c-9a7b-c74f3c47a105}"
}
{52a01b43-0200-45d1-bd58-aab0e658bdb3}

{
    Atlantis1_roomSchedule: {52a01b43-0200-45d1-bd58-aab0e658bdb3}
    "roomScheduleID": "{52a01b43-0200-45d1-bd58-aab0e658bdb3}",

    Atlantis1_roomColorOccupants: {7c79e52c-ce57-4f5f-adae-eb14cd225a4c}
    "roomColorOccupantsID": "{7c79e52c-ce57-4f5f-adae-eb14cd225a4c}",

    Atlantis1_roomClock: {e06e348b-074b-4130-b8df-3aab434b213b}
    "roomClockID": "{e06e348b-074b-4130-b8df-3aab434b213b}",

    Atlantis1_roomOccupants: {2d67ea55-3601-4c04-afff-4c9504954935}
    "roomOccupantsListID": "{2d67ea55-3601-4c04-afff-4c9504954935}",

    Atlantis1_roomColor:
    "roomColorID": "{53020d11-0938-4383-9153-a15b9434f24c}",

    Atlantis:
    "roomCalendarAddress": "highfidelity.io_3438323439353030343438@resource.calendar.google.com",

    "token": "ya29.GlsCB6f-Q5m_RsUaCbFsjCGtLw53_8iQ05G56y0DWeCYDdeigDfmTMRcKbeac9CMDqsUDOB2MJ0FZ95trb87TJuSzuzAhmqqeIjhWoqp2UJPe28TDi6HWEm6IFYN",

    "expireTime": "1557250060831",

    "timezoneOffset": "7",

    "timezoneName": "PDT"
  }

------------------

{
    "roomOccupantListID": "{2d67ea55-3601-4c04-afff-4c9504954935}",
    "roomScheduleID": "{4b6f47fe-646f-4b2c-9a7b-c74f3c47a105}"
}

"https://hifi-content.s3.amazonaws.com/Experiences/Releases/usefulUtilities/hiFiCalendar/2019-04-17_12-24-00-staging/entityServerScripts/hiFiCalendarServer.js"

-------------------------
{
    "roomScheduleID": "{52a01b43-0200-45d1-bd58-aab0e658bdb3}",
    //
    -address-
    "roomCalendarAddress": "highfidelity.io_3438323439353030343438@resource.calendar.google.com",
    //
    "roomColorOccupantsID": "{7c79e52c-ce57-4f5f-adae-eb14cd225a4c}",
    //
    "roomClockID": "{e06e348b-074b-4130-b8df-3aab434b213b}",
    //
    "roomOccupantsListID": "{2d67ea55-3601-4c04-afff-4c9504954935}",
    //
    "roomColorID": "{53020d11-0938-4383-9153-a15b9434f24c}",
    //
    "token": "ya29.GlsCB6f-Q5m_RsUaCbFsjCGtLw53_8iQ05G56y0DWeCYDdeigDfmTMRcKbeac9CMDqsUDOB2MJ0FZ95trb87TJuSzuzAhmqqeIjhWoqp2UJPe28TDi6HWEm6IFYN",
    //
    "expireTime": "1557250060831",
    //
    "timezoneOffset": "7",
    //
    "timezoneName": "PDT"
}

"https://hifi-content.s3.amazonaws.com/Experiences/Releases/usefulUtilities/hiFiCalendar/2019-04-17_12-24-00-staging/entityServerScripts/hiFiCalendarServer.js"


- In general
- This needs to be made more generic and easier to setup if it is intended for others

In MettingRoomSetup_app.js
We need to provide it the tokenID
L57
// ### This is probably initializeRooms

L119
// # What is this doing exactly?  Is this in case the server reset for you? 

- In tokenServer.js
L42
// # need to change this to be dynamic trusted user

In RoomscheduleServer.js
L16
    // # figure out the token server ID

L121
// # What does this do, I don't see any references to this



Definitions
LabelIDs = the main information on the board // Also called Room Schedule IDS?  
ColorOccupantsID = occupied sign
ClockID = the clock info
OccupantsListID = the other text field
ColorID = The color at the top

hifiCalendarServer = roomScheduleServer //  Goes on the labelIDS thing

clockServer goes on clockID text

LabelIds ++ OccupantListID === roomScheduleServer.js

----------------

meetingRoomOccupantsServer.js
Actually I'm not sure now if this needs to go on the occupants list seperate
 // Ok so occupant list is definietly meetingroomoccupantsserver.js
// ahh that is why they are separted now... but what about that other shit i saw with ?  Probably old code
// that doesn't effect the occupant list anymore.  Find a way to test that


meetingRoom_ui.js
L23:
// # There is no other mention of oauth2-params

L531:
// # THIS IS NEVER USED : NO DATA

L547:
// THIS IS ALL FUCKED OFF, NOT SURE WHAT THIS OR THE LAST ONE IS - AVAILABLE ROOMS / ALREADY SET

L540:
// # THIS IS NEVER USED EITHER - AVAILABLE ROOMS

SessionStorage
'response'
'resources'

3 different transition functions
getCalendars()
 connectorPage("LOGIN");

editSpaces()
    deleteTableRow()
    "ALREADY SET" - EditSpaces("loging"); [[ completedConnections = data.completedConnections; ]]
    connectorPage - room info < 1 = editSpaces("see available")

    for (var i = 0; i < completedConnections.length; i++) {
        addTableRow(i, completedConnections);
    }
errorPage()
    "NO DATA" - errorPage("LOGIN")
    connectorPage - calendarInfo.length < 1 - calendarInfo - sessionStorage.getSelectedItemsList('resource')

connectionSuccess()
    click - linkerButton
    connectorPage("FINALIZE CHOICES");

editTableRow()    
    connectorPage("EDIT", tempObj);
    var tempObj = completedConnections.splice(row, 1)[0];

deleteTableRow()
    var tempObj = completedConnections.splice(row, 1)[0];


confirmConnections
    "SETUP COMPLETE"
    connectionData: completedConnections

changePages()
    "FINALIZE CHOICES" - completedConnections / roomInfo.push({})
    "EDIT" - completedConnections / roomInfo.push({})

------------------
Questions:
1.  Why is this using a local http server?  Any information on that is good. 
2. 



{
    "roomScheduleID": "{4b6f47fe-646f-4b2c-9a7b-c74f3c47a105}",
    "roomCalendarAddress": "highfidelity.io_3438323439353030343438@resource.calendar.google.com",
    "roomColorOccupantsID": "{fe7801f3-93b2-444f-929d-cbb2b634282c}",
    "roomClockID": "{3f851abc-7f4d-47bc-bfdd-042da3055e0d}",
    "roomOccupantsListID": "{56682979-c566-46e1-b25e-c2b91af101d8}",
    "roomColorID": "{38cf521a-1314-4e73-98d5-aa6b406603f8}",
    "token": "ya29.GlsCB6f-Q5m_RsUaCbFsjCGtLw53_8iQ05G56y0DWeCYDdeigDfmTMRcKbeac9CMDqsUDOB2MJ0FZ95trb87TJuSzuzAhmqqeIjhWoqp2UJPe28TDi6HWEm6IFYN",
    "expireTime": "1557250060831",
    "timezoneOffset": "7",
    "timezoneName": "PDT"
  }