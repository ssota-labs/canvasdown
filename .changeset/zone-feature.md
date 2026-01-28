---
'@ssota-labs/canvasdown': minor
'@ssota-labs/canvasdown-reactflow': minor
demo: patch
---

Add zone/group support for hierarchical canvas structures.

**Features:**

- Zone syntax (`@zone ... @end`) for creating nested group structures
- Independent layout directions per zone (LR, RL, TB, BT)
- Multi-pass layout algorithm for hierarchical positioning
- Automatic `parentId` assignment for zone children
- `isGroup` flag for block type registration
- `defaultExtent` option in `CanvasdownCore` to control child positioning constraints
- React Flow group node integration with automatic `parentId` and `extent` handling
