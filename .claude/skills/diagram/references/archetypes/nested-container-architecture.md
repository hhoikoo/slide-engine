# Nested-container architecture

One archetype from the diagram library. The selection table and the "when nothing fits" procedure are in `../archetypes.md`.

**For**: what runs inside what. Deployment topology, process boundaries, ownership.

**Recipe**: outer dashed rect per boundary (zone, node, cluster) with an italic grey label top-left in a ~38px band. Components as `rx=6` boxes inside, inset 12-16px. Nest two or three levels deep. Sub-components sit literally inside their parent box. No arrow is needed to say "part of". Connectors only for genuine runtime relationships.

**Prevents**: the flat row of sibling boxes with "contains" arrows between them.
