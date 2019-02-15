# Last Avatar Standing Trivia Game

### Release Notes:
**February 15, 2019**
[226b233](https://github.com/highfidelity/hifi-content/pull/296/commits/226b23350415dbeec5549ade39ba53bc14996667)
Version 1.1.1
- Fixed bug with triviaURL string for Google databases having "category=" tacked onto the end of it and invalidating the URL when "Get Question" is pressed.

**February 5, 2019**
[f3f05c0](https://github.com/highfidelity/hifi-content/pull/279/commits/f3f05c0cd3eabd8d65a1c20175069b1d33b5a688)

Version 1.1:
- Bug fixes 
- Tablet App style and functionality updates.
- Support for switching between custom databases.
- Display board style updates

**January, 7, 2019**
Initial public release!


### Description

"Last Avatar Standing" is a Trivia game for High Fidelity.  A host controls the game and poses questions to players.  Players answer the questions by choosing 1 of 4 colored squares to stand on that represents their choice.  After 10 seconds, players standing on the wrong square are removed from the board via teleportation.  Points are winner take all, with the balance at the beginning of a game set to the number of players x 100 (minimum of 300).  If no one is correct for a given round, the prize is cut in half and everyone stays on the board.  As long as someone is right, the prize increases by 100 points each round.

https://trello.com/c/MmYfxGsq/14-package-and-release-last-avatar-standing-trivia-content

### Custom Database Use

If you wish to use a custom database for trivia events, you can follow the instructions below on setting up a Google Spreadsheet and script to be accessed by the application.  Once your database is ready, select the "Misc. Catalog" option in the Trivia Host app and copy your Google Apps Script URL into the first pop up, and the name of the sheet tab that contains your database on the second pop-up.

Alternatively, if High Fidelity has a custom database set up for you, select "Custom Catalog" and enter the Google sheet tab name they gave you in the pop-up.

You can switch databases at any time, but to re-enter custom or miscellaneous databases, you will need to copy in the correct information again.

### TO DO LIST

1. Write up instructions on how to format a Google Sheets custom trivia database and Google script.
2. Create an app loader that automatically loads the Host app in-world.
3. Condense color check scripts into one.
4. Simplify html with button state-machine.
5. Replace timeout on unloading the color check scripts with a callback when player removals are complete.
6. There is a known issue with the time gap between events when the timer finishes counting down, the determination of the game state, and the potential removal of players from the board that may affect players who are transitting answer zone boundaries at the end of the countdown and immediately thereafter.  Players are advised to select and move to their answer as quickly as possible and remain there until a new question is posted.


