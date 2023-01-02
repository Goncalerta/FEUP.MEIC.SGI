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

### [TP3 - Game of Checkers](tp3)

-   We have implemented every requested feature in the assignment.
-   We think our animations are smooth, interactive and creative, making the user experience more enjoyable.
-   Selected pieces may be unselected by clicking on them again, or by clicking on another piece in order to select it.
-   On a multicapture, the piece is selected again automatically after each capture.
-   Our XML parser was extended with the `inside` parameter on `cylinder` primitives. This is "0" by default, however if it is "1" it will draw the inside of the cylinder instead of the outside. This was used in the `room.xml` scene in order to make the lamps.
-   We now also allow the `root` parameter to be missing from `scene`, in order to make component-less scenes that only display the game and/or menus.
-   We have made an effort to avoid unnecessary changes of the shader by drawing everything that requires the `transparent` shader (text, icons) at once.
-   We include two scenes, `room.xml` and `space.xml` with many geometries, materials and textures to try to give a realistic feel to the environment. We also include `empty.xml` scene to display only the game, without any distracting components.
-   Camera transictions from TP2 are also animated, on top of the new camera transitions for the TP3 (frontal game view, player 1 POV and player 2 POV).
-   The board is an entire texture in order to make it look more realistic. There are invisible tiles for the purposes of picking.
-   Crosses, hints and text are not drawn during picking, so as to not obstruct pickable elements behind them.
-   The discard boards have two height levels with 6 pieces each, in order to make the space it occupies more efficient and to make more interesting animations. After 6 places are filled, the next piece goes on top of the first one.
-   Before starting the movie, the pieces go to the initial positions with an animation, demoting queens if necessary. This animation takes into account many complex edge cases, such as when a piece is occupying the opponent's space (it will be moved to the side) and when there are pieces on top of others in the discard board (the pieces on top jump first).
-   The collision test when there is a capture is done on each update of the moving piece's position. It's position is compared with the capturable piece, in order to see if they collide. Since they have the same height, only horizontal distance is measured. Since they are cylinders (circles in their horizontal projection) with the same radius, the distance from their centers is compared against their diameter.
-   The undo animation is also animated, however, given that the piece is discarded, there is no collision detection.
-   Scene - Animated Space Habitat Satellite
    -   This scene depicts a habitat space satellite orbiting the Earth. The moon and the sun are also visible, as well as background stars. There is an alien camping in the hidden face of the moon.
    -   The scene is an improvement over the one from TP2. The satellite is no longer the center of the scene, as now a giant floating table is orbiting the earth to bring you the ultimate interplanetary checkers game experience. 
    -   The XML file can be found in [tp3/scenes/space.xml](./scenes/space.xml).
-   Scene - Bedroom
    -   This scene depicts a bedroom with a table, two chairs, a bed, a bedside table with a lamp, a wardrobe, a ball, a door and a lamp.
    -   The scene is new in the TP3.
    -   The XML file can be found in [tp3/scenes/room.xml](./scenes/room.xml).

