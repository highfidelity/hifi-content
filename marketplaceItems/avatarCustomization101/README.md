# Hello and Welcome to Avatar 101!

Avatar 101 showcases customizations that creators can make to their avatars using High Fidelity.

1. Avatar materials using material entities (See section **Material Tab**)
2. Blendshapes applying and manipulating them in High Fidelity (See section **Blendshapes Tab**)
3. Flow using flow avatar joints (See section **Flow Tab**)

In this README, I explain ways to customize your avatar, how to script these changes in the hifi console, and reference more in-depth sources. I recommend having both this README and [avatarCustomization101_app.js](appResources/appData/resources/avatarCustomization101_app.js) open for reference.

The app utilizes “Avi,” a customized Woody avatar, with a jacket submesh, specifically named blendshapes on its face, and flow joints on its leaf hair. We use Avi because he is specifically configured to interact with the app.

Please feel free to download and open Avi's .fbx and .fst files in your favorite 3D modelling software to inspect. Avi's .fst and .fbx files are located in the [avatar folder](appResources/appData/resources/avatar).

# Steps using the App

1. Download the "Avatar 101" app from the High Fidelity Marketplace
2. Click Switch Avatar on the Info tab
3. Click "Yes" to save the avatar you're currently wearing or click "No" if not
4. Follow along with the other tabs below to understand what's happening

## A Brief App Layout and Organization Overview

The README is focused mainly on customizing your avatar and using the High Fidelity Javascript API calls in avatarCustomization101_app.js. These are described in the sections: **Materials Tab**, **Blendshapes Tab**, and **Flow Tab**.

Please skip this section unless you are interested in learning more about how the app works as a Tablet app with Vue.js.

### avatarCustomization101_app.js

This is where all of the High Fidelity API calls are managed. These interact with the High Fidelity system.

### avatarCustomization101_ui.js

This app utilizes Vue.js, a Javascript framework, to help create and reuse components, handle data updates, and send events over the Eventbridge.

