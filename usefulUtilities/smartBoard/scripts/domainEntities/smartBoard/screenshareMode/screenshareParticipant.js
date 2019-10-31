// This file may not be needed depending on the Meteverse API Call and how to interact with the actual local web entity
// I like having this file only be concerend about controlling the screenshare, but if this ends up being not very much code
// then maybe just move all of this back into the client script.
// the create local web entities should probably be moved here if we keep this around.

function registerRoom(room) {
    _this.room = room;
}


// check to see if you are the active screenshare to know if we should call the startScreenShareAPI
// startScreenShare(displayName, userName, token, sessionID, apiKey)
function startScreenshare(activePresenterUUID){
    /*
    call Metaverse for auth
    may look something like this:
    Metaverse.getScreenshareAuth(_this.room, function(token, sessionID, apiKey){
        _this.token = token;
        _this.sessionID = sessionID;
        _this.apiKey = apiKey;
    })

    */
    if (activePresenterUUID === MyAvatar.sessionUUID) {
        Screenshare.startScreenshare(AccountServices.username, MyAvatar.displayName, _this.token, _this.sessionID, _this.apiKey);
    }


}


var _this;
function ScreenshareParticipant(){
    _this = this;
    this.token = ".";
    this.sessionID = ".";
    this.apiKey = ".";
    this.activePresenterUUID;
    this.room;
    // this.webEntityID;
};

ScreenshareParticipant.prototype = {
    startScreenshare: startScreenshare,
    registerRoom: registerRoom
}

module.exports = new ScreenshareParticipant();