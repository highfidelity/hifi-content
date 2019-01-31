# Last Avatar Standing Trivia Game

### Release Notes:

**January 31, 2019**
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
2. Create an app loader that automatically loads the Host app in world.

