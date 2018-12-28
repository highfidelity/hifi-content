# Drumset

This blueprint item was created by the High Fidelity Experiences Team as a template to be copied and modified by our users. 

The code is heavily commented for clarity and by following this README, users will learn more about creating using the High Fidelity API. Whether a user wants to completely overhaul the drumset or just change a few things, we encourage people to create their own variations.

## The Components

![Image of Components](http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/DrumKit/Assets/Images/drum.png)
![Image of Components](http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/DrumKit/Assets/Images/cowbell.png)
![Image of Components](http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/DrumKit/Assets/Images/cymbal.png)

## About Collisions

The drumset relies on collions between entities but there are lots of criteria that affect how entities interact with each other, including whether or not they collide. If your entities are not interacting as expected, try checking their properties against this list.

### Dynamic vs Static Entities

If your entity is a static entity, it cannot collide with another static entity. Only dynamic entities can collide with static entities. 

### Collision Hulls

Models need a collision hull in order to collide. This is the shape of the bounding box around the item. An exact collison hull will give the most reliable collision interactions but also takes the highest toll on performance and cannot be used on dynamic entities. The next best hull is good with submeshes. This setting is slightly better on performance while still giving a pretty natural shape around the object where collisoins will occur. It can be used with both static and dynamic entities as well which makes it the most common option. The remaining options are just primitive shapes around the entity and may cause collisions to occur that do not align with the surface of the entity.

### Types of Collisions Allowed

The types interactions allowed can be set in the create menu. The options are static, kinematic, dynamic, my avatar, and other avatars. Both entities involved in a collision will need to be allowed to interact with the other entity type. For instance if you want a dynamic cube to interact with a static model, the cube must be set to collide with static entities and the model must be set to interact with dynamic entities.

### Collisionless

This one is obvious, but if the collisionless property of an entity is set to true, it will not collide with anything.