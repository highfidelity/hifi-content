# Holiday Blaster with App

This blueprint item was created by the High Fidelity Experiences Team as a template to be copied and modified by our users. 

The code is heavily commented for clarity and by following this README, users will learn more about creating using the High Fidelity API. Whether a user wants to completely overhaul the blaster and its app or just swap out the items it can shoot, we encourage people to create their own variations.

## The Components

![Image of Components](http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/HolidayGun/assets/images/holidayGunComponents.png)

This item includes three main parts: the app, the blaster, and the objects to be fired. 

### The App
First, the client script, holidayApp.js, sets up the tablet app. A client script runs on a user’s computer enabling direct interaction between the user and the High Fidelity Interface. Any changes that would affect other users, for instance creating a cube, will pass through the High Fidelity servers before taking effect. On the other hand, a server script is carried out directly on the servers and immediately affects everyone present. When a user runs the holidayApp.js client script, only they will see a button for the Holiday Blaster appear on their tablet. The front end UI of the app is created in holiday.html, styled with holiday.css, and allows the user to select which item to shoot next. It also plays music and sound effects and creates or deletes falling snow.

### The Blaster
When the Holiday App is opened, the blaster is created in front of the user as an equippable gun that can shoot several different types of items. The blaster has one client script running, gun.js, that handles the desktop equipping and firing. On closing the app or changing tablet screens, the gun is deleted as most of its functionality requires interaction with the holiday app.


### The Objects to be Fired
The final component of the holiday blaster are the objects it fires that may be stickable, edible, or made to grow on impact. 

All objects except the tree are stickable. These objects utilize a client script, item.js or edibleItem.js, which makes them “stick” when they collide with another object. The stockings, icicle ornaments, and ball ornaments are “grabbable” to allow a user to adjust their size for more detailed placement. The lights are “not grabbable” and do not change size. 

The growing objects have an additional server script, itemGrow.js, that once created, the object grows slowly to a set height. 

The edible items, gingerbread cookie and candy cane, have a modified version of item.js, edibleItem.js, that allows the user to eat them if they are close enough to the user’s mouth.

To enable the star to glow, the star has a basic server script, starSpawnLights.js, that creates a yellow light above when the star stops moving. 


## The Main Script: Creating the App

The tablet app is loaded when holiday.js runs. To open the app, the user manually clicks the tablet button.Two button images are linked in order to show whether the app is active. These images will be hosted .svg or .png files. The app is then added to the tablet or toolbar by getting a reference to the tablet using the ‘Tablet’ API, pointing the page to the correct html file, and creating the button. The name that will appear under the app image can be changed here as well.

```
var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
var appPage = Script.resolvePath('holiday.html');
var button = tablet.addButton({
    text: 'HOLIDAY',
    icon: TABLET_BUTTON_IMAGE,
    activeIcon: TABLET_BUTTON_PRESSED
});
```

The final requirement to get the app working is to add listeners for when the user clicks the tablet button, changes tablet screens, or closes the app. 

```
button.clicked.connect(onClicked);
tablet.screenChanged.connect(onScreenChanged);
Script.scriptEnding.connect(appEnding);
```

When the app’s tablet button is clicked, we run the ‘onClicked’ function which will check to see if the app is open. If not, the tablet will be opened and sent to the app home page, a jingling bell sound will play, the gun will be created in front of the user, and the app will connect the  web event listener to receive data sent from the html page. If the app was already open, it will be closed and the gun removed.

The script also checks the status of the app when the tablet screen changes. If the app is no longer open the web event listener is disconnected to avoid unnecessary actions.  When the script is stopped, the ‘appEnding’ function will clean up by disconnecting the listeners, deleting the gun, and removing the tablet button.

 
## Tablet App Interaction
![Image of Components](http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/HolidayGun/assets/images/holidayGunSelection.png)

Tablet choices are presented as buttons or images with a unique id that will be used to send the choice to the app. The snow and music are buttons created using the input tag with a button type.

```
<input type="button" class="gray" id="song3" value="Rudolph">
```
![Image of Components](http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/HolidayGun/assets/images/holidayGunRudolphButton.png)

The text set by the value key is what the tablet app will show as a label on the button and the class is used to set the way the button will be formatted according to the linked style sheet, holiday.css. 
    The rest of the tablet options use the input tag with an image type.

```
<input type="image" width="48" height="48" id="snowman" alt="Snowman" src="IMAGE URL">
```

![Image of Components](http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/HolidayGun/assets/images/holidayGunStockingButton.png)

The height and width of the image are set here, along with some alternative text to show in the case that the image cannot load. The src key will be a string URL that points to the hosted image. 

The html file has a Javascript section that includes listeners for each button, listed by id. When the button is clicked, it sets up an event and sends it over the EventBridge to be received by holiday.js. The event includes a unique identifier for this app to prevent other apps from trying to process the event.

```
$('#song3').click(function() {
    var event = {
        app: 'Holiday1982',
        type: "song3"
    };
    EventBridge.emitWebEvent(JSON.stringify(event));
});
```

Using the button id for the event type makes it easy to keep track of what is happening throughout the entire process, from tablet click to gun selection.

## The Main Script: Sounds

When the tablet app is opened, the listener for web events is connected, enabling holiday.js to receive information about user selections from holiday.html. When an event is received, the script reads the data, checks if the event is coming from the correct app, then identifies which button was pressed. If the user requested to play a song, it is handled here. At the top of the script, several song URL’s were prepared. Each URL points to a mono .wav or .mp3 file recorded at a rate of 48000Hz. The file is processed using the SoundCache API and is ready for use.

