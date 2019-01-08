# Last Avatar Standing Trivia Game

### Release Notes:

**January, 7, 2019**
Initial public release!

### Description

"Last Avatar Standing" is a Trivia game for High Fidelity.  A host controls the game and poses questions to players.  Players answer the questions by choosing 1 of 4 colored squares to stand on that represents their choice.  After 10 seconds, players standing on the wrong square are removed from the board via teleportation.  Points are winner take all, with the balance at the beginning of a game set to the number of players x 100 (minimum of 300).  If no one is correct for a given round, the prize is cut in half and everyone stays on the board.  As long as someone is right, the prize increases by 100 points each round.

https://trello.com/c/MmYfxGsq/14-package-and-release-last-avatar-standing-trivia-content

### Custom Database Use

If you wish to use a custom database for trivia events, you can insert the following code into triviaMasterClientStandard.js:
Be sure to replace the <code>trivia_URL</code> and <code>GSHEET_TAB_NAME</code> with the URL of your google sheet and the tab name where your database is.
    
        function getQuestion() {
            Entities.callEntityServerMethod(gameZoneProperties.id, "playSound", ['NEXT_QUESTION_SFX']);
            try {
                var triviaURL = SECRETS.trivia_URL,
                triviaURL = triviaURL + "category=" + "GSHEET_TAB_NAME";
                request(triviaURL, function (error, data) {
                    if (!error) {
                        console.log(JSON.stringify(data));
                        tablet.emitScriptEvent(JSON.stringify(data));
                        triviaData = data;
                    }
                });
            } catch (err) {
                console.log("err:", err);
                print("Could not get domain data using userData domainAPIURL");
            }
        }

### TO DO LIST

1. Fix a possible bug where findTargets() fails to find all needed entities.

