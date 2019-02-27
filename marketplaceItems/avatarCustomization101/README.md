## Hello and welcome to Avatar 101!

Avatar 101 showcases customizations that creators can make to their avatars namely goes into:

Avatar materials using material entities
Blendshapes applying and manipulating them in High Fidelity
Flow using flow avatar joints 

In this app I will talk you through the code and teach you how to customize your avatar to your needs! 

The app utilizes “Avi” a customized Woody avatar that has flow on its leaves and a jacket that has a material entity attached to manipulate it’s textures.

## Steps using the App

Wearing your own avatar, change your avatar to “Avi” in the Info tab and start exploring the different options.

**I will explain how to apply some materials to your own avatar later on please see these sections:**
- How to use Materials for your avatar in High Fidelity
- How to manipulate Blendshapes for your avatar in High Fidelity 
- How to manipulate Flow for your avatar in High Fidelity

## Materials Tab

Use the preset buttons to change Avi’s jacket materials and use the additional options to update the material entity with small adjustments. 

To see all material resource options use:
https://docs.highfidelity.com/api-reference/globals#Material

To see material entity properties:
https://docs.highfidelity.com/api-reference/namespaces/entities#.EntityProperties-Material

Most adjustments has two channels: a value and a map. A value describes the color or intensity that is used to update the material. The map showcases an image that will be used to inform the pattern of the image. 

To get the preset buttons material information, you can either look at the materials.json file or view the material entity and its data in the Create Menu.

*View preset entity in the create menu:*
Press one of the buttons 
Open Create Menu > Entity List Window
Set Search Radius to 1m
Select the entity in the list “Avatar101-Material”
In the Create Tools Window > Property Tab 
Material Data will have a list of the properties and the values adjusted.
Select “Tree” and switch to “Code” to reveal the Material Data object
Copy this data and follow steps in How to use Materials for your avatar to adjust materials on your personal avatar

Blendshapes Tab

To see the naming conventions for blendshapes in high fidelity please see:
https://docs.highfidelity.com/create/avatars/create-avatars/avatar-standards.html#blendshapes

This adjusts an avatar’s facial expressions to emote different emotions. 

## Flow Tab

How to use Materials for your avatar
Vocabulary

Parts - often coined as submeshes inside an avatar I will use this word to describe different parts that make up a full avatar mesh. For example avatar hair is a mesh that make up an avatar. In this tutorial, we use the jacket as a part of the avatar that you can customize.

Material Entities - These are high fidelity entities that can be extracted from an existing model that describes the material data from that model to render you can learn more about the properties here - https://docs.highfidelity.com/api-reference/namespaces/entities#.EntityProperties-Material

This app manipulates and uses material entities.

Channel - each option in the adjustments section change the channel 

Hello World Material: How to get Materials working on your avatar manually

Open High Fidelity 
Open the Console
Alt + Ctrl + J 
Turn on Developer Menu: Settings > Developer Menu 
Developer > Scripting > Console... 
Copy and paste in the console and hit enter:

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

Most of 

How to extract a material from a mesh

Blendshapes

How to get Materials working on your avatar:

Flow

Flow.js is a script that applies physics to the joints in your avatar that are named specifically to be recognized by the flow script.

How to get flow working on your avatar:

