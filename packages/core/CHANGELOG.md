# @ssota-labs/canvasdown

## 0.6.1

### Patch Changes

- 123af6b: Expose @shape quoted string as data.label and data.title in graph nodes

  - **GraphBuilder**: When building graph node `data`, set `data.label` to the AST node label (the quoted string in `@shape id "..."`) and `data.title` to the body's `title` if present, otherwise to the label.
  - Ensures downstream adapters (e.g. `@ssota-labs/canvasdown-reactflow`) receive a non-empty `data.title` so block titles show the label text instead of falling back to node id (e.g. "claim_1").

  React Flow adapter: customize @update application

  - **transformUpdateNode**: Optional `ApplyPatchOptions.transformUpdateNode` and `UseCanvasdownPatchOptions.transformUpdateNode` let you control how `@update` is applied (e.g. merge into `data.properties`, or convert `content` from markdown to TipTap JSON). When set, the default merge into `node.data` is skipped for that update.
  - **Types**: Export `TransformUpdateNode` from the adapter package.

## 0.6.0

### Minor Changes

- e98506b: Support UUID and hyphenated identifiers in DSL and Patch

  - **Lexer**: Identifier accepts UUIDs (8-4-4-4-12 hex) and hyphenated IDs (e.g. `thesis-ddd`, `node-a`). Classic IDs allow hyphens only between segments so `->` (Arrow) is unchanged.
  - **Token order**: Identifier and NumberLiteral are tried before Arrow so UUIDs and hyphenated IDs parse correctly in Patch DSL (fixes "unexpected character" on `-`).
  - **Patch DSL**: Parsing and validation work with UUID and hyphenated node IDs; no parse errors for `@update`, `@connect`, `@add`, etc. when using such IDs.

## 0.5.0

### Minor Changes

- 3842052: Add edge marker support (markerEnd, markerStart) for React Flow edges

  Features:

  - Edge markers can be configured via `edgePropertySchema` in edge type definitions
  - DSL syntax: `nodeA -> nodeB { markerEnd: "arrowclosed", markerStart: "arrow" }`
  - Markers are extracted from `edgeData` and merged with edge type defaults
  - `CustomEdge` component renders SVG marker definitions (arrowclosed, arrow) automatically
  - `toReactFlowEdges` passes through `markerEnd` and `markerStart` to React Flow Edge type
  - `GraphEdge` and `ASTEdge` types include `markerEnd` and `markerStart` fields
  - `EdgeTypeDefinition` includes `edgePropertySchema` for marker enum options

  Breaking Changes:

  None - fully backward compatible. Existing edges without markers continue to work.

  Example:

  ```typescript
  // Register edge type with marker options
  core.registerEdgeType({
    name: 'default',
    defaultShape: 'default',
    defaultStyle: { stroke: '#b1b1b7', strokeWidth: 2 },
    edgePropertySchema: {
      markerEnd: {
        type: 'enum',
        enum: ['arrow', 'arrowclosed'],
        description: 'Marker at the end of the edge',
      },
    },
  });
  ```

  ```markdown
  # DSL usage

  start -> end { markerEnd: "arrowclosed" }
  a -> b { markerStart: "arrow", markerEnd: "arrowclosed" }
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

## 0.3.2

### Patch Changes

- a52f18e: Add PropertySchema support for block type registration. This allows defining property constraints (enum values, types, ranges) for validation and LLM template generation. Includes runtime validation and `getBlockTypeSchema()` API method.

## 0.2.0

### Minor Changes

- b0259b1: first release