Check out the [Vue.JS documentation](https://vuejs.org/v2/guide/) for more  information.

The updateUI() function in avatarCustomization101_app.js handles updating the tablet app view with new data handled in dynamicData. This file receives those updates in function onScriptEventReceived().

### config.js

App data is organized and defined in config.js. The variables are referenced by both avatarCustomization101_ui.js and avatarCustomization101_app.js to ensure each variable matches each other.

When the app is initialized in avatarCustomization101_ui.js, Vue takes the initial data outlined in config.js and creates the UI.

CONFIG.INITIAL_DYNAMIC_DATA is the initial dynamic data that will change when updateUI() is called in avatarCustomization101_app.js.
CONFIG.STATIC_DATA is data that will not change.

In avatarCustomization101_app.js, dynamicData is initialized with a deep copy of CONFIG.INITIAL_DYNAMIC_DATA. It uses this object to send updates to the Tablet via updateUI(). 

### How the Tablet UI updates with Users Input

Users interact with the Tablet UI such as clicking a preset button on the materials tab. The button is clicked and a message is sent over the EventBridge in the format:
```
EventBridge.emitWebEvent(JSON.stringify({
   type: EVENT_UPDATE_MATERIAL,
   subtype: CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_NAMED_MATERIAL_SELECTED,
   name: materialName
}));
```
avatarCustomization.js recieves this message in the onMessage function and delegates the message in the type switch statement. Subtype is determined afterward.

After the change has been managed, *dynamicData* variable is updated and sent over via ui.sendToHtml(messageObject) for the UI to update its dynamic data object. Then the user sees the change in the tablet app.

# Material Tab

Click on the preset buttons to create a material entity or choose from the drop-down menu to select "shadeless" or "hifi-pbr" to start with small material property adjustments (See method *updateMaterial()* in [avatarCustomization101_app.js](appResources/appData/resources/avatarCustomization101_app.js)).

Have fun with playing with the different options in the app! The "Default" button will delete the material entity and you can start again.

#### Material Entity Property Format

```Javascript
{
   type: "Material",
   name: "Avatar101-Material",
   parentID: MyAvatar.sessionUUID,
   materialURL: "materialData",
   priority: 1,
   parentMaterialName: 1,
   description: description,
   materialMappingScale: materialMappingScale,
   materialData: JSON.stringify({
       materialVersion: 1,
       materials: {
           "model": "hifi_pbr",
           "roughness": 0.2,
           "unlit": false,
           "opacity": 1,
           "albedoMap": "PATH_TO_IMAGE" + "chainmail_albedoMap.png",
           "metallicMap": "PATH_TO_IMAGE" + "chainmail_metallicMap.png",
           "normalMap": "PATH_TO_IMAGE" + "chainmail_normalMap.png",
           "occlusionMap": "PATH_TO_IMAGE" + "chainmail.occlusionMap.png"
       }
   })
}
```

### Watch LIVE updates in the Create Menu while running this app
1. In Avatar101 app, press one of the material preset buttons
2. Open Create Menu > Entity List Window
3. Set Search Radius to 1m
4. Select the entity in the list “Avatar101-Material”
5. In the Create Tools Window > Property Tab
6. Material Data will have a list of the properties and the values adjusted
7. Select “Tree” and switch to “Code” to reveal the Material Data object

### Hello World Material: Try Creating a Material Entity for your Avatar

#### Open your console in High Fidelity
1. Open High Fidelity
2. Open the Console
   1. Alt + Ctrl + J
   2. OR Turn on via Developer Menu: Settings > Developer Menu
   3. Developer > Scripting > Console...
3. Copy and paste below in the console and hit enter:

   ```Javascript
   var materialID = Entities.addEntity({
       type: "Material",
       name: "Hello_World_Material",
       parentID: MyAvatar.sessionUUID,
       materialURL: "materialData",
       priority: 1,
       materialData: JSON.stringify({
           materialVersion: 1,
           materials: {
               "model": "hifi_pbr",
               "albedoMap": "http://cdn.shopify.com/s/files/1/0891/8314/products/Troll_Face_Decal_4ccf767e2e2d9_grande.jpeg?v=1459053675",
               "emissiveMap": "http://cdn.shopify.com/s/files/1/0891/8314/products/Troll_Face_Decal_4ccf767e2e2d9_grande.jpeg?v=1459053675"
           }
       })
   }, ’avatar’);
   ```

4. Your avatar should have an image as one of its submeshes. open the Create Menu to view the named “Hello_World_Material” entity
5. To choose a different submesh for this material, such as a jacket rather than hair
   1. Open the Create Menu
   2. Create Tools > Properties tab
   3. Set "Priority" to 1
   4. Set "Submesh to Replace" to another number rather than the default, likely try 1 or 2
6. Have fun adjusting the material!

For material settings inspiration, the Avatar 101 app has material presets defined in [materials.js](appResources/appData/resources/modules/materials.js).

### Material Shading Models and how they're handled for Material Entities

Currently, all shading models in material entities are "hifi-pbr". What indicates the difference between hifi-pbr and shadeless is the "unlit" property.

*hifi-pbr* is the shading model with unlit set to false. These will react to light and cast shadows. See "glass", "chainmail", and "disco" textures in [materials.js](appResources/appData/resources/modules/materials.js).

*shadeless* is the shading model that currently does not have "unlit" specified to a value. These will not react to light and therefore will ultimately show the texture map without shadows. See "red" and "texture" in [materials.js](appResources/appData/resources/modules/materials.js).

### Material Entity Properties

Most adjustments have two channels: a value and a map. A value describes the color or intensity that is used to update the material. The map showcases an image that will be used to inform the pattern of the image.

To see all material resource options like "emissive", "emissiveMap", "albedo", "albedoMap" and how they relate to eachother checkout [High Fidelity Documentation Globals Material](https://docs.highfidelity.com/api-reference/globals#Material).

To see all material entity properties [High Fidelity Documentation Material Entities Properties](https://docs.highfidelity.com/api-reference/namespaces/entities#.EntityProperties-Material)

*Material Entities* - These are high fidelity entities that can be extracted from an existing model that describes the material data from that model to render. You can learn more about the properties here - https://docs.highfidelity.com/api-reference/namespaces/entities#.EntityProperties-Material

# Blendshapes Tab

Blendshapes are the system that helps us have facial expressions, blink your eyes, and talk with your mouth in High Fidelity! The High Fidelity system requires a specific naming convention for the blendshapes.

Blendshapes are built into the avatar.fbx and described in the avatar.fst file.

First, enable scripted blendshapes by setting MyAvatar.hasScriptedBlendshapes to true.

Then update one blendshape with [MyAvatar.setBlendshape(name, value)](https://docs.highfidelity.com/api-reference/namespaces/myavatar#.setBlendshape). It takes a blendshape name such as "EyeBlink_L" and a value to set it to.

The blendshape presets are defined in blendshapes.js

Blendshapes are described in the High Fidelity docs.  Please view [High Fidelity Documentation Avatar Standards Blendshapes](https://docs.highfidelity.com/create/avatars/create-avatars/avatar-standards.html#blendshapes)

## Try Blendshapes with your Avatar

**Open your console in High Fidelity:**
1. Open High Fidelity
2. Open the Console
   1. Alt + Ctrl + J
   2. OR Turn on via Developer Menu: Settings > Developer Menu
   3. Developer > Scripting > Console...

**Copy and paste this code in your console to wink!**
This will only work if your avatar has blendshapes that are named appropriately.
You're welcome to use Avi if not!
```
MyAvatar.hasScriptedBlendshapes = true;
MyAvatar.setBlendshape("EyeBlink_L", 1);
```

**Copy and paste to set back to default**
```
MyAvatar.setBlendshape("EyeBlink_L", 0);
MyAvatar.hasScriptedBlendshapes = false;
```

### More Blendshape Information

Reference [Avi's .fst file](appResources/appData/resources/avatar/avatar.fst) to see the list of blendshapes specified.

Each blendshape needs to be named to work with our system.

![Blendshape screenshot in Maya](githubResources/blendshapes_maya.png)
You can specify blendshapes in Maya or Blender.

![Blendshape screenshot in .fst file](githubResources/blendshapes_fst_screenshot.png)
[See avatar.fst file](appResources/appData/resources/avatar/avatar.fst)

Another app that uses blendshapes is the [Facial Expressions app](https://raw.githubusercontent.com/highfidelity/hifi/3553f97776b3d3d51d9ac2c16f648ca15c165f81/scripts/developer/facialExpressions.js). This adjusts an avatar’s facial expressions to emote different emotions.

# Flow Tab

Flow is enabled when [flow.js](appResources/appData/resources/modules/flow.js) is a running script and the avatar has specifically named joint names (there are plans to include this in the High Fidelity engine). These joints follow the flow_[TYPE]_[INDEX] or sim[TYPE][INDEX]

TYPE defines a group of joints that share a common physics setup and INDEX is an integer. For example, if the thread is used to simulate a skirt, all the “skirt” joints should be named flow_skirt_01, flow_skirt_02, etc.

[Flow.js](appResources/appData/resources/modules/flow.js) is a script that applies physics to the joints in your avatar that are named specifically to be recognized by the flow script. As creators, we only need to customize the JSON in the flow.js app for our avatar's flow. See walkthrough linked below.

Flow is described more in depth via the High Fidelity docs linked: [High Fidelity Add Flow to Your Avatar](https://docs.highfidelity.com/create/avatars/create-avatars/add-flow.html)

### How to get flow working on your avatar

Flow thread naming conventions are shown in the flow walkthrough [High Fidelity Add Flow to Your Avatar Flow Threads](https://docs.highfidelity.com/create/avatars/create-avatars/add-flow.html#flow-threads) in the High Fidelity docs.

![Flow joints in .fst file](githubResources/flowJoints.png)
You can specify flow joints in Maya or Blender.

# Conclusion

This app showcases material entities, blendshapes, and flow to customize your avatar in High Fidelity! This app, of course, is not complete and can be expanded upon to incorporate for other avatars!

### Happy creating!

# Releases

## 2019-07-09_02-20-00 :: [68106c9](https://github.com/highfidelity/hifi-content/commit/68106c9)
- Fixed a hack in which the mirrors were darkened to compensate for the secondary camera being too light.
- If your mirrors look too light, it means you have an older version of Interface (pre PR #15862) and should go back to the previous version of this script.
- If your mirrors look too dark, it means you have a newer version of Interface (post PR #15682) and should update to the current version of this script.

## 2019-03-05_09-11-00 :: [a9cb28d](https://github.com/highfidelity/hifi-content/commit/a9cb28d)
- Initial release