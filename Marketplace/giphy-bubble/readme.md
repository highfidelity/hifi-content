# Giphy Mood App for High Fidelity
This is an application made for High Fidelity using the GIPHY API. It is available in the High Fidelity Marketplace for download, or you can modify the source code in this example to create your own version of the application. If you decide to modify this code directly to create your own app, you will need an API key from Giphy, which you can get at the [Giphy Developer Site](https://developers.giphy.com/). You can view a video of the application in action on [Youtube](https://youtu.be/mSvPA-qRNR0).

![A thought bubble with a gif playing](images/header.png)

# How It Works
In High Fidelity, the main user interface is displayed through an in-world tablet that only you can see on your client. In desktop mode, these windows appear as a heads-up display, and you can create custom applications that run on the tablet that can be made to interact with the elements in the world around you. You can read more about the tablet documentation and creating your first application [on the High Fidelity docs site](https://docs.highfidelity.com/learn-with-us/create-a-tablet-app). 

There are two main components to a tablet application in High Fidelity: the UI (which can be written in QML or HTML - this app uses HTML) and the application logic, which is written in an Interface script.

## Creating the Tablet Application
In order to create our tablet app, we have two main files: `giphyMoodApp.js`, which is our Interface script that creates the app and adds it to our menu, and `giphyMoodApp.html`, which is the main page for our application. We'll look at setting up the logic to create our button and add our app to our tablet, which you can see in `giphyMoodApp.js`. 

The tablet in High Fidelity is accessed by using the `Tablet` API - specifically by storing a reference to the interface tablet system like so in our `giphyMoodApp.js` Interface script:

`var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");` 

Once we have a reference to our tablet, we can add a button to our application page and handle the logic to open and close the pages. 

```
var isOpen = false;
  
    var button = tablet.addButton({
        text: APP_NAME, 
        icon: ICON_INACTIVE,
        activeIcon: ICON_ACTIVE
    });

    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);
```

## Tablet App Communication
Embedded scripts in your application's UI communicate with the application Interface script through the `EventBridge` API, which allows you to receive tablet events and do something specific with them in your application logic. All tablet applications in High Fidelity communicate through this API, so you will need to manage your app logic accordingly or you may end up with some unexpected event triggers!

In the HTML side of this application, we have our UI, which is mostly comprised of buttons that provide a mechanic for generating a specific GIF to display. When a gif button is pressed, the preview appears below the buttons and the 'Show' button will display the gif that will appear in your thought bubble. 

![The tablet UI for the giphy thought bubble app](images/UI.png)

Each of those buttons, when pressed, emits a specific signal through the `EventBridge.emitWebEvent` API call. You can format specific JSON instructions that your application logic layer will use to differentiate between. As an example, the code that handles selecting a gif category (which are all buttons with `class = 'white'`styling) emits an event like so: 

```
EventBridge.emitWebEvent(JSON.stringify({
                       'event' : 'requestGIFMood', 
                       'rating' : document.querySelector('input[name = "rate"]:checked').value,
                       'mood' : $(this).attr("value").replace(/ /g, '%20')}));
 ```                  

In the application logic file `giphyMoodApp.js`, we handle this event by connecting our `webEventReceived` signal to listen for messages:

```
 function onWebEventReceived(event) {
        var data = JSON.parse(event);
        if (data.event === "requestGIFMood") {
            requestGifAndUpdateSign(data.rating, data.mood);
        } 
 }
 ```

## Adding Gifs
When we first open up the tablet page for our #Mood application, we check to see if an existing thought bubble and web entity exist to display the gif on. If not, we create new _avatar entities_, which are entities that belong to your client (and only your client) that other people can see, but not interact with. Avatar entities are sent over the avatar mixer, rather than as part of the domain's entity tree, and are used for things that need to travel with your avatar from one place to another.

When we get a web event from the tablet that a user has selected a gif, we use the `request` module to access the Giphy API and update the tablet with a preview. We also use the `Entities.editEntity` API call to modify our web entity to display the new gif. When the user chooses to display the gif, we call `editEntity` again to make the thought bubble and web entity visible again.

**Note**: If you want to create this project yourself, replace `var GIPHY_API_KEY = ' ' ` with your own key. 

## Cleanup
When we are done with our application and stop our script from running, we want to make sure that it's cleaned up by removing our button from the tablet and disconnecting our functions. We tie this into the `scriptEnding` signal:

```
 Script.scriptEnding.connect(function() {
        button.clicked.disconnect(onClicked);
        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
        Entities.deletingEntity.disconnect(checkForDeletedEntities);
        tablet.removeButton(button);
        Entities.deleteEntity(giphyMoodThoughtBubble);
        Entities.deletedEntityID(giphyMoodWebEntityID);
    });
```
