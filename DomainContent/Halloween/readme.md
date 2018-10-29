# Halloween Domains
The content in this directory was created for the 2018 Halloween season. This folder contains code for the following projects:
* An explosion that causes a fire, smoke effect, and mannequin
* Eyes that follow where the user is when they're within a specific range
* A variety of jump-scares that are triggered with an animated model and audio effect when a user enters a specific zone
* Sound emitters with customization to create different effects 
* A flashlight spawner
* A "whisper in your ear" utility
* A ghostly statue scare

## Basic Mechanics
Much of the halloween content is triggered by a basic [zone or box `enterEntity` call](https://docs.highfidelity.com/api-reference/namespaces/entities#.enterEntity). This API call is triggered when an avatar's collision shape enters within the bounding box of an entity. 

![](https://hifi-content.s3-us-west-1.amazonaws.com/liv/Courses/Zombies/zombies_class2.png) 

The code snippet below illustrates a basic entity script that changes color when someone walks into it.  

```
(function () {
  this.enterEntity = function (entityID) {
      print("Enter entity");
      Entities.editEntity(entityID, {
          color: { red: 255, green: 64, blue: 64 },
      });
  };
  this.leaveEntity = function (entityID) {
      print("Leave entity");
      Entities.editEntity(entityID, {
          color: { red: 128, green: 128, blue: 128 },
      });
  };
});
```

In most cases, users who experience the Halloween domains are not going to have administrative or add ('rez') permissions in our domain server. Additionally, to protect the content as it exists, we also add filters to prevent unauthorized edits. To account for these security initiatives, we offload the creation and deletion of entities to the entity script server via server entity scripts. We use `callEntityServerMethod` to communicate to the entity script server when a specific trigger condition is met by a client.

