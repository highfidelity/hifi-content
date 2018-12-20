# DANCE
DANCE is a fun tablet application that lets you choose from different Mixamo dance animations that you can sequence together to make your own funky dance routine!  

# How it works
Dance animations created in Mixamo are selected though a UI that is built with [Vue.JS](https://vuejs.org/).  The animations are placed in an array that is cycled through and switch after the desired duration time is up.  Easy, peezy, Beyonce boogie sequeezy.

![Beyonce boogie](./Images/Docs/4.jpg "Beyonce boogie")


# Setup
We first start with a file that lists all of our possible dance URLS which is imported in as an array.  

That list populates our Tablet app.  The tablet app 

The Avatar Animations used in this app come from [Mixamo](https://www.mixamo.com/) This allows you to easily animate an Avatar Skeleton by importing an exisiting Hifi FST file.  After customizing the dance moves the way you like, you can then download them.

This app is created with appUi which is module included in the Hifi Standard library that helps in creating new apps by simplifying much of the process.  You can view the module [here](https://github.com/highfidelity/hifi/blob/91df342ae98b763fbe8eb194b0def9308ce66a9d/scripts/modules/appUi.js) which has more information on how to configure it.  

The basic configuration looks like this:
```
var AppUi = Script.require('appUi');
ui = new AppUi({
    buttonName: BUTTON_NAME,
    home: URL,
    graphicsDirectory: Script.resolvePath("./icons/tablet-icons/"),
    onMessage: onMessage,
    updateUI: updateUI
});
```
Home is the main url for the UI, onMessage is the function used to handle messages from the tablet, and updateUI is a custom function added to appUi that takes care updating the Vue UI.

***
### Note Re: [Vue.JS](https://vuejs.org/)
 
Vue is a declaritve javascript framework that is like a light-weight version of React.  It takes care of all the bindings and event handling for you.  If you update an object/array contained in it,then the UI will update accordingly based on how you set it up.  We won't touch into too many Vue specific details in here, but we wil cover some of the essential basics.  If you have further questions, feel free to ask on the forum! 
***

# The Main App
### Startup
When the app starts, the function ```startup()``` is run which contains a few basic wirings such as the AppUi init above.  We also make sure the Avatar's default animation is restored with ```MyAvatar.restoreAnimation()``` before any dancing happens. 

In Hifi, we use a concept called signals/slots on the C++ engine side that connects events with functions on objects.  On the javascript side, if you ever see any code that says ```ClassName.connect```, what that means is that Interface has given a signal, and we are connecting a function to it. 

The functions being connected in this case are ```onEnding``` to the signal Script.scriptEnding and ```onDomainChange``` to the signal Window.domainChanged. 

### Modules
All the URLS are stored in a module file called Dance-URLS.js.  If you aren't familar with modules and how to use them in hifi, they are a very nice way to reuse code between applications, or to help break up large files to make them more managable.  

The way they work is that they are created in a separte file that looks similar to the bottom:
```
// Create an object with functions like this:
function functionToUseInModule(){ ... }

module.exports = {
    functionToUseInModule: functionToUseInModule
};

// or if you are just exporting a single function, array, or string you can do it directly with
module.exports = functionToUseInModule;
```

Then in the file you want to use that module in, use it like so:
```
var moduleToUse = Script.require("./moduleFile.js");

// Using it the first way would look like so
moduleToUse.functionToUseInModule();

// using it the second way
moduleToUse();
```

The Dance-URLS.js is a module that is named like this:
```
Script.resolvePath('./Animations/Ballet 372.fbx')
```
The ```resolvePath``` function just gives you an absolute file path to use without knowing it in advance.  Very handy if you are moving your files around between testing, or migrating servers.
The above file includes a name and the number of frames.

In the setup function, we run ```splitDanceUrls()``` to create danceObjects. 
First we break that string apart with some regex:
```
var regex = /((?:https:|file:\/)\/\/.*\/)([a-zA-Z0-9 ]+) (\d+)(.fbx)/;
```
What that regex about does is gives us 4 different capture groups that are between all the ()s
This gives us:
1. The substring before the file name
2. The file name
3. The total number of frames in the animation
4. The extension

In Javascript, we can create Constructor functions that make creating new objects to use easy.
The Constructor that ```splitDanceUrls``` uses looks like this:
```
function DanceAnimation(name, url, frames, fps, icon) {
    this.name = name;
    this.url = url;
    this.startFrame = DEFAULT_START_FRAME;
    this.endFrame = frames;
    this.fps = fps;
    this.icon = icon;
}
```
When you call a constructor function, you are creating a new object that takes in arguments.
Using the regex above, and iterating over our list of danceUrls, we are pushing to an array objects created with the following call(paraphrised)
```
dataStore.danceObjects.push(
    new DanceAnimation(
        nameFromRegex, DanceURL, totalNumberOfFrames, defaultFPSof30, graphicIconToUseInTheTablet
    )
)
```

To sum it up, this function transforms our list of dance animation urls into usuable Dance Animation objects.

## The DataStore
So what is the dataStore?  Well, it's where the data is stored! :)
What it is, is just a collection of data that is important to the UI.  This allows a very simple way to update the UI for the Vue framework.  The process looks like this

DataStore Builds the UI --->  User Interacts with the UI ---> UI sends the change to the DataStore 
and the cycle completes to create a one way flow of data. 

this is what is done in the function updateUI
```
function updateUI(dataStore, slice) {
    if (!slice) {
        slice = {};
    }
    var messageObject = {
        type: UPDATE_UI,
        value: dataStore
    };
    Object.keys(slice).forEach(function(key){
        if (slice.hasOwnProperty(key)) {
            messageObject[key] = slice[key];
        }
    });
    ui.sendToHtml(messageObject);
}
```
What the above does is see if there is only a slice of the data you care about sending over, or if you want to send over the whole thing.  The Vue UI takes care of it from there.  
sendToHTML takes an object and creates a string to send over the EventBridge.  If you weren't using AppUi, then this is something you would have to wire up yourself. 

Beofre we talk about the Tablet app itself, let's look over a few of the functions that take care of the bulk of the work: 

### previewDanceAnimation
This will preview an animation overlay in front of you.  In Hifi, overlays are like entities, but only you can see them.  They are made with var overlay = Overlay.addOverlay("type", options).  You want to assign a variable to what that returns in case you need to delete an overlay.  Here we are taking advantage of model overlays ability to play animations.  

We would like the overlay to appear in front of your Avatar.  If you know the local position you would like to offset to, here is an easier and clean way to take care of that: 
```
var localOffset = [0, 0, -1], // creates an offset of -1 from a point of origin
    worldOffset = Vec3.multiplyQbyV(MyAvatar.orientation, localOffset), // Gets the correct vector by multiplying that offset by your orientation
    modelPosition = Vec3.sum(MyAvatar.position, worldOffset); // Adds that value to your current position
```

The rest of this function sets up features of the UI.  One of the nice things about Vue, is that you can use it to have full control of how your UI looks by assigning flags to your UI,such as when you want a button to show up or not.  

We also include a timeout that checks to see how long this overlay is playing for so that we don't get in a bad state where the overlay plays forever for some reason. 

### stopPreviewDanceAnimation

The main thing here is our deletion of the overlay using ```Overlays.deleteOverlay(overlay)```
Other then that, we are just settung up more UI related flags.  After we set those flags, we use the update UI method.  

### addDanceAnimation

Whenever a user clicks on one of the Dance Animation icons, this function is called.  All it is doing is using another constructor function based on the original Dance Animation object maker above, but with a few extra items for use in the dance playlist.  

### hmdCheck

Instead of allowing the user to just play the dance array playlist directly, first we check to see if a user is in HMD using HMD.active and also checking to see if the user had checked the option to use the danceApp in HMD.  This is all so the user might not feel strange seeing their avatar body doing something unexpected without expressily allowing it themselves.  

### playDanceArray

This is how the danceArray gets kicked off when we click start.  This just inits us to start from the first dance by setting the ```currentIndex``` to 0 and then passing that to playNextDance, which takes in an index number to play.

### playNextDance

First we do some checks to make sure we aren't at the end of the list, then we get the actual danceObject from our danceArray based on the desired index.  
After we do, we pass this object to ```tryDanceAnimation``` which actually takes care of the dance animation.  After we pass it in, we do a timeout based on how long this oassed danceAnimation should actually play for based on the duration.  Then we recursively call playNextDance again with the next index.

### tryDanceAnimation
Three things to take note here. 
#1 The animation is used on your avatar by MyAvatar.overrideAnimation.  This method replaces your current main animation with the dance animation you have picked.  It's parameters are basically the same ones we set in the dance object above. 

#2 If the user is in HMD mode, then the only difference is that we switch their Camera mode.  There are several camera modes including first person, third person, independent, and entity mode.  All of them allow different camera operation modes that are described in more depth in our API guide.  We are simply putting the user in third person mode.  When the user clicks stop. we change the camera mode back to first person. 

#3 We are using a UI Slick here this time instead of the normal just dataStore update:
```ui.updateUI(dataStore, {slice: CURRENT_DANCE});```

The reason for this is because we are taking advantage of the onBlur functionality of HTML inputs so that we actually update the danceArray in realtime.  The only problem with this, is that if we didn't do just a slice, the entire app would keep getting dataStore updates which can affect inputting new values to our individual dances.  Basically, if you didn't move off in time, the value you entered would go back to where it was before.  This makes sure only the section marked to display the current dance is updated. 

### updateDanceArray

Instead of updating a dance object directly. we simply just overwrite the changes from the UI on the danceArray.  That way this function is taken care of in just two lines. wheeew.

# The Tablet App

We won't focus too deeply on the tablet app side, except to touch on a few key concepts.  Much of it deal with how Vue operates.  If anything is too confusing here, the Vue documentation is fantastic.  Hopefully this gives you an idea of how to use Vue in conjection with Hifi. 

We will first begin with the onMessage function that is on the interface app side

### onMessage

In a HTML app, we use a class called the EventBridge