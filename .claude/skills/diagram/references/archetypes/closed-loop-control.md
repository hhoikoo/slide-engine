# Closed-loop control

One archetype from the diagram library. The selection table and the "when nothing fits" procedure are in `../archetypes.md`.

**For**: feedback systems. Autoscaling, retries, reconciliation.

**Recipe**: a genuine cycle, laid out as a rectangle rather than a circle so connectors stay orthogonal. Label each edge with the signal it carries. Mark the setpoint or threshold with a dashed line in the accent hue. Pair with a small inline plot if the behaviour over time is the actual point.

**Prevents**: a ring of arrows where the loop's mechanism is invisible.
