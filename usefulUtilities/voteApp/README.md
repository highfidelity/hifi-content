# Vote App

Vote App integrates with Google Sheets via Google Scripts API and High Fidelity allowing users to "vote" on contests.

## Setup
- Run voteApp.js in Edit/"Running Scripts..." or use a script loader.

## zoneScripts
To require a user to visit a specific area before voting (other than a domain), the vote app can be configured to utilize zoneScripts/verifyVisitedZone.js as a zone entity script. Only after the user visits this zone will the user be able to vote. 