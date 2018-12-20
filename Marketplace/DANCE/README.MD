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
What the above does is see if there is only a slice of the data you care about sending over, or if you want to send over the whole thing.  The UI takes care of it from there.  
sendToHTML 





# The Tablet App