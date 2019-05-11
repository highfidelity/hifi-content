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

#############################################################
Zone Atlantis
"https://hifi-content.s3.amazonaws.com/Experiences/Releases/usefulUtilities/hiFiCalendar/2019-04-17_12-24-00-staging/entityScripts/hiFiMeetingZone.js?v3"

{
    "occupantsListID1": "{56682979-c566-46e1-b25e-c2b91af101d8}",
    "occupantsListID2": "{2d67ea55-3601-4c04-afff-4c9504954935}"
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


