# SGI 2022/2023

## Group T04G02
| Name                            | Number    | E-Mail                   |
| ------------------------------- | --------- | ------------------------ |
| Diogo Luís Henriques Costa      | 201906731 | up201906731@edu.fe.up.pt |
| Pedro Gonçalo de Castro Correia | 201905348 | up201905348@edu.fe.up.pt |

----

## Projects

### [TP1 - Scene Graph](tp1)

-   Our implementation is compliant with the specification of the assignment, and so should be able to correctly parse and render XML files that are compliant with this specification. 
-   Our XML scene file is compliant with the specification of the assignment, without resorting to custom nodes or parameters that wouldn't be available to other parsers.
-   Our implementation is tolerant to errors in the XML scene file and unexpected nodes or parameters that aren't specified, logging a warning or error message but trying to still parse and render the rest of the scene.
-   We tried to make our implementation efficient, for example by avoiding reapplying an appearance when both the texture and the material of a component is "inherit".
-   Our parser detects cycles on the scene graph and allows the XML to have components in no particular order.

-   Scene - Space Habitat Satellite
    -   This scene depicts a habitat space satellite orbiting the Earth. The moon and the sun are also visibile, as well as background stars.
    -   The XML file can be found in [tp1/scenes/space.xml](./tp1/scenes/space.xml)

-----

### [TP2 - NURBS, Animations and Shaders](tp2)

-   Our implementation is compliant with the specification of the assignment, and so should be able to correctly parse and render XML files that are compliant with this specification. 
-   Our XML scene file is compliant with the specification of the assignment, without resorting to custom nodes or parameters that wouldn't be available to other parsers.
-   Our implementation is tolerant to errors in the XML scene file and unexpected nodes or parameters that aren't specified, logging a warning or error message but trying to still parse and render the rest of the scene.
-   We have fixed the texture coordinates of *MyCylinder*, *MyTorus* and *MyTriangle* after the feedback received in TP1.
-   We have made an effort to avoid unnecessary changes of the shader by implementing a function that checks if the shader to set is the same that is already set and only changes the shader otherwise.
-   Due to optimizations made in TP1 on setting appearances, we had to set appearance every time we change the shader in order to avoid issues. However, this is compensated by the fact that the TP1 optimizations reduce the amount of times the appearance has to change.
-   The required *NURBS* are all visible on the scene relatively close together on the hidden face of the moon, on which a spot-light is present pointing to the sleeping bag (made with a rectangle Patch).
-   Several animations are visible such as:
    - Orbit of a barrel.
    - Rotations of the Earth and the satellite.
    - Up-and-down animation of a component of the satellite.
    - Alien appearing only at the 5th second.
    - Alien waving.
    - Alien eyes increasing and shrinking in size.
    - A tentative explosion of the alien which causes the other objects to disappear for about 3 seconds, and re-appear slowly after that apart from the alien.
-   Several highlights are used: Sun, Earth, Moon, Alien head, pillow, tent.

-   Scene - Animated Space Habitat Satellite
    -   This scene depicts a habitat space satellite orbiting the Earth. The moon and the sun are also visible, as well as background stars.
    -   The scene is an improvement over the one from TP1. Now, on the hidden face of the moon, an alien sets a camp, visible using the *alienTent* or *moonView* cameras.
    -   The XML file can be found in [tp2/scenes/space.xml](./scenes/space.xml).


----

### [TP3 - ...](tp3)
- (items briefly describing main strong points)

