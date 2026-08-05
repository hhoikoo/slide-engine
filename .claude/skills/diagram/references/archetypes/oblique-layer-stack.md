# Oblique layer stack

One archetype from the diagram library. The selection table and the "when nothing fits" procedure are in `../archetypes.md`.

Commonly called isometric, and that is what to search for, but the projection is a 45 degree cavalier oblique: the reference corpus measures `|dx/dy|` at exactly 1.0000 across all 52 slabs with no foreshortening on either axis. Building it as a true isometric, with 30 degree axes and foreshortened depth, produces a visibly different and wrong result.

**For**: one machine or one site that sits on several fabrics or planes at once, where the reader has to see both *what runs on it* and *what it is wired into*. The case that layered stack cannot take: the layers are not abstraction levels, they are simultaneous memberships, and objects rest on them.

**Recipe**: draw each plane as a 45 degree oblique slab, `M{X},{Y} l{-D},{D} h{W} l{D},{-D} z`, with W:D between 4:1 and 5:1. Stack them by pure vertical translation; paint the top slab first and the bottom slab last. Fill each with its own hue at `fill-opacity` 0.16-0.21 for a full-size slab, and outline it 2px in the same hue's dark stop, which is what keeps the stack readable where the fills blend. Three slabs maximum.

Seat objects with their base line at `y_plane_top + D/2` so the slab's depth band brackets the base, and paint every object after every plane. Cubes for workloads, the flat datastore cylinder for storage; both drawn from the neutral ramp, never coloured. **Pick the pitch from the seating, not from the look**: if objects sit on different slabs, the base line must clear every slab edge by 12px or the object reads as standing on the wrong plane. `tokens.md` gives the inequality.

Right of the stack, one 7px vertical bar per plane, in the plane's mid stop, its y-extent covering the plane it serves. One 2px connector per plane leaves the slab's slanted right edge at the same `y_plane_top + D/2` and runs dead horizontal to its bar, in the dark stop. No arrowheads: an attachment is not a flow. A connector may cross a bar of another hue, never one of its own.

**Colour is the whole encoding**: one hue per fabric, held identical across the slab fill, the slab outline, the connector, the bar and the fabric's own label. Declare `<!-- categorical: N -->` past three. Every label stays horizontal; nothing follows the 45 degree axis. Full projection constants in `tokens.md`, "The oblique plane".

**Prevents**: the decorative 3D diagram, where perspective is applied to boxes that had no depth to show. If the planes are not simultaneous and objects do not rest on them, use layered stack and stay flat.
