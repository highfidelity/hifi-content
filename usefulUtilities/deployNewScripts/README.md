# Deploy Tool
This tool lets you quickly replace old client scripts, server scripts, and `userData` on entities with new data.

# Usage Instructions
1. Go to a domain in which client scripts, server scripts, and/or `userData` on entities need to be updated.
2. Open the DEPLOY app.
3. Paste your desired inputs and press SUBMIT, then confirm your choice. **CAUTION:** Once you confirm your choice to change content, you cannot undo your edits!

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

## v1.1 | [commit 071445f](https://github.com/highfidelity/hifi-content/commits/071445f)
- Added the ability to modify the `userData` property of entities using the Deploy Tool.
- The Tool will now display the names of the entities that are going to be modified.

## 2019-03-20_16-53-00 | [commit 40ba106](https://github.com/highfidelity/hifi-content/commits/40ba106)
- Initial Release