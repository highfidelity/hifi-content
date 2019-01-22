The Happy Boombox is here to play music in your domain for all to hear! This open source project is dual licensed under the PoP License and Apache 2.0 license. The boom box comes preloaded with 9 songs and can be controlled by anyone in your domain by clicking or near triggering on the red button to open up the controller app, which will let you change the playing song, stop the music, or update the volume of the boombox.

Customizing Music

If you are hosting your own audio (.wav or .mp3) files, you can replace the links in the userdata of the boombox to play your own music in the domain. Open up the Create menu, scroll down to the userdata section, and add (or replace) the existing song names and urls with the new ones. This boombox can hold around 10 songs total depending on the length of the urls that are used.

Notes

    The audio is synchronized between users in the domain because it is played by an entity server script on the boombox
    You may observe issues stopping a song if the entity server script is stopped or restarted while audio is playing. Restarting the entity server or waiting out the song should fix this.
    You may observe issues if multiple people are changing songs or volume at a high rate. With casual use, this shouldn't be a problem, but excessive changes with the controller may cause some synchronization issues with the entity properties.

Happy Boombox on GitHub