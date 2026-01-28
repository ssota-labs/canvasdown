# @ssota-labs/canvasdown-reactflow

## 0.5.0

### Minor Changes

- fc94068: Add NodeTypes generic type support to useCanvasdown hook for type safety.

  **Features:**

  - `useCanvasdown` hook now accepts optional `nodeTypes` parameter
  - Generic type support: `useCanvasdown<TNodeTypes>(dsl, { core, nodeTypes })`
  - Type-safe node types: returned `nodes` have `type` field constrained to `NodeTypes` keys
  - `ExtractNodeType<TNodeTypes>` utility type for extracting node type keys
  - `toReactFlowNodes` function now supports generic types
  - Demo app updated with `CANVAS_NODE_TYPES` configuration example

  **Breaking Changes:**

  None - fully backward compatible. Existing code without `nodeTypes` continues to work.

  **Example:**

  ```typescript
  const nodeTypes = {
    shape: ShapeBlock,
    markdown: MarkdownBlock,
  } as const;

  const { nodes, edges } = useCanvasdown(dsl, {
    core,
    nodeTypes, // nodes.type is now 'shape' | 'markdown'
  });
  ```

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

### Patch Changes

- Updated dependencies [cab8c44]
  - @ssota-labs/canvasdown@0.4.0

## 0.3.1

### Patch Changes

- Updated dependencies [a52f18e]
  - @ssota-labs/canvasdown@0.3.2

## 0.2.0

### Minor Changes

- b0259b1: first release

### Patch Changes

- Updated dependencies [b0259b1]
  - @ssota-labs/canvasdown@0.2.0
