# Deploy New Scripts App
This app lets you quickly replace old client and server scripts on entities with new scripts.

# Usage Instructions
1. Go to a domain in which client and/or server scripts on entities need to be updated.
2. Open the DEPLOY app.
3. Paste your desired inputs and press SUBMIT, then confirm your choice. **CAUTION:** Once you confirm your choice to change entity scripts/server scripts, you cannot undo your edits!

## What's "Substring Matching"?
Let's say you have a bunch of entities in your domain, three of which contain entity scripts like this:
- https://mydomain.com/releases/v3/entity1/entityScripts/script.js
- https://mydomain.com/releases/v3/entity2/entityScripts/script.js
- https://mydomain.com/releases/v3/thisOtherEntity/entityScripts/script.js

Say you want to update all of these entity scripts in one fell swoop to use the "v4" release. Simply enable "Substring Matching" in the DEPLOY app, then enter the following:
- In "Old Client Script Substring", enter `/v3/`
- In "New Client Script Substring", enter `/v4/`

Press "SUBMIT", confirm your choice, and you're done!

# Release Notes

## 2019-03-20_16-53-00 | [commit be9f241](https://github.com/highfidelity/hifi-content/commits/be9f241)
- Initial Release