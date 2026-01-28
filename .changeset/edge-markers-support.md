---
'@ssota-labs/canvasdown': minor
'@ssota-labs/canvasdown-reactflow': minor
demo: patch
---

Add edge marker support (markerEnd, markerStart) for React Flow edges

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
