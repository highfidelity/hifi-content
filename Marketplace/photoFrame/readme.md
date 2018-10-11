# Digital Photo Frame
This is a digital photo frame built for High Fidelity using an image entity, a cube, and two lights. There is an entity server script on the image entity that reads from the entity's userData property to manage what photos are displayed and how fast they change. The photo frame comes with a set of five sample photos, which can be changed or added to with your own artwork. 

You can purchase a completed, ready-to-use Digital Photo Frame on the High Fidelity Marketplace, or modify the code here with the imported JSON file to make your own version of the digital photo frame for your domain!

![A digial photo on a virtual reality wall](images/keyImage.png) 

# How it works
There are four entities and one script that make up the Digital Photo Frame: 
* An _image_ entity, named 'digital-photo-image'
* A cube primitive entity, named 'digital-photo-frame', which is the parent of all the other entities in the digital photo group
* Two lights named 'digital-photo-lights' 

The digital photo frame works through an entity server script, which is a script that runs in a domain such that is it synchronized across all of the clients that visit. The `digitalFrame.js` script is applied to the `serverScripts` property. 

When the script loads for the first time, either when it is first added or your server restarts, the `preload` function is called and the entity queries the `userData` property of the image, which stores an array of imageURLs to move through in the `photos` key. It also contains a key for `changeSpeed`, which is the speed (in seconds) the photos will change. 

If there is an error with the userdata properties, the default photos and speed (10s) will be used. 

`Script.setInterval` is used to call the function `changePhoto` repeatedly after the set amount of time (this is in milliseconds, so we adjust it with a multiplier).

![Userdata properties for the digital photo frame](images/userdata.png)

When the script ends, the `unload` function is called and we disconnect our interval via `Script.clearInterval` so that we are not continuing to change photos. 

**A Note About Image Entities**

In the High Fidelity Engine, entities have specific types depending on how they render and what their properties are. Image entities, while on the surface seem to be a unique type of entity, are actually _model_ entities with a single texture, which is referenced in the `tex.image` property and surfaced in the Create menu as the 'Image URL'. If you are making a script that modifies the image on an Image entity, instead of modifying a non-existant `imageURL` property, you will need to modify that texture directly with: `Entities.editEntity(_entityID, {'textures' : JSON.stringify({'tex.picture' : new_image_url})});`

 