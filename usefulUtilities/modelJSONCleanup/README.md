# Description

Node script that can be used to help cleanup models.json

# Use

- Get an archive of the domain you would like
- Extract the zip
- Extract the models gzip file
- Duplicate the generic js filter file for the specific domain
- In the JS file add the path to the models.json and the new models.json
- Follow the comment instructions to tweak to your needs
- Save and run node "nameOfTheJSFile"
- You will get a log of what was kept and deleted, if it doesn't add up, you can tweak the results
- Either gzip the models file and replace the content archive version, then zip up the content archive again and upload or just upload the new models.json

# Relesase Notes
### 2019-03-14_09-02-12 | 1.0 | [e29f0c0]