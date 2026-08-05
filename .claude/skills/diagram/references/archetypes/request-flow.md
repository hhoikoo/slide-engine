# Request flow

One archetype from the diagram library. The selection table and the "when nothing fits" procedure are in `../archetypes.md`.

**For**: the path of one request through a system.

**Recipe**: left-to-right. Entry point as a stadium or notched rect on the left. Orthogonal connectors, solid for the actual path. Arrow labels bold 17.78px above the line, 2-4 words. Where the path branches, a diamond. Where it fans out, three targets plus `…`. Use a second line weight only if there are genuinely two flow classes (control vs data). Then thin grey for control, thick black for data.

**Prevents**: bidirectional-arrow soup where no path is traceable.
