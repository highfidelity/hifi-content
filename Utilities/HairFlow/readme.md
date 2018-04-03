#Flow App

##Overview
**Flow** is a script that simulates physics on avatar's hair, clothes, and body parts.

**Flow App** is an interface application for visually debugging and configuring **Flow.**

**Flow** will only animate avatars that contain **Flow Threads**.

![Flow Thread](https://hifi-content.s3.amazonaws.com/luis/flowFiles/reference/flow.png)

A **Flow Thread** is a set with as least 2 connected joints that comply with the following rules:

* The first joint is connected to an existing avatar joint (“Hips” for example).
* Every “Flow Joint” should be named **flow_[TYPE]_[INDEX]**, where **TYPE** defines a group of joints that share a common physics setup and **INDEX** is an integer. For example, if the thread is used to simulate a skirt, all the “skirt” joints should be named flow_skirt_01, flow_skirt_02, etc.

##Display Panel

![Display Panel](https://hifi-content.s3.amazonaws.com/luis/flowFiles/reference/display.png)

**avatar**: Displays/Hides the avatar mesh.

**collisions**: Activates/Deactivates collisions.

**debug**: Displays/Hides the debug shapes.

**solid**: Solid/Wireframe display for debug shapes.

##Joints Panel

![Joints Panel](https://hifi-content.s3.amazonaws.com/luis/flowFiles/reference/joints.png)

**radius**: Segments and knots thickness (collisions).

**gravity**: Y-value of the gravity vector.

**stiffness**: Amount of stiffness for every thread.

**damping**: Amount of joint oscillation.

**inertia**: Rotational inertia multiplier.

**delta**: Delta time for every integration step.

##Collisions Panel

![Collisions Panel](https://hifi-content.s3.amazonaws.com/luis/flowFiles/reference/collisions.png)

This panel manages collision spheres.

Every collision sphere is positioned using an existing avatar joint and offset.

**radius**: Collision sphere radius.

**offset**: Y-value of the offset vector along the joint.

The maximum amount of collisions is defined by the global COLLISION_SHAPES_LIMIT = 4.

##JSON Panel

![JSON Panel](https://hifi-content.s3.amazonaws.com/luis/flowFiles/reference/json.png)

This panel displays the output data structure with the final configuration for the current setup. 

This data can be copied and pasted on the **FLOW** script between the lines:
```javascript
// CUSTOM DATA STARTS HERE
 
Erase existing code and paste new code here

// CUSTOM DATA ENDS HERE
```
The modified **FLOW** script will be able to run independently loading the new configuration.

##Avatars

This is a list of avatars rigged appropriately to use with **FLOW**:

https://hifi-content.s3.amazonaws.com/jimi/avatar/Mannequin/hairTest/mannequinHairTest8.fst

