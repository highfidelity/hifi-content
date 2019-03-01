## Hello and welcome to Avatar 101!

Avatar 101 showcases customizations that creators can make to their avatars namely goes into:

Avatar materials using material entities
Blendshapes applying and manipulating them in High Fidelity
Flow using flow avatar joints 

In this app I will talk you through the code and teach you how to customize your avatar to your needs! 

The app utilizes “Avi” a customized Woody avatar that has a jacket submesh, specifically named blendshapes on its face, and flow joints on its leaf hair.

## Steps using the App

1. Download the app from the High Fidelity Marketplace
2. Click Switch Avatar on the Info tab
3. Click "Yes" to save the avatar you're currently wearing or click "No" if not
4. Follow along with the other tabs below to understand what's happening


- Blendshapes are built into the avatar.fst file and is updated by High Fidelity function call MyAvatar.setBlendshape for each blendshape
- Flow is enabled when flow.js is a running script and the avatar has specifically named blendshape names (there are plans to include this in the High Fidelity engine)

Wearing your own avatar, change your avatar to “Avi” in the Info tab and start exploring the different options.

**I will explain how to apply some materials to your own avatar later on please see these sections:**
- How to use Materials for your avatar in High Fidelity
- How to manipulate Blendshapes for your avatar in High Fidelity 
- How to manipulate Flow for your avatar in High Fidelity

## Materials

Click on the preset buttons to create a material entity or choose from the drop down menu to select "shadeless" or "hifi-pbr" to start with small material property adjustments (See method *updateMaterial()* in avatarCustomization101.js [avatarCustomization101.js](appResources/appData/resources/avatarCustomization101.js)).

Have fun with playing with the different options! The "Default" button will delete the material entity and you can start again.

A material entity's property format is:

```
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
            "albedoMap": PATH_TO_IMAGE + "chainmail_albedoMap.png",
            "metallicMap": PATH_TO_IMAGE + "chainmail_metallicMap.png",
            "normalMap": PATH_TO_IMAGE + "chainmail_normalMap.png",
            "occlusionMap": PATH_TO_IMAGE + "chainmail.occlusionMap.png"
        }
    })
}
```

#### Watch LIVE updates in the Create Menu while running this app
1. Look for and select the named entity "Avatar101-Material" in the Entity List.
2. In the Create Menu > Properties > Scroll down to User Data to see the properties change.

#### Material Shading Models and how they're handled for Material Entities

Currently, all shading models in material entities are "hifi-pbr". What indicates the difference between hifi-pbr and shadeless is the "unlit" property.

*hifi-pbr* is the shading model with unlit set to false. These will react to light and cast shadows. See "glass", "chainmail", and "disco" textures in [materials.js](appResources/appData/resources/modules/materials.js).

*shadeless* is the shading model that currently does not have "unlit" specified to a value. These will not react to light and therefore will ultimately show the texture map without shadows. See "red" and "texture" in [materials.js](appResources/appData/resources/modules/materials.js).

#### Material Entity Properties

Most adjustments has two channels: a value and a map. A value describes the color or intensity that is used to update the material. The map showcases an image that will be used to inform the pattern of the image. 

To see all material resource options like "emissive", "emissiveMap", "albedo", "albedoMap" and how they relate to eachother checkout [High Fidelity Documentation Globals Material](https://docs.highfidelity.com/api-reference/globals#Material).

To see al material entity properties [High Fidelity Documentation Material Entities Properties] (https://docs.highfidelity.com/api-reference/namespaces/entities#.EntityProperties-Material)


#### View preset entity in the create menu
1. Press one of the buttons 
2. Open Create Menu > Entity List Window
3. Set Search Radius to 1m
4. Select the entity in the list “Avatar101-Material”
5. In the Create Tools Window > Property Tab 
6. Material Data will have a list of the properties and the values adjusted.
7. Select “Tree” and switch to “Code” to reveal the Material Data object
8. Copy this data and follow steps in "How to use Materials" below for your avatar to adjust materials on your personal avatar

## Blendshapes Tab

To see the naming conventions for blendshapes in high fidelity please see [High Fidelity Documentation Avatar Standards Blendshapes](https://docs.highfidelity.com/create/avatars/create-avatars/avatar-standards.html#blendshapes).

This adjusts an avatar’s facial expressions to emote different emotions.

Reference [Avi's .fst file](appResources/appData/resources/avatar/avatar.fst) to see the list of blendshapes specified.

## Flow Tab

How to use Materials for your avatar
Vocabulary

*Parts* - often coined as submeshes inside an avatar I will use this word to describe different parts that make up a full avatar mesh. For example avatar hair is a mesh that make up an avatar. In this tutorial, we use the jacket as a part of the avatar that you can customize.

*Material Entities* - These are high fidelity entities that can be extracted from an existing model that describes the material data from that model to render you can learn more about the properties here - https://docs.highfidelity.com/api-reference/namespaces/entities#.EntityProperties-Material

This app manipulates and uses material entities.

Channel - each option in the adjustments section change the channel 

#### Hello World Material: How to get Materials working on your avatar manually

1. Open High Fidelity 
2. Open the Console
    1. Alt + Ctrl + J 
    2. Turn on Developer Menu: Settings > Developer Menu 
    3. Developer > Scripting > Console... 
3. Copy and paste below in the console and hit enter:

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

4. Your avatar should have an image as one of the sub meshes. Feel free to open The create menu to view the named “Hello_World_Material”.

Blendshapes

Each blendshape needs to be named to work with our system.

The key functions are 

Checkout [Facial Expressions app](https://raw.githubusercontent.com/highfidelity/hifi/3553f97776b3d3d51d9ac2c16f648ca15c165f81/scripts/developer/facialExpressions.js) for more information on blendshapes.

Flow

Flow.js is a script that applies physics to the joints in your avatar that are named specifically to be recognized by the flow script.

How to get flow working on your avatar:

Follow through the walkthrough [Add Flow](https://docs.highfidelity.com/create/avatars/create-avatars/add-flow.html#flow-threads) in the High Fidelity docs.
