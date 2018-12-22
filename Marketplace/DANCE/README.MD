# So you think you can DANCE! ...app

DANCE! is a fun tablet application that lets you choose from different [Mixamo](https://www.mixamo.com/) dance animations. Using those animations, we can sequence them together to make your own funky dance routine!  


From this README you will learn about:
- Using appUi to simplify the HIFI tablet making process
- Applying animations to your Avatar
- Working with Controller Actions
- How the Tablet and Interface communicate together
- Making more complex and interactive apps with the tablet using a framework like Vue.JS


# How it works

Dance animations created in Mixamo are selected through a UI that is built with [Vue.JS](https://vuejs.org/). The animations are placed in an array that is cycled through and switch after the animation’s desired duration time is up. Easy, peezy, Beyonce boogie squeezy.

![Beyonce boogie](./Images/Docs/4.jpg "Beyonce boogie")

# Setup

We first start with a file that lists all our possible dance URLs imported in as an array. 

Mixamo allows you to easily animate a HIFI Avatar Skeleton by importing an existing HIFI Avatar FST file. After customizing the dance moves the way you like, you can then download them and use them to animate your Avatar.

This app is created with appUi which is a module included in the HIFI standard library to help simplify creating new apps. You can view the module [here](https://github.com/highfidelity/hifi/blob/91df342ae98b763fbe8eb194b0def9308ce66a9d/scripts/modules/appUi.js). There are instructions for how to set it up in the comments.

The basic configuration looks like this:
```
var appUi = Script.require('appUi');
ui = new appUi({
    buttonName: BUTTON_NAME,
    home: URL,
    graphicsDirectory: Script.resolvePath("./icons/tablet-icons/"),
    onMessage: onMessage,
    updateUI: updateUI
});
```
Home is the main URL for the UI, onMessage is the function used to handle messages from the tablet, and updateUI is a custom function added to appUi that takes care of updating our Vue UI.

***

### Note Re: [Vue.JS](https://vuejs.org/)
 
Vue is a declarative JavaScript framework that is like a light-weight version of ReactJS. It takes care of all the data bindings and event handling for you. If you update an object/array contained in it, then the UI will update accordingly. We will not dive into too many Vue specific details here, but to help you understand the code flow, we will cover some of the essential basics. If you have further questions, feel free to ask on the forum! 
***

# The Main App

### Startup

When the app starts, the function ```startup()``` is run. It contains a few basic wirings such as the appUi init above. We also make sure the Avatar's default animation is restored with ```MyAvatar.restoreAnimation()``` before any dancing happens. 

In HIFI, we use a concept called signals/slots on the C++ engine side that connects events with functions on objects. On the JavaScript side, if you ever see any code that says ```ClassName.connect(function)```, what that means is that the Interface client has emitted a signal, and we are connecting a function to run when it is received. 

The functions being connected in this case are ```onEnding``` to the signal ```Script.scriptEnding``` and ```onDomainChange``` to the signal ```Window.domainChanged```. These . run ```MyAvatar.restoreAnimation();``` . We want to make sure we do not continue to dance if the script ends or if we change domains. 

### Modules

All the URLs are stored in a module file called Dance-URLS.js. If you aren't familiar with Javascript modules and how to use them in HIFI, they are a very nice way to reuse code between applications or to help break up large files to make them more manageable. 

The way module files work is that they are created in a separate file and has a “module.exports” line at the bottom```
// Create an object with functions like this:
function functionToUseInModule(){ ... }

module.exports = {
    functionToUseInModule: functionToUseInModule
};

// or if you are  exporting a single function, array, or string you can do it directly with
module.exports = functionToUseInModule;
```

Then in the file you want to use that module in:
```
var moduleToUse = Script.require("./moduleFile.js");

// Using it the first way:
moduleToUse.functionToUseInModule();

// using it the second way:
moduleToUse();
```

The Dance-URLS.js is a module with an array that has files named like this:
```
Script.resolvePath('./Animations/Ballet 372.fbx')
```
The ```resolvePath``` function gives you an absolute file path to use without knowing it in advance. Very handy if you are moving your files around between testing and/or migrating servers.
The above file includes a name and the number of frames the animation is.

In the setup function, we run ```splitDanceUrls()``` to create danceObjects. 
First we break that string apart with some regex:
```
var regex = /((?:https:|file:\/)\/\/.*\/)([a-zA-Z0-9 ]+) (\d+)(.fbx)/;
```
The regex above gives us 4 different capture groups that are between all the ()s
Those capture groups are:
1. The substring before the file name
2. The file name
3. The total number of frames in the animation
4. The extension

In Javascript, we can create Constructor functions to easily make new objects.
The Constructor that ```splitDanceUrls``` uses looks like this:
```
function DanceAnimation(name, url, frames, fps, icon) {
    this.name = name;
    this.url = url;
    this.startFrame = DEFAULT_START_FRAME;
    this.endFrame = frames;
    this.fps = fps;
    this.duration = (this.endFrame / this.fps) * SECOND;
    this.icon = icon;
}
```
When you call a constructor function, you create a new object that takes in arguments to help speed up the process by dynamically creating unique objects. Helpful if you have a lot of objects to make that are similar.

Using the regex above, and iterating over our list of danceUrls, we push to an array of objects created with the following call(paraphrased)
```
dataStore.danceObjects.push(
    new DanceAnimation(
        nameFromRegex, DanceURL, totalNumberOfFrames, defaultFPSof30, graphicIconToUseInTheTablet
    )
)
```

To sum it up, this function transforms our list of dance animation URLs into usable Dance Animation objects.

## The DataStore

So what is the dataStore?  Well, it's where the data is stored! :)
It is  a collection of data that is important to the UI. This allows a very simple way to update the UI for the Vue framework. The process looks like this:

DataStore Builds the UI --->  User Interacts with the UI ---> UI sends the change to the dataStore 
and the cycle completes creating a one-way flow of data. 

This is what is done in the function updateUI:
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
The above checks if you only want to update a slice of data or update the whole thing. The Vue UI takes care of it from there. To simplify things, we generally send the entire dataStore, but there are cases where sending only one slice is important.
 
Next, appUi has a method sendToHTML that takes an object and creates a string to send over the EventBridge. The EventBridge is the HIFI class  that communicates between different contexts like the Interface and the Tablet. If you weren't using appUi, then you would have to wire the EventBridge yourself. 

Before we talk about the Tablet app itself, let's look over a few of the functions that take care of the bulk of the work: 

### previewDanceAnimation

This previews creates an animation overlay of your avatar in front of you to preview what the selected dance looks like. In HIFI, overlays are like entities, but only you can see them. They are made with var overlay = Overlay.addOverlay("type", options). To delete the overlay later, we assign a variable overlay returned from addOverlay to capture the overlay’s id. Here we are taking advantage of a model overlay’s ability to play animations. 

We would like the overlay to appear in front of your Avatar. We offset the overlay to appear 1 meter in front of your avatar or -1 on the z axis: 
```
var localOffset = [0, 0, -1], // creates an offset of -1 from a point of origin
    worldOffset = Vec3.multiplyQbyV(MyAvatar.orientation, localOffset), // Gets the correct vector by multiplying that offset by your orientation
    modelPosition = Vec3.sum(MyAvatar.position, worldOffset); // Adds that value to your current position
```

The rest of this function sets up features of the UI. One of the nice things about Vue is you have full control of how your UI looks by assigning flags to your UI, such as when you want a button to show up or not. 

We also include a timeout that checks to see how long this overlay is playing for so we don't get in a bad state where the overlay plays forever for some reason. 

### stopPreviewDanceAnimation

The main thing here is our deletion of the overlay using ```Overlays.deleteOverlay(overlay)```
Then we are  setting up more UI related flags. After we set those flags, we use the update UI method. 

### addDanceAnimation

Whenever a user clicks on one of the Dance Animation icons, this function is called. It uses another constructor function based on the original Dance Animation object maker above with a few extra items the dance playlist uses. 

### hmdCheck

Instead of allowing the user to play the dance array playlist directly, first, we check to see if a user is in HMD using HMD.active and verify if the user checked the option to use the DANCE in HMD.
### enableZoom and disableZoom

These functions are used to handle dancing in HMD and zoom the user’s camera out programmatically though using the boomIn and boomOut actions. BoomIn and boomOut are only exposed as Controller actions, so we are emulating a user using the scroll wheel to zoom (or “boom”) in and out. [Controller Actions]("https://docs.highfidelity.com/api-reference/namespaces/controller#.Actions") are pre-made functions that can be mapped to a variety of inputs. Let's examine enableZoom, as disableZoom is doing the same thing but reversed:
```
HMD.closeTablet();
zoomMapping = Controller.newMapping('zoom');
numberOfZooms = 2;
zoomMapping.from(function () {
    numberOfZooms = numberOfZooms - 1; 
    return numberOfZooms >= 0 ? 1 : (
        zoomMapping.disable(), 0);
}).to(Controller.Actions.BOOM_OUT);
Script.setTimeout(function(){
    HMD.openTablet();
}, TABLET_OPEN_TIME);
zoomMapping.enable();
```
First, we close the tablet because when we zoom out, we leave the tablet where the first camera position was. 
We then create a new Controller mapping for the emulation. These are made by passing in a string of what you would like the mapping to be called.

Mappings take an input in the .from method and send them to a function in the .to method. When this is enabled with zoomMapping.enable, that function in .from will run every tick and subtract from numberOfZooms until it hits 0. You can think of that as using the scroll wheel numberOfZooms times. 

Most actions take a value from 0 to 1. 0, in this case, means do not do anything, 1 means perform that action. Once we hit 0, we disable the mapping from running. We also set a timer up to bring our tablet back after a short period. 

### playDanceArray

This is how the danceArray gets kicked off when we click start. This  inits us to start from the first dance by setting the ```currentIndex``` to 0 and then passing that to playNextDance, which takes in an index number to play.

### playNextDance

We first check that we are not at the end of the list then we get the actual danceObject from our danceArray based on the desired index. 
After, we pass this object to ```tryDanceAnimation``` which takes care of the dance animation. After we pass it in, we do a timeout based on how long this danceAnimation should play by its set duration. Then we recursively call playNextDance again with the next index.

### tryDanceAnimation

Three things to take note here.

#1 The animation is used on your avatar by MyAvatar.overrideAnimation. This method replaces your current main animation with the dance animation you have picked. Its parameters are basically the same ones we set in the dance object above. 

#2 If the user is in HMD mode, then the only difference is that we switch their camera mode. everal camera modes include first person, third person, independent, and entity mode. All of them allow different camera operation modes that are described in more depth in our API guide. We switch the camera mode into third person mode. When the user clicks stop, we change the camera mode back to first person. 

#3 We usea UI slice here. This time instead of the normal dataStore only update:
```ui.updateUI(dataStore, {slice: CURRENT_DANCE});```

We update only a data slice because we take advantage of the onBlur functionality of HTML inputs so we update the danceArray in real-time. If we didn't do only a slice, the entire app would keep getting dataStore updates which would affect inputting new values to our individual dances. Basically, if you didn't move off in time, the value you entered would go back to where it was before. This makes sure only the section marked to display the current dance is updated. 

### updateDanceArray

Instead of updating a dance object directly,we simply overwrite the changes from the UI on the danceArray. That way this function is taken care of in just two lines. Wheeew.

# The Tablet App

We will not focus too deeply on the tablet app side, except to touch on a few key concepts. Much of it deals with how Vue operates. If anything is too confusing here, the [Vue.JS documentation](https://vuejs.org/v2/guide/) is fantastic. Hopefully, this gives you an idea of how to use Vue in conjunction with HIFI. 

We first begin with the onMessage function that is on the interface app side.

### onMessage

In an HTML app, we use a class called the EventBridge to send messages between the tablet's JS files to be received by the interface app. OnMessage handles these messages and uses a switch statement to handle the type. All the messages on the tablet side are set with a type and a value. The type determines which function gets called, and if necessary, passes in a value to be used in the handler function. All messages must be strings. JSON.stringify is used to make sure they are turned into strings so our objects can be handled properly. AppUi takes care of parsing these strings into actual objects inside our onMessage function.

### General Vue Concepts

Let's touch on a few key Vue concepts that will help you understand what is happening on the tablet side. First, we include a copy of Vue with:
```<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js"></script>``` take out the .min if you would like better debug messages from Vue.

We give Vue control of a section of our DOM by naming a tag an id we can reference on the JavaScript side. In our case it's a div tag with the id of "app". 

In our tablet JavaScript file, we create the app with: 
```        
var app = new Vue({
    el: '#app',
    data: {
        dataStore: {
            ui: {
                currentDance: false,
                danceList: false
            }
        }
    }
});
```
el, is the element we marked in our HTML file that we want to let Vue use. The data field is where the magic of Vue happens. Anytime anything in data is updated, we create an automatic reaction that repaints our UI based on templates we give it. This is generally done in Vue components. 

### Vue components

Vue components are JavaScript objects that can be used as HTML tags. We have 3 main ones which are ```<dance>, <dance-list>, and <current-dance>```
These are defined in the tablet JS file. 

Components have the following structure:
```
Vue.component('component-name), {  // component names are lower case since they are HTML tags
    props: ['prop1', 'prop2'],  // props are a powerful way to pass data into components and change the way a tag looks/works. 
    methods: {
        function1(){}  // methods are functions you can give your component to call in event handlers and expressions.
    },
    lifeCycleHooks: function() {}, // there are several such as mounted, unmounted...they are ways you can run a function at certain times during the creation, operation, and destruction of a component
    data: function(){  // data is a function that returns an object that your component can reference.  It returns an object so each unique 
        return {       //  component has their own unique data data, and not shared unless you have a certain reason for that. Your component can reference this as this.dataMember, or dataMember 
            dataMember: "string"  // inside of an expression in your template
        }
    },
    computed: function(){  // computed is a way that you can manipulate/format data/props coming in and still retain reactivity. 
        return {
            computedMember: function(){
                return formattedData;
            }
        }
    },
    template: // this is a string containing the template in HTML format you would like to use. We use a VSCode plugin is used to give HTML syntax coloring in template strings that are activated by /*html*/ before the template string. 
    /*html*/`
        <div>
            templates must have only one root element but can contain anything you want. This is the heart of your UI.
            {{ dataMember }}  // this is a JavaScript expression that evaluates to HTML. 
        </div>
    `
}  
```

### Vue bindings

In order to distinguish from normal HTML attributes, Vue uses special bindings that allow you to have access to certain Vue functionality and work reactively with data changes. 

For example, if you want to dynamically change an img tag's source, you would change ```<img src="http://...">``` to ```<img v-bind:src="url">```. Url, in this case, may be a prop that is passed down, or a member of the data object. Since this is used often, its shorthand is . :src="url".


Other handy Vue attributes are v-if which you feed it an expression so it knows whether to render an element or not, v-on is how events are handled like clicking on an element with v-on:click. The shorthand for this would be @click="functionToRun".

One of the best Vue features we use is v-for. It iterates through an array or object and creates html for each item. For example, we have an array of danceObjects and need to create a <dance> component for each. We first create a <div> root element and give it an attribute of v-for="dance in dances". Then we on put one <dance> tag in that div and give it props that customize how each one looks based on the element that is in the array. Updating our data member will automatically refresh this list. So cool! 

Vue has great [documentation](https://vuejs.org/v2/guide/). Look at the code and reference the Vue docs if there is anything you are curious about. Vue is also a great way to organize chunks of similar 
HTML sections by creating custom elements. 

# Conclusion

The dance app was a lot of fun to work on and was a constant source of amusement as well as irritation during all-hands meetings at the virtual office :)  

Some of the takeaways are:
- Using appUi to simplify the tablet making process
- Applying animations to your Avatar
- Working with Controller Actions
- How the Tablet and Interface communicate together
- Making more complex and interactive apps with the tablet using a framework like Vue.JS

Some ideas for remixing:

- Make up new dances to use
- Find a way to sync up playlists with people around you so you are dancing together
- Go beyond dances and try using other kinds of animations

Let us know if you make something new!