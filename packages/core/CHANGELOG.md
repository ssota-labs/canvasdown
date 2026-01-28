# @ssota-labs/canvasdown

## 0.4.0

### Minor Changes

- cab8c44: Add zone/group support for hierarchical canvas structures.

  **Features:**

  - Zone syntax (`@zone ... @end`) for creating nested group structures
  - Independent layout directions per zone (LR, RL, TB, BT)
  - Multi-pass layout algorithm for hierarchical positioning
  - Automatic `parentId` assignment for zone children
  - `isGroup` flag for block type registration
  - `defaultExtent` option in `CanvasdownCore` to control child positioning constraints
  - React Flow group node integration with automatic `parentId` and `extent` handling

## 0.3.2

### Patch Changes

- a52f18e: Add PropertySchema support for block type registration. This allows defining property constraints (enum values, types, ranges) for validation and LLM template generation. Includes runtime validation and `getBlockTypeSchema()` API method.

## 0.2.0

### Minor Changes

- b0259b1: first release