```
var SONG_1 = SoundCache.getSound(Script.resolvePath('assets/sounds/holly.mp3'));
```

When the script is ready to play the file, it checks that the sound was downloaded, stops any previous music, and creates an audio injector using the ‘Audio’ API.

```
musicInjector = Audio.playSound(sound, {
    position: getPositionSnow(),
    volume: volume,
    clientOnly: false
});
```

The position, volume, and clientOnly keys are set upon creation of the injector. A client only sound is only heard by the user running the script, so setting this value to false will make the sound audible to all nearby users. When the script is stopped, it always checks for any running music injector and stops it to prevent sounds that cannot be terminated.

## The Main Script: Snow

If holiday.js receives a request to toggle snow on or off, it calls the ‘createSnow’ function. 

Because particles can be heavy on rendering, the app creates one snow particle at a time. It first searches for a snow particle that already exists. If one is found, it is deleted to turn the snow off. If no snow is found, one is created via the ‘Entities’ API. The entity is added by passing in all key properties that should be changed from the default properties. The gun is created upon opening the app in this same manner and, later on, the gun will create the items it fires in the same way as well.

## The Gun: Equippables

Objects are made equippable by setting the “equipHotspots” property in their userData entity property which can be accessed through scripts or by selecting the item in create mode. When a user puts their hand near an equippable item, a hotspot shows as a grid sphere indicating the user can equip this item. The radius and position of the hotspot relative to the item can be changed in the userData. When the user pulls the grip trigger on their controller while their hand is inside the hotspot, the item attaches to the nearest avatar joint of those listed in the ”joints” property. In this case, the gun attaches to either the left or right hand. The position as a vector and rotation as a quaternion, of the item around the specified joint is set beneath the joint name in the properties “0” and “1”.

![Image of Components](http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/HolidayGun/assets/images/holidayGunUserData.png)

 A simple way to set equip position and rotation is to copy this userData to the item, equip it, and then in HMD, grab it with the other hand to adjust to the desired placement. Then, while the item is still equipped, open a console window from the menu in Developer > Scripting. Get the item’s localPosition and localRotation from the console with these commands, substituting the item’s id number which can be found near the top of the create menu. The commands will print the results which can then be pasted into the “0” and “1” properties under ”joints”.

```
JSON.stringify(Entities.getEntityProperties("{*IDNUMBER*}",'localPosition').localPosition)
JSON.stringify(Entities.getEntityProperties("{*IDNUMBER*}",'localRotation').localRotation)
```

Follow this process for each joint listed and the gun will be equipped by clicking it in desktop or HMD. In desktop, it will simply be attached to the user’s hand hanging at their side. To make holding and using the gun look realistic, the script must override the avatar’s normal animation. A position is calculated for the hand holding the gun and the rest of the arm will position itself around this. At the same time, an overlay is created to show the user how to unequip or fire the blaster. An overlay is “client only,” meaning only the person running the script that creates the overlay will see the overlay. 

## The Gun: Firing

Firing the gun takes advantage of High Fidelity’s advanced physics system by simply calculating the correct direction and then adding velocity to the item in that direction. 

These calculations should not need to be adjusted as long as the gun’s local barrel offset and direction are set correctly. The local offset is simply the position of the barrel relative to the center of the gun’s collision shape. The direction shows which axis the items should fire along relative to the gun. 

On firing, the preset item is created with velocity aligned with this direction. Entities have a linear and angular damping property with a range of 0 - 1 that will cause the object to stop moving over time. The blaster items have an angular damping set to 1 to prevent spinning and most have linear damping set to 0 so that they will keep moving until they collide with another object rather than stopping in mid-air. The trees also have a gravity property set in order to make them fall toward the ground.

## The Items: Stopping and Growing

All items are fired from the gun at a small size to look realistic, but some will need to get bigger once they stop moving. By default due to the physics engine, when an object is fired from the gun, it bounces and ricochets. To prevent this, all items have a basic client function that listens for a collision. When a collision happens, the function checks if it was a collision with the gun as the object passed through the barrel, if not and the object collided with another entity, it sets the object’s velocity to 0 along each axis and removes its dynamic property to prevent further motion due to physics.

For items that grow, the server script begins checking the item’s velocity on creation. Every 50 ms, an interval checks for the velocity to change to 0 on every axis indicating the item stopped moving. Once the velocity is 0, the script immediately begins the grow function. 

Each item has a preset maximum height set in the variable headers at the beginning of the script.  When the item is ready to grow, its physics properties are edited to prevent unwanted motion and a new interval is set where new dimensions are calculated and applied every 50 ms until the maximum height is reached.

## The Items: Edibles
    
The edible items have a different client script that adds an extra function to the basic script applied to all other objects. 

When a user grabs and holds an edible item, either by triggering in HMD or clicking in desktop, a function begins checking the distance between the item and the user’s head or neck joint. Not all avatars have head joints so including the neck joint as a fall back option increases the chances of the script working for more users. Once the food is within a minimum distance to the avatar’s head or neck, the item is considered close enough to be “eaten”.  A crunch sound plays and the item disappears. If the user releases the item without eating it, the script stops checking the distance. 

Please show us your variations on the Holiday Gun or upload them to the High Fidelity Marketplace!
