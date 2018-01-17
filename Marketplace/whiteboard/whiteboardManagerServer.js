(function() {
    Script.include('utils.js');
    

    this.preload = function(entityID) {
        this.entityID = entityID;

        // Entity client and server scripts will send messages to this channel
        this.commChannelName = "whiteboard-" + this.entityID;
        Messages.subscribe(this.commChannelName);
        Messages.messageReceived.connect(this, this.onReceivedMessage);
        print("Listening on: ", this.commChannelName);
        Messages.sendMessage(this.commChannelName, 'hi');
    };
    this.unload = function() {
        Messages.unsubscribe(this.commChannelName);
    };
});