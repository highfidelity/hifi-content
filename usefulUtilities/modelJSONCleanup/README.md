# Description

Node script that can be used to help cleanup models.json

# Use

- Get an archive of the domain you would like
- Extract the zip
- Extract the models gzip file
- Duplicate the config.json file and fill out the fields
- Refer to the comments in the modelJSONCleanup file for more information on the fields in the config.json file
- Run `node modelJSONCleanup.js "<path to config file>"`
- If a path isn't provided for that argument, it will be assumed that the config.json is in the same directory as the js file
- You will get a log printed out a list of the entity types kept and deleted, and if it doesn't add up, you can tweak the fields in the config.json for new results
- Either gzip the models file and replace the content archive version, then zip up the content archive again and upload or just upload the new models.json

# Relesase Notes
### 2019-03-14_09-02-12 | 1.0 | [e29f0c0]

### 2019-03-25_14-48-08 | 1.1 | [0a422fa]
- Updated to use config.json

# Trello Link
https://trello.com/c/2OtVISFs/124-create-node-script-to-help-clean-up-modelsjson
